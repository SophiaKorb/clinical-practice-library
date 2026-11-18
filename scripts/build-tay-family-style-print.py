#!/usr/bin/env python3
"""Design-led reflow of published 2026 CPL TAY guide.
Reflow source-fact content, never alter published original pages. No client data.
"""
from pathlib import Path
from io import BytesIO
from xml.sax.saxutils import escape
from collections import OrderedDict
import fitz, json, re, hashlib
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (SimpleDocTemplate,Paragraph,Table,TableStyle,Spacer,PageBreak,
                                 KeepTogether,HRFlowable,CondPageBreak,Flowable,NextPageTemplate)

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'qa-artifacts/community-tay-redesign'
OUT.mkdir(parents=True,exist_ok=True)
INPUT=ROOT/'resources/community/original-pdfs/Southern_Arizona_Youth_Transition_Resources_2026.pdf'
DEST=OUT/'CPL_TAY_Community_Guide_Redesigned_2026.pdf'
DATA=OUT/'tay-source-extract.json'

BLUE=colors.HexColor('#0A6571')
INK=colors.HexColor('#233E49')
DARK=colors.HexColor('#193F47')
MUTED=colors.HexColor('#586F74')
LINE=colors.HexColor('#CDDCD9')
SOFT=colors.HexColor('#EFF5F1')
WARM=colors.HexColor('#FBF8F1')
WHITE=colors.white
basefont='/usr/share/fonts/truetype/lato/'
pdfmetrics.registerFont(TTFont('Lato',basefont+'Lato-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Lato-Bold',basefont+'Lato-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Lato-Semi',basefont+'Lato-Semibold.ttf'))
pdfmetrics.registerFont(TTFont('Lato-Italic',basefont+'Lato-Italic.ttf'))
pdfmetrics.registerFont(TTFont('Serif','/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'))
pdfmetrics.registerFontFamily('Lato',normal='Lato',bold='Lato-Bold',italic='Lato-Italic')
styles={
'kicker':ParagraphStyle('kicker',fontName='Lato-Bold',fontSize=8.6,leading=12,textColor=BLUE,spaceAfter=7),
'cover':ParagraphStyle('cover',fontName='Serif',fontSize=31.5,leading=34,textColor=DARK,spaceAfter=13),
'hero':ParagraphStyle('hero',fontName='Lato',fontSize=12,leading=18.1,textColor=INK,spaceAfter=13),
'section':ParagraphStyle('section',fontName='Lato-Bold',fontSize=17,leading=23,textColor=BLUE,spaceAfter=12,spaceBefore=9,keepWithNext=1),
'sub':ParagraphStyle('sub',fontName='Lato-Bold',fontSize=11.5,leading=15.6,textColor=INK,spaceAfter=3,spaceBefore=13,keepWithNext=1),
'meta':ParagraphStyle('meta',fontName='Lato-Bold',fontSize=9,leading=13.2,textColor=MUTED,spaceAfter=6,keepWithNext=1),
'body':ParagraphStyle('body',fontName='Lato',fontSize=10.1,leading=15.4,textColor=INK,spaceAfter=5),
'url':ParagraphStyle('url',fontName='Lato',fontSize=9.25,leading=14.0,textColor=BLUE,spaceAfter=7,splitLongWords=1),
'fine':ParagraphStyle('fine',fontName='Lato',fontSize=8.8,leading=13.3,textColor=MUTED,spaceAfter=6),
'quick':ParagraphStyle('quick',fontName='Lato',fontSize=10.2,leading=15.4,textColor=INK,spaceAfter=0),
'quickstrong':ParagraphStyle('quickstrong',fontName='Lato-Bold',fontSize=10.1,leading=14.7,textColor=DARK),
'dir':ParagraphStyle('dir',fontName='Lato',fontSize=9.0,leading=13.2,textColor=INK,spaceAfter=1,splitLongWords=1),
}

