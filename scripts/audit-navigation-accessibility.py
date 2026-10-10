"""Source-level audit; deliberately does not claim browser or clinical approval."""
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
from urllib.parse import urlsplit
import json
ROOT=Path(__file__).resolve().parents[1]
class Audit(HTMLParser):
 def __init__(self,s):
  super().__init__();self.ids=[];self.labels=[];self.controls=[];self.h1=0;self.lang=False;self.alt=[];self.legacy=[];self.stack=[];self.footers=0;self.feed(s)
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if a.get('id'):self.ids.append(a['id'])
  if t=='html':self.lang=bool(a.get('lang'))
  if t=='h1':self.h1+=1
  if t=='footer':self.footers+=1
  if t=='label' and a.get('for'):self.labels.append(a['for'])
  if t in ['input','select','textarea'] and a.get('type') not in ['hidden','button','submit']:
   self.controls.append((a,'label' in self.stack))
  if t=='img' and 'alt' not in a:self.alt.append(a.get('src',''))
  if t=='a' and (a.get('href','').startswith('/legacy/') or urlsplit(a.get('href','')).netloc=='clinical-practice-library.vercel.app'):self.legacy.append(a['href'])
  if t not in ['input','img','br','hr','meta','link','source','wbr','area','base','embed','param','track']:self.stack.append(t)
 def handle_endtag(self,t):
  if t in self.stack:
   ix=len(self.stack)-1-self.stack[::-1].index(t);self.stack=self.stack[:ix]
issues=[];versionlinks=[];pages=0
for p in ROOT.rglob('*.html'):
 rel=p.relative_to(ROOT)
 if any(x in rel.parts for x in ['legacy','preview','tmp','.git','node_modules']):continue
 pages+=1;a=Audit(p.read_text());found=[]
 for id,n in Counter(a.ids).items():
  if n>1:found.append('duplicate ID: '+id)
 if not a.lang:found.append('missing html language')
 if a.h1!=1:found.append('h1 count: '+str(a.h1))
 if a.footers>1:found.append('multiple footer elements: '+str(a.footers))
 for c,wrapped in a.controls:
  if not wrapped and c.get('id') not in a.labels and not c.get('aria-label') and not c.get('aria-labelledby'):found.append('unnamed control: '+str(c.get('id',c.get('name','unnamed'))))
 for src in a.alt:found.append('missing image alt: '+src)
 if found:issues.append({'path':str(rel),'issues':found})
 if a.legacy:versionlinks.append({'path':str(rel),'links':a.legacy,'review':'Explicit retained-version access; manually inspect intent.'})
report={'scope':'Current HTML except legacy and preview; source-level checks only. Wrapped labels are recognized. No rendered, screen-reader, clinical, contrast, or mobile approval is inferred.','pages':pages,'issues':issues,'cross_version_links':versionlinks}
(ROOT/'docs/qa/navigation-accessibility-audit.json').write_text(json.dumps(report,indent=2)+'\n')
print(pages,'current HTML pages;',len(issues),'pages with source-level findings;',len(versionlinks),'pages with explicit retained-version links')
for x in issues:print(x)

raise SystemExit(bool(issues))
