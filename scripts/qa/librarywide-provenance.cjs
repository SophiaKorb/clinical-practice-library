// Source-date and duplicate-title inventory audit. Nonblocking evidence, not clinical approval.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const catalog=JSON.parse(fs.readFileSync('data/library.json','utf8'));
const records=catalog.resources;
const hasDate=r=>['lastVerifiedDate','lastReviewedDate','sourceVerifiedAt','reviewedAt'].some(k=>Boolean(r[k]));
const sources=records.filter(x=>x.sourceUrl);
const invalid=sources.filter(x=>{try{const u=new URL(x.sourceUrl);return !['https:','http:'].includes(u.protocol)||!u.hostname}catch{return true}});
assert.deepEqual(invalid.map(x=>x.id),[],'Non-web source URLs need investigation');
const claims=records.reduce((o,r)=>(r.evidenceReview&&(o[r.evidenceReview]=(o[r.evidenceReview]||0)+1),o),{});
const inventory=fs.readFileSync('resources/complete-resource-inventory.html','utf8');
const entries=[...inventory.matchAll(/<li class="resource-entry" data-legacy="(true|false)"><a href="([^"]+)">([\s\S]*?)<\/a>/g)];
const current=entries.filter(m=>m[1]==='false');
const titleGroups=new Map();
for(const m of current){
 const title=m[3].replace(/&amp;/g,'&').toLowerCase().trim();
 const list=titleGroups.get(title)||[];list.push(m[2]);titleGroups.set(title,list);
}
const repeated=[...titleGroups].filter(([,urls])=>urls.length>1).map(([title,urls])=>({title,urls})).sort((a,b)=>b.urls.length-a.urls.length);
const summary={
 catalogRecords:records.length,
 sourceUrls:sources.length,
 recordsWithoutSourceUrl:records.length-sources.length,
 recordsWithStructuredSourceVerificationDate:records.filter(hasDate).length,
 reviewLabels:claims,
 inventoryEntries:entries.length,
 currentEntries:current.length,
 repeatedCurrentTitles:repeated.length,
 repeatedTitleExamples:repeated.slice(0,12)
};
console.log('CPL SOURCE AND TITLE AUDIT (not a release clearance)');
console.log(JSON.stringify(summary,null,2));
console.log('NOTICE: publication year, status "Reviewed", and a reachable URL do not establish a dated clinical source check.');
