'use strict';
/* Editorial Spanish natural-language journey fixtures. Written during implementation:
   this verifies deterministic search behavior, NOT real-user task success,
   independently validated treatment fit, or a clinical safety decision. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=x=>fs.readFileSync(path.join(root,x),'utf8');
const orig=JSON.parse(read('resources/clinical-finder-data.js').replace(/^globalThis\.CPLFinderData\s*=\s*/,'').replace(/;\s*$/,''));
const engine=require('../resources/finder-lab-engine.js'),indexed=engine.index(orig.resources);
const expected=[
 {q:'mi adolescente siente que todo es injusto',filters:{population:'teens',audience:'client'},match:'/resources/es/handouts/justicia-flexibilidad.html'},
 {q:'mis hijos se pelean y uno tiene miedo',filters:{population:'children',audience:'caregiver'},match:'/resources/es/handouts/ayudar-hermanos-conflicto.html'},
 {q:'mi hijo se descontrola al salir de la escuela',filters:{population:'children',audience:'caregiver'},match:'/resources/es/handouts/despues-escuela-aterrizar.html'},
 {q:'necesito apoyo para que mi niño hable sin hablar',filters:{population:'birth5',audience:'caregiver'},match:'/resources/es/handouts/muestrame-lo-que-necesitas.html'},
 {q:'necesito una hoja de observación del comportamiento',filters:{audience:'caregiver'},match:'/resources/es/handouts/guia-observacion-abc.html'},
 {q:'quiero pedir una evaluación en escuela por dislexia',filters:{population:'children',audience:'caregiver'},match:'/resources/es/arizona-como-conseguir-iep-504.html'},
 {q:'estoy en Tucson y mi niño de dos años no habla',filters:{population:'birth5',audience:'case_manager'},match:'/resources/birth-to-five/tucson-pima-local-resources.html'},
 {q:'mis emociones cambian y no encuentro palabras',filters:{audience:'client'},match:'/resources/es/handouts/nota-antes-de-ponerle-nombre.html'},
 {q:'mi hija siente que todos se burlan de ella',filters:{population:'children',audience:'caregiver'},match:'/resources/es/handouts/amistad-seguridad-pares.html'},
 {q:'dolor al lavarse los dientes y dificultad higiene',filters:{audience:'client'},match:'/resources/es/handouts/higiene-dificil.html'},
 {q:'se me olvida todo cuando intento empezar tareas',filters:{population:'adults',audience:'client'},match:'/resources/es/handouts/planes-empezar-terminar.html'}
];
const outcomes=expected.map(j=>{
 const result=engine.search(indexed,{q:j.q,...j.filters});
 const rank=result.groups.findIndex(g=>g.best.item.url===j.match)+1;
 assert(rank>0&&rank<=5,'Missing narrow source-grounded Spanish target: '+JSON.stringify({q:j.q,rank,n:result.matches,top:result.groups.slice(0,5).map(g=>g.best.item.title)}));
 const actual=result.groups[rank-1].best.item;
 assert(!actual.isExternal||j.match.includes('community'),'Search result is not a verified referral');
 assert(actual.population.length===0||!j.filters.population||actual.population.includes(j.filters.population),'Filter age mismatch '+j.q);
 assert(actual.audience.length===0||!j.filters.audience||actual.audience.includes(j.filters.audience),'Filter audience mismatch '+j.q);
 return {q:j.q,rank,total:result.matches,primary:result.groups[0]?.best.item.title};
});
const oldEnglish=[
 ['IEP','/resources/arizona/iep-504-parent-guide.html'],
 ['family needs Spanish IEP guide','/resources/es/arizona-como-conseguir-iep-504.html'],
 ['nonverbal autistic child needs ways to choose','/resources/therapy/communication-supports-toolkit.html'],
 ['dissociation grounding','/resources/handouts/grounding.html'],
 ['autistic child being bullied in school','/resources/handouts/friendship-peer-safety-family-guide.html']
];
for(const [q,target] of oldEnglish)assert(engine.search(indexed,{q}).groups.slice(0,5).some(g=>g.best.item.url===target),'Earlier English/Spanish regression '+q);
assert(engine.search(indexed,{q:'nonexistent-severe-clinical-problem-xyz'}).matches===0,'Never fabricate hits');
console.log('CPL_SPANISH_JOURNEYS_PASS '+JSON.stringify({editorialCases:expected.length,top1:outcomes.filter(x=>x.rank===1).length,top5:outcomes.filter(x=>x.rank<=5).length,notes:'Not observed user success or service eligibility',outcomes}));
