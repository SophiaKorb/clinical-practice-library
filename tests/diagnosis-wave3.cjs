'use strict';
/* Wave 3 static contract — never clinical validation. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const canonical=read('resources/clinical-finder-data.js');const blob=crypto.createHash('sha1').update('blob '+Buffer.byteLength(canonical)+'\0'+canonical).digest('hex');
assert.equal(blob,'a17555746c8a76f41cb2d2b234e4586ee46e5465','Canonical 813-source blob changed');
const data=JSON.parse(canonical.replace(/^globalThis\.CPLFinderData\s*=\s*/,'').replace(/;\s*$/,''));assert.equal(data.resources.length,813);
const initial=JSON.stringify(data.resources);
const ctx={CPLFinderData:data};
const prior=['resources/diagnoses/adult-adhd-collection/finder-overlay.js','resources/diagnoses/practice-labs/finder-overlay.js','resources/diagnoses/practice-labs/wave-2/finder-overlay.js'];
for(const p of prior)vm.runInNewContext(read(p),ctx);
assert.equal(data.resources.length,868,'Preserve all earlier index overlays');
const retained=JSON.stringify(data.resources);const overlay='resources/diagnoses/practice-labs/wave-3/finder-overlay.js';
vm.runInNewContext(read(overlay),ctx);assert.equal(data.resources.length,870,'Two distinct additional records required');
assert.equal(JSON.stringify(data.resources.slice(0,868)),retained,'Earlier overlays were mutated');
assert.equal(JSON.stringify(data.resources.slice(0,813)),initial,'Canonical catalog entries were overwritten');
vm.runInNewContext(read(overlay),ctx);assert.equal(data.resources.length,870,'New overlay must be idempotent');
const base='resources/diagnoses/practice-labs/wave-3/';const entries=[['supported-choice','Intellectual disability'],['medical-first','Eating disorders']];
for(const [slug,diagnosis] of entries){const url='/'+base+slug+'.html',rec=data.resources.find(x=>x.url===url),html=read(base+slug+'.html');assert(rec,'Missing indexed lab '+slug);assert.deepEqual([...rec.tags.diagnosis],[diagnosis]);assert.deepEqual([...rec.tags.stage],['Across ages / adapt to person']);for(const [facet,vals] of Object.entries(rec.tags)){assert(vals.length>0&&vals.every(v=>data.facets[facet].includes(v)),'Unsupported facet value '+slug+' '+facet)}
 assert(html.includes('name="robots" content="noindex"')&&html.includes('id="main"')&&html.includes('class="skip"'),'Accessible noindex scaffold '+slug);assert.equal((html.match(/data-lens="/g)||[]).length,4,'Four choice buttons '+slug);assert.equal((html.match(/data-lens-panel="/g)||[]).length,4,'Four selection panels '+slug);assert.equal((html.match(/class="sheet"/g)||[]).length,2,'Two blank print sheets '+slug);assert.equal((html.match(/class="write-lines"/g)||[]).length,10,'Ten prompts '+slug);assert(html.includes('Fictional case')&&html.includes('aria-pressed')&&html.includes('aria-live'),'Case and keyboard/AX scaffold '+slug);assert(html.includes('Clinical guide')&&html.includes('Case-management guide'),'Role-appropriate navigation '+slug);assert(!/localStorage|sessionStorage|fetch\s*\(|XMLHttpRequest|<input\b|<form\b|contenteditable/i.test(html),'Unexpected client data feature '+slug);assert(!/review-only branch|do not merge|QA checkpoint|draft PR/i.test(html),'Internal QA jargon exposed '+slug);
 for(const page of ['resources/diagnoses/comprehensive/'+(slug==='medical-first'?'eating-disorders':'intellectual-disability')+'.html','resources/diagnoses/comprehensive/case-management/'+(slug==='medical-first'?'eating-disorders':'intellectual-disability')+'.html','resources/diagnoses/comprehensive/index.html','resources/diagnoses/practice-labs/index.html'])assert(read(page).includes(url),'Required inbound route missing '+page);
}
for(const p of ['resources/clinical-resource-finder.html','resources/diagnoses/index.html']){const h=read(p),original=h.indexOf('/resources/diagnoses/practice-labs/wave-2/finder-overlay.js'),newIndex=h.indexOf('/resources/diagnoses/practice-labs/wave-3/finder-overlay.js');assert(original>=0&&newIndex>original,'Overlay loading order '+p)}
const js=read(base+'visual-lab.js');assert(js.includes('aria-pressed')&&js.includes('data-lens-panel'),'Selected state is not accessible');assert(!/localStorage|sessionStorage|fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon/.test(js),'Visual selection must remain entirely local and non-persistent');
const css=read(base+'style.css');assert(css.includes('@media print')&&css.includes('forced-colors'),'Print and high contrast styles missing');
console.log('DIAGNOSIS_WAVE3_STATIC_PASS '+JSON.stringify({canonical:813,retainedOverlay:55,newRecords:2,runtime:870,labs:2,choices:8,printSheets:4,blankPrompts:20}));
