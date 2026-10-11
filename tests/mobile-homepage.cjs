/* Mobile homepage: fewer visible choices without dropping navigation or content. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const homepage=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('resources/library-index.css','utf8');
assert.match(homepage, /class="lede desktop-lede"/);
assert.match(homepage, /class="lede mobile-lede"/);
assert.match(homepage, /class="mobile-hero-actions"/);
assert.match(homepage, /class="mobile-find" href="\/resources\/start-here\.html"/);
assert.match(homepage, /class="mobile-browse" href="\/resources\/clinical-resource-finder\.html"/);
assert.match(homepage, /<nav class="clinical-pathway-links" aria-label="Clinical pathway">/);
assert.match(homepage, /<nav class="index-nav" aria-label="Library subjects">/);
const nav=homepage.match(/<nav class="index-nav" aria-label="Library subjects">([\s\S]*?)<\/nav>/);
assert.ok(nav);
assert.equal((nav[1].match(/<a href="#/g)||[]).length,13,'preserved all desktop subject-jump links');
for (const id of ['shelves','clinical-topics','therapist','visual-tools','assessments','school','diagnosis-guides','espanol']) {
 assert.ok(homepage.includes('id="'+id+'"'),'section still exists: '+id);
}
assert.ok(homepage.includes('class="shelf expandable-shelf'),'mobile uses native detail/summary shelves');
const phone=css.slice(css.indexOf('/* Mobile entry view:'));
assert.ok(phone.includes('@media screen and (max-width:700px)'));
assert.ok(phone.includes('.hero>.catalog-links,.hero>.clinical-pathway-links,.hero>.index-nav'));
assert.match(phone,/display:none!important/);
assert.ok(phone.includes('.hero .mobile-lede'));
assert.ok(phone.includes('.mobile-hero-actions{display:flex'));
assert.ok(phone.includes('.shelf.expandable-shelf:not([open])>summary .shelf-main>p{display:none}'));
assert.ok(phone.includes('min-height:44px'));
console.log('PASS phone homepage: one concise CTA area, hidden repeated navigation, desktop links preserved, mobile expandable shelves.');
