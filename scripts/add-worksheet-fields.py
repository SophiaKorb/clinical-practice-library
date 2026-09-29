"""Add native PDF fields to browser-rendered, two-page CPL worksheets."""
import io
import json
import sys
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white, black
from pypdf import PdfReader, PdfWriter

flat, metadata, target = map(Path, sys.argv[1:])
layout = json.loads(metadata.read_text())
base = PdfReader(flat)
if len(base.pages) != 2:
    raise ValueError(f'{flat.name}: expected two pages, found {len(base.pages)}')
overlay_bytes = io.BytesIO()
c = canvas.Canvas(overlay_bytes, pagesize=(612, 792))
margin = .48 * 72
for page in range(2):
    for control in (item for item in layout if item['page'] == page):
        x = margin + control['x'] * .75
        y = 792 - margin - (control['y'] + control['height']) * .75
        w, h = control['width'] * .75, control['height'] * .75
        if y < margin-1 or y+h > 792-margin+1:
            raise ValueError('Field outside printable page: ' + control['name'])
        common = dict(name=control['name'], tooltip=control['label'],
                      textColor=black, fillColor=white, borderColor=HexColor('#59635d'))
        if control['type'] in ('text', 'textarea'):
            c.acroForm.textfield(**common, x=x+2, y=y+2, width=w-4, height=h-4,
                fontName='Helvetica', fontSize=10, borderWidth=0, forceBorder=False,
                fieldFlags='multiline' if control['type'] == 'textarea' else '')
        elif control['type'] == 'checkbox':
            c.acroForm.checkbox(**common, x=x, y=y, size=min(w,h), borderWidth=.7,
                buttonStyle='check', checked=False)
        elif control['type'] == 'radio':
            c.acroForm.radio(**common, x=x, y=y, size=min(w,h), borderWidth=.7,
                buttonStyle='circle', value=control['value'], selected=False)
    c.showPage()
c.save()

overlay = PdfReader(io.BytesIO(overlay_bytes.getvalue()))
writer = PdfWriter()
writer.clone_document_from_reader(overlay)
for page in range(2):
    writer.pages[page].merge_page(base.pages[page], over=False)
# Clone the form document first so radio parents, widgets, and their shared
# field tree stay intact, then put the browser-rendered artwork underneath.
writer.add_metadata({key: str(value) for key, value in (base.metadata or {}).items()
                     if value is not None})
fields = writer.get_fields() or {}
expected = {item['name'] for item in layout}
if set(fields) != expected:
    raise ValueError(f'Field tree mismatch: missing={expected-set(fields)}, extra={set(fields)-expected}')
blank_values = {name: '/Off' if field.get('/FT') == '/Btn' else '' for name, field in fields.items()}
writer.update_page_form_field_values(None, blank_values, auto_regenerate=False)
with target.open('wb') as stream:
    writer.write(stream)

final = PdfReader(target)
assert len(final.pages) == 2
assert set(final.get_fields() or {}) == expected
widgets = []
for page in final.pages:
    for item in page.get('/Annots', []):
        widget = item.get_object()
        if widget.get('/Subtype') == '/Widget':
            widgets.append(widget)
            assert widget.get('/AP', {}).get('/N'), 'Missing field appearance'
            parent = widget.get('/Parent')
            effective = parent.get_object() if parent else widget
            assert effective.get('/V') in ('', '/Off', None), 'Public template contains a filled value'
assert len(widgets) == len(layout), 'Widget count does not match web controls'
print(target.name, 'PASS:', len(expected), 'fillable fields,', len(widgets), 'widgets, 2 pages')
