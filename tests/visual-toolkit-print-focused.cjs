/* Focused visual toolkit print regression: no PHI, runs against local repo server. */
'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {chromium}=require('playwright');
const output='/tmp/cpl-visual-print-focused';
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [390,1280]){
   const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
   const page=await context.newPage();
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   const res=await page.goto('http://127.0.0.1:8765/resources/therapy/visual-reasoning-toolkit.html',{waitUntil:'load',timeout:20000});
   assert.equal(res.status(),200);
   const panels=page.locator('details.advanced');
   assert.ok(await panels.count()>=7,'separate clinician disclosure panels');
   assert.equal(await panels.first().getAttribute('open'),null,'clinician guidance initially collapsed');
   await page.emulateMedia({media:'print'});
   assert.equal(await page.locator('#scale button').count(),6);
   assert.equal(await page.locator('#scale button').first().evaluate(x=>getComputedStyle(x).display),'flex','print displays levels');
   for(const region of ['head','chest','belly','hands']){
    assert.ok(await page.locator('#body button[data-body="'+region+'"]').first().evaluate(x=>getComputedStyle(x).display!=='none'),region+' legend on paper');
   }
   assert.ok(await page.locator('#choices button[data-choice]').first().evaluate(x=>getComputedStyle(x).display!=='none'),'print displays supported choices');
   await page.pdf({path:path.join(output,'clinician-'+width+'.pdf'),format:'Letter',printBackground:true});
   // Page printing must not leave disclosures open in the live screen.
   await page.emulateMedia({media:'screen'});
   assert.equal(await panels.first().getAttribute('open'),null,'disclosures restored after print');
   const jump=page.locator('.tool-jump');
   await jump.locator('summary').click();
   await page.locator('#client-view').click();
   assert.equal(await page.locator('#client-view').getAttribute('aria-pressed'),'true');
   await jump.locator('summary').click();
   await page.emulateMedia({media:'print'});
   assert.equal(await panels.first().evaluate(x=>getComputedStyle(x).display),'none','client print omits clinical note');
   await page.pdf({path:path.join(output,'client-'+width+'.pdf'),format:'Letter',printBackground:true});
   await page.emulateMedia({media:'screen'});
   assert.equal(await panels.first().getAttribute('open'),null,'client print leaves disclosure collapsed');
   assert.deepEqual(errors,[],'no console page errors');
   await context.close();
  }
 } finally {await browser.close();}
 console.log('PASS focused visual toolkit clinician/client PDF creation at 390 and 1280 px, notes restored, scale and choice cards visible.');
})().catch(err=>{console.error(err);process.exitCode=1});
