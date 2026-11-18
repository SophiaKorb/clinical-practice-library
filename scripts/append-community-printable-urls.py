#!/usr/bin/env python3
"""Append complete visible source URLs to review-only community PDFs.
Never changes approved originals, provider facts, or public distribution.
"""
from pathlib import Path
from io import BytesIO
from collections import defaultdict
from urllib.parse import urlparse
from xml.sax.saxutils import escape
import hashlib, json, re
import fitz
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, KeepTogether

ROOT = Path(__file__).resolve().parents[1] / 'qa-artifacts/community-integrated-print'
FONT = '/usr/share/fonts/truetype/dejavu/'
for name, filename in [('Body','DejaVuSans.ttf'),('Bold','DejaVuSans-Bold.ttf'),('Heading','DejaVuSerif.ttf')]:
    pdfmetrics.registerFont(TTFont(name, FONT + filename))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='Bold')
ink=colors.HexColor('#203C34')
green=colors.HexColor('#17635D')
muted=colors.HexColor('#4A655B')
rule=colors.HexColor('#CDDAD1')
sty={
 'kicker':ParagraphStyle('kicker',fontName='Bold',fontSize=8.4,leading=12,textColor=green,spaceAfter=9),
 'title':ParagraphStyle('title',fontName='Heading',fontSize=23,leading=29,textColor=ink,spaceAfter=12),
 'intro':ParagraphStyle('intro',fontName='Body',fontSize=10,leading=15.2,textColor=ink,spaceAfter=10),
 'section':ParagraphStyle('section',fontName='Heading',fontSize=14,leading=19,textColor=ink,spaceBefore=15,spaceAfter=9,keepWithNext=True),
 'label':ParagraphStyle('label',fontName='Bold',fontSize=9.2,leading=12.7,textColor=ink,spaceAfter=2,splitLongWords=1),
 'url':ParagraphStyle('url',fontName='Body',fontSize=8.7,leading=12.6,textColor=green,spaceAfter=4.5,splitLongWords=1)
}
def label_for(page,link):
 rect=fitz.Rect(link['from'])
 txt=' '.join(page.get_textbox(rect).split())
 generic=bool(re.search('open the current provider|open the current cpl|click here|https?://',txt,re.I))
 if txt and not generic and not re.search('^source$',txt,re.I):
  return txt[:105]
 candidates=[]
 for block in page.get_text('dict')['blocks']:
  for line in block.get('lines',[]):
   for s in line['spans']:
    y=s['bbox'][1]
    if 0 <= rect.y0-y <= 205 and s['size']>=10.2 and ('Bold' in s['font'] or s['size']>=13):
     name=' '.join(s['text'].split())
     if name and not re.search('community and practical support|southern arizona|guide',name,re.I):
      candidates.append((y,name))
 if candidates:return sorted(candidates)[-1][1][:105]
 if txt and not generic:return txt[:105]
 u=urlparse(link['uri'])
 return u.netloc + ((' / '+u.path.strip('/').split('/')[-1].replace('-',' ')) if u.path.strip('/') else '')
def gather(doc):
 records={}
 count=0
 for i,p in enumerate(doc):
  for link in p.get_links():
   uri=link.get('uri','')
   if not uri.startswith(('https://','http://')):continue
   count+=1
   if uri not in records:
    records[uri]={'url':uri,'label':label_for(p,link),'index':i,'y':round(fitz.Rect(link['from']).y0,1),'pages':set()}
   records[uri]['pages'].add(i)
 for r in records.values():r['pages']=sorted(r['pages'])
 return sorted(records.values(),key=lambda r:(r['index'],r['y'],r['url'])),count
