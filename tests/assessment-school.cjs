const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const cases=JSON.parse(fs.readFileSync('data/integrated-assessment-cases.json','utf8'));
assert.equal(cases.length,3);assert.equal(new Set(cases.map(c=>c.id)).size,3);
const buttons=cases.map(c=>({dataset:{case:c.id},textContent:c.title,attrs:{},handlers:{},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,f){this.handlers[k]=f}}));
const panels=cases.map((c,i)=>({id:'case-'+c.id,hidden:i!==0}));const status={textContent:''};
const source=fs.readFileSync('resources/assessment/integrated-development-language-learning-casebook.html','utf8');
const script=source.match(/<script>([\s\S]*?)<\/script>/)[1];const document={querySelectorAll:s=>s==='[data-case]'?buttons:panels,getElementById:()=>status};const context={document};vm.runInNewContext(script,context);
for(const button of buttons){button.handlers.click();assert.equal(panels.filter(p=>!p.hidden).length,1);assert.equal(panels.find(p=>!p.hidden).id,'case-'+button.dataset.case);assert.equal(button.attrs['aria-pressed'],'true');assert.match(status.textContent,/Showing/);}
context.selectCase('unknown');assert.equal(panels.filter(p=>!p.hidden).length,1);
for(const c of cases){assert.equal(c.hypotheses.length,4);assert.ok(c.measure&&c.support&&c.boundary&&c.supervision);assert.match(source,new RegExp('heading-'+c.id));}
const selector={value:'reading',handlers:{},addEventListener(k,f){this.handlers[k]=f}},explanation={textContent:''};const school=fs.readFileSync('resources/school/learning-and-access-two-track-plan.html','utf8');vm.runInNewContext(school.match(/<script>([\s\S]*?)<\/script>/)[1],{document:{getElementById:id=>id==='support-purpose'?selector:explanation}});
for(const value of ['reading','math','writing','steps']){selector.value=value;selector.handlers.change();assert.ok(explanation.textContent.length>120);}
assert.match(school,/standardized assessments/);assert.match(school,/diagnosis, school eligibility/);
console.log('PASS three assessment cases, exclusive selection and state, four hypotheses each, four purpose-dependent support examples, and interpretation boundaries.');
