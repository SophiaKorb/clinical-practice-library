"""Structural PDF checks across current and retained CPL downloads; no visual approval."""
from pathlib import Path
import json
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]
records=[]
for p in ROOT.rglob('*.pdf'):
 if any(part in p.relative_to(ROOT).parts for part in ['tmp','output','.git','node_modules']):continue
 record={'path':str(p.relative_to(ROOT)),'bytes':p.stat().st_size}
 try:
  reader=PdfReader(p,strict=True)
  fields=reader.get_fields() or {};widgets=[];issues=[]
  for page in reader.pages:
   for ref in page.get('/Annots',[]):
    obj=ref.get_object()
    if obj.get('/Subtype')!='/Widget':continue
    node=obj
    while not node.get('/T') and node.get('/Parent'):node=node['/Parent'].get_object()
    name=node.get('/T');widgets.append(name)
    if name not in fields:issues.append('orphan widget '+str(name))
    elif fields[name].get('/V')!=node.get('/V'):issues.append('field/widget value disagreement '+str(name))
  if fields and set(fields)-set(widgets):issues.append('canonical fields without page widgets')
  if issues:raise ValueError('; '.join(issues))
  record.update(pages=len(reader.pages),text_characters=sum(len(page.extract_text() or '') for page in reader.pages),fields=len(fields),widgets=len(widgets),status='structurally readable; field/widget consistency checked')
  if not reader.pages:raise ValueError('no pages')
 except Exception as e:record.update(status='failed',error=str(e))
 records.append(record)
report={'scope':'All PDF downloads in the checkout except temporary/output files. Parsing and page/text counts do not establish visual layout, form semantics, accessibility, clinical suitability, or copyright permission.','resources':records}
(ROOT/'docs/qa/pdf-integrity-audit.json').write_text(json.dumps(report,indent=2)+'\n')
failed=[r for r in records if r['status']=='failed'];print(len(records),'PDF files;',len(failed),'structural failures')
for r in failed:print(r)
raise SystemExit(bool(failed))
