#!/usr/bin/env python3
"""DSM Foundations: reproducible review-edition textbook from canonical online course.

Generates a designed book (NOT a browser print of the site) with all lessons,
33 four-stage cases, 11 adapted concept maps, 36 vocabulary entries, and the
full 80-question practice/answer key. Never deploys or replaces published files.
"""
from __future__ import annotations
from collections import Counter
import copy
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
from reportlab.lib.utils import simpleSplit
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, PageBreak, NextPageTemplate, Flowable,
    Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/"resources/training/dsm-from-zero.html"
OUT=ROOT/"build/dsm-foundations-complete-review-book.pdf"
QA=ROOT/"build/dsm-foundations-book-manifest.json"

# Print identity: literary ink, oxblood hierarchy, warm paper-compatible neutrals.
NAVY=colors.HexColor("#272526")
INK=colors.HexColor("#272526")
TEAL=colors.HexColor("#6B283B")
SEA=colors.HexColor("#F7F0EB")
PALE=colors.HexColor("#FAF7F1")
GOLD=colors.HexColor("#80582E")
GREY=colors.HexColor("#595151")
BORDER=colors.HexColor("#DED6CD")
PAGE_W,PAGE_H=letter
# Use the prepared OFL type system in CI; local fallback remains available for
# editing without downloads. QA manifest names the actual embedded font mode.
FONT_ROOT=ROOT/"build/fonts"
FONT_MODE="editorial" if (FONT_ROOT/"LibreBaskerville-Regular.ttf").exists() else "fallback"
if FONT_MODE=="editorial":
    expected=["LibreBaskerville-Regular.ttf","LibreBaskerville-Bold.ttf",
              "SourceSerif4-Regular.ttf","SourceSerif4-Bold.ttf",
              "SourceSerif4-Italic.ttf","SourceSerif4-BoldItalic.ttf",
              "SourceSans3-Regular.ttf","SourceSans3-Bold.ttf"]
    if not all((FONT_ROOT/x).is_file() for x in expected):
        raise RuntimeError("Incomplete editorial fonts; run prepare-dsm-print-fonts.py")
    pdfmetrics.registerFont(TTFont("LB",str(FONT_ROOT/"LibreBaskerville-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("LB-Bold",str(FONT_ROOT/"LibreBaskerville-Bold.ttf")))
    pdfmetrics.registerFont(TTFont("NS",str(FONT_ROOT/"SourceSerif4-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("NS-Bold",str(FONT_ROOT/"SourceSerif4-Bold.ttf")))
    pdfmetrics.registerFont(TTFont("NS-Italic",str(FONT_ROOT/"SourceSerif4-Italic.ttf")))
    pdfmetrics.registerFont(TTFont("NS-BoldItalic",str(FONT_ROOT/"SourceSerif4-BoldItalic.ttf")))
    pdfmetrics.registerFont(TTFont("Lato",str(FONT_ROOT/"SourceSans3-Regular.ttf")))
    pdfmetrics.registerFont(TTFont("Lato-Bold",str(FONT_ROOT/"SourceSans3-Bold.ttf")))
else:
    pdfmetrics.registerFont(TTFont("LB","/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf"))
    pdfmetrics.registerFont(TTFont("LB-Bold","/usr/share/fonts/truetype/noto/NotoSerif-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("NS","/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf"))
    pdfmetrics.registerFont(TTFont("NS-Bold","/usr/share/fonts/truetype/noto/NotoSerif-Bold.ttf"))
    pdfmetrics.registerFont(TTFont("NS-Italic","/usr/share/fonts/truetype/noto/NotoSerif-Italic.ttf"))
    pdfmetrics.registerFont(TTFont("NS-BoldItalic","/usr/share/fonts/truetype/noto/NotoSerif-BoldItalic.ttf"))
    pdfmetrics.registerFont(TTFont("Lato","/usr/share/fonts/truetype/lato/Lato-Regular.ttf"))
    pdfmetrics.registerFont(TTFont("Lato-Bold","/usr/share/fonts/truetype/lato/Lato-Bold.ttf"))
pdfmetrics.registerFontFamily("NS",normal="NS",bold="NS-Bold",italic="NS-Italic",boldItalic="NS-BoldItalic")
pdfmetrics.registerFontFamily("LB",normal="LB",bold="LB-Bold")
pdfmetrics.registerFontFamily("Lato",normal="Lato",bold="Lato-Bold",italic="Lato",boldItalic="Lato-Bold")
pdfmetrics.registerFont(TTFont("BookSymbols","/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
LEFT=58
RIGHT=58
WIDTH=PAGE_W-LEFT-RIGHT

style={
    "booktitle":ParagraphStyle("BookTitle",fontName="LB-Bold",fontSize=37,leading=46,textColor=NAVY,spaceAfter=17),
    "covercopy":ParagraphStyle("CoverCopy",fontName="NS",fontSize=15.3,leading=24,textColor=INK,spaceAfter=15),
    "author":ParagraphStyle("BookAuthor",fontName="NS-Bold",fontSize=17,leading=24,textColor=TEAL,spaceAfter=14),
    "h1":ParagraphStyle("BookH1",fontName="LB-Bold",fontSize=24,leading=31,textColor=NAVY,spaceAfter=13,spaceBefore=12,keepWithNext=1),
    "h2":ParagraphStyle("BookH2",fontName="LB-Bold",fontSize=15.2,leading=21,textColor=TEAL,spaceAfter=8,spaceBefore=15,keepWithNext=1),
    "h3":ParagraphStyle("BookH3",fontName="LB-Bold",fontSize=11.8,leading=17.1,textColor=NAVY,spaceAfter=9,spaceBefore=15,keepWithNext=1),
    "body":ParagraphStyle("BookBody",fontName="NS",fontSize=11.4,leading=19.8,textColor=INK,spaceAfter=14,allowWidows=0,allowOrphans=0),
    "small":ParagraphStyle("BookSmall",fontName="NS",fontSize=10.8,leading=18,textColor=INK,spaceAfter=10,allowWidows=0,allowOrphans=0),
    "tiny":ParagraphStyle("BookTiny",fontName="Lato",fontSize=9.6,leading=13.9,textColor=INK,spaceAfter=5),
    "mono":ParagraphStyle("BookMonotype",fontName="Lato",fontSize=10.1,leading=15,textColor=GREY,spaceAfter=8),
    "case":ParagraphStyle("BookCase",fontName="LB-Bold",fontSize=14.2,leading=19,textColor=NAVY,spaceAfter=10,spaceBefore=17,keepWithNext=1),
    "step":ParagraphStyle("BookStep",fontName="Lato-Bold",fontSize=11.2,leading=16.2,textColor=TEAL,spaceAfter=5,spaceBefore=10,keepWithNext=1),
    "caption":ParagraphStyle("BookCaption",fontName="Lato-Bold",fontSize=10.7,leading=15.5,textColor=TEAL,spaceAfter=7,keepWithNext=1),
    "option":ParagraphStyle("BookOption",fontName="Lato",fontSize=10.9,leading=17.1,textColor=INK,spaceAfter=6,leftIndent=19,firstLineIndent=-19),
    "answer":ParagraphStyle("BookAnswer",fontName="NS",fontSize=10.5,leading=16.4,textColor=INK,spaceAfter=5),
    "contents":ParagraphStyle("BookContents",fontName="NS",fontSize=12.1,leading=20.5,textColor=INK,spaceAfter=6),
    "callout":ParagraphStyle("BookCallout",fontName="NS",fontSize=10.7,leading=16.5,textColor=INK),
    "center":ParagraphStyle("BookCenter",fontName="Lato",fontSize=9.8,leading=14,textColor=GREY,alignment=TA_CENTER),
    "mapbody":ParagraphStyle("BookMapBody",fontName="NS",fontSize=11.7,leading=18.3,textColor=INK,spaceAfter=7),
    "maplink":ParagraphStyle("BookMapLink",fontName="Lato-Bold",fontSize=11.6,leading=16.8,textColor=INK,alignment=TA_CENTER,spaceAfter=8),
    "maptitle":ParagraphStyle("BookMapTitle",fontName="LB-Bold",fontSize=12.6,leading=18.4,textColor=NAVY,spaceAfter=6,keepWithNext=1),
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

def print_summary(summary):
    """Return an editorial section heading with online navigation symbols removed."""
    if summary is None:
        return ""
    cleaned=copy.deepcopy(summary)
    for child in cleaned.select(".expand-arrow, .practice-indicator, .expand-hint, .audience-expand-indicator, [aria-hidden='true']"):
        child.decompose()
    result=text(cleaned)
    return re.sub(r"\s+\+\s*$", "", result).strip()


def plain(s):
    return re.sub(r"\s+"," ",str(s)).strip()

def P(s, kind="body"):
    v=plain(s)
    # The serif font lacks diagram arrows; retain source meaning through a glyph-complete fallback.
    for glyph in "→↔↩⇢↘↙↓⇒←⇄":
        v=v.replace(glyph, '<font name="BookSymbols">'+glyph+'</font>')
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
        super().__init__(str(path),pagesize=letter,leftMargin=LEFT,rightMargin=RIGHT,topMargin=61,bottomMargin=54,title="DSM Foundations | Complete Print Edition",author="Sophia Korb Cohon, PhD",**kw)
        frm=Frame(LEFT,53,WIDTH,PAGE_H-108,leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0,id="content")
        self.addPageTemplates(PageTemplate(id="normal",frames=[frm],onPage=self.paginate))
        self.seen=set()
    def paginate(self,canvas,doc):
        canvas.saveState()
        canvas.setStrokeColor(BORDER)
        canvas.line(LEFT,PAGE_H-39,PAGE_W-RIGHT,PAGE_H-39)
        canvas.setFont("Lato-Bold",8.1)
        canvas.setFillColor(TEAL)
        canvas.drawString(LEFT,PAGE_H-31,"DSM FOUNDATIONS  /  PRINT EDITION")
        canvas.setFont("Lato",8.1)
        canvas.setFillColor(GREY)
        canvas.drawRightString(PAGE_W-RIGHT,PAGE_H-31,"OCTOBER 2026")
        canvas.line(LEFT,42,PAGE_W-RIGHT,42)
        canvas.drawString(LEFT,30,"CLINICAL PRACTICE LIBRARY  /  EDUCATIONAL EDITION")
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

class ConnectorArrow(Flowable):
    """Draw a readable, print-safe directional connector as vector ink."""
    def __init__(self,label=""):
        super().__init__()
        self.label=label
        self.width=WIDTH
        self.height=38 if label else 17
        self.lines=[]
    def wrap(self,availWidth,availHeight):
        self.width=min(WIDTH,availWidth)
        if self.label:
            self.lines=simpleSplit(self.label,"Lato-Bold",11.7,self.width-52)
            self.height=38+14.5*(len(self.lines)-1)
        return self.width,self.height
    def draw(self):
        c=self.canv
        middle=self.width/2
        stemtop=self.height-5
        tip=(25+14.5*(len(self.lines)-1)) if self.label else 6
        c.setStrokeColor(TEAL)
        c.setFillColor(TEAL)
        c.setLineWidth(3.2)
        c.setLineCap(1)
        c.line(middle,stemtop,middle,tip+10)
        p=c.beginPath()
        p.moveTo(middle-9,tip+10)
        p.lineTo(middle+9,tip+10)
        p.lineTo(middle,tip)
        p.close()
        c.drawPath(p,fill=1,stroke=0)
        if self.label:
            c.setFont("Lato-Bold",11.7)
            c.setFillColor(INK)
            for idx,caption in enumerate(reversed(self.lines)):
                c.drawCentredString(middle,8+14.5*idx,caption)


def add_concept_map(fig,story):
    if not fig:
        return
    heading=fig.find("strong",class_="stage-title")
    story.append(P(markup(heading or "Clinical reasoning"),"caption"))
    structure=fig.select_one(".relationship-map")
    if structure is None:
        story.append(P(xml_escape(text(fig)),"small"))
        return

    def append_card(node,branch=False):
        label=node.find("b",recursive=False)
        if label is None:
            label=node.find(["h3","h4","strong"],recursive=False)
        explanation=node.find("span",recursive=False)
        if explanation is None:explanation=node.find("p",recursive=False)
        title=markup(label) if label else xml_escape(text(node))
        body=[P(title,"maptitle")]
        if explanation:body.append(P(markup(explanation),"mapbody"))
        story.append(box(body,PALE if branch else SEA,pad=11))

    for block in structure.find_all(recursive=False):
        classes=block.get("class",[])
        if "relation-edge" in classes:
            label=re.sub(r"^[\s↓↘↙→⇒]+", "", text(block)).strip()
            story.append(ConnectorArrow(label))
        elif "relation-node" in classes:
            append_card(block)
        elif "relation-branches" in classes:
            branches=block.select(".relation-node")
            if branches:
                for branch in branches:
                    append_card(branch,branch=True)
            else:
                story.append(P(xml_escape(text(block)),"small"))
        elif "person-map-heading" in classes:
            story.append(box([P(xml_escape(text(block)),"small")],SEA,pad=11))
        elif "relation-link" in classes:
            story.append(P(xml_escape(text(block)),"maplink"))
    for cls in ("relation-safety","relation-loop"):
        special=fig.select_one("."+cls)
        if special:
            story.append(P(xml_escape(text(special)),"small"))
    story.append(Spacer(1,7))

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
    story.append(Spacer(1,14))

def add_additional_item(el,story):
    """Preserve substantive nested sections, lists, safety notes and case grids.

    The source lesson has nested clinical sections beyond its top-level
    paragraphs. Silently ignoring those would delete differential and
    safety instruction from the printed adaptation.
    """
    if not isinstance(el,Tag):
        return
    cls=el.get("class",[])
    if "lesson-footer" in cls:
        return
    if "safety-note" in cls:
        story.append(box([P(xml_escape(text(el)),"callout")],SEA,pad=14))
        return
    if "sud-severity" in cls:
        story.append(P("Severity thresholds (number of applicable criteria)","h3"))
        for panel in el.find_all("div",recursive=False):
            story.append(P(xml_escape(text(panel)),"small"))
        return
    if el.name in ("h2","h3","h4","h5"):
        story.append(plain_para(el,"h2" if el.name in ("h2","h3") else "h3"))
        return
    if el.name=="p":
        story.append(plain_para(el,"small"))
        return
    if el.name=="li":
        # Treat one list item as one flowable so nested inline tags aren't repeated.
        story.append(P("•  "+markup(el),"small"))
        return
    if el.name=="details":
        summary=el.find("summary",recursive=False)
        if summary:story.append(P(xml_escape(print_summary(summary)),"h3"))
    if el.name=="div" and "example" in cls:
        story.append(box([P(xml_escape(text(el)),"small")],PALE,pad=9))
        return
    if el.name=="div" and "visual" in cls:
        for tile in el.find_all("div",class_="tile",recursive=False):
            heading=tile.find("b")
            if heading:story.append(P(xml_escape(text(heading)),"h3"))
            for para in tile.find_all("p",recursive=False):story.append(plain_para(para,"small"))
        return
    if el.name=="div" and "sources" in cls:
        story.append(P("Further reading from this lesson","h3"))
        for link in el.find_all("a"):
            story.append(P(xml_escape(text(link)),"small"))
        for para in el.find_all("p",recursive=False):story.append(plain_para(para,"small"))
        return
    for sub in el.children:
        if not isinstance(sub,Tag) or sub.name in ("script","style","button","svg"):
            continue
        if el.name=="details" and sub.name=="summary":
            continue
        add_additional_item(sub,story)

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
                pass  # Tile headings supply the hierarchy
                for t in tiles:
                    head=t.find("b")
                    body=t.find("p")
                    if head:story.append(P(markup(head),"h3"))
                    if body:story.append(plain_para(body,"small"))
        elif "example" in classes and "worked-example" not in classes:
            story.append(box([P(xml_escape(text(el)),"callout")],PALE,pad=14))
        elif "expand-group" in classes:
            story.append(P("Further explanation","h2"))
            for dt in el.select("details.expand"):
                summ=dt.find("summary")
                if summ:story.append(P(xml_escape(print_summary(summ)),"h3"))
                for p in dt.find_all("p",recursive=False):
                    story.append(plain_para(p,"small"))
        elif "key-takeaways" in classes:
            story.append(box([P(xml_escape(text(el)),"callout")],SEA,pad=14))
        elif "quiz-case-context" in classes or "practice-context" in classes:
            story.append(P(xml_escape(text(el)),"small"))
        else:
            add_additional_item(el,story)
    else:
        add_additional_item(el,story)

def add_chapter(sec,n,story,casecount,question_range):
    h=sec.find("h2",id=f"title-{n}")
    title=text(h)
    story.append(Spacer(1,22))
    story.append(bookmark(P(f"CHAPTER {n:02d}  /  "+xml_escape(title),"h1"),f"lesson-{n}"))
    first,last=question_range
    story.append(P(f"Practice questions {first}–{last} are grouped by lesson in the practice section.","tiny"))
    head=sec.find("div",class_="lesson-head")
    # Chapter number and title already provide orientation; omit the redundant kicker.
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
    story.append(bookmark(P(f"{num:02d}. "+xml_escape(question),"h3"),f"q-{num}",1))
    if multi:story.append(P("SELECT ALL THAT APPLY","mono"))
    answers=[]
    for i,op in enumerate(options):
        letter=chr(65+i)
        story.append(P(f"□  {letter}. "+markup(op),"option"))
        if op.get("data-answer")=="yes":answers.append((letter,text(op),op.get("data-feedback","")))
    story.append(Spacer(1,8))
    # Writing area is genuinely provided for learners, not a browser print of hidden answers.
    for i in range(1):
        story.append(HRFlowable(width="100%",thickness=.4,color=BORDER,spaceBefore=5,spaceAfter=7))
    keys.append(dict(number=num,stem=question,correct=answers,multi=multi,options=len(options)))
    story.append(Spacer(1,7))

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
    assert len(vocab)==36,f"Expected 36 glossary entries, got {len(vocab)}"
    assert len(figs)==11 and all(figs),"Expected 11 concept maps"
    assert sum(len(q.select("button[data-answer]")) for _,q in questions)==253
    assert sum(q.has_attr("data-multi") for _,q in questions)==8
    assert sum(len(q.select("button[data-answer='yes']"))>0 for _,q in questions)==80
    OUT.parent.mkdir(parents=True,exist_ok=True)
    book=[]
    book.append(Spacer(1,64))
    book.append(P("DSM FOUNDATIONS","booktitle"))
    book.append(P("Diagnostic reasoning, clinical context, and the person beyond the label.","covercopy"))
    book.append(Spacer(1,7))
    book.append(P("Sophia Korb Cohon, PhD","author"))
    book.append(HRFlowable(width="100%",thickness=3,color=TEAL,spaceBefore=11,spaceAfter=24))
    book.append(box([P("COMPLETE PRINT EDITION  /  OCTOBER 2026","caption"),
                     P("11 lessons · 33 worked cases · 11 concept maps · 36 glossary concepts · 80 practice questions with a separate instructor key","body"),
                     P("Adapted from the interactive DSM Foundations course as a readable, illustrated learning book.","small")],SEA,pad=16))
    book.append(Spacer(1,28))
    book.append(P("About this book","h2"))
    book.append(P("Diagnosis is a way to describe and communicate patterns, not a complete explanation of a person. These lessons begin with the purpose of classification and develop a practical way to notice, investigate, compare, and respond with appropriate context.","body"))
    book.append(P("For full formal criteria, see the current DSM-5-TR.","tiny"))
    book.append(PageBreak())
    book.append(bookmark(P("Contents and use","h1"),"contents"))
    book.append(P("Use chapters 1–11 for the conceptual teaching and all 33 worked examples. The 80-item paper practice follows the lessons. The instructor key is deliberately separated after the questions. Select-all items are marked explicitly.","body"))
    for n,title in enumerate(titlemap,1):
        book.append(P(f"{n:02d}  {xml_escape(title)}","contents"))
    book.append(Spacer(1,6))
    book.append(P("Appendix B  /  Full vocabulary (36 concepts)","contents"))
    book.append(P("Appendix C  /  Assessment worksheet","contents"))
    book.append(P("Practice  /  Questions 1–80 with response space","contents"))
    book.append(P("Instructor  /  Answer key 1–80 with explanations","contents"))
    book.append(P("Method: Explore the information → Apply the concept → Recall what would change your conclusion.","small"))
    count=0
    question_ranges={}
    cursor=1
    for lesson in range(1,12):
        amount=sum(chapter==lesson for chapter,_ in questions)
        assert amount>0,("Missing lesson questions",lesson)
        question_ranges[lesson]=(cursor,cursor+amount-1)
        cursor+=amount
    assert cursor==81
    for i,sec in enumerate(secs,1):
        title,count=add_chapter(sec,i,book,count,question_ranges[i])
        chapters.append(dict(number=i,title=title,cases=len(sec.select(".worked-example")),questions=len(sec.select(".check[data-quiz]"))))
    # Editorial separation: the glossary must never share a page with the final
    # teaching chapter, especially when Appendix A is inserted between them.
    book.append(PageBreak())
    book.append(bookmark(P("Appendix B  /  Full vocabulary","h1"),"vocabulary"))
    for ent in vocab:
        dt=ent.find("dt")
        dd=ent.find("dd")
        if not dt or not dd:continue
        book.append(P(xml_escape(text(dt)),"h3"))
        book.append(plain_para(dd,"body"))
    book.append(PageBreak())
    book.append(bookmark(P("Appendix C  /  Assessment worksheet","h1"),"worksheet"))
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
    book.append(P("Choose the most supported answer for each question. For items marked <b>SELECT ALL THAT APPLY</b>, more than one option may be correct. Use the lines under each question to record your reasoning, evidence and any further assessment questions. The answer key is the final section: print up to, but not including, its first page for a student copy.","body"))
    keys=[]
    previous=None
    for n,(chapter,q) in enumerate(questions,1):
        if chapter!=previous:
            previous=chapter
            book.append(P(f"Practice {chapter:02d}  /  "+xml_escape(titlemap[chapter-1]),"h2"))
        add_question(q,n,book,keys)
    # References end the learner-printable section; the instructor key begins on a fresh page.
    book.append(bookmark(P("References and credits","h1"),"sources"))
    book.append(P("Adapted for print from the interactive DSM Foundations course in the Clinical Practice Library. The teaching material and fictional cases are designed to make diagnostic reasoning more understandable.","body"))
    for label,url in [
        ("American Psychiatric Association, DSM-5-TR","https://www.psychiatry.org/psychiatrists/practice/dsm"),
        ("NIMH: Bipolar disorder","https://www.nimh.nih.gov/health/publications/bipolar-disorder"),
        ("NIAAA: Alcohol Use Disorder","https://www.niaaa.nih.gov/health-professionals-communities/core-resource-on-alcohol/alcohol-use-disorder-risk-diagnosis-recovery"),
        ("EEOC (US): disability-related inquiries and documentation","https://www.eeoc.gov/laws/guidance/enforcement-guidance-disability-related-inquiries-and-medical-examinations-employees"),
        ("ACAS (UK): reasonable adjustments at work","https://www.acas.org.uk/reasonable-adjustments")
    ]:
        book.append(P(xml_escape(label)+": "+xml_escape(url),"small"))
    # Deliberately last: remove these trailing pages for a student-only printed book.
    book.append(PageBreak())
    book.append(bookmark(P("Separate instructor answer key","h1"),"key"))
    book.append(P("These are teaching explanations, not automated clinical determinations. Multiple interpretations can remain plausible; focus on the evidence described in the stem, diagnostic restraint, safety and appropriate next steps.","body"))
    for a in keys:
        letters=", ".join(x[0] for x in a["correct"])
        book.append(P(f"{a['number']:02d}.  "+("Answers: " if a["multi"] else "Answer: ")+letters,"h3"))
        for letter,option,feedback in a["correct"]:
            book.append(P("<b>"+letter+". "+xml_escape(option)+"</b>","small"))
            if feedback:book.append(P(xml_escape(feedback),"answer"))
        book.append(Spacer(1,6))
    doc=BookDoc(OUT)
    doc.build(book)
    counts=dict(font_mode=FONT_MODE,print_identity='Libre Baskerville / Source Serif 4 / Source Sans 3' if FONT_MODE=='editorial' else 'fallback fonts',lessons=len(secs),cases=count,concept_maps=len(figs),vocabulary=len(vocab),questions=len(keys),options=sum(x["options"] for x in keys),select_all=sum(x["multi"] for x in keys),single=sum(not x["multi"] for x in keys),chapters=chapters,pdf=str(OUT.relative_to(ROOT)))
    QA.write_text(json.dumps(counts,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(counts,indent=2))

if __name__=="__main__":
    build()
