#!/usr/bin/env python3
"""Fail a review build if canonical course passages silently disappear from the PDF."""
from pathlib import Path
import json, re, unicodedata
import fitz
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[1]
HTML=ROOT/"resources/training/dsm-from-zero.html"
PDF=ROOT/"build/dsm-foundations-complete-review-book.pdf"

def normalize(t):
    t=" ".join(str(t).split())
    return (unicodedata.normalize("NFKC",t)
        .replace("–","-").replace("—","-").replace("’","'")
        .replace("“",'"').replace("”",'"'))

def main():
    soup=BeautifulSoup(HTML.read_text(encoding="utf-8"),"html.parser")
    doc=fitz.open(PDF)
    full=normalize(" ".join(page.get_text() for page in doc))
    groups={
      "case_titles":[t.find("strong") for t in soup.select(".worked-example")],
      "case_step_bodies":soup.select(".worked-example ol li p"),
      "concept_map_nodes":soup.select(".concept-stage .relation-node b"),
      "concept_map_explanations":soup.select(".concept-stage .relation-node span"),
      "glossary_terms":soup.select(".vocab-entry dt"),
      "glossary_definitions":soup.select(".vocab-entry dd"),
      "quiz_stems":[q.find("p",recursive=False) for q in soup.select(".check[data-quiz]")],
      "quiz_options":soup.select(".check[data-quiz] button[data-answer]"),
      "Maya_Eli_context":soup.select("#lesson-8 .case-grid p"),
    }
    expected=dict(case_titles=33,case_step_bodies=132,concept_map_nodes=45,
                  concept_map_explanations=45,glossary_terms=36,glossary_definitions=36,
                  quiz_stems=80,quiz_options=253,Maya_Eli_context=6)
    findings={}
    for name,elements in groups.items():
        assert len(elements)==expected[name],(name,len(elements),expected[name])
        missing=[]
        for el in elements:
            t=normalize(el.get_text(" ",strip=True))
            if len(t)>=40 and t[:45] not in full:
                missing.append(t[:80])
        findings[name]={"expected":len(elements),"missing":missing}
        assert not missing,(name,missing[:5])
    for clinical_section in [
        "Personality disorders are more complicated",
        "What diagnosis contributes",
        "Impaired control",
        "Safety: assess withdrawal",
        "Case A: Maya",
        "Case B: Eli",
        "Continued use despite recurring relationship problems",
        "What is happening?",
    ]:
        assert normalize(clinical_section) in full,("Omitted clinical teaching",clinical_section)
    assert len(doc.get_toc())>=125
    assert all(len(p.get_text().strip())>=150 for p in doc),"Empty/near empty print page"
    assert all(round(p.rect.width)==612 and round(p.rect.height)==792 for p in doc)
    assert not [(n+1,w) for n,p in enumerate(doc) for w in p.get_text("words")
                if w[0]<24 or w[1]<14 or w[2]>p.rect.width-22 or w[3]>p.rect.height-18]
    print(json.dumps({"result":"PASS","pages":len(doc),"bookmarks":len(doc.get_toc()),
                      "canonical_text_parity":findings,"tagged_pdf_ua":False},indent=2))
if __name__=="__main__":main()
