"""Generate REVIEW-ONLY spatially faithful PDF companion candidates from current topic sources.
Do not overwrite published resources/downloads PDFs. Clinical/editorial sign-off is separate.
"""
import argparse,hashlib,html,json,re,runpy
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit

ROOT=Path(__file__).resolve().parents[1]
DATA=runpy.run_path(str(ROOT/'scripts/expansion-topics.py'))
MODES={'return-loop','loop-choice','access-tracks','abc-tracks','safety-gate',
       'parallel-assess','context-budget','attention-split','two-track'}
INK='#193c3c'
LINES='#47645e'
FILL=['#e9f1eb','#f8eedb','#e9edf8','#f8e8e0','#e4f0f1']
def mode_for(slug):
    source=ROOT/'resources/clinical-topics'/slug/'support-map.html'
    page=source.read_text(encoding='utf-8')
    hit=re.search(r'<ol class="clinical-map(?: ([^"]+))?"',page)
    if not hit:raise ValueError('Missing canonical HTML map: '+slug)
    mode=(hit.group(1) or 'sequence').strip()
    if mode not in MODES and mode!='sequence':raise ValueError((slug,mode))
    return mode,hashlib.sha256(page.encode()).hexdigest()

def words(s):
    return s.replace('→',' to ').replace('↔',' and ').replace('’',"'").replace('—','-').replace('–','-').replace('•',';').replace('…','...')

def line_text(c,x,y,text,size=9,bold=False,color=INK):
    c.setFillColor(HexColor(color));c.setFont('Helvetica-Bold' if bold else 'Helvetica',size)
    c.drawString(x,y,words(text))

def wrapped(c,text,x,y,width,size=8.5,leading=11,max_lines=12,bold=False):
    font='Helvetica-Bold' if bold else 'Helvetica'
    lines=simpleSplit(words(text),font,size,width)
    if len(lines)>max_lines:raise ValueError('Text would clip: '+repr(text[:90])+' lines='+str(len(lines)))
    c.setFillColor(HexColor(INK));c.setFont(font,size)
    for line in lines:c.drawString(x,y,line);y-=leading
    return y

def box(c,item,x,top,w,h=62,fill=0,kind='card',border=LINES):
    title,desc=item
    c.setFillColor(HexColor(FILL[fill%len(FILL)]));c.setStrokeColor(HexColor(border))
    c.setLineWidth(1.5 if kind!='card' else 1)
    c.roundRect(x,top-h,w,h,8,fill=1,stroke=1)
    # legible structure: an emphasized title and a separate explanatory description
    title_size=8.3 if w>=200 else 7.8
    lines=simpleSplit(words(title),'Helvetica-Bold',title_size,w-20)
    if len(lines)>2: title_size=7.2;lines=simpleSplit(words(title),'Helvetica-Bold',title_size,w-20)
    if len(lines)>2:raise ValueError('Card title too long: '+title)
    cursor=top-15
    for line in lines:line_text(c,x+10,cursor,line,title_size,True);cursor-=10
    desc_size=7.6 if w>=165 else 7.15
    wrapped(c,desc,x+10,cursor-2,w-20,size=desc_size,leading=9,max_lines=int((cursor-(top-h+6)-2)/9)+1)

def link(c,x1,y1,x2,y2,label=None):
    c.setStrokeColor(HexColor(LINES));c.setLineWidth(1.4)
    c.line(x1,y1,x2,y2)
    # simple chevron arrowhead; no color-only meaning
    import math
    angle=math.atan2(y2-y1,x2-x1)
    d=7
    for a in (angle+2.7,angle-2.7):c.line(x2,y2,x2+d*math.cos(a),y2+d*math.sin(a))
    if label:line_text(c,min(x1,x2)+5,min(y1,y2)+5,label,7.1,True)

def small_label(c,s,x,y):line_text(c,x,y,s,7.1,True)

