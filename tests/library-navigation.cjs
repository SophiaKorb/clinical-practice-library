// Navigation contract: deep-link traversal into closed native disclosure shelves.
const assert=require('node:assert/strict'),fs=require('node:fs');
const h=fs.readFileSync('library.html','utf8'),css=fs.readFileSync('index.css','utf8');
for(const id of ['shelves','find','about','school','state-iep-guides','parent-patient','therapist']) assert.ok(h.includes('id="'+id+'"'),'Missing navigation destination '+id);
for(const id of ['shelves','find','about']) assert.ok(h.includes('href="#'+id+'"'),'Header link missing '+id);
assert.match(h,/window\.addEventListener\('hashchange', revealFragment\)/);
assert.match(h,/window\.addEventListener\('pageshow', revealFragment\)/);
assert.match(h,/ancestor\.tagName === 'DETAILS'\) ancestor\.open = true/);
assert.match(h,/target\.scrollIntoView/);
assert.match(h,/class="state-guide-links"/);
assert.match(css,/\.state-guide-links\{/);
assert.match(css,/@media\(max-width:700px\)\{\.state-guide-links\{grid-template-columns:1fr/);
console.log('PASS: Disclosed navigation targets and responsive state navigation contract.');