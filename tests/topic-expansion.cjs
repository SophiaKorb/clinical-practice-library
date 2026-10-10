const fs=require('fs'),assert=require('node:assert/strict'),path=require('path');
const ledger=JSON.parse(fs.readFileSync('data/topic-expansion-ledger.json'));
const evidence=JSON.parse(fs.readFileSync('data/topic-evidence-registry.json'));
assert.equal(ledger.resources.length,ledger.completedMeaningfulResources);
assert.equal(new Set(ledger.resources.map(x=>x.path)).size,ledger.resources.length);
const byTopic=new Map();
for(const r of ledger.resources){
 const html=fs.readFileSync(r.path,'utf8');assert.ok(html.includes('Qualified')||html.includes('qualified'));
 assert.ok(html.includes('Safety and scope'));assert.ok(html.includes('lang="en"'));
 assert.ok(!html.includes('/legacy/'));assert.ok(html.includes('/progress-review.html'));
 r.sources.forEach(s=>assert.ok(evidence.sources[s]));
 const set=byTopic.get(r.topic)||new Set();set.add(r.type);byTopic.set(r.topic,set);
 if(r.type==='case'){
  const options=[...html.matchAll(/data-feedback="([^"]+)"/g)];assert.equal(options.length,3);
  assert.ok(options[0][1]!==options[1][1]);assert.ok(html.includes('role="status"'));
  assert.ok(html.includes('Worked formulation'));assert.ok(html.includes('Fictional case:'));
 }
 if(r.type==='support-map'){assert.equal((html.match(/<li><strong>/g)||[]).length,5);assert.equal((html.match(/<textarea/g)||[]).length,4);}
 if(r.type==='progress-review'){assert.equal((html.match(/<th scope="row">/g)||[]).length,4);assert.ok(html.includes('Missing data is missing data'));}
 assert.ok(fs.existsSync('resources/downloads/topic-'+r.topic+'.pdf'));
}
for(const set of byTopic.values())assert.equal(set.size,6);
const api=require('../resources/clinical-topics/topic-tools.js');
const b=(s)=>({attrs:{'data-feedback':s},getAttribute(k){return this.attrs[k]},setAttribute(k,v){this.attrs[k]=v}});
const one=b('Incomplete: missing access assessment'),two=b('Best supported: keep access and assess');let out={textContent:''};
api.select(two,[one,two],out);assert.equal(out.textContent,'Best supported: keep access and assess');assert.equal(two.attrs['aria-pressed'],'true');assert.equal(one.attrs['aria-pressed'],'false');
api.select(one,[one,two],out);assert.equal(out.textContent,'Incomplete: missing access assessment');assert.equal(two.attrs['aria-pressed'],'false');
console.log(ledger.resources.length+' resource purposes, source links, cases, visual maps, monitoring tables and feedback state checked; no browser/clinical approval inferred');
