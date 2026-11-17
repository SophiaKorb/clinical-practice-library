'use strict';
/* CPL post-deployment review, independent of owner-approved release.
   Editorial fictional journeys; not clinical validation or real-user success. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const raw=read('resources/clinical-finder-data.js');
const d=JSON.parse(raw.replace(/^globalThis\.CPLFinderData\s*=\s*/,'').replace(/;\s*$/,''));
const engine=require('../resources/finder-lab-engine.js');
const reviewed=require('../resources/finder-source-review.js');
const idx=engine.index(d.resources),byUrl=new Map(idx.map(it=>[it.url,it]));
assert.equal(idx.length,615,'Original published inventory must remain intact');
assert.equal(new Set(idx.map(x=>x.url)).size,615,'URLs must remain unique');
assert.equal(d.resources.filter(x=>x.externalUrl).length,77);
assert.equal(Object.keys(reviewed).length,31,'Source review scope changed; re-audit source claims');
assert.equal(idx.filter(x=>x.reviewedSource).length,31);
for(const [url,notes] of Object.entries(reviewed)){
 const it=byUrl.get(url);assert(it,'Missing source-review entry '+url);
 assert(it.description===notes.description,'Source-reviewed description ignored '+url);
 assert(it.provenance.includes('original CPL page introduction'),'Source provenance lost '+url);
 assert(notes.description.length>55,'Insufficient source description '+url);
 assert(!/reviewed|certified|approved|validated treatment/i.test(notes.description),'Do not imply clinical certification');
 assert(Array.isArray(notes.audience)&&notes.audience.length>0,'Missing reviewed audience '+url);
 const local=url.slice(1);assert(fs.existsSync(path.join(root,local)),'Review notes point to non-existent source '+url);
 if(url.startsWith('/resources/es/'))assert(it.language==='es','Spanish source missing language metadata');
 if(notes.population)assert.deepEqual(it.population,notes.population,'Reviewed age overwritten for '+url);
}
// Claims grounded in actual source introductions, not generated title/URL alone.
for(const [url,excerpt] of [
 ['/resources/trauma/children-families-trauma-curated-clinical-guide.html','Child-Parent Psychotherapy (CPP)'],
 ['/resources/handouts/abc-observation-guide.html','families and clinicians'],
 ['/resources/handouts/after-school-is-a-landing-not-a-launch.html','A parent guide to recovery'],
 ['/resources/handouts/parenting-across-disagreement.html','when cooperation is limited'],
 ['/resources/handouts/when-a-young-child-has-more-feeling-than-language.html','Toddlers and preschoolers'],
 ['/resources/handouts/friendship-peer-safety-family-guide.html','autistic children and teens'],
 ['/resources/handouts/sibling-conflict-reset.html','ordinary sibling conflict'],
 ['/resources/handouts/safety-planning-preparation-sheet.html','formal safety plan'],
 ['/resources/arizona/developmental-disability-autism-behavioral-health.html','Children under age 6'],
 ['/resources/california/developmental-disability-autism-behavioral-health.html','Provisional eligibility for young children'],
 ['/resources/therapy/early-childhood-regulation-communication.html','toddlers and preschoolers'],
 ['/resources/therapy/communication-supports-toolkit.html','Use when the person may know or understand more'],
 ['/resources/therapy/anxiety-exposure-ocd-start-here.html','social/performance anxiety'],
 ['/resources/es/handouts/conducta-ninos-autistas.html','padres y cuidadores']
]){
 assert(read(url.slice(1)).toLowerCase().includes(excerpt.toLowerCase()),
  'Source introduction no longer supports metadata: '+url+' / '+excerpt);
}
const young=byUrl.get('/resources/handouts/when-a-young-child-has-more-feeling-than-language.html');
assert.deepEqual(young.population,['birth5'],'Preschool caregiver page incorrectly indexed for teens');
const early=byUrl.get('/resources/therapy/early-childhood-regulation-communication.html');
assert.deepEqual(early.population,['birth5'],'Toddler/preschool clinical tool still tagged for adolescents');
assert(!engine.matchesFilters(early,{advanced:{stage:'School age / adolescence'}}),'Contradictory original stage tag reintroduced through advanced filter');
assert(engine.matchesFilters(early,{advanced:{stage:'Early childhood'}}),'Reviewed early-childhood stage not searchable');
const individual=byUrl.get('/resources/handouts/safety-planning-preparation-sheet.html');
assert(!individual.population.includes('teens'),'Teen clinical appropriateness must not be inferred');
const youth=engine.search(idx,{q:'teen self harm worksheet',population:'teens'});
assert(!youth.groups.some(g=>g.best.item.url===individual.url),'Unclassified worksheet presented as age-validated');
assert(youth.unclassifiedGroups.some(g=>g.best.item.url===individual.url),'Unknown age status must not make a potentially useful worksheet disappear');
const related=engine.search(idx,{q:'adult ADHD',audience:'caregiver'}).groups.find(x=>x.key==='clinical-topic:adult-adhd-task-starts');
assert(related,'Adult ADHD group absent');
assert(!related.allFamily.some(x=>x.url.endsWith('/client-workbook.html')),'Related formats bypass caregiver filter');
assert(related.allFamily.every(x=>x.audience.includes('caregiver')),'Group exposes nonmatching audience');
const dataOld=d.resources.find(r=>r.url===early.url);
assert(dataOld.tags.stage.includes('School age / adolescence'),'Original source tag should remain untouched');
const gone=idx.find(x=>/Eldercare Locator/i.test(x.title));
assert(gone&&!gone.population.includes('birth5'));
for(const ageLimited of d.resources.filter(x=>Number.isInteger(x.minimumAge)&&x.minimumAge>=13))
 assert(!engine.populationFor(ageLimited).values.includes('children'),'Min-age false positive '+ageLimited.url);
