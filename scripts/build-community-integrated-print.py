#!/usr/bin/env python3
"""Create review-only printable community guide editions from current online guides and immutable published PDFs.
No PHI, external fetch, source-file modification or deployment. CI artifact only.
"""
from pathlib import Path
import io, hashlib, re, json
import fitz, qrcode
from bs4 import BeautifulSoup
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, HRFlowable, Image

root=Path(__file__).resolve().parents[1]
src=root/'resources/community'
out=root/'qa-artifacts/community-integrated-print'
out.mkdir(parents=True,exist_ok=True)
dark=colors.HexColor('#183E36');green=colors.HexColor('#226052')
pale=colors.HexColor('#F1F5F0');line=colors.HexColor('#C9D7CC')
gray=colors.HexColor('#4A6255')
font='/usr/share/fonts/truetype/dejavu/'
for name,file in [('Main','DejaVuSans.ttf'),('Bold','DejaVuSans-Bold.ttf'),('Serif','DejaVuSerif.ttf')]:
 pdfmetrics.registerFont(TTFont(name,font+file))
pdfmetrics.registerFontFamily('Main',normal='Main',bold='Bold')
styles={
 'kicker':ParagraphStyle('kicker',fontName='Bold',fontSize=8.3,leading=12,textColor=green,spaceAfter=7),
 'h1':ParagraphStyle('h1',fontName='Serif',fontSize=23,leading=31,textColor=dark,spaceAfter=12),
 'h2':ParagraphStyle('h2',fontName='Serif',fontSize=15.2,leading=21,textColor=dark,spaceAfter=9),
 'h3':ParagraphStyle('h3',fontName='Bold',fontSize=11.3,leading=15,textColor=dark,spaceAfter=3),
 'body':ParagraphStyle('body',fontName='Main',fontSize=9.65,leading=14.8,textColor=dark,spaceAfter=8),
 'fine':ParagraphStyle('fine',fontName='Main',fontSize=8.9,leading=13,textColor=gray,spaceAfter=6),
 'link':ParagraphStyle('link',fontName='Main',fontSize=8.9,leading=12.5,textColor=green,spaceAfter=4),
}
def esc(s):
 return str(s).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;').replace('"','&quot;')
def P(s,style='body'):return Paragraph(s,styles[style])
def A(text,url):return '<link href="'+esc(url)+'" color="#226052"><u>'+esc(text)+'</u></link>'
def B(el,pad=10):
 tab=Table([[el]],colWidths=[496]);tab.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),colors.white),('BOX',(0,0),(-1,-1),0.5,line),('LEFTPADDING',(0,0),(-1,-1),pad),('RIGHTPADDING',(0,0),(-1,-1),pad),('TOPPADDING',(0,0),(-1,-1),pad),('BOTTOMPADDING',(0,0),(-1,-1),pad)]));return tab
def onpage(c,d):
 c.saveState();c.setFillColor(dark);c.rect(0,letter[1]-10,letter[0],10,fill=1,stroke=0)
 c.setStrokeColor(line);c.line(58,44,554,44);c.setFont('Main',7.8);c.setFillColor(gray)
 c.drawString(58,30,'CPL  /  SOUTHERN ARIZONA  /  UPDATED PRINT EDITION')
 c.drawRightString(554,30,'18 NOV 2026  ·  '+str(d.page))
 c.restoreState()
def qr(url):
 im=qrcode.make(url).convert('RGB');b=io.BytesIO();im.save(b,format='PNG');b.seek(0);return Image(b,width=87,height=87)
gov=[
 ('Pima County Superior Court — name change','https://www.sc.pima.gov/how-do-i','The current county web instructions and older official packet differ on a walk-in cutoff. Confirm before visiting.'),
 ('Arizona Judicial Branch — official forms','https://www.azcourts.gov/selfservicecenter/Forms/Name-Change','Statewide name-change forms; verify local rules, documents and fees.'),
 ('Social Security Administration — update name','https://www.ssa.gov/life-events/change-name','Current federal name-change requirements.'),
 ('Arizona MVD — name change','https://azdot.gov/mvd/services/driver-license-ID/change-your-name','Name-update steps for state driver license and identification documents.'),
 ('U.S. State Department — passport sex marker','https://travel.state.gov/en/passports/apply/unique-needs/sex-markers.html','Current federal passport policy; older local handouts may reflect superseded litigation.'),
 ('Pima County Superior Court — contact','https://www.sc.pima.gov/contact/','For conflicting guidance, hours, specific court fees or intake details.')
]
def flatten(node):return ' '.join(node.get_text(' ',strip=True).split()) if node else ''
def entries(html):
 soup=BeautifulSoup(html,'html.parser');records=[]
 for item in soup.select('li.lgbtq-listing'):
  a=item.select_one('h3 a[href]');n=flatten(a)
  ps=item.find_all('p',recursive=False)
  meta=flatten(item.select_one('p.lgbtq-meta'))
  desc=next((flatten(p) for p in ps if 'lgbtq-meta' not in p.get('class',[]) and 'lgbtq-sources' not in p.get('class',[])), '')
  records.append(dict(name=n,meta=meta,desc=desc,url=a['href'] if a else ''))
 assert len(records)==8,'Expected exactly eight source-grounded local supplements'
 return records
