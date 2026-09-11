"""Check the actual Pages artifact: internal URLs, fragments and required pages.

No network requests or third-party Python packages are needed.
Usage: python3 scripts/check_site.py _site --baseurl /ai_memory_chang_ai_team
"""
import argparse
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.references = []
        self.viewport = False
        self.title = ''
        self.in_title = False
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for key in ('id', 'name' if tag == 'a' else 'id'):
            if attrs.get(key):
                self.ids.add(attrs[key])
        self.in_title = self.in_title or tag == 'title'
        self.viewport |= tag == 'meta' and attrs.get('name') == 'viewport'
        for key in ('href', 'src', 'poster'):
            if attrs.get(key):
                self.references.append((attrs[key], self.getpos()[0]))

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data


def check(root, baseurl, origin):
    pages = {path: Page(path.read_text(encoding='utf-8')) for path in root.rglob('*.html')}
    errors = []
    checked = 0
    for path, page in pages.items():
        relative = path.relative_to(root)
        if not page.title.strip() or page.title.strip().startswith('|'):
            errors.append(f'{relative}: missing page title')
        if not page.viewport:
            errors.append(f'{relative}: missing mobile viewport')
        url = origin + baseurl + '/' + relative.as_posix()
        for reference, line in page.references:
            parsed = urlsplit(urljoin(url, reference))
            if parsed.scheme not in ('http', 'https') or parsed.netloc != urlsplit(origin).netloc:
                continue
            # A bare # is the theme's intentional no-op/back-to-top control.
            target_url = unquote(parsed.path)
            if baseurl and not (target_url == baseurl or target_url.startswith(baseurl + '/')):
                errors.append(f'{relative}:{line}: outside baseurl: {reference}')
                continue
            target = root / target_url[len(baseurl):].lstrip('/')
            if target.is_dir():
                target /= 'index.html'
            checked += 1
            if not target.is_file():
                errors.append(f'{relative}:{line}: missing file: {reference}')
            elif parsed.fragment and target in pages:
                fragment = unquote(parsed.fragment).split(':~:text=')[0]
                if fragment and fragment not in pages[target].ids:
                    errors.append(f'{relative}:{line}: missing anchor: {reference}')

    for required in ('index.html', 'categories/index.html', 'tags/index.html', 'archives/index.html',
                     'library/index.html', 'storage-lab/index.html', 'storage-lab/sessions/01/index.html', 'storage-lab/sessions/12/index.html', 'assets/style.css', 'assets/js/category-pagination.js'):
        if not (root / required).is_file():
            errors.append(f'Missing required output: {required}')
    # Every generated article must remain discoverable from the archives page.
    archive = pages.get(root / 'archives/index.html')
    if archive:
        links = Counter(unquote(urlsplit(ref).path) for ref, _ in archive.references)
        for post in (root / 'posts').rglob('index.html'):
            url = baseurl + '/' + post.parent.relative_to(root).as_posix() + '/'
            if not links[url]:
                errors.append(f'Article missing from archives: {url}')
    for private_path in ('AGENTS.md', 'SOUL.md', 'USER.md', 'MEMORY.md', 'agents', 'memory', 'skills', 'scripts', 'tests'):
        if (root / private_path).exists():
            errors.append(f'Operational source included in site: {private_path}')
    print(f'Checked {len(pages)} HTML pages and {checked} internal references.')
    for error in errors:
        print(error)
    return len(errors)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('site', type=Path)
    parser.add_argument('--baseurl', default='/ai_memory_chang_ai_team')
    parser.add_argument('--origin', default='https://bryantchang1992.github.io')
    args = parser.parse_args()
    raise SystemExit(bool(check(args.site.resolve(), args.baseurl.rstrip('/'), args.origin.rstrip('/'))))
