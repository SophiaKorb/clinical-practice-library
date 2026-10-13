/* Authored educational-content integrity only; not a clinical diagnostic fact-check. */
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync('resources/training/diagnosis-comparer.html','utf8');
const parse=name=>{
 const m=html.match(new RegExp('const '+name+'=(\\[[^\\n]+\\]);'));
 assert.ok(m,'missing authored source array: '+name);
 return JSON.parse(m[1]);
};
const diagnoses=parse('diagnoses'),presets=parse('presetsData'),venn=parse('vennData');
assert.equal(diagnoses.length,14,'fourteen authored summaries');
assert.equal(presets.length,10,'ten reviewed comparison prompts');
assert.equal(venn.length,10,'ten authored feature comparisons');
const map=new Map(diagnoses.map(x=>[x.id,x]));
assert.equal(map.size,14,'unique diagnosis selectors');
for(const d of diagnoses){
 for(const field of ['name','pattern','course','ask','caveat'])
  assert.ok(typeof d[field]==='string'&&d[field].length>(field==='name'?2:23),d.id+' must explain '+field);
 assert.ok(/\?|how|what|when|which|were|does|do |are |is /i.test(d.ask),'question requires clinical investigation '+d.id);
}
const key=(a,b)=>[a,b].sort().join('|'),seen=new Set();
for(const p of presets){
 assert.ok(map.has(p.a)&&map.has(p.b)&&p.a!==p.b,'known distinct pair');
 assert.ok(p.title.length>15&&p.description.length>60,'presets explain uncertainty');
 const k=key(p.a,p.b);
 assert.ok(!seen.has(k),'duplicate pair '+k);
 seen.add(k);
}
const written=new Set();
for(const v of venn){
 const k=key(v.a,v.b);
 assert.ok(seen.has(k),'do not imply unsupported comparison is curated '+k);
 assert.ok(!written.has(k),'unique authored Venn '+k);
 written.add(k);
 assert.ok(Array.isArray(v.shared)&&v.shared.length===3&&v.shared.every(x=>x.length>=10),
  'three explicit, bounded possible common features '+k);
 for(const f of ['aOnly','bOnly','probe'])
  assert.ok(typeof v[f]==='string'&&v[f].length>=45,k+' requires supported differential narrative '+f);
}
assert.deepEqual(written,seen,'no curated pair lacks authored distinguishing material');
for(const text of ['not to scale','not a diagnostic instrument','not','no authored overlap']){
 assert.ok(html.toLowerCase().includes(text),'teaching caveat absent: '+text);
}
assert.match(html,/no authored overlap/i,'uncurated combinations must decline invented claims');
assert.match(html,/<select[^>]+id="a"/i,'first diagnosis selector required');
assert.match(html,/<select[^>]+id="b"/i,'second diagnosis selector required');
assert.doesNotMatch(html,/<select[^>]+id="c"/i,'removed third diagnosis selector must stay absent');
assert.match(html,/role="status"/,'selection status surfaced');
assert.match(html,/aria-labelledby="venn-svg-title venn-svg-desc"/,'SVG alternative preserved');
console.log('PASS: 14 authored diagnoses, 10 one-to-one curated differentials, 3 cautious features per pair, distinction questions and unsupported-pair guard.');
