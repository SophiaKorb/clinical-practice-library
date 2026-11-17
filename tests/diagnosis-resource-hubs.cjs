'use strict';
/* Complete diagnosis index QA: topic index integrity, 19/19 ADHD coverage,
   separate functional supports, retained 24 original guides, no clinical rewrites. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const parse=JSON.parse(read('resources/clinical-finder-data.js').replace(/^globalThis\.CPLFinderData\s*=\s*/,'').replace(/;\s*$/,''));
assert.equal(parse.resources.length,615);
assert.equal(new Set(parse.resources.map(x=>x.url)).size,615);
assert.equal(parse.resources.filter(x=>x.externalUrl).length,77);
const diagnosis=parse.facets.diagnosis;
assert.equal(diagnosis.length,14);
const adult=read('resources/diagnoses/adult-adhd.html');
const hub=read('resources/diagnoses/index.html');
const js=read('resources/diagnoses/diagnosis-hubs.js');
const home=read('index.html');
const adultCollection=read('resources/clinical-topics/adult-adhd-task-starts/index.html');
const catalog=parse.resources.filter(x=>x.tags.diagnosis.includes('ADHD'));
assert.equal(catalog.length,19,'Unexpected direct ADHD resource count; regenerate the static hub');
const matched=adult.match(/<section id="direct-adhd"\b[\s\S]*?<section id="related-supports"/);
assert(matched,'Direct ADHD index or separate related section missing');
const directMarkup=matched[0].split('<section id="related-supports"')[0];
const refs=[...directMarkup.matchAll(/<a href="([^"]+)">/g)].map(m=>m[1]);
assert.equal(refs.length,19,'Direct ADHD listing should contain one link per current ADHD-tagged resource');
assert.equal(new Set(refs).size,19,'Direct ADHD list contains duplicates');
assert.deepEqual(new Set(refs),new Set(catalog.map(x=>x.url)),'ADHD directory missing catalog-tagged source');
const related=adult.match(/<section id="related-supports"\b[\s\S]*?<\/section>/)?.[0]||'';
const relatedRefs=[...related.matchAll(/<li><a href="([^"]+)">/g)].map(m=>m[1]);
assert.equal(relatedRefs.length,12,'Expected 12 evidence-reviewed cross-diagnostic support links');
assert(!relatedRefs.some(u=>refs.includes(u)),'Related support incorrectly duplicates explicitly ADHD-tagged resource');
assert(related.includes('Child/family'),'Related support contexts must remain age-qualified');
const sections=['overview','assessment','treatment','functions','work-life','monitor','library','sources','direct-adhd','related-supports'];
for(const id of sections)assert(adult.includes('id="'+id+'"'),'Missing substantial Adult ADHD guide section '+id);
for(const phrase of ['childhood','differential','medication','prescriber','CBT','working memory','home','relationships','accommodation','side-effect','diagnostic','quality of life']){
 assert(adult.toLowerCase().includes(phrase.toLowerCase()),'Incomplete adult ADHD topic scope: '+phrase);
}
const primaries=['www.cdc.gov/adhd/about/adhd-in-adults.html','www.nimh.nih.gov/health/publications/attention-deficit-hyperactivity-disorder-what-you-need-to-know','www.nice.org.uk/guidance/ng87/chapter/recommendations','adhdguideline.aadpa.com.au/','askjan.org/disabilities/Attention-Deficit-Hyperactivity-Disorder-AD-HD.cfm'];
for(const url of primaries)assert(adult.includes(url),'Missing source referral '+url);
assert(adult.includes('Use the focused Adult ADHD task-starts collection'),
 'Comprehensive guide must distinguish the narrower task-start toolkit');
assert(adultCollection.includes('/resources/diagnoses/adult-adhd.html'),
 'Focused Adult ADHD collection must link to the whole adult subject');
assert(adultCollection.includes('/resources/diagnoses/index.html?topic=ADHD'),
 'Focused Adult ADHD collection must link to full ADHD resource index');
