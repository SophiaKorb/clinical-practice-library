"""Check every shipped JS file and HTML script/event handler with Node's parser."""
from html.parser import HTMLParser
from pathlib import Path
import json
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]


class Scripts(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.scripts = []
        self.handlers = []
        self.current = None
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for name, value in attrs.items():
            if name.startswith('on') and value:
                self.handlers.append(value)
        if tag == 'script' and not attrs.get('src'):
            self.current = [attrs.get('type', ''), '']

    def handle_data(self, data):
        if self.current is not None:
            self.current[1] += data

    def handle_endtag(self, tag):
        if tag == 'script' and self.current is not None:
            self.scripts.append(self.current)
            self.current = None


errors = []
count = 0

def check(source, label, module=False):
    global count
    count += 1
    with tempfile.NamedTemporaryFile(mode='w', suffix='.mjs' if module else '.js') as temp:
        temp.write(source)
        temp.flush()
        result = subprocess.run(['node', '--check', temp.name], text=True, capture_output=True)
    if result.returncode:
        errors.append(f'{label}: {result.stderr}')


for path in ROOT.rglob('*'):
    if '.git' in path.parts or 'node_modules' in path.parts or not path.is_file():
        continue
    label = str(path.relative_to(ROOT))
    if path.suffix in ('.js', '.cjs', '.mjs'):
        check(path.read_text(), label, path.suffix == '.mjs')
    elif path.suffix == '.json':
        try:
            json.loads(path.read_text())
        except ValueError as error:
            errors.append(f'{label}: {error}')
    elif path.suffix == '.html':
        parsed = Scripts(path.read_text())
        for index, (kind, source) in enumerate(parsed.scripts):
            if kind in ('application/json', 'application/ld+json'):
                try:
                    json.loads(source)
                except ValueError as error:
                    errors.append(f'{label} JSON script {index}: {error}')
            elif not kind or kind in ('module', 'text/javascript', 'application/javascript'):
                check(source, f'{label} script {index}', kind == 'module')
        for index, source in enumerate(parsed.handlers):
            check('function handler(event){\n' + source + '\n}', f'{label} handler {index}')
print(f'{count} scripts and handlers checked; {len(errors)} errors')
print('\n'.join(errors))
sys.exit(bool(errors))
