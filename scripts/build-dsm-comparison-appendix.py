#!/usr/bin/env python3
"""Rebuild the authored DSM Comparison Atlas and append it to the complete book.

Uses the retained authored 10-pair source and the same OFL editorial fonts as
DSM Foundations. Creates draft review PDFs only; never publishes anything.
"""
from __future__ import annotations
from pathlib import Path
from io import BytesIO
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
APPENDIX=BUILD/"dsm-comparison-atlas-appendix-a.pdf"
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
    """Two-page, actual overlapping-circle comparison spreads for all ten pairs.

    Each pair has a full-size Venn diagram, readable diagnostic definitions,
    then evidence, shared features, investigation bullets and 3 writing columns.
    Circle area is conceptual, not symptom prevalence or diagnostic probability.
    """
    c=canvas.Canvas(str(output),pagesize=(W,H),pageCompression=1)
    c.setTitle("DSM Foundations — Appendix A Diagnostic Comparison Atlas" if appendix else "DSM Diagnostic Comparison Atlas — Standalone Review")
    c.setAuthor("Sophia Korb Cohon, PhD")
    c.setSubject("Educational differential diagnosis; specialist clinical review still required")
    def rule(x1,y,x2,color=LINE,width=.8):
        c.setStrokeColor(color);c.setLineWidth(width);c.line(x1,y,x2,y)
    def text(value,x,y,font="Text",size=11,color=INK):
        c.setFillColor(color);c.setFont(font,size);c.drawString(x,y,str(value))
    def label(value,x,y,size=9,color=WINE):
        text(value,x,y,"SansBold",size,color)
    def paragraph(value,x,y,width,font="Text",size=10.8,leading=16.5,limit=150,color=INK):
        st=ParagraphStyle("flow",fontName=font,fontSize=size,leading=leading,textColor=color)
        p=Paragraph(escape(str(value)),st)
        _,height=p.wrap(width,500)
        if height>limit:raise RuntimeError(f"Text exceeds reserved space ({height}>{limit}): {str(value)[:60]}")
        p.drawOn(c,x,y-height)
        return y-height
    def bullets(values,x,y,width,fontsize=9.6,leading=14.1,gap=4):
        for value in values:
            c.setFillColor(WINE);c.circle(x+4,y-7,2.0,stroke=0,fill=1)
            bottom=paragraph(value,x+15,y,width-18,size=fontsize,leading=leading,limit=90)
            y=bottom-gap
        return y
    def heading(value,y=674):
        if pdfmetrics.stringWidth(value,"DisplayBold",25.5)<508:
            text(value,48,y,"DisplayBold",25.5)
            return y-25.5
        pieces=simpleSplit(value,"DisplayBold",22.8,508)
        for i,part in enumerate(pieces):
            text(part,48,y-27*i,"DisplayBold",22.8)
        return y-27*(len(pieces)-1)-26
    def footer(kicker,num):
        label("DSM FOUNDATIONS / APPENDIX A" if appendix else "DSM FOUNDATIONS",48,750,9.2)
        c.setFont("Sans",8.5);c.setFillColor(MUTED)
        c.drawRightString(564,750,"DIAGNOSTIC COMPARISON ATLAS")
        rule(48,735,564,WINE,1.15)
        rule(48,48,564)
        text("CLINICAL PRACTICE LIBRARY / EDUCATIONAL EDITION",48,32,"Sans",8,MUTED)
        c.setFillColor(WINE);c.setFont("SansBold",9)
        c.drawRightString(564,32,str(offset+num))
        label(kicker,48,712,9.0)
    def circle_text(lines,x,y,side=False):
        for i,line in enumerate(lines):
            width=pdfmetrics.stringWidth(line,"SansBold",10.6)
            if width>108:raise RuntimeError("Venn label too long: "+line)
            c.setFont("SansBold",10.6);c.setFillColor(INK)
            c.drawCentredString(x,y-i*15.7,line)
    def venn(p):
        # Two genuine overlapping circles; the intersection is a shared zone.
        # Meaning resides in the words and outline, not in any relative area.
        c.saveState()
        c.setFillColor(HexColor("#f3e7e8"))
        c.setStrokeColor(WINE);c.setLineWidth(1.45)
        c.circle(237,435,131,stroke=1,fill=1)
        c.setFillColor(HexColor("#e7edf0"))
        c.setStrokeColor(HexColor("#36596b"))
        c.circle(375,435,131,stroke=1,fill=1)
        c.restoreState()
        label("DISTINCTIVE",137,498,8.3)
        label("SHARED",286,498,8.3)
        label("DISTINCTIVE",409,498,8.3)
        circle_text(p["venn_unique_a"],170,448)
        circle_text(p["venn_shared"],306,447)
        circle_text(p["venn_unique_b"],444,448)
        text("Schematic only; circle sizes do not indicate prevalence, likelihood or symptom counts.",
             66,291,"Sans",8.3,MUTED)
    def workspace(y):
        rule(48,y+14,564)
        label("CLINICAL REASONING / WRITING WORKSPACE",48,y,8.8)
        edges=(48,220,392,564)
        for x in edges[1:-1]:
            rule(x,y-4,56)
        zones=(("01 / SUPPORTS","Evidence for each hypothesis"),
               ("02 / AGAINST","Evidence that contradicts"),
               ("03 / MISSING","What still needs checking"))
        for i,(title,prompt) in enumerate(zones):
            x1,x2=edges[i],edges[i+1]
            label(title,x1+6,y-22,8.3)
            text(prompt,x1+6,y-38,"Sans",8.0,MUTED)
            for j in range(2):
                rule(x1+6,y-60-j*24,x2-9,HexColor("#c6bfba"),.5)

    # Front divider and reference index. Name is intentionally not repeated.
    footer("COMPANION REFERENCE / OCTOBER 2026" if appendix else "PRINT REVIEW / OCTOBER 2026",1)
    if appendix:label("APPENDIX A",48,687,10.5)
    text("Diagnostic",48,629,"DisplayBold",39)
    text("Comparison Atlas",48,583,"DisplayBold",34)
    rule(48,560,149,WINE,2.5)
    paragraph("Definitions, distinctive clinical features and meaningful overlap.",
              48,540,512,"Display",16.7,22,54,WINE)
    paragraph("Each pair has a Venn overview and a companion evidence sheet. The circles are conceptual, not a diagnostic score.",
              48,481,512,"Text",11.8,20,60)
    label("CONTENTS / STARTING PAGES",48,365,9.8)
    rule(48,354,564)
    for i,p in enumerate(PAIRS):
        x=48 if i<5 else 314
        y=329-42*(i%5)
        label(f"{i+1:02d}",x,y,8.7)
        parts=simpleSplit(p["a"]+" / "+p["b"],"Sans",8.2,193)
        for j,part in enumerate(parts[:2]):
            text(part,x+27,y-11*j,"Sans",8.2)
        c.setFont("SansBold",8.2);c.setFillColor(WINE)
        c.drawRightString(x+242,y,str(offset+2+2*i))
    paragraph("Educational reference only; use current authorized DSM-5-TR criteria and qualified assessment. These diagrams are not diagnostic instruments.",
              48,91,506,"Sans",8.5,13.2,41,MUTED)
    c.showPage()

    for number,p in enumerate(PAIRS,1):
        # Page 1: diagnostic definitions and literal overlapping circles.
        footer(f"COMPARISON {number:02d} OF 10 / OVERVIEW",2+2*(number-1))
        titlebottom=heading(p["a"]+" / "+p["b"])
        if titlebottom<585:raise RuntimeError("Heading intrudes into Venn graphic")
        venn(p)
        label("DIAGNOSTIC DEFINITION",48,270,9.0)
        rule(48,259,564)
        label("01 / "+p["a"].upper(),48,242,8.2)
        label("02 / "+p["b"].upper(),318,242,8.2)
        left=paragraph(p["a_text"],48,229,242,size=10.3,leading=15.2,limit=155)
        right=paragraph(p["b_text"],318,229,242,size=10.3,leading=15.2,limit=155)
        if min(left,right)<73:raise RuntimeError(f"Definition approaches footer: {number}")
        c.showPage()

        # Page 2: readable bullet-points, evidence caveats and writing space.
        footer(f"COMPARISON {number:02d} OF 10 / CLINICAL DIFFERENTIAL",3+2*(number-1))
        heading("What distinguishes these conditions?",678)
        label("01 / "+p["a"].upper(),48,620,8.8)
        label("02 / "+p["b"].upper(),318,620,8.8)
        rule(48,610,564)
        left=bullets(p["a_bullets"],48,590,239,9.5,13.7,4)
        right=bullets(p["b_bullets"],318,590,243,9.5,13.7,4)
        if min(left,right)<414:
            raise RuntimeError(f"Distinguishing bullets need more height for pair {number}: {left},{right}")
        rule(48,407,564)
        label("MEANINGFUL OVERLAP",48,392,8.8)
        y=bullets(p["shared_bullets"],48,379,511,9.55,13.7,3)
        if y<319:raise RuntimeError(f"Overlap section overflows: {number}")
        label("WHAT TO INVESTIGATE",48,313,8.8)
        y=bullets(p["investigate_bullets"],48,300,511,9.45,13.7,2.5)
        if y<204:raise RuntimeError(f"Investigation section overflows: {number}, {y}")
        # Caveat remains outside and readable, separate from the diagram.
        c.setFillColor(HexColor("#f8f1ed"))
        c.roundRect(48,169,516,35,5,stroke=0,fill=1)
        paragraph("CLINICAL CAUTION: "+p["caution"],58,195,496,
                  font="Sans",size=8.8,leading=11.8,limit=30,color=INK)
        workspace(150)
        c.showPage()

    footer("DIFFERENTIAL ASSESSMENT / CHECKLIST",22)
    heading("Before choosing a diagnosis",669)
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
    for i,(head,body) in enumerate(checks):
        y=600-i*67
        c.setStrokeColor(WINE);c.setLineWidth(.9);c.rect(48,y-13,12,12,stroke=1,fill=0)
        label(head,76,y-2,9)
        paragraph(body,76,y-10,476,size=10.4,leading=15,limit=44)
        rule(76,y-30,564)
    c.showPage()
    footer("SOURCES AND LIMITS / REVIEW COPY",23)
    heading("Clinical sources and limits")
    sources=[
        ("American Psychiatric Association","DSM-5-TR (2022); verify authorized criteria and current updates."),
        ("NIMH / BIPOLAR DISORDER","www.nimh.nih.gov/health/publications/bipolar-disorder"),
        ("MERCK MANUAL PROFESSIONAL / BIPOLAR","www.merckmanuals.com/professional/psychiatric-disorders/mood-disorders/bipolar-disorders"),
        ("MERCK MANUAL PROFESSIONAL / OCPD","www.merckmanuals.com/professional/psychiatric-disorders/personality-disorders/obsessive-compulsive-personality-disorder-ocpd"),
    ]
    for i,(head,body) in enumerate(sources):
        y=599-i*83
        label(head,48,y,8.7)
        paragraph(body,48,y-15,513,size=10.0,leading=16,limit=63)
        rule(48,y-56,564)
    label("CLINICAL BOUNDARIES",48,223)
    paragraph("These comparison sheets summarize selected differential questions rather than exhaustive diagnostic criteria. They are not screening instruments, severity scales, probabilities or independent validation. Use longitudinal history, medical/substance exclusions, safety assessment and the current authorized DSM-5-TR.",
              48,206,514,size=10.4,leading=17,limit=101)
    paragraph("Educational reference only. Confirm full criteria and current professional guidance before clinical use.",
              48,104,514,font="Sans",size=9.3,leading=15,limit=39,color=MUTED)
    c.showPage()
    c.save()

