const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const api=require('../resources/clinical-finder.js');const data=JSON.parse(fs.readFileSync('data/clinical-finder.json','utf8'));const resources=data.resources;
assert.equal(Object.keys(data.facets).length,8);assert.ok(resources.length>=280);assert.ok(resources.every(r=>!r.url.startsWith('/legacy/')&&!r.url.startsWith('/preview/')));assert.equal(new Set(resources.map(r=>r.url)).size,resources.length);
assert.ok(api.search(resources,{q:''})[0].url.endsWith('visual-reasoning-toolkit.html'));
for(const scenario of [
 [{q:'cannot start',role:'School team',diagnosis:'ADHD'},'/resources/school/clinical/adhd.html'],
 [{q:'aphasia',role:'Client / caregiver'},'/resources/therapy/communication-supports-toolkit.html'],
 [{q:'OCD',role:'Clinician',intervention:'Exposure / ERP'},'/resources/therapy/ocd-and-uncertainty-clinician-companion.html'],
 [{q:'risk',role:'Staff / case manager'},'/resources/training/workforce-learning-center.html'],
 [{q:'',step:'What to watch next?'},'/resources/therapy/functional-progress-review.html']
]) assert.ok(api.search(resources,scenario[0]).some(r=>r.url===scenario[1]),JSON.stringify(scenario));
assert.ok(api.search(resources,{q:'anxiety clinician'}).length>0,'multiword intersection');assert.equal(api.search(resources,{q:'zz-no-match-zz'}).length,0);
const clinicianQueries=[
 ['biting','/resources/clinical-depth/child-caregiver-treatment-selection.html'],
 ['parent coaching','/resources/clinical-depth/child-caregiver-treatment-selection.html'],
 ['withdrawal','/resources/clinical-depth/substance-use-cooccurring-care.html'],
 ['opioid PTSD','/resources/clinical-depth/substance-use-cooccurring-care.html'],
 ['mania','/resources/clinical-depth/psychosis-bipolar-longitudinal-care.html'],
 ['amnesia','/resources/clinical-depth/complex-dissociation-functional-care.html'],
 ['aphasia','/resources/clinical-depth/neuropsych-evaluation-access-validity.html']
];
for(const [q,url] of clinicianQueries)assert.ok(api.search(resources,{q}).some(r=>r.url===url),'find clinical depth: '+q);
assert.ok(resources.filter(r=>r.url.startsWith('/resources/clinical-depth/')).every(r=>!r.searchTerms||Array.isArray(r.searchTerms)));
const invalid=api.decode(new URLSearchParams('role=unauthorized&step=bad&q=%3Cscript%3E'),data.facets);assert.equal(invalid.role,'');assert.equal(invalid.step,'');assert.equal(invalid.q,'<script>');
for(const r of resources.slice(0,30)){const rec=api.related(r,resources);assert.ok(rec.length<=3);assert.ok(rec.every(t=>t.url!==r.url));}
for(const route of Object.values(api.routes))for(const [url] of route.links)assert.ok(fs.existsSync('.'+url),url);
class Element{constructor(){this.dataset={};this.children=[];this.value='';this.hidden=false;this.textContent='';this.attrs={};this.handlers={};}addEventListener(e,f){this.handlers[e]=f;}setAttribute(k,v){this.attrs[k]=v;}append(...c){this.children.push(...c);}appendChild(c){this.children.push(c);}replaceChildren(){this.children=[];}fire(e='click'){this.handlers[e]?.();}}
const ids=['facet-controls','pathway-guide','finder-query','finder-results','finder-status','finder-empty','finder-more','finder-reset'];const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));const buttons=Object.keys(api.routes).map(step=>{const e=new Element();e.dataset.step=step;return e;});const events={};let url='';const location={pathname:'/resources/clinical-resource-finder.html',search:'?role=bogus',hash:''};
vm.runInNewContext(fs.readFileSync('resources/clinical-finder.js','utf8'),{globalThis:{CPLFinderData:data},URLSearchParams,location,history:{replaceState(_,__,u){url=u;}},addEventListener:(e,f)=>events[e]=f,document:{getElementById:id=>elements[id],querySelectorAll:()=>buttons,createElement:()=>new Element()}});
assert.equal(elements['facet-controls'].children.length,8);assert.equal(elements['finder-results'].children.length,24);elements['finder-more'].fire();assert.equal(elements['finder-results'].children.length,48);
for(const b of buttons){b.fire();assert.equal(buttons.filter(x=>x.attrs['aria-pressed']==='true').length,1);assert.ok(elements['pathway-guide'].children.length>=3);assert.ok(url.includes('step='));b.fire();assert.equal(buttons.filter(x=>x.attrs['aria-pressed']==='true').length,0);}
elements['finder-query'].value='zz-no-match-zz';elements['finder-query'].fire('input');assert.equal(elements['finder-results'].children.length,0);assert.equal(elements['finder-empty'].hidden,false);elements['finder-reset'].fire();assert.equal(elements['finder-empty'].hidden,true);assert.equal(elements['finder-results'].children.length,24);
const select=elements['facet-controls'].children.find(w=>w.children[1].id==='facet-role').children[1];select.value='Staff / case manager';select.fire('change');assert.ok(url.includes('role='));assert.ok(elements['finder-results'].children.length>0);
location.search='?q=aphasia&role=Client+%2F+caregiver';events.popstate();assert.equal(elements['finder-query'].value,'aphasia');assert.ok(elements['finder-results'].children.length>0);
const css=fs.readFileSync('resources/practice-learning.css','utf8');assert.match(css,/@media print\{\.scale button,\.visual \.choices button\{display:flex!important/,'print must retain board tiles');
console.log('PASS 8 facets; 5 realistic resource-finding scenarios; multiword/synonym search, related links, invalid URL filters, pagination, empty/reset, all 5 pathway toggles, share URL and popstate; print visual preservation.');

// Check the declared high-use text and focus colors against WCAG contrast thresholds.
function luminance(hex){const c=hex.match(/[a-f0-9]{2}/gi).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];}
function ratio(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
for(const [a,b] of [['203b35','ffffff'],['205d50','f7f5ee'],['ffffff','245e50'],['45594f','ffffff']])assert.ok(ratio(a,b)>=4.5,a+' / '+b);
assert.ok(ratio('1f4881','ffffff')>=3);
