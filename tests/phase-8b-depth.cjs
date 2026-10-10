const fs = require('node:fs'), assert = require('node:assert/strict');
const root = 'resources/clinical-depth/';
const names = ['index.html','self-harm-safety-continuity.html','complex-dissociation-functional-care.html','dissociation-function-observation.html','complex-personality-longitudinal-care.html','neuropsych-evaluation-access-validity.html','assessment-decision-report-planner.html'];
for (const name of names) {
 const html=fs.readFileSync(root+name,'utf8');
 assert.match(html,/<main id="content">/,'main present '+name);
 assert.equal((html.match(/<nav class="cpl-static-nav"/g)||[]).length,1,'global nav '+name);
 assert.equal((html.match(/href="\/resources\/site-navigation.css"/g)||[]).length,1,'nav style '+name);
 assert.match(html,/\/resources\/clinical-depth\/clinical-depth.css/,'clinical depth style '+name);
 assert.match(html,/Qualified (specialty|assessment) clinical review pending/,'qualified review gate '+name);
 assert.ok(!html.includes('aria-current="page"'),'do not mislabel current nav '+name);
 const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]));
 assert.equal(ids.size,[...html.matchAll(/\bid="([^"]+)"/g)].length,'unique ids '+name);
 for(const match of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.has(match[1]),'fragment '+match[1]+' in '+name);
}
const safety=fs.readFileSync(root+names[1],'utf8');
for(const text of ['Physical and immediate safety','Psychosocial engagement and formulation','concurrent','self-harm','follow-up','hacking-does-not-exist'])if(text==='hacking-does-not-exist')assert.ok(!safety.includes(text));else assert.ok(safety.toLowerCase().includes(text.toLowerCase()));
assert.match(safety,/do not rely on|do not infer|does not|not a prediction score/i);
assert.match(safety,/NICE NG225/);
assert.match(safety,/what happens next/i);
assert.match(safety,/no-suicide contract/);
assert.match(safety,/Morgan/);
const did=fs.readFileSync(root+names[2],'utf8');
for(const text of ['DID','neurological','non-leading','functional','ISSTD','PTSD','subjective continuity','River','integration'])assert.ok(did.toLowerCase().includes(text.toLowerCase()),'DID section '+text);
assert.match(did,/2011/);
assert.match(did,/not an RCT/);
assert.ok(did.includes('dissociation-function-observation.html'));

const personality=fs.readFileSync(root+'complex-personality-longitudinal-care.html','utf8');
for(const term of ['NICE CG78','APA Practice Guideline','GPM','rupture','Engulfment','Abandonment','Leah','supervision']) assert.ok(personality.toLowerCase().includes(term.toLowerCase()));
assert.match(personality,/cycle-map/);
assert.match(personality,/Clinical Practice Library/);
const neuro=fs.readFileSync(root+'neuropsych-evaluation-access-validity.html','utf8');
for(const term of ['ASHA Aphasia','Jules','Casey','comprehension','norm','interpretation']) assert.ok(neuro.toLowerCase().includes(term.toLowerCase()));
const report=fs.readFileSync(root+'assessment-decision-report-planner.html','utf8');
assert.equal((report.match(/<textarea\b/g)||[]).length,8);
assert.equal((report.match(/<label for="/g)||[]).length,8);
assert.ok(report.includes('Clear entries'));
const obs=fs.readFileSync(root+names[3],'utf8');
for(const domain of ['Personal care','Work/school','Finances','Travel','Conversations']) assert.ok(obs.includes(domain));
assert.equal((obs.match(/<textarea\b/g)||[]).length,5);
assert.equal((obs.match(/<label for="/g)||[]).length,5);
assert.ok(obs.includes('not saved or submitted'));
const hub=fs.readFileSync(root+names[0],'utf8');
for(const name of names.slice(1))assert.ok(hub.includes(name),'hub links '+name);
for(const old of ['index.html','resources/clinical-resource-finder.html','resources/therapy/start-here-therapy-resource-shelves.html','resources/assessment/trauma-ptsd-dissociation-safety.html','resources/therapy/trauma-ptsd-practical-toolkit.html']) {
 const t=fs.readFileSync(old,'utf8');
 assert.ok(t.includes('clinical-depth/'),'old pathway connected '+old);
}
const finder=JSON.parse(fs.readFileSync('data/clinical-finder.json','utf8'));
const current=new Map(finder.resources.map(r=>[r.url,r]));
for(const route of names) {
 const url='/resources/clinical-depth/'+route;
 const entry=current.get(url);
 assert.ok(entry,'Phase 8B searchable '+route);
 assert.ok(entry.metadataBasis.includes('Phase 8B'),'curated coverage '+route);
 assert.ok(entry.tags.role.includes('Clinician')||entry.tags.role.includes('Client / caregiver'),'appropriate audience '+route);
}
assert.ok(!finder.resources.some(r=>r.url.startsWith('/legacy/')));
const matrix=JSON.parse(fs.readFileSync('data/phase-8b-gap-matrix.json','utf8'));
assert.ok(matrix.entries.length>=15);
assert.equal(new Set(matrix.entries.map(x=>x.key)).size,matrix.entries.length);
assert.ok(matrix.entries.every(x=>x.present.length&&x.missing.length&&x.firstAction&&x.review));
const css=fs.readFileSync(root+'clinical-depth.css','utf8');
assert.match(css,/@media\(max-width:680px\)/);
assert.match(css,/@media print/);
assert.match(css,/two-tracks/);
assert.match(css,/outcome-grid/);
const dsm=fs.readFileSync('resources/training/dsm-from-zero.html','utf8');
assert.equal((dsm.match(/href="\/resources\/site-navigation.css"/g)||[]).length,1,'DSM stylesheet only once');
console.log('PASS Phase 8B: source safety/uncertainty checks, 15 audited content gaps, deep linked pathways, visuals, print/mobile source rules and 4 new accessible pages');
