#!/usr/bin/env python3
"""Rebuild the authored DSM Comparison Atlas and append it to the complete book.

Uses the retained authored 10-pair source and the same OFL editorial fonts as
DSM Foundations. Creates draft review PDFs only; never publishes anything.
"""
from __future__ import annotations
from pathlib import Path
import json
import re
from xml.sax.saxutils import escape
import fitz
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.utils import simpleSplit

ROOT=Path(__file__).resolve().parents[1]
BUILD=ROOT/"build"
FONTS=BUILD/"fonts"
PAIRS=json.loads((ROOT/"scripts/data/dsm-comparison-atlas-pairs.json").read_text(encoding="utf-8"))["pairs"]
MAIN=BUILD/"dsm-foundations-complete-review-book.pdf"
OUT=BUILD/"dsm-foundations-complete-with-comparison-atlas.pdf"
SINGLE=BUILD/"dsm-comparison-atlas-standalone-review.pdf"
APPENDIX=BUILD/"dsm-comparison-atlas-appendix-c.pdf"
INK=HexColor("#272526")
WINE=HexColor("#6b283b")
MUTED=HexColor("#595151")
LINE=HexColor("#ded6cd")
CREAM=HexColor("#faf7f1")
W,H=612,792

def register_fonts():
    names={
        "Display":"LibreBaskerville-Regular.ttf",
        "DisplayBold":"LibreBaskerville-Bold.ttf",
        "Text":"SourceSerif4-Regular.ttf",
        "TextBold":"SourceSerif4-Bold.ttf",
        "TextItalic":"SourceSerif4-Italic.ttf",
        "Sans":"SourceSans3-Regular.ttf",
        "SansBold":"SourceSans3-Bold.ttf",
    }
    for name,file in names.items():
        path=FONTS/file
        if not path.exists():raise FileNotFoundError(f"Prepare embedded fonts first: {path}")
        pdfmetrics.registerFont(TTFont(name,str(path)))
    pdfmetrics.registerFontFamily("Text",normal="Text",bold="TextBold",italic="TextItalic")

