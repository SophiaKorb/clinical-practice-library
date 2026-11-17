'use strict';
// Canonical finder production-release guards: never imply clinical validation from discovery metadata.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const blobSha=s=>crypto.createHash('sha1').update('blob '+Buffer.byteLength(s)+'\0'+s).digest('hex');
const originalFinder=read('resources/clinical-resource-finder-classic.html');
assert.equal(blobSha(originalFinder),'22667416bd741b709eb1ee47905aa60ba066bfb6','Original finder HTML must be byte-exact');
assert.equal(blobSha(read('resources/clinical-finder.js')),'9e99f42d783625953e0e46cba9a4aa8cb16329c5','Original matcher must remain unchanged');
assert.equal(blobSha(read('resources/clinical-finder-data.js')),'93105c462d65d0b7766cc84564264ed345379fb7','Published 615 records must remain unchanged');
const html=read('resources/clinical-resource-finder.html');
const ui=read('resources/finder-live-ui.js');
const engine=require('../resources/finder-lab-engine.js');
assert(html.includes('/resources/finder-live-ui.js'),'Canonical finder missing new controller');
assert(html.includes('/resources/finder-lab-engine.js'),'Canonical finder missing relevance engine');
assert(!html.includes('noindex,nofollow'),'Production finder must not be hidden from search engines');
assert(!html.includes('Nonproduction UX study'),'Production route still marked as a review candidate');
assert(!html.includes('Review candidate only'),'Production footer retains review-only text');
assert(html.includes('href="/resources/clinical-resource-finder-classic.html"'),'Classic finder not linked');
assert(html.includes('href="/resources/birth-to-five/index.html"'),'Birth–5 collection direct link removed');
assert(originalFinder.includes('id="finder-query"'),'Original classic search functionality missing');
assert(originalFinder.includes('id="age-audience"'),'Original classic age filter missing');
assert(read('resources/finder-lab.html').includes('noindex,nofollow'),'Separate laboratory must remain unindexed');
assert(!read('index.html').includes('href="/resources/finder-lab.html"'),'Review lab promoted to main navigation');
for(const key of ['population','need','audience'])assert(html.includes('id="lab-'+key+'"'),'Required search dimension missing '+key);
for(const key of ['diagnosis','symptom','function','intervention','stage','task','step'])assert(html.includes('id="lab-'+key+'"'),'Historic clinical facet unavailable '+key);
for(const phrase of ["p.get('age')","p.get('child')","p.get('role')","state.legacyRole","getParams()"])assert(ui.includes(phrase),'Back-compat query behavior missing '+phrase);
const raw=read('resources/clinical-finder-data.js');
const data=JSON.parse(raw.replace(/^globalThis\.CPLFinderData\s*=\s*/,'').replace(/;\s*$/,''));
assert.equal(data.resources.length,615);
assert.equal(data.resources.filter(x=>x.externalUrl).length,77);
const items=engine.index(data.resources);
assert.equal(items.length,615);
const get=url=>items.find(x=>x.url===url);
const early=get('/resources/birth-to-five/index.html'),local=get('/resources/birth-to-five/tucson-pima-local-resources.html');
assert(early&&local);
for(const audience of ['clinician','caregiver','case_manager','school_team','trainee']){
 assert(engine.matchesFilters(early,{population:'birth5',audience}), 'Birth–5 hub not findable for '+audience);
 assert(engine.matchesFilters(local,{population:'birth5',audience}), 'Tucson directory not findable for '+audience);
}
for(const k of ['children','teens','adults'])assert(engine.search(items,{q:'',population:k}).matches>10,'Missing population '+k);
const strict=[
 {q:'IEP',needle:'/resources/arizona/iep-504-parent-guide.html',top:5},
 {q:'tantrums',needle:'/resources/clinical-topics/child-aggression-caregiver-coaching/index.html',top:3},
 {q:'dissociation grounding',needle:'/resources/handouts/grounding.html',top:5},
 {q:'school refusal',needle:'/resources/school/clinical/anxiety.html',top:3},
 {q:'adult ADHD',needle:'/resources/clinical-topics/adult-adhd-task-starts/index.html',top:3},
 {q:'tucson early intervention',needle:'/resources/birth-to-five/tucson-pima-local-resources.html',top:5}
];
for(const s of strict){
 const found=engine.search(items,{q:s.q}).groups;
 const rank=found.findIndex(g=>g.best.item.url===s.needle)+1;
 assert(rank>0&&rank<=s.top,'Search regression '+s.q+': '+rank);
}
const legacyCombined={q:'',legacyRole:'Client / caregiver',population:'children'};
const legacyHits=engine.search(items,legacyCombined);
assert(legacyHits.matches>20,'Legacy combined client/caregiver URL yielded empty results');
assert(legacyHits.groups.every(g=>(g.best.item.original.tags.role||[]).includes('Client / caregiver')),
 'Legacy combined role should retain source metadata semantics');
const minimum=data.resources.find(r=>r.url==='/resources/community/online-lgbtq-resources.html#trevor-space');
assert(minimum&&minimum.minimumAge>=13);
assert(!engine.populationFor(minimum).values.includes('children'),'Age-restricted service returned under children');
const elder=items.find(i=>/Eldercare Locator/i.test(i.title));
assert(elder&&!elder.population.includes('birth5'),'Older-adult directory returned for Birth–5');
console.log(JSON.stringify({status:'PASS',purpose:'canonical finder production integration',catalog:items.length,externalPublisherLinks:77,originalFinderBlob:blobSha(originalFinder),legacyCombinedHits:legacyHits.matches,strictSearchCases:strict.length},null,2));