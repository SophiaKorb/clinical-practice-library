"""Review-only checks for Phase 8 topic companions.

Run from repository root after installing reportlab and pymupdf:
    python scripts/qa-topic-pdfs.py

Generates all 25 PDFs locally in the checked-out workspace. Does not commit,
publish, upload or approve generated files. Inspect visual layouts separately.
"""
from pathlib import Path
import subprocess
import sys
import runpy

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "scripts" / "expansion-topics.py"
GENERATOR = ROOT / "scripts" / "create-topic-pdfs.py"

try:
    import fitz
except ImportError:
    raise SystemExit("Install PyMuPDF: python -m pip install pymupdf")

topics = runpy.run_path(str(SOURCE))["TOPICS"]
assert len(topics) == 25, f"Expected 25 topics, found {len(topics)}"
output_dir = ROOT / "resources" / "downloads"
output_dir.mkdir(parents=True, exist_ok=True)
subprocess.run([sys.executable, str(GENERATOR), "--waves", "5"], cwd=ROOT, check=True)

issues = []
for topic in topics:
    slug = topic["slug"]
    pdf = output_dir / f"topic-{slug}.pdf"
    if not pdf.exists():
        issues.append(f"{slug}: missing generated PDF")
        continue
    with fitz.open(pdf) as doc:
        if len(doc) != 1:
            issues.append(f"{slug}: expected exactly one page, found {len(doc)}")
        for page in doc:
            blocks = page.get_text("dict")["blocks"]
            found_text = page.get_text().lower()
            for phrase in ("original unvalidated teaching aid",
                           "qualified clinical review pending"):
                if phrase not in found_text:
                    issues.append(f"{slug}: missing footer text: {phrase}")
            for title, _ in topic["diagram"]:
                # PDF text can wrap, so check only the diagram node title.
                if title.lower() not in found_text:
                    issues.append(f"{slug}: diagram label not extractable: {title}")
            for block in blocks:
                if block.get("type") != 0:
                    continue
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        x0, y0, x1, y1 = span["bbox"]
                        if x0 < 0 or y0 < 0 or x1 > page.rect.width or y1 > page.rect.height:
                            issues.append(f"{slug}: text out of page bounds: {span['text'][:60]}")
            if "not a required sequence" not in found_text and slug != "learning-instruction-access":
                issues.append(f"{slug}: missing nonsequence warning")

print(f"Review-only PDF structural QA: {len(topics)} topics checked; {len(issues)} findings")
for issue in issues:
    print("FAIL:", issue)
if issues:
    sys.exit(1)
print("PASS: one-page structure, readable labels, basic footer and page-bounds checks")
print("NOT CHECKED: spatial parity, glyph rendering, clipping within diagram shapes,")
print("assistive technology, actual print dialog, qualified clinical review or publication.")
