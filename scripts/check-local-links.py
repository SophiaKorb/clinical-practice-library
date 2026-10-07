"""Validate static CPL links, assets and fragments without external dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import posixpath
import sys

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids, self.links = set(), []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        if tag == 'a' and attrs.get('name'):
            self.ids.add(attrs['name'])
        for attr in ('href', 'src'):
            if attrs.get(attr):
                self.links.append(attrs[attr])


pages = {p.relative_to(ROOT).as_posix(): Page(p.read_text()) for p in ROOT.rglob('*.html')}
errors, count = [], 0
for name, page in pages.items():
    for ref in page.links:
        url = urlsplit(ref)
        if url.scheme or url.netloc:
            continue
        count += 1
        target = posixpath.normpath(posixpath.join(posixpath.dirname(name), unquote(url.path))) if url.path else name
        if url.path.startswith('/'):
            target = unquote(url.path).lstrip('/')
        path = ROOT / target
        if path.is_dir():
            path /= 'index.html'
        if not path.exists() and not path.suffix:
            path = path.with_suffix('.html')
        if not path.is_file():
            errors.append(f'{name}: {ref} — missing file')
            continue
        target = path.relative_to(ROOT).as_posix()
        if url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
            errors.append(f'{name}: {ref} — missing fragment')
print(f'{len(pages)} pages; {count} local references; {len(errors)} errors')
print('\n'.join(errors))
sys.exit(bool(errors))
