'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const base='resources/diagnoses/comprehensive/case-management/';
const slugs=['adhd','autism','anxiety-ocd','depression','trauma-dissociation','learning-disorders','psychosis-bipolar','substance-use','persistent-conflict','eating-disorders','tic-repetitive-behavior','intellectual-disability','sleep-conditions','grief-bereavement'];
const index=read(base+'index.html');
const collection=read('resources/diagnoses/comprehensive/index.html');
const hubScript=read('resources/diagnoses/diagnosis-hubs.js');
assert(collection.includes('/resources/diagnoses/comprehensive/case-management/index.html'),'Main clinical depth index must link case management');
assert(index.includes('id="main"')&&index.includes('name="viewport"'),'Missing case manager index scaffold');
for(const slug of slugs){
 const rel=base+slug+'.html',html=read(rel);
 assert(index.includes('href="'+slug+'.html"'),'Missing condition navigation '+slug);
 assert(hubScript.includes('/resources/diagnoses/comprehensive/case-management/'+slug+'.html'),'Diagnosis index missing CM route '+slug);
 assert(html.includes('name="viewport"')&&html.includes('<main')&&html.includes('</html>'),'Missing HTML scaffold '+slug);
 assert(html.includes('class="skip"')&&html.includes('id="main"'),'Missing keyboard skip '+slug);
 assert(html.includes('class="worksheet"')&&html.includes('window.print()'),'Missing printable client worksheet '+slug);
 assert(html.includes('Case management boundaries'),'Role boundary not visible '+slug);
 assert(html.includes('qualified')||html.includes('clinical'),'Missing clinical referral guard '+slug);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'Repeated HTML ID '+slug);
 for(const m of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(m[1]),'Broken fragment '+slug+' #'+m[1]);
 for(const m of html.matchAll(/href="(\/resources\/[^"#?]+)"/g)){const route=m[1].slice(1);assert(fs.existsSync(path.join(root,route)),'Missing local destination '+slug+': '+m[1]);}
}
const f=read('resources/clinical-finder-data.js');
const blob=crypto.createHash('sha1').update('blob '+Buffer.byteLength(f)+'\0'+f).digest('hex');
assert.equal(blob,'93105c462d65d0b7766cc84564264ed345379fb7','Protected 615-entry finder was altered');
const data=JSON.parse(f.replace(/^globalThis\.CPLFinderData\s*=\s*/,'').replace(/;\s*$/,''));
assert.equal(data.resources.length,615);
console.log('CONDITION_CASE_MANAGEMENT_QA_PASS '+JSON.stringify({sheets:slugs.length,originalFinder:data.resources.length}));
