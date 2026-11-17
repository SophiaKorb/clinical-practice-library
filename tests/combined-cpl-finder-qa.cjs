'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const raw=read('resources/clinical-finder-data.js');
const data=JSON.parse(raw.replace(/^globalThis\.CPLFinderData\s*=\s*/,'').replace(/;\s*$/,''));
const finder=require('../resources/clinical-finder.js');
const adultAdhdPrefix='/resources/diagnoses/adult-adhd-collection/';
const adultAdhdAdded=data.resources.filter(r=>r.url.startsWith(adultAdhdPrefix));
assert.equal(data.resources.length,623,'Existing 615 records plus eight adult ADHD collection entries');
assert.equal(adultAdhdAdded.length,8,'Adult ADHD expansion must index all eight distinct collection resources');
assert.equal(data.resources.length-adultAdhdAdded.length,615,'Preserve the original 615-entry library');
for(const r of adultAdhdAdded){
 assert(r.tags.diagnosis.includes('ADHD'),'Adult ADHD index diagnosis: '+r.url);
 assert(r.tags.stage.includes('Adult'),'Adult ADHD age facet: '+r.url);
 assert(r.tags.role.length>0&&r.tags.task.length>0,'Adult ADHD audience and task facets: '+r.url);
}
assert.equal(new Set(data.resources.map(r=>r.url)).size,data.resources.length,'No duplicate resource URLs');
let linksChecked=0,anchorsChecked=0,facetsChecked=0;
for(const r of data.resources){
 assert(r.url.startsWith('/'),'Resource URL must be local: '+r.url);
 const url=new URL(r.url,'https://cpl.invalid');
 let p=url.pathname.replace(/^\/+/, '');
 if(!fs.existsSync(path.join(root,p))){
  if(fs.existsSync(path.join(root,p+'.html')))p+='.html';
  else if(fs.existsSync(path.join(root,p,'index.html')))p=path.join(p,'index.html');
  else assert.fail('Missing resource destination: '+r.url);
 }
 linksChecked++;
 if(url.hash){
  const id=decodeURIComponent(url.hash.slice(1));
  assert(read(p).includes('id="'+id+'"'),'Missing anchor '+r.url);
  anchorsChecked++;
 }
 for(const [facet,values] of Object.entries(r.tags)){
  assert(Array.isArray(data.facets[facet]),'Unknown facet '+facet);
  for(const value of values){assert(data.facets[facet].includes(value),'Invalid '+facet+'='+value+' in '+r.url);facetsChecked++;}
 }
}
const roles=['Client / caregiver','School team','Staff / case manager','Graduate trainee','Clinician'];
const ages=['children','teens','adults'];
const matrix=[];
for(const age of ages){
 for(const role of roles){
  const found=finder.search(data.resources,{q:'',role}).filter(r=>finder.matchesAge(r,age));
  assert(found.length>0,age+' × '+role+' must have a result');
  matrix.push({age,role,count:found.length});
 }
}
const phraseCounts={};
for(const q of ['LGBTQ','child','autism','caregiver','school','case manager','early childhood','transgender']){
 phraseCounts[q]=finder.search(data.resources,{q}).length;
 assert(phraseCounts[q]>0,'No matches for '+q);
}
const explicit=[
 ['/resources/community/index.html#eon',13],
 ['/resources/community/online-lgbtq-resources.html#trevor-space',13],
 ['/resources/community/index.html#youth-guide',14]
];
for(const[url,minAge]of explicit){
 const r=data.resources.find(x=>x.url===url);assert(r,'Missing '+url);
 assert.equal(r.minimumAge,minAge,'Minimum age provenance missing '+url);
 assert(!finder.matchesAge(r,'children'),'Teen-only program appears for children: '+url);
 assert(finder.matchesAge(r,'teens'),'Teen-only program missing for teens: '+url);
}
for(const slug of ['affirming-clinical-conversation','caregiver-support-lgbtq-youth','youth-school-community-access']){
 const r=data.resources.find(x=>x.url==='/resources/community/'+slug+'.html');assert(r,'Missing practice guide '+slug);
 assert.deepEqual(r.tags.diagnosis,[],'LGBTQ+ identity must not be assigned diagnostic metadata');
}
assert(read('.github/workflows/site-qa.yml').includes('tests/finder-card-readability.cjs'),'Missing PR40 regression in workflow');
assert(read('.github/workflows/site-qa.yml').includes('tests/affirming-practice-content.cjs'),'Missing PR41 regression in workflow');
assert(read('index.html').includes('<details class="cpl-disclosure"><summary>Independence &amp; disclaimer</summary>'),'Caret disclaimer must survive');
assert(!read('index.html').includes('class="boundary">These resources support clinical thinking'),'Redundant homepage disclaimer must not return');
console.log(JSON.stringify({result:'PASS',resources:linksChecked,anchors:anchorsChecked,facetValues:facetsChecked,ageRoleMatrix:matrix,queryCounts:phraseCounts},null,2));
