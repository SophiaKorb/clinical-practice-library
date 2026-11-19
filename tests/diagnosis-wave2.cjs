'use strict';
/* Deterministic QA of Wave 2. No clinical endorsement or user data. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const base='resources/diagnoses/practice-labs/wave-2/';
const metadata=read('resources/clinical-finder-data.js');
const blob=s=>crypto.createHash('sha1').update('blob '+Buffer.byteLength(s)+'\0'+s).digest('hex');
assert.equal(blob(metadata),'a17555746c8a76f41cb2d2b234e4586ee46e5465','Canonical published 813-item finder data must remain exact');
const source=JSON.parse(metadata.replace(/^globalThis\.CPLFinderData\s*=\s*/,'').replace(/;\s*$/,''));
assert.equal(source.resources.length,813);
const prior=JSON.stringify(source.resources),contexts={CPLFinderData:source};
const add=p=>vm.runInNewContext(read(p),contexts);
const adhd='resources/diagnoses/adult-adhd-collection/finder-overlay.js',one='resources/diagnoses/practice-labs/finder-overlay.js',two=base+'finder-overlay.js';
add(adhd);add(one);const retained=JSON.stringify(source.resources);
assert.equal(source.resources.length,848);
add(two);assert.equal(source.resources.length,868,'Expected 813 canonical +31 ADHD +4 wave1 +16 wave2');
assert.equal(JSON.stringify(source.resources.slice(0,813)),prior,'Source entries overwritten');
assert.equal(JSON.stringify(source.resources.slice(0,848)),retained,'Prior overlays overwritten');
add(two);assert.equal(source.resources.length,868,'Wave 2 overlay is not idempotent');
const groups={
'learning':{'guide':'learning-disorders','topic':'Learning disorders','stages':['School age / adolescence']},
'psychosis-bipolar':{'guide':'psychosis-bipolar','topic':'Psychosis / bipolar','stages':['Adult']},
'substance-use':{'guide':'substance-use','topic':'Substance use','stages':['Adult']},
'grief':{'guide':'grief-bereavement','topic':'Grief / bereavement','stages':['Across ages / adapt to person']}
};
const hub=read(base+'index.html'),all=read('resources/diagnoses/practice-labs/index.html'),comprehensive=read('resources/diagnoses/comprehensive/index.html');
const paths=['index','facilitator','map','worksheets','case-to-action'];let promptTotal=0;
for(const [slug,spec] of Object.entries(groups)){
 const topicBase=base+slug+'/';
 assert(hub.includes('/'+topicBase+'index.html'),slug+' not in main lab collection');
 const comp=read('resources/diagnoses/comprehensive/'+spec.guide+'.html');
 assert(comp.includes('/'+topicBase+'index.html'),'Clinical guide has no tool backlink '+slug);
 assert.equal(source.resources.filter(r=>r.url.startsWith('/'+topicBase)).length,5,'Must index every topic page '+slug);
 for(const part of paths){
  const p=topicBase+part+'.html',html=read(p),u='/'+p;
  const record=source.resources.find(x=>x.url===u);
  assert(record,'Missing finder record '+p);
  assert.deepEqual([...record.tags.diagnosis],[spec.topic],'Wrong diagnosis facet '+p);
  assert.deepEqual([...record.tags.stage],spec.stages,'Wrong age scope '+p);
  for(const [facet,vals] of Object.entries(record.tags)){assert(Array.isArray(vals)&&vals.length>0,'Empty facet '+facet);for(const v of vals)assert(source.facets[facet]?.includes(v),'Unknown facet '+facet+': '+v)}
  assert(html.includes('name="viewport"')&&html.includes('name="robots" content="noindex"'),'Noindex/responsive scaffold '+p);
  assert(html.includes('<main id="main"')&&html.includes('<h1>')&&html.includes('class="skip"'),'Missing semantics '+p);
  assert(html.length>3500,'Too little content '+p);
  assert(!/localStorage|sessionStorage|fetch\s*\(|XMLHttpRequest|<form\b|<input\b|contenteditable/i.test(html),'Unnecessary storage or client input '+p);
  assert(!/review-only|do not merge|do not deploy|release approval|QA checkpoint|draft PR/i.test(html),'Internal release copy exposed to end users '+p);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'Duplicate id '+p);
  for(const [,fragment] of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(fragment),'Broken anchor '+fragment+' '+p);
  if(part==='map'){
   assert.equal((html.match(/data-choice="/g)||[]).length,4,'Need four distinct choices '+p);
   assert.equal((html.match(/data-choice-panel="/g)||[]).length,4,'Need four panels '+p);
   assert(html.includes('aria-pressed="true"')&&html.includes('aria-live="polite"'),'Missing accessible interaction '+p);
  }
  if(part==='worksheets'){
   assert.equal((html.match(/class="sheet"/g)||[]).length,2,'Must print two sheets '+p);
   assert.equal((html.match(/class="write-lines"/g)||[]).length,10,'Five prompts per sheet '+p);
   promptTotal+=10;
  }
 }
}
assert.equal(promptTotal,40);
let extraPromptTotal=0;for(const slug of Object.keys(groups)){const h=read(base+slug+'/case-to-action.html');assert.equal((h.match(/class="sheet"/g)||[]).length,2,'Two extra printed sheets '+slug);assert.equal((h.match(/class="write-lines"/g)||[]).length,10,'Ten extra prompts '+slug);assert(h.includes('Fictional case')&&h.includes('noindex'),'Case example and scope '+slug);extraPromptTotal+=10;}assert.equal(extraPromptTotal,40);
assert(hub.includes('Learning disorders')&&hub.includes('Grief / bereavement'));
assert(all.includes('/'+base+'index.html')&&comprehensive.includes('/'+base+'index.html'),'Collection routes not discoverable');
for(const p of ['resources/diagnoses/index.html','resources/clinical-resource-finder.html']){
 const html=read(p),needle=['/resources/clinical-finder-data.js','/resources/diagnoses/adult-adhd-collection/finder-overlay.js','/resources/diagnoses/practice-labs/finder-overlay.js','/'+base+'finder-overlay.js'];
 const positions=needle.map(s=>html.indexOf(s));assert(positions.every(x=>x>=0)&&positions.every((x,i)=>i===0||x>positions[i-1]),'Finder overlay order '+p);
}
const script=read(base+'choice-map.js');assert(!/localStorage|sessionStorage|fetch\s*\(|XMLHttpRequest/.test(script),'JS stores or sends data');
assert(script.includes("aria-pressed")&&script.includes('data-choice-panel'));
const notes=read('docs/qa/2026-11-17-practice-labs-wave2-sources.md');for(const spec of Object.values(groups))assert(notes.includes(spec.topic),'Missing source crosswalk');
console.log('DIAGNOSIS_WAVE2_STATIC_PASS '+JSON.stringify({canonical:813,prior:35,new:20,runtime:868,pages:20,printSheets:16,writingPrompts:80,diagnosisFacets:4}));