def P(t,style='body'):return Paragraph(t,styles[style])
def H(t):return escape(str(t), {'"':'&quot;'})
def link(u):return '<link href="'+H(u)+'"><u>'+H(u)+'</u></link>'
def flat(t):
 t=re.sub(r'\s+',' ',t or '').strip()
 return re.sub(r'(?<=\w)- (?=\w)', '-', t)
def note(line):return P(line,'fine')

def deco(c,d,offset=0):
 c.saveState()
 absolute_page=d.page+offset
 if absolute_page==1:
  c.setFillColor(DARK);c.rect(0,letter[1]-10,letter[0],10,stroke=0,fill=1)
 else:
  c.setStrokeColor(LINE);c.setLineWidth(.75);c.line(54,letter[1]-45,558,letter[1]-45)
  c.setFillColor(MUTED);c.setFont('Lato-Semi',7.7)
  c.drawString(54,letter[1]-34,'CPL  /  SOUTHERN ARIZONA  /  YOUTH & TRANSITION-AGE')
 c.setStrokeColor(LINE);c.line(54,46,558,46)
 c.setFillColor(MUTED);c.setFont('Lato',8.2)
 c.drawString(54,31,'Community resource navigator  |  November 2026')
 c.drawRightString(558,31,f'Page {absolute_page}')
 c.restoreState()

records=json.loads(DATA.read_text())
assert len(records)==31 and len({x['name'] for x in records})==31
for r in records:
 if not r.get('url'):
  # Linked primary AZYP website is printed in the published source. It is a
  # referral/verification destination, not evidence of current program enrollment.
  assert 'Arizona Youth Partnership' in r['name']
  r['url']='https://www.azyp.org/azyp-programs/family-parenting-support'
 if r['name'].startswith('AHCCCS Young Adult Transitional Insurance'):
  r['preface']=r['preface'].replace('ages 18–26','ages 18 to under 26')
 r['What it does']=flat(r['What it does'])
 r['First step']=flat(r['First step'])
 r['Watch for']=flat(r['Watch for'])
 r['preface']=flat(r['preface'])
 if r['name'].startswith('Pima “You Are Not Alone”'):
  r['Watch for'] += ' The online guide cautions that current session limits, intake and program capacity have not been independently confirmed.'
 assert all(r.get(k) for k in ['name','preface','What it does','First step','Watch for','url'])

# Source page groupings exactly as printed in the approved October source.
GROUPS=[
 ('01', 'School, training & accommodations', [4,5], 'Diploma decisions, adult education, college access and transition supports.'),
 ('02', 'Work & financial navigation', [6,7], 'Work preparation, disability employment, benefits and earnings.'),
 ('03', 'Independence & connection', [8], 'Daily-life choices, disability community, peer connection and savings.'),
 ('04', 'Housing, safety & belonging', [9,10], 'Housing needs, food, youth-centered spaces and community access.'),
 ('05', 'Health & foster-care transitions', [10,11], 'Mental-health navigation, insurance, foster-care and parenting supports.'),
]
sections=[]
for num,title,pages,desc in GROUPS:
 sel=[]
 for r in sorted(records,key=lambda r:(r['page'],r['name'])):
  if r['page'] not in pages:continue
  # Separate original source page 10 into community (first 2 original listings) vs health (other 2).
  if r['page']==10:
   health=r['name'].startswith(('AHCCCS —','Teen Lifeline'))
   if (num=='04' and health) or (num=='05' and not health):continue
  sel.append(r)
 sections.append((num,title,desc,sel))
assert sum(len(a[3]) for a in sections)==31,[(a[1],len(a[3])) for a in sections]

