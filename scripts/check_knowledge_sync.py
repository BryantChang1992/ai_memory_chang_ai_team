"""Check both repositories against their reviewed synchronization manifest.

Usage: python3 scripts/check_knowledge_sync.py [--vault /path/to/ai_wikis]
No arguments checks the public repository; --vault also detects local drift.
This check never overwrites either side and never publishes content.
"""
import argparse
import hashlib
import json
from pathlib import Path


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def check(root, vault=None):
    manifest = json.loads((root / 'docs/obsidian-sync-manifest.json').read_text())
    errors = []
    paths, urls = set(), set()
    for entry in manifest['entries']:
        relative = entry['blog_path']
        if relative in paths:
            errors.append(f'Duplicate public article: {relative}')
        paths.add(relative)
        if entry['url'] in urls:
            errors.append(f'Duplicate canonical URL: {entry["url"]}')
        urls.add(entry['url'])
        if any(part in entry['vault_path'].split('/') for part in ['团队规范', 'agent核心文件', 'prompts']):
            errors.append(f'Outside authorized publishing scope: {entry["vault_path"]}')
        public = root / relative
        if not public.is_file():
            errors.append(f'Missing public source: {relative}')
        elif digest(public) != entry['blog_sha256']:
            errors.append(f'Blog changed; reconcile counterpart before refreshing manifest: {relative}')
        if vault:
            local = vault / entry['vault_path']
            if not local.is_file():
                errors.append(f'Missing Obsidian note: {entry["vault_path"]}')
            elif digest(local) != entry['vault_sha256']:
                errors.append(f'Obsidian changed; reconcile counterpart: {entry["vault_path"]}')
            for alias, expected in entry.get('alias_sha256', {}).items():
                local_alias = vault / alias
                if not local_alias.is_file() or digest(local_alias) != expected:
                    errors.append(f'Obsidian alias changed; reconcile counterpart: {alias}')
    for asset in manifest['assets'].values():
        if not (root / asset.lstrip('/')).is_file():
            errors.append(f'Missing published attachment: {asset}')
        elif digest(root / asset.lstrip('/')) != manifest['asset_sha256'][asset]:
            errors.append(f'Attachment changed; reconcile counterpart: {asset}')
    if vault:
        mirror = vault / '知识库/.blog-sync-manifest.json'
        if not mirror.is_file() or json.loads(mirror.read_text()) != manifest:
            errors.append('The blog and Obsidian sync manifests differ.')
    return manifest, errors


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--vault', type=Path)
    args = parser.parse_args()
    manifest, errors = check(Path(__file__).resolve().parents[1], args.vault)
    if errors:
        print('\n'.join(errors))
        raise SystemExit(1)
    print(f'Checked {len(manifest["entries"])} article mappings and {len(manifest["assets"])} attachments; no drift.')
