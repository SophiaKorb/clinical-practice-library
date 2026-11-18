#!/usr/bin/env python3
"""Extract the 31 published 2026 TAY program entries from the original source PDF.

Read-only. Reproduces the text and source hyperlinks, with one explicit provider-URL
exception explained in the builder. Retains complete extraction audit evidence.
"""
from pathlib import Path
import fitz,re,json,os
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'resources/community/original-pdfs/Southern_Arizona_Youth_Transition_Resources_2026.pdf'
OUT=ROOT/'qa-artifacts/community-tay-redesign'
OUT.mkdir(parents=True,exist_ok=True)
d=fitz.open(SOURCE)
assert len(d)==13, f'Expected exactly 13 source pages, got {len(d)}'
s=d[12].get_text().splitlines();entries=[]
for i,t in enumerate(s):
 if re.fullmatch(r'p\.\s?\d{1,2}',t.strip()):
  assert i>0
  entries.append({'name':s[i-1].strip(),'page':int(t.strip()[2:])})
assert len(entries)==31,len(entries)
by_pg={}
for e in entries:
 assert 1<=e['page']<=13
 by_pg.setdefault(e['page'],[]).append(e)
issues=[]
for n,rec in by_pg.items():
 p=d[n-1];txt=p.get_text()
 for r in rec:
  pat=r'\s+'.join(map(re.escape,r['name'].split()))
  m=re.search(pat,txt)
  assert m, f'Source listing title not found: {n} {r["name"]}'
  r['span']=m.span()
 rec.sort(key=lambda r:r['span'][0]);
 for j,r in enumerate(rec):
  st=r['span'][1];en=rec[j+1]['span'][0] if j+1<len(rec) else len(txt)
  sect=txt[st:en]
  sect=re.split(r'\n(?:\d\s+[A-Z][^\n]+|Source and review method)',sect)[0]
  fields=re.split(r'(What it does:|First step:|Watch for:|Source:|Website to type or search:)',sect)
  r['preface']=' '.join(fields[0].split())
  for i in range(1,len(fields)-1,2):r[fields[i][:-1]]=' '.join(fields[i+1].split())
  for field in ['preface','What it does','First step','Watch for','Website to type or search']:
   assert r.get(field), f'Missing {field} for {r["name"]}'
  src_label=r.get('Source','').replace('  ',' ').strip()
  matches=[]
  for link in p.get_links():
   uri=link.get('uri','');rect=fitz.Rect(link['from'])
   if not uri.startswith('http'):continue
   box=' '.join(p.get_textbox(rect).split())
   if src_label and (src_label.casefold() in box.casefold() or box.casefold() in src_label.casefold()):
    matches.append((uri,box))
  # AZYP references are presented as separate ambiguous links in the source;
  # the builder substitutes a more specific official *current program index*,
  # not an invented direct intake link.
  if len(matches)!=1 and not r['name'].startswith('Arizona Youth Partnership'):
   issues.append((r['name'],src_label,matches))
  r['url']=matches[0][0] if len(matches)==1 else ''
  r.pop('span',None)
assert not issues, issues
assert len({e['name'] for e in entries})==31
(OUT/'tay-source-extract.json').write_text(json.dumps(entries,ensure_ascii=False,indent=2))
print('TAY_SOURCE_EXTRACTION_PASS 31 unique numbered programs; 13 original pages')