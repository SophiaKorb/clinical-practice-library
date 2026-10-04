"""Verify public forms and optionally write synthetic round-trip copies to scratch."""
import argparse
import json
from html.parser import HTMLParser
from pathlib import Path
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--samples', type=Path)
args = parser.parse_args()
if args.samples:
    args.samples.mkdir(parents=True, exist_ok=True)


class Controls(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.names = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ('input', 'textarea') and a.get('name'):
            self.names.append(a['name'])


for d in json.loads((ROOT / 'data/stable-worksheets.json').read_text()).values():
    controls = Controls((ROOT / 'resources/handouts' / (d['slug'] + '.html')).read_text())
    reader = PdfReader(ROOT / 'resources/downloads' / d['pdf'])
    fields = reader.get_fields() or {}
    assert len(reader.pages) == 2
    assert set(fields) == set(controls.names)
    assert len(controls.names) == len(set(controls.names))
    widgets = []
    for page in reader.pages:
        for ref in page.get('/Annots', []):
            widget = ref.get_object()
            if widget.get('/Subtype') != '/Widget':
                continue
            widgets.append(widget)
            effective = widget.get('/Parent').get_object() if widget.get('/Parent') else widget
            assert effective.get('/V') in ('', '/Off', None), 'Public form is not blank'
            assert widget.get('/AP', {}).get('/N'), 'Missing appearance'
            r = widget['/Rect']
            assert r[0] >= 34 and r[1] >= 34 and r[2] <= 578 and r[3] <= 758
    assert len(widgets) == len(fields)
    assert sum((page.extract_text() or '').count('Sophia Cohon, PhD') for page in reader.pages) == 1
    if args.samples:
        values = {}
        for page in reader.pages:
            for ref in page.get('/Annots', []):
                widget = ref.get_object()
                if widget.get('/Subtype') == '/Widget' and widget.get('/FT') == '/Tx':
                    values[widget['/T']] = 'Sample only: one small step.'
                    break
        button = next(n for n, f in fields.items() if f.get('/FT') == '/Btn')
        values[button] = '/Yes'
        writer = PdfWriter()
        writer.clone_document_from_reader(reader)
        writer.update_page_form_field_values(None, values, auto_regenerate=False)
        target = args.samples / (d['slug'] + '-sample.pdf')
        with target.open('wb') as stream:
            writer.write(stream)
        filled = PdfReader(target)
        for name, value in values.items():
            assert filled.get_fields()[name]['/V'] == value
        for page in filled.pages:
            for ref in page.get('/Annots', []):
                widget = ref.get_object()
                effective = widget.get('/Parent').get_object() if widget.get('/Parent') else widget
                if effective.get('/T') in values:
                    assert effective['/V'] == values[effective['/T']]
                    assert widget['/AP']['/N']
    print(f'PASS {d["pdf"]}: two pages, {len(fields)} blank fields/widgets, web parity, one author credit')
