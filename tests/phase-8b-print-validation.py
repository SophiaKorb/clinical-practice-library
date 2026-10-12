from pathlib import Path
import pymupdf as fitz
out=Path('/tmp/cpl-phase-8b-rendered')
expected={
 'safety-print.pdf':['After a self-harm','Physical and immediate safety'],
 'dissociation-print.pdf':['Complex dissociation','subjective experience'],
 'child-print.pdf':['When a child struggles','Select the intervention'],
 'caregiver-print.pdf':['One activity. One support.','BEFORE'],
 'substance-print.pdf':['Treat the whole picture','Physical safety'],
 'substance-map-print.pdf':['Three needs','Physical safety'],
 'psychosis-print.pdf':['What changed, when','Build a timeline'],
 'episode-print.pdf':['One timeline','Mood, sleep, energy'],
}
for filename,phrases in expected.items():
 p=out/filename
 doc=fitz.open(p)
 assert doc.page_count>0,filename
 full=' '.join(' '.join(page.get_text('text') for page in doc).split())
 for phrase in phrases:
  assert phrase.lower() in full.lower(),f'{filename} missing extractable clinical label {phrase!r}'
 assert len(full)>300,(filename,len(full))
 for page in doc:
  blocks=page.get_text('blocks')
  for block in blocks:
   x0,y0,x1,y1=block[:4]
   if str(block[4]).strip():
    assert x0 >= -3 and y0 >= -3 and x1 <= page.rect.width+3 and y1 <= page.rect.height+3,(filename,page.number,(x0,y0,x1,y1))
 doc[0].get_pixmap(matrix=fitz.Matrix(1.4,1.4),alpha=False).save(out/(filename.removesuffix('.pdf')+'-page-1.png'))
 print(f'{filename}: {doc.page_count} pages, {len(full)} extractable characters; first-page render saved')

for filename,client_view in [
 ('cpl-visual-toolkit-print.pdf',False),
 ('cpl-visual-toolkit-client-print.pdf',True),
]:
 p=out/filename
 doc=fitz.open(p)
 assert doc.page_count>0,filename
 pages=[' '.join(page.get_text('text').split()) for page in doc]
 full=' '.join(pages)
 for label in ['How much support do I need?', '0 Settled', '1 Noticing',
               '2 Building', '3 Hard to continue', '4 Very overwhelmed',
               '5 Urgent help needed', 'What would help right now?',
               'Quiet', 'Show me', 'A pause', 'Not now']:
  assert label.lower() in full.lower(),(filename,'missing printed scale/choice: '+label)
 if client_view:
  assert 'Clinician instructions' not in full,(filename,'clinician-only details leaked')
 else:
  assert 'Clinician instructions' in full,(filename,'clinician notes unexpectedly absent')
 for page in doc:
  for block in page.get_text('blocks'):
   x0,y0,x1,y1=block[:4]
   if str(block[4]).strip():
    assert x0>=-3 and y0>=-3 and x1<=page.rect.width+3 and y1<=page.rect.height+3,(filename,page.number,(x0,y0,x1,y1))
 index=next(i for i,txt in enumerate(pages) if 'How much support do I need?' in txt)
 doc[index].get_pixmap(matrix=fitz.Matrix(1.4,1.4),alpha=False).save(out/(filename.removesuffix('.pdf')+'-scale-page.png'))
 print(f'{filename}: {doc.page_count} pages, scale and supported-choice labels extractable; scale page rendered')

print('PASS eight printed Phase 8B PDFs: extractable clinical labels, page text bounds, rendered first pages. Visual/professional approval still pending.')
