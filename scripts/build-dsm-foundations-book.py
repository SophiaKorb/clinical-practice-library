#!/usr/bin/env python3
"""DSM Foundations: reproducible review-edition textbook from canonical online course.

Generates a designed book (NOT a browser print of the site) with all lessons,
33 four-stage cases, 11 adapted concept maps, 33 vocabulary entries, and the
full 80-question practice/answer key. Never deploys or replaces published files.
"""
from __future__ import annotations
from collections import Counter
from datetime import date
from html import escape as xml_escape
from pathlib import Path
import json
import re
import sys
from bs4 import BeautifulSoup, Tag
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, PageBreak, NextPageTemplate,
    Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/"resources/training/dsm-from-zero.html"
OUT=ROOT/"build/dsm-foundations-complete-review-book.pdf"
QA=ROOT/"build/dsm-foundations-book-manifest.json"

NAVY=colors.HexColor("#18354A")
INK=colors.HexColor("#233744")
TEAL=colors.HexColor("#12756F")
SEA=colors.HexColor("#EAF4F2")
PALE=colors.HexColor("#F3F6F7")
GOLD=colors.HexColor("#A77D37")
GREY=colors.HexColor("#546775")
BORDER=colors.HexColor("#D7E2E2")
PAGE_W,PAGE_H=letter
# Unicode-capable installed system fonts are needed for arrows, curly quotes and checkbox glyphs.
pdfmetrics.registerFont(TTFont("DJ","/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DJ-Bold","/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
pdfmetrics.registerFontFamily("DJ", normal="DJ", bold="DJ-Bold", italic="DJ", boldItalic="DJ-Bold")
LEFT=58
RIGHT=58
WIDTH=PAGE_W-LEFT-RIGHT

style={
    "booktitle":ParagraphStyle("BookTitle",fontName="DJ-Bold",fontSize=29,leading=36,textColor=NAVY,spaceAfter=14),
    "covercopy":ParagraphStyle("CoverCopy",fontName="DJ",fontSize=13,leading=20,textColor=INK,spaceAfter=14),
    "h1":ParagraphStyle("BookH1",fontName="DJ-Bold",fontSize=20,leading=25,textColor=NAVY,spaceBefore=12,spaceAfter=12,keepWithNext=1),
    "h2":ParagraphStyle("BookH2",fontName="DJ-Bold",fontSize=12.5,leading=17,textColor=TEAL,spaceBefore=12,spaceAfter=6,keepWithNext=1),
    "h3":ParagraphStyle("BookH3",fontName="DJ-Bold",fontSize=10.5,leading=14.5,textColor=NAVY,spaceBefore=9,spaceAfter=5,keepWithNext=1),
    "body":ParagraphStyle("BookBody",fontName="DJ",fontSize=10.2,leading=15.7,textColor=INK,spaceAfter=8,allowWidows=0,allowOrphans=0),
    "small":ParagraphStyle("BookSmall",fontName="DJ",fontSize=9.35,leading=13.8,textColor=INK,spaceAfter=5,allowWidows=0,allowOrphans=0),
    "tiny":ParagraphStyle("BookTiny",fontName="DJ",fontSize=8.9,leading=12.6,textColor=INK,spaceAfter=3),
    "mono":ParagraphStyle("BookMonotype",fontName="DJ",fontSize=9.3,leading=13.3,textColor=GREY,spaceAfter=6),
    "case":ParagraphStyle("BookCase",fontName="DJ-Bold",fontSize=12,leading=16,textColor=NAVY,spaceBefore=13,spaceAfter=8,keepWithNext=1),
    "step":ParagraphStyle("BookStep",fontName="DJ-Bold",fontSize=9.6,leading=14,textColor=TEAL,spaceBefore=6,spaceAfter=3,keepWithNext=1),
    "caption":ParagraphStyle("BookCaption",fontName="DJ-Bold",fontSize=10,leading=14,textColor=TEAL,spaceAfter=5,keepWithNext=1),
    "option":ParagraphStyle("BookOption",fontName="DJ",fontSize=9.5,leading=13.5,textColor=INK,leftIndent=15,firstLineIndent=-15,spaceAfter=5),
    "answer":ParagraphStyle("BookAnswer",fontName="DJ",fontSize=9.6,leading=14,textColor=INK,spaceAfter=6),
    "contents":ParagraphStyle("BookContents",fontName="DJ",fontSize=11,leading=19,textColor=INK,spaceAfter=6),
    "callout":ParagraphStyle("BookCallout",fontName="DJ",fontSize=9.8,leading=14.8,textColor=INK),
    "center":ParagraphStyle("BookCenter",fontName="DJ",fontSize=9.7,leading=14,textColor=GREY,alignment=TA_CENTER),
}

def text(el):
    if not el:return ""
    return " ".join(el.get_text(" ",strip=True).split())

def markup(t):
    """Keep bold and italics only; make strings safe for ReportLab paragraphs."""
    if isinstance(t, Tag):
        out=[]
        for child in t.children:
            if isinstance(child,Tag):
                inner=markup(child)
                if child.name in ("b","strong"):inner="<b>"+inner+"</b>"
                elif child.name in ("i","em"):inner="<i>"+inner+"</i>"
                out.append(inner)
            else:
                out.append(xml_escape(str(child)))
        return "".join(out).replace("\n"," ").strip()
    return xml_escape(str(t)).replace("\n"," ").strip()

def plain(s):
    return re.sub(r"\s+"," ",str(s)).strip()

def P(s, kind="body"):
    v=plain(s)
    return Paragraph(v if v else " ",style[kind])

def plain_para(el,kind="body"):
    return P(markup(el),kind)

def box(elements,background=PALE,border=BORDER,pad=12):
    tbl=Table([[elements]],colWidths=[WIDTH],hAlign="LEFT")
    tbl.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,-1),background),
        ("BOX",(0,0),(-1,-1),.65,border),
        ("LEFTPADDING",(0,0),(-1,-1),pad),
        ("RIGHTPADDING",(0,0),(-1,-1),pad),
        ("TOPPADDING",(0,0),(-1,-1),pad),
        ("BOTTOMPADDING",(0,0),(-1,-1),pad),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
    ]))
    return tbl

