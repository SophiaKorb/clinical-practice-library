'use strict';
/* Independent exact-source audit: preserves every original catalog URL, and
   treats similarity, historical linking, publisher eligibility and care fit
   as distinct questions. Editorial search cases are NOT human testing. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const catalog=JSON.parse(read('resources/clinical-finder-data.js').replace(/^globalThis\.CPLFinderData\s*=\s*/,'').replace(/;\s*$/,''));
const review=require('../resources/finder-source-review.js');
const duplicates=require('../resources/finder-spanish-equivalents.js');
const engine=require('../resources/finder-lab-engine.js');
const ix=engine.index(catalog.resources),by=new Map(ix.map(it=>[it.url,it]));
assert.equal(catalog.resources.length,615);
assert.equal(ix.length,615);
assert.equal(new Set(ix.map(it=>it.url)).size,615);
assert.equal(catalog.resources.filter(r=>r.externalUrl).length,77);
assert.equal(Object.keys(review).length,108);
assert.equal(ix.filter(x=>x.reviewedSource).length,108);
assert.equal(Object.keys(duplicates).length,26);
const families=new Set(Object.values(duplicates).map(x=>x.family));
assert.equal(families.size,12);
function mainText(url){
 const s=read(url.slice(1));
 const main=s.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]||s;
 return main.replace(/<style\b[\s\S]*?<\/style>/gi,'').replace(/<script\b[\s\S]*?<\/script>/gi,'')
  .replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ')
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
}
for(const [url,detail] of Object.entries(duplicates)){
 assert(by.has(url),'Spanish variant missing from unchanged source catalog '+url);
 assert(by.has(detail.canonical),'Canonical link missing from source catalog '+url);
 assert(detail.family.startsWith('verified-spanish:'),'Unverified duplicate family');
 assert(by.get(url).family===by.get(detail.canonical).family,'Equivalence grouping not applied '+url);
 const src=read(url.slice(1));
 if(detail.status==='same-text'){
  assert.equal(mainText(url),mainText(detail.canonical),'Exact-main-text claim no longer true: '+url);
 }else if(detail.status==='older-linked'){
  assert(src.includes('Versión anterior conservada'),'Old page lacks retained-version notice '+url);
  assert(src.includes('href="'+detail.canonical+'"'),'Old page no longer links to the nominated current page '+url);
 }else assert.equal(detail.status,'preferred');
}
for(const family of families)assert.equal(Object.values(duplicates).filter(d=>d.family===family&&d.status==='preferred').length,1,
 'Every Spanish family needs exactly one preferred URL');
