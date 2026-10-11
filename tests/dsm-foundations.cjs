/* Regression checks for the integrated DSM Foundations course.
   Source-level only; browser rendering is exercised in colorful-site-rendered.cjs. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const html=fs.readFileSync('resources/training/dsm-from-zero.html','utf8');
const lessons=[...html.matchAll(/<section class="lesson" id="lesson-(\d+)" aria-labelledby="title-(\d+)"/g)];
assert.equal(lessons.length,11,'All 11 lessons');
lessons.forEach((m,i)=>assert.deepEqual([Number(m[1]),Number(m[2])],[i+1,i+1]));
const outline=[...html.matchAll(/<a href="#lesson-(\d+)"><span>Lesson (\d+)<\/span>/g)];
assert.equal(outline.length,11);
outline.forEach((m,i)=>assert.deepEqual([Number(m[1]),Number(m[2])],[i+1,i+1]));
assert.match(html,/href="#lesson-1">Start lesson 1/,'Start points to Lesson 1');
assert.match(html,/id="documentation-guide"/);
assert.match(html,/<details class="audience-details" id="audience">[\s\S]*?<summary>Who this course is for/,'audience is a native expandable disclosure');
assert.doesNotMatch(html,/<details\b[^>]*\bopen\b[^>]*\bid="audience"/,'audience disclosure starts closed');
for(const group of ['Anyone curious about diagnosis','Clients, families, and advocates','Students, supervised trainees','Support, peer, school, and case-management staff'])assert.ok(html.includes(group),'audience path '+group);
assert.ok(html.indexOf('id="documentation-guide"')>html.indexOf('id="lesson-3"'));
assert.ok(html.indexOf('id="documentation-guide"')<html.indexOf('id="lesson-4"'));
assert.match(html,/id="lesson-7"[\s\S]*?Understanding substance use disorders/);
const quizzes=[...html.matchAll(/<div class="check" data-quiz>([\s\S]*?)<p class="feedback" role="status" aria-live="polite">Choose an answer for feedback\.<\/p><\/div>/g)];
assert.equal(quizzes.length,99,'11 lessons with nine questions each');
const positions=[0,0,0];
for(const [i,match] of quizzes.entries()){
 const buttons=[...match[1].matchAll(/<button type="button" data-answer="(yes|no)" data-feedback="([^"]+)">([\s\S]*?)<\/button>/g)];
 assert.ok(buttons.length>=2 && buttons.length<=3,'two or three choices in '+i);
 const correct=buttons.filter(x=>x[1]==='yes');
 assert.equal(correct.length,1,'one correct option '+i);
 assert.ok(buttons.every(b=>b[2].trim().length>=35),'specific feedback '+i);
 const idx=buttons.findIndex(b=>b[1]==='yes');
 positions[idx]++;
}
assert.deepEqual(positions,[33,33,33],'avoid positional answer bias');
const caseBanks=[...html.matchAll(/<details class="extra-examples">([\s\S]*?)<\/details>/g)];
assert.equal(caseBanks.length,11);
for(const [i,bank] of caseBanks.entries()){
 assert.equal((bank[1].match(/class="example worked-example"/g)||[]).length,3,'three worked cases in lesson '+(i+1));
 for(const label of ['Situation:','Follow it through:','What changes:','The takeaway:']){
  assert.equal(bank[1].split(label).length-1,3,'three '+label+' sections in lesson '+(i+1));
 }
}
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'unique IDs');
for(const href of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(href[1]),'fragment '+href[1]);
assert.equal((html.match(/class="vocab-entry" data-vocab-entry/g)||[]).length,33,'33 glossary terms');
for(const token of ['--surface-example','--surface-question','--surface-safety','--surface-correct','--surface-reconsider'])assert.ok(html.includes(token),'semantic color '+token);
assert.match(html,/class="course-color-key"/,'visible color legend');
assert.match(html,/class="safety-note"/,'clearly labeled acute safety caution');
assert.match(html,/(?:Alcohol withdrawal|Withdrawal from heavy alcohol use) can be life-threatening/,'withdrawal safety');
assert.match(html,/tolerance and withdrawal are not counted as SUD criteria/,'medically supervised treatment exception');
assert.match(html,/At least two applicable criteria/,'threshold guidance');
assert.match(html,/2–3/);assert.match(html,/4–5/);assert.match(html,/6\+/);
assert.ok(!/\b(?:clinicians?|behavioral.health professionals?)\b/i.test(html),'role-specific language');
assert.ok((html.match(/—/g)||[]).length<=4,'em dashes remain rare');
assert.equal((html.match(/<details\b/g)||[]).length,(html.match(/<\/details>/g)||[]).length,'balanced disclosure elements');
const hub=fs.readFileSync('resources/therapy/clinical-intern-learning-hub.html','utf8');
assert.match(hub,/DSM Foundations: eleven lessons/,'hub course description is current');
console.log('PASS DSM Foundations: 11 ordered lessons, 99 tailored questions, balanced key positions, 33 stepped cases, 33 glossary entries, semantics and safety.');
