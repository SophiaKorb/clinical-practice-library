"""Inspect focused visual toolkit PDF outputs from real Chromium printing."""
from pathlib import Path
import pymupdf

root=Path('/tmp/cpl-visual-print-focused')
for width in (390,1280):
    for variant in ('clinician','client'):
        filename=f'{variant}-{width}.pdf'
        doc=pymupdf.open(root/filename)
        assert doc.page_count>0,filename
        page_text=[' '.join(page.get_text('text').split()) for page in doc]
        combined=' '.join(page_text)
        for label in ['How much support do I need?', '0 Settled', '1 Noticing',
                      '2 Building','3 Hard to continue','4 Very overwhelmed',
                      '5 Urgent help needed','What would help right now?',
                      'Quiet','Show me','A pause','Not now']:
            assert label.lower() in combined.lower(),(filename,label)
        guidance='An improved response to one support is contextual evidence'
        if variant=='clinician':
            assert guidance in combined,(filename,'clinician note text missing')
            assert 'Clinician instructions' in combined,(filename,'clinician headings missing')
        else:
            assert guidance not in combined,(filename,'clinical content leaked')
            assert 'Clinician instructions' not in combined,(filename,'clinical headings leaked')
        for p in doc:
            for block in p.get_text('blocks'):
                if str(block[4]).strip():
                    x0,y0,x1,y1=block[:4]
                    assert x0>=-3 and y0>=-3 and x1<=p.rect.width+3 and y1<=p.rect.height+3,(filename,p.number,(x0,y0,x1,y1))
        scale_page=next(i for i,v in enumerate(page_text) if 'How much support do I need?' in v)
        assert '0 Settled' in page_text[scale_page] and '5 Urgent help needed' in page_text[scale_page],(filename,'orphaned heading separated from scale')
        choices_page=next(i for i,v in enumerate(page_text) if 'What would help right now?' in v)
        assert 'Quiet' in page_text[choices_page] and 'Not now' in page_text[choices_page],(filename,'orphaned supported-choice heading')
        doc[scale_page].get_pixmap(matrix=pymupdf.Matrix(1.25,1.25),alpha=False).save(root/f'{variant}-{width}-scale.png')
        print(f'{filename}: {doc.page_count} pages; scale, choices, privacy and clinician guidance checked')
print('PASS focused client and clinician PDF print QA across phone and desktop.')
