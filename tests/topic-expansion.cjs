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
 if(r.type==='support-map'){
  if(r.topic==='sibling-conflict-safety-repair'){
   assert.ok(html.includes('class="sibling-safety-flow"'),'approved safeguarding flow missing');
   assert.ok(html.indexOf('Adult responsibility — always')<html.indexOf('Unsafe or coercive'));
   assert.ok(html.indexOf('Adult responsibility — always')<html.indexOf('Safe and voluntary'));
   assert.ok(html.indexOf('Ongoing support for all siblings')>html.indexOf('Do not require forgiveness'));
   assert.equal((html.match(/<li><strong>/g)||[]).length,6,'three distinct actions per safety route');
  } else if(r.topic==='panic-alarm-loop'){
   assert.ok(html.includes('class="panic-cycle"'),'approved circular feedback model missing');
   assert.equal((html.match(/class="panic-cycle__step panic-cycle__step--/g)||[]).length,6,'six distinct panic cycle stages');
   assert.equal((html.match(/marker-end="url\(#panic-cycle-arrow\)"/g)||[]).length,6,'six directed curved arrows');
   assert.ok(html.includes('Renewed monitoring / fear'));
   assert.ok(html.includes('not a certainty or a diagnosis'));
   assert.doesNotMatch(html,/class="clinical-map return-loop"/);
  } else if(r.topic==='restrictive-eating-coordination'){
   assert.ok(html.includes('class="restrictive-parallel"'),'explicit concurrent tracks missing');
   assert.ok(html.indexOf('TWO TRACKS — ASSESS IN PARALLEL')<html.indexOf('Medical and nutritional safety'));
   assert.ok(html.indexOf('TWO TRACKS — ASSESS IN PARALLEL')<html.indexOf('Psychological, sensory and access understanding'));
   assert.ok(html.includes('Do not wait for the other track'),'urgent medical action must be independent');
   assert.ok(html.includes('One coordinated plan — as findings become available'));
   assert.doesNotMatch(html,/class="clinical-map parallel-assess"/,'legacy chain returned');
  } else assert.equal((html.match(/<li><strong>/g)||[]).length,5);
  assert.equal((html.match(/<textarea/g)||[]).length,4);
 }
 if(r.type==='progress-review'){assert.equal((html.match(/<th scope="row">/g)||[]).length,4);assert.ok(html.includes('Missing data is missing data'));}
 assert.ok(fs.existsSync('resources/downloads/topic-'+r.topic+'.pdf'));
}
for(const set of byTopic.values())assert.equal(set.size,6);
// Structural checks for meaningful visual models; source-level QA only, not rendered approval.
const models={'ocd-mental-rituals':'loop-choice','aphasia-communication-access':'access-tracks','child-aggression-caregiver-coaching':'abc-tracks','intellectual-disability-supported-choice':'access-tracks','health-anxiety-medical-plan':'loop-choice','body-dysmorphia-checking':'loop-choice','adult-autism-load-recovery':'context-budget','social-anxiety-attention':'attention-split','depression-activity-reward':'loop-choice','binge-eating-patterns':'loop-choice'};
for(const [slug,cls] of Object.entries(models)){
 for(const page of ['support-map.html','index.html']){
  const html=fs.readFileSync('resources/clinical-topics/'+slug+'/'+page,'utf8');
  assert.ok(html.includes('clinical-map '+cls),'missing semantic visual '+slug+' '+page);
  assert.ok(html.includes('class="map-legend"'),'missing accessible explanation '+slug);
  assert.equal((html.match(/<li><strong>/g)||[]).length,5,'five map parts '+slug);
  if(slug==='sibling-conflict-safety-repair'){
 
  }
 }
}
for(const page of ['support-map.html','index.html']){
 const html=fs.readFileSync('resources/clinical-topics/sibling-conflict-safety-repair/'+page,'utf8');
 assert.ok(html.includes('role="group" aria-label="Sibling conflict: adult responsibility applies in both pathways'));
 assert.ok(html.indexOf('Adult responsibility — always') < html.indexOf('Unsafe or coercive'));
 assert.ok(html.indexOf('Adult responsibility — always') < html.indexOf('Safe and voluntary'));
 assert.ok(html.indexOf('Ongoing support for all siblings') > html.indexOf('Do not require forgiveness'));
 assert.ok(html.includes('Do not require joint mediation'));
 assert.ok(html.includes('A child may refuse without penalty'));
 assert.doesNotMatch(html,/class="clinical-map safety-gate"/,'outdated misleading sequence must not recur');
}
for(const page of ['support-map.html','index.html']){
 const html=fs.readFileSync('resources/clinical-topics/restrictive-eating-coordination/'+page,'utf8');
 assert.ok(html.includes('role="group" aria-label="Two parallel assessments of restrictive eating, with immediate medical escalation when indicated'));
 assert.ok(html.includes('TWO TRACKS — ASSESS IN PARALLEL'));
 assert.ok(html.includes('Urgent concerns? Act without waiting.'));
 assert.ok(html.includes('Do not wait for the other track'));
 assert.ok(html.includes('both medical safety and everyday participation'));
 assert.ok(html.includes('Check medical safety now'));
 assert.doesNotMatch(html,/class="clinical-map parallel-assess"/);
}
for(const page of ['support-map.html','index.html']){
 const html=fs.readFileSync('resources/clinical-topics/panic-alarm-loop/'+page,'utf8');
 assert.ok(html.includes('class="panic-cycle"'));
 assert.ok(html.includes('viewBox="0 0 840 640"'));
 assert.equal((html.match(/class="panic-cycle__step panic-cycle__step--[1-6]"/g)||[]).length,6);
 assert.equal((html.match(/marker-end="url\(#panic-cycle-arrow\)"/g)||[]).length,6);
 assert.ok(html.indexOf('Body sensation or trigger')<html.indexOf('Feared interpretation'));
 assert.ok(html.indexOf('Feared interpretation')<html.indexOf('Alarm / panic surge'));
 assert.ok(html.indexOf('Alarm / panic surge')<html.indexOf('Protective response'));
 assert.ok(html.indexOf('Protective response')<html.indexOf('Short-term relief'));
 assert.ok(html.indexOf('Short-term relief')<html.indexOf('Renewed monitoring / fear'));
 assert.ok(html.includes('medically indicated care'));
}
const mapCss=fs.readFileSync('resources/clinical-topics/topic-tools.css','utf8');
assert.ok(mapCss.includes('@media print')&&mapCss.includes('.sibling-safety-flow')&&mapCss.includes('.restrictive-parallel__tracks')&&mapCss.includes('.panic-cycle__arrows'));
const api=require('../resources/clinical-topics/topic-tools.js');
const b=(s)=>({attrs:{'data-feedback':s},getAttribute(k){return this.attrs[k]},setAttribute(k,v){this.attrs[k]=v}});
const one=b('Incomplete: missing access assessment'),two=b('Best supported: keep access and assess');let out={textContent:''};
api.select(two,[one,two],out);assert.equal(out.textContent,'Best supported: keep access and assess');assert.equal(two.attrs['aria-pressed'],'true');assert.equal(one.attrs['aria-pressed'],'false');
api.select(one,[one,two],out);assert.equal(out.textContent,'Incomplete: missing access assessment');assert.equal(two.attrs['aria-pressed'],'false');
const areas=[{value:'fictional note'}];api.clear(areas,[one,two],[out]);assert.equal(areas[0].value,'');assert.equal(one.attrs['aria-pressed'],'false');assert.ok(out.textContent.includes('Choose an option'));
const content=JSON.parse(require('node:child_process').execFileSync('python',['-c',"import json,runpy;print(json.dumps(runpy.run_path('scripts/expansion-topics.py')['TOPICS']))"],{encoding:'utf8',maxBuffer:2000000}));
assert.equal(new Set(content.map(t=>t.case)).size,content.length,'cases must have distinct authored content');
assert.equal(new Set(content.map(t=>t.understanding)).size,content.length,'formulations must be topic-specific');
for(const t of content){assert.ok(t.understanding.length>350);assert.equal(t.questions.length,4);assert.equal(t.hypotheses.length,3);assert.equal(t.client.length,4);assert.equal(t.care.length,4);assert.equal(t.metrics.length,4);assert.equal(t.choices.filter(c=>c[1].startsWith('Best supported')).length,1);}
const source=fs.readFileSync('resources/clinical-topics/topic-tools.js','utf8');assert.ok(!/localStorage|sessionStorage|fetch\(/.test(source),'tool must not store/transmit entries');
console.log(ledger.resources.length+' resource purposes, source links, cases, visual maps, monitoring tables and feedback state checked; no browser/clinical approval inferred');