def draw_atlas(output:Path,offset:int,appendix:bool):
    c=canvas.Canvas(str(output),pagesize=(W,H),pageCompression=1)
    c.setTitle("DSM Foundations — Appendix C Diagnostic Comparison Atlas" if appendix else "DSM Diagnostic Comparison Atlas — Standalone Review")
    c.setAuthor("Sophia Korb Cohon, PhD")
    c.setSubject("Educational differential diagnosis; clinical review required")
    def line(x1,y,x2,color=LINE,width=.75):
        c.setStrokeColor(color);c.setLineWidth(width);c.line(x1,y,x2,y)
    def text(value,x,y,font="Text",size=11,color=INK):
        c.setFillColor(color);c.setFont(font,size);c.drawString(x,y,value)
    def label(value,x,y,size=9,color=WINE):
        text(value,x,y,"SansBold",size,color)
    def para(value,x,y,width,font="Text",size=10.8,leading=16.5,maxheight=120,color=INK):
        st=ParagraphStyle("flow",fontName=font,fontSize=size,leading=leading,textColor=color)
        p=Paragraph(escape(value),st);_,height=p.wrap(width,maxheight)
        if height>maxheight:raise RuntimeError(f"Too much content for {font}: {value[:45]}")
        p.drawOn(c,x,y-height);return y-height
    def title(value,y=668):
        size=27
        if pdfmetrics.stringWidth(value,"DisplayBold",size)<=515:
            text(value,48,y,"DisplayBold",size);return y-23
        lines=simpleSplit(value,"DisplayBold",24,510)
        for i,part in enumerate(lines):
            text(part,48,y-28*i,"DisplayBold",24)
        return y-28*(len(lines)-1)-23
    def header(kicker,num):
        label("DSM FOUNDATIONS / APPENDIX C" if appendix else "DSM FOUNDATIONS",48,750,9.5)
        c.setFont("Sans",9);c.setFillColor(MUTED)
        c.drawRightString(564,750,"DIAGNOSTIC COMPARISON ATLAS")
        line(48,735,564,WINE,1.2);line(48,49,564)
        text("CLINICAL PRACTICE LIBRARY / EDUCATIONAL EDITION",48,33,"Sans",8.1,MUTED)
        c.setFillColor(WINE);c.setFont("SansBold",9)
        c.drawRightString(564,33,str(num+offset))
        label(kicker,48,711,9.2)
    def writing_line(x1,x2,y):
        line(x1,y,x2,HexColor("#bdb6b1"),.53)
    header("COMPANION REFERENCE / OCTOBER 2026" if appendix else "PRINT REVIEW / OCTOBER 2026",1)
    if appendix:label("APPENDIX C",48,684,11)
    text("Diagnostic",48,625,"DisplayBold",40)
    text("Comparison Atlas",48,580,"DisplayBold",36)
    line(48,560,141,WINE,2.5)
    para("Two conditions. One clear clinical question.",48,525,490,"Display",19,26,60,WINE)
    para("A reference for examining distinguishing patterns, shared features, and the evidence still needed.",48,455,510,"Text",12.6,22,90)
    label("INSIDE THIS VOLUME",48,350,10);line(48,339,564)
    for i,p in enumerate(PAIRS):
        x=48 if i<5 else 316
        y=312-42*(i%5)
        label(f"{i+1:02d}",x,y,9)
        parts=simpleSplit(p["a"]+" / "+p["b"],"Sans",8.6,210)
        for j,part in enumerate(parts[:2]):text(part,x+30,y-11*j,"Sans",8.6)
    para("For clinical education only. Verify complete DSM-5-TR criteria, longitudinal history, impairment, exclusions, safety and possible co-occurrence before diagnostic conclusions.",48,88,505,"Sans",8.7,13.5,45,MUTED)
    c.showPage()
    for i,p in enumerate(PAIRS,1):
        header(f"COMPARISON {i:02d} OF 10",i+1)
        end=title(p["a"]+" / "+p["b"])
        coltop=min(end-25,596)
        label("01 / "+p["a"].upper(),48,coltop,8.8)
        label("02 / "+p["b"].upper(),318,coltop,8.8)
        line(48,coltop-11,564)
        c.setFillColor(CREAM)
        c.rect(48,coltop-150,246,129,fill=1,stroke=0)
        c.rect(318,coltop-150,246,129,fill=1,stroke=0)
        para(p["a_text"],62,coltop-33,220,"Text",10.7,16.8,104)
        para(p["b_text"],331,coltop-33,220,"Text",10.7,16.8,104)
        y=coltop-182
        label("WHERE PRESENTATIONS OVERLAP",48,y,8.9)
        para(p["overlap"],48,y-16,511,"Text",10.8,16.7,63)
        y=y-92
        label("THE DISTINGUISHING QUESTION",48,y,8.9)
        para(p["question"],48,y-16,515,"Text",10.7,16.7,95)
        ws=y-125
        line(48,ws+16,564)
        label("CLINICAL REASONING / THREE-PART WORKSPACE",48,ws,8.7)
        edges=(48,220,392,564)
        for x in edges[1:-1]:
            c.setStrokeColor(LINE);c.setLineWidth(.7);c.line(x,ws-3,x,55)
        prompts=(("01 / SUPPORTS","Evidence for each hypothesis"),("02 / AGAINST","Evidence that contradicts"),("03 / MISSING","What still needs checking"))
        for k,(heading,prompt) in enumerate(prompts):
            x1,x2=edges[k],edges[k+1]
            label(heading,x1+6,ws-22,8.3)
            text(prompt,x1+6,ws-38,"Sans",8.0,MUTED)
            for j in range(4):writing_line(x1+6,x2-10,ws-60-j*21)
        c.showPage()
    header("DIFFERENTIAL ASSESSMENT / CHECKLIST",12)
    title("Before choosing a diagnosis",671)
    checks=[
        ("SYMPTOMS","Document the actual experiences and observations, not only checklist words."),
        ("TIMING","Identify onset, duration, developmental course, episodes, and baseline."),
        ("CONTEXT","Compare environments, culture, identity, relationships, and stressors."),
        ("FUNCTION","Record distress, impairment, supports, access, and remaining limitations."),
        ("EXCLUSIONS","Assess health, substances, medications, sleep and other plausible causes."),
        ("CO-OCCURRENCE","Do not force an either/or decision when both sets of criteria may be met."),
        ("SAFETY","Address urgent needs using appropriate assessment and referral protocols."),
        ("CRITERIA","Verify full DSM-5-TR criteria, specifiers, coding guidance, and current updates."),
    ]
    for j,(heading,body) in enumerate(checks):
        y=600-j*67
        c.setStrokeColor(WINE);c.setLineWidth(.9);c.rect(48,y-13,12,12,stroke=1,fill=0)
        label(heading,76,y-2,9);para(body,76,y-10,476,"Text",10.4,15,44)
        line(76,y-30,564)
    c.showPage()
    header("SOURCES AND LIMITS / REVIEW COPY",13)
    title("Clinical sources & limits")
    sources=[
        ("American Psychiatric Association","DSM-5-TR (2022) and current criteria/code updates — consult authorized text."),
        ("NIMH","OCD: obsessions and/or compulsions; bipolar disorder: episodes and lifetime course."),
        ("Merck Manual Professional","OCPD: pervasive perfectionism/order/control and impairment; distinguish from OCD."),
        ("SAMHSA / professional guidelines","For substance use, safety, assessment, and management beyond this atlas."),
    ]
    for j,(heading,body) in enumerate(sources):
        y=595-j*87
        label(heading.upper(),48,y,9.7);para(body,48,y-16,514,"Text",11,17.5,65)
        line(48,y-57,564)
    label("BOUNDARIES OF THIS REFERENCE",48,225,9.7)
    para("The summary panels simplify multidimensional diagnostic reasoning. They are not exact or exhaustive DSM criteria, do not assign likelihoods, and do not determine whether an individual meets a diagnosis. Editorial review does not equal independent clinical validation.",48,205,515,"Text",10.8,18,105)
    para("Designed for duplex or single-sided US Letter printing. Grayscale-compatible rules and text labels distinguish the two conditions without relying on color alone.",48,112,515,"Sans",9.4,15,50,MUTED)
    c.showPage();c.save()

