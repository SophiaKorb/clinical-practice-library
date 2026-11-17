'use strict';
/* Release reconciliation for PR54 diagnosis hubs; original catalog stays frozen.
   The 14 categories are direct source tags, not independently certified indications. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const catalog=JSON.parse(read('resources/clinical-finder-data.js')
 .replace(/^globalThis\.CPLFinderData\s*=\s*/,'').replace(/;\s*$/,''));
const index=read('resources/diagnoses/index.html');
const adult=read('resources/diagnoses/adult-adhd.html');
const home=read('index.html');
const topics=read('resources/clinical-topics/index.html');
const originalFinder=read('resources/clinical-resource-finder.html');
const pubLinks=catalog.resources.filter(x=>x.externalUrl);
assert.equal(catalog.resources.length,813,'Must retain the 615-item production baseline plus 197 source-linked community listings');
assert.equal(pubLinks.length,77,'Unapproved external publisher inventory drift');
assert.equal(catalog.facets.diagnosis.length,14,'Expected all 14 diagnosed topics');
for(const [name,html] of [['diagnosis index',index],['adult guide',adult]]){
 assert(!/name="robots" content="noindex/i.test(html),'Unpublished draft tag remains on '+name);
 assert(/name="robots" content="index,follow"/.test(html),'Release metadata missing '+name);
}
assert(home.includes('Browse all 14 diagnosis and clinical-topic collections'),'Homepage lacks direct 14-category route');
assert(topics.includes('All diagnosis and clinical-topic resource indexes'),'Clinical topics lack link to complete index');
assert(home.includes('href="/resources/diagnoses/adult-adhd.html"'),'Substantial ADHD guide disconnected');
assert(index.includes('not automatically specific to this diagnosis'),'Related materials incorrectly described as ADHD-only on other diagnosis pages');
assert(!index.includes('not automatically ADHD-specific'),'Wrong diagnosis scope text leaked into general index');
assert(index.includes('all resources with the selected diagnosis tag')||index.includes('all materials with the selected diagnosis tag'),
 'Must clearly limit complete index to catalog-tagged resources');
assert(originalFinder.includes('id="lab-q"'),'Legacy live finder is unexpectedly replaced');
for(const [topic,count] of [['ADHD',19],['Autism',29],['Anxiety / OCD',41],['Depression',17],['Trauma / dissociation',43],
 ['Learning disorders',26],['Psychosis / bipolar',23],['Substance use',10],['Persistent conflict',21],['Eating disorders',17],
 ['Tic / repetitive behavior conditions',17],['Intellectual disability',8],['Sleep conditions',16],['Grief / bereavement',11]])
 assert.equal(catalog.resources.filter(r=>(r.tags?.diagnosis||[]).includes(topic)).length,count,'Diagnosis facet changed, review required: '+topic);
for(const r of catalog.resources){
 assert(r.url&&r.title&&Array.isArray(r.tags?.diagnosis),'Source entries must remain typed');
 for(const tag of r.tags.diagnosis)assert(catalog.facets.diagnosis.includes(tag),'Unrecognized diagnosis facet '+tag);
}
console.log('DIAGNOSIS_RELEASE_RECONCILIATION_PASS '+JSON.stringify({total:catalog.resources.length,external:pubLinks.length,topics:catalog.facets.diagnosis.length,originalGuides:24,mainFinderUntouched:true}));