def set_numbered_contents(page, entries):
    """Typeset an accurate, fully clickable contents/index page from actual PDF destinations.

    Do not hard-code page numbers: use the bookmarks generated by the book and
    the appended comparison atlas. A rebuilt or repaginated lesson is reflected
    automatically in its index entry.
    """
    import unicodedata
    top_level=[(title,pageno) for depth,title,pageno in entries if depth==1]
    chapter_rows=[]
    for number in range(1,12):
        matches=[(title,pageno) for title,pageno in top_level
                 if re.match(rf"CHAPTER {number:02d} / ",title)]
        if len(matches)!=1:
            raise RuntimeError(f"Expected one bookmark for chapter {number}: {matches}")
        name,page_no=matches[0]
        chapter_rows.append((name.replace("CHAPTER ","",1).replace(" / ","  ",1),page_no))
    prefixes=[
        ("Appendix A —", "Appendix A / Diagnostic Comparison Atlas"),
        ("Appendix B /", "Appendix B / Full vocabulary"),
        ("Appendix C /", "Appendix C / Assessment worksheet"),
        ("Written and multiple-choice practice", "Practice questions 1-80"),
        ("Separate instructor answer key", "Instructor answer key"),
        ("References and credits", "References and credits"),

    ]
    section_rows=[]
    for source_prefix,title in prefixes:
        matches=[pageno for source,pageno in top_level if source.startswith(source_prefix)]
        if len(matches)!=1:
            raise RuntimeError(f"Expected one contents destination for {title}: {matches}")
        section_rows.append((title,matches[0]))
    all_rows=chapter_rows+section_rows
    if any(pageno<=1 for title,pageno in all_rows):
        raise RuntimeError("Contents page destination cannot point to page 1")
    for link in page.get_links():
        page.delete_link(link)
    # Replace only the body of the old, numberless contents page. Original page
    # header, rule, footer, and printed page number remain untouched.
    page.add_redact_annot(fitz.Rect(48,46,565,704),fill=(1,1,1))
    page.apply_redactions(images=0,graphics=1,text=0)
    # ReportLab's embedded OFL fonts retain correct ToUnicode maps for
    # searchable, numbered entries; PyMuPDF insert_text did not.
    overlay_bytes=BytesIO()
    sheet=canvas.Canvas(overlay_bytes,pagesize=(W,H),pageCompression=1)
    def write(x,y,value,font="Text",size=11,color=INK):
        sheet.setFont(font,size)
        sheet.setFillColor(color)
        sheet.drawString(x,H-y,str(value))
    def index_row(value,number,y):
        fontsize=11.1
        while pdfmetrics.stringWidth(value,"Text",fontsize)>433 and fontsize>9.4:
            fontsize-=0.2
        if pdfmetrics.stringWidth(value,"Text",fontsize)>433:
            raise RuntimeError("Index entry too wide: "+value)
        numerals=str(number)
        right=551-pdfmetrics.stringWidth(numerals,"Sans",10.7)
        left=58+pdfmetrics.stringWidth(value,"Text",fontsize)+13
        if left<right-10:
            sheet.setStrokeColor(HexColor("#cfc5bf"))
            sheet.setLineWidth(.7)
            sheet.setDash(1.3,2.8)
            sheet.line(left,H-y-3,right-8,H-y-3)
            sheet.setDash()
        write(58,y,value,size=fontsize)
        write(right,y,numerals,"Sans",10.7,WINE)
        page.insert_link({"kind":fitz.LINK_GOTO,"from":fitz.Rect(56,y-15,556,y+4),"page":number-1})
    write(58,83,"Contents and use","DisplayBold",24)
    for i,line in enumerate([
        "Lessons cover diagnostic reasoning through 33 worked cases.",
        "Practice questions appear once; the answer key uses question numbers.",
        "Select any entry to go directly to its printed page."
    ]):
        write(58,111+i*16,line,"Text",10.5)
    write(58,179,"LESSONS","SansBold",9.2,WINE)
    sheet.setStrokeColor(LINE);sheet.line(58,H-184,552,H-184)
    for i,(value,pageno) in enumerate(chapter_rows):
        index_row(value,pageno,205+22*i)
    write(58,459,"REFERENCE & PRACTICE","SansBold",9.2,WINE)
    sheet.setStrokeColor(LINE);sheet.line(58,H-464,552,H-464)
    for i,(value,pageno) in enumerate(section_rows):
        index_row(value,pageno,486+25*i)
    write(58,656,"Use the questions to identify what evidence is present,","Text",9.6)
    write(58,672,"what is missing and what could change the conclusion.","Text",9.6)
    sheet.save()
    overlay=fitz.open(stream=overlay_bytes.getvalue(),filetype="pdf")
    page.show_pdf_page(page.rect,overlay,0,overlay=True)
    overlay.close()
    return all_rows

