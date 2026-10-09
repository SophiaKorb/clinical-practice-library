'use strict';
const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm'), assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../resources/therapy/dsm-structure-4d.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/);
assert(script,'A JS application script exists');
new vm.Script(script[1]);
class Elem {
 constructor(id){this.id=id;this.children=[];this.value='';this.style={};this.dataset={};this.attrs={};this.textContent='';this.innerHTML='';this.events={};this.classList={toggle(){}};}
 addEventListener(event,fn){this.events[event]=fn;}
 setAttribute(k,v){this.attrs[k]=v;}
 append(...nodes){this.children.push(...nodes);}
 appendChild(node){this.children.push(node);}
 replaceChildren(...nodes){this.children=nodes;}
 getBoundingClientRect(){return {width:900,height:520,left:0,top:0};}
 setPointerCapture(){}
}
const elements=Object.fromEntries([...new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]))].map(id=>[id,new Elem(id)]));
const hubs=[...html.matchAll(/<button data-hub="([^"]+)"/g)].map(m=>{const e=new Elem('hub');e.dataset.hub=m[1];return e;});
const spans=Array.from({length:5},()=>new Elem('stage'));
const canvas2D={createRadialGradient:()=>({addColorStop(){}}),clearRect(){},fillRect(){},beginPath(){},arc(){},fill(){},stroke(){},moveTo(){},lineTo(){},fillText(){},setTransform(){}};
elements.scene.getContext=()=>canvas2D;
const document={
 getElementById:id=>elements[id],
 querySelectorAll:s=>s==='[data-hub]'?hubs:s==='#stage-labels span'?spans:s==='#chapters button'?elements.chapters.children:[],
 createElement:tag=>new Elem(tag),
 createTextNode:text=>({textContent:text})
};
vm.runInNewContext(script[1],{document,window:{devicePixelRatio:1,addEventListener(){}}});
assert.equal(elements.chapters.children.length,22,'All official Section II chapter areas render');
assert.equal(elements['selected-title'].textContent,'Anxiety Disorders','Default selected chapter is loaded');
elements['age-stage'].value='4';
elements['age-stage'].events.input({target:elements['age-stage']});
assert.equal(elements['stage-name'].textContent,'Later life','Life-course slider updates');
hubs[2].events.click();
assert.match(elements['selected-title'].textContent,/Section III/,'Manual section hub navigates');
elements['chapter-search'].value='sleep';
elements['chapter-search'].events.input();
assert.equal(elements.chapters.children.length,1,'Search targets relevant chapter info only');
elements.chapters.children[0].events.click();
assert.equal(elements['selected-title'].textContent,'Sleep-Wake Disorders','Filtered choice works');
elements.next.events.click();
assert.equal(elements['selected-title'].textContent,'Sexual Dysfunctions','Chapter next button works');
elements['chapter-search'].value='';
elements['chapter-search'].events.input();
assert.equal(elements.chapters.children.length,22,'Search clear restores full taxonomy');
elements['rotate-left'].onclick();
elements['tilt-up'].onclick();
elements.zoom.value='125';
elements.zoom.events.input({target:elements.zoom});
elements.scene.events.keydown({key:'ArrowLeft',preventDefault(){}});
elements.scene.events.pointerdown({clientX:0,clientY:0,pointerId:1});
elements.scene.events.pointermove({clientX:18,clientY:10});
elements.scene.events.pointerup({clientX:18,clientY:10});
console.log('PASS: 3D DSM structure map and life-stage interactions initialized and responded.');
