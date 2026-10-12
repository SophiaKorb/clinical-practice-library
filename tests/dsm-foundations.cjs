/* DSM Foundations: content, accessible modes, quizzes, worked cases, and source-level visual QA.
   This regression test checks HTML/CSS/JS integrity; it is not a browser screenshot test. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const html=fs.readFileSync('resources/training/dsm-from-zero.html','utf8');
const css=fs.readFileSync('resources/training/dsm-foundations-experience.css','utf8');
const js=fs.readFileSync('resources/training/dsm-foundations-experience.js','utf8');
const lessons=[...html.matchAll(/<section class="lesson" id="lesson-(\d+)" aria-labelledby="title-(\d+)"/g)];
assert.equal(lessons.length,11,'11 lessons retained');
lessons.forEach((m,i)=>assert.deepEqual([Number(m[1]),Number(m[2])],[i+1,i+1]));
const outline=[...html.matchAll(/<a href="#lesson-(\d+)"><span>Lesson (\d+)<\/span>/g)];
assert.equal(outline.length,11,'all lesson outline links');
outline.forEach((m,i)=>assert.deepEqual([Number(m[1]),Number(m[2])],[i+1,i+1]));
assert.match(html,/href="#lesson-1">Start lesson 1/);
assert.match(html,/id="documentation-guide"/);
assert.doesNotMatch(html,/<[^>]+class="course-color-key"/,'noninteractive color legend remains removed');
assert.match(html,/class="safety-note"/,'safety callouts remain distinct');
assert.match(html,/Follow your supervisor’s instructions, your agency’s documentation policies/);
assert.match(html,/<details class="audience-details" id="audience">[\s\S]*?<summary>Who this course is for/);
assert.ok(html.indexOf('id="documentation-guide"')>html.indexOf('id="lesson-11"'),'documentation appendix follows the lessons');
assert.ok(html.indexOf('id="documentation-guide"')<html.indexOf('id="finish"'),'documentation appendix remains accessible before course conclusion');
for(const group of ['Anyone curious about diagnosis','Clients, families, and advocates','Students, supervised trainees','Support, peer, school, and case-management staff'])assert.ok(html.includes(group));
assert.match(html,/(?:Alcohol withdrawal|Withdrawal from heavy alcohol use) can be life-threatening/);
assert.match(html,/tolerance and withdrawal are not counted as SUD criteria/);
assert.match(html,/At least two applicable criteria/);
assert.match(html,/2–3/);assert.match(html,/4–5/);assert.match(html,/6\+/);
const quizStart=[...html.matchAll(/<div class="check" data-quiz(?: data-multi)?>/g)];
const quizSegments=html.split(/<div class="check" data-quiz(?: data-multi)?>/).slice(1);
assert.equal(quizStart.length,80,'80 total practice questions');
assert.equal(quizSegments.length,80,'questions are independently addressable');
assert.match(html,/id="all-questions-toggle" aria-pressed="false">Show all 80 questions/);
let single=0,multi=0;
const positions=[0,0,0];
quizSegments.forEach((chunk,i)=>{
 const main=chunk.slice(0,chunk.indexOf('</div>'));
 const options=[...main.matchAll(/<button type="button" data-answer="(yes|no)" data-feedback="([^"]+)">/g)];
 const correct=options.filter(m=>m[1]==='yes');
 const isMulti=quizStart[i][0].includes('data-multi');
 assert.ok(options.length>=3&&options.length<=4,'3 or 4 choices at question '+(i+1));
 assert.ok(options.every(m=>m[2].trim().length>=20),'specific feedback at question '+(i+1));
 if(isMulti){
   multi++;
   assert.ok(correct.length>1&&correct.length<options.length,'select-all quiz '+(i+1));
   assert.match(chunk.slice(0,4000),/class="quiz-submit"/,'multi-answer submit control');
 }else{
   single++;
   assert.equal(correct.length,1,'single-answer quiz '+(i+1));
   positions[options.findIndex(m=>m[1]==='yes')]++;
 }
});
assert.equal(single,72);
assert.equal(multi,8);
assert.ok(Math.max(...positions)-Math.min(...positions)<=5,'single-answer positions reasonably balanced');
assert.equal((html.match(/class="extra-examples"/g)||[]).length,11,'each lesson has worked cases');
assert.equal((html.match(/class="example worked-example"/g)||[]).length,33,'33 worked examples');
for(const item of html.matchAll(/<div class="example worked-example">([\s\S]*?)<\/div>/g)){
 const labels=[...item[1].matchAll(/<li><b>(\d)\. ([^<]+)<\/b>/g)].map(m=>m[1]+'. '+m[2]);
 assert.deepEqual(labels,[
 '1. What do we know?','2. What do we ask or test?',
 '3. What does the result tell us?','4. What do we do next?'
 ],'consistent four-step worked cases');
 assert.ok(item[1].includes('The takeaway:'),'each case has a takeaway');
}
assert.equal((html.match(/class="vocab-entry" data-vocab-entry/g)||[]).length,33);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'unique anchor ids');
for(const href of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(href[1]),'valid fragment '+href[1]);
assert.equal((html.match(/<figure class="concept-stage relationship-stage" aria-labelledby="stage-title-\d+"/g)||[]).length,11,'11 labeled relationship teaching diagrams');
for(let i=1;i<=11;i++){
 assert.ok(html.includes('id="stage-title-'+i+'"'),'unique diagram heading '+i);
 assert.ok(html.includes('aria-labelledby="stage-title-'+i+'"'),'visual diagram labelled by heading '+i);
}
assert.match(html,/<body data-experience="studio">/,'visual studio initial mode');
assert.match(html,/data-experience-choice="studio" aria-pressed="true"/);
assert.match(html,/data-experience-choice="clarity" aria-pressed="false"/);
assert.match(html,/dsm-foundations-experience\.css/);
assert.match(html,/dsm-foundations-experience\.js/);
assert.match(js,/aria-pressed/);
assert.match(js,/localStorage\.setItem/);
assert.match(js,/localStorage\.getItem/);
assert.match(js,/new URLSearchParams/);
assert.match(css,/body\[data-experience="clarity"\]/);
assert.match(css,/body\[data-experience="studio"\]/);
assert.match(css,/\.concept-stage\{display:none\}/,'diagrams hidden in clarity');
assert.match(css,/body\[data-experience="studio"\] \.concept-stage\{display:block/);
assert.match(css,/@media\(max-width:700px\)/,'mobile design');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/,'motion preference');
assert.match(css,/@media print/,'print mode');
assert.match(css,/@media\(forced-colors:active\)/,'forced-colors mode');
assert.ok(!html.includes('What is the biggest risk of confusing a category with an explanation?'));
assert.match(html,/class="study-loop" aria-labelledby="study-loop-title"/,'study rhythm present');
assert.match(html,/Explore\. Apply\. Recall\./,'three-step learning scaffold');
assert.match(html,/A person sorts travel photographs by the feelings each trip evokes/,'review item stands alone');
assert.match(html,/Important information is missing or conflicting, so the available evidence cannot yet support a confident conclusion/,'evidence-quality answer is precise');
assert.ok(!html.includes('What does this example demonstrate about personally meaningful categories?'),'context-dependent quiz item removed');
assert.match(css,/\.study-loop-steps\{display:grid/,'learning rhythm responsive layout');
assert.match(html,/id="finish"/);
const hub=fs.readFileSync('resources/therapy/clinical-intern-learning-hub.html','utf8');
assert.match(hub,/DSM Foundations: eleven lessons/);
console.log('PASS DSM Foundations: dual accessible modes; 11 lessons; 80 questions (72 single, 8 select-all); 33 worked cases; 33 glossary entries; 11 diagrams; semantic and safety checks.');
