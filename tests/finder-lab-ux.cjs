'use strict';
/* Review-only clinical search-journey test. Targets are curated exemplars, not clinical appropriateness determinations. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const raw=read('resources/clinical-finder-data.js');
const original=JSON.parse(raw.replace(/^globalThis\.CPLFinderData\s*=\s*/,'').replace(/;\s*$/,''));
const old=require('../resources/clinical-finder.js');
const lab=require('../resources/finder-lab-engine.js');
const indexed=lab.index(original.resources);
assert.equal(original.resources.length,615);
assert.equal(indexed.length,615);
assert.equal(new Set(indexed.map(r=>r.url)).size,615);
assert.equal(original.resources.filter(r=>r.externalUrl).length,77);
for(const item of indexed){
 assert.equal(typeof item.description,'string');
 assert(item.description.length>35,'Missing description '+item.url);
 assert.equal(item.url,item.original.url);
 assert(lab.typeOptions().some(x=>x.value===item.type)||item.type==='other','Invalid type '+item.url);
 assert(Array.isArray(item.audience));
 assert(Array.isArray(item.population));
 assert(!item.provenance.includes('validated suitability'),'No clinical endorsement should be inferred');
}
assert(indexed.some(i=>i.audienceUndifferentiated),'Missing honest ambiguous-audience flag');
assert(indexed.some(i=>!i.population.length&&!i.acrossAges),'Missing honest unclassified population');
const birth5=indexed.filter(i=>i.population.includes('birth5'));
assert(birth5.length>20 && birth5.length<52,'Birth–5 should be bounded by supported stage evidence');
assert(!birth5.some(i=>/eldercare/i.test(i.title)),'Older-adult service wrongly under Birth–5');
for(const slug of ['index','development-and-screening','communication-and-regulation','relationships-and-trauma','early-intervention-and-preschool','tucson-pima-local-resources']){
 const url='/resources/birth-to-five/'+slug+'.html';
 assert(birth5.some(i=>i.url===url),'Lost Birth–5 resource '+url);
}
for(const r of original.resources.filter(x=>Number.isInteger(x.minimumAge)&&x.minimumAge>=13))
 assert(!lab.populationFor(r).values.includes('children'),'Under-13 should not include explicitly age-limited program: '+r.url);