def combine():
    """Build the book in reading order: lessons, Atlas A, glossary B, worksheet C."""
    original=fitz.open(MAIN)
    assert len(PAIRS)==10
    n=len(original)
    assert n>=60  # The compact print flow intentionally reduces page count.
    old_outline=original.get_toc()
    original_bookmark_count=len(old_outline)
    # Number of pages before the glossary. Insert Appendix A immediately here.
    glossary_hits=[page for depth,title,page in old_outline
                  if depth==1 and title.startswith("Appendix B / Full vocabulary")]
    worksheet_hits=[page for depth,title,page in old_outline
                  if depth==1 and title.startswith("Appendix C / Assessment worksheet")]
    assert len(glossary_hits)==1 and len(worksheet_hits)==1
    split=glossary_hits[0]-1
    assert split>30 and worksheet_hits[0]>split+1
    draw_atlas(SINGLE,0,False)
    draw_atlas(APPENDIX,split,True)
    appendix=fitz.open(APPENDIX)
    assert len(appendix)==23

    combined=fitz.open()
    combined.insert_pdf(original,from_page=0,to_page=split-1)
    combined.insert_pdf(appendix)
    combined.insert_pdf(original,from_page=split,to_page=n-1)

    early=[row for row in old_outline if row[2]<=split]
    late=[[depth,title,page+23] for depth,title,page in old_outline if page>split]
    atlas_outline=[[1,"Appendix A — Full Diagnostic Comparison Atlas",split+1]]
    for idx,pair in enumerate(PAIRS,1):
        overview=split+2+2*(idx-1)
        atlas_outline.extend([
            [2,f"{idx:02d}. {pair['a']} / {pair['b']} — Venn overview",overview],
            [3,"Definitions and shared / distinctive features",overview],
            [3,"Clinical differential and three-part workspace",overview+1]
        ])
    atlas_outline.extend([
        [2,"Differential assessment checklist",split+22],
        [2,"Clinical sources and limits",split+23]
    ])
    entries=early+atlas_outline+late
    combined.set_toc(entries)

    # Only trailing pages move. Rewrite their numeric footers, not their prose.
    numerals=fitz.Font(fontfile=str(FONTS/"SourceSans3-Regular.ttf"))
    for old_page in range(split,n):
        index=old_page+23
        page=combined[index]
        number=str(index+1)
        old_number=str(old_page+1)
        bottom_words=[w for w in page.get_text("words")
                      if w[1]>751 and w[0]>524 and w[2]<=555
                      and w[4]==old_number]
        assert len(bottom_words)==1,("Unable to locate old footer number",old_page+1,bottom_words)
        page.add_redact_annot(fitz.Rect(531,752,564,769),fill=(1,1,1))
        page.apply_redactions(images=0,graphics=1,text=0)
        page.insert_font(fontname="FooterSans",fontfile=str(FONTS/"SourceSans3-Regular.ttf"))
        x=554-numerals.text_length(number,fontsize=8.1)
        page.insert_text((x,762),number,fontname="FooterSans",fontsize=8.1,
                         color=(.35,.32,.32),overlay=True)

    indexed_rows=set_numbered_contents(combined[1],entries)
    combined.set_metadata({
        **original.metadata,
        "title":"DSM Foundations — Complete with Appendix A Diagnostic Comparison Atlas",
        "author":"Sophia Korb Cohon, PhD",
        "subject":"Educational print-review edition: Comparison Atlas A, vocabulary B, worksheet C"
    })
    combined.save(OUT,garbage=4,deflate=True)
    combined.close()
    appendix.close()

    check=fitz.open(OUT)
    assert len(check)==n+23
    assert all(round(page.rect.width)==612 and round(page.rect.height)==792 for page in check)
    assert all(term in check[split].get_text() for term in ("APPENDIX A","Comparison Atlas"))
    assert sum("Sophia Korb Cohon, PhD" in page.get_text() for page in check)==1
    assert sum("CLINICAL REASONING / WRITING WORKSPACE" in check[split+2+2*i].get_text() for i in range(10))==10
    for i,pair in enumerate(PAIRS):
        overview=check[split+1+2*i].get_text()
        clinical=check[split+2+2*i].get_text()
        norm=lambda value:re.sub(r"\W+","",value).casefold()
        for key in ("a_text","b_text"):
            assert norm(pair[key]) in norm(overview),(i+1,key)
        for line in pair["venn_unique_a"]+pair["venn_unique_b"]+pair["venn_shared"]:
            assert line in overview,("Missing Venn feature",i+1,line)
        for key in ("a_bullets","b_bullets","shared_bullets","investigate_bullets"):
            for value in pair[key]:
                assert norm(value) in norm(clinical),("Missing clinical distinction",i+1,key,value)
        for marker in ("SUPPORTS","AGAINST","MISSING","WHAT TO INVESTIGATE"):
            assert marker in clinical,(i+1,marker)
    assert len(check.get_toc())==len(entries)
    toc=check.get_toc()
    appendix_tops=[(title,pageno) for level,title,pageno in toc
                   if level==1 and title.startswith("Appendix ")]
    assert [(t.split(" ")[1],p) for t,p in appendix_tops]==[
        ("A",split+1),("B",glossary_hits[0]+23),("C",worksheet_hits[0]+23)
    ],appendix_tops
    index_page=check[1]
    index_text=index_page.get_text()
    index_links=index_page.get_links()
    assert len(indexed_rows)==17 and len(index_links)==17,(len(indexed_rows),len(index_links))
    for label,dest in indexed_rows:
        normspaces=lambda value:re.sub(r"\s+"," ",value).strip()
        assert normspaces(label) in normspaces(index_text),("Missing contents label",label)
        assert re.search(r"(?m)^"+str(dest)+r"$",index_text),("Missing printed page number",label,dest)
        assert any(link.get("page")==dest-1 for link in index_links),("Broken contents link",label,dest)
    for i,page in enumerate(check):
        words=page.get_text("words")
        for x0,y0,x1,y1,word,*_ in words:
            if x0<33 or y0<13 or x1>580 or y1>779:
                raise RuntimeError(f"Text outside page {i+1}: {word}")
        numbers=[w[4] for w in words if 750<w[1]<758 and w[0]>530 and w[4].isdigit()]
        assert numbers==[str(i+1)],("Wrong footer page number",i+1,numbers)
    # Verbatim chapter material; relocated pages have only new footer numbers.
    for i in range(n):
        target=i if i<split else i+23
        if i==1:continue
        oldpage=original[i].get_text()
        newpage=check[target].get_text()
        def clean_body(value):
            lines=value.splitlines()
            return "".join(line.strip() for line in lines
                           if line.strip() not in (str(i+1),str(target+1)))
        assert clean_body(oldpage)==clean_body(newpage),("Main content changed",i+1)
    original.close()
    manifest={
        "pages":len(check),
        "foundations_pages":n,
        "appendix_pages":23,
        "comparisons":10,
        "three_part_workspaces":10,
        "venn_diagrams":10,
        "pages_per_comparison":2,
        "appendix_start":split+1,
        "appendix_label":"Appendix A",
        "appendix_order":[
            {"name":"A","title":"Diagnostic Comparison Atlas","page":split+1},
            {"name":"B","title":"Full vocabulary","page":glossary_hits[0]+23},
            {"name":"C","title":"Working assessment worksheet","page":worksheet_hits[0]+23}
        ],
        "original_bookmarks":original_bookmark_count,
        "total_bookmarks":len(entries),
        "source":"scripts/data/dsm-comparison-atlas-pairs.json",
        "release":"Review only; clinical specialist and PDF/UA signoff outstanding"
    }
    (BUILD/"dsm-foundations-with-atlas-manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")
    print(json.dumps(manifest,indent=2))

if __name__=="__main__":
    BUILD.mkdir(parents=True,exist_ok=True)
    register_fonts()
    combine()
