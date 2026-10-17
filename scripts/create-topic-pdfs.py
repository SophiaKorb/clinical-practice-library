"""Original one-page companions; excluded from the meaningful resource count."""
from pathlib import Path
import runpy,argparse
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit
R=Path(__file__).resolve().parents[1];p=argparse.ArgumentParser();p.add_argument('--waves',type=int,default=1);a=p.parse_args();data=runpy.run_path(str(R/'scripts/expansion-topics.py'))
def plain(s):return s.replace('→','->').replace('↔','<->').replace('’',"'").replace('—','-').replace('–','-')
def write(c,x,y,s,size=10,width=540,bold=False):
 font='Helvetica-Bold' if bold else 'Helvetica';c.setFont(font,size);c.setFillColor(HexColor('#203b35'))
 for line in simpleSplit(plain(s),font,size,width):c.drawString(x,y,line);y-=size*1.35
 return y
for t in data['TOPICS'][:a.waves*5]:
 out=R/'resources/downloads'/('topic-'+t['slug']+'.pdf');c=canvas.Canvas(str(out),pagesize=(612,792),invariant=1);c.setTitle(t['title']+' - support worksheet');c.setAuthor('Sophia Korb Cohon, PhD')
 y=write(c,36,756,t['title'],17,540,True);y=write(c,36,y-10,'Original support worksheet | '+t['age']+' | Reviewed 2026-10-10',9)
 y=write(c,36,y-8,'Use fictional or appropriately de-identified notes. Write, draw, dictate or point. Not a validated measure, diagnostic test or crisis service.',9)
 # These source concepts are not necessarily sequential; do not portray a pathway as established.
 if t['slug']!='learning-instruction-access':
  y=write(c,36,y-4,'Concepts below are not a required sequence or clinical pathway.',8,540,True)-5
 for i,(title,desc) in enumerate(t['diagram']):
  if t['slug']=='learning-instruction-access' and i==3:continue
  if t['slug']=='learning-instruction-access' and i==2:
   write(c,36,y-9,'PARALLEL TRACKS - instruction and access happen together',8,540,True);y-=20
   for j,(name,description) in enumerate(t['diagram'][2:4]):
    x=36+j*280;c.setFillColor(HexColor('#e8eaf4' if j==0 else '#f3e3dc'));c.roundRect(x,y-43,260,40,4,fill=1,stroke=0);write(c,x+9,y-16,name+': '+description,9,240,True)
   y-=52;continue
  label=plain(title+': '+desc)
  lines=simpleSplit(label,'Helvetica-Bold',9,520)
  box_height=max(32,12+len(lines)*12.15)
  c.setFillColor(HexColor(['#e4eee7','#f4ebd9','#e8eaf4','#f3e3dc','#e1eef0'][i]));c.roundRect(36,y-box_height-4,540,box_height,4,fill=1,stroke=0)
  write(c,45,y-17,label,9,520,True)
  y-=box_height+10
 y-=8
 for i,prompt in enumerate(t['fields']):
  y=write(c,36,y,prompt,10,540,True)
  c.setStrokeColor(HexColor('#849a90'));c.line(36,y-15,576,y-15);c.line(36,y-35,576,y-35);y-=54
 y=write(c,36,y-3,'Next step: who will do what, by when, and how will we review helpfulness or harm?',9,540,True);c.setStrokeColor(HexColor('#849a90'));c.line(36,y-16,576,y-16)
 safety_y=min(y-36,160)
 end=write(c,36,safety_y,t['safety'],8,540)
 if end<63:raise ValueError('Safety/footer collision: '+t['slug'])
 write(c,36,43,'Sources, clinician instructions and limits: clinical-practice-library-git-cpl-2-colorfu-f5f645-cohon-family.vercel.app',7)
 write(c,36,32,'/resources/clinical-topics/'+t['slug']+'/support-map.html',7)
 write(c,36,20,'CPL | Sophia Korb Cohon, PhD | Original unvalidated teaching aid | Qualified clinical review pending',7)
 c.save()
print(len(data['TOPICS'][:a.waves*5]),'PDF companions created')
