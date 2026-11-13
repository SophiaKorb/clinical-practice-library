// Verify guide first-tab bypass and preserve content-related source invariants.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const routes=[
  "guides/adhd.html",
  "guides/anxiety.html",
  "guides/arizona-school-support-process.html",
  "guides/autism.html",
  "guides/depression.html",
  "guides/dyscalculia.html",
  "guides/dysgraphia.html",
  "guides/dyslexia.html",
  "guides/odd-persistent-conflict-behavior.html"
];
assert.equal(routes.length,9);
for(const route of routes){
 const s=fs.readFileSync(route,'utf8');
 assert.equal((s.match(/class="cpl-skip"/g)||[]).length,1,'One skip link per guide: '+route);
 assert.match(s,/<a class="cpl-skip" href="#main-content">Skip to guide content<\/a><header class="topbar">/,'Bypass precedes sticky header '+route);
 assert.match(s,/<main id="main-content" tabindex="-1" class="guide">/,'Focusable main '+route);
 assert.equal((s.match(/<h1\b/g)||[]).length,1,'Exactly one H1 '+route);
 assert.ok(s.includes('href="guide.css"')||s.includes('href="/guides/guide.css"'),'Expected shared CSS '+route);
}
const css=fs.readFileSync('guides/guide.css','utf8');
assert.match(css,/\.cpl-skip:focus-visible,\.cpl-skip:focus\{/,'Focusable skip styling absent');
assert.match(css,/@media print\{\.cpl-skip\{display:none!important\}\}/,'Skip hidden in print');
const tableRoutes=[
 'guides/arizona-school-support-process.html',
 'guides/depression.html','guides/dyscalculia.html','guides/dysgraphia.html','guides/dyslexia.html','guides/odd-persistent-conflict-behavior.html'];
for(const route of tableRoutes){
 const s=fs.readFileSync(route,'utf8');
 assert.equal((s.match(/class="generic-table-wrap" role="region" tabindex="0" aria-label="School support wording worksheet table"/g)||[]).length,1,'Missing keyboard-scrollable worksheet '+route);
}
assert.match(css,/--muted:#435c4e/,'Readable small-text shared ink must be retained');
assert.match(css,/\.page-shell > \.guide\{min-width:0;max-width:100%\}/,'Responsive shrink guard must remain');
console.log('PASS nine school guides: first-tab bypass, six keyboard tables, safer contrast, focusable main and print style');
