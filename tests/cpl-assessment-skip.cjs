// Source-preserving keyboard bypass invariant for the 14 assessed resource templates.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const routes=[
  "resources/assessment/adhd-autism-trauma-differential-matrix.html",
  "resources/assessment/broad-intake-depression-anxiety-outcomes.html",
  "resources/assessment/broad-intake-form-downloads.html",
  "resources/assessment/free-official-measure-source-guide.html",
  "resources/assessment/functioning-disability-formal-testing.html",
  "resources/assessment/functioning-formal-testing-downloads.html",
  "resources/assessment/ocd-bipolar-psychosis-substance-use-form-downloads.html",
  "resources/assessment/ocd-bipolar-psychosis-substance-use.html",
  "resources/assessment/pediatric-developmental-form-downloads.html",
  "resources/assessment/pediatric-developmental-neurodevelopmental.html",
  "resources/assessment/spanish-assessment-forms.html",
  "resources/assessment/trauma-ptsd-dissociation-safety.html",
  "resources/assessment/trauma-safety-form-downloads.html",
  "resources/es/formularios-oficiales-evaluacion.html"
];
assert.equal(routes.length,14);
for(const route of routes){
 const html=fs.readFileSync(route,'utf8'),es=route.includes('/es/');
 assert.equal((html.match(/class="cpl-skip"/g)||[]).length,1,'Skip count '+route);
 assert.match(html,/<body><a class="cpl-skip" href="#main-content">/,'First-tab skip absent '+route);
 assert.match(html,/<main id="main-content" tabindex="-1" class="resource-page">/,'Focusable main absent '+route);
 assert.match(html,/<link rel="stylesheet" href="\/resources\/resource.css">/,'Shared skip CSS absent '+route);
 assert.ok(html.includes(es?'Ir al contenido principal':'Skip to main content'),'Wrong skip language '+route);
 assert.equal((html.match(/<h1\b/g)||[]).length,1,'Missing or duplicate H1 '+route);
}
const css=fs.readFileSync('resources/resource.css','utf8');
assert.match(css,/\.cpl-skip:focus\{/,'Shared visible focus rule missing');
assert.match(css,/@media print\{\.cpl-skip\{display:none!important\}\}/,'Skip must not print');
console.log('PASS: 14 assessment and Spanish official-measure pages have localized focusable skip targets');