def diagram(c,t,mode):
    d=t['diagram'];L=36;W=540
    small_label(c,'VISUAL RELATIONSHIP: '+mode.replace('-',' ').upper(),L,671)
    if mode=='safety-gate':
        # One adult responsibility across BOTH outcomes, then genuinely distinct protective/voluntary pathways.
        box(c,('Adult responsibility - always',
               'Ensure safety, provide support, set clear expectations, and guide next steps.'),
            L,658,W,58,0,'gate')
        c.setStrokeColor(HexColor(LINES));c.setLineWidth(1.6)
        c.line(306,600,306,592);c.line(170,592,442,592)
        link(c,170,592,170,582);link(c,442,592,442,582)
        box(c,('Unsafe or coercive',
               'Harm, threats, intimidation, sexual harm, coercion, or inability to refuse safely.'),
            L,579,257,69,1,'branch',border='#90513f')
        box(c,('Safe and voluntary',
               'No current risk or coercion; both children may decline repair without penalty.'),
            L+283,579,257,69,2,'branch',border='#366455')
        def actions_panel(x,items,tint):
            top=503;h=122
            c.setFillColor(HexColor(tint));c.setStrokeColor(HexColor(LINES))
            c.roundRect(x,top-h,257,h,7,fill=1,stroke=1)
            for i,(name,desc) in enumerate(items):
                baseline=top-15-i*39
                line_text(c,x+10,baseline,name,8.3,True)
                wrapped(c,desc,x+10,baseline-12,237,size=7.5,leading=9,max_lines=2)
        actions_panel(L,[
            ('1. Protect','Stop the harm; ensure immediate safety.'),
            ('2. Assess risk','Plan safety, supervision and reporting duties.'),
            ('3. Follow safeguarding procedures','Coordinate services. No forced repair or apology.')
        ],'#f9eeea')
        actions_panel(L+283,[
            ('1. Understand each perspective','Listen without presuming equal responsibility.'),
            ('2. Offer coaching or repair','Support accountability and amends by choice.'),
            ('3. Do not require forgiveness','A child may freely decline without penalty.')
        ],'#eaf2ee')
        link(c,165,381,165,373);link(c,447,381,447,373)
        box(c,('Ongoing support for all siblings',
               'Monitor wellbeing and safety; reinforce expectations and healthier ways to interact.'),
            L,368,W,52,4,'gate')
    elif mode=='parallel-assess':
        box(c,d[0],L,658,W,45,0)
        link(c,306,613,167,596);link(c,306,613,445,596)
        small_label(c,'PARALLEL, NOT A WAITING SEQUENCE',183,395)
        box(c,d[1],L,583,257,72,1,'branch',border='#885337')
        box(c,d[2],L+283,583,257,72,2,'branch')
        link(c,165,511,306,494);link(c,447,511,306,494)
        box(c,d[3],L,489,W,42,3)
        link(c,306,447,306,435)
        box(c,d[4],L,430,W,38,4)
    elif mode in ('access-tracks','abc-tracks'):
        small_label(c,'CONCURRENT ACCESS CHANNELS' if mode=='access-tracks' else 'DESCRIBE OBSERVATIONS FIRST',L,651)
        for i,item in enumerate(d[:3]):box(c,item,L+i*184,640,172,91,i,'branch')
        for i in range(3):link(c,L+86+i*184,549,306,526)
        small_label(c,'VERIFY & PARTICIPATE' if mode=='access-tracks' else 'POSSIBLE HYPOTHESES / SAFER SUPPORT',L,519)
        box(c,d[3],L,504,257,91,3,'branch')
        box(c,d[4],L+283,504,257,91,4,'branch')
    elif mode in ('return-loop','loop-choice'):
        for i,item in enumerate(d[:4]):
            # 1 upper-left -> 2 upper-right -> 3 lower-right -> 4 lower-left.
            col,row=((0,0),(1,0),(1,1),(0,1))[i]
            box(c,item,L+col*283,652-row*91,257,73,i)
        link(c,293,614,318,614)
        link(c,450,578,450,563)
        link(c,319,524,293,524)
        link(c,170,488,170,578)
        box(c,d[4],L,460,W,57,4,'branch')
        if mode=='return-loop':
            link(c,170,488,170,466)
            c.setStrokeColor(HexColor(LINES));c.setLineWidth(1.4)
            c.line(36,432,24,432);c.line(24,432,24,615)
            link(c,24,615,35,615)
            small_label(c,'SHORT-TERM RESPONSE MAY SHAPE THE NEXT TRIGGER',146,391)
        else:
            small_label(c,'THE FIRST FOUR MAY REPEAT; FIFTH IS A SUPPORTED ALTERNATIVE',121,391)
    elif mode=='attention-split':
        box(c,d[0],L,651,257,76,0)
        box(c,d[1],L+283,651,257,76,1)
        link(c,170,575,306,554);link(c,444,575,306,554)
        box(c,d[2],L,550,W,56,2,'branch')
        link(c,306,494,170,477);link(c,306,494,444,477)
        box(c,d[3],L,472,257,65,3)
        box(c,d[4],L+283,472,257,65,4)
        small_label(c,'COMPARE BOTH ROUTES; ACCESS IS NOT AUTOMATICALLY AVOIDANCE',57,395)
    elif mode in ('context-budget','two-track'):
        if mode=='two-track':
            box(c,d[0],L,653,257,63,0);box(c,d[1],L+283,653,257,63,1)
            link(c,306,587,306,575)
            small_label(c,'TWO TRACKS HAPPEN TOGETHER',185,579)
            box(c,d[2],L,564,257,77,2,'branch')
            box(c,d[3],L+283,564,257,77,3,'branch')
            link(c,167,487,306,470);link(c,445,487,306,470)
            box(c,d[4],L,465,W,59,4)
        else:
            for i,item in enumerate(d[:4]):box(c,item,L+(i%2)*283,653-(i//2)*96,257,83,i,'branch')
            link(c,170,474,306,459);link(c,444,474,306,459)
            box(c,d[4],L,454,W,62,4)
            small_label(c,'DEMANDS AND ACCESS CAN COEXIST; REVIEW EFFORT AND RECOVERY',61,385)
    else:
        small_label(c,'WORKING SEQUENCE; REVIEW CONTEXT AND COMPETING EXPLANATIONS',L,646)
        for i,item in enumerate(d[:3]):box(c,item,L+i*184,632,172,92,i)
        for i in range(2):link(c,L+(i+1)*184-12,584,L+(i+1)*184+1,584)
        link(c,306,540,306,523)
        box(c,d[3],L,519,257,85,3);box(c,d[4],L+283,519,257,85,4)
        link(c,293,475,318,475)
    if mode=='safety-gate':
        return 'Adult responsibility applies to both pathways. Safeguard when unsafe; offer repair only when safe and freely chosen.'
    if mode=='parallel-assess':
        return 'Medical stability and psychological/sensory assessment proceed together; urgent care cannot wait.'
    if mode=='access-tracks':
        return 'Message, response mode and access conditions work together; communication is not capacity.'
    if mode=='abc-tracks':
        return 'Before, observed behavior and after are observations; function remains a hypothesis.'
    if mode in ('return-loop','loop-choice'):
        return 'A possible feedback loop, not a diagnosis or certainty. Preserve safety and consent.'
    if mode=='two-track':return 'Instruction and usable access are simultaneous; review both separately.'
    if mode=='attention-split':return 'Compare attention and genuine access needs before altering supports.'
    if mode=='context-budget':return 'Available access and demands interact; review recovery and support burden.'
    return 'These are working steps to test against context, alternatives and the person’s account.'

def write_page(out,t,mode):
    c=canvas.Canvas(str(out),pagesize=(612,792),invariant=1)
    c.setTitle(t['title']+' - spatial companion review candidate')
    c.setAuthor('Sophia Korb Cohon, PhD')
    c.setSubject('DRAFT parity review - not validated, not approved for publication')
    c.setFillColor(HexColor(INK));c.rect(0,779,612,13,stroke=0,fill=1)
    title=t['title']
    wrapped(c,title,36,754,540,size=15,leading=18,bold=True,max_lines=2)
    line_text(c,36,713,'SPATIAL MAP - REVIEW COPY  |  '+t['age']+'  |  2026-10-12',8.4,True)
    wrapped(c,'Original educational worksheet. Discuss with qualified care; not a diagnosis, risk score or validated tool.',36,697,540,8,10,max_lines=2)
    diagram_note=diagram(c,t,mode)
    # Brief text equivalent to the spatial relationship, useful for monochrome or extraction.
    gate=(mode=='safety-gate')
    wrapped(c,diagram_note,36,307 if gate else 369,540,8.2,11,max_lines=2,bold=True)
    c.setStrokeColor(HexColor('#b7c7c2'));c.line(36,288 if gate else 348,576,288 if gate else 348)
    line_text(c,36,272 if gate else 333,'REFLECTION / CHOSEN SUPPORT - write, draw or dictate; use fictional or de-identified notes',8,True)
    for i,prompt in enumerate(t['fields']):
        top=(257-i*29) if gate else (313-i*41)
        wrapped(c,str(i+1)+'. '+prompt,36,top,540,8.3,10,max_lines=2,bold=True)
        c.setStrokeColor(HexColor('#8ca39c'));c.line(36,top-22,576,top-22)
    # The safety content must stay visible on every copy.
    c.setFillColor(HexColor('#f5f6f5'));c.setStrokeColor(HexColor('#47645e'))
    c.roundRect(36,41,540,99,5,fill=1,stroke=1)
    line_text(c,46,126,'SAFETY & SCOPE - DO NOT REPLACE CLINICAL ASSESSMENT',8.2,True)
    wrapped(c,t['safety'],46,112,518,size=7.55,leading=10,max_lines=7)
    line_text(c,36,29,'CPL | review-only teaching aid | unvalidated | source: GitHub SophiaKorb/clinical-practice-library',7)
    line_text(c,36,18,'Colorful branch: resources/clinical-topics/'+t['slug']+'/support-map.html',7)
    c.showPage();c.save()

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--out',default='/tmp/cpl-topic-parity-candidates')
    p.add_argument('--waves',type=int,default=5)
    a=p.parse_args()
    out=Path(a.out);out.mkdir(parents=True,exist_ok=True)
    manifest=[]
    for t in DATA['TOPICS'][:a.waves*5]:
        slug=t['slug'];mode,html_sha=mode_for(slug)
        pdf=out/('topic-'+slug+'.pdf')
        write_page(pdf,t,mode)
        manifest.append({'slug':slug,'title':t['title'],'mode':mode,'html_sha256':html_sha,
                         'pdf_sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),
                         'stage':'candidate-not-published'})
    (out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print('Draft companions generated:',len(manifest))
    print('Mode coverage:',{m:sum(t['mode']==m for t in manifest) for m in sorted(set(t['mode'] for t in manifest))})
if __name__=='__main__':main()