def chapter_bars(s):
    return [P(s,"h2"),HRFlowable(width="100%",thickness=.7,color=BORDER,spaceAfter=8)]

class BookDoc(BaseDocTemplate):
    def __init__(self,path,**kw):
        super().__init__(str(path),pagesize=letter,leftMargin=LEFT,rightMargin=RIGHT,topMargin=61,bottomMargin=54,title="DSM Foundations | Complete Print Review Edition",author="Clinical Practice Library",**kw)
        frm=Frame(LEFT,53,WIDTH,PAGE_H-108,leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0,id="content")
        self.addPageTemplates(PageTemplate(id="normal",frames=[frm],onPage=self.paginate))
        self.seen=set()
    def paginate(self,canvas,doc):
        canvas.saveState()
        canvas.setStrokeColor(BORDER)
        canvas.line(LEFT,PAGE_H-39,PAGE_W-RIGHT,PAGE_H-39)
        canvas.setFont("DJ-Bold",8)
        canvas.setFillColor(TEAL)
        canvas.drawString(LEFT,PAGE_H-31,"DSM FOUNDATIONS  /  COMPLETE PRINT REVIEW")
        canvas.setFont("DJ",8)
        canvas.setFillColor(GREY)
        canvas.drawRightString(PAGE_W-RIGHT,PAGE_H-31,"OCTOBER 2026")
        canvas.line(LEFT,42,PAGE_W-RIGHT,42)
        canvas.drawString(LEFT,30,"Educational edition  |  Not a substitute for the DSM-5-TR")
        canvas.drawRightString(PAGE_W-RIGHT,30,str(doc.page))
        canvas.restoreState()
    def afterFlowable(self,f):
        if isinstance(f,Paragraph) and hasattr(f,"_bookmark"):
            key=f._bookmark
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(f.getPlainText(),key,level=getattr(f,"_level",0),closed=False)

def bookmark(p,key,level=0):
    p._bookmark=key
    p._level=level
    return p

def add_concept_map(fig,story):
    if not fig:return
    heading=fig.find("strong",class_="stage-title")
    story.append(P("CONCEPT MAP  /  "+markup(heading or "Clinical reasoning"),"caption"))
    nodes=fig.select(".relation-node")
    edges=fig.select(".relation-edge")
    # Render each actual relationship node as an ink-friendly labeled card, in source order.
    if not nodes:
        story.append(P(text(fig),"small"))
        return
    cell_content=[]
    for node in nodes:
        label=node.find("b")
        explanation=node.find("span")
        pieces=[P(markup(label) if label else "Concept","h3")]
        if explanation:pieces.append(P(markup(explanation),"small"))
        cell_content.append(pieces)
    for j,part in enumerate(cell_content):
        story.append(box(part,SEA if j==0 else PALE,pad=8))
        if j<len(cell_content)-1:
            connector=(text(edges[min(j,len(edges)-1)]) if edges else "related question")
            story.append(P("↓ "+xml_escape(connector).replace("↓ ",""),"mono"))
    story.append(Spacer(1,8))

