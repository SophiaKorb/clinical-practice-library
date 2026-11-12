// CPL review-only metadata and navigation invariants; technical checks do not approve clinical content.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
require('../resources/clinical-finder-data.js');
const {search,decode,norm}=require('../resources/clinical-finder.js');
const finder=globalThis.CPLFinderData,records=finder.resources;
assert.ok(records.length>=500,'Unexpected finder coverage regression');
assert.equal(new Set(records.map(r=>r.url)).size,records.length,'Duplicate finder URLs');
assert.ok(records.every(r=>Number.isFinite(r.priority)&&r.title&&r.url&&r.tags),'Malformed finder metadata');
const inventory=fs.readFileSync('resources/complete-resource-inventory.html','utf8');
const links=[...inventory.matchAll(/<li class="resource-entry" data-legacy="(true|false)"><a href="([^"]+)">/g)];
assert.ok(links.length>750,'Inventory truncated unexpectedly');
const urls=new Set(links.map(m=>m[2]));
assert.equal(urls.size,links.length,'Duplicate inventory links');
for(let i=1;i<links.length;i++)assert.ok(links[i-1][2].localeCompare(links[i][2])<=0,'Inventory links out of URL order');
assert.deepEqual(records.filter(r=>!urls.has(r.url)).map(r=>r.url),[],'Finder resources absent from the inventory');
for(const route of ['resources/index.html','resources/complete-resource-inventory.html']){
 const page=fs.readFileSync(route,'utf8');
 assert.match(page,/<a class="cpl-skip" href="#main-content">/,'Missing skip link: '+route);
 assert.match(page,/<main id="main-content" tabindex="-1">/,'Missing focusable main: '+route);
}
assert.match(inventory,/normalize\('NFD'\)/,'Inventory search must normalize Spanish accents');
const route=fs.readFileSync('resources/clinical-resource-finder.html','utf8');
assert.match(route,/<a class="skip" href="#finder">Skip to resource search<\/a>/,'Finder skip link');
assert.match(route,/<section id="finder" tabindex="-1" aria-labelledby="finder-heading">/,'Finder focusable target');
const empty=decode(new URLSearchParams(),finder.facets);
assert.equal(Object.keys(empty).length,Object.keys(finder.facets).length+1);
const invalid=decode(new URLSearchParams('role=not-a-real-role&q=aphasia'),finder.facets);
assert.equal(invalid.role,'','Unknown facet must be ignored');
const result=search(records,{...empty,q:'aphasia'});
assert.ok(result.length>0,'Aphasia query returned no entries');
const direct=r=>norm([r.title,r.url,...Object.values(r.tags).flat(),...(r.searchTerms||[])].join(' ')).includes('aphasia');
assert.ok(direct(result[0]),'Direct matches must outrank broad synonyms');
assert.equal(search(records,empty).length,records.length,'Unfiltered finder must include all entries');
console.log('PASS: '+records.length+' finder records in '+links.length+' ordered unique inventory entries; direct search relevance, facets, accent search and keyboard navigation');