def build(which):
 stem='CPL_Youth_Transition_Community_Guide' if which=='youth' else 'CPL_Family_Community_Guide'
 original=ROOT/(stem+'_Integrated_2026.pdf')
 output=ROOT/(stem+'_Printable_With_URLs_2026.pdf')
 base=fitz.open(original)
 rows,click_count=gather(base)
 assert len(rows)>= (35 if which=='youth' else 120)
 prefix_pages=7 if which=='youth' else 6
 def page_ref(i):
  return f'Newer section p. {i+1}' if i<prefix_pages else f'Original October p. {i-prefix_pages+1}'
 def footer(c,d):
  c.saveState()
  c.setFillColor(ink);c.rect(0,letter[1]-9,letter[0],9,stroke=0,fill=1)
  c.setStrokeColor(rule);c.line(50,45,letter[0]-50,45)
  c.setFillColor(muted);c.setFont('Body',8)
  c.drawString(50,31,'CPL / COMPLETE PRINTED WEB ADDRESSES')
  c.drawRightString(letter[0]-50,31,f'URL DIRECTORY / {d.page}')
  c.restoreState()
 flow=[
  Paragraph('COMPANION TO THE NOVEMBER 2026 PRINT GUIDE',sty['kicker']),
  Paragraph('Complete web address directory',sty['title']),
  Paragraph('Every external website linked in the guide is printed here in full. Use the page reference to match the printed listing to its website. Addresses are also clickable in the PDF.',sty['intro']),
  Paragraph('These are URLs recorded in the dated guide, not a guarantee of current services or intake. Long addresses wrap without shortening; ignore line breaks when typing.',sty['intro']),
  Paragraph(f'<b>{len(rows)} distinct full URLs</b> and {click_count} website link annotations in the guide.',sty['intro'])
 ]
 section=None
 for r in rows:
  new='Newer resources and source checks' if r['index']<prefix_pages else 'Original October guide sources'
  if new!=section:
   flow.append(Paragraph(new,sty['section']))
   section=new
  pages=r['pages']
  loc=page_ref(pages[0])
  if len(pages)>1:loc+=f' (also on {len(pages)-1} more page(s))'
  key=escape(loc+' · '+r['label'][:110])
  uri=escape(r['url'],{'"':'&quot;'})
  flow.append(KeepTogether([Paragraph(key,sty['label']),Paragraph('<link href="'+uri+'"><u>'+uri+'</u></link>',sty['url'])]))
 stream=BytesIO()
 pdf=SimpleDocTemplate(stream,pagesize=letter,leftMargin=50,rightMargin=50,topMargin=48,bottomMargin=60,title='CPL complete web address directory')
 pdf.build(flow,onFirstPage=footer,onLaterPages=footer)
 ap=fitz.open(stream=stream.getvalue(),filetype='pdf')
 combined=fitz.open()
 combined.insert_pdf(base,links=True)
 combined.insert_pdf(ap,links=True)
 toc=base.get_toc()
 toc.append([1,'Complete printed URL directory',len(base)+1])
 combined.set_toc(toc)
 combined.set_metadata({'title':stem+' | printable URLs 2026','author':'Clinical Practice Library','subject':'Original full pages retained with visible complete website URLs'})
 combined.save(output,garbage=4,deflate=True)
 check=fitz.open(output)
 assert all(check[i].get_text()==base[i].get_text() for i in range(len(base)))
 before=[(i,l['uri']) for i,p in enumerate(base) for l in p.get_links() if l.get('uri','').startswith('http')]
 after=[(i,l['uri']) for i,p in enumerate(check[:len(base)]) for l in p.get_links() if l.get('uri','').startswith('http')]
 assert before==after
 printed=re.sub(r'\s+','','\n'.join(p.get_text() for p in check[len(base):]))
 missing=[r['url'] for r in rows if r['url'] not in printed]
 assert not missing, f'Unprinted URLs: {missing[:5]}'
 assert all(round(p.rect.width)==612 and round(p.rect.height)==792 for p in check)
 for p in check[len(base):]:
  for b in p.get_text('blocks'):
   if b[6]==0:assert b[0]>=20 and b[1]>=14 and b[2]<=592 and b[3]<=777, b
 result={'original_pages':len(base),'url_directory_pages':len(ap),'total_pages':len(check),'distinct_visible_urls':len(rows),'original_external_links':len(before),'output_sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'source_pages_and_links_preserved':True,'all_external_urls_full_and_printed':True,'letter_pages':True}
 (ROOT/(which+'-visible-urls-qa.json')).write_text(json.dumps(result,indent=2))
 print(which.upper()+'_GUIDE_VISIBLE_URLS_PASS '+json.dumps(result))
 base.close();ap.close();check.close();combined.close()
for group in ['family','youth']:build(group)