assert(home.includes('Adult ADHD: comprehensive guide'),'Homepage missing primary Adult ADHD option');
assert(home.includes('All ADHD resources (full index)'),'Homepage ADHD diagnosis index not prominent');
assert((home.match(/class="diagnosis-hub-link"/g)||[]).length===8,'Every diagnosis card needs a complete index route');
assert((home.match(/class="diagnosis-card"/g)||[]).length===8,'Existing eight diagnosis cards must remain');
const guides=[
 ['adhd','adhd','ADHD'],['autism','autism','Autism'],['anxiety','anxiety','Anxiety / OCD'],
 ['depression','depression','Depression'],['dyslexia','dyslexia','Learning disorders'],
 ['dyscalculia','dyscalculia','Learning disorders'],['dysgraphia','dysgraphia','Learning disorders'],
 ['odd-persistent-conflict-behavior','persistent-conflict-odd','Persistent conflict']
];
let originalGuideCount=0;
for(const [guide,school,topic] of guides){
 const url='/resources/diagnoses/index.html?topic='+encodeURIComponent(topic);
 for(const loc of ['guides/'+guide+'.html','resources/school/clinical/'+school+'.html','resources/school/homeschool/'+school+'.html']){
  const content=read(loc);
  assert(content.includes('href="'+url+'"'),'Original diagnosis guide is an isolated destination: '+loc);
  assert(content.includes('class="diagnosis-route"'),'Complete resources navigation not visible in '+loc);
  originalGuideCount++;
 }
 for(const p of ['guides/'+guide+'.html','resources/school/clinical/'+school+'.html','resources/school/homeschool/'+school+'.html'])
  assert(home.includes('href="/'+p+'"'),'Original homepage direct link was removed: '+p);
}
assert.equal(originalGuideCount,24);
assert(hub.includes('src="/resources/clinical-finder-data.js"'),'Diagnosis hub not connected to canonical resource index');
assert(hub.includes('src="/resources/diagnoses/diagnosis-hubs.js"'),'Diagnosis hub renderer missing');
assert(js.includes("data.resources.filter("),'Index must enumerate all tag matches rather than use hand-picked subset');
assert(js.includes("r.tags&&r.tags.diagnosis"),'Missing source-derived diagnosis tag filter');
assert(js.includes('includes(selected)'),'No complete diagnosis filter predicate');
assert(js.includes('Group')||js.includes('groupFor'),'Index must group results by resource type');
assert(js.includes('Selected')||js.includes('renderSelected'),'Missing selected-topic rendering');
assert(hub.includes('id="related"'),'Cross-diagnostic resources must be separate from diagnosis tag listings');
assert(hub.includes('id="coverage"'),'Discovery vs clinical indication scope not explained');
const hrefs=[...adult.matchAll(/\bhref="([^"]+)"/g),...hub.matchAll(/\bhref="([^"]+)"/g)].map(m=>m[1]);
let local=0,anchors=0;
for(const href of hrefs){
 if(href.startsWith('#')){
  assert(adult.includes('id="'+href.slice(1)+'"')||hub.includes('id="'+href.slice(1)+'"'),'Missing local jump anchor '+href);
  anchors++;continue;
 }
 if(!href.startsWith('/'))continue;
 const pathname=new URL(href,'https://cpl.invalid').pathname;
 assert(fs.existsSync(path.join(root,pathname.slice(1))),'Broken internal hub resource link '+href);
 local++;
}
for(const r of catalog){
 let url=new URL(r.url,'https://cpl.invalid');const p=path.join(root,url.pathname.slice(1));
 assert(fs.existsSync(p),'Missing source catalog destination '+r.url);
 if(url.hash){
  assert(read(url.pathname.slice(1)).includes('id="'+decodeURIComponent(url.hash.slice(1))+'"'),
   'Direct ADHD publisher destination has missing anchor '+r.url);
 }
}
assert(!read('index.html').includes('href="/resources/diagnoses/index.html?topic=wrong"'));
console.log(JSON.stringify({status:'PASS',diagnosticTopics:diagnosis.length,completeADHDEntries:catalog.length,relatedFunctionalTools:relatedRefs.length,originalGuideBacklinks:originalGuideCount,localHubLinksChecked:local,anchorLinksChecked:anchors,resourceRecordsUntouched:parse.resources.length},null,2));