local=[
('Eon Youth Lounge','SAAF • Ages 13–24 • 526 N. Fourth Avenue, Tucson','LGBTQ+ and allied youth peer connection, art, school GSA outreach and some basic needs. Confirm current programming and schedule.','https://saaf.org/services/thornhill-lopez-center-on-4th/eon-youth-lounge-at-thornhill-lopez-center-on-4th/'),
('Pride Student Space','University of Arizona • Campus space','LGBTQ+ community space and campus programming. Nonstudent admission and event access vary; check each event.','https://ccc.arizona.edu/pride-student-space'),
('Fluxx Productions','Tucson • Event-based','Queer arts, social events, advocacy and mutual aid. Check venue, ages, admission and dates.','https://fluxxproductions.org/'),
('STARS','Southern Arizona • Community organization','Transgender and gender-nonconforming support, events, moderated online community and local navigation.','https://starstogether.org/'),
('STARS name and gender-marker guide','Community reference, not controlling law','Contains explanatory materials and local forms; confirm current filing requirements with the appropriate court and agencies.','https://starstogether.org/name-gender-change/'),
('STARS records-update checklist','Community reference','List of organizations and records people may choose to update after legal name changes. Verify each agency’s procedures.','https://starstogether.org/name-updates/'),
('Fluxx name and gender-marker clinic','Pima County • Events vary','Assisted paperwork clinics and periodic support; next dates, legal advice and applicable rules require confirmation.','https://fluxxproductions.org/name-change-clinic'),
('Fluxx Community Health Project','Tucson • Program-specific','Community wellness, clothing, housing-related mutual aid and sexual-health education; ask about currently available services.','https://fluxxproductions.org/community-health-project'),
]
legal=[
('Pima County Superior Court — name changes','https://www.sc.pima.gov/how-do-i','The county website and an older official packet disagree on walk-in cutoff hours. Verify directly.'),
('Arizona Judicial Branch — name-change forms','https://www.azcourts.gov/selfservicecenter/Forms/Name-Change','Check the correct current court, filing procedure, local fees and eligibility.'),
('Social Security Administration — change name','https://www.ssa.gov/life-events/change-name','Consult SSA rather than an older community handout.'),
('Arizona MVD — change name','https://azdot.gov/mvd/services/driver-license-ID/change-your-name','Check state ID procedures and evidence requirements.'),
('U.S. Department of State — passport sex markers','https://travel.state.gov/en/passports/apply/unique-needs/sex-markers.html','Policies have changed; consult this current agency page rather than historical litigation summaries.'),
('Pima County Superior Court — contact','https://www.sc.pima.gov/contact/','Confirm disputed hours, instructions, costs and intake with the agency.'),
]

story=[]
# cover - restrained family-collection aesthetic
story += [Spacer(1,30),P('CLINICAL PRACTICE LIBRARY  /  SOUTHERN ARIZONA','kicker'),
          P('Youth &amp; Transition-Age<br/>Community Resource Guide','cover'),
          P('Education, work, housing, disability access, community and healthcare — organized around what a young person wants help with.','hero'),Spacer(1,14)]
intro=Table([[P('<b>WHO IT’S FOR</b><br/>Generally ages 14–24, depending on the program. Some qualifying former-foster-care coverage continues until, but not including, age 26.','quick'),
              P('<b>HOW TO USE IT</b><br/>Find a need, read the first step, check eligibility and use the full printed website address.','quick')]],colWidths=[252,252])
intro.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),SOFT),('BOX',(0,0),(-1,-1),.65,LINE),('LINEBEFORE',(1,0),(1,0),.7,LINE),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),13),('RIGHTPADDING',(0,0),(-1,-1),13),('TOPPADDING',(0,0),(-1,-1),15),('BOTTOMPADDING',(0,0),(-1,-1),15)]))
story += [intro,Spacer(1,24),P('Where to begin','section')]
starts=[('School or college','01  School, training & accommodations'),('A job or vocational support','02  Work & financial navigation'),('Friends, self-direction or daily life','03  Independence & connection'),('Housing, food or a welcoming space','04  Housing, safety & belonging'),('Mental health, coverage or foster care','05  Health & foster-care transitions'),('Affirming identity and legal-document navigation','06  Newer Southern Arizona resources')]
for a,b in starts:
 t=Table([[P(H(a),'quickstrong'),P(H(b),'quick')]],colWidths=[241,263]);t.setStyle(TableStyle([('LINEBELOW',(0,0),(-1,-1),.6,LINE),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('VALIGN',(0,0),(-1,-1),'TOP')]));story.append(t)
