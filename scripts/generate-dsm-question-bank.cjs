/* Exact-source editorial bank: generated from live course (not a separate answer key).
   Run: node scripts/generate-dsm-question-bank.cjs --write
        node scripts/generate-dsm-question-bank.cjs --check */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const html=fs.readFileSync('resources/training/dsm-from-zero.html','utf8');
const path='docs/qa/dsm-foundations-all-questions.md';
const entities={'amp':'&','lt':'<','gt':'>','quot':'"','apos':"'",'nbsp':' ','rsquo':'’','lsquo':'‘','rdquo':'”','ldquo':'“','mdash':'—','ndash':'–'};
function decode(t){return t.replace(/<[^>]*>/g,'').replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi,(_,e)=>{
  if(e[0]==='#')return String.fromCodePoint(e[1].toLowerCase()==='x'?parseInt(e.slice(2),16):parseInt(e.slice(1),10));
  return entities[e]??'&'+e+';';
}).trim();}
const lessons=[...html.matchAll(/<section class="lesson" id="lesson-(\d+)" aria-labelledby="title-\d+"/g)].map(m=>({
  n:+m[1],start:m.index,title:decode((html.match(new RegExp('<h2 id="title-'+m[1]+'">([^<]+)</h2>'))||[])[1]||'')
}));
assert.equal(lessons.length,11,'11 course lessons');
assert.ok(lessons.every(l=>l.title),'each lesson has a heading');
const questions=[...html.matchAll(/<div class="check" data-quiz( data-multi)?><h3>[^<]*<\/h3><p>([\s\S]*?)<\/p>[\s\S]*?<div class="answers">([\s\S]*?)<\/div>/g)];
assert.equal(questions.length,80,'80 questions');
const lines=['# DSM Foundations: all 80 questions','','Editorial review copy generated from the current 11-lesson course. Includes 72 single-answer questions and 8 select-all questions. Correct options and each choice’s feedback are included. Edit the teaching source in resources/training/dsm-from-zero.html, then regenerate this copy.',''];
let last=0,s=0,m=0,o=0;
for(let i=0;i<questions.length;i++){
  const x=questions[i],l=lessons.filter(l=>l.start<x.index).at(-1);
  assert.ok(l,'question within lesson: '+(i+1));
  if(l.n!==last){lines.push('## Lesson '+l.n+': '+l.title,'');last=l.n;}
  const options=[...x[3].matchAll(/<button type="button" data-answer="(yes|no)" data-feedback="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g)];
  const yes=options.filter(a=>a[1]==='yes').length;
  assert.ok(options.length===3||options.length===4,'choice count Q'+(i+1));
  if(x[1]){m++;assert.ok(yes>=2&&yes<options.length,'multi-answer Q'+(i+1));}
  else{s++;assert.equal(yes,1,'single-answer Q'+(i+1));}
  o+=options.length;
  lines.push('### '+(i+1)+'. '+decode(x[2]),'');
  options.forEach((a,j)=>{
    lines.push('- **'+String.fromCharCode(65+j)+'.** '+decode(a[3])+(a[1]==='yes'?' **✓ Correct**':''));
    lines.push('  - Feedback: '+decode(a[2]));
  });
  lines.push('');
}
assert.equal(s,72);assert.equal(m,8);assert.equal(o,249);
const output=lines.join('\n').trimEnd()+'\n';
if(process.argv.includes('--write')){
  fs.writeFileSync(path,output,'utf8');
  console.log('Updated editorial question bank from current course source.');
}else{
  assert.equal(fs.readFileSync(path,'utf8'),output,'Question-bank drift detected. Regenerate using --write.');
  console.log('PASS: all 80 question stems, 249 options, correct keys, option feedback and lesson titles match the course.');
}
