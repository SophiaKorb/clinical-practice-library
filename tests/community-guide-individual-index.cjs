'use strict';
// Individually indexed community-guide entries remain source-linked, additive, and directly searchable.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=JSON.parse(read('resources/clinical-finder-data.js').replace(/^globalThis\.CPLFinderData\s*=\s*/,'').replace(/;\s*$/,''));
const engine=require('../resources/finder-lab-engine.js');
const family=data.resources.filter(r=>/^\/resources\/community\/family-community-guide-text\.html#listing-\d+$/.test(r.url));
const youth=data.resources.filter(r=>/^\/resources\/community\/youth-community-guide-text\.html#youth-listing-\d+$/.test(r.url));
assert.equal(family.length,170,'Family numbered listings are incomplete');
assert.equal(youth.length,27,'Youth program headings are incomplete');
assert.equal(data.resources.length,812,'Unexpected community catalog growth or data loss');
const pages=[read('resources/community/family-community-guide-text.html'),read('resources/community/youth-community-guide-text.html')];
for(const [i,rows] of [[0,family],[1,youth]]){
 for(const r of rows){
  const anchor=r.url.split('#')[1];
  assert(pages[i].includes('id="'+anchor+'"'),'Broken direct listing anchor '+r.url);
  assert(r.searchTerms.includes(r.title.replace(/ — Southern Arizona family guide #\d+$/,'').replace(/ — transition-age guide$/,'')),'Missing individual title search term '+r.url);
  assert(r.description||i===1,'Missing family source description '+r.url);
  assert.deepEqual(r.tags.diagnosis,[],'Community navigators must not acquire unsupported diagnoses');
  assert(r.metadataBasis.includes('eligibility'),'Missing eligibility qualification');
 }
}
for(let n=1;n<=170;n++)assert(family.some(r=>r.url.endsWith('#listing-'+n)),'Missing family number '+n);
const infantEntry=data.resources.find(r=>r.url.endsWith('#listing-64'));
assert.deepEqual(infantEntry.tags.stage,['Early childhood'],'AzEIP birth-to-three listing should not surface as teen-appropriate');
const adultClub=data.resources.find(r=>r.url.endsWith('#youth-listing-17'));
assert.deepEqual(adultClub.tags.stage,['Adult'],'Adult peer group must not appear in child/teen results');
assert.equal(adultClub.minimumAge,18,'Adult group has documented age minimum');
const teenCrisis=data.resources.find(r=>r.url.endsWith('#youth-listing-23'));
assert.deepEqual(teenCrisis.tags.stage,['School age / adolescence'],'Teen-specific crisis service misclassified');
const projectFocus=data.resources.find(r=>r.url.endsWith('#youth-listing-2'));
assert.equal(projectFocus.minimumAge,18,'Project FOCUS youth program has documented 18–21 scope');
const items=engine.index(data.resources);
for(const [q,needle] of [['Parent Aid','#listing-2'],['Project FOCUS','#youth-listing-2'],['Autism Society','#listing-67']]){
 const hits=engine.search(items,{q}).groups;
 assert(hits.some(g=>g.best.item.url.endsWith(needle)||g.otherMatches.some(x=>x.item.url.endsWith(needle))),'Individual search failed: '+q);
}

const grounded=items.filter(r=>engine.matchesFilters(r,{advanced:{community:'family',place:'Marana'}}));
assert(grounded.length>0,'Source-evidenced Marana family listings not accessible via filters');
assert(grounded.every(r=>r.original.communityCollection==='family'&&r.original.communityPlaces.includes('Marana')),'Geographic filter admitted unverified location');
const youthOnly=items.filter(r=>engine.matchesFilters(r,{advanced:{community:'transition-age'}}));
assert.equal(youthOnly.length,27,'Youth guide filter must retain exactly its indexed entries');
assert(items.filter(r=>engine.matchesFilters(r,{advanced:{community:'family'}})).length===170,'Family guide filter must retain numbered entries');
const finderHTML=read('resources/clinical-resource-finder.html');
for(const name of ['lab-community','lab-place'])assert(finderHTML.includes('id="'+name+'"'),'Community filter missing from live finder: '+name);

assert(new Set(data.resources.map(r=>r.url)).size===data.resources.length,'Duplicate canonical resource URL');
console.log('COMMUNITY_GUIDES_INDIVIDUAL_INDEX_PASS '+JSON.stringify({family:family.length,youth:youth.length,total:data.resources.length,anchors:197}));
