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
 assert.equal((h.match(/class="cpl-static-nav__mobile"/g)||[]).length,1,'one mobile compact strip: '+p);
 assert.equal((h.match(/class="cpl-static-nav__more"/g)||[]).length,1,'one native more disclosure: '+p);
 assert.match(h,/<details class="cpl-static-nav__more"><summary>/,'JS-free disclosure: '+p);
 assert.ok(h.includes('cpl-static-nav__menu'),'full navigation remains reachable: '+p);
}
const spanish=fs.readFileSync('resources/es/empiece-aqui.html','utf8');
assert.ok(spanish.includes('aria-label="Secciones de la Biblioteca de Práctica Clínica"'));
const css=fs.readFileSync('resources/site-navigation.css','utf8');
assert.match(css,/min-height:44px/);
assert.match(css,/overflow-x:auto/);
assert.match(css,/max-width:600px/);
assert.match(css,/cpl-static-nav__quick--1/);
assert.match(css,/data-replaces-header="true"/);
assert.match(css,/cpl-static-nav__menu/);
assert.ok(!css.includes('position:fixed'),'navigation must not float/stick');
assert.match(css,/@media print/);
const legacy=fs.readFileSync('legacy/index.html','utf8');
assert.ok(!legacy.includes('cpl-static-nav'),'retained legacy remains unchanged');
cp.execFileSync('python',['scripts/site-navigation.py','--check'],{stdio:'inherit'});
assert.ok(spanish.includes('cpl-static-nav__quick--0" href="/resources/clinical-resource-finder.html">Buscar</a>'));
assert.ok(spanish.includes('<summary>Más '));
const home=fs.readFileSync('index.html','utf8');
assert.ok(home.includes('data-replaces-header="true"'),'hide duplicate homepage header only on mobile');
const topic=fs.readFileSync('resources/clinical-topics/index.html','utf8');
assert.ok(topic.includes('data-replaces-header="true"'));
const printPage=fs.readFileSync('resources/handouts/my-grief-map.html','utf8');
assert.ok(!printPage.includes('data-replaces-header="true"'),'retain page-specific print controls');
console.log('PASS compact mobile CPL nav across '+targets.length+' pages; native More, translated links, redundant-header suppression, desktop and print preserved');
