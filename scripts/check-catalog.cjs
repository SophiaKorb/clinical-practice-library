// Regression checks for public catalog links and async clipboard handling.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
for(const file of ['app.js','tools/app.js','legacy/app.js','legacy/tools/app.js']){
 const source=fs.readFileSync(file,'utf8');const context=vm.createContext({});
 vm.runInContext(source.replace(/init\(\);\s*$/,''),context);
 let opened=0,rendered=0,focused=0,scrolled=0,cleared=0;
 context.location={hash:'#later-resource'};
 context.document={getElementById:id=>{assert.equal(id,'later-resource');return{scrollIntoView(){scrolled++},focus(){focused++}}}};
 Object.assign(context,{clearAll(){cleared++},render(){rendered++},openCatalog(){opened++}});
 vm.runInContext('allResources=[{id:"later-resource"}];openResourceFromHash()',context);
 assert.equal(opened,1);assert.equal(rendered,1);assert.equal(cleared,1);assert.equal(scrolled,1);assert.equal(focused,1);
 for(const hash of ['#section','#%E0%A4%A']){context.location.hash=hash;vm.runInContext('openResourceFromHash()',context)}
 assert.equal(opened,1,'unrelated and malformed hashes must be ignored');
 const csv=vm.runInContext('csv([{id:"one",title:\'A, "quoted" title\',pageUrl:"resources/example.html"}])',context);
 assert(csv.includes('pageUrl'));assert(csv.includes('resources/example.html'));assert(csv.includes('"A, ""quoted"" title"'));
 const handler=source.match(/addEventListener\("click",async e=>(\{const button=e.currentTarget;.*?\})\);/)[1];
 const button={textContent:'Copy link'},event={currentTarget:button};let timer,copied;
 const ctx=vm.createContext({e:event,r:{id:'later-resource'},location:{href:'https://example.test/tools#old'},navigator:{clipboard:{writeText:async text=>{copied=text;event.currentTarget=null}}},setTimeout:f=>timer=f});
 await vm.runInContext('(async e=>'+handler+')(e)',ctx);
 assert.equal(button.textContent,'Copied');assert.equal(copied,'https://example.test/tools#later-resource');timer();assert.equal(button.textContent,'Copy link');
}
for(const prefix of ['', 'legacy/']){
 const resources=JSON.parse(fs.readFileSync(prefix+'data/library.json')).resources;
 for(const r of resources){for(const link of r.resourceLinks||[]){assert(fs.existsSync(prefix+link.url),link.url);assert(link.label)}}
 assert.equal(resources.filter(r=>r.resourceLinks?.length).length,19);
}
console.log('PASS: four catalog scripts; clipboard timing; valid/malformed deep links; CSV links/escaping; 19 published resource collections in both catalogs.');
})().catch(e=>{console.error(e);process.exitCode=1});
