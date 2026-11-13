// Per-resource external-citation register. Structural inventory only; no remote requests or clinical approval.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(ROOT,'review-artifacts');
function read(p){return fs.readFileSync(path.join(ROOT,p),'utf8')}
function json(p){return JSON.parse(read(p))}
const lines=read('docs/qa/2026-11-12-all-resource-coverage-seed.csv').trimEnd().split(/\r?\n/);
const header=lines.shift().split(',');
const records=lines.map((s,i)=>{
 const vals=[...s.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g)].map(x=>x[1].replace(/""/g,'"'));
 assert.equal(vals.length,header.length,'Malformed seed row '+(i+2));
 return Object.fromEntries(header.map((h,j)=>[h,vals[j]]));
});
assert.equal(records.length,802);
function normalizeUrl(s){
 try{const u=new URL(s);if(!['http:','https:'].includes(u.protocol))return null;u.hash='';return (u.origin+u.pathname.replace(/\/+$/,'')+(u.search||'')).toLowerCase()}catch{return null}
}
const evidence=[];
for(const r of json('docs/qa/2026-11-12-primary-source-ledger.json').records){
 evidence.push({id:r.id,url:r.sourceUrl,paths:[r.cplFile],clinicalApproved:r.clinicalApproved,rightsCleared:r.rightsCleared,category:'preexisting comparison'});
}
for(const r of json('docs/qa/2026-11-12-provenance-rights-extension.json').records){
 evidence.push({id:r.id,url:r.url,paths:r.relatedCpl,clinicalApproved:false,rightsCleared:false,category:r.category});
}
for(const r of json('docs/qa/2026-11-12-comprehensive-claim-evidence.json').records){
 evidence.push({id:r.id,url:r.sourceUrl,paths:r.targetFiles,clinicalApproved:r.clinicalApproved,rightsCleared:r.rightsApproved,category:'dated narrow claim'});
}
const rightsUncleared=evidence.some(r=>r.clinicalApproved!==false||r.rightsCleared!==false);
assert.equal(rightsUncleared,false,'Previously reviewed source evidence must not be construed as clearance');
const evidenceMap=new Map();
for(const r of evidence){for(const p of r.paths||[]){
 const key='/'+p.replace(/^\/+/,'')+'\u0000'+normalizeUrl(r.url);
 const a=evidenceMap.get(key)||[];a.push(r.id);evidenceMap.set(key,a);
}}
function textify(s){return s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/&amp;/gi,'&').replace(/&nbsp;/gi,' ').replace(/&quot;/gi,'"').replace(/&#39;/gi,"'").replace(/\s+/g,' ').trim()}
const links=[],resources=[];
for(const r of records){
 if(r.asset_format!=='HTML')continue;
 const s=read(r.source_path.replace(/^\/+/,''));
 const re=/<a\b[^>]*\bhref\s*=\s*(["'])(https?:\/\/[^"'<>]+)\1[^>]*>([\s\S]*?)<\/a>/gi;
 let match,n=0;
 while((match=re.exec(s))){
  const url=match[2].trim(),norm=normalizeUrl(url);if(!norm)continue;
  const host=new URL(url).hostname.toLowerCase(),ids=evidenceMap.get(r.source_path+'\u0000'+norm)||[];
  links.push({resource:r.source_path,inventoryScope:r.inventory_scope,priority:r.triage_priority_heuristic,
   title:r.display_title,anchor:textify(match[3]).slice(0,160),url,host,matchedEvidenceIds:ids,
   remoteRetrieval:'NOT_CHECKED_BY_REGISTER',clinicalSourceAccuracy:'NOT_VERIFIED',
   rightsClearance:'PENDING_HUMAN',publicationApproval:'NOT_AUTHORIZED'});
  n++;
 }
 resources.push({resource:r.source_path,scope:r.inventory_scope,priority:r.triage_priority_heuristic,
    externalLinksDetected:n,sourceAssertion:n?'LINKS_PRESENT_CONTENT_UNVERIFIED':'NO_EXTERNAL_ANCHORS_DETECTED',
    claimsVerified:'NOT_COMPREHENSIVELY_REVIEWED',clinicalApproval:'PENDING_HUMAN',
    rightsApproval:'PENDING_HUMAN',publicationApproval:'NOT_AUTHORIZED'});
}
assert.equal(resources.length,741,'Every HTML resource needs an external-source coverage row');
const byHost={};for(const l of links)byHost[l.host]=(byHost[l.host]||0)+1;
const zero=resources.filter(r=>r.externalLinksDetected===0);
const p01zero=zero.filter(x=>x.scope==='current'&&/P0_|P1_/.test(x.priority));
const summary={generatedAt:new Date().toISOString().slice(0,10),sourceSha:process.env.HEAD_SHA||null,htmlResources:741,
 linkedSourcesExtracted:links.length,uniqueSourceUrls:new Set(links.map(x=>normalizeUrl(x.url))).size,
 distinctExternalHosts:Object.keys(byHost).length,resourcesWithNoExternalAnchors:zero.length,
 currentP0P1WithNoExternalAnchors:p01zero.length,
 narrowlyCheckedSourceEvidenceIds:evidence.length,
 exactUrlAndPathMatchedEvidenceLinks:links.filter(x=>x.matchedEvidenceIds.length).length,
 leadingHosts:Object.entries(byHost).sort((a,b)=>b[1]-a[1]).slice(0,15),
 priorityZeroSourceCandidates:p01zero.map(r=>({path:r.resource,priority:r.priority})),
 caveat:'Absence of external anchors is NOT a finding of clinical inaccuracy. Link presence is NOT evidence verification, rights permission, clinical approval or a reachable URL.'};
function cell(s){return '"'+String(Array.isArray(s)?s.join(';'):s??'').replace(/"/g,'""')+'"'}
const cols=['resource','inventoryScope','priority','title','anchor','url','host','matchedEvidenceIds','remoteRetrieval','clinicalSourceAccuracy','rightsClearance','publicationApproval'];
const csv=[cols.join(','),...links.map(r=>cols.map(k=>cell(r[k])).join(','))].join('\n')+'\n';
fs.mkdirSync(OUT,{recursive:true});
fs.writeFileSync(path.join(OUT,'cpl-external-source-links.json'),JSON.stringify({summary,resources,links},null,2)+'\n');
fs.writeFileSync(path.join(OUT,'cpl-external-source-links.csv'),csv);
fs.writeFileSync(path.join(OUT,'cpl-external-source-summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log('SOURCE_LINK_REGISTER '+JSON.stringify({...summary,priorityZeroSourceCandidates:summary.priorityZeroSourceCandidates.slice(0,20)}));
console.log('PASS per-resource source-link enumeration; no external URL validity or clinical/rights approval inferred');
