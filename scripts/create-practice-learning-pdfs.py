"""Reproducible original printable companions for CPL phases 4–5."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit
OUT=Path('resources/downloads');OUT.mkdir(exist_ok=True)
INK=HexColor('#243c38');TEAL=HexColor('#2d665b');PALE=HexColor('#edf4ef');LINE=HexColor('#9db4aa')
def text(c,x,y,s,size=10,width=510,bold=False):
 c.setFillColor(INK);c.setFont('Helvetica-Bold' if bold else 'Helvetica',size)
 for line in simpleSplit(s,'Helvetica-Bold' if bold else 'Helvetica',size,width):c.drawString(x,y,line);y-=size*1.4
 return y

def base(path,title,subtitle):
 c=canvas.Canvas(str(path),pagesize=(612,792));c.setTitle(title);c.setAuthor('Sophia Korb Cohon, PhD');c.setFillColor(TEAL);c.rect(0,742,612,50,fill=1,stroke=0);c.setFillColor(HexColor('#ffffff'));c.setFont('Helvetica-Bold',19);c.drawString(36,758,title);text(c,36,720,subtitle,10)
 return c

def box(c,x,y,w,h,title,prompt):
 c.setStrokeColor(LINE);c.setFillColor(PALE);c.roundRect(x,y,w,h,7,fill=1,stroke=1);text(c,x+12,y+h-22,title,11,w-24,True);text(c,x+12,y+h-41,prompt,9,w-24)
 c.setStrokeColor(LINE)
 for liney in range(int(y+18),int(y+h-65),20):c.line(x+12,liney,x+w-12,liney)

def footer(c,source):
 text(c,36,56,source,8,540)
 text(c,36,32,'Original CPL teaching aid | Sophia Korb Cohon, PhD | Not a validated measure or independent assessment.',8,540)
 c.save()

c=base(OUT/'functional-support-map.pdf','Functional support map','Describe first. Hold more than one explanation. Agree one support and review the result.')
box(c,36,617,540,75,'Context around the event','Sleep, health/pain, access, setting, relationships, culture, recent changes.')
for x,title,prompt in [(36,'BEFORE','What changed or was asked?'),(223,'OBSERVED ACTION','What could a camera record?'),(410,'AFTER','What followed? Who did what?')]:box(c,x,452,166,143,title,prompt)
text(c,204,518,'>',13,20,True);text(c,391,518,'>',13,20,True)
text(c,36,422,'POSSIBLE EXPLANATIONS - not proven functions',11,540,True)
for x,title,prompt in [(36,'Access / communication','Directions, sensory load, pain?'),(223,'Skill / demand','Instruction, output, initiation?'),(410,'Learning history','Patterns across repeated events?')]:box(c,x,302,166,101,title,prompt)
box(c,36,179,540,104,'ONE AGREED SUPPORT + REVIEW','What will change? Measure participation, learning, distress, support needed, and adverse effects. Who reviews, and when?')
text(c,36,156,'Ask the person what they notice and what would help. Do not provoke unsafe behavior to test function.',9,540)
text(c,36,136,'ABC observations generate hypotheses; qualified teams conduct formal functional assessment.',9,540)
footer(c,'Source orientation: PBIS comprehensive FBA guide (2022), pbis.org. Companion: /resources/therapy/visual-reasoning-toolkit.html')

c=base(OUT/'workforce-practice-sheet.pdf','Supervised practice sheet','Fictional or appropriately de-identified rehearsal only. Education level does not authorize clinical duties.')
box(c,36,610,540,83,'ROLE + AUTHORIZED TASK','My role, training, supervisor, permitted activity, and when to consult.')
box(c,36,474,260,112,'ASK THE CLIENT','One clear question; allow pointing, writing, or another preferred response mode.')
box(c,316,474,260,112,'INSTRUCTION FOR THE WORKER','What to notice, confirm, or do. This is not a question to read to the client.')
box(c,36,338,540,112,'OBSERVATION -> ACTION -> RESPONSE','Separate observed events, attributed reports, and hypotheses. Record only actions that occurred.')
box(c,36,201,540,112,'HANDOFF + SUPERVISION QUESTION','Who receives the concern? What was confirmed? Who owns follow-up, by when? What remains uncertain?')
text(c,36,177,'Rehearsal checks: neutral description / communication access / real choices / scope / closed-loop follow-up.',9,540)
text(c,36,152,'Urgent danger or medical change: activate the local response pathway. Do not wait for routine supervision.',9,540)
text(c,36,130,'A checklist is a practice aid, not evidence of competence. Ask for direct observation and feedback.',9,540)
footer(c,'Source orientation: SAMHSA trauma-informed principles. Companion: /resources/training/workforce-learning-center.html')
