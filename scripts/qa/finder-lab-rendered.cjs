'use strict';
/* Isolated screenshot/keyboard/axe/browser-print comparison of current finder and prototype. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=process.env.CPL_QA_ORIGIN||'http://127.0.0.1:8765';
const out=path.resolve(process.cwd(),'qa-artifacts/pr43/finder-lab');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 const audits=[];
 try{
  for(const width of [1280,390,320]){
   const context=await browser.newContext({viewport:{width,height:840},reducedMotion:'reduce'});
   const page=await context.newPage();
   await page.goto(base+'/resources/finder-lab.html',{waitUntil:'networkidle'});
   await page.waitForSelector('.result-card');
   const initial=await page.locator('.result-card').count();
   assert(initial>0,'No lab results');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert(overflow<=2,'Laboratory horizontal overflow at '+width+': '+overflow);
   await page.fill('#lab-q','IEP');
   await page.waitForSelector('.result-card');
   const labTop=await page.locator('.result-card h3').first().innerText();
   assert(/IEP/.test(labTop),'IEP did not lead with an IEP resource: '+labTop);
   await page.screenshot({path:path.join(out,'lab-iep-'+width+'.png'),fullPage:true});
   assert((await page.locator('#lab-status').innerText()).includes('11 matching resources'),'Unexpected IEP count');
   await page.reload({waitUntil:'networkidle'});
   assert.equal(await page.inputValue('#lab-q'),'IEP','Shareable URL did not restore search');
   await page.fill('#lab-q','adult ADHD');
   await page.waitForSelector('.family summary');
   assert((await page.locator('.result-card').first().innerText()).includes('Adult ADHD'),'Topic collection grouping missing');
   await page.locator('.family summary').first().click();
   assert(await page.locator('.family ul li').count()>=7,'Did not disclose related formats');
   await page.fill('#lab-q','');
   await page.selectOption('#lab-population','birth5');
   const stageState=await page.evaluate(()=>{
    const list=globalThis.CPLFinderLab.index(globalThis.CPLFinderData.resources);
    return globalThis.CPLFinderLab.search(list,{q:'',population:'birth5'}).groups.map(g=>g.best.item.title);
   });
   assert(!stageState.some(t=>/Eldercare/i.test(t)),'Eldercare classified for Birth–5');
   await page.selectOption('#lab-audience','caregiver');
   assert((await page.locator('.result-card').count())>0,'Birth–5 caregiver search empty');
   await page.screenshot({path:path.join(out,'lab-birth5-'+width+'.png'),fullPage:true});
   // Keyboard focus and specific filter actions, not a substitute for native assistive-technology review.
   await page.locator('#lab-q').focus();
   assert.equal(await page.evaluate(()=>document.activeElement.id),'lab-q','Keyboard focus target missing');
   await page.keyboard.press('Tab');
   assert.equal(await page.evaluate(()=>document.activeElement.className),'search-action','Search control unreachable by keyboard');
   // Axe core WCAG static check. Native screen readers and actual zoom remain human gates.
   await page.addScriptTag({path:require.resolve('axe-core')});
   const axe=await page.evaluate(async()=>await globalThis.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
   const serious=axe.violations.filter(v=>v.impact==='critical'||v.impact==='serious');
   fs.writeFileSync(path.join(out,'lab-axe-'+width+'.json'),JSON.stringify({violations:axe.violations,incomplete:axe.incomplete},null,2));
   assert.equal(serious.length,0,'Serious/critical WCAG axe findings at '+width+': '+serious.map(v=>v.id).join(','));
   if(width===1280){
    await page.fill('#lab-q','IEP');
    await page.selectOption('#lab-population','');
    await page.selectOption('#lab-audience','');
    const pdf=await page.pdf({format:'Letter',printBackground:false});
    fs.writeFileSync(path.join(out,'lab-iep-browser-print.pdf'),pdf);
   }
   const original=await context.newPage();
   await original.goto(base+'/resources/clinical-resource-finder.html?q=IEP',{waitUntil:'networkidle'});
   await original.waitForSelector('.finder-card');
   const originalTop=await original.locator('.finder-card h3').first().innerText();
   await original.screenshot({path:path.join(out,'production-finder-iep-'+width+'.png'),fullPage:true});
   audits.push({width,overflow,labTop,originalTop,axeViolations:axe.violations.length,axeSerious:serious.length,labResults:initial});
   await context.close();
  }
  fs.writeFileSync(path.join(out,'rendered-summary.json'),JSON.stringify({result:'PASS',scope:'Chromium at 320/390/1280 CSS px; not 200/400% native zoom, screen readers or physical print',audits},null,2));
  console.log('FINDER_LAB_RENDERED_PASS '+JSON.stringify(audits));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
