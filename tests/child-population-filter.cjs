'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {matchesAge,ageFor,search,decode}=require('../resources/clinical-finder.js');
globalThis.CPLFinderData=undefined;
require('../resources/clinical-finder-data.js');
const {resources,facets}=globalThis.CPLFinderData;
const find=url=>{const r=resources.find(x=>x.url===url);assert(r,'Missing fixture '+url);return r};
const examples={
 clinician:'/resources/clinical-depth/child-caregiver-treatment-selection.html',
 school:'/resources/school/clinical/adhd.html',
 caregiver:'/resources/clinical-topics/child-grief-continuing-bonds/care-partner.html',
 directlyChild:'/resources/handouts/show-me-what-you-need.html',
 caseManager:'/resources/clinical-topics/child-grief-continuing-bonds/support-map.html',
 acrossAges:'/resources/therapy/communication-supports-toolkit.html',
 adult:'/resources/clinical-topics/adult-adhd-task-starts/client-workbook.html',
 teen:'/resources/handouts/fairness-and-flexibility.html'
};
for(const key of ['clinician','school','caregiver','directlyChild','caseManager','acrossAges'])assert(matchesAge(find(examples[key]),'children'),'Child search omitted '+key);
assert(!matchesAge(find(examples.adult),'children'),'Child search included adult-specific workbook');
assert(matchesAge(find(examples.acrossAges),'teens'),'Cross-age tool missing from teen search');
assert(matchesAge(find(examples.acrossAges),'adults'),'Cross-age tool missing from adult search');
assert(matchesAge(find(examples.teen),'teens'),'Teen-specific guide missing');
assert(matchesAge(find(examples.caregiver),'teens'),'Adolescent family clinical resource missing');
assert(matchesAge(find(examples.adult),'adults'),'Adult-specific workbook missing');
assert.equal(ageFor(find(examples.clinician)),'','Professional guidance must not be labeled child-facing');
assert.equal(ageFor(find(examples.directlyChild)),'children','Directly child-facing label missing');
const childResources=resources.filter(r=>matchesAge(r,'children'));
assert(childResources.length>100,'Child search unexpectedly narrow: '+childResources.length);
const clinicalCount=childResources.filter(r=>(r.tags.role||[]).includes('Clinician')).length;
assert(clinicalCount>=20,'Expected professional resources in child search: '+clinicalCount);
const state=decode(new URLSearchParams('role=Clinician'),facets);
const clinicalChild=search(resources,state).filter(r=>matchesAge(r,'children'));
assert(clinicalChild.some(r=>r.url===examples.clinician),'Clinical role and child population filters must compose');
const cmState=decode(new URLSearchParams('role=Staff+%2F+case+manager'),facets);
const cmChild=search(resources,cmState).filter(r=>matchesAge(r,'children'));
assert(cmChild.some(r=>r.url===examples.caseManager),'Case-manager and child filters must compose');
console.log('Population filter QA passed: '+childResources.length+' child-relevant resources, '+clinicalCount+' clinician-tagged, role composition and direct-facing badge separation.');
