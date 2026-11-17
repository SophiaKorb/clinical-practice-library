'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),base='resources/diagnoses/comprehensive/';
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const canonical=read('resources/clinical-finder-data.js');
const data=JSON.parse(canonical.replace(/^globalThis\.CPLFinderData\s*=\s*/,'').replace(/;\s*$/,''));
const blob=s=>crypto.createHash('sha1').update('blob '+Buffer.byteLength(s)+'\0'+s).digest('hex');
assert.equal(blob(canonical),'93105c462d65d0b7766cc84564264ed345379fb7','Protected finder must remain unchanged');
assert.equal(data.resources.length,615,'Do not add to or modify published finder dataset');
const map={
'ADHD':'/resources/diagnoses/adult-adhd.html',
'Autism':'/resources/diagnoses/comprehensive/autism.html',
'Anxiety / OCD':'/resources/diagnoses/comprehensive/anxiety-ocd.html',
'Depression':'/resources/diagnoses/comprehensive/depression.html',
'Trauma / dissociation':'/resources/diagnoses/comprehensive/trauma-dissociation.html',
'Learning disorders':'/resources/diagnoses/comprehensive/learning-disorders.html',
'Psychosis / bipolar':'/resources/diagnoses/comprehensive/psychosis-bipolar.html',
'Substance use':'/resources/diagnoses/comprehensive/substance-use.html',
'Persistent conflict':'/resources/diagnoses/comprehensive/persistent-conflict.html',
'Eating disorders':'/resources/diagnoses/comprehensive/eating-disorders.html',
'Tic / repetitive behavior conditions':'/resources/diagnoses/comprehensive/tic-repetitive-behavior.html',
'Intellectual disability':'/resources/diagnoses/comprehensive/intellectual-disability.html',
'Sleep conditions':'/resources/diagnoses/comprehensive/sleep-conditions.html',
'Grief / bereavement':'/resources/diagnoses/comprehensive/grief-bereavement.html'};
const keys=data.facets.diagnosis;
assert.equal(keys.length,14);assert.deepEqual(new Set(keys),new Set(Object.keys(map)),'All original diagnosis categories must have a guide');
const index=read(base+'index.html'),hub=read('resources/diagnoses/index.html'),script=read('resources/diagnoses/diagnosis-hubs.js');
assert(index.includes('id="main"')&&index.includes('href="/resources/diagnoses/index.html"'));
assert(hub.includes('href="/resources/diagnoses/comprehensive/index.html"'),'Missing index discovery');
assert(script.includes('comprehensiveGuideRoutes'),'Missing dynamic topic guide link');
const slugs=['autism','anxiety-ocd','depression','trauma-dissociation','learning-disorders','psychosis-bipolar','substance-use','persistent-conflict','eating-disorders','tic-repetitive-behavior','intellectual-disability','sleep-conditions','grief-bereavement','dyslexia','dyscalculia','dysgraphia'];
let checked=0,internal=0,fragments=0,external=0,forms=0,issues=[];
for(const slug of slugs){
 const p=base+slug+'.html',html=read(p);
 assert(html.length>5000,'Guide too short to provide clinical depth: '+slug);
 assert(html.includes('<main id="main"')&&html.includes('<h1>')&&html.includes('name="viewport"')&&html.includes('class="skip"'),'Page skeleton '+slug);
 assert(html.includes('window.print()')&&html.includes('class="worksheet"'),'Worksheet/print missing '+slug);
 const sourceLinks=(html.match(/href="https:\/\//g)||[]).length;assert(sourceLinks>=1,'No primary guideline source '+slug);external+=sourceLinks;
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'Duplicate anchors '+slug);
 for(const m of html.matchAll(/href="([^"]+)"/g)){
  const dest=m[1];if(dest.startsWith('#')){assert(ids.includes(dest.slice(1)),'Broken fragment '+slug+' '+dest);fragments++;continue;}
  if(dest.startsWith('https://'))continue;
  if(dest.startsWith('/')){
   const rel=decodeURI(dest.split(/[?#]/)[0].slice(1));
   let pth=path.join(root,rel);if(!fs.existsSync(pth))pth=path.join(root,rel,'index.html');
   assert(fs.existsSync(pth),'Missing internal link '+slug+' '+dest);internal++;
  }
 }
 if(slug==='eating-disorders')assert(html.includes('medical')&&html.includes('stabili'),'Medical stabilization gate absent');
 if(slug==='persistent-conflict')assert(html.includes('not a')||html.includes('not automatically'),'Conflict diagnostic caution missing');
 if(slug==='sleep-conditions')assert(html.includes('bipolar')&&html.includes('CBT-I'),'CBT-I mood caution missing');
 if(slug==='intellectual-disability')assert(html.includes('autonomy')||html.includes('choice'),'Supported decision making absent');
 if(slug==='learning-disorders')for(const p of ['dyslexia','dyscalculia','dysgraphia'])assert(index.includes('/'+p+'.html'),'Missing distinct learning link '+p);
 checked++;
}
for(const [topic,url]of Object.entries(map)){assert(script.includes(JSON.stringify(topic)+':'+JSON.stringify(url)),'Topic not mapped '+topic);assert(index.includes('href="'+url+'"'),'Index lacks '+topic);}
assert.equal(checked,16);
console.log('COMPREHENSIVE_DIAGNOSIS_QA_PASS',JSON.stringify({guides:checked,topics:keys.length,sourceLinks:external,internalLinks:internal,fragments:fragments,originalFinderRecords:data.resources.length,originalFinderSha:blob(canonical)}));
