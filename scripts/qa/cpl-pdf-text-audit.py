"""Source-only PDF preflight for the 61 resource inventory files; never OCR or modify originals."""
import csv,json
from pathlib import Path
import fitz
root=Path(__file__).resolve().parents[2]
out=root/"review-artifacts"
out.mkdir(exist_ok=True)
with (root/"docs/qa/2026-11-12-all-resource-coverage-seed.csv").open(encoding="utf-8",newline="") as f:
    rows=[x for x in csv.DictReader(f) if x["asset_format"]=="PDF"]
assert len(rows)==61,len(rows)
result=[]
for r in rows:
    p=(root/r["source_path"].lstrip("/")).resolve()
    assert p.is_relative_to(root)
    record=dict(path=r["source_path"],pages=0,selectableTextPages=0,noTextPages=0,wordCount=0,formFields=0,status="UNTESTED",error=None,pdfUa="NOT_VERIFIED",visualAndPrint="NOT_VERIFIED")
    try:
        with fitz.open(p) as doc:
            record["pages"]=len(doc)
            for page in doc:
                words=page.get_text("words")
                record["wordCount"]+=len(words)
                record["selectableTextPages"]+=bool(words)
                record["noTextPages"]+=not bool(words)
                record["formFields"]+=len(list(page.widgets() or []))
            record["status"]="NO_SELECTABLE_WORDS" if not record["selectableTextPages"] else "PARTIAL_TEXT" if record["noTextPages"] else "SELECTABLE_WORDS_DETECTED"
    except Exception as e:
        record["status"]="PARSE_ERROR"
        record["error"]=type(e).__name__+": "+str(e)[:140]
    result.append(record)
summary=dict(totalFiles=61,totalPages=sum(x["pages"] for x in result),noSelectableTextFiles=sum(x["status"]=="NO_SELECTABLE_WORDS" for x in result),partialTextFiles=sum(x["status"]=="PARTIAL_TEXT" for x in result),parseErrors=sum(x["status"]=="PARSE_ERROR" for x in result))
(out/"cpl-pdf-text-audit.json").write_text(json.dumps(dict(summary=summary,files=result),indent=2)+"\n")
print("PDF_SUMMARY "+json.dumps(summary))
for r in result:print("PDF_FILE "+json.dumps(r))
if summary["parseErrors"]:raise SystemExit("A PDF could not be read")
