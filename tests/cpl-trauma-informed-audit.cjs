// Deterministic checks for bounded trauma-informed care audit and source-only repairs.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const audit=JSON.parse(read('review-artifacts/cpl-trauma-informed-matrix.json'));
const ledger=JSON.parse(read('docs/qa/2026-11-13-trauma-informed-primary-source-ledger.json'));
assert.equal(audit.rows.length,802);
assert.equal(audit.rows.filter(r=>r.format==='HTML').length,741);
assert.equal(audit.rows.filter(r=>r.format==='PDF').length,61);
assert.equal(ledger.records.length,7);
assert.equal(ledger.overallClinicalApproved,false);
assert.equal(ledger.overallPublicationApproved,false);
assert.ok(ledger.records.every(r=>r.sourceUrl&&r.publisher&&r.sourceDateMeaning&&r.result&&r.limits&&
 r.clinicalApproved===false&&r.rightsApproved===false&&r.publicationApproved===false));
assert.ok(audit.rows.every(r=>r.clinicalApproval==='PENDING_HUMAN'&&r.rightsApproval==='PENDING_HUMAN'&&r.releaseApproval==='NOT_AUTHORIZED'));
const changed=[
'resources/trauma/start-here-families-children-trauma.html',
'resources/trauma/children-families-trauma-curated-clinical-guide.html',
'resources/trauma/trauma-school-neurodevelopment-crosswalk.html',
'resources/trauma/caregiver-family-youth-trauma-resources.html',
'resources/trauma/foster-kinship-adoption-child-welfare.html',
'resources/therapy/trauma-ptsd-practical-toolkit.html',
'resources/handouts/grounding.html',
'resources/handouts/my-grounding-menu.html'
];
for(const p of changed){
 const s=read(p);
 assert.match(s,/<body><a class="cpl-skip" href="#main-content">Skip to main content<\/a><header class="resource-topbar">/);
 assert.match(s,/<main id="main-content" tabindex="-1" class="resource-page/);
 assert.equal((s.match(/id="main-content"/g)||[]).length,1);
 assert.equal((s.match(/<h1\b/g)||[]).length,1);
 assert.match(s,/<link rel="stylesheet" href="\/resources\/resource.css">/);
 const row=audit.rows.find(x=>x.path==='/'+p);
 assert.ok(row&&row.category==='DIRECT_TRAUMA_CANDIDATE'&&row.skipLinkRecognized===true);
}
const css=read('resources/resource.css');
assert.match(css,/\.cpl-skip:focus\{/);
assert.match(css,/@media print\{\.cpl-skip\{display:none!important\}\}/);
console.log('PASS 802-file trauma-informed triage, seven uncleared source records, and eight verified first-tab source contracts');
