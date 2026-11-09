"""Synthetic-only fixtures; never rewrite the real repositories' manifests."""
import copy
import hashlib
import json
import os
import shutil
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import check_knowledge_sync as sync


def sha(data):
    return hashlib.sha256(data).hexdigest()


class SyncCheckTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.site, self.vault = self.root / 'site', self.root / 'vault'
        self.site.mkdir()
        self.vault.mkdir()
        self.note = f'{sync.REPORTS}/report.md'
        self.entry = {'blog_path': '_posts/report.md', 'vault_path': self.note,
                      'url': '/posts/report/', 'blog_sha256': sha(b'public'),
                      'vault_sha256': sha(b'note'), 'aliases': [], 'alias_sha256': {}}
        self.manifest = {'excluded_scope': 'Nonpublic documents remain excluded.',
                         'entries': [self.entry], 'assets': {'assets/source.svg': '/media/asset.svg'},
                         'asset_sha256': {'/media/asset.svg': sha(b'asset')}}
        self.write(self.site, '_posts/report.md', b'public')
        self.write(self.vault, self.note, b'note')
        self.write(self.vault, 'assets/source.svg', b'asset')
        self.write(self.site, 'media/asset.svg', b'asset')
        self.save()

    def write(self, root, relative, data):
        path = root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        return path

    def save(self):
        data = json.dumps(self.manifest, ensure_ascii=False).encode()
        self.write(self.site, sync.SITE_MANIFEST, data)
        self.write(self.vault, sync.VAULT_MANIFEST, data)

    def errors(self):
        self.save()
        return sync.check(self.site, self.vault)[1]

    def assert_error(self, text):
        self.assertTrue(any(text in e for e in self.errors()), self.errors())

    def test_valid_pair(self):
        self.assertEqual(self.errors(), [])

    def test_site_only_never_certifies_sync(self):
        result = sync.inspect(self.site)
        self.assertEqual(result['errors'], [])
        self.assertEqual(result['mode'], 'site-only')
        self.assertFalse(result['coverage_checked'])
        self.assertFalse(result['sync_complete'])

    def test_unpinned_pair_is_diagnostic(self):
        result = sync.inspect(self.site, self.vault)
        self.assertEqual(result['errors'], [])
        self.assertEqual(result['mode'], 'dual-snapshot-diagnostic')
        self.assertFalse(result['sync_complete'])

    def test_unmapped_archive_fails(self):
        self.write(self.vault, f'{sync.REPORTS}/new.md', b'new')
        self.assert_error('Archived report not dual-synced')

    def test_nested_uppercase_report_fails(self):
        self.write(self.vault, f'{sync.REPORTS}/nested/new.MD', b'new')
        self.assert_error('Archived report not dual-synced')

    def test_unrelated_notes_are_not_enrolled(self):
        self.write(self.vault, 'private.md', b'not selected')
        self.assertEqual(self.errors(), [])

    def test_source_attachment_drift(self):
        self.write(self.vault, 'assets/source.svg', b'changed')
        self.assert_error('source attachment changed')

    def test_missing_source_attachment(self):
        (self.vault / 'assets/source.svg').unlink()
        self.assert_error('Missing source attachment')

    def test_published_attachment_drift(self):
        self.write(self.site, 'media/asset.svg', b'changed')
        self.assert_error('published attachment changed')

    def test_note_drift(self):
        self.write(self.vault, self.note, b'changed')
        self.assert_error('Obsidian note changed')

    def test_site_drift(self):
        self.write(self.site, '_posts/report.md', b'changed')
        self.assert_error('public source changed')

    def test_alias_without_hash(self):
        self.entry['aliases'] = ['alias.md']
        self.assert_error('aliases and alias hashes differ')

    def test_hash_without_alias(self):
        self.entry['alias_sha256'] = {'alias.md': sha(b'alias')}
        self.assert_error('aliases and alias hashes differ')

    def test_alias_drift(self):
        self.entry['aliases'] = ['alias.md']
        self.entry['alias_sha256'] = {'alias.md': sha(b'alias')}
        self.write(self.vault, 'alias.md', b'changed')
        self.assert_error('Obsidian alias changed')

    def test_alias_ownership_collision(self):
        self.entry['aliases'] = [self.note]
        self.entry['alias_sha256'] = {self.note: sha(b'note')}
        self.assert_error('Duplicate note ownership')

    def test_duplicate_alias(self):
        self.entry['aliases'] = ['alias.md', 'alias.md']
        self.entry['alias_sha256'] = {'alias.md': sha(b'alias')}
        self.assert_error('Duplicate note ownership')

    def test_duplicate_mapping(self):
        self.manifest['entries'].append(copy.deepcopy(self.entry))
        errors = self.errors()
        for token in ('Duplicate note ownership', 'Duplicate public article', 'Duplicate canonical URL'):
            self.assertTrue(any(token in e for e in errors))

    def test_encoded_url_collision(self):
        entry = copy.deepcopy(self.entry)
        entry['url'] = '/posts/%72eport/'
        self.manifest['entries'].append(entry)
        self.assert_error('Duplicate canonical URL')

    def test_invalid_urls(self):
        for value in ('https://example.com/x', '//example.com/x', '/x/../y', '/x/%2e%2e/y', '/x?a=1', '/x#frag', '/x\\y', '/x/%2f/y', '/%00', '/%0a', '/%7f', '/%', '/%GG', '/%ff'):
            with self.subTest(value=value):
                self.entry['url'] = value
                self.assert_error('Invalid canonical URL')

    def test_empty_query_delimiter_is_rejected(self):
        self.entry['url'] = '/posts/report/?'
        self.assert_error('Invalid canonical URL')

    def test_empty_fragment_delimiter_is_rejected(self):
        self.entry['url'] = '/posts/report/#'
        self.assert_error('Invalid canonical URL')

    def test_out_of_scope_alias(self):
        alias = '团队规范/private.md'
        self.entry['aliases'] = [alias]
        self.entry['alias_sha256'] = {alias: sha(b'x')}
        self.assert_error('Outside authorized publishing scope')

    def test_out_of_scope_attachment(self):
        self.manifest['assets'] = {'prompts/private.svg': '/media/asset.svg'}
        self.assert_error('Outside authorized publishing scope')

    def test_path_validation(self):
        for value in ('../x', '/tmp/x', 'a//b', 'a/./b', 'a\\b', 'a\x00b', ''):
            with self.subTest(value=value), self.assertRaises(ValueError):
                sync.safe_path(self.vault, value)

    def test_attachment_url_validation(self):
        for value in ('https://example.com/x', '//example.com/x', '/../x', '/a/%2e%2e/x', '/a?x', '/a#x'):
            with self.subTest(value=value), self.assertRaises(ValueError):
                sync.safe_path(self.site, value, public=True)

    def test_symlink_escape(self):
        (self.vault / 'outside').symlink_to(self.root)
        with self.assertRaises(ValueError):
            sync.safe_path(self.vault, 'outside/file.md')

    def test_internal_symlink_is_rejected(self):
        (self.vault / 'alias').symlink_to(self.vault / 'assets')
        with self.assertRaises(ValueError):
            sync.safe_path(self.vault, 'alias/source.svg')

    def test_report_directory_symlink(self):
        (self.vault / sync.REPORTS / 'linked').symlink_to(self.root)
        self.assert_error('Symlink in report directory')

    def test_manifest_symlink(self):
        source = self.site / sync.SITE_MANIFEST
        data = source.read_bytes()
        source.unlink()
        (self.root / 'external.json').write_bytes(data)
        source.symlink_to(self.root / 'external.json')
        self.assertTrue(any('symlinks' in e for e in sync.check(self.site, self.vault)[1]))

    def test_missing_report_directory(self):
        (self.vault / self.note).unlink()
        (self.vault / sync.REPORTS).rmdir()
        self.assert_error('Missing declared report directory')

    def test_inaccessible_report_directory_does_not_silently_pass(self):
        def denied(*args, **kwargs):
            kwargs['onerror'](PermissionError('denied'))
            return iter(())
        with patch.object(sync.os, 'walk', side_effect=denied):
            self.assert_error('Cannot inspect report directory')

    def test_schema_errors_are_fail_closed(self):
        baseline = copy.deepcopy(self.manifest)
        for key, value in [('entries', None), ('entries', [None]), ('assets', []), ('asset_sha256', None), ('excluded_scope', 7)]:
            with self.subTest(key=key, value=value):
                self.manifest = copy.deepcopy(baseline)
                self.manifest[key] = value
                self.assertTrue(self.errors())

    def test_entry_schema_errors_are_fail_closed(self):
        baseline = copy.deepcopy(self.entry)
        for key, value in [('blog_path', None), ('vault_path', []), ('url', 1), ('blog_sha256', 'bad'), ('aliases', {}), ('aliases', [None]), ('alias_sha256', []), ('alias_sha256', {'alias.md': None})]:
            with self.subTest(key=key, value=value):
                self.manifest['entries'] = [dict(baseline, **{key: value})]
                self.assertTrue(self.errors())

    def test_invalid_json_and_duplicate_keys(self):
        for data in (b'{', b'[]', b'{"entries": [], "entries": []}'):
            self.write(self.site, sync.SITE_MANIFEST, data)
            self.assertTrue(sync.check(self.site, self.vault)[1])

    def test_nonstandard_json_constants_rejected_in_site_manifest(self):
        for constant in ('NaN', 'Infinity', '-Infinity'):
            with self.subTest(constant=constant):
                self.save()
                data = json.dumps(dict(self.manifest, extra='placeholder'))
                data = data.replace('"placeholder"', constant)
                self.write(self.site, sync.SITE_MANIFEST, data.encode())
                errors = sync.check(self.site, self.vault)[1]
                self.assertTrue(any('nonstandard JSON numeric constants' in e for e in errors))

    def test_nonstandard_json_constants_rejected_in_vault_manifest(self):
        for constant in ('NaN', 'Infinity', '-Infinity'):
            with self.subTest(constant=constant):
                self.save()
                data = json.dumps(dict(self.manifest, extra='placeholder'))
                data = data.replace('"placeholder"', constant)
                self.write(self.vault, sync.VAULT_MANIFEST, data.encode())
                errors = sync.check(self.site, self.vault)[1]
                self.assertTrue(any('nonstandard JSON numeric constants' in e for e in errors))

    def test_missing_manifest(self):
        (self.site / sync.SITE_MANIFEST).unlink()
        self.assertTrue(sync.check(self.site, self.vault)[1])

    def test_manifest_mismatch(self):
        other = dict(self.manifest, version=100)
        self.write(self.vault, sync.VAULT_MANIFEST, json.dumps(other).encode())
        self.assertIn('The blog and Obsidian sync manifests differ.', sync.check(self.site, self.vault)[1])

    def test_unreferenced_attachment_hash(self):
        self.manifest['asset_sha256']['/media/orphan.svg'] = sha(b'orphan')
        self.assert_error('attachments and attachment hashes differ')

    def test_missing_attachment_hash(self):
        self.manifest['asset_sha256'] = {}
        self.assert_error('attachments and attachment hashes differ')

    def test_same_asset_can_have_multiple_identical_sources(self):
        self.write(self.vault, 'assets/other.svg', b'asset')
        self.manifest['assets']['assets/other.svg'] = '/media/asset.svg'
        self.assertEqual(self.errors(), [])

    def test_require_complete_needs_both_versions(self):
        result = sync.inspect(self.site, self.vault, require_complete=True)
        self.assertFalse(result['sync_complete'])
        self.assertEqual(len(result['errors']), 2)

    def test_require_complete_needs_vault(self):
        result = sync.inspect(self.site, require_complete=True)
        self.assertFalse(result['sync_complete'])
        self.assertTrue(any('explicit checkout' in e for e in result['errors']))

    def test_no_writes(self):
        before = {str(p): p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        sync.inspect(self.site, self.vault)
        after = {str(p): p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        self.assertEqual(before, after)

    def git(self, root, *args):
        return subprocess.check_output(['git', '-C', str(root), *args], stderr=subprocess.PIPE)

    def commit(self, root):
        self.git(root, 'add', '--all')
        self.git(root, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'Synthetic test fixture')
        return self.git(root, 'rev-parse', 'HEAD').decode().strip()

    def init_pair(self):
        for root in (self.site, self.vault):
            self.git(root, 'init', '-q')
        return self.commit(self.site), self.commit(self.vault)

    def test_same_checkout_cannot_claim_dual_sync(self):
        shutil.copytree(self.vault, self.site, dirs_exist_ok=True)
        self.git(self.site, 'init', '-q')
        commit = self.commit(self.site)
        result = sync.inspect(self.site, self.site, commit, commit, True)
        self.assertFalse(result['sync_complete'])
        self.assertIn('Site and vault must be distinct checkout roots.', result['errors'])

    def test_checkout_alias_cannot_claim_dual_sync(self):
        shutil.copytree(self.vault, self.site, dirs_exist_ok=True)
        self.git(self.site, 'init', '-q')
        commit = self.commit(self.site)
        alias = self.root / 'site-alias'
        alias.symlink_to(self.site, target_is_directory=True)
        result = sync.inspect(self.site, alias, commit, commit, True)
        self.assertFalse(result['sync_complete'])
        self.assertIn('Site and vault must be distinct checkout roots.', result['errors'])

    def test_pinned_clean_pair_passes(self):
        site_sha, vault_sha = self.init_pair()
        result = sync.inspect(self.site, self.vault, site_sha, vault_sha, True)
        self.assertEqual(result['errors'], [])
        self.assertTrue(result['sync_complete'])
        self.assertEqual(result['versions']['site']['actual_commit'], site_sha)

    def test_pinned_mismatch_fails(self):
        site_sha, vault_sha = self.init_pair()
        result = sync.inspect(self.site, self.vault, '0' * 40, vault_sha, True)
        self.assertFalse(result['sync_complete'])
        self.assertTrue(any('HEAD does not match' in e for e in result['errors']))

    def test_pinned_short_or_symbolic_versions_fail(self):
        site_sha, vault_sha = self.init_pair()
        for value in ('HEAD', site_sha[:7], '--help'):
            result = sync.inspect(self.site, self.vault, value, vault_sha, True)
            self.assertFalse(result['sync_complete'])
            self.assertTrue(any('full lowercase commit ID' in e for e in result['errors']))

    def test_dirty_checkout_fails_even_for_unrelated_file(self):
        site_sha, vault_sha = self.init_pair()
        self.write(self.site, 'extra.txt', b'extra')
        result = sync.inspect(self.site, self.vault, site_sha, vault_sha, True)
        self.assertTrue(any('modified or untracked' in e for e in result['errors']))

    def test_assume_unchanged_cannot_hide_drift(self):
        self.write(self.site, 'extra.txt', b'original')
        site_sha, vault_sha = self.init_pair()
        self.git(self.site, 'update-index', '--assume-unchanged', 'extra.txt')
        self.write(self.site, 'extra.txt', b'hidden mutation')
        result = sync.inspect(self.site, self.vault, site_sha, vault_sha, True)
        self.assertTrue(any('tracked bytes differ' in e for e in result['errors']))

    def test_ignored_untracked_sync_input_fails(self):
        self.write(self.site, '.gitignore', b'_posts/report.md\n')
        site_sha, vault_sha = self.init_pair()
        result = sync.inspect(self.site, self.vault, site_sha, vault_sha, True)
        self.assertFalse(result['sync_complete'])
        self.assertTrue(any('synchronization input is not tracked' in e for e in result['errors']))

    def test_ignored_unmapped_report_fails(self):
        self.write(self.vault, '.gitignore', b'new.md\n')
        site_sha, vault_sha = self.init_pair()
        self.write(self.vault, f'{sync.REPORTS}/new.md', b'new')
        result = sync.inspect(self.site, self.vault, site_sha, vault_sha, True)
        self.assertFalse(result['sync_complete'])
        self.assertTrue(any('Archived report not dual-synced' in e for e in result['errors']))

    def test_ignored_unrelated_build_output_is_allowed(self):
        self.write(self.site, '.gitignore', b'_site/\n')
        site_sha, vault_sha = self.init_pair()
        self.write(self.site, '_site/index.html', b'build output')
        result = sync.inspect(self.site, self.vault, site_sha, vault_sha, True)
        self.assertEqual(result['errors'], [])
        self.assertTrue(result['sync_complete'])

    def test_skip_worktree_cannot_hide_drift(self):
        self.write(self.site, 'extra.txt', b'original')
        site_sha, vault_sha = self.init_pair()
        self.git(self.site, 'update-index', '--skip-worktree', 'extra.txt')
        self.write(self.site, 'extra.txt', b'hidden mutation')
        result = sync.inspect(self.site, self.vault, site_sha, vault_sha, True)
        self.assertTrue(any('tracked bytes differ' in e for e in result['errors']))

    def test_non_git_snapshot_does_not_claim_pinned(self):
        result = sync.inspect(self.site, self.vault, 'a' * 40, 'b' * 40, True)
        self.assertFalse(result['sync_complete'])
        self.assertFalse(result['versions']['site']['verified'])

    def test_nested_directory_not_accepted_as_checkout_root(self):
        self.git(self.root, 'init', '-q')
        parent_sha = self.commit(self.root)
        result, _, errors = sync.verify_revision(self.site, parent_sha, 'site')
        self.assertFalse(result['verified'])
        self.assertTrue(any('checkout root' in e for e in errors))

    def test_pin_rechecked_after_content_inspection(self):
        site_sha, vault_sha = self.init_pair()
        check = sync.check
        def racing_check(*args):
            result = check(*args)
            self.write(self.site, 'concurrent.txt', b'new')
            return result
        with patch.object(sync, 'check', side_effect=racing_check):
            result = sync.inspect(self.site, self.vault, site_sha, vault_sha, True)
        self.assertFalse(result['sync_complete'])
        self.assertFalse(result['versions']['site']['verified'])


if __name__ == '__main__':
    unittest.main()