def combine():
    original=fitz.open(MAIN)
    assert len(PAIRS)==10
    n=len(original)
    assert n>=80
    draw_atlas(SINGLE,0,False)
    draw_atlas(APPENDIX,n,True)
    append=fitz.open(APPENDIX)
    assert len(append)==13
    entries=original.get_toc()
    original.insert_pdf(append)
    entries.append([1,"Appendix C — Full Diagnostic Comparison Atlas",n+1])
    for idx,p in enumerate(PAIRS,1):
        entries.append([2,f"{idx:02d}. {p['a']} / {p['b']}",n+1+idx])
    entries.extend([[2,"Differential assessment checklist",n+12],
                    [2,"Clinical sources and limits",n+13]])
    original.set_toc(entries)
    # Additional clickable contents entry; fail if the contents page has grown into it.
    p=original[1]
    area=fitz.Rect(58,613,555,642)
    for w in p.get_text("words"):
        if fitz.Rect(w[:4]).intersects(area):
            raise RuntimeError("Contents page needs reflow before placing Appendix C entry")
    fontpath="/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf"
    p.insert_font(fontname="AtlasToc",fontfile=fontpath)
    p.draw_line((58,615),(554,615),color=(.86,.83,.8),width=.6)
    p.insert_text((58,632),"Appendix C / Diagnostic Comparison Atlas (10 comparisons)",fontname="AtlasToc",fontsize=11.7,color=(.16,.15,.15))
    p.insert_text((533,632),str(n+1),fontname="AtlasToc",fontsize=10.7,color=(.42,.16,.23))
    p.insert_link({"kind":fitz.LINK_GOTO,"from":fitz.Rect(54,618,555,637),"page":n})
    metadata={**original.metadata,"title":"DSM Foundations — Complete with Diagnostic Comparison Atlas","author":"Sophia Korb Cohon, PhD","subject":"Educational print-review edition with complete ten-pair appendix"}
    original.set_metadata(metadata)
    original.save(OUT,garbage=4,deflate=True)
    original.close();append.close()
    check=fitz.open(OUT)
    assert len(check)==n+13
    assert all(round(x.rect.width)==612 and round(x.rect.height)==792 for x in check)
    assert all(s in check[n].get_text() for s in ["APPENDIX C","Comparison Atlas"])
    assert sum("Sophia Korb Cohon, PhD" in page.get_text() for page in check)==1
    assert sum("CLINICAL REASONING / THREE-PART WORKSPACE" in check[n+i].get_text() for i in range(1,11))==10
    for i in range(1,11):
        content=check[n+i].get_text()
        for marker in ["SUPPORTS","AGAINST","MISSING"]:
            assert marker in content,(i,marker)
        for part in ["a_text","b_text","overlap","question"]:
            norm=lambda s:re.sub(r"\W+","",s).casefold()
            assert norm(PAIRS[i-1][part]) in norm(content),(i,part)
    assert len(check.get_toc())==len(entries)
    for pi,page in enumerate(check):
        for x0,y0,x1,y1,word,*_ in page.get_text("words"):
            if x0<33 or y0<13 or x1>580 or y1>779:
                raise RuntimeError(f"Text outside page {pi+1}: {word}")
    manifest={"pages":len(check),"foundations_pages":n,"appendix_pages":13,
              "comparisons":10,"three_part_workspaces":10,
              "appendix_start":n+1,"appendix_label":"Appendix C",
              "original_bookmarks":len(entries)-13,"total_bookmarks":len(entries),
              "source":"scripts/data/dsm-comparison-atlas-pairs.json",
              "release":"Review only; clinical specialist and PDF/UA signoff outstanding"}
    (BUILD/"dsm-foundations-with-atlas-manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")
    print(json.dumps(manifest,indent=2))

if __name__=="__main__":
    BUILD.mkdir(parents=True,exist_ok=True)
    register_fonts()
    combine()
