'use strict';
/* Browser-level canonical finder release smoke, preserving historic URL contracts. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
const base=process.env.CPL_QA_ORIGIN||'http://127.0.0.1:8765';
const dir=path.join(process.cwd(),'qa-artifacts/pr43/finder-release');
fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 const checks=[];
 try{
  for(const width of [1280,390,320]){
   const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
   const page=await context.newPage();
   const exceptions=[];page.on('pageerror',e=>exceptions.push(e.message));
   let response=await page.goto(base+'/resources/clinical-resource-finder.html?q=IEP',{waitUntil:'networkidle'});
   assert.equal(response.status(),200,'Canonical route unavailable');
   await page.waitForSelector('.result-card h3 a');
   assert(/IEP/i.test(await page.locator('.result-card h3 a').first().innerText()),'IEP search not leading relevant resources');
   assert((await page.locator('#lab-status').innerText()).includes('11 matching resources'),'Legacy IEP noise not resolved');
   assert.equal(await page.title(),'Find clinical resources | Clinical Practice Library');
   assert(await page.locator('a[href="/resources/clinical-resource-finder-classic.html"]').count()>0,'Classic route link absent');
   assert(await page.locator('a[href="/resources/birth-to-five/index.html"]').count()>0,'Birth–5 link absent');
   await page.screenshot({path:path.join(dir,'canonical-iep-'+width+'.png'),fullPage:true});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert(overflow<=2,'Horizontal overflow at '+width+': '+overflow);
   await page.reload({waitUntil:'networkidle'});
   assert.equal(await page.inputValue('#lab-q'),'IEP','Search state lost on reload');
   await page.goto(base+'/resources/clinical-resource-finder.html?age=children',{waitUntil:'networkidle'});
   assert.equal(await page.inputValue('#lab-population'),'children','Legacy child population URL broken');
   await page.goto(base+'/resources/clinical-resource-finder.html?child=1',{waitUntil:'networkidle'});
   assert.equal(await page.inputValue('#lab-population'),'children','Legacy child=1 URL broken');
   await page.goto(base+'/resources/clinical-resource-finder.html?age=birth5&role=Clinician',{waitUntil:'networkidle'});
   assert.equal(await page.inputValue('#lab-population'),'birth5','Birth–5 old URL not recognized');
   assert.equal(await page.inputValue('#lab-audience'),'clinician','Clinician old role not mapped');
   assert((await page.locator('#lab-status').innerText()).includes('matching resources'),'Birth5 clinician search empty');
   await page.goto(base+'/resources/clinical-resource-finder.html?age=children&role=Client%20%2F%20caregiver',{waitUntil:'networkidle'});
   assert((await page.locator('#active-filters').innerText()).includes('Legacy client/caregiver'),'Combined original audience not preserved');
   assert(await page.locator('.result-card').count()>0,'Combined original audience returned no results');
   await page.locator('#lab-clear').click();
   assert(!(await page.url()).includes('role='),'Legacy filter not cleared');
   await page.goto(base+'/resources/clinical-resource-finder.html?step=Understanding&symptom=Communication%20difficulty&stage=School%20age%20%2F%20adolescence',{waitUntil:'networkidle'});
   assert.equal(await page.inputValue('#lab-step'),'Understanding','Legacy step not honored');
   assert.equal(await page.inputValue('#lab-symptom'),'Communication difficulty','Legacy symptom not honored');
   assert.equal(await page.inputValue('#lab-stage'),'School age / adolescence','Legacy stage not honored');
   await page.goto(base+'/resources/clinical-resource-finder.html?q=Eon&age=children',{waitUntil:'networkidle'});
   assert.equal(await page.locator('.result-card').count(),0,'Teen-only Eon service returned for children');
   await page.selectOption('#lab-population','teens');
   assert(await page.locator('.result-card').count()>0,'Teen eligibility route missing for Eon');
   await page.goto(base+'/resources/clinical-resource-finder.html?q=tantrums',{waitUntil:'networkidle'});
   assert(/Child aggression/.test(await page.locator('.result-card h3 a').first().innerText()),'Conversational search failed');
   await page.goto(base+'/resources/clinical-resource-finder-classic.html?q=IEP',{waitUntil:'networkidle'});
   await page.waitForSelector('.finder-card');
   assert(await page.locator('.finder-card').count()>0,'Preserved classic finder not functional');
   await page.goto(base+'/resources/clinical-resource-finder.html',{waitUntil:'networkidle'});
   await page.locator('#lab-q').focus();
   assert.equal(await page.evaluate(()=>document.activeElement.id),'lab-q','Search input focus missing');
   await page.keyboard.press('Tab');
   assert.equal(await page.evaluate(()=>document.activeElement.className),'search-action','Keyboard submit unreachable');
   await page.addScriptTag({path:require.resolve('axe-core')});
   const axe=await page.evaluate(async()=>await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
   fs.writeFileSync(path.join(dir,'canonical-axe-'+width+'.json'),JSON.stringify({violations:axe.violations,incomplete:axe.incomplete},null,2));
   assert.equal(axe.violations.length,0,'Axe violations at '+width+': '+JSON.stringify(axe.violations.map(x=>x.id)));
   assert.deepEqual(exceptions,[],'Uncaught script errors at '+width);
   if(width===1280){await page.fill('#lab-q','IEP');const pdf=await page.pdf({format:'Letter',printBackground:false});fs.writeFileSync(path.join(dir,'canonical-iep-browser-print.pdf'),pdf);}
   checks.push({width,overflow,axe:axe.violations.length,legacyLinkRecovery:true,classicFunctional:true});
   await context.close();
  }
  console.log('FINDER_RELEASE_RENDERED_PASS '+JSON.stringify(checks));
  fs.writeFileSync(path.join(dir,'summary.json'),JSON.stringify({result:'PASS',scope:'Chromium 320,390,1280 CSS pixels; native AT, real browser zoom, physical print remain human review',checks},null,2));
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1;});