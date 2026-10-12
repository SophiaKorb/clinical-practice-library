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
   // Browser keyboard and accessibility regression for the interactive visual aids.
   const choiceButtons=page.locator('#choices button[data-choice]');
   assert.equal(await choiceButtons.count(),6,'six real supported-choice buttons');
   assert.equal(await choiceButtons.evaluateAll(items=>items.filter(x=>x.getAttribute('aria-pressed')==='true').length),0,'no choice is assumed');
   const quiet=page.locator('#choices button[data-choice="Quiet"]');
   await quiet.focus();
   await page.keyboard.press('Enter');
   assert.equal(await quiet.getAttribute('aria-pressed'),'true','keyboard selection is exposed');
   assert.match(await page.locator('#choice-result').innerText(),/You chose: Quiet/);
   assert.equal(await quiet.evaluate(e=>getComputedStyle(e).borderTopWidth),'3px','selected choice has a non-color visual cue');
   const notNow=page.locator('#choices button[data-choice="Not now"]');
   await notNow.focus();
   await page.keyboard.press('Space');
   assert.equal(await notNow.getAttribute('aria-pressed'),'true','space activates a different choice');
   assert.equal(await quiet.getAttribute('aria-pressed'),'false','previous choice is unselected');
   assert.equal(await choiceButtons.evaluateAll(items=>items.filter(x=>x.getAttribute('aria-pressed')==='true').length),1,'exactly one active choice');
   assert.match(await page.locator('#choice-result').innerText(),/You chose: Not now/);
   const bodyCircles=page.locator('#body svg circle[data-body]');
   assert.equal(await bodyCircles.count(),4,'four tappable regions remain pictured');
   assert.equal(await bodyCircles.evaluateAll(items=>items.filter(x=>x.getAttribute('tabindex')!=='-1'||x.getAttribute('aria-hidden')!=='true').length),0,'SVG hotspots do not create duplicate screen-reader/tab stops');
   const head=page.locator('#body button[data-body="head"]');
   await head.focus();
   await page.keyboard.press('Space');
   assert.equal(await head.getAttribute('aria-pressed'),'true','body region button supports keyboard');
   assert.equal(await page.locator('#body svg circle[data-body="head"]').getAttribute('aria-pressed'),'true','diagram mirrors labeled control');
   await page.keyboard.press('Tab');
   assert.equal(await page.evaluate(()=>document.activeElement?.dataset?.body),'chest','body navigation goes directly to next labeled button');
   const handCircle=page.locator('#body svg circle[data-body="hands"]');
   await handCircle.click();
   assert.equal(await page.locator('#body button[data-body="hands"]').getAttribute('aria-pressed'),'true','pointer-based body diagram remains functional');
   assert.equal(await head.getAttribute('aria-pressed'),'false','old region unselected');
   if(width===390){
    await page.locator('#choices .visual').screenshot({path:path.join(output,'supported-choices-390.png'),animations:'disabled'});
    await page.locator('#body .visual').screenshot({path:path.join(output,'body-map-390.png'),animations:'disabled'});
   }
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
 console.log('PASS visual toolkit clinician/client PDF and keyboard accessibility at 390 and 1280 px; exclusive choice selection, SVG button parity and restored notes.');
})().catch(err=>{console.error(err);process.exitCode=1});
