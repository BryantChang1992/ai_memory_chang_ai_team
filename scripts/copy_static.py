"""Publish legacy pages and their assets, without operational Markdown files."""
from pathlib import Path
import html
import json
import os
import posixpath
import re
import shutil
import sys
from urllib.parse import unquote, urlsplit

root = Path(__file__).resolve().parents[1]
destination = Path(sys.argv[1]).resolve()
canonical_pages = json.loads((root / '_data/legacy_articles.json').read_text(encoding='utf-8'))


def relative_link(source, url):
    parsed = urlsplit(url)
    path = os.path.relpath(root / parsed.path.lstrip('/'), source.parent)
    return path + ('/' if parsed.path.endswith('/') else '') + ('#' + parsed.fragment if parsed.fragment else '')


def organize_legacy_html(source):
    text = source.read_text(encoding='utf-8')
    links = [('/', '首页'), ('/library/', '专题'), ('/weekly/', '周报'), ('/about/', '关于')]
    navigation = '<nav class="global-nav" aria-label="主导航">'
    navigation += f'<a class="brand" href="{relative_link(source, "/")}">BryantChang</a><div class="nav-links">'
    navigation += ''.join(f'<a class="nav-link" href="{relative_link(source, url)}">{label}</a>' for url, label in links)
    navigation += '</div></nav>'
    text = re.sub(r'<nav class="global-nav">.*?</nav>', lambda _: navigation, text, flags=re.S)

    def canonical_link(match):
        parsed = urlsplit(html.unescape(match[1]))
        # Existing fragment links retain their original anchor definitions.
        if parsed.scheme or parsed.netloc or parsed.fragment or not parsed.path or parsed.path.startswith('/'):
            return match[0]
        path = posixpath.normpath((source.parent.relative_to(root) / unquote(parsed.path)).as_posix())
        if path not in canonical_pages:
            return match[0]
        return 'href="' + html.escape(relative_link(source, canonical_pages[path]), quote=True) + '"'

    text = re.sub(r'href="([^"]+)"', canonical_link, text)
    canonical = canonical_pages.get(source.relative_to(root).as_posix())
    if canonical:
        target = destination / urlsplit(canonical).path.lstrip('/') / 'index.html'
        if target.is_file():
            tag = re.search(r'<link rel="canonical"[^>]+>', target.read_text(encoding='utf-8'))
            if tag:
                text = re.sub(r'<link rel="canonical"[^>]*>', '', text)
                text = text.replace('</head>', tag[0] + '\n</head>', 1)
    return text

public_extensions = {'.html', '.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.woff', '.woff2'}
count = 0
for directory in ('tech_research', 'tech_designs', 'blog'):
    for source in (root / directory).rglob('*'):
        if source.is_file() and source.suffix.lower() in public_extensions:
            target = destination / source.relative_to(root)
            target.parent.mkdir(parents=True, exist_ok=True)
            if source.suffix.lower() == '.html':
                target.write_text(organize_legacy_html(source), encoding='utf-8')
            else:
                shutil.copy2(source, target)
            count += 1
print(f'Copied {count} legacy pages and assets.')