story += [Spacer(1,11),P('The young person chooses their goals and who participates. Before any referral, confirm age, school status, fees or coverage, accessibility, transportation, current openings and consent. This is a dated navigation guide, not a guarantee of eligibility.','fine'),P('<b>Current online edition:</b> '+link('https://clinical-practice-library.vercel.app/resources/community/transition-age-guide.html'),'url'),PageBreak()]

# quick youth-led referral options
story += [P('AN ACCESSIBLE START','kicker'),P('Find help without losing choice','section'),
P('Ask what the person would like to change — rather than deciding what “independence” should look like. Offer choices of calling together, emailing, making a referral with consent, or keeping the information for later.'),
P('<b>School transition:</b> Ask a school IEP or transition team before withdrawal, GED/HSE testing or changes to graduation plans. Remaining eligibility may change.'),
P('<b>Disability services:</b> Arizona VR and Pre-ETS do not have identical eligibility; services may depend on enrolled-student status, age, disability documentation and current service authorizations.'),
P('<b>Housing and coverage:</b> Youth On Their Own, housing access, voluntary extended foster care and YATI health insurance are separate programs with distinct criteria.'),
P('<b>Safety:</b> For urgent mental-health or suicide crises in the United States, 988 is available. For immediate danger call 911. The Teen Lifeline hours and peer/text options differ from telephone coverage; verify before referring.'),Spacer(1,14),
P('Questions worth asking','section')]
for phrase in ['What is your most important goal right now?','Would you like information, help contacting someone, or time to decide?','Are there school, eligibility, transportation, communication or cost barriers?','Who, if anyone, would you like included?','What is the next step, and who will take it?']:
 story += [P('• '+H(phrase)),Spacer(1,5)]
story += [Spacer(1,13),P('Resource information is current only to the cited edition. Newer items are identified separately; original source records are reproduced unchanged later in this PDF.','fine'),PageBreak()]

for num,title,desc,items in sections:
 story += [P('ORIGINAL SOURCE COLLECTION  /  OCTOBER 2026','kicker'),P(H(num+'  '+title),'section'),P(H(desc),'body'),Spacer(1,5)]
 for n,r in enumerate(items):
  name=H(r['name']);meta=H(r['preface'])
  story += [CondPageBreak(122),P(name,'sub'),P(meta,'meta'),
            P(H(r['What it does']),'body'),
            P('<b>First step: </b>'+H(r['First step']),'body'),
            P('<b>Check before referring: </b>'+H(r['Watch for']),'body'),
            P('<b>Website: </b>'+link(r['url']),'url'),
            HRFlowable(width='100%',color=LINE,thickness=.5,spaceBefore=5,spaceAfter=10)]
 story += [Spacer(1,8)]

story += [CondPageBreak(240),P('06  NEWER LOCAL RESOURCES / NOVEMBER 2026','kicker'),P('Community, belonging & practical help','section'),
 P('The following listings were added after the October source guide. They include community organizations and reference materials, not automatic referrals. Confirm scheduling, age, eligibility, accessibility and the young person’s privacy choices.'),Spacer(1,8)]
for i,(name,meta,desc,url) in enumerate(local,1):
 story += [CondPageBreak(100),P(f'{i:02d}  '+H(name),'sub'),P(H(meta),'meta'),P(H(desc),'body'),P('<b>Website: </b>'+link(url),'url'),HRFlowable(width='100%',color=LINE,thickness=.5,spaceBefore=5,spaceAfter=8)]

