"""Original CPL planning sheets; no restricted assessment content."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
pdfmetrics.registerFont(TTFont("CPLSans","/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("CPLSans-Bold","/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
from reportlab.lib.utils import simpleSplit
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, DictionaryObject
R=Path(__file__).resolve().parents[1];OUT=R/'resources/downloads';OUT.mkdir(exist_ok=True)
W,H=792,612
INK=colors.HexColor('#203b35');TEAL=colors.HexColor('#245e50');BLUE=colors.HexColor('#485f8b');SAGE=colors.HexColor('#e5eee7');SKY=colors.HexColor('#e8edf5');SAND=colors.HexColor('#f3eadc');LINE=colors.HexColor('#a1b5a9')
def text(c,s,x,y,size=10,width=700,bold=False,color=INK,leading=None):
 font='CPLSans-Bold' if bold else 'CPLSans';c.setFont(font,size);c.setFillColor(color)
 for ln in simpleSplit(s,font,size,width):c.drawString(x,y,ln);y-=leading or size*1.3
 return y
def box(c,x,y,w,h,fill=colors.white,stroke=LINE):
 c.setFillColor(fill);c.setStrokeColor(stroke);c.setLineWidth(.8);c.roundRect(x,y,w,h,10,fill=1,stroke=1)
def field(c,name,x,y,w,h):
 c.acroForm.textfield(name=name,tooltip=name.replace('_',' '),x=x,y=y,width=w,height=h,fontName='Helvetica',fontSize=10,borderWidth=.6,borderColor=LINE,fillColor=colors.white,textColor=INK,fieldFlags='multiline',forceBorder=True)
def base(path,title,subtitle):
 c=canvas.Canvas(str(path),pagesize=(W,H));c.setTitle(title);c.setAuthor('Sophia Cohon, PhD');c.setFillColor(TEAL);c.rect(0,H-18,W,18,fill=1,stroke=0)
 text(c,'CPL / CLINICAL REASONING',30,566,9,bold=True,color=TEAL)
 size=25
 while pdfmetrics.stringWidth(title,'CPLSans-Bold',size)>732:size-=.5
 text(c,title,30,533,size,bold=True,width=732);text(c,subtitle,30,510,9,width=730)
 return c
def footer(c,source):
 text(c,'Sophia Cohon, PhD | Clinical Practice Library | Original educational tool; not a validated measure.',30,37,8,width=730)
 text(c,source,30,24,7.5,width=730);c.showPage();c.save()
name='learning-and-access-two-track-plan.pdf';c=base(OUT/name,'Learning and access: two tracks, one plan','Teach the missing skill and support participation together. Use fictional data on shared devices; save clinical data in approved systems.')
text(c,'Meaningful goal / target skill',30,483,10,bold=True);field(c,'goal',211,470,551,24)
# Two parallel lanes: flow conveyed by aligned stages and arrows.
for x,title,fill,col in [(30,'LEARN THE SKILL',SAGE,TEAL),(408,'ACCESS THE TASK',SKY,BLUE)]:
 box(c,x,254,354,200,fill,col);text(c,title,x+16,431,14,bold=True,color=col)
 labels=['Missing concept / strategy','Explicit teaching + practice','Evidence of learning'] if x==30 else ['Demand getting in the way','Format / response / environment support','Evidence of usable access']
 for i,label in enumerate(labels):
  y=405-i*54;text(c,label,x+16,y,9,bold=True,width=320)
  field(c,('learning_' if x==30 else 'access_')+str(i+1),x+16,y-31,322,25)
  if i<2:
   c.setStrokeColor(col);c.setLineWidth(1.5);c.line(x+177,y-34,x+177,y-42);c.line(x+174,y-39,x+177,y-42);c.line(x+180,y-39,x+177,y-42)
box(c,30,172,732,75,SAND,INK);text(c,'REVIEW BOTH TRACKS',44,226,11,bold=True)
text(c,'Task / accuracy / support level / distress or effort / learner perspective',44,210,9,width=700)
field(c,'review_both_tracks',44,182,704,23)
text(c,'Next action + owner',30,151,10,bold=True);field(c,'next_action_owner',30,105,476,34)
text(c,'Review date / reason to revise',526,151,10,bold=True);field(c,'review_date',526,105,236,34)
text(c,'Name the purpose: an accommodation changes access; a modification changes the expected target. A tool may serve different purposes on different tasks. A support trial does not establish diagnosis, eligibility, or placement.',30,86,9,width=732)
footer(c,'Instruction anchors: ies.ed.gov/ncee/wwc/practiceguide/26 and /29. See CPL companion page for scope and source notes.')
name='competing-hypotheses-assessment-map.pdf';c=base(OUT/name,'Assessment: compare explanations before conclusions','A structured reasoning map for clinicians and supervised interns. Record uncertainty, access conditions, and the decision to be informed.')
text(c,'Referral question / decision',30,483,10,bold=True);field(c,'referral_decision',198,470,564,24)
# Matrix with restrained column shading, wide writable cells.
xs=[30,199,392,580];widths=[169,193,188,182]
heads=['POSSIBLE EXPLANATION','SUPPORTING EVIDENCE','CONTRARY / MISSING','NEXT DISCRIMINATING STEP']
for x,w,h in zip(xs,widths,heads):
 c.setFillColor(SAGE);c.rect(x,423,w,29,fill=1,stroke=0);text(c,h,x+7,434,8,bold=True,width=w-14)
for row in range(3):
 y=352-row*68
 for col,(x,w) in enumerate(zip(xs,widths)):field(c,f'hypothesis_{row+1}_{col+1}',x+3,y,w-6,63)
text(c,'Access + safety conditions',30,199,10,bold=True);field(c,'access_safety',30,152,354,35)
text(c,'Immediate support + preserved goal',408,199,10,bold=True);field(c,'support_goal',408,152,354,35)
text(c,'Functional outcome + support level + burden',30,133,10,bold=True);field(c,'functional_outcome',30,87,476,34)
text(c,'Review date / escalation route',526,133,10,bold=True);field(c,'review_escalation',526,87,236,34)
text(c,'Use the smallest adequate multimethod assessment. A support response informs access; it does not prove etiology. Separate standardized findings from adapted observations. Acute neurological or safety change needs an appropriate urgent route.',30,68,8.5,width=732)
footer(c,'Assessment anchor: apa.org/about/policy/guidelines-psychological-assessment-evaluation.pdf. See CPL casebook for source notes.')
for name,expected in [('learning-and-access-two-track-plan.pdf',10),('competing-hypotheses-assessment-map.pdf',17)]:
 # Embed the same ASCII-capable font in form resources for consistent viewer rendering.
 source=PdfReader(OUT/name);writer=PdfWriter();writer.clone_document_from_reader(source)
 fonts=writer.pages[0]['/Resources']['/Font']
 embedded=next(ref for ref in fonts.values() if str(ref.get_object().get('/BaseFont','')).endswith('+DejaVuSans'))
 field_font=DictionaryObject(dict(embedded.get_object()))
 field_font[NameObject('/Encoding')]=NameObject('/WinAnsiEncoding')
 field_font.pop(NameObject('/ToUnicode'),None)
 embedded=writer._add_object(field_font)
 writer.root_object['/AcroForm']['/DR']['/Font'][NameObject('/Helv')]=embedded
 for p in writer.pages:
  for a in p.get('/Annots',[]):
   widget=a.get_object()
   if widget.get('/Subtype')=='/Widget':
    widget['/AP']['/N'].get_object()['/Resources']['/Font'][NameObject('/Helv')]=embedded
 writer.write(OUT/name)
 r=PdfReader(OUT/name);fields=r.get_fields();print(name,len(r.pages),'page;',len(fields),'fields')
 assert len(r.pages)==1
 # All fields must be in the canonical tree and page widgets, with valid bounds.
 widgets=[a.get_object() for p in r.pages for a in p.get('/Annots',[]) if a.get_object().get('/Subtype')=='/Widget']
 assert len(widgets)==len(fields)
 for f in widgets:
  x1,y1,x2,y2=map(float,f['/Rect']);assert 0<=x1<x2<=W and 0<=y1<y2<=H;assert f.get('/AP',{}).get('/N')
 assert len(fields)==expected
 (R/'output/pdf'/name).write_bytes((OUT/name).read_bytes())