def add_worked(case,story,index):
    label=case.find("strong")
    title=text(label)
    story.append(bookmark(P("CASE "+str(index)+"  /  "+xml_escape(title),"case"),"case-"+str(index),1))
    steps=case.select("ol.worked-steps li")
    for s in steps:
        sh=s.find("b")
        paragraph=s.find("p")
        if sh:story.append(P(markup(sh),"step"))
        if paragraph:story.append(plain_para(paragraph,"small"))
    takeaway=case.find("p",class_="worked-takeaway")
    if takeaway:
        story.append(box([plain_para(takeaway,"callout")],SEA,pad=8))
    story.append(Spacer(1,10))

def add_body_item(el,story):
    if el.name=="p":
        story.append(plain_para(el,"body"))
    elif el.name in ("h3","h4"):
        story.append(plain_para(el,"h2" if el.name=="h3" else "h3"))
    elif el.name=="figure" and "concept-stage" in el.get("class",[]):
        add_concept_map(el,story)
    elif el.name=="div":
        classes=el.get("class",[])
        if "lesson-head" in classes:return
        if "visual" in classes:
            tiles=el.select(".tile")
            if tiles:
                story.append(P("Three ways to examine the idea","h3"))
                for t in tiles:
                    head=t.find("b")
                    body=t.find("p")
                    if head:story.append(P(markup(head),"h3"))
                    if body:story.append(plain_para(body,"small"))
        elif "example" in classes and "worked-example" not in classes:
            story.append(box([P("EXAMPLE  /  "+xml_escape(text(el.find("strong"))),"caption"),P(xml_escape(text(el)),"small")],PALE,pad=10))
        elif "expand-group" in classes:
            story.append(P("Further explanation","h2"))
            for dt in el.select("details.expand"):
                summ=dt.find("summary")
                if summ:story.append(P(xml_escape(text(summ)),"h3"))
                for p in dt.find_all("p",recursive=False):
                    story.append(plain_para(p,"small"))
        elif "key-takeaways" in classes:
            story.append(P(xml_escape(text(el)),"small"))
        elif "quiz-case-context" in classes or "practice-context" in classes:
            story.append(P(xml_escape(text(el)),"small"))

def add_chapter(sec,n,story,casecount):
    h=sec.find("h2",id=f"title-{n}")
    title=text(h)
    story.append(PageBreak())
    story.append(bookmark(P(f"CHAPTER {n:02d}  /  "+xml_escape(title),"h1"),f"lesson-{n}"))
    head=sec.find("div",class_="lesson-head")
    kicker=head.find("p") if head else None
    if kicker:story.append(P(xml_escape(text(kicker).upper()),"mono"))
    for el in sec.find_all(recursive=False):
        if el.name=="details" and "extra-examples" in el.get("class",[]):
            story.append(P("WORKED CASES  /  Observation → Inquiry → Interpretation → Action","h2"))
            for case in el.select(".worked-example"):
                casecount+=1
                add_worked(case,story,casecount)
        elif el.name=="details":
            continue
        else:add_body_item(el,story)
    return title,casecount

def add_question(q,num,story,keys):
    stem=q.find("p",recursive=False)
    question=text(stem)
    options=q.select("button[data-answer]")
    multi=q.has_attr("data-multi")
    kind="Select every supported answer." if multi else "Select the most supported answer."
    story.append(bookmark(P(f"{num:02d}. "+xml_escape(question),"h3"),f"q-{num}",1))
    story.append(P(kind,"mono"))
    answers=[]
    for i,op in enumerate(options):
        letter=chr(65+i)
        story.append(P(f"□  {letter}. "+markup(op),"option"))
        if op.get("data-answer")=="yes":answers.append((letter,text(op),op.get("data-feedback","")))
    story.append(P("Reasoning / evidence / next assessment question:","mono"))
    story.append(Spacer(1,8))
    # Writing area is genuinely provided for learners, not a browser print of hidden answers.
    for i in range(2):
        story.append(HRFlowable(width="100%",thickness=.4,color=BORDER,spaceBefore=6,spaceAfter=8))
    keys.append(dict(number=num,stem=question,correct=answers,multi=multi,options=len(options)))
    story.append(Spacer(1,12))

