"""Read-only synchronization checks; never repair hashes, sync, or publish.

The default checks existing site mappings only. --vault also checks both sides
and coverage of the declared report directory. --require-complete additionally
requires two byte-verified Git checkouts at explicitly pinned commits, with
no modified tracked files or non-ignored untracked files.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
from urllib.parse import unquote, urlsplit

sys.dont_write_bytecode = True
from public_sync_scope import validate_public_scope

SITE_MANIFEST = 'docs/obsidian-sync-manifest.json'
VAULT_MANIFEST = '知识库/.blog-sync-manifest.json'
REPORTS = '技术文章/博客同步'
EXCLUDED_PARTS = {'团队规范', 'agent核心文件', 'prompts'}
SHA256 = re.compile(r'^[0-9a-f]{64}$')
COMMIT = re.compile(r'^(?:[0-9a-f]{40}|[0-9a-f]{64})$')


def safe_path(root, value, public=False):
    """Reject non-canonical paths and every symlink before opening any content."""
    if not isinstance(value, str) or not value or '\\' in value or any(ord(c) < 32 or ord(c) == 127 for c in value):
        raise ValueError('invalid repository path')
    if public:
        if not value.startswith('/') or value.startswith('//'):
            raise ValueError('attachment must be a local absolute URL path')
        value = value[1:]
        if unquote(value) != value or '?' in value or '#' in value:
            raise ValueError('attachment URL must not be encoded or have query/fragment')
    if any(p in ('', '.', '..') for p in value.split('/')) or value.startswith('/'):
        raise ValueError('path must be normalized and repository-relative')
    root = root.resolve()
    current = root
    for part in value.split('/'):
        current = current / part
        if current.is_symlink():
            raise ValueError('symlinks are not accepted for synchronization inputs')
    if not current.resolve().is_relative_to(root):
        raise ValueError('path leaves repository')
    return current


def canonical_url(value):
    if not isinstance(value, str) or not value.startswith('/') or value.startswith('//'):
        return False
    if any(ord(c) < 32 or ord(c) == 127 for c in value) or '\\' in value:
        return False
    # urlsplit discards empty query/fragment delimiters; reject them before parsing.
    if '?' in value or '#' in value:
        return False
    if re.search(r'%(?![0-9a-fA-F]{2})', value):
        return False
    parsed = urlsplit(value)
    try:
        decoded = unquote(parsed.path, errors='strict')
    except UnicodeDecodeError:
        return False
    if any(ord(c) < 32 or ord(c) == 127 for c in decoded):
        return False
    return not (parsed.scheme or parsed.netloc or parsed.query or parsed.fragment or
                '\\' in decoded or '//' in decoded or
                any(p in ('.', '..') for p in decoded.split('/')))


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def reject_duplicate_keys(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('duplicate JSON object key')
        result[key] = value
    return result


def reject_nonstandard_constant(value):
    raise ValueError('nonstandard JSON numeric constants are not permitted')


def read_manifest(root, relative):
    path = safe_path(root, relative)
    if not path.is_file():
        raise ValueError('missing manifest')
    value = json.loads(path.read_text(encoding='utf-8'),
                       object_pairs_hook=reject_duplicate_keys,
                       parse_constant=reject_nonstandard_constant)
    if not isinstance(value, dict):
        raise ValueError('manifest must be an object')
    return value


def validate_schema(manifest):
    """Validate the fields consumed here, preserving historical metadata intact."""
    errors = validate_public_scope(manifest)
    entries, assets, hashes = (manifest.get(k) for k in ('entries', 'assets', 'asset_sha256'))
    if not isinstance(entries, list):
        errors.append('Manifest entries must be a list.')
    else:
        for index, entry in enumerate(entries):
            if not isinstance(entry, dict):
                errors.append(f'Entry {index} must be an object.')
                continue
            for key in ('blog_path', 'vault_path', 'url'):
                if not isinstance(entry.get(key), str) or not entry[key]:
                    errors.append(f'Entry {index}: {key} must be a nonempty string.')
            for key in ('blog_sha256', 'vault_sha256'):
                if not isinstance(entry.get(key), str) or not SHA256.fullmatch(entry[key]):
                    errors.append(f'Entry {index}: {key} must be a SHA256 digest.')
            aliases, alias_hashes = entry.get('aliases', []), entry.get('alias_sha256', {})
            if not isinstance(aliases, list) or any(not isinstance(v, str) or not v for v in aliases):
                errors.append(f'Entry {index}: aliases must be a list of paths.')
            if not isinstance(alias_hashes, dict) or any(not isinstance(v, str) or not SHA256.fullmatch(v) for v in alias_hashes.values()):
                errors.append(f'Entry {index}: alias_sha256 must contain SHA256 digests.')
    if not isinstance(assets, dict) or any(not isinstance(v, str) or not v for v in assets.values()):
        errors.append('Manifest assets must map source paths to target paths.')
    if not isinstance(hashes, dict) or any(not isinstance(v, str) or not SHA256.fullmatch(v) for v in hashes.values()):
        errors.append('Manifest asset_sha256 must contain SHA256 digests.')
    return errors


def raise_walk_error(error):
    raise error


def check(root, vault=None):
    """Compatibility API: return (manifest, errors), with no filesystem writes."""
    root = Path(root).resolve()
    vault = Path(vault).resolve() if vault is not None else None
    try:
        manifest = read_manifest(root, SITE_MANIFEST)
    except (OSError, ValueError, RuntimeError) as exc:
        return {}, [f'Cannot read site manifest: {exc}']
    errors = validate_schema(manifest)
    if errors:
        return manifest, errors
    paths, urls, owners = set(), set(), set()

    def check_file(base, relative, expected, label, public=False):
        try:
            path = safe_path(base, relative, public=public)
            if not path.is_file():
                errors.append(f'Missing {label}: {relative}')
            elif digest(path) != expected:
                errors.append(f'{label} changed; reconcile counterpart: {relative}')
        except (OSError, ValueError, RuntimeError) as exc:
            errors.append(f'Invalid {label} ({relative}): {exc}')

    for index, entry in enumerate(manifest['entries']):
        relative, url = entry['blog_path'], entry['url']
        if relative in paths:
            errors.append(f'Duplicate public article: {relative}')
        paths.add(relative)
        if not canonical_url(url):
            errors.append(f'Invalid canonical URL: {url}')
        normalized_url = unquote(url)
        if normalized_url in urls:
            errors.append(f'Duplicate canonical URL: {url}')
        urls.add(normalized_url)
        aliases, alias_hashes = entry.get('aliases', []), entry.get('alias_sha256', {})
        if set(aliases) != set(alias_hashes):
            errors.append(f'Entry {index}: aliases and alias hashes differ.')
        for note in [entry['vault_path'], *aliases]:
            if note in owners:
                errors.append(f'Duplicate note ownership: {note}')
            owners.add(note)
        for note in {entry['vault_path'], *aliases, *alias_hashes}:
            if EXCLUDED_PARTS.intersection(note.split('/')):
                errors.append(f'Outside authorized publishing scope: {note}')
            try:
                safe_path(vault or root, note)
            except (OSError, ValueError, RuntimeError) as exc:
                errors.append(f'Invalid note path ({note}): {exc}')
        check_file(root, relative, entry['blog_sha256'], 'public source')
        if vault is not None:
            check_file(vault, entry['vault_path'], entry['vault_sha256'], 'Obsidian note')
            for alias, expected in alias_hashes.items():
                check_file(vault, alias, expected, 'Obsidian alias')
    if set(manifest['assets'].values()) != set(manifest['asset_sha256']):
        errors.append('Published attachments and attachment hashes differ.')
    # Several source aliases may legitimately share one identical public asset.
    for source, target in manifest['assets'].items():
        expected = manifest['asset_sha256'].get(target)
        if EXCLUDED_PARTS.intersection(source.split('/')):
            errors.append(f'Outside authorized publishing scope: {source}')
        try:
            safe_path(vault or root, source)
        except (OSError, ValueError, RuntimeError) as exc:
            errors.append(f'Invalid source attachment ({source}): {exc}')
        check_file(root, target, expected, 'published attachment', public=True)
        if vault is not None:
            check_file(vault, source, expected, 'source attachment')
    if vault is not None:
        try:
            if read_manifest(vault, VAULT_MANIFEST) != manifest:
                errors.append('The blog and Obsidian sync manifests differ.')
        except (OSError, ValueError, RuntimeError) as exc:
            errors.append(f'Cannot read vault manifest: {exc}')
        try:
            reports = safe_path(vault, REPORTS)
            if not reports.is_dir():
                errors.append(f'Missing declared report directory: {REPORTS}')
            else:
                # Inspect only this declared namespace; never enroll other notes.
                for directory, dirs, files in os.walk(reports, followlinks=False, onerror=raise_walk_error):
                    for name in dirs + files:
                        path = Path(directory) / name
                        relative = path.relative_to(vault).as_posix()
                        if path.is_symlink():
                            errors.append(f'Symlink in report directory: {relative}')
                        elif path.suffix.lower() == '.md' and path.is_file() and relative not in owners:
                            errors.append(f'Archived report not dual-synced: {relative}')
        except (OSError, ValueError, RuntimeError) as exc:
            errors.append(f'Cannot inspect report directory: {exc}')
    return manifest, sorted(set(errors))


def git(root, *args):
    env = os.environ.copy()
    env['GIT_NO_REPLACE_OBJECTS'] = '1'
    process = subprocess.run(['git', '--no-optional-locks', '-c', 'core.fsmonitor=false',
                              '-C', str(root), *args], stdout=subprocess.PIPE,
                             stderr=subprocess.PIPE, timeout=60, check=False, env=env)
    if process.returncode:
        raise ValueError('Git metadata unavailable or command failed')
    return process.stdout


def verify_revision(root, expected, label):
    """Verify HEAD and actual bytes, including assume-unchanged tracked files."""
    result = {'expected_commit': expected, 'actual_commit': None, 'verified': False}
    tracked, errors = set(), []
    if not isinstance(expected, str) or not COMMIT.fullmatch(expected):
        return result, tracked, [f'{label}: require a full lowercase commit ID.']
    root = Path(root).resolve()
    try:
        top = Path(os.fsdecode(git(root, 'rev-parse', '--show-toplevel')).strip()).resolve()
        if top != root:
            raise ValueError('input must be the Git checkout root')
        actual = git(root, 'rev-parse', '--verify', 'HEAD^{commit}').decode().strip()
        result['actual_commit'] = actual
        if actual != expected:
            raise ValueError('HEAD does not match the requested commit')
        if git(root, 'status', '--porcelain=v1', '--untracked-files=all'):
            raise ValueError('checkout has modified or untracked files')
        tree = git(root, 'ls-tree', '-rz', '--full-tree', expected)
        algorithm = 'sha1' if len(expected) == 40 else 'sha256'
        for item in tree.split(b'\0'):
            if not item:
                continue
            metadata, raw_path = item.split(b'\t', 1)
            mode, kind, oid = metadata.decode().split()
            relative = os.fsdecode(raw_path)
            tracked.add(relative)
            if kind != 'blob' or mode not in ('100644', '100755', '120000'):
                raise ValueError('submodules or unsupported tracked file types require separate verification')
            if mode == '120000':
                parent = str(Path(relative).parent)
                location = (safe_path(root, parent) if parent != '.' else root) / Path(relative).name
                if not location.is_symlink():
                    raise ValueError(f'tracked symlink changed: {relative}')
                data = os.fsencode(os.readlink(location))
            else:
                location = safe_path(root, relative)
                if not location.is_file():
                    raise ValueError(f'tracked file missing: {relative}')
                if bool(location.stat().st_mode & stat.S_IXUSR) != (mode == '100755'):
                    raise ValueError(f'tracked file mode changed: {relative}')
                data = location.read_bytes()
            observed = hashlib.new(algorithm, b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
            if observed != oid:
                raise ValueError(f'tracked bytes differ from pinned commit: {relative}')
        result['verified'] = True
    except (OSError, ValueError, RuntimeError, subprocess.TimeoutExpired) as exc:
        errors.append(f'{label}: {exc}')
    return result, tracked, errors


def required_inputs(manifest, side):
    if not manifest or validate_schema(manifest):
        return set()
    if side == 'site':
        return {SITE_MANIFEST, *(e['blog_path'] for e in manifest['entries']),
                *(v.lstrip('/') for v in manifest['assets'].values())}
    return {VAULT_MANIFEST, *(e['vault_path'] for e in manifest['entries']),
            *(a for e in manifest['entries'] for a in e.get('aliases', [])),
            *manifest['assets']}


def inspect(root, vault=None, site_commit=None, vault_commit=None, require_complete=False):
    """Separate diagnostic success from a verified, complete two-repository gate."""
    pins_requested = require_complete or site_commit is not None or vault_commit is not None
    versions, trees, errors = {}, {}, []
    if vault is not None and Path(root).resolve() == Path(vault).resolve():
        errors.append('Site and vault must be distinct checkout roots.')
    if pins_requested:
        for label, path, expected in [('site', root, site_commit), ('vault', vault, vault_commit)]:
            if path is None:
                errors.append(f'{label}: explicit checkout required for pinned verification.')
                continue
            versions[label], trees[label], issues = verify_revision(path, expected, label)
            errors.extend(issues)
    manifest, content_errors = check(root, vault)
    errors.extend(content_errors)
    if pins_requested:
        for label, path, expected in [('site', root, site_commit), ('vault', vault, vault_commit)]:
            if path is None or label not in versions or not versions[label]['verified']:
                continue
            for relative in sorted(required_inputs(manifest, label) - trees[label]):
                errors.append(f'{label}: synchronization input is not tracked: {relative}')
            after, _, issues = verify_revision(path, expected, label)
            errors.extend(issues)
            versions[label]['verified'] = after['verified']
    pinned = len(versions) == 2 and all(v['verified'] for v in versions.values())
    mode = 'pinned-dual-repository' if pins_requested else ('dual-snapshot-diagnostic' if vault is not None else 'site-only')
    return {'mode': mode, 'versions': versions,
            'mapped_articles': len(manifest.get('entries', [])) if isinstance(manifest.get('entries'), list) else 0,
            'published_attachments': len(manifest.get('assets', {})) if isinstance(manifest.get('assets'), dict) else 0,
            'coverage_checked': vault is not None,
            'sync_complete': bool(pinned and vault is not None and not errors),
            'errors': sorted(set(errors))}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--vault', type=Path)
    parser.add_argument('--site-commit')
    parser.add_argument('--vault-commit')
    parser.add_argument('--require-complete', action='store_true')
    parser.add_argument('--json', action='store_true')
    args = parser.parse_args(argv)
    result = inspect(args.site, args.vault, args.site_commit, args.vault_commit, args.require_complete)
    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(f"Mode: {result['mode']}; checked {result['mapped_articles']} article mappings and {result['published_attachments']} attachments.")
        if result['errors']:
            print('\n'.join(result['errors']))
        elif result['sync_complete']:
            print('Both pinned checkouts match; declared report coverage is complete.')
        else:
            print('No detected drift within checked scope. Full synchronization is NOT certified.')
    return int(bool(result['errors']))


if __name__ == '__main__':
    raise SystemExit(main())
