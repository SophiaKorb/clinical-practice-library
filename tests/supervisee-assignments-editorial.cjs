'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const pages={
  home:read('index.html'),
  start:read('resources/start-here.html'),
  workforce:read('resources/training/workforce-learning-center.html'),
  training:read('resources/therapy/clinical-intern-learning-hub.html')
};
const forbidden=[/start with the question in front of you/i,/choose the question in front of you/i,/four learning paths/i,/start with a question/i,/choose your path/i,/learning pathway/i];
for(const [name,html] of Object.entries(pages)){
  for(const pattern of forbidden)assert.doesNotMatch(html,pattern,name+' retains unhelpful direction');
}
assert.match(pages.start,/Find resources for a clinical task/);
assert.match(pages.workforce,/Choose a skill to practice/);
assert.match(pages.workforce,/href="\/resources\/therapy\/clinical-intern-learning-hub\.html#assignments"/);
assert.match(pages.training,/id="assignments"/);
assert.match(pages.training,/fictional cases only/);
assert.match(pages.training,/Do not upload or enter protected health information/);
assert.match(pages.training,/meets standard/);
const assignments=[...pages.training.matchAll(/<article class="assignment">([\s\S]*?)<\/article>/g)];
assert.equal(assignments.length,6,'Six bounded supervised assignments are required');
const titles=['observation','competing explanations','collaborative interviewing','safety handoff','care plan','clinical note'];
assignments.forEach(([full,body],index)=>{
  assert.match(body,new RegExp(titles[index],'i'),'Wrong or missing assignment '+(index+1));
  assert.match(body,/class="submission"/,'Missing deliverable '+(index+1));
  assert.match(body,/class="feedback"/,'Missing supervisor criteria '+(index+1));
  assert.match(body,/<ol>.*?<li>/s,'Missing steps '+(index+1));
  const anchors=[...body.matchAll(/href="(\/[^"]+)"/g)];
  assert.ok(anchors.length>0,'Assignment '+(index+1)+' needs a practical resource');
  for(const [,href] of anchors){
    const target=path.join(root,decodeURI(href).split('#')[0].replace(/^\//,''));
    assert.ok(fs.existsSync(target),'Missing linked assignment resource: '+href);
  }
});
assert.match(pages.training,/\.assignment-grid\{/);
assert.match(pages.training,/@media\(max-width:760px\)/);
assert.match(pages.training,/@media print/);
console.log('PASS: Plain-language entry points; 6 specific fictional assignments, deliverables, supervision standards and valid resources.');
