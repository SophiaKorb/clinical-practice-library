'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../resources/therapy/dsm-structure-4d.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(script,'Symptom-space JS must be present');
new vm.Script(script[1]);
class Element{
 constructor(id){this.id=id;this.children=[];this.dataset={};this.attrs={};this.style={};this.value='';this.innerHTML='';this.textContent='';this.events={};this.className='';this.type='';this.disabled=false;this.onclick=null;this.oninput=null;this.onchange=null;this.classList={toggle(){}};}
 addEventListener(type,cb){this.events[type]=cb;}
 setAttribute(key,value){this.attrs[key]=value;}
 replaceChildren(...parts){this.children=parts;}
 append(...parts){this.children.push(...parts);}
 appendChild(part){this.children.push(part);}
 getBoundingClientRect(){return {width:850,height:440,left:0,top:0};}
 setPointerCapture(){}
 get options(){return this.children.filter(p=>p instanceof Element);}
}
const ids=[...new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]))];
const elements=Object.fromEntries(ids.map(id=>[id,new Element(id)]));
const canvas={createRadialGradient(){return {addColorStop(){}};},save(){},restore(){},closePath(){},clearRect(){},fillRect(){},beginPath(){},arc(){},fill(){},stroke(){},moveTo(){},lineTo(){},fillText(){},setTransform(){}};
elements.scene.getContext=()=>canvas;
const document={
 getElementById:id=>elements[id],
 querySelectorAll:selector=>selector==='#disorders button'?elements.disorders.children:[],
 createElement:tag=>new Element(tag),
 createTextNode:text=>({textContent:text})
};
const computed=vm.runInNewContext(script[1]+'\n;({D,F,mat,coords,eigen,nearest,cosine,projectCase,terrainMesh,componentLabels})',{document,window:{devicePixelRatio:1,addEventListener(){}}});
const el=id=>elements[id];
assert.equal(computed.D.length,38,'38 example disorders');
assert.equal(computed.F.length,24,'24 distinct symptom dimensions');
assert.equal(computed.coords.length,38,'All disorder profiles have coordinates');
assert(computed.coords.every(v=>v.length===3&&v.every(Number.isFinite)),'All PCA coordinates finite');
assert(computed.eigen.every(x=>x>0),'Three nonzero principal components');
assert.notDeepEqual(computed.coords[0],computed.coords[1],'Symptom profiles have different positions');
assert.equal(el('disorders').children.length,38,'All profiles render');
assert.equal(el('axis-loadings').children.length,3,'Explain all three mathematical principal components');
assert.equal(el('neighbors').children[0].children.length,3,'Nearest example cards explain shared symptom basis');
for(const setting of ['tight','balanced','wide']){
 const geometry=computed.terrainMesh(setting);
 assert(geometry.outer>500&&geometry.inner>250,'Data-derived volumetric shells have both surfaces: '+setting);
 assert(geometry.mesh.every(t=>[...t.a,...t.b,...t.c].every(Number.isFinite)),'No NaN or infinite shell positions: '+setting);
 assert(geometry.mesh.length<8500,'Geometry bounded for touch devices: '+setting);
 assert(geometry.mesh.every(t=>[...t.a,...t.b,...t.c].every(v=>Math.abs(v)<399.9)),'3D neighborhood shells are closed inside calculation bounds: '+setting);
}
el('surface').onclick();
assert.equal(el('surface').attrs['aria-pressed'],'false','Show/hide shape control works');
el('surface').onclick();
assert.equal(el('surface').attrs['aria-pressed'],'true','Restore shape control works');
el('smoothness').value='wide';
el('smoothness').onchange({target:el('smoothness')});
assert.equal(el('smoothness').value,'wide','Terrain smoothing control works');
assert.equal(el('diagnosis-title').textContent,'Generalized anxiety disorder','Initial selection loads');

el('search').value='sleep';el('search').events.input({target:el('search')});
assert(el('disorders').children.length>0&&el('disorders').children.length<38,'Search narrows list');
el('search').value='';el('search').events.input({target:el('search')});
el('disorders').children[4].onclick();
assert.equal(el('diagnosis-title').textContent,'Separation anxiety disorder','Selecting a profile works');
el('compare').onclick();
assert.match(el('compare').textContent,/Pinned/,'Comparison pinned');
el('disorders').children[5].onclick();
assert(el('comparison').children.length>=4,'Shared and distinguishing symptom comparison generated');
el('clear-compare').onclick();
assert.equal(el('clear-compare').disabled,true,'Clear comparison works');

el('impact').value='4';el('impact').events.input({target:el('impact')});
assert.equal(el('impact-label').textContent,'Extensive interference','Severity fourth dimension changes functional impact label');
el('preset').value='mood';el('preset').onchange();
assert.equal(el('case-features').children.length,4,'Vignette selects its own symptoms');
const first=el('case-neighbors').children[0].children[0].textContent;
el('preset').value='activation';el('preset').onchange();
assert.notEqual(el('case-neighbors').children[0].children[0].textContent,first,'Different symptoms change nearby example profiles');
el('add').onclick();
assert.equal(el('case-features').children.length,5,'Add symptom to case works');

el('mode').onclick();
assert.equal(el('mode').attrs['aria-pressed'],'true','2D accessible alternative toggles');
el('left').onclick();el('right').onclick();el('up').onclick();el('down').onclick();
el('reset').onclick();
assert.equal(el('mode').attrs['aria-pressed'],'false','Camera reset restores 3D');
el('scene').events.keydown({key:'ArrowLeft',preventDefault(){}});
el('scene').events.pointerdown({clientX:0,clientY:0,pointerId:1});
el('scene').events.pointermove({clientX:20,clientY:10});
el('scene').events.pointerup({clientX:20,clientY:10});
console.log('PASS: symptom-space PCA, data-derived 3D envelope, sensitivity controls, case impact, comparison, search, navigation and accessibility alternatives.');