def build():
    soup=BeautifulSoup(HTML.read_text(encoding="utf-8"),"html.parser")
    secs=[soup.find("section",id="lesson-"+str(i)) for i in range(1,12)]
    assert all(secs),"Every canonical lesson must be present"
    titlemap=[]
    chapters=[]
    count=0
    for i,sec in enumerate(secs,1):
        h=sec.find("h2",id=f"title-{i}")
        titlemap.append(text(h))
        count+=len(sec.select(".worked-example"))
    questions=[]
    for i,sec in enumerate(secs,1):
        for q in sec.select(".check[data-quiz]"):
            questions.append((i,q))
    vocab=soup.select(".vocab-entry[data-vocab-entry]")
    figs=[sec.find("figure",class_="concept-stage") for sec in secs]
    assert len(questions)==80,f"Expected 80 questions, got {len(questions)}"
    assert count==33,f"Expected 33 cases, got {count}"
    assert len(vocab)==33,f"Expected 33 glossary entries, got {len(vocab)}"
    assert len(figs)==11 and all(figs),"Expected 11 concept maps"
    assert sum(len(q.select("button[data-answer]")) for _,q in questions)==249
    assert sum(q.has_attr("data-multi") for _,q in questions)==8
    assert sum(len(q.select("button[data-answer='yes']"))>0 for _,q in questions)==80
    OUT.parent.mkdir(parents=True,exist_ok=True)
    book=[]
    book.append(Spacer(1,82))
    book.append(P("DSM FOUNDATIONS","booktitle"))
    book.append(HRFlowable(width="100%",thickness=3,color=TEAL,spaceBefore=4,spaceAfter=18))
    book.append(P("A complete printable course in diagnostic reasoning, clinical context, and responsible use of classification.","covercopy"))
    book.append(Spacer(1,20))
    book.append(box([P("REVIEW EDITION  /  OCTOBER 2026","caption"),
                     P("11 lessons · 33 worked cases · 11 concept maps · 33 glossary concepts · 80 practice questions + instructor answer key","body"),
                     P("Based on the interactive DSM Foundations learning course. Written as an educational textbook rather than printed from the website.","small")],SEA,pad=16))
    book.append(Spacer(1,28))
    book.append(P("Clinical boundary","h2"))
    book.append(P("For education and structured critical thinking. This book is not the DSM-5-TR, does not reproduce the manual's full diagnostic criteria, and is not a substitute for qualified assessment, direct examination, current official guidance, or supervision. Apparent patterns do not establish diagnosis. Immediate safety and medical concerns require their own response.","body"))
    book.append(P("Editorial note: this is a technical print-review candidate, not a clinically peer-reviewed release or PDF/UA-certified accessible edition.","small"))
    book.append(PageBreak())
    book.append(bookmark(P("Contents and use","h1"),"contents"))
    book.append(P("Use chapters 1–11 for the conceptual teaching and all 33 worked examples. The 80-item paper practice follows the lessons. The instructor key is deliberately separated after the questions. Select-all items are marked explicitly.","body"))
    for n,title in enumerate(titlemap,1):
        book.append(P(f"{n:02d}  {xml_escape(title)}","contents"))
    book.append(Spacer(1,6))
    book.append(P("Appendix A  /  Full vocabulary (33 concepts)","contents"))
    book.append(P("Appendix B  /  Reusable assessment and documentation worksheet","contents"))
    book.append(P("Practice  /  Questions 1–80 with response space","contents"))
    book.append(P("Instructor  /  Answer key 1–80 with explanations","contents"))
    book.append(P("Method: Explore the information → Apply the concept → Recall what would change your conclusion.","small"))
    count=0
    for i,sec in enumerate(secs,1):
        title,count=add_chapter(sec,i,book,count)
        chapters.append(dict(number=i,title=title,cases=len(sec.select(".worked-example")),questions=len(sec.select(".check[data-quiz]"))))
    book.append(PageBreak())
    book.append(bookmark(P("Appendix A  /  Full vocabulary","h1"),"vocabulary"))
    for ent in vocab:
        dt=ent.find("dt")
        dd=ent.find("dd")
        if not dt or not dd:continue
        book.append(P(xml_escape(text(dt)),"h3"))
        book.append(plain_para(dd,"body"))
    book.append(PageBreak())
    book.append(bookmark(P("Appendix B  /  Working assessment worksheet","h1"),"worksheet"))
    book.append(P("Use this reusable page to describe the reported concern and the evidence without treating one symptom, label, or successful task as a settled diagnosis.","body"))
    for section in [
        "1. Person's own description of the concern",
        "2. What was directly observed? What was inferred?",
        "3. Onset, duration, frequency, course, and setting",
        "4. Relevant medical, sleep, substance, developmental, language and cultural context",
        "5. Distress, functioning, barriers, needed supports, and strengths",
        "6. Safety assessment and immediate action, if indicated",
        "7. Plausible alternatives, data gaps, and qualified consultations",
        "8. Next action and how its impact will be evaluated",
    ]:
        book.append(P(xml_escape(section),"h3"))
        for x in range(3):
            book.append(HRFlowable(width="100%",thickness=.4,color=BORDER,spaceBefore=8,spaceAfter=11))
    book.append(PageBreak())
    book.append(bookmark(P("Written and multiple-choice practice","h1"),"practice"))
    book.append(P("Questions below are reproduced from the canonical interactive course. Choose an answer or answers and write why. The response area lets learners articulate both the evidence and an appropriate next question. Keep the key separate until finished.","body"))
    keys=[]
    previous=None
    for n,(chapter,q) in enumerate(questions,1):
        if chapter!=previous:
            previous=chapter
            book.append(P(f"CHAPTER {chapter:02d} PRACTICE  /  "+xml_escape(titlemap[chapter-1]),"h2"))
        add_question(q,n,book,keys)
    book.append(PageBreak())
    book.append(bookmark(P("Separate instructor answer key","h1"),"key"))
    book.append(P("These are teaching explanations, not automated clinical determinations. Multiple interpretations can remain plausible; focus on the evidence described in the stem, diagnostic restraint, safety and appropriate next steps.","body"))
    for a in keys:
        book.append(P(f"{a['number']:02d}.  "+xml_escape(a["stem"]),"h3"))
        book.append(P(("Correct selections: " if a["multi"] else "Best selection: ")+", ".join(x[0] for x in a["correct"]),"small"))
        for letter,option,feedback in a["correct"]:
            book.append(P("<b>"+letter+". "+xml_escape(option)+"</b>","small"))
            if feedback:book.append(P(xml_escape(feedback),"answer"))
        book.append(Spacer(1,6))
    book.append(PageBreak())
    book.append(bookmark(P("Sources and release status","h1"),"sources"))
    book.append(P("Curriculum: Clinical Practice Library, DSM Foundations online interactive course, development review branch, October 2026. Print text, examples, concept-map nodes, questions, feedback and terms are derived from the same source file. This book is an original educational adaptation, not a facsimile of the DSM manual.","body"))
    for label,url in [
        ("American Psychiatric Association, DSM-5-TR","https://www.psychiatry.org/psychiatrists/practice/dsm"),
        ("NIMH: Bipolar disorder","https://www.nimh.nih.gov/health/publications/bipolar-disorder"),
        ("NIAAA: Alcohol Use Disorder","https://www.niaaa.nih.gov/health-professionals-communities/core-resource-on-alcohol/alcohol-use-disorder-risk-diagnosis-recovery"),
        ("EEOC: disability-related inquiries and documentation","https://www.eeoc.gov/laws/guidance/enforcement-guidance-disability-related-inquiries-and-medical-examinations-employees")
    ]:
        book.append(P(xml_escape(label)+": "+xml_escape(url),"small"))
    book.append(P("Prepublication gates: clinical expert review against the authorized DSM-5-TR; independent accessibility audit including tags and screen-reader reading order; complete rendered print page review; formal sign-off before public release.","body"))
    doc=BookDoc(OUT)
    doc.build(book)
    counts=dict(lessons=len(secs),cases=count,concept_maps=len(figs),vocabulary=len(vocab),questions=len(keys),options=sum(x["options"] for x in keys),select_all=sum(x["multi"] for x in keys),single=sum(not x["multi"] for x in keys),chapters=chapters,pdf=str(OUT.relative_to(ROOT)))
    QA.write_text(json.dumps(counts,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(counts,indent=2))

if __name__=="__main__":
    build()
