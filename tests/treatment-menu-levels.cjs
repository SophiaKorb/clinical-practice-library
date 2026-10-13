'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const catalog=read('data/treatment-plan-menu.json');
const practices=read('data/treatment-approach-ideas.json');
const examples=read('data/treatment-goal-try-it-examples.json');
const clinical=read('data/treatment-clinician-interventions.json');
const methods=read('data/treatment-plan-measure-ideas.json');
const html=fs.readFileSync('resources/therapy/treatment-plan-menu.html','utf8');
const js=fs.readFileSync('resources/therapy/treatment-ideas-menu.js','utf8');
const css=fs.readFileSync('resources/therapy/treatment-ideas-menu.css','utf8');
const families=new Set(catalog.families.map(f=>f.id));
const permitted=new Set(['anxiety',...families]);
assert.equal(practices.ideas.length,153);
assert.equal(Object.keys(examples.examples).length,57);
assert.equal(153+57,210,'original practice bank plus broad new choices');
assert.equal(clinical.interventions.length,111,'expanded separate therapist-delivered content');
assert.equal(methods.measures.length,53,'qualitative measurement method bank');
const seen=new Set();
for(const i of clinical.interventions){
 assert.ok(i.id&&!seen.has(i.id),'unique intervention IDs');
 seen.add(i.id);
 assert.ok(permitted.has(i.presentation),'recognized clinical topic '+i.presentation);
 assert.ok(i.title&&i.try.length>85&&i.measure.length>38,'complete clinician intervention and outcome');
 assert.ok(!/\[[^\]]+\]/.test([i.try,i.measure].join(' ')),'no fill-in bracket templates');
 assert.ok(/(in session|therapist|clinician|clinical|assess|coordinate|team|with consent|trained|qualified|specialist|session)/i.test(i.try),
  'intervention must identify clinical action: '+i.id);
}
assert.deepEqual(new Set(clinical.interventions.map(i=>i.presentation)),permitted,'all 29 concern menus have therapist interventions');
for(const p of permitted){
 assert.ok(practices.ideas.filter(x=>x.presentation===p).length>=5,'broad self-help/coach range for '+p);
 assert.ok(clinical.interventions.filter(x=>x.presentation===p).length>=3,'multiple clinician intervention choices for '+p);
}
assert.equal(new Set(practices.ideas.map(i=>i.id)).size,153,'practice IDs unique');
assert.match(clinical.description,/baselines, numeric targets/i,'defer numeric target design');
assert.match(methods.note,/no generic numerical goals/i,'measurement bank currently qualitative');
assert.ok(new Set(methods.measures.map(m=>m.area)).size>=15,'measurement captures broad life domains');
for(const m of methods.measures){
 assert.ok(!/\\b(?:\\d+ of \\d+|within \\d+|three of four)\\b/i.test(m.example),'no generic numeric targets in measurement example '+m.id);
}
const usedIds=new Set();
for(const m of methods.measures){
 assert.ok(m.id&&!usedIds.has(m.id),'unique measure IDs');usedIds.add(m.id);
 assert.ok(m.name&&m.track&&m.example&&m.method,'each method is an independently editable idea with type and example');
 if(m.method==='Standardized instrument')assert.ok(/^https:\/\//.test(m.source),'standardized options identify original scale source');
}
assert.match(methods.note,/custom ratings and informal tracking ideas are NOT validated instruments/i,'never imply custom tracking is a validated measure');
for(const selector of ['id="delivery-practice"','id="delivery-clinician"','id="measure-library"','id="measure-search"','id="menu-area"'])
 assert.ok(html.includes(selector),'visible menu control '+selector);
assert.match(html,/therapist-coached practice/i);
assert.match(html,/Therapist-delivered intervention/i);
assert.match(html,/not validated scales/i);
assert.match(js,/state\.delivery==='clinician'\?state\.interventions:state\.ideas/,'separate data sources, not a cosmetic label');
assert.match(js,/What might indicate progress/);
assert.match(js,/renderDelivery\(\)/);
assert.match(css,/\.delivery-choice\[aria-pressed=true\]/,'selection cue');
console.log('PASS treatment menu levels: 210 independent/coached ideas, 111 clinician-delivered interventions across 29 concerns, 53 qualitative measurement directions.');
