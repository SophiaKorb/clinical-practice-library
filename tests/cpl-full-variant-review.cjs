// Verify provenance boundaries and generated review index, without claiming clearance.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const p=JSON.parse(fs.readFileSync('docs/qa/2026-11-12-provenance-rights-extension.json','utf8'));
assert.equal(p.checkedOn,'2026-11-12');
assert.equal(p.records.length,10,'Expected 10 additional primary-source/rights entries');
assert.equal(p.publicationApproved,false);
assert.equal(p.clinicalApproved,false);
assert.equal(p.rightsApproved,false);
assert.ok(p.records.every(r=>r.owner&&r.url.startsWith('https://')&&r.retrieved&&r.sourceDateMeaning&&Array.isArray(r.relatedCpl)&&r.relatedCpl.length&&r.finding&&r.limitations&&r.rightsStatus));
const ids=new Set(p.records.map(r=>r.id));assert.equal(ids.size,10);
assert.ok(ids.has('STANLEY-BROWN-SPI-RIGHTS')&&ids.has('VA-PCL5')&&ids.has('VA-PCPTSD5'));
const m=fs.readFileSync('docs/qa/2026-11-12-variant-review-index.md','utf8');
assert.equal((m.match(/^### \d\d ·/gm)||[]).length,26);
assert.equal((m.match(/\*\*Decision:\*\* Unreviewed\./g)||[]).length,26,'All 26 group decisions must remain pending');
assert.match(m,/26 same-title groups/);
assert.match(m,/54 distinct current URLs/);
assert.match(m,/all decisions pending human review/i);
const inventory=fs.readFileSync('resources/complete-resource-inventory.html','utf8');
const records=[...inventory.matchAll(/<li class="resource-entry" data-legacy="false"><a href="([^"]+)">([^<]+)<\/a>/g)].map(z=>({url:z[1],title:z[2].replace(/&amp;/g,'&').toLowerCase().trim()}));
const group=new Map();
for(const z of records){const a=group.get(z.title)||[];a.push(z.url);group.set(z.title,a);}
const titles=[...group].filter(([,urls])=>urls.length>1);
assert.equal(titles.length,26);
const urls=titles.flatMap(([,urls])=>urls);
assert.equal(urls.length,54);
for(const url of urls)assert.ok(m.includes(url.slice(1)),'Review index omits current source URL '+url);

console.log('PASS review index has 26 groups, rights evidence has 10 uncleared sources, publication and clinical gates remain closed');