const journeys=[
 {who:'Parent',q:'caregiver after school meltdowns',f:{audience:'caregiver'},target:'after-school-is-a-landing-not-a-launch.html'},
 {who:'Caregiver',q:'five year old aggression at daycare',f:{population:'birth5',audience:'caregiver'},target:'when-a-young-child-has-more-feeling-than-language.html'},
 {who:'Caregiver',q:'autistic child being bullied in school',f:{population:'children',audience:'caregiver'},target:'friendship-peer-safety-family-guide.html'},
 {who:'Case manager',q:'case manager needs Tucson preschool child find',f:{population:'birth5',audience:'case_manager'},target:'tucson-pima-local-resources.html'},
 {who:'Clinician',q:'clinician needs developmental trauma model for toddler',f:{population:'birth5',audience:'clinician'},target:'children-families-trauma-curated-clinical-guide.html'},
 {who:'Family',q:'family struggling with hygiene tasks',f:{audience:'caregiver'},target:'when-hygiene-tasks-are-hard.html'},
 {who:'Child provider',q:'child says everyone is picking on me',f:{population:'children'},target:'friendship-peer-safety-family-guide.html'},
 {who:'Caregiver',q:'parent wants to understand ABC observations',f:{audience:'caregiver'},target:'abc-observation-guide.html'},
 {who:'Caregiver',q:'young child has more feelings than words',f:{population:'birth5',audience:'caregiver'},target:'when-a-young-child-has-more-feeling-than-language.html'},
 {who:'Client',q:'client dissociates during session grounding',f:{audience:'client'},target:'handouts/grounding.html'},
 {who:'School case manager',q:'Arizona DDD eligibility for autism',f:{population:'birth5'},target:'arizona/developmental-disability-autism-behavioral-health.html'},
 {who:'Caregiver',q:'California regional center autism eligibility',f:{population:'children'},target:'california/developmental-disability-autism-behavioral-health.html'},
 {who:'Spanish-speaking caregiver',q:'Spanish child autism family guide',f:{population:'children',audience:'caregiver'},target:'es/handouts/autismo-guia-rapida-familias.html'},
 {who:'Clinician',q:'social anxiety CBT exposure',f:{population:'adults',audience:'clinician'},target:'social-anxiety-attention/index.html'},
 {who:'School staff',q:'school attendance anxiety intervention',f:{population:'children',audience:'school_team'},target:'school/clinical/anxiety.html'},
 {who:'Clinician',q:'therapist family trauma treatment models',f:{population:'children',audience:'clinician'},target:'trauma/start-here-families-children-trauma.html'},
 {who:'Caregiver',q:'parent disagrees with other parent about parenting',f:{audience:'caregiver'},target:'parenting-across-disagreement.html'},
 {who:'Caregiver',q:'developmental screening age 2',f:{population:'birth5'},target:'birth-to-five/development-and-screening.html'},
 {who:'Client',q:'need crisis contact card',f:{audience:'client'},target:'crisis-contact-card.html'}
];
const outcome=journeys.map(j=>{
 const result=engine.search(idx,{q:j.q,...j.f});
 return {role:j.who,q:j.q,target:j.target,rank:result.groups.findIndex(x=>x.best.item.url.includes(j.target))+1,
  matches:result.matches,unknownAgeCandidates:result.unclassifiedGroups.length};
});
for(const o of outcome)assert(o.rank>0&&o.rank<=5,'Expected role-based discovery within 5 (editorial fixture): '+JSON.stringify(o));
const summaries={
 reviewed:idx.filter(x=>x.reviewedSource).length,
 unknownAudience:idx.filter(x=>!x.audience.length).length,
 unknownPopulation:idx.filter(x=>!x.population.length&&!x.acrossAges).length,
 genericDescriptions:idx.filter(x=>/^(Explore |Clinical thinking and practice resource on |School support and access resource covering |Curated publisher resource on |Printable companion for |Topic-focused resource on |Education and practical guidance on )/.test(x.description)).length
};
assert(read('resources/clinical-resource-finder.html').includes('src="/resources/finder-source-review.js"'),'Production finder candidate missing source overlay');
assert(read('resources/clinical-resource-finder.html').includes('id="lab-unclassified"'),'Age-unknown results not visibly separated');
assert(read('resources/clinical-resource-finder-classic.html').includes('id="finder-query"'),'Classic unchanged');
assert(!read('index.html').includes('finder-postdeploy'),'Review-only changes must not be promoted to homepage');
console.log(JSON.stringify({status:'PASS',audit:'Post-deployment independent review branch, editorial fictional scenarios not real users',cases:outcome.length,summaries,results:outcome},null,2));