def supplement_record(r,i):
 return B([P(f'LOCAL LISTING  /  {i:02d}','kicker'),P(esc(r['name']),'h3'),P(esc(r['meta']),'fine'),
 P(esc(r['desc']),'body'),P('<b>Before visiting:</b> Confirm age, eligibility, fee, accessible participation, current schedule and privacy with the listed organization.','fine'),
 P(A(r['url'],r['url']),'link')],8)
def legal_page(story):
 story += [P('CURRENT LEGAL & DOCUMENT SOURCES','kicker'),P('Check the agency record, not an old checklist','h2'),
 P('Regional groups can help people navigate the process, but their handouts are not legal instructions. Some STARS/Fluxx pages describe older fees, policy and litigation. Name-change and sex-marker processes are distinct. Where a current agency page disagrees with a dated PDF or community guide, check directly with the agency or qualified counsel.'),Spacer(1,5)]
 for title,url,explanation in gov:
  story += [P(A(title,url),'body'),P(A(url,url),'link'),P(esc(explanation),'fine'),Spacer(1,4)]
 story += [B([P('<b>Privacy and choice:</b> Do not infer that a young person wants a caregiver, school or other provider informed. Respect consent, confidentiality and the person’s preferred support. These notes are not legal advice.','body')]),PageBreak()]
def worksheet(story):
 story += [P('RESOURCE NAVIGATION / PRINTABLE WORKSHEET','kicker'),P('An informed next connection','h2'),
 P('Use the person’s priorities and chosen communication method. This is an optional paper worksheet; store completed notes privately according to applicable policy.'),Spacer(1,12)]
 for prompt in ['What support I want, in my own words','Program and contact I want to consider','Eligibility, age, funding and transportation confirmed?','Accessibility, language, safety or privacy questions','First contact, preferred communication and date','Alternative if unavailable and follow-up plan']:
  story += [P(esc(prompt),'h3'),HRFlowable(width='100%',thickness=.6,color=line),Spacer(1,34)]
 story += [P('The complete October 2026 source guide follows. Original provider descriptions were written at different review dates; confirm availability and rules independently.','fine')]
def cover(story,title,overview,online,originalcount,hasextra):
 story += [Spacer(1,23),P('CLINICAL PRACTICE LIBRARY / SOUTHERN ARIZONA','kicker'),
 P(esc(title),'h1'),P('Updated community resource print companion','h2'),Spacer(1,6),
 P(esc(overview)),
 P(f'The <b>complete original October 2026 guide</b> appears without page alteration after this new section. Its {originalcount} designed pages and links are retained. Newer listings are clearly dated and separated from original source claims.'),
 Spacer(1,10)]
 q=qr(online);text=[P('Check the current online edition','h3'),P('Scan to review provider sources, eligibility notes and new listings before making a referral. The print edition is a dated snapshot.','body'),P(A(online,online),'link')]
 t=Table([[q,text]],colWidths=[110,386]);t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),pale),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('TOPPADDING',(0,0),(-1,-1),16),('BOTTOMPADDING',(0,0),(-1,-1),16),('LEFTPADDING',(0,0),(0,0),14),('LEFTPADDING',(1,0),(1,0),7)]));story += [t,Spacer(1,17)]
 story += [P('Inside this revised print edition','h2'),
 P('• Eight local LGBTQ+ community listings from the newer online directory.'),
 P('• Current official court, passport, Social Security and Arizona MVD references.'),
 P('• '+('I AM YOU 360 youth and family support profile, including program-specific cautions.' if hasextra else 'A person-led referral planning worksheet.' )),
 P('• All original source-directory pages, keeping the fuller program narratives and source links.'),
 Spacer(1,8),P('Updated resources reviewed 18 November 2026. Original October pages are included for historical context; this date does not indicate that every older provider entry has been freshly contacted.','fine'),PageBreak()]
