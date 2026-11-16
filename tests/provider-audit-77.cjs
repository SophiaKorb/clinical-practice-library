'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=JSON.parse(read('resources/clinical-finder-data.js').replace(/^globalThis\.CPLFinderData\s*=\s*/,'').replace(/;\s*$/,''));
const audit=JSON.parse(read('docs/qa/2026-11-16-all-77-provider-link-audit.json'));
const html=read('resources/community/expanded-external-resources.html');
const base='/resources/community/expanded-external-resources.html#';
const entries=data.resources.filter(r=>r.url.startsWith(base));
assert.equal(data.resources.length,609);
assert.equal(entries.length,77);
assert.equal(audit.records.length,77);
assert.equal(audit.verified_on,'2026-11-16');
assert.equal(audit.production_baseline_commit,'af79333d1317c1d4dbce0798aafe14df49644c34');
assert.deepEqual(audit.counts,{'direct-provider-page-readable':67,'official-indexed-direct-access-restricted':9,'interactive-shell-not-fully-assessed':1});
const ids=new Set();const originals=new Set();
const byId=id=>entries.find(x=>x.url===base+id);
for(const a of audit.records){
 assert(!ids.has(a.id),'Duplicate audit entry '+a.id);ids.add(a.id);
 const r=byId(a.id);assert(r,'Unindexed audited resource '+a.id);
 assert.equal(a.title,r.title,'Audit/catalog title drift: '+a.id);
 assert.equal(a.source_url,r.externalUrl,'Audit original URL drift: '+a.id);
 assert.deepEqual(a.audience_stages,r.tags.stage,'Audit age scope drift: '+a.id);
 assert.deepEqual(a.roles,r.tags.role,'Audit intended audience drift: '+a.id);
 assert(!originals.has(r.externalUrl),'External resource duplicated '+a.id);originals.add(r.externalUrl);
 assert(html.includes('id="'+a.id+'"'),'Missing directory anchor '+a.id);
 const escapedTitle=r.title.replace(/&/g,'&amp;');
 assert(html.includes('<h3>'+escapedTitle+'</h3>'),'Directory title mismatch '+a.id);
 for(const[k,values]of Object.entries(r.tags))for(const v of values)assert(data.facets[k]?.includes(v),'Invalid '+k+' '+v);
}
for(const id of ['ext-02-03','ext-02-05','ext-02-06','ext-02-07','ext-02-16','ext-02-17','ext-02-19','ext-02-21','ext-02-23','ext-02-24'])assert(byId(id).tags.stage.includes('Early childhood'),'Preschool resource missing early-childhood search '+id);
assert.equal(byId('ext-02-04').minimumAge,undefined,'Tweens category cannot be mislabeled 13+');
assert.deepEqual(byId('ext-04-04').tags.stage,['Adult'],'Eldercare is older-adult/family navigation');
assert.deepEqual(byId('ext-05-04').tags.stage,['Adult'],'RecoverMe primary audience 18-25');
assert(byId('ext-04-02').title.includes('project concluded'),'Youth Voice project status must be clear');
for(const id of['ext-06-04','ext-06-05','ext-06-06']){
 assert(byId(id).tags.stage.includes('Early childhood')&&byId(id).tags.stage.includes('Adult'),'IDEA birth–26 range '+id);
 assert(byId(id).title.includes('program')||byId(id).title.includes('grant'),'Federal grant page must not be presented as an intake clinic '+id);
}
assert(!byId('ext-05-08').tags.role.includes('Client / caregiver'),'Veteran clinician guide should be labeled professional');
for(const id of['ext-04-01','ext-04-05','ext-04-06','ext-04-08'])assert(!byId(id).tags.role.includes('Client / caregiver'),'Professional technical-assistance directory mislabeled direct patient resource: '+id);
assert.equal(audit.records.filter(x=>x.status==='official-indexed-direct-access-restricted').length,9);
assert.equal(audit.records.filter(x=>x.status==='interactive-shell-not-fully-assessed').length,1);
console.log('PASS: 77 exact provider records audited, 609 catalog entries retained, metadata and provider-title corrections synchronized; no unsupported 13+ gate.');
