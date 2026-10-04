"""Check public HTML destinations, fragments, IDs, and local assets."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import sys

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.ids, self.links = [], []
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'):
            self.ids.append(a['id'])
        for key in ('href', 'src'):
            if a.get(key):
                self.links.append(a[key])


pages = {path: Page(path) for path in ROOT.rglob('*.html') if '.git' not in path.parts}
errors, checked = [], 0
for path, page in pages.items():
    for ident, count in Counter(page.ids).items():
        if count > 1:
            errors.append(f'{path.relative_to(ROOT)}: duplicate ID {ident}')
    for href in page.links:
        url = urlsplit(href)
        if url.scheme or url.netloc:
            continue
        raw = unquote(url.path)
        # Vercel aliases carry the browser fragment to the canonical root.
        if raw in ('/resources', '/resources/', '/resources/index', '/resources/index.html'):
            target = ROOT / 'index.html'
        elif not raw:
            target = path
        else:
            base = ROOT if raw.startswith('/') else path.parent
            target = (base / raw.lstrip('/')).resolve()
            if target.is_dir():
                target = target / 'index.html'
            if not target.exists() and not target.suffix:
                target = target.with_suffix('.html')
        checked += 1
        if not target.exists():
            errors.append(f'{path.relative_to(ROOT)}: missing {href}')
        elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
            errors.append(f'{path.relative_to(ROOT)}: missing fragment {href}')
if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'PASS: {len(pages)} HTML pages, {checked} local links/assets, unique IDs and valid fragments')