story += [CondPageBreak(275),P('ADDITIONAL YOUTH / FAMILY SUPPORT','kicker'),P('I AM YOU 360','section'),
P('A Tucson nonprofit describing multiple supports, including youth and family hygiene assistance, community activities, and a separate small-home housing experience. Ask which programs are currently operating and who qualifies.'),
P('Hygiene Empowerment Program','sub'),P('Personalized hygiene products; the provider describes a replenishment cycle. Confirm enrollment, supplies and pickup arrangements.'),
P('Small Home Experience','sub'),P('Housing-related support for qualifying young adults, with historical county information describing an 18–22 group. This is not evidence of current vacancies, costs or admission criteria.'),
P('Community building and practical support','sub'),P('Peer relationships, mentorship and life-skills opportunities described by the provider; services and group schedules vary.'),
P('Two different places','sub'),P('<b>Office / hygiene pickup:</b> 1131 S. Van Buren Avenue, Tucson, AZ 85711.'),P('<b>Small Home Experience:</b> 1101 S. Van Buren Avenue, Tucson, AZ 85711. Confirm both before visiting.'),
P('<b>Provider:</b> '+link('https://iamyou360.org/'),'url'),P('<b>Detailed CPL source notes:</b> '+link('https://clinical-practice-library.vercel.app/resources/community/iamyou360.html'),'url'),
Spacer(1,20),P('How to check whether it fits','section'),
P('Ask about current capacity, any foster-care or housing criteria, youth choice and consent, accessibility, transportation, and whether the specific service is actually available.'),Spacer(1,15),CondPageBreak(270)]

story += [P('AGENCY AND LEGAL REFERENCE / NOVEMBER 2026','kicker'),P('Document changes: check the agency','section'),
P('STARS and Fluxx offer community navigation, but some documents cite older fees, court practices or passport litigation. Name changes and sex-marker procedures differ, and published government sources sometimes conflict. Use the agency’s current information; seek qualified legal advice for individual decisions.'),P('<b>Privacy and self-direction:</b> Identity-related support does not automatically authorize disclosure to family, school, an employer or another provider. Ask the young person who they want involved and follow applicable consent and confidentiality rules.'),Spacer(1,11)]
for name,url,note_text in legal:
 story += [CondPageBreak(75),P(H(name),'sub'),P(H(note_text),'fine'),P(link(url),'url'),Spacer(1,5)]
story += [PageBreak()]

story += [P('TAKE THIS PAGE TO A CONVERSATION','kicker'),P('My next connection','section'),P('This worksheet is optional. Write the plan collaboratively; protect completed pages as private information.'),Spacer(1,13)]
for heading in ['What I want help with','A provider or group I might contact','What I want to ask (age, cost, access, privacy)','How I prefer to make contact and who can help','First step and when I want to follow up','Backup option if the first choice does not fit']:
 story += [P(H(heading),'sub'),HRFlowable(width='100%',thickness=.7,color=LINE),Spacer(1,38)]
story += [Spacer(1,5),P('The original 13-page October 2026 guide follows as a complete historical source, including all its original links and references.','fine')]

buffer=BytesIO()
doc=SimpleDocTemplate(buffer,pagesize=letter,leftMargin=54,rightMargin=54,topMargin=62,bottomMargin=59,title='CPL Youth and Transition-Age Community Guide / Redesigned 2026',author='Clinical Practice Library')
doc.build(story,onFirstPage=deco,onLaterPages=deco)
reflow=fitz.open(stream=buffer.getvalue(),filetype='pdf')
old=fitz.open(INPUT)
# Embed all 13 approved original pages, unaltered, as the authoritative source appendix.
archive=fitz.open();archive.insert_pdf(old,links=True)
assert len(archive)==13
full=fitz.open();full.insert_pdf(reflow,links=True);full.insert_pdf(archive,links=True)
for i in range(len(archive)):
 assert full[len(reflow)+i].get_text()==archive[i].get_text()

# Full URL index across new pages + preserved source pages. Printed for noninteractive readers.
refs=OrderedDict()
for i,page in enumerate(full):
 for lk in page.get_links():
  u=lk.get('uri','')
  if not u.startswith(('http://','https://')):continue
  if u not in refs:refs[u]={'first':i+1,'pages':[]}
  if i+1 not in refs[u]['pages']:refs[u]['pages'].append(i+1)

ix=[P('PRINT REFERENCE','kicker'),P('Full website addresses','section'),P('Every web address referenced in this guide is printed here in full. A page number refers to the preceding guide; websites and intake details may change.'),Spacer(1,8)]
for u,info in refs.items():
 host=re.sub(r'^www\.','',re.sub('^https?://','',u)).split('/')[0]
 ix += [KeepTogether([P('<b>p. '+str(info['first'])+'  /  '+H(host)+'</b>','fine'),P(link(u),'dir')]),Spacer(1,1)]
