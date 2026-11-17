/* CPL finder UX laboratory — additive only; no production finder changes.
   All descriptions and population inferences are discovery cues, not clinical clearance. */
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.CPLFinderLab=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
var STOP=new Set('a an and are at be can do for from help how i in is it me my of on or our the their to with what when where who will worried about need looking find please resources resource someone some working work'.split(' '));
var CONCEPTS=[
 {test:/\b(sensory overload|sensory overwhelm|overloaded by noise)\b/,terms:['sensory overload recovery plan','supporting child self regulation','communication play regulation'],label:'sensory overload and recovery',priority:45},
 {test:/\b(refuses homework|homework refusal|struggles with homework|won t do homework|can t start homework)\b/,terms:['task launch map','executive functioning','learning instruction access','adhd barrier'],label:'homework access and task initiation'},
 {test:/\b(biting|bitten|bites classmates|hits classmates|kicking peers|throwing things)\b/,terms:['child aggression','managing child behavior problems','when a young child has more feeling'],label:'observable child behavior and support'},
 {test:/\b(picking on|bullied|bullying|being teased|excluded by peers)\b/,terms:['friendship peer safety','peer relationships bullying','youth school community access'],label:'peer safety and social conflict'},
 {test:/\b(won t enter school|wont enter school|refuses to go to school|scared to go to school|school avoidance)\b/,terms:['school clinical anxiety','anxiety in children','school access'],label:'anxiety and access around school attendance'},
 {test:/\b(school evaluation|special education evaluation|request an evaluation|child find)\b/,terms:['iep 504 parent guide','school access iep 504','early intervention preschool','school access official reference'],label:'evaluation and school support access'},
 {test:/\b(nonverbal|non speaking|doesn t speak|cannot speak|aac)\b/,terms:['communication supports toolkit','show me what you need','communication play regulation','aphasia communication access'],label:'communication access and choice',priority:30},
 {test:/\b(dissociative parts|dissociating|dissociation)\b/,terms:['dissociation functional','complex dissociation','grounding'],label:'dissociation and day-to-day function'},
 {test:/\b(no sleep|not sleeping|sleep loss)\b.*\b(activation|mania|mood)\b|\b(mood activation|mania)\b.*\b(no sleep|not sleeping|sleep loss)\b/,terms:['sleep loss activation','bipolar episode','psychosis bipolar'],label:'sleep changes and possible activation'},
 {test:/\b(school accommodations|accommodations at school|school.*cannot provide accommodations|school supports)\b/,terms:['iep 504','school access','learning instruction access'],label:'school accommodations and access'},
 {test:/\b(separation anxiety|anxious young child|young child.*anxiety)\b/,terms:['anxiety in children','anxiety school clinical','when a young child has more feeling'],label:'developmental anxiety and caregiver support'},
 {test:/\b(angry at everyone|irritable child|child.*angry|always angry)\b/,terms:['fairness and flexibility','supporting child self regulation','when a young child has more feeling','child aggression'],label:'emotional regulation and context'},
 {test:/\b(self harm|self injury|cutting self|safety worksheet)\b/,terms:['safety planning preparation sheet','self harm safety continuity','making a suicide crisis safer'],label:'self-harm and safety support'},
 {test:/\b(tantrum|tantrums|outburst|outbursts|explosive behavior|hitting during upset)\b/,terms:['child aggression','managing child behavior problems','when a young child has more feeling','supporting child self regulation'],label:'child behavior and regulation'},
 {test:/\b(school refusal|school avoidance|won.t go to school|school anxiety)\b/,terms:['school clinical anxiety','anxiety in children','school access','school support process','anxiety homeschool'],label:'school attendance, anxiety and access'},
 {test:/\b(child anxiety|anxious child|anxiety in children)\b/,terms:['anxiety in children','anxiety school clinical','anxiety homeschool','anxiety quick guide'],label:'child anxiety and school supports'},
 {test:/\b(child communication|child not talking|child speech|communication with children)\b/,terms:['communication play regulation','when a young child has more feeling','communication supports toolkit'],label:'child communication and access'},
 {test:/\b(bipolar sleep|sleep bipolar|sleep and mania)\b/,terms:['sleep loss activation','bipolar episode','psychosis bipolar longitudinal'],label:'sleep changes and bipolar differential'},
 {test:/\b(parent behavior problems|parenting behavior problems|behavior problems at home)\b/,terms:['managing child behavior problems','child aggression','clear supported proactive parenting'],label:'parenting and child behavior'},
 {test:/\b(dissociation.*grounding|grounding.*dissociation|dissociating and grounding)\b/,terms:['grounding','dissociation','orientation time gaps'],label:'dissociation and grounding',priority:25},
 {test:/\b(daycare|day care|childcare|child care|preschool access)\b/,terms:['early intervention preschool','preschool access','positive parenting preschoolers','birth to five'],label:'early childhood and preschool access'},
 {test:/\b(task launch|cannot start|can.t start|can t get started|can t start|getting started|start tasks|executive initiation)\b/,terms:['task launch','task starts','executive functioning','starting organizing tasks'],label:'starting tasks and executive functioning'},
 {test:/\b(parents worried about meltdowns|parent worried about meltdowns)\b/,terms:['child aggression','when a young child has more feeling','managing child behavior','clear supported proactive parenting','communication play regulation'],label:'caregiver support for regulation'},
 {test:/\b(meltdown|meltdowns|overwhelmed child|sensory overload)\b/,terms:['child aggression','supporting child self regulation','sensory overload','communication play regulation','understanding behavior in autistic children'],label:'overload and regulation'},
 {test:/\b(play therapy|therapeutic play|dyadic therapy)\b/,terms:['child treatment selection','communication play regulation','caregiver session support'],label:'play, developmental and dyadic approaches'},
 {test:/\b(iep|504 plan|special education meeting)\b/,terms:['iep','504','school access'],label:'IEP and school supports'},
 {test:/\b(autistic child|child with autism)\b/,terms:['understanding behavior in autistic children','autism in childhood','autism family','autism barrier','autism'],label:'autistic children and support'},
 {test:/\b(suicide safety plan|suicidal crisis|suicide crisis)\b/,terms:['safety planning','making a suicide crisis safer','self harm safety','suicide prevention'],label:'suicide safety and planning'},
 {test:/\b(communication board|aac|nonverbal communication)\b/,terms:['communication supports toolkit','communication','visual support'],label:'supported communication'}
];
var DESCRIPTIONS={
 '/resources/birth-to-five/index.html':'Browse development, communication, regulation, early mental health and local support pathways for birth through five.',
 '/resources/birth-to-five/development-and-screening.html':'Explore early developmental questions, screening resources and pathways to further evaluation.',
 '/resources/birth-to-five/communication-and-regulation.html':'Find early-childhood communication, play and regulation resources.',
 '/resources/birth-to-five/relationships-and-trauma.html':'Explore relationships, trauma and early mental health in the birth–five years.',
 '/resources/birth-to-five/early-intervention-and-preschool.html':'Find early-intervention and preschool access starting points.',
 '/resources/birth-to-five/tucson-pima-local-resources.html':'Browse a local Tucson/Pima directory of early-childhood pathways; verify eligibility and contacts with each provider.',
 '/resources/arizona/iep-504-parent-guide.html':'A step-by-step guide for case managers and families: request evaluation, prepare records, and follow up on IEP/504 decisions.',
 '/resources/arizona/iep-504-my-child-has-a-diagnosis.html':'Explains why a medical diagnosis does not automatically establish IEP or 504 eligibility, and how educational impact matters.',
 '/resources/school/school-access-official-reference.html':'Federal IDEA and Section 504 reference points for describing barriers, discussing access and asking school-support questions.',
 '/resources/california/school-access.html':'California school-access overview covering evaluation requests, school timelines and family participation; general information, not legal advice.',
 '/resources/school/iep-504-meeting-preparation.html':'A meeting-preparation guide for families and support people: document barriers, gather records and bring the student’s perspective.',
 '/resources/es/arizona-como-conseguir-iep-504.html':'Guía paso a paso para familias y gestores de casos sobre solicitudes escritas, evaluaciones y planes IEP/504 en Arizona.',
 '/resources/es/school/iep-504-preparacion-reunion.html':'Preparación para una reunión IEP/504: ejemplos concretos, registros, preguntas y participación del estudiante.',
 '/resources/arizona/iep-504-clinician-guide.html':'A clinician-oriented guide to school accommodations with federal and Arizona context.',
 '/resources/school/iep-504-meeting-preparation.html':'Prepare questions, goals and documents for an IEP or 504 meeting.',
 '/resources/therapy/visual-reasoning-toolkit.html':'Use visual structures to support shared understanding and participation.',
 '/resources/therapy/communication-supports-toolkit.html':'Explore communication access tools and ways to support participation.',
 '/resources/clinical-depth/child-caregiver-treatment-selection.html':'Consider development, safety, caregiver involvement and clinical fit when choosing approaches.',
 '/resources/handouts/grounding.html':'An individual grounding handout for supporting orientation and present-moment attention.',
 '/resources/handouts/my-grounding-menu.html':'A customizable menu of grounding options for use with a person.',
 '/resources/handouts/task-launch-map.html':'A practical worksheet for making task initiation more manageable.',
 '/resources/clinical-depth/complex-dissociation-functional-care.html':'A clinical guide to differential questions and day-to-day functioning in complex dissociation.',
 '/resources/clinical-depth/self-harm-safety-continuity.html':'Clinical considerations for self-harm assessment, safety and follow-through; not a substitute for urgent care.',
 '/resources/handouts/making-a-suicide-crisis-safer.html':'Client-facing education on safer crisis response and accessing appropriate support.'
};
var TYPES={
 collection:'Topic collection',clinical:'Clinical guidance',worksheet:'Worksheet or visual',caregiver:'Caregiver education',
 assessment:'Assessment',school:'School support',referral:'Referral or directory',training:'Practice and training',education:'Education',other:'Other'
};
// Narrow audience corrections read from the actual guide introductions, not guessed from path alone.
var AUDIENCE_EVIDENCE={
 '/resources/arizona/iep-504-parent-guide.html':['case_manager','caregiver','school_team'],
 '/resources/arizona/iep-504-my-child-has-a-diagnosis.html':['caregiver','school_team'],
 '/resources/arizona/iep-504-clinician-guide.html':['clinician','school_team'],
 '/resources/school/iep-504-meeting-preparation.html':['caregiver','case_manager','school_team'],
 '/resources/es/arizona-como-conseguir-iep-504.html':['caregiver','case_manager','school_team'],
 '/resources/es/school/iep-504-preparacion-reunion.html':['caregiver','school_team']
};
// Verified-page overlay is a discovery aid only: no underlying resource content is altered.
var SOURCE_REVIEW=(typeof module==='object'&&module.exports&&typeof require==='function')
  ?require('./finder-source-review.js'):(typeof globalThis!=='undefined'&&globalThis.CPLFinderSourceReview||{});
