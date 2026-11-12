# QA of PDFs created from the local review page, not PHI.
import os, sys, fitz
from collections import Counter
path=sys.argv[1] if len(sys.argv)>1 else '/tmp/cpl-visual-deep-qa.pdf'
doc=fitz.open(path)
expected=['Change Board','Visual Dictionary','Visual Dictionary','Barrier','Getting Started','Two Perspectives','First','What Helps Me','Try','Routine Map','When Things Feel Too Much','Notice Early Signs','Words That Help']
assert len(doc)==13, f'Expected 13 PDF pages, got {len(doc)}'
errors=[]; pale=[]; ink=[]
for i,page in enumerate(doc):
    words=page.get_text('words')
    text=page.get_text()
    if len(words)<20: errors.append(f'Page {i+1} too few extracted words ({len(words)})')
    if expected[i].lower() not in text.lower(): errors.append(f'Page {i+1} missing expected heading: {expected[i]}')
    w,h=page.rect.width,page.rect.height
    if abs(w-612)>1 or abs(h-792)>1: errors.append(f'Page {i+1} wrong US Letter page size {w} x {h}')
    for word in words:
        x0,y0,x1,y1=word[:4]
        if x0<-1.5 or y0<-1.5 or x1>w+1.5 or y1>h+1.5:
            errors.append(f'Page {i+1} clipped/outside word {word[4]!r} {word[:4]}')
    for block in page.get_text('dict')['blocks']:
        if 'lines' not in block: continue
        for line in block['lines']:
            for span in line['spans']:
                if not span['text'].strip(): continue
                color=span['color']
                r=(color>>16)&255;g=(color>>8)&255;b=color&255
                def lin(v):
                    v/=255.
                    return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4
                lum=.2126*lin(r)+.7152*lin(g)+.0722*lin(b)
                contrast=1.05/(lum+.05) # against white, conservative only for white backgrounds
                if contrast<4.5 and span['size']<=16:
                    pale.append({'page':i+1,'text':span['text'][:38],'color':f'#{color:06x}','size':round(span['size'],1),'on_white_contrast':round(contrast,2)})
    pix=page.get_pixmap(colorspace=fitz.csGRAY,dpi=72,alpha=False)
    data=pix.samples
    hist=Counter(data)
    dark=sum(n for val,n in hist.items() if val<85)
    ink.append({'page':i+1,'words':len(words),'gray_min':min(data),'gray_max':max(data),'dark_pixels':dark,'page_pixels':len(data)})
    if dark < 120: errors.append(f'Page {i+1} has almost no dark grayscale detail')
print('PDF_TEXT_BOUNDS',len(doc),'letter pages; words per page:',[x['words'] for x in ink])
print('PDF_GRAYSCALE',ink)
print('CONTRAST_CANDIDATES',len(pale),pale[:50])
if errors:
    print('PDF_ERRORS',errors)
    sys.exit(1)
print('PASS_PDF: 13 searchable Letter pages, expected text, bounded words, grayscale detail')
