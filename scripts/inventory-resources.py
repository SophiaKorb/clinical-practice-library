"""Inventory current resources and all fetched branch tips; report reachability, not clinical approval."""
import subprocess,json,hashlib,re
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
ROOT=Path(__file__).resolve().parents[1]
class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.title='';self.intitle=False
 def handle_starttag(self,t,a):
  d=dict(a)
  if t=='title':self.intitle=True
  if t=='a' and d.get('href'):self.links.append(d['href'])
 def handle_endtag(self,t):
  if t=='title':self.intitle=False
 def handle_data(self,d):
  if self.intitle:self.title+=d
paths=sorted(p for p in ROOT.rglob('*') if '.git' not in p.parts and p.suffix.lower() in {'.html','.pdf','.docx','.pptx','.xlsx'})
records=[];edges={};hashes={}
for p in paths:
 rel=p.relative_to(ROOT).as_posix();b=p.read_bytes();sha=hashlib.sha256(b).hexdigest();hashes.setdefault(sha,[]).append(rel)
 rec={'path':rel,'bytes':len(b),'sha256':sha,'retained_legacy':rel.startswith('legacy/')}
 if p.suffix=='.html':
  parser=Links();parser.feed(b.decode('utf8'));rec['title']=parser.title;targets=[]
  for href in parser.links:
   u=urlsplit(href)
   if u.scheme or u.netloc:continue
   raw=unquote(u.path);q=ROOT/raw.lstrip('/') if raw.startswith('/') else p.parent/raw
   if not raw:q=p
   if q.is_dir():q=q/'index.html'
   if not q.exists() and not q.suffix:q=q.with_suffix('.html')
   try:targets.append(q.resolve().relative_to(ROOT).as_posix())
   except ValueError:pass
  edges[rel]=targets
 records.append(rec)
seen=set();todo=['index.html']
while todo:
 p=todo.pop()
 if p in seen:continue
 seen.add(p);todo.extend(edges.get(p,[]))
for rec in records:rec['reachable_from_home']=rec['path'] in seen
branches={}
refs=subprocess.check_output(['git','for-each-ref','--format=%(refname:short)','refs/remotes/origin'],cwd=ROOT,text=True).splitlines()
current={r['path'] for r in records}
for ref in refs:
 if ref.endswith('/HEAD'):continue
 files=subprocess.check_output(['git','ls-tree','-r','--name-only',ref],cwd=ROOT,text=True).splitlines()
 resources=[p for p in files if Path(p).suffix.lower() in {'.html','.pdf','.docx','.pptx','.xlsx'}]
 branches[ref]={'commit':subprocess.check_output(['git','rev-parse',ref],cwd=ROOT,text=True).strip(),'resource_count':len(resources),'absent_from_current':sorted(set(resources)-current)}
report={'scope':'Current checkout and all fetched branch tips. Reachability is hyperlink-based; dynamic destinations may need review. Duplicate hashes are not deletion recommendations.','resources':records,'exact_duplicate_groups':[v for v in hashes.values() if len(v)>1],'branches':branches}
out=ROOT/'docs/qa/resource-inventory.json';out.write_text(json.dumps(report,indent=2)+'\n')
print(f'{len(records)} resources; {sum(r["reachable_from_home"] for r in records)} reachable; {len(branches)} branch tips; {len(report["exact_duplicate_groups"])} exact duplicate groups')
