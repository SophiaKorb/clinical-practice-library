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
assert.match(pages.home,/Supervised practice &amp; training/);
assert.match(pages.home,/Six supervisee assignments and review criteria/);
assert.doesNotMatch(pages.home,/four role-based paths/);
assert.doesNotMatch(pages.workforce,/assignments below/);
assert.match(pages.training,/marking missing information rather than supplying plausible details/);
assert.match(pages.training,/If support offered or timing is unknown, mark it/);
assert.match(pages.training,/pending confirmation/);
assert.match(pages.training,/note skeleton \(no prescribed word count\)/);
assert.doesNotMatch(pages.training,/120–180-word corrected fictional note/);
assert.doesNotMatch(pages.training,/90–140-word objective account/);
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

// Continue the editorial audit beyond the four entry pages. The repository
// includes historical/archived public pages, so report rather than silently
// rewriting source passages that have not received owner review.
const flagged=[];
const pattern=/\b(?:start with|choose) the question in front of you\b|\bfour learning paths\b|\blearning paths\b/gi;
function scan(dir){
  for(const item of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
    if(item.name==='node_modules'||item.name==='.git'||item.name==='legacy')continue;
    const rel=path.join(dir,item.name);
    if(item.isDirectory()){scan(rel);continue}
    if(!item.isFile()||!rel.endsWith('.html'))continue;
    const text=read(rel);
    const matches=[...text.matchAll(pattern)].map(m=>m[0]);
    if(matches.length)flagged.push({path:rel,count:matches.length,examples:[...new Set(matches)].slice(0,3)});
  }
}
scan('resources');
for(const p of ['index.html','library.html','classic.html']){
  if(fs.existsSync(path.join(root,p))){
    const hits=[...read(p).matchAll(pattern)];
    if(hits.length)flagged.push({path:p,count:hits.length});
  }
}
console.log('EDITORIAL_PHRASE_AUDIT',JSON.stringify(flagged));
assert.equal(flagged.length,0,'Public CPL pages still use vague question-in-front/learning-path language');

