"""Check each draft PDF's extractable labels, structure, boundaries and grayscale legibility.
Produce color/grayscale gallery for human inspection; do NOT mark clinical QA approved.
"""
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
import json,runpy,hashlib
import pymupdf
R=Path(__file__).resolve().parents[1]
out=Path('/tmp/cpl-topic-parity-candidates')
topics=runpy.run_path(str(R/'scripts/expansion-topics.py'))['TOPICS']
manifest=json.loads((out/'manifest.json').read_text())
assert len(topics)==len(manifest)==25
assert [t['slug'] for t in topics]==[m['slug'] for m in manifest]
THUMB_W=420;THUMB_H=545
gallery=Image.new('RGB',(THUMB_W*5, (THUMB_H+38)*5),'white')
draw=ImageDraw.Draw(gallery)
for i,(topic,m) in enumerate(zip(topics,manifest)):
    file=out/('topic-'+topic['slug']+'.pdf')
    assert file.exists(),file
    assert hashlib.sha256(file.read_bytes()).hexdigest()==m['pdf_sha256']
    doc=pymupdf.open(file)
    assert len(doc)==1,(file,'expect single-page worksheet')
    page=doc[0]
    assert 610<page.rect.width<615 and 790<page.rect.height<795
    text=' '.join(page.get_text('text').split())
    for phrase in [topic['title'],'REFLECTION / CHOSEN SUPPORT','SAFETY & SCOPE']:
        assert phrase.lower() in text.lower(),(file,'missing',phrase)
    # Titles and descriptions are authored from the same source as the HTML.
    if m['mode']=='safety-gate':
        # The approved replacement is a true fork, not five repurposed sequential source boxes.
        must=['Adult responsibility - always','Unsafe or coercive','Safe and voluntary',
              'Protect','Assess risk','Follow safeguarding procedures','Understand each perspective',
              'Offer coaching or repair','Do not require forgiveness','Ongoing support for all siblings']
        for phrase in must:assert phrase.lower() in text.lower(),(file,'missing safety fork element',phrase)
        assert text.index('Adult responsibility - always') < text.index('Unsafe or coercive')
        assert text.index('Adult responsibility - always') < text.index('Safe and voluntary')
        assert text.index('Ongoing support for all siblings') > text.index('Do not require forgiveness')
    elif m['mode']=='parallel-assess':
        required=['BOTH ASSESSMENTS START TOGETHER','MEDICAL / NUTRITIONAL SAFETY',
                  'PSYCHOLOGICAL / SENSORY / ACCESS','URGENT CONCERN? ACT NOW',
                  'Do not wait.','ONE SHARED PLAN']
        for phrase in required:assert phrase.lower() in text.lower(),(file,'missing concurrent-track element',phrase)
        assert text.index('MEDICAL / NUTRITIONAL SAFETY') > text.index('BOTH ASSESSMENTS START TOGETHER')
        assert text.index('PSYCHOLOGICAL / SENSORY / ACCESS') > text.index('BOTH ASSESSMENTS START TOGETHER')
        assert text.index('ONE SHARED PLAN') > text.index('URGENT CONCERN? ACT NOW')
    else:
        for title,description in topic['diagram']:
            norm=lambda s:' '.join(s.replace('→',' to ').replace('↔',' and ').replace('’',"'").replace('—','-').replace('–','-').split())
            # PyMuPDF can split wrapped lines but text order must remain extractable.
            assert norm(title).lower() in text.lower(),(file,'missing node title',title)
    if m['mode']=='return-loop': assert 'SHORT-TERM RESPONSE MAY SHAPE THE NEXT TRIGGER' in text
    if m['mode']=='loop-choice': assert 'THE FIRST FOUR MAY REPEAT' in text
    assert len(text)>400,(file,'missing content')
    for block in page.get_text('blocks'):
        if not str(block[4]).strip():continue
        x0,y0,x1,y1=block[:4]
        assert x0>=-2 and y0>=-2 and x1<=page.rect.width+2 and y1<=page.rect.height+2,(file,'out of page',(x0,y0,x1,y1))
    pix=page.get_pixmap(matrix=pymupdf.Matrix(1.5,1.5),alpha=False)
    image=Image.frombytes('RGB',[pix.width,pix.height],pix.samples)
    gray=ImageOps.grayscale(image).convert('RGB')
    gray.save(out/('gray-'+topic['slug']+'.png'))
    if i in (3,10,14,15,23,24):
        image.save(out/('color-'+topic['slug']+'.png'))
    thumb=ImageOps.contain(gray,(THUMB_W-14,THUMB_H-12))
    x=(i%5)*THUMB_W+7; y=(i//5)*(THUMB_H+38)
    gallery.paste(thumb,(x,y+27))
    draw.text((x,y+5),str(i+1)+'. '+topic['slug'][:47],fill='black')
    assert m['stage']=='candidate-not-published'
    print(str(i+1).rjust(2),topic['slug'],m['mode'],'PASS')
gallery.save(out/'all-25-grayscale-contact-sheet.png')
print('PASS: 25 draft one-page PDFs; source-matched titles, diagrams, all text within page, color/grayscale review evidence')