const scenarios=[
 ['tantrums','child-aggression-caregiver-coaching/index.html'],
 ['school refusal','school/clinical/anxiety.html'],
 ['dissociation grounding','handouts/grounding.html'],
 ['daycare','birth-to-five/early-intervention-and-preschool.html'],
 ['parents worried about meltdowns','child-aggression-caregiver-coaching/index.html'],
 ['child anxiety','#ext-02-07'],
 ['IEP','arizona/iep-504-parent-guide.html'],
 ['adult ADHD','adult-adhd-task-starts/index.html'],
 ['play therapy','clinical-depth/child-caregiver-treatment-selection.html'],
 ['task launch','handouts/task-launch-map.html'],
 ['autistic child','understanding-behavior-in-autistic-children.html'],
 ['suicide safety plan','safety-planning-preparation-sheet.html'],
 ['toddler','#ext-03-03'],
 ['developmental screening','birth-to-five/development-and-screening.html'],
 ['Tucson early intervention','birth-to-five/tucson-pima-local-resources.html'],
 ['IEP meeting preparation','school/iep-504-meeting-preparation.html'],
 ['homeschooling Arizona','arizona/homeschooling-parent-guide.html'],
 ['trauma school','trauma-school-neurodevelopment-crosswalk.html'],
 ['child grief','child-grief-continuing-bonds/index.html'],
 ['sleep help','handouts/making-sleep-more-likely.html'],
 ['anxiety exposure','therapy/anxiety-exposure-ocd-start-here.html'],
 ['bipolar sleep','sleep-loss-activation/index.html'],
 ['cómo conseguir un IEP','es/arizona-como-conseguir-iep-504.html'],
 ['autism bullying','autism-peer-relationships-bullying-social-safety.html'],
 ['dyslexia school','school/clinical/dyslexia.html'],
 ['early childhood trauma','birth-to-five/relationships-and-trauma.html'],
 ['parent behavior problems','#ext-02-17'],
 ['504 Arizona','arizona/iep-504-parent-guide.html'],
 ['988','#ext-05-07'],
 ['sensory overload','downloads/sensory-overload-and-recovery-plan.pdf'],
 ['sibling conflict','handouts/sibling-conflict-reset.html'],
 ['grounding','handouts/grounding.html'],
 ['school access','school/school-access-official-reference.html'],
 ['child communication','birth-to-five/communication-and-regulation.html'],
 ['OCD mental rituals','ocd-mental-rituals/index.html'],
 ['executive functioning','#ext-02-12']
];
function baselineRank(query,needle){return old.search(original.resources,{q:query}).findIndex(r=>r.url.includes(needle))+1;}
function labRank(query,needle){
 return lab.search(indexed,{q:query}).groups.findIndex(g=>g.best.item.url.includes(needle))+1;
}
const rows=scenarios.map(([query,expected])=>({
 query,expected,baselineRank:baselineRank(query,expected),prototypeRank:labRank(query,expected),
 prototypeCount:lab.search(indexed,{q:query}).matches
}));
for(const row of rows)assert(row.prototypeRank>0&&row.prototypeRank<=5,'Missing expected within top 5: '+JSON.stringify(row));
const summaries={};
for(const [label,key] of [['baseline','baselineRank'],['prototype','prototypeRank']]){
 const ranks=rows.map(r=>r[key]);
 summaries[label]={
  targetTop1:ranks.filter(x=>x===1).length,
  targetTop5:ranks.filter(x=>x>0&&x<=5).length,
  targetMissing:ranks.filter(x=>x===0).length,
  reciprocalRank:Number((ranks.reduce((n,r)=>n+(r?1/r:0),0)/ranks.length).toFixed(3))
 };
}
assert(summaries.prototype.targetTop5>summaries.baseline.targetTop5,'Prototype must improve tested target recall');
assert(summaries.prototype.reciprocalRank>summaries.baseline.reciprocalRank,'Prototype must improve tested target ranking');
assert(lab.search(indexed,{q:'IEP'}).matches<40,'IEP query flooded by unrelated results');
assert(lab.search(indexed,{q:'school refusal'}).matches<30,'School-refusal related terms over-broad');
assert(lab.search(indexed,{q:'tantrums'}).matches<30,'Behavior synonym search over-broad');
const ocd=lab.search(indexed,{q:'OCD mental rituals'});
assert.equal(ocd.groups.length,1,'Clinical-topic variants should be grouped');
assert(ocd.groups[0].allFamily.length>=7,'Expected all topic formats in collection');
for(const role of ['clinician','caregiver','case_manager','school_team','trainee']){
 const hits=lab.search(indexed,{q:'',population:'birth5',audience:role}).groups;
 assert(hits.some(g=>g.best.item.url==='/resources/birth-to-five/index.html'),'Missing birth–5 role route '+role);
}
const roleSplit=indexed.find(x=>/adult-adhd-task-starts\/care-partner\.html/.test(x.url));
assert(roleSplit.audience.includes('caregiver')&&!roleSplit.audience.includes('client'),'Care-partner guide wrongly labeled direct client workbook');
const clientSplit=indexed.find(x=>/adult-adhd-task-starts\/client-workbook\.html/.test(x.url));
assert(clientSplit.audience.includes('client')&&!clientSplit.audience.includes('caregiver'),'Client workbook wrongly labeled caregiver');
assert(read('resources/finder-lab.html').includes('noindex,nofollow'),'Review prototype must not be indexed by search engines');
assert(!read('index.html').includes('/resources/finder-lab.html'),'Review prototype must not be promoted to production home');
assert(!read('resources/clinical-resource-finder.html').includes('/resources/finder-lab.html'),'Original finder route must remain unchanged');
console.log(JSON.stringify({status:'PASS',basis:'Exact current-main 615-record catalog; ranked target URLs, not observed user outcomes',totalResources:indexed.length,queries:rows.length,birth5Resources:birth5.length,resourceTypes:Object.fromEntries([...new Set(indexed.map(x=>x.type))].sort().map(k=>[k,indexed.filter(x=>x.type===k).length])),audienceUnknown:indexed.filter(x=>!x.audience.length).length,undifferentiatedPublicAudience:indexed.filter(x=>x.audienceUndifferentiated).length,populationUnknown:indexed.filter(x=>!x.population.length&&!x.acrossAges).length,summaries,details:rows},null,2));
