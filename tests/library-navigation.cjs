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
for(const [page,stylesheet] of [['index.html','preview/cpl2.css'],['library.html','index.css']]){const html=fs.readFileSync(page,'utf8'),style=fs.readFileSync(stylesheet,'utf8');assert.ok(html.includes('class="skip-link" href="#main-content"'),page+' missing skip link');assert.ok(html.includes('<main id="main-content">'),page+' missing main destination');assert.match(style,/\.skip-link:focus/,stylesheet+' missing visible skip style');}
assert.ok(h.includes('class="single-resource"'),'Missing direct single-link navigation');assert.ok(!h.includes('<summary>Start Here</summary><div class="topic-body plain-resource-list"><a'),'Single-link Start Here should not require expanding');assert.match(css,/\.single-resource>a/);assert.match(css,/overflow-wrap:anywhere/);const start=fs.readFileSync('resources/trauma/start-here-families-children-trauma.html','utf8');const resourceCss=fs.readFileSync('resources/resource.css','utf8');assert.ok(start.includes('start-here-page'));assert.match(resourceCss,/\.start-here-page h1/);console.log('PASS: Disclosed navigation targets and responsive state navigation contract.');