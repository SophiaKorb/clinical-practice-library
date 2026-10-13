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
assert.equal(practices.ideas.length,124);
assert.equal(Object.keys(examples.examples).length,57);
assert.equal(124+57,181,'original practice bank preserved');
assert.equal(clinical.interventions.length,53,'separate therapist-delivered content');
assert.equal(methods.measures.length,37,'expanded independent measurement method bank');
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
const usedIds=new Set();
for(const m of methods.measures){
 assert.ok(m.id&&!usedIds.has(m.id),'unique measure IDs');usedIds.add(m.id);
 assert.ok(m.name&&m.track&&m.example&&m.method,'each method is an independently editable idea with type and example');
 if(m.method==='Standardized instrument')assert.ok(/^https:\/\//.test(m.source),'standardized options identify original scale source');
}
assert.match(methods.note,/not a validated scale/i,'never imply custom tracking is a validated measure');
for(const selector of ['id="delivery-practice"','id="delivery-clinician"','id="measure-library"','id="measure-search"','id="menu-area"'])
 assert.ok(html.includes(selector),'visible menu control '+selector);
assert.match(html,/therapist-coached practice/i);
assert.match(html,/Therapist-delivered intervention/i);
assert.match(html,/not validated scales/i);
assert.match(js,/state\.delivery==='clinician'\?state\.interventions:state\.ideas/,'separate data sources, not a cosmetic label');
assert.match(js,/How to measure response/);
assert.match(js,/renderDelivery\(\)/);
assert.match(css,/\.delivery-choice\[aria-pressed=true\]/,'selection cue');
console.log('PASS treatment menu levels: 181 independent/coached ideas, 53 clinician-delivered interventions across 29 concerns, 37 clearly typed measure ideas.');