var NEEDS=['clinical','worksheet','caregiver','assessment','school','referral','training','education','collection'];
var AUDIENCES=['client','caregiver','clinician','case_manager','school_team','trainee'];
var POPULATIONS=['birth5','children','teens','adults'];
function norm(value){
 return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[–—\/_-]/g,' ').replace(/[^a-z0-9ñ ]+/g,' ').replace(/\s+/g,' ').trim();
}
function word(value){var v=norm(value);if(v==='children')return 'child';if(v==='teens')return 'teen';if(v==='families')return 'family';if(v.endsWith('ies')&&v.length>5)return v.slice(0,-3)+'y';if(v.endsWith('s')&&v.length>4&&!v.endsWith('ss')&&!v.endsWith('us'))return v.slice(0,-1);return v;}
function tokens(s){return [...new Set(norm(s).split(' ').map(word).filter(x=>x.length>1&&!STOP.has(x)))];}
function queryIntent(raw){
 var q=norm(raw),topic=q.split(' ').filter((x,i,arr)=>{
   var generic=['worksheet','worksheets','handout','handouts','printable','pdf','spanish','espanol','client','person','need','needs','struggling','struggle','with','therapist'];
   if(generic.includes(x))return false;
   if(arr.length>=4&&['parent','parents','caregiver','caregivers','teen','teens','student'].includes(x))return false;
   return true;
 }).join(' ');
 return {
  topic:topic,
  language:/\b(spanish|espanol)\b/.test(q)||/[áéíóúñ¿¡]/i.test(raw)||/\b(como|hijo|hija|ansiedad|preparacion|barreras|apoyos)\b/.test(q)?'es':'en',
  population:/\b(teen|teens|adolescent)\b/.test(q)?'teens':/\b(five year old|four year old|three year old|toddler|preschool|infant)\b/.test(q)?'birth5':/\b(child|children|kid|student)\b/.test(q)?'children':'',
  audience:/\b(parent|parents|caregiver|caregivers|family|families)\b/.test(q)?'caregiver':'',
  worksheet:/\b(worksheet|handout|printable|pdf)\b/.test(q)
 };
}
function hasWord(h,t){return (' '+h+' ').includes(' '+t+' ');}
function safeArray(a){return Array.isArray(a)?a:[];}
function starts(u,p){return String(u||'').startsWith(p);}
function typeFor(r){
 var u=r.url||'',t=norm(r.title),p=u.toLowerCase();
 if(/\/clinical-topics\/[^/]+\/index\.html/.test(p)||p==='/resources/birth-to-five/index.html')return 'collection';
 if(/\/clinical-topics\/[^/]+\/(client-workbook|support-map|progress-review)\.html/.test(p)||/\/downloads\/|fillab|worksheet|workbook|quick.card|support.map/.test(p+' '+t))return 'worksheet';
 if(/\/clinical-topics\/[^/]+\/care-partner\.html/.test(p)||/\/handouts\/.*(parent|caregiver|family)/.test(p)||/\b(parent guide|family guide|care partner guide|parenting)\b/.test(t))return 'caregiver';
 if(/\/school\/|iep|504|homeschool|school access/.test(p+' '+t))return 'school';
 if(/\/assessment\/|screening|differential|evaluation|test|measure|assessment/.test(p+' '+t))return 'assessment';
 if(/\/community\/|tucson-pima|referral|locator|findtreatment|resource director/.test(p+' '+t))return 'referral';
 if(/\/training\/|\/case\.html|learning.center|skill rehearsal|supervision/.test(p+' '+t))return 'training';
 if(/\/clinical-depth\/|\/formulation\.html|\/therapy\//.test(p))return 'clinical';
 if(/\/handouts\/|\/guides\//.test(p))return 'education';
 return 'other';
}
function audienceFor(r){
 var role=safeArray(r.tags&&r.tags.role),u=r.url||'',t=norm(r.title),out=new Set(),notes=[];
 if(role.includes('Clinician'))out.add('clinician');
 if(role.includes('Graduate trainee'))out.add('trainee');
 if(role.includes('School team'))out.add('school_team');
 if(role.includes('Staff / case manager'))out.add('case_manager');
 if(role.includes('Client / caregiver')){
   if(starts(u,'/resources/birth-to-five/'))out.add('caregiver');
   else if(/client.workbook|client.facing|patient.facing|\/handouts\/my-|\/downloads\/my-/.test(u+' '+t))out.add('client');
   else if(/care.partner|caregiver|parent|family.guide|parenting|homeschool/.test(u+' '+t))out.add('caregiver');
   else notes.push('Client/caregiver audience is combined in the original index; direct user not verified');
 }
 for(var confirmed of AUDIENCE_EVIDENCE[u]||[])out.add(confirmed);
 return {values:[...out],undifferentiated:notes.length>0,notes:notes};
}
function populationFor(r){
 var stages=safeArray(r.tags&&r.tags.stage),u=r.url||'',t=norm(r.title),set=new Set(),note='';
 if(stages.includes('Early childhood'))set.add('birth5');
 if(stages.includes('School age / adolescence')){set.add('children');set.add('teens');note='Broad school-age/adolescent discovery tag; confirm fit and eligibility';}
 if(stages.includes('Adult'))set.add('adults');
 // Do not silently turn "Across ages" into all age groups: adult-service false positives resulted.
 if(stages.includes('Across ages / adapt to person')){
   note='Across ages / adaptation needed; not age-validated';
   // General CPL teaching tools can be found under child/teen/adult practice,
   // but publisher/provider directories are not presumed eligible across ages.
   if(!r.externalUrl&&!/\/community\/|eldercare|older adult|aging services/.test((u+' '+t).toLowerCase())){
     set.add('children');set.add('teens');set.add('adults');
   }
 }
 if(!stages.length){
   if(/birth.to.five|toddler|preschool|young.child/.test(u+' '+t))set.add('birth5');
   else if(/\badult\b/.test(t))set.add('adults');
   else if(/\b(child|children|parent|school)\b/.test(t)) {set.add('children');note='Inferred from title; confirm intended age';}
 }
 // Specific provider minimum ages exclude underage discovery, including broad stages.
 if(Number.isInteger(r.minimumAge)&&r.minimumAge>=13){set.delete('children');set.delete('birth5');}
 if(Number.isInteger(r.minimumAge)&&r.minimumAge>5)set.delete('birth5');
 if(/\beldercare\b|older adult|aging services/.test(t)){set.delete('birth5');set.delete('children');set.delete('teens');}
 return {values:[...set],across:stages.includes('Across ages / adapt to person'),note:note};
}
function familyFor(r){
 var match=(r.url||'').match(/^\/resources\/clinical-topics\/([^/]+)\//);
 var pdf=(r.url||'').match(/^\/resources\/downloads\/topic-(.+)\.pdf$/);
 return match?'clinical-topic:'+match[1]:pdf?'clinical-topic:'+pdf[1]:r.url;
}
function describe(r,type){
 if(DESCRIPTIONS[r.url])return DESCRIPTIONS[r.url];
 var title=r.title.replace(/^Topic /,'').replace(/ — (Care-partner guide|Client workbook|Clinician formulation guide|Interactive case practice|Progress review tool|Visual support map)$/,'');
 if(/\/clinical-topics\//.test(r.url||'')){
   if(type==='collection')return 'Open the topic collection for formulation, workbook, care-partner, visual and progress-review resources.';
   var guides={caregiver:'Care-partner guidance',worksheet:'A practical workbook, visual map or progress-review resource',clinical:'Clinician formulation guidance',training:'An interactive clinical learning case'};
   return (guides[type]||'Topic-focused resource')+' on '+title.toLowerCase()+'.';
 }
 if((r.url||'').includes('#ext-'))return 'Curated publisher resource on '+title.toLowerCase()+'; check the original provider for current details and eligibility.';
 if((r.url||'').endsWith('.pdf'))return 'Printable companion for '+title.toLowerCase()+'; check the resource before using it.';
 if(type==='school')return 'School support and access resource covering '+title.toLowerCase()+'.';
 if(type==='assessment')return 'Assessment and clinical decision support covering '+title.toLowerCase()+'.';
 if(type==='caregiver')return 'Education and practical guidance on '+title.toLowerCase()+'.';
 if(type==='clinical')return 'Clinical thinking and practice resource on '+title.toLowerCase()+'.';
 return 'Explore '+title.toLowerCase()+'; review the original resource for purpose and fit.';
}
function meta(r){
 var reviewed=SOURCE_REVIEW[r.url]||null,type=reviewed&&reviewed.type||typeFor(r),
   audience=audienceFor(r),population=populationFor(r),base=familyFor(r);
 if(reviewed){
   if(reviewed.audience)audience.values=[...reviewed.audience];
   if(reviewed.population){
     population.values=[...reviewed.population];
     population.note='Population discovery supported by source introduction; verify actual fit';
   }
 }
 return {url:r.url,title:r.title,original:r,type:type,typeLabel:TYPES[type],
   audience:audience.values,audienceUndifferentiated:reviewed?false:audience.undifferentiated,
   population:population.values,acrossAges:reviewed&&reviewed.population?false:population.across,
   populationNote:population.note,description:reviewed&&reviewed.description||describe(r,type),
   family:base,reviewedSource:!!reviewed,reviewTerms:reviewed&&reviewed.terms||[],
   provenance:reviewed?'Reviewed against original CPL page introduction; not validated suitability':'Derived only from catalog, title and path; not validated suitability',
   isExternal:!!r.externalUrl,language:/^\/resources\/es\//.test(r.url||'')?'es':'en',
   format:(r.url||'').endsWith('.pdf')?'PDF':'Web page'};
}
function index(records){
 var list=records.map(meta),families=new Map();
 for(var item of list)if(item.family.startsWith('clinical-topic:')){
   if(!families.has(item.family))families.set(item.family,[]);
   families.get(item.family).push(item);
 }
 // Derive collection-level metadata only from its own existing linked members.
 // Missing metadata on unrelated individual pages remains explicitly unknown.
 for(var members of families.values()){
  var staged=members.filter(x=>x.population.length>0&&!x.acrossAges);
  var populations=new Set(staged.flatMap(x=>x.population));
  for(var item of members){
   if(!item.population.length&&!item.acrossAges&&populations.size){
    item.population=[...populations];
    item.populationNote='Discovery stage inferred from tagged companion pages; not validated suitability';
   }
   if(item.type==='collection'&&!item.audience.length){
    item.audience=[...new Set(members.flatMap(x=>x.audience))];
    item.audienceAggregated=true;
   }
  }
 }
 return list;
}
function textFields(item){
 var r=item.original,tags=r.tags||{};
 var canonical=s=>norm(s).split(' ').map(word).join(' ');
 return {title:canonical(r.title),url:canonical((r.url||'').split('#')[0]),
  terms:canonical(safeArray(r.searchTerms).join(' ')),
  review:canonical(safeArray(item.reviewTerms).join(' ')),
  tags:canonical(Object.values(tags).flat().join(' '))};
}
function directScore(item,q){
 var qt=tokens(q);if(!qt.length)return {score:0,reason:'Browse all',matched:[]};
 var f=textFields(item),qnorm=norm(q),hits=0,score=0,titleHits=0;
 if(qnorm.length>2&&f.title.includes(qnorm))score+=230;
 if(qnorm.length>2&&f.url.includes(qnorm))score+=110;
 var matched=[];
 for(var i=0;i<qt.length;i++){
   var t=qt[i],value=0;
   if(hasWord(f.title,t)){value=78;titleHits++;}
   else if(hasWord(f.url,t))value=49;
   else if(hasWord(f.review,t))value=30;
   else if(hasWord(f.terms,t))value=24;
   else if(hasWord(f.tags,t))value=9;
   if(value){hits++;score+=value;matched.push(t);}
 }
 var fraction=hits/qt.length;
 if(qt.length>1&&hits<qt.length)score*=Math.pow(fraction,2);
 if(!hits)score=0;
 return {score:score,reason:titleHits?'Title match':hits===qt.length?'Topic match':'Partial match',matched:matched,coverage:fraction};
}
function conceptsFor(q){var n=norm(q);return CONCEPTS.filter(x=>x.test.test(n));}
function relatedScore(item,concepts){
 if(!concepts.length)return 0;
 // Related-language search uses specific TITLE/PATH phrases only.
 // Do not admit every record containing one common tag (e.g. "school" or "anxiety").
 var subject=norm(item.title+' '+item.url),best=0;
 for(var concept of concepts){
  for(var i=0;i<concept.terms.length;i++){
   var phrase=norm(concept.terms[i]);
   if(subject.includes(phrase)){
    var value=Math.max(30,125-i*12)+(concept.priority||0);
    if(value>best)best=value;
   }
  }
 }
 return best;
}
function matchesFilters(item,state){
 if(state.population && !item.population.includes(state.population))return false;
 if(state.need && item.type!==state.need)return false;
 if(state.audience && !item.audience.includes(state.audience))return false;
 if(state.legacyRole && !safeArray(item.original.tags&&item.original.tags.role).includes(state.legacyRole))return false;
 var advanced=state.advanced||{};
 for(var k of ['diagnosis','symptom','function','intervention','stage','task','step']){
   if(advanced[k]&&!safeArray(item.original.tags&&item.original.tags[k]).includes(advanced[k]))return false;
 }
 return true;
}
function groupResults(hits,all){
 var byFamily=new Map();for(var hit of hits){
   var key=hit.item.family,entry=byFamily.get(key);
   if(!entry){entry={key:key,best:hit,otherMatches:[],allFamily:[],count:0};byFamily.set(key,entry);}
   entry.count++;if(hit.score>entry.best.score){entry.otherMatches.push(entry.best);entry.best=hit;}else if(hit!==entry.best)entry.otherMatches.push(hit);
 }
 var members=new Map();for(var it of all){if(!members.has(it.family))members.set(it.family,[]);members.get(it.family).push(it);}
 for(var entry of byFamily.values())entry.allFamily=members.get(entry.key)||[];
 return [...byFamily.values()].sort((a,b)=>b.best.score-a.best.score||a.best.item.title.localeCompare(b.best.item.title));
}
function search(items,state){
 var q=norm(state&&state.q),intent=queryIntent(state&&state.q||''),topic=intent.topic||q,qTokens=tokens(topic),concepts=conceptsFor(q),filtered=items.filter(it=>matchesFilters(it,state||{}));
 var scored=filtered.map(item=>({item:item,direct:directScore(item,topic),related:relatedScore(item,concepts)}));
 var strong=scored.filter(h=>qTokens.length>0&&h.direct.score>0&&(qTokens.length===1||h.direct.coverage>=0.99));
 var minDirect=strong.length>=4;
 var hits=[];
 for(var h of scored){
   var score=0,reason='Browse all';
   if(!qTokens.length){score=Math.min(10,(h.item.original.priority||0)/10);reason='Browse all';}
   else if(h.direct.score>0 && (qTokens.length===1||h.direct.coverage>=0.99)){
     score=h.direct.score;reason=h.direct.reason;
     if(h.related>0 && score<10+h.related){score=10+h.related;reason='Related concept: '+concepts.map(c=>c.label).join('; ');}
   }else if(h.related>0 && (!minDirect || qTokens.length>1)){
     score=10+h.related;reason='Related concept: '+concepts.map(c=>c.label).join('; ');
   }else if(qTokens.length>2 && h.direct.coverage>=0.67 && !minDirect){
     score=h.direct.score*0.65;reason='Partial match';
   }
   // Explicit title/path relevance dominates; historical global priority only breaks near-ties.
   if(q==='iep'&&minDirect&&h.direct.reason!=='Title match')score=0;
   if(score>=(qTokens.length>1?30:1)){
     var isSpanish=h.item.language==='es';
     var languageFit=intent.language==='es'?(isSpanish?250:-100):(isSpanish?-250:3);
     var audienceFit=intent.audience&&h.item.audience.includes(intent.audience)?12:0;
     var populationFit=intent.population&&h.item.population.includes(intent.population)?12:0;
     var worksheetFit=intent.worksheet&&score>=75&&(h.item.type==='worksheet'||h.item.type==='education')?420:0;
     hits.push({item:h.item,score:score+languageFit+audienceFit+populationFit+worksheetFit+Math.min(1,(h.item.original.priority||0)/1000),reason:reason});
   }
 }
 hits.sort((a,b)=>b.score-a.score||a.item.title.localeCompare(b.item.title));
 // For no direct match, no false impression that a synonym is an exact result.
 return {groups:groupResults(hits,filtered),matches:hits.length,resources:filtered.length,query:q,
   concepts:concepts.map(c=>c.label),hasDirect:strong.length>0,
   reason:qTokens.length&&!hits.length?'No indexed title or supported related concept matched.':null};
}
function typeOptions(){return NEEDS.map(x=>({value:x,label:TYPES[x]}));}
return {norm:norm,tokens:tokens,meta:meta,index:index,search:search,matchesFilters:matchesFilters,
  populationFor:populationFor,audienceFor:audienceFor,typeFor:typeFor,describe:describe,
  typeOptions:typeOptions,NEEDS:NEEDS,AUDIENCES:AUDIENCES,POPULATIONS:POPULATIONS};
});