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
    if not hit and slug=='sibling-conflict-safety-repair' and 'class="sibling-safety-flow"' in page:
        return 'safety-gate',hashlib.sha256(page.encode()).hexdigest()
    if not hit and slug=='restrictive-eating-coordination' and 'class="restrictive-parallel"' in page:
        return 'parallel-assess',hashlib.sha256(page.encode()).hexdigest()
    if not hit and slug=='panic-alarm-loop' and 'class="panic-cycle"' in page:
        return 'return-loop',hashlib.sha256(page.encode()).hexdigest()
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
        # One fork, two parallel lanes, with urgent medical action INSIDE the medical lane.
        # Urgent intervention is not a sequential step needed before coordinating care.
        box(c,('Eating or intake difficulty',
               'Notice physical changes, eating, access and daily participation; do not infer risk from body size.'),
            L,658,W,49,0,'gate')
        c.setStrokeColor(HexColor(LINES));c.setLineWidth(1.6)
        c.line(306,609,306,584);c.line(170,584,444,584)
        link(c,170,584,170,566);link(c,444,584,444,566)
        # A dark central label sits ON the fork, rather than allowing the connector through text.
        c.setFillColor(HexColor(INK));c.setStrokeColor(HexColor(INK))
        c.roundRect(200,585,212,21,10,fill=1,stroke=0)
        line_text(c,222,592,'BOTH ASSESSMENTS START TOGETHER',8.2,True,color='#ffffff')
        # Upper medical/sensory assessments remain visibly aligned.
        c.setFillColor(HexColor('#f8eedb'));c.setStrokeColor(HexColor('#90513f'))
        c.roundRect(L,413,257,151,8,fill=1,stroke=1)
        line_text(c,47,548,'MEDICAL / NUTRITIONAL SAFETY',9,True)
        wrapped(c,'Check stability, nutrition and physical symptoms with qualified care.',
                47,532,234,size=8,leading=11,max_lines=4)
        c.setFillColor(HexColor('#fff7f3'));c.setStrokeColor(HexColor('#ab593d'))
        c.setLineWidth(2.1);c.roundRect(47,425,235,76,6,fill=1,stroke=1)
        line_text(c,58,483,'URGENT CONCERN? ACT NOW',8.8,True)
        wrapped(c,'Fainting, dehydration, chest symptoms, severe weakness or rapid decline: prompt/urgent care as indicated. Do not wait.',
                58,469,212,size=7.5,leading=10,max_lines=4)
        c.setFillColor(HexColor('#e9edf8'));c.setStrokeColor(HexColor('#416487'))
        c.setLineWidth(1.5);c.roundRect(L+283,413,257,151,8,fill=1,stroke=1)
        line_text(c,330,548,'PSYCHOLOGICAL / SENSORY / ACCESS',8.5,True)
        wrapped(c,"Explore eating-disorder concerns, fear, sensory differences, swallowing difficulty, food access, culture and the person's experience. This does NOT delay medical care.",
                330,531,234,size=8.2,leading=11,max_lines=9)
        # Both assessments contribute as information arrives, rather than both having to finish.
        link(c,170,413,170,400);link(c,444,413,444,400)
        c.setStrokeColor(HexColor(LINES));c.setLineWidth(1.4)
        c.line(170,400,444,400);link(c,306,400,306,388)
        box(c,('ONE SHARED PLAN - review as findings arrive',
               'Coordinate medical follow-up, specialist care and chosen supports; monitor safety AND participation.'),
            L,384,W,55,4,'gate')
    elif mode in ('access-tracks','abc-tracks'):
        small_label(c,'CONCURRENT ACCESS CHANNELS' if mode=='access-tracks' else 'DESCRIBE OBSERVATIONS FIRST',L,651)
        for i,item in enumerate(d[:3]):box(c,item,L+i*184,640,172,91,i,'branch')
        for i in range(3):link(c,L+86+i*184,549,306,526)
        small_label(c,'VERIFY & PARTICIPATE' if mode=='access-tracks' else 'POSSIBLE HYPOTHESES / SAFER SUPPORT',L,519)
        box(c,d[3],L,504,257,91,3,'branch')
        box(c,d[4],L+283,504,257,91,4,'branch')
    elif mode=='return-loop':
        # Six authored stages around a genuine circular series of curved arrows.
        # Every arrow leads clockwise to the next card; 6 returns to 1.
        import math
        def curved_arrow(start,c1,c2,end):
            c.setStrokeColor(HexColor('#285f52'));c.setLineWidth(2.1)
            p=c.beginPath();p.moveTo(*start);p.curveTo(*c1,*c2,*end);c.drawPath(p,stroke=1,fill=0)
            angle=math.atan2(end[1]-c2[1],end[0]-c2[0])
            for off in (2.70,-2.70):
                c.line(end[0],end[1],end[0]+6.7*math.cos(angle+off),end[1]+6.7*math.sin(angle+off))
        stages=[
            ('1. Body sensation or trigger','Heart rate, dizziness, breathlessness or another cue.'),
            ('2. Feared interpretation','What might happen? What does the sensation mean?'),
            ('3. Alarm / panic surge','Fear, arousal and stronger attention to body sensations.'),
            ('4. Protective response','Checking, escaping, avoiding, reassurance or other coping.'),
            ('5. Short-term relief','What eased briefly, and what was the later cost?'),
            ('6. Renewed monitoring / fear','Scanning for symptoms or anticipating another episode.')
        ]
        positions=[(221,663,170,60),(390,585,186,76),(390,487,186,76),
                   (221,405,170,60),(36,487,186,76),(36,585,186,76)]
        for i,(item,(x,top,w,h)) in enumerate(zip(stages,positions)):
            box(c,item,x,top,w,h,i,'card')
        curved_arrow((396,638),(413,636),(421,605),(438,591))
        curved_arrow((483,505),(493,501),(493,494),(483,488))
        curved_arrow((385,437),(406,414),(414,390),(397,383))
        curved_arrow((215,376),(211,390),(227,418),(226,438))
        curved_arrow((129,491),(125,498),(125,503),(129,508))
        curved_arrow((225,562),(275,582),(199,614),(216,629))
        small_label(c,'SIX POSSIBLE STAGES - ARROWS RETURN FROM 6 TO 1',128,332)
    elif mode=='loop-choice':
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
    if mode=='return-loop':
        return 'A possible six-stage panic loop. Renewed monitoring can feed back to new sensations, but this is not inevitable. Respect medical care and consent.'
    if mode=='loop-choice':
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
    compact=(mode in ('safety-gate','parallel-assess','return-loop'))
    wrapped(c,diagram_note,36,307 if compact else 369,540,8.2,11,max_lines=2,bold=True)
    c.setStrokeColor(HexColor('#b7c7c2'));c.line(36,288 if compact else 348,576,288 if compact else 348)
    line_text(c,36,272 if compact else 333,'REFLECTION / CHOSEN SUPPORT - write, draw or dictate; use fictional or de-identified notes',8,True)
    for i,prompt in enumerate(t['fields']):
        top=(257-i*29) if compact else (313-i*41)
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
