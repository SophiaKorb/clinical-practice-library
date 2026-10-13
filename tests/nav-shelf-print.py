"""Keep route labels and explanatory text on the same printed page."""
import fitz
pdf = fitz.open('/tmp/nav-shelves-print.pdf')
pages = [p.get_text() for p in pdf]
labels = ['1 · FORMULATE', '2 · ANCHOR', '3 · ADAPT', '4 · CHECK']
route_pages = [i for i, text in enumerate(pages) if labels[0] in text]
assert len(route_pages) == 1, 'Clinical route must print exactly once'
text = pages[route_pages[0]]
for label in labels:
    assert label in text, f'Missing route label on route page: {label}'
for phrase in ['What is the target?', 'Choose one treatment frame', 'Make the treatment accessible', 'Measure what changed', 'reformulate.']:
    assert phrase in ' '.join(text.split()), f'Split route content: {phrase}'
for page in pdf:
    for block in page.get_text('blocks'):
        assert block[0] >= -1 and block[1] >= -1 and block[2] <= page.rect.width + 1 and block[3] <= page.rect.height + 1, 'Text outside page bounds'
    pix = page.get_pixmap(matrix=fitz.Matrix(1.4, 1.4))
    pix.save(f'/tmp/nav-shelves-print-page-{page.number+1}.png')
print(f'PASS: intact four-step clinical route and text bounds across {len(pdf)} printed pages')