stream2=BytesIO()
doc2=SimpleDocTemplate(stream2,pagesize=letter,leftMargin=54,rightMargin=54,topMargin=59,bottomMargin=57,title='Full web addresses')
doc2.build(ix,onFirstPage=lambda c,d:deco(c,d,offset=len(reflow)+13),onLaterPages=lambda c,d:deco(c,d,offset=len(reflow)+13))
appendix=fitz.open(stream=stream2.getvalue(),filetype='pdf')
full.insert_pdf(appendix,links=True)
full.set_metadata({'title':'CPL | Youth and Transition-Age Community Resource Guide, redesigned November 2026','author':'Clinical Practice Library','subject':'Designed reflow of 31 published original programs + newer community resources, original source edition, and full web URLs'})
# PDF bookmarks for major sections, topic indexing auto-derived from reflow text.
toc=[[1,'Begin here',1]]
for num,title,desc,items in sections:
 target=num+' '+title
 pages=[i+1 for i,p in enumerate(reflow) if i>=2 and target in ' '.join(p.get_text().split())]
 if pages:toc.append([1,title,pages[0]])
toc += [[1,'Additional local community resources',next(i+1 for i,p in enumerate(reflow) if 'Community, belonging & practical help' in p.get_text())],
[1,'I AM YOU 360',next(i+1 for i,p in enumerate(reflow) if 'I AM YOU 360' in p.get_text())],
[1,'Agency legal-document references',next(i+1 for i,p in enumerate(reflow) if 'Document changes: check the agency' in p.get_text())],
[1,'Referral planning worksheet',next(i+1 for i,p in enumerate(reflow) if 'My next connection' in p.get_text())],
[1,'Complete original October source edition',len(reflow)+1],
[1,'All printed website URLs',len(reflow)+len(archive)+1]]
full.set_toc(toc)
full.save(DEST,garbage=4,deflate=True)
# QA source preservation, URL link text, page geometry, and page boundaries.
check=fitz.open(DEST)
assert len(check)==len(reflow)+13+len(appendix)
assert all(check[len(reflow)+i].get_text()==archive[i].get_text() for i in range(13))
assert all(int(p.rect.width)==612 and int(p.rect.height)==792 for p in check)
assert len({r['name'] for r in records})==31 and all(r['name'] in '\n'.join(p.get_text() for p in check[:len(reflow)]) for r in records)
for url in refs:
 text=''.join(p.get_text() for p in check[len(reflow)+13:]).replace(' ','').replace('\n','')
 assert url in text,(url,'missing printed full URL')
# page geometry: check new design+index only, original PDF is preserved as is.
geom_issues=[]
for n,p in enumerate(check):
 if len(reflow)<=n<len(reflow)+13:continue
 for b in p.get_text('blocks'):
  if b[6]!=0:continue
  x0,y0,x1,y1=b[:4]
  if x0<23 or y0<12 or x1>590 or y1>779:
   geom_issues.append((n+1,tuple(round(x,1) for x in b[:4]),str(b[4])[:80]))
assert not geom_issues,geom_issues[:10]
summary={'output':str(DEST),'pages':len(check),'redesigned_pages':len(reflow),'preserved_original_pages':13,'printed_url_pages':len(appendix),'original_entries':len(records),'new_local_entries':len(local),'distinct_printed_external_urls':len(refs),'website_link_annotations':sum(1 for p in check for lk in p.get_links() if lk.get('uri','').startswith('http')),'original_archive_text_equal':True,'all_urls_printed_full':True,'letter_size_and_geometry_pass':True,'sha256':hashlib.sha256(DEST.read_bytes()).hexdigest()}
(OUT/'CPL_TAY_Redesign_QA.json').write_text(json.dumps(summary,indent=2))
print(json.dumps(summary,indent=2))