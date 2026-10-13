/* Interactive accessibility QA for the standalone exploratory DSM Symptom Lab.
   Uses fictional examples only. Does not validate the clinical model. */
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const out='/tmp/cpl-dsm-lab-accessibility';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try {
  for(const width of [390,1280]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   const page=await context.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto('http://127.0.0.1:8765/resources/therapy/dsm-structure-4d.html',{waitUntil:'load',timeout:30000});
   assert.equal(response.status(),200,'standalone prototype served');
   await page.locator('#disorders button').first().waitFor({timeout:20000});
   assert.equal(await page.locator('#disorders button').count(),38,'all 38 examples available');
   assert.match(await page.locator('main').innerText(),/not a map measured from patients/i);
   assert.match(await page.locator('main').innerText(),/cannot diagnose/i);
   assert.ok((await page.locator('#scene').getAttribute('aria-label')).includes('Use searchable list'),'canvas has text alternative');
   assert.equal(await page.locator('canvas#scene').getAttribute('tabindex'),'0');
   const initialWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
   assert.ok(initialWidth<=width+3,'no page overflow '+width+': '+initialWidth);
   await page.screenshot({path:path.join(out,'lab-initial-'+width+'.png'),animations:'disabled'});
   await page.locator('#search').fill('separation anxiety');
   assert.equal(await page.locator('#disorders button').count(),1,'search filters examples');
   const first=page.locator('#disorders button').first();
   await first.focus();await page.keyboard.press('Enter');
   assert.match(await page.locator('#diagnosis-title').innerText(),/Separation anxiety disorder/);
   assert.equal(await first.getAttribute('aria-pressed'),'true','active item readable to AT');
   await page.locator('#search').fill('');
   assert.equal(await page.locator('#disorders button').count(),38);
   await page.locator('#compare').focus();await page.keyboard.press('Enter');
   assert.match(await page.locator('#compare').innerText(),/Pinned/);
   await page.locator('#disorders button').nth(6).focus();
   await page.keyboard.press('Enter');
   assert.match(await page.locator('#comparison').innerText(),/Pinned:/);
   await page.locator('#clear-compare').click();
   assert.equal(await page.locator('#clear-compare').isDisabled(),true);
   const mode=page.locator('#mode');await mode.focus();await page.keyboard.press('Enter');
   assert.equal(await mode.getAttribute('aria-pressed'),'true','flat mode exposed');
   await mode.click();assert.equal(await mode.getAttribute('aria-pressed'),'false');
   const surface=page.locator('#surface');
   await surface.click();assert.equal(await surface.getAttribute('aria-pressed'),'false');
   await surface.click();assert.equal(await surface.getAttribute('aria-pressed'),'true');
   await page.locator('#smoothness').selectOption('wide');
   assert.equal(await page.locator('#smoothness').inputValue(),'wide');
   await page.locator('#scene').focus();await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowUp');
   await page.locator('#reset').click();assert.equal(await mode.getAttribute('aria-pressed'),'false');
   await page.locator('#preset').selectOption('activation');
   assert.equal(await page.locator('#case-features .sym-row').count()>0,true,'vignette creates editable features');
   await page.locator('#impact').fill('4');
   assert.match(await page.locator('#impact-label').innerText(),/Extensive/);
   assert.match(await page.locator('#impact-help').innerText(),/fictional|impact|interference|function/i);
   await page.screenshot({path:path.join(out,'lab-interactions-'+width+'.png'),animations:'disabled'});
   assert.deepEqual(errors,[],'no browser JS errors at '+width);
   await context.close();
  }
 }finally{await browser.close()}
 console.log('PASS standalone DSM lab at mobile and desktop: search, native keyboard, pin/compare, flat view, terrain, fictional vignette, independent function slider and accessibility labels.');
})().catch(error=>{console.error(error);process.exitCode=1;});