const separateA='/resources/es/handouts/hoja-preparacion-plan-seguridad.html';
const separateB='/resources/es/handouts/preparacion-plan-seguridad.html';
assert(!duplicates[separateA]&&!duplicates[separateB],'Same-title safety tools must not be deduplicated without exact evidence');
assert.notEqual(mainText(separateA),mainText(separateB),'Same-title safety tools may require re-review if changed');
assert.notEqual(by.get(separateA).family,by.get(separateB).family);
const sourceSignals=[
['/resources/es/handouts/guia-observacion-abc.html','una manera sencilla de observar patrones'],
['/resources/es/handouts/nino-pequeno-mas-sentimiento-que-lenguaje.html','los ninos pequenos y preescolares'],
['/resources/es/handouts/despues-escuela-aterrizar.html','una guia para padres sobre la recuperacion'],
['/resources/es/handouts/hacer-mas-segura-crisis-suicida.html','plan colaborativo de seguridad'],
['/resources/es/handouts/tarjeta-contactos-crisis.html','recorte o fotografie una tarjeta'],
['/resources/es/handouts/mi-plan-reducir-riesgos.html','elija las partes que encajen'],
['/resources/es/handouts/hacer-espacio-duelo.html','vivir con una perdida sin imponer un plazo'],
['/resources/es/handouts/planes-empezar-terminar.html','guia funcional para personas adultas'],
['/resources/es/handouts/transiciones-son-un-puente.html','una guia para padres y personas de apoyo'],
['/resources/es/handouts/mi-mapa-transicion.html','un plan sencillo para terminar una cosa'],
['/resources/es/handouts/plan-cuidado-personal.html','elija una rutina'],
['/resources/es/handouts/justicia-flexibilidad.html','una guia para adolescentes'],
['/resources/es/handouts/mi-mapa-duelo.html','use solo las partes que le sirvan'],
['/resources/es/handouts/ayudar-hermanos-conflicto.html','seguridad, justicia, limites y reparacion'],
['/resources/es/school/clinical/tdah.html','familias, gestores de casos y equipos escolares'],
['/resources/es/school/clinical/ansiedad.html','familias, gestores de casos y equipos escolares'],
['/resources/es/school/plain/ansiedad.html','no elija apoyos solo porque'],
['/resources/es/school/homeschool/derivacion.html','empiece por la funcion'],
['/resources/es/california-discapacidad-autismo-salud-conductual.html','centros regionales'],
['/resources/es/handouts/dbt-claro-util-paciente.html','paquete de hojas'],
['/resources/handouts/emotion-signals.html','a teen and adult exploration sheet'],
['/resources/handouts/making-plans-easier-to-start-and-finish.html','a functional guide for adults'],
['/resources/handouts/show-me-what-you-need.html','a simple communication board for young children'],
['/resources/handouts/helping-chores-go-more-smoothly.html','chores are learned skills'],
['/resources/handouts/instead-of-yelling.html','yelling is often a late signal'],
['/resources/handouts/suspected-opioid-overdose.html','give naloxone if available'],
['/resources/handouts/reducing-harm-when-substance-use-is-part-of-the-picture.html','a practical guide for lowering immediate risk'],
['/resources/handouts/making-sleep-more-likely.html','sleep cannot be commanded'],
['/resources/handouts/making-room-for-grief.html','without forcing a timeline'],
['/resources/handouts/when-doubt-wants-a-guarantee.html','ocd often turns ordinary uncertainty'],
['/resources/handouts/making-transitions-easier.html','a support plan for shifting activities']
];
for(const [url,signal] of sourceSignals)assert(mainText(url).includes(signal),'Claim not found in source '+url+' :: '+signal);
const school=by.get('/resources/es/school/clinical/tdah.html');
assert(school.audience.includes('caregiver')&&school.audience.includes('case_manager'));
assert(by.get('/resources/es/handouts/justicia-flexibilidad.html').population.join(',')==='teens');
const enTeen=by.get('/resources/handouts/emotion-signals.html');
assert(enTeen.population.includes('teens')&&enTeen.population.includes('adults'));
assert(!by.get('/resources/es/handouts/planes-empezar-terminar.html').population.includes('birth5'),'Adult task planning incorrectly infant-labeled');
const adult=by.get('/resources/handouts/making-plans-easier-to-start-and-finish.html');
assert.deepEqual(adult.population,['adults']);
assert(!by.get('/resources/es/handouts/reinicio-conflicto-hermanos.html').audience.includes('clinician'),'Client worksheet mislabeled clinician');
assert(!by.get('/resources/es/handouts/hoja-preparacion-plan-seguridad.html').population.includes('teens'),'Unvalidated teen eligibility');
const ageRestricted=ix.filter(x=>Number.isInteger(x.original.minimumAge)&&x.original.minimumAge>=13);
assert(ageRestricted.every(x=>!x.population.includes('children')&&!x.population.includes('birth5')),'Min-age restriction failed');
assert(!ix.find(x=>/Eldercare Locator/.test(x.title)).population.includes('birth5'));
for(const q of ['higiene','reducir daños','Apoyar la atención','transiciones son un puente']){
 const result=engine.search(ix,{q});
 assert(result.groups.length>0,'Missing Spanish search '+q);
 assert(result.groups.some(g=>g.key.startsWith('verified-spanish:')),'Duplicate group not surfaced '+q);
 const group=result.groups.find(g=>g.key.startsWith('verified-spanish:'));
 assert(group.allFamily.length>=2,'Original equivalent URLs not preserved as alternatives');
}
const originalReview=Object.keys(review);
const unclassifiedAudience=ix.filter(x=>!x.audience.length).length;
const unclassifiedPopulation=ix.filter(x=>!x.population.length&&!x.acrossAges).length;
const neutralSpanish=ix.filter(x=>x.language==='es'&&x.description.startsWith('Recurso en español')).length;
const genericEnglish=ix.filter(x=>x.language==='en'&&/^(Explore |Clinical thinking and practice resource on |School support and access resource covering |Curated publisher resource on |Printable companion for |Topic-focused resource on |Education and practical guidance on )/.test(x.description)).length;
assert(unclassifiedAudience<140&&unclassifiedPopulation<174&&neutralSpanish<97&&genericEnglish<279);
assert(read('resources/clinical-resource-finder.html').includes('src="/resources/finder-spanish-equivalents.js"'));
assert(read('resources/finder-lab.html').includes('src="/resources/finder-spanish-equivalents.js"'));
assert(!read('index.html').includes('finder-source-audit'),'No link to in-review changes on public homepage');
console.log('FINDER_SOURCE_AUDIT_PASS '+JSON.stringify({records:ix.length,reviewed:originalReview.length,duplicateGroups:families.size,duplicateURLs:Object.keys(duplicates).length,sourceSignals:sourceSignals.length,unclassifiedAudience,unclassifiedPopulation,neutralSpanish,genericEnglish}));
