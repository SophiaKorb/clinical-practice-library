'use strict';
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const get=p=>fs.readFileSync(path.join(root,p),'utf8');
const slugs=['index','development-and-screening','communication-and-regulation','relationships-and-trauma','early-intervention-and-preschool','tucson-pima-local-resources'];
const pages=slugs.map(slug=>({slug,path:'resources/birth-to-five/'+slug+'.html',html:get('resources/birth-to-five/'+slug+'.html')}));
const links=html=>[...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(m=>m[1]);
const allowedHosts=['cdc.gov','asha.org','zerotothree.org','developingchild.harvard.edu','ectacenter.org','nctsn.org','pcit.org','healthychildren.org','sites.ed.gov','des.az.gov','azed.gov','tusd1.org','amphi.com','maranausd.org','firstthingsfirst.org','unitedwaytucson.org','casadelosninos.org','childfamilyresources.org','parentaid.org','childparentcenters.org','makewayforbooks.org'];
let external=0,internal=0;
for(const p of pages){
 assert.match(p.html,/<h1>/,'Missing first-level heading: '+p.path);
 assert.match(p.html,/<main[^>]*id="content"/,'Missing skip destination: '+p.path);
 assert.match(p.html,/href="#content"/,'Missing skip link: '+p.path);
 assert.match(p.html,/Curated by Sophia Korb Cohon, PhD/,'Byline missing: '+p.path);
 assert.match(p.html,/Sources checked November 2026/,'Source-check metadata missing: '+p.path);
 const anchors=links(p.html);
 assert(anchors.length>=6,'Underlinked: '+p.path);
 for(const href of anchors){
  if(href.startsWith('/')){
   const local=href.split(/[?#]/)[0];const relative=local.slice(1);
   assert(fs.existsSync(path.join(root,relative)),p.path+' broken local link: '+href);internal++;
  }else if(href.startsWith('https://')){
   const host=new URL(href).hostname.replace(/^www\./,'');
   assert(allowedHosts.some(allowed=>host===allowed||host.endsWith('.'+allowed)),'Unexpected external source domain: '+href);external++;
  }else if(!href.startsWith('#'))assert.fail('Unsupported link: '+p.path+' '+href);
 }
}
assert(external>=42,'Expected curated official-source links plus 14 Tucson providers');
const hub=pages[0].html;
for(const slug of slugs.slice(1)){
 assert(links(hub).includes('/resources/birth-to-five/'+slug+'.html'),'Hub has no direct link to '+slug);
 assert(links(pages.find(x=>x.slug===slug).html).includes('/resources/birth-to-five/index.html'),'Topic has no home route: '+slug);
}
for(const p of ['index.html','library.html','resources/index.html','resources/complete-resource-inventory.html','resources/therapy/early-childhood-regulation-communication.html','resources/therapy/child-adolescent-parenting-family-start-here.html','resources/clinical-resource-finder.html']){
 assert(links(get(p)).includes('/resources/birth-to-five/index.html'),p+' does not link Birth–5');
}
for(const slug of slugs)assert(links(get('resources/complete-resource-inventory.html')).includes('/resources/birth-to-five/'+slug+'.html'),'Missing complete inventory '+slug);
globalThis.CPLFinderData=undefined;
require('../resources/clinical-finder-data.js');
const {resources,facets}=globalThis.CPLFinderData;
const {matchesAge,ageFor,search,decode}=require('../resources/clinical-finder.js');
for(const slug of slugs){
 const url='/resources/birth-to-five/'+slug+'.html';
 const hits=resources.filter(r=>r.url===url);
 assert.equal(hits.length,1,'Expected one finder entry for '+url);
 const r=hits[0];assert(r.tags.stage.includes('Early childhood'),'Missing early childhood population: '+slug);
 assert(matchesAge(r,'birth5'),'Birth–5 filter missing: '+slug);
 assert(matchesAge(r,'children'),'Children filter missing: '+slug);
 assert.equal(ageFor(r),'','Professional and family resource should not receive child-facing-only badge');
}
for(const role of ['Clinician','Staff / case manager','School team','Client / caregiver']){
 const state=decode(new URLSearchParams({role}),facets);
 const found=search(resources,state).filter(r=>matchesAge(r,'birth5'));
 assert(found.some(r=>r.url==='/resources/birth-to-five/index.html'),'Age and role search fail for '+role);
}
const UI=get('resources/clinical-resource-finder.html');
assert(UI.includes('value="birth5"'),'Missing Birth–5 filter option');
assert(get('resources/clinical-finder.js').includes("if(age==='birth5')"),'Missing filter implementation');
const local='resources/birth-to-five/tucson-pima-local-resources.html';
const tucson=get(local);
const localLinks=links(tucson);
const programPaths=[
'https://des.az.gov/azeip',
'https://www.tusd1.org/preschool-child-find',
'https://www.amphi.com/child-find-home',
'https://www.maranausd.org/parent-tools/district-handbook/district-handbook-details/~board/district-handbook/post/child-find',
'https://unitedwaytucson.org/education/family-resource-center/',
'https://casadelosninos.org/programs-and-resources/parents-as-teachers/',
'https://casadelosninos.org/programs-and-resources/behavioral-health-services/',
'https://parentaid.org/what-we-do/parent-partners/',
'https://childparentcenters.org/',
'https://makewayforbooks.org/birth-to-five-literacy-journey/'
];
for(const url of programPaths)assert(localLinks.includes(url),'Missing official Tucson program route '+url);
assert((tucson.match(/class="b5-local-source"/g)||[]).length===14,'Tucson directory must contain 14 grounded entries');
for(const phrase of ['Tucson Unified','Amphitheater','Marana Unified','AzEIP','ZIP code','(520) 232-7034','(520) 682-4815','(888) 592-0140','Under 3','Ages 3–5']){
assert(tucson.includes(phrase),'Missing age/district/referral language '+phrase);}
for(const p of ['index.html','resources/complete-resource-inventory.html','resources/birth-to-five/index.html','resources/birth-to-five/early-intervention-and-preschool.html','resources/birth-to-five/relationships-and-trauma.html']){
assert(links(get(p)).includes('/'+local),'Tucson directory missing navigation from '+p);}
const localRecord=resources.find(r=>r.url==='/'+local);
assert(localRecord,'Missing Tucson indexed record');
for(const role of ['Clinician','Staff / case manager','School team','Client / caregiver','Graduate trainee']){
 const state=decode(new URLSearchParams({role}),facets);
 assert(search(resources,state).filter(r=>matchesAge(r,'birth5')).some(r=>r.url==='/'+local),'Tucson role/age search missing '+role);
}
assert(matchesAge(localRecord,'children'),'Tucson directory must appear in Children search');
assert.equal(ageFor(localRecord),'','Provider directory must not claim to be a child-facing handout');

assert(!get('index.html').includes('href="/resources/therapy/treatment-plan-menu.html"'),'Unapproved treatment planning menu must stay unpromoted');
console.log('Birth–5 QA passed: 5 indexed guides, '+external+' verified-domain source links, '+internal+' local navigation links, audience filters, full inventory and homepage discovery.');
