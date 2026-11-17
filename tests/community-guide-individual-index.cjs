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
assert.equal(data.resources.length,813,'Unexpected community catalog growth or data loss');
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
const topics=new Map();
for(const r of youth){
 assert(r.communityTopic && typeof r.communityTopic==='string','Every transition listing needs source-grounded topic '+r.url);
 topics.set(r.communityTopic,(topics.get(r.communityTopic)||0)+1);
}
assert.equal(topics.size,9,'Youth community guide must retain nine supported topic groups');
for(const n of [2,9,10,13,15,23,24,25]){
 const r=youth.find(x=>x.url.endsWith('#youth-listing-'+n));
 assert(r.providerEvidenceUrl?.startsWith('https://'),'Reviewed provider evidence missing '+n);
 assert(r.providerEvidenceReviewed==='2026-11-17','Source review date missing '+n);
 assert(r.referralCaution?.length>30,'Unresolved eligibility/operational caution missing '+n);
}
const pimaCenter=youth.find(x=>x.url.endsWith('#youth-listing-9'));
assert(/9649/.test(pimaCenter.referralCaution)&&/9640/.test(pimaCenter.referralCaution),'Conflicting official Pima contact numbers not preserved');
const project=youth.find(x=>x.url.endsWith('#youth-listing-2'));
assert(/October 23, 2026/.test(project.referralCaution),'Expired intake date must not be treated as verified open');
assert(!/Review edition.+Page/.test(youth.find(x=>x.url.endsWith('#youth-listing-8')).description),'Page artifact leaked into display description');
const iam=data.resources.find(r=>r.url==='/resources/community/iamyou360.html');
assert(iam,'IAMYOU360 missing from community index');
assert(iam.communityTopics.includes('Foster-care transitions')&&iam.communityTopics.includes('Parenting youth support'),'IAMYOU360 cross-topic pathways absent');
assert(iam.referralCaution.includes('unverified'),'Program-specific housing caution not indexed');
assert(read('resources/community/iamyou360.html').includes('Hygiene Empowerment Program'),'IAMYOU360 detailed source page absent');
const items=engine.index(data.resources);
for(const topic of ['Housing, food & practical needs','Foster-care transitions','Peer connection & belonging','Parenting youth support']){
 assert(engine.matchesFilters(items.find(x=>x.url===iam.url),{advanced:{'community-topic':topic}}),'IAMYOU360 not findable for '+topic);
}
assert.equal(items.filter(x=>engine.matchesFilters(x,{advanced:{'community-topic':'Employment & work preparation'}})).length,6,'Topic filter must match employment-only youth listings');
for(const [q,needle] of [['Parent Aid','#listing-2'],['Project FOCUS','#youth-listing-2'],['Autism Society','#listing-67']]){
 const hits=engine.search(items,{q}).groups;
 assert(hits.some(g=>g.best.item.url.endsWith(needle)||g.otherMatches.some(x=>x.item.url.endsWith(needle))),'Individual search failed: '+q);
}

const grounded=items.filter(r=>engine.matchesFilters(r,{advanced:{community:'family',place:'Marana'}}));
assert(grounded.length>0,'Source-evidenced Marana family listings not accessible via filters');
assert(grounded.every(r=>r.original.communityCollection==='family'&&r.original.communityPlaces.includes('Marana')),'Geographic filter admitted unverified location');
const youthOnly=items.filter(r=>engine.matchesFilters(r,{advanced:{community:'transition-age'}}));
assert.equal(youthOnly.length,28,'Transition-age filter must retain 27 original headings plus IAMYOU360');
assert(items.filter(r=>engine.matchesFilters(r,{advanced:{community:'family'}})).length===170,'Family guide filter must retain numbered entries');
const finderHTML=read('resources/clinical-resource-finder.html');
for(const name of ['lab-community','lab-place','lab-community-topic'])assert(finderHTML.includes('id="'+name+'"'),'Community filter missing from live finder: '+name);

assert(new Set(data.resources.map(r=>r.url)).size===data.resources.length,'Duplicate canonical resource URL');
console.log('COMMUNITY_GUIDES_INDIVIDUAL_INDEX_PASS '+JSON.stringify({family:family.length,youth:youth.length,total:data.resources.length,anchors:197}));
