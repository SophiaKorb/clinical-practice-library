// Generate a full offline HTML reviewer packet from repository source; never modify the CPL site.
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'../..');
const OUT=path.join(ROOT,'review-artifacts');
const SRC='resources/complete-resource-inventory.html';
const base='https://github.com/SophiaKorb/clinical-practice-library/blob/';
const branch='review/cpl-full-variant-provenance-20261112';
const escapeHtml=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
function entities(s){return String(s).replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&apos;/gi,"'").replace(/&#39;/gi,"'").replace(/&(?:ldquo|rdquo);/gi,'"').replace(/&(?:lsquo|rsquo);/gi,"'").replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>{const v=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n);return Number.isFinite(v)&&v>0&&v<=0x10ffff?String.fromCodePoint(v):'?';});}
function clean(s){return entities(String(s).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();}
function sha(s){return crypto.createHash('sha256').update(s).digest('hex').slice(0,16);}
function blocks(main){
 const b=[...main.matchAll(/<(h[1-6]|p|li|td|th|dt|dd|figcaption)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map(m=>({tag:m[1].toLowerCase(),text:clean(m[2])})).filter(x=>x.text.length);
 return b.length?b:[{tag:'text',text:clean(main)}];
}
function difference(a,b){
 const freq=new Map();
 for(const z of b)freq.set(z.text,(freq.get(z.text)||0)+1);
 const only=[];
 for(const z of a){const count=freq.get(z.text)||0;if(count)freq.set(z.text,count-1);else only.push(z);}
 return only;
}
const inventory=fs.readFileSync(path.join(ROOT,SRC),'utf8');
const records=[...inventory.matchAll(/<li class="resource-entry" data-legacy="false"><a href="([^"]+)">([\s\S]*?)<\/a>/g)].map(m=>({url:m[1],title:entities(m[2]).trim()}));
const byTitle=new Map();
for(const r of records){const k=r.title.toLowerCase(),v=byTitle.get(k)||[];v.push(r.url);byTitle.set(k,v);}
const sourceGroups=[...byTitle].filter(([,urls])=>urls.length>1).sort((a,b)=>a[0].localeCompare(b[0]));
assert.equal(sourceGroups.length,26,'Same-title groups changed; human reconciliation required');
const groups=sourceGroups.map(([title,urls],index)=>{
 const files=urls.map(url=>{
  const pathname=url.slice(1),full=path.resolve(ROOT,pathname);
  assert.ok(full.startsWith(ROOT+path.sep),'Path escapes checkout');
  const html=fs.readFileSync(full,'utf8'),main=(html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)||[])[1]||'';
  const normalized=main.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&(?:nbsp|amp|quot|rsquo|ldquo|rdquo);/g,' ').replace(/\s+/g,' ').trim();
  const metaLinks=[...html.matchAll(/<a\b[^>]*href="([^"]+)"/gi)].map(x=>x[1]).filter(x=>/\.pdf(?:$|[?#])/i.test(x));
  return {url,path:pathname,language:(html.match(/<html\b[^>]*lang="([^"]+)"/i)||[])[1]||'unmarked',documentTitle:clean((html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||''),
   sourceBytes:Buffer.byteLength(html),fileSha:sha(html),mainTextSha:sha(normalized),mainTextWords:normalized.split(/\s+/).filter(Boolean).length,
   mainText:clean(main),parts:blocks(main),pdfLinks:metaLinks,
   hasCopyrightNotice:/copyright|©|derechos reservados/i.test(html),
   hasAttribution:/\b(?:byline|creado por|curated by|created by)\b/i.test(html),
   role:pathname.includes('-practical-toolkit')?'practical toolkit':pathname.includes('-start-here')?'start-here guide':pathname.includes('/es/')?'Spanish-language handout':pathname.endsWith('/index.html')?'directory':'other resource'};
 });
 const pairs=[];
 for(let i=0;i<files.length;i++)for(let j=i+1;j<files.length;j++){
  const a=files[i],b=files[j];
  pairs.push({left:a.path,right:b.path,classification:a.fileSha===b.fileSha?'identical file bytes':a.mainTextSha===b.mainTextSha?'same normalized main text; file bytes differ':'different normalized main text'});
 }
 const baseline=files[0];
 const reviews=files.slice(1).map(other=>({file:other.path,added:difference(other.parts,baseline.parts),removed:difference(baseline.parts,other.parts)}));
 return {id:'group-'+String(index+1).padStart(2,'0'),title,files,pairs,reviews,priority:/suicid|seguridad|crisis|sustancias|reducir daños/i.test(title)?'P0 safety/translation':urls.some(u=>u.includes('/es/'))?'P1 translation/provenance':'P2 route/role',decision:'Human review required; no canonicalization authorized'};
});
const allFiles=groups.flatMap(g=>g.files),allPairs=groups.flatMap(g=>g.pairs);
assert.equal(allFiles.length,54);
assert.equal(new Set(allFiles.map(f=>f.url)).size,54);
const exact=allPairs.filter(p=>p.classification==='identical file bytes'),similar=allPairs.filter(p=>p.classification.startsWith('same normalized'));
assert.equal(exact.length,1,'Exact duplicate count changed');
assert.equal(similar.length,8,'Normalized same-main-text count changed');
const styles=[
':root{color-scheme:light;--ink:#182d31;--sub:#40585d;--line:#bcced0;--surface:#f8faf9;--accent:#155765}',
'*{box-sizing:border-box}html{scroll-behavior:auto}body{margin:0;background:#fff;color:var(--ink);font:16px/1.55 system-ui,Arial,sans-serif;overflow-wrap:anywhere}main,header,.group,.file,.decision{min-width:0}p,li,th,td,code{overflow-wrap:anywhere;word-break:normal}',
'a{color:#064f78;text-decoration:underline;text-underline-offset:2px;overflow-wrap:anywhere}',
':focus-visible{outline:3px solid #105f80;outline-offset:4px}.skip{position:fixed;top:-160px;left:12px;z-index:15;padding:12px;background:white;border:2px solid #124656}.skip:focus{top:10px}',
'header{background:#173841;color:#fff;padding:24px max(18px,calc((100% - 1200px)/2))}header p{max-width:80ch}header h1{margin:0;font-size:clamp(1.45rem,3vw,2.25rem)}',
'main{max-width:1200px;margin:auto;padding:24px 18px 72px}h2{font-size:1.45rem}h3{font-size:1.1rem;margin-top:22px}p{max-width:100ch}',
'.intro{padding:14px 18px;border-left:4px solid var(--accent);background:var(--surface)}',
'.toc ol{columns:2;column-gap:36px}.toc li{break-inside:avoid;margin-bottom:5px}',
'.group{border-top:3px solid #326873;padding-top:22px;margin:38px 0 50px}.group>h2{margin:0 0 8px}',
'.table-scroll{max-width:100%;overflow-x:auto;border:1px solid var(--line);border-radius:8px;padding:3px}',
'table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{border-bottom:1px solid #ccd7d9;padding:9px;vertical-align:top;overflow-wrap:anywhere;text-align:left}th{background:#eaf0ef;font-weight:700;font-size:.9rem}',
'.files th:first-child{width:40%}.diffs th:first-child{width:38%}',
'.columns{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,430px),1fr));gap:16px}',
'.file{padding:14px;border:1px solid var(--line);border-radius:10px;background:var(--surface);min-width:0}',
'.file h3{margin:0 0 6px}.file summary{font-weight:700;cursor:pointer;padding:8px 2px}.file pre{white-space:pre-wrap;overflow-wrap:anywhere;font:0.85rem/1.6 system-ui,sans-serif;background:#fff;padding:12px;border:1px solid #d9e1e2;max-height:48rem;overflow:auto}',
'.decision{border:2px solid #7c979c;padding:15px;margin-top:24px}.decision ul{margin:8px 0}.decision li{margin:5px 0}',
'.meta{color:var(--sub);font-size:.9rem}.small{font-size:.82rem}.diff-list li{margin-bottom:10px;overflow-wrap:anywhere}.tag{font-weight:700;color:#205c3e}',
'@media(max-width:680px){.toc ol{columns:1}.file pre{max-height:none}header{padding:22px 18px}th,td{font-size:.81rem;padding:6px}}',
'@media print{.skip,.toc{display:none!important}header{background:#fff;color:#000;padding:0 0 12px}main{padding:0}.group{break-before:page;margin:14px 0}.group:first-of-type{break-before:auto}.columns{display:block}.file{background:#fff;break-inside:avoid;margin:6px 0}.file pre{display:none}a{color:#111!important;text-decoration:underline}.table-scroll{overflow:visible}table{break-inside:auto}h2,h3{break-after:avoid}}'
].join('\n');
function link(f){return '<a href="'+escapeHtml(base+branch+'/'+f.path)+'">'+escapeHtml(f.path)+'</a>';}
function diffLine(x){return escapeHtml(x.tag.toUpperCase()+' · '+x.text);}
const sections=groups.map((g,i)=>{
 const table='<div class="table-scroll" role="region" tabindex="0" aria-label="File provenance for '+escapeHtml(g.title)+'"><table class="files"><thead><tr><th scope="col">File path / source link</th><th scope="col">Language and role</th><th scope="col">Bytes and words</th><th scope="col">SHA-256 file / main text</th><th scope="col">PDF and rights cues</th></tr></thead><tbody>'+
 g.files.map(f=>'<tr><th scope="row">'+link(f)+'</th><td>'+escapeHtml(f.language+' · '+f.role)+'</td><td>'+f.sourceBytes+' bytes; '+f.mainTextWords+' words</td><td><code>'+f.fileSha+'</code> / <code>'+f.mainTextSha+'</code></td><td>PDF links: '+f.pdfLinks.length+'; copyright cue: '+(f.hasCopyrightNotice?'present':'not detected')+'; attribution cue: '+(f.hasAttribution?'present':'not detected')+'</td></tr>').join('')+'</tbody></table></div>';
 const pairRows='<div class="table-scroll" role="region" tabindex="0" aria-label="Pair classifications for '+escapeHtml(g.title)+'"><table class="diffs"><thead><tr><th scope="col">Files compared</th><th scope="col">Evidence-only classification</th></tr></thead><tbody>'+
 g.pairs.map(p=>'<tr><th scope="row">'+escapeHtml(path.basename(p.left))+' / '+escapeHtml(path.basename(p.right))+'</th><td>'+escapeHtml(p.classification)+'</td></tr>').join('')+'</tbody></table></div>';
 const differences=g.reviews.map(r=>'<details><summary>Differences in source blocks: '+escapeHtml(path.basename(r.file))+' versus first file ('+r.added.length+' added, '+r.removed.length+' absent)</summary><div class="columns"><div><h4>Present in this version, not baseline</h4><ol class="diff-list">'+(r.added.length?r.added.map(x=>'<li>'+diffLine(x)+'</li>').join(''):'<li>No distinct paragraph/heading blocks detected</li>')+'</ol></div><div><h4>Present in baseline, not this version</h4><ol class="diff-list">'+(r.removed.length?r.removed.map(x=>'<li>'+diffLine(x)+'</li>').join(''):'<li>No distinct paragraph/heading blocks detected</li>')+'</ol></div></div></details>').join('');
 const allText='<div class="columns">'+g.files.map((f,j)=>'<div class="file" lang="'+escapeHtml(f.language)+'"><h3>'+escapeHtml(path.basename(f.path))+'</h3><p class="meta">File '+(j+1)+' of '+g.files.length+' · '+escapeHtml(f.role)+' · '+f.mainTextWords+' words</p><details><summary>Read full extracted main text</summary><pre>'+escapeHtml(f.mainText)+'</pre></details><p>'+link(f)+'</p></div>').join('')+'</div>';
 return '<section class="group" id="'+g.id+'" aria-labelledby="h-'+g.id+'"><h2 id="h-'+g.id+'">'+String(i+1).padStart(2,'0')+' · '+escapeHtml(g.title)+'</h2><p><strong>Review priority:</strong> '+escapeHtml(g.priority)+'. <strong>Status:</strong> '+escapeHtml(g.decision)+'</p>'+table+'<h3>File-level pair comparison</h3>'+pairRows+'<h3>Content block changes</h3><p class="meta">Paragraph and heading blocks are compared against the first listed file; navigation/footer changes may not appear here. Identical blocks do not establish equivalent rights, accessibility or clinical meaning.</p>'+differences+'<h3>Read individual versions</h3>'+allText+'<div class="decision"><h3>Human decision record — pending</h3><ul><li>☐ Clinical and safety meaning checked; all different blocks reconciled</li><li>☐ Spanish fidelity, reading level and audience checked where relevant</li><li>☐ Authorship, external assets, PDFs and reuse conditions checked</li><li>☐ Navigation and print differences reviewed</li><li>☐ Record keep both / revise / canonical proposal / block with rationale; no automated URL changes</li></ul><p>Reviewer: __________________ Credentials/role: ________________ Date: ______________</p><p>Decision and specific evidence: __________________________________________________________</p><p>Owner approval to act: NOT GIVEN</p></div></section>';
}).join('\n');
const toc='<nav class="toc" aria-label="Comparison group index"><h2>All 26 groups</h2><ol>'+groups.map(g=>'<li><a href="#'+g.id+'">'+escapeHtml(g.title)+'</a> ('+g.files.length+' files)</li>').join('')+'</ol></nav>';
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>CPL: 26-group version comparison — human review only</title><style>'+styles+'</style></head><body><a class="skip" href="#main">Skip to review packet</a><header><h1>CPL — all 26 repeated-title groups</h1><p>Complete offline comparison of 54 existing source files. Generated for qualified human reviewers only; no production publication, merger, clinical approval, or rights clearance is implied.</p></header><main id="main" tabindex="-1"><div class="intro"><p><strong>Source version:</strong> '+escapeHtml(process.env.HEAD_SHA||'local review branch')+' · <strong>Generated:</strong> '+escapeHtml(new Date().toISOString().slice(0,10))+'. <strong>Evidence:</strong> '+groups.length+' groups, '+allFiles.length+' URLs; '+exact.length+' byte-identical pair, '+similar.length+' additional same-visible-main-text pair(s) despite differing file bytes.</p><p><strong>How to review:</strong> choose a group below, compare source hashes and block differences, expand each file to read its entire extracted main text, then complete a decision record. Links open the exact review-branch source. Do not upload PHI or rely on this packet to clear copyright, clinical or publication requirements.</p></div>'+toc+sections+'<p class="small">Automated grouping uses exact displayed titles, Git file bytes and normalized main-body text. It does not check semantic equivalence, instrument permissions or clinical validity. All reviewer decisions remain pending.</p></main></body></html>';
const summary={version:1,sourceHead:process.env.HEAD_SHA||null,createdOn:new Date().toISOString().slice(0,10),groupCount:groups.length,fileCount:allFiles.length,exactFilePairs:exact.length,sameMainTextNonidenticalFilePairs:similar.length,groups:groups.map(g=>({id:g.id,title:g.title,priority:g.priority,fileCount:g.files.length,pairs:g.pairs,files:g.files.map(f=>({path:f.path,language:f.language,role:f.role,fileSha:f.fileSha,mainTextSha:f.mainTextSha,wordCount:f.mainTextWords,pdfCount:f.pdfLinks.length}))}))};
fs.mkdirSync(OUT,{recursive:true});
fs.writeFileSync(path.join(OUT,'cpl-variant-review.html'),html,'utf8');
fs.writeFileSync(path.join(OUT,'cpl-variant-manifest.json'),JSON.stringify(summary,null,2)+'\n','utf8');
console.log('PASS packet generated: '+groups.length+' groups / '+allFiles.length+' files / '+exact.length+' exact pairs / '+similar.length+' same-main-text pairs; HTML '+Buffer.byteLength(html)+' bytes');
