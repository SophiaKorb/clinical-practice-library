const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
function pages(dir){
 return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>{
  if(d.name==='legacy'||d.name==='.git'||d.name==='node_modules')return [];
  const p=path.join(dir,d.name);
  return d.isDirectory()?pages(p):d.name.endsWith('.html')?[p]:[];
 });
}
const targets=pages('.');
assert.ok(targets.length>400,'expected broad current CPL coverage');
for(const p of targets){
 const h=fs.readFileSync(p,'utf8');
 assert.equal((h.match(/<nav class="cpl-static-nav"/g)||[]).length,1,'one persistent panel: '+p);
 assert.equal((h.match(/href="\/resources\/site-navigation.css"/g)||[]).length,1,'shared nav styling: '+p);
 const mainAt=h.search(/<main\b/i);
 if(mainAt!==-1)assert.ok(h.indexOf('<nav class="cpl-static-nav"')<mainAt,'navigation precedes main: '+p);
 assert.ok(h.includes('href="/resources/clinical-resource-finder.html"'),'finder access: '+p);
 assert.ok(h.includes('href="/resources/therapy/visual-reasoning-toolkit.html"'),'visual tools access: '+p);
}
const spanish=fs.readFileSync('resources/es/empiece-aqui.html','utf8');
assert.ok(spanish.includes('aria-label="Secciones de la Biblioteca de Práctica Clínica"'));
const css=fs.readFileSync('resources/site-navigation.css','utf8');
assert.match(css,/min-height:44px/);
assert.match(css,/overflow-x:auto/);
assert.match(css,/@media print/);
const legacy=fs.readFileSync('legacy/index.html','utf8');
assert.ok(!legacy.includes('cpl-static-nav'),'retained legacy remains unchanged');
cp.execFileSync('python',['scripts/site-navigation.py','--check'],{stdio:'inherit'});
console.log('PASS static CPL top navigation on '+targets.length+' current pages; mobile horizontal scroll, Spanish links, print suppression, retained legacy');
