const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const visual=require('../resources/therapy/visual-reasoning-toolkit.js');
const workforce=require('../resources/training/workforce-learning-center.js');
const data=JSON.parse(fs.readFileSync('data/workforce-learning.json','utf8'));
assert.deepEqual(workforce,data,'published data/model drift');
assert.equal(visual.levels.length,6);
assert.equal(new Set(visual.levels).size,6);
assert.equal(workforce.tracks.length,4);
assert.deepEqual(workforce.tracks.map(t=>t.id),['notice','connect','explore','plan']);
assert.ok(!/high-school-diploma|bachelor.s-level|graduate clinical trainees|licensed clinicians|degree level/i.test(JSON.stringify(workforce.tracks)));

assert.equal(workforce.cases.length,3);
for(const c of workforce.cases){assert.ok(c.ask && c.coach && c.note && c.supervision);assert.equal(c.options.filter(o=>o.appropriate).length,1);}
class Element {
 constructor(dataset={},tag='BUTTON'){this.dataset=dataset;this.tagName=tag;this.value='';this.textContent='';this.checked=false;this.attrs={};this.handlers={};this.children=[];}
 addEventListener(event,fn){this.handlers[event]=fn;}
 setAttribute(k,v){this.attrs[k]=v;}
 replaceChildren(){this.children=[];}
 appendChild(c){this.children.push(c);}
 fire(event='click',extra={}){this.handlers[event]?.(extra);}
}
function harness(script,groups,ids){const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));const classes=new Set();const doc={getElementById:id=>elements[id],querySelectorAll:selector=>groups[selector]||[],createElement:tag=>new Element({},tag.toUpperCase()),body:{classList:{toggle(c){if(classes.has(c)){classes.delete(c);return false;}classes.add(c);return true;}}}};let prints=0;vm.runInNewContext(fs.readFileSync(script,'utf8'),{document:doc,window:{print(){prints++;}}});return {elements,classes,prints:()=>prints};}
const levels=visual.levels.map((_,i)=>new Element({level:String(i)}));
const body=[new Element({body:'head'},'circle'),new Element({body:'unsure'})];
const choices=[new Element({choice:'Not now'})];
const v=harness('resources/therapy/visual-reasoning-toolkit.js',{'[data-level]':levels,'[data-body]':body,'[data-choice]':choices},['client-view','contrast','print','barrier','barrier-result','body-result','scale-result','choice-result','example','clear-map','map-status','before','behavior','after','trial']);
v.elements.barrier.value='skill';v.elements.barrier.fire('change');assert.match(v.elements['barrier-result'].textContent,/instruction/);
for(let i=0;i<6;i++){levels[i].fire();assert.equal(v.elements['scale-result'].textContent,visual.levels[i]);assert.equal(levels.filter(l=>l.attrs['aria-pressed']==='true').length,1);}
v.elements['client-view'].fire();assert.ok(v.classes.has('client-view'));v.elements['client-view'].fire();assert.ok(!v.classes.has('client-view'));
v.elements.contrast.fire();assert.ok(v.classes.has('high-contrast'));v.elements.print.fire();assert.equal(v.prints(),1);
let prevented=false;body[0].fire('keydown',{key:' ',preventDefault(){prevented=true;}});assert.ok(prevented);assert.match(v.elements['body-result'].textContent,/Head/);
assert.equal(body[0].attrs['aria-pressed'],'true');
assert.equal(body[1].attrs['aria-pressed'],'false');
body[1].fire('click');
assert.equal(body[0].attrs['aria-pressed'],'false');
assert.equal(body[1].attrs['aria-pressed'],'true');
assert.match(v.elements['body-result'].textContent,/Not sure/);
choices[0].fire();assert.match(v.elements['choice-result'].textContent,/Not now/);
v.elements.before.value='Keep this';v.elements.example.fire();assert.equal(v.elements.before.value,'Keep this');assert.match(v.elements['map-status'].textContent,/not loaded/);v.elements['clear-map'].fire();assert.equal(v.elements.before.value,'');v.elements.example.fire();assert.match(v.elements.before.value,/spoken instructions/);
const tracks=workforce.tracks.map(t=>new Element({track:t.id}));const cases=workforce.cases.map(c=>new Element({case:c.id}));const checks=Array.from({length:9},()=>new Element());
const w=harness('resources/training/workforce-learning-center.js',{'[data-track]':tracks,'[data-case]':cases,'.skill-check':checks},['track-result','track-sequence','track-practice','track-boundary','case-title','case-story','case-ask','case-coach','case-note','case-supervision','case-feedback','case-options','practice-note','note-review','note-clear','note-feedback','skill-progress','reset-skills']);
for(let i=0;i<4;i++){tracks[i].fire();assert.equal(tracks.filter(t=>t.attrs['aria-pressed']==='true').length,1);assert.equal(w.elements['track-boundary'].textContent,workforce.tracks[i].boundary);assert.equal(w.elements['track-sequence'].textContent,workforce.tracks[i].sequence);}
for(let i=0;i<3;i++){cases[i].fire();assert.equal(w.elements['case-ask'].textContent,workforce.cases[i].ask);assert.equal(w.elements['case-coach'].textContent,workforce.cases[i].coach);assert.equal(w.elements['case-options'].children.length,3);for(let j=0;j<3;j++){w.elements['case-options'].children[j].fire();assert.equal(w.elements['case-feedback'].textContent,workforce.cases[i].options[j].feedback);}}
cases[0].fire();assert.match(w.elements['case-feedback'].textContent,/Choose an action/,'case switches must reset feedback');
w.elements['note-review'].fire();assert.match(w.elements['note-feedback'].textContent,/first/);w.elements['practice-note'].value='fictional observation';w.elements['note-review'].fire();assert.match(w.elements['note-feedback'].textContent,/does not grade/);w.elements['note-clear'].fire();assert.equal(w.elements['practice-note'].value,'');checks[0].checked=true;checks[0].fire('change');assert.match(w.elements['skill-progress'].textContent,/1 of 9/);w.elements['reset-skills'].fire();assert.ok(checks.every(c=>!c.checked));
for(const page of ['resources/therapy/visual-reasoning-toolkit.html','resources/training/workforce-learning-center.html']){const html=fs.readFileSync(page,'utf8');assert.match(html,/Skip to content/);assert.match(html,/not validated|not a.*validated|not validated/i);assert.doesNotMatch(html,/href=["'][^"']*dsm/i);if(page.includes('workforce-')){assert.match(html,/These paths are open to everyone/);assert.doesNotMatch(html,/High-school-diploma-level staff|Bachelor.s-level workers|Graduate clinical trainees|Licensed clinicians/);assert.equal((html.match(/Sophia Korb Cohon/g)||[]).length,1,'one creator credit');assert.ok(html.indexOf('Created by Sophia Korb Cohon')>html.indexOf('id="sources"'),'credit at bottom');assert.doesNotMatch(html,/Symptom Lab remains separate|Client workbooks and care-partner guides are separate|Education level helps organize learning|available without JavaScript|Primary source pages checked/);assert.match(html,/<footer class="learning-footer">[\s\S]*<\/footer><\/main>/);}}
console.log('PASS 8 visual tool types, 6 scale levels, no-overwrite/clear, keyboard body map, client/contrast toggles; 4 skill paths, 3 cases/9 choices, case reset, documentation and checklist behavior. Rendered browser QA remains separate.');
