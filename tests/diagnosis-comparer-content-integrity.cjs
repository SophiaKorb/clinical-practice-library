/* Content coverage and high-risk regression checks, not independent clinical certification. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('resources/training/diagnosis-comparer.html','utf8');
const review=fs.readFileSync('resources/training/diagnosis-comparer-review.js','utf8');
const script=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const context=vm.createContext({localStorage:{getItem:()=>null}});
vm.runInContext(review+'\n'+script.slice(0,script.indexOf('const inputs=')),context);
const data=JSON.parse(vm.runInContext('JSON.stringify({diagnoses,plainDescriptions,presetsData,vennData,plainVennPairs,intersectionTerms})',context));
assert.equal(data.diagnoses.length,26);assert.equal(data.presetsData.length,31);assert.equal(data.vennData.length,31);
const ids=new Set(data.diagnoses.map(d=>d.id));assert.equal(ids.size,26);
for(const d of data.diagnoses){for(const field of ['pattern','course','impact','ask','exclusions','cooccur','caveat']){
 assert.ok(d[field]?.length>20,d.id+' clinical '+field);assert.ok(data.plainDescriptions[d.id][field]?.length>20,d.id+' plain '+field);
}assert.notEqual(d.course,data.plainDescriptions[d.id].course,'authored plain duration '+d.id);}
const seen=new Set();
for(const pair of data.vennData){const key=[pair.a,pair.b].sort().join('|');assert.ok(!seen.has(key));seen.add(key);assert.ok(ids.has(pair.a)&&ids.has(pair.b)&&pair.a!==pair.b);
 const plain=data.plainVennPairs[key];assert.ok(plain);assert.equal(plain.a,pair.a);assert.equal(plain.b,pair.b);
 for(const p of [pair,plain]){assert.equal(p.shared.length,3);for(const field of ['aOnly','bOnly','probe','course','exclusions','cooccur'])assert.ok(p[field]?.length>25,key+' '+field);}
 assert.notEqual(pair.probe,plain.probe);assert.ok(data.intersectionTerms[key]);
 assert.ok(data.presetsData.some(p=>[p.a,p.b].sort().join('|')===key));
}
const cannabis=data.vennData.find(p=>p.a==='cannabis'&&p.b==='schizo');
assert.match(cannabis.aOnly,/impaired control/);assert.match(cannabis.bOnly,/Schizophrenia/);
assert.match(data.plainVennPairs['cannabis|schizo'].aOnly,/separate assessment/);
assert.match(data.plainVennPairs['bipolar1|bipolar2'].cooccur,/alternative diagnoses/);
assert.match(data.plainVennPairs['bipolar2|mdd'].cooccur,/not separately labeled MDD/);
assert.match(data.diagnoses.find(d=>d.id==='adjustment').pattern,/and\/or/);
assert.match(data.diagnoses.find(d=>d.id==='schizo').course,/six months/);
assert.match(data.plainDescriptions.schizo.course,/six months/);
assert.match(html,/No authored overlap/);assert.match(html,/role="status"/);assert.doesNotMatch(html,/<select[^>]+id="c"/);
console.log('PASS: 26 bilingual profiles, 31 bilateral curated pairs, seven comparison dimensions, all plain overlaps, and cannabis/mood/adjustment clinical regressions.');
