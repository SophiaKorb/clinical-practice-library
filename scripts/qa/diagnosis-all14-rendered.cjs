'use strict';
/* 14-topic rendered source parity. Machine QA ≠ clinician endorsement or native AT. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const raw=fs.readFileSync(path.join(process.cwd(),'resources/clinical-finder-data.js'),'utf8');
const catalog=JSON.parse(raw.replace(/^globalThis\.CPLFinderData\s*=\s*/,'').replace(/;\s*$/,''));
const {runInNewContext}=require('node:vm');
const runtimeCatalog=JSON.parse(JSON.stringify(catalog));
runInNewContext(fs.readFileSync(path.join(process.cwd(),'resources/diagnoses/adult-adhd-collection/finder-overlay.js'),'utf8'),{CPLFinderData:runtimeCatalog});
runInNewContext(fs.readFileSync(path.join(process.cwd(),'resources/diagnoses/practice-labs/finder-overlay.js'),'utf8'),{CPLFinderData:runtimeCatalog});
runInNewContext(fs.readFileSync(path.join(process.cwd(),'resources/diagnoses/practice-labs/wave-2/finder-overlay.js'),'utf8'),{CPLFinderData:runtimeCatalog});
runInNewContext(fs.readFileSync(path.join(process.cwd(),'resources/diagnoses/practice-labs/wave-3/finder-overlay.js'),'utf8'),{CPLFinderData:runtimeCatalog});
assert([615,813].includes(catalog.resources.length),'Expect historical 615 or current 813 official finder source');
assert.equal(runtimeCatalog.resources.length,catalog.resources.length+57,'31 ADHD + four wave1 + twenty wave2 + two wave3 records expected');
for(const topic of catalog.facets.diagnosis){
 const initial=catalog.resources.filter(x=>(x.tags?.diagnosis||[]).includes(topic));
 const loaded=runtimeCatalog.resources.filter(x=>(x.tags?.diagnosis||[]).includes(topic));
 assert.equal(loaded.length,initial.length+(topic==='ADHD'?31:0)+({'Autism':1,'Anxiety / OCD':1,'Depression':1,'Trauma / dissociation':1}[topic]||0)+({'Learning disorders':5,'Psychosis / bipolar':5,'Substance use':5,'Grief / bereavement':5}[topic]||0)+({'Intellectual disability':1,'Eating disorders':1}[topic]||0),'Unexpected diagnosis overlay metadata: '+topic);
}
const base=process.env.CPL_QA_ORIGIN||'http://127.0.0.1:8765';
const dir=path.join(process.cwd(),'qa-artifacts/diagnosis-hubs');
fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 const details=[];
 try{
 for(const width of [1280,390,320]){
   const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
   const page=await context.newPage();const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   for(const topic of catalog.facets.diagnosis){
     const u=base+'/resources/diagnoses/index.html?topic='+encodeURIComponent(topic);
     const r=await page.goto(u,{waitUntil:'networkidle'});
     assert.equal(r.status(),200,'Diagnosis index route missing '+topic);
     await page.waitForSelector('#topic-page:not([hidden])');
     const expected=runtimeCatalog.resources.filter(item=>(item.tags?.diagnosis||[]).includes(topic)).map(x=>x.url);
     const links=await page.locator('#direct-groups .resource-list a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
     assert.deepEqual(new Set(links),new Set(expected),'Missing or extra index entry for '+topic+' at '+width);
     assert.equal(links.length,expected.length,'Duplicate index entry for '+topic+' at '+width);
     assert.equal(await page.locator('#topic-name').innerText(),topic,'Topic header mismatch');
     assert.equal(await page.locator('#adhd-focus').isVisible(),topic==='ADHD','Adult ADHD emphasis leaked to '+topic);
     const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
     assert(overflow<=2,'Horizontal overflow '+topic+' at '+width+'px: '+overflow);
     if(topic==='Trauma / dissociation'||topic==='Eating disorders'){
       await page.screenshot({path:path.join(dir,topic.startsWith('Trauma')?'trauma-390-'+width+'.png':'eating-390-'+width+'.png'),fullPage:true});
     }
     details.push({width,topic,count:expected.length,overflow});
   }
   await page.goto(base+'/resources/diagnoses/index.html',{waitUntil:'networkidle'});
   await page.waitForSelector('#topic-grid article');
   assert.equal(await page.locator('#topic-grid article').count(),14);
   await page.locator('#topic-select').focus();
   assert.equal(await page.evaluate(()=>document.activeElement.id),'topic-select','Diagnosis category select is not keyboard focusable');
   await page.goto(base+'/#diagnosis-guides',{waitUntil:'networkidle'});
   assert.equal(await page.locator('.diagnosis-card').count(),8);
   assert.equal(await page.locator('a[href="/resources/diagnoses/index.html"]').count()>0,true,'Complete index not linked from homepage');
   await page.goto(base+'/resources/clinical-topics/index.html',{waitUntil:'networkidle'});
   assert(await page.locator('a[href="/resources/diagnoses/index.html"]').count()>0,'Clinical topics entry missing');
   await page.goto(base+'/resources/diagnoses/adult-adhd.html',{waitUntil:'networkidle'});
   assert.match(await page.title(),/Adult ADHD/i);
   assert((await page.locator('meta[name="robots"]').getAttribute('content'))==='index,follow');
   assert(await page.locator('a[href="https://www.nice.org.uk/guidance/ng87/chapter/recommendations"]').count()>0,'NICE evidence link lost');
   assert.deepEqual(errors,[],'Page script errors '+width);
   await context.close();
 }
 const result={status:'PASS',scope:'Chromium 1280/390/320 CSS px, all 14 tags and exact links; excludes native screen-reader and physical-print',examined:details.length,details};
 fs.writeFileSync(path.join(dir,'complete-fourteen-report.json'),JSON.stringify(result,null,2));
 console.log('DIAGNOSIS_ALL_14_RENDERED_PASS '+JSON.stringify({examined:details.length,all14:true}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