def youth_extra(story):
 iam=BeautifulSoup((src/'iamyou360.html').read_text(), 'html.parser')
 story += [P('NEW YOUTH / TRANSITION-AGE SUPPORT','kicker'),P('I AM YOU 360','h1'),
 P('A Tucson nonprofit offering hygiene resources, housing-related programs, self-development and practical community support. Service criteria vary by program; its inclusion is not a guarantee of placement.'),Spacer(1,5)]
 for sec in iam.select('section.card'):
  title=flatten(sec.find('h2'));desc=flatten(sec.find('p'))
  story += [P(esc(title),'h3'),P(esc(desc),'body'),Spacer(1,5)]
 story += [B([P('<b>Different locations:</b> The CPL source profile distinguishes the provider’s office/hygiene pickup site at 1131 S. Van Buren Avenue from a separate Small Home Experience site at 1101 S. Van Buren Avenue. Confirm addresses, hours, intake, eligibility, capacity and whether the service is currently operating before travel or referral.','body')]),Spacer(1,10),
 P(A('https://iamyou360.org/','https://iamyou360.org/'),'link'),P(A('https://clinical-practice-library.vercel.app/resources/community/iamyou360.html','https://clinical-practice-library.vercel.app/resources/community/iamyou360.html'),'link'),PageBreak()]
def make(which):
 youth=which=='youth'
 name='Youth & Transition-Age Community Resource Guide' if youth else 'Family & Parenting Community Resource Guide'
 online='https://clinical-practice-library.vercel.app/resources/community/'+('transition-age-guide.html' if youth else 'family-guide.html')
 source=src/('transition-age-guide.html' if youth else 'family-guide.html')
 original=src/'original-pdfs'/('Southern_Arizona_Youth_Transition_Resources_2026.pdf' if youth else 'Tucson_Regional_Family_Resource_Guide_QA_Revised_2026.pdf')
 assert source.exists() and original.exists(), 'Original source missing'
 od=fitz.open(original); original_pages=len(od)
 assert original_pages>= (13 if youth else 52),f'Expected full published original, found {original_pages}'
 osha=hashlib.sha256(original.read_bytes()).hexdigest()
 rec=entries(source.read_text())
 fname='CPL_Youth_Transition_Community_Guide_Integrated_2026.pdf' if youth else 'CPL_Family_Community_Guide_Integrated_2026.pdf'
 sf=out/('supplement-'+which+'.pdf')
 story=[]
 cover(story,name,
       'The original guide remains complete; newer local resources and source cautions are brought into this one printable document.',
       online,original_pages,youth)
 if youth:youth_extra(story)
 for i in range(0,8,3):
  story += [P('LOCAL SUPPLEMENT / NOVEMBER 2026','kicker'),P('Community and practical support','h2')]
  for j,r in enumerate(rec[i:i+3],start=i+1):
   story += [supplement_record(r,j),Spacer(1,9)]
  story.append(PageBreak())
 legal_page(story);worksheet(story)
 doc=SimpleDocTemplate(str(sf),pagesize=letter,leftMargin=58,rightMargin=58,topMargin=45,bottomMargin=57,title=name+' | community print supplement')
 doc.build(story,onFirstPage=onpage,onLaterPages=onpage)
 new=fitz.open(sf);combined=fitz.open()
 combined.insert_pdf(new,links=True);combined.insert_pdf(od,links=True)
 prefix_pages=len(new)
 combined.set_toc([[1,'Updated resources and instructions',1],[2,'Local LGBTQ+ directory',2+(1 if youth else 0)],[2,'Official legal source links',5+(1 if youth else 0)],[2,'Referral worksheet',6+(1 if youth else 0)],[1,'Full original October source guide',prefix_pages+1]]+([[2,'I AM YOU 360',2]] if youth else []))
 combined.set_metadata({'title':name+' | updated print edition, November 18 2026','author':'Clinical Practice Library','subject':'Full original source guide plus updated regional resources'})
 dest=out/fname;combined.save(dest,garbage=4,deflate=True)
 checks={
  'original_pages':original_pages,'supplement_pages':prefix_pages,'output_pages':len(combined),
  'original_source_sha256':osha,'source_original_links':sum(len(p.get_links()) for p in od),
  'output_links':sum(len(p.get_links()) for p in combined),
  'listings_in_online_supplement':len(rec),
  'new_pdf':str(dest.relative_to(root)),
  'output_sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),
  'printable_letter_pages':all(int(p.rect.width)==612 and int(p.rect.height)==792 for p in combined),
  'original_content_preserved':all(combined[prefix_pages+i].get_text()==od[i].get_text() for i in range(len(od))),
  'all_pages_have_text':all(len(p.get_text().strip())>45 for p in combined),
 }
 assert checks['original_content_preserved'] and checks['printable_letter_pages'] and checks['all_pages_have_text']
 assert checks['output_links']>=checks['source_original_links']+10
 with (out/(which+'-qa.json')).open('w') as f:json.dump(checks,f,indent=2)
 print(which.upper()+'_GUIDE_PRINT_PASS '+json.dumps(checks))
 combined.close();new.close();od.close()
for which in ['family','youth']:make(which)
