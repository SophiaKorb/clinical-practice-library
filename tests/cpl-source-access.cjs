// Structural safety and provenance boundaries for six unchanged-content QA fixes.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const ledger=JSON.parse(fs.readFileSync('docs/qa/2026-11-12-primary-source-ledger.json','utf8'));
assert.equal(ledger.checkedOn,'2026-11-12');
assert.equal(ledger.records.length,7);
assert.ok(ledger.records.every(r=>r.cplFile&&r.sourceUrl&&r.sourceOwner&&r.retrieval&&r.clinicalApproved===false&&r.rightsCleared===false),'Ledger overclaims approval');
assert.equal(ledger.records.filter(r=>r.retrieval==='access-restricted-403').length,1);
for(const path of [
 'resources/handouts/making-a-suicide-crisis-safer.html',
 'resources/handouts/suspected-opioid-overdose.html',
 'resources/handouts/safety-planning-preparation-sheet.html',
 'resources/assessment/assessment-start-here.html',
 'resources/es/handouts/hacer-crisis-suicida-mas-segura.html',
 'resources/es/handouts/hacer-mas-segura-crisis-suicida.html'
]){
 const s=fs.readFileSync(path,'utf8');
 assert.match(s,/<body><a class="cpl-skip" href="#main-content">/,'First-tab skip missing '+path);
 assert.match(s,/<main id="main-content" tabindex="-1" class="resource-page"/,'Focusable main missing '+path);
 assert.ok(s.includes('<h1>'),'Heading missing '+path);
 if(path.includes('/es/'))assert.match(s,/<html lang="es">/);
}
const styles=fs.readFileSync('resources/resource.css','utf8');
assert.match(styles,/\.cpl-skip:focus\{/,'Visible focus style missing');
assert.match(styles,/@media print\{\.cpl-skip\{display:none!important\}\}/,'Skip must be hidden on print');
console.log('PASS 6 source-preserving skip repairs and 7-source provenance ledger approval boundaries');
