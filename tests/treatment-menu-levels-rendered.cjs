'use strict';
/* No real patient data: verifies the independent practice, clinician intervention, and measurement banks. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const out='/tmp/cpl-treatment-menu-clinical-review';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try {
  for(const width of [390,1280]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   const page=await context.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const res=await page.goto('http://127.0.0.1:8765/resources/therapy/treatment-plan-menu.html',{waitUntil:'load'});
   assert.equal(res.status(),200);
   await page.locator('#menu-count').getByText(/210 practice ideas/).waitFor();
   assert.match(await page.locator('#menu-count').innerText(),/111 therapist interventions/);
   assert.match(await page.locator('#menu-count').innerText(),/53 measurement ideas/);
   assert.equal(await page.locator('#delivery-practice').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('#target-ideas .target-card').count(),12);
   assert.equal(await page.locator('#measure-library').getAttribute('open'),'','measure ideas discoverable without opening');
   assert.equal(await page.locator('#measure-ideas .measure-card').count(),53);
   const initialWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
   assert.ok(initialWidth<=width+3,'no horizontal document overflow at '+width+': '+initialWidth);
   await page.screenshot({path:path.join(out,'practice-'+width+'.png'),animations:'disabled'});
   await page.locator('#delivery-clinician').click();
   assert.equal(await page.locator('#delivery-clinician').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('#delivery-practice').getAttribute('aria-pressed'),'false');
   assert.equal(await page.locator('#target-ideas .intervention-card').count(),5,'diverse clinician interventions in anxiety');
   assert.equal(await page.locator('#target-ideas .target-card').count(),0,'no practice ideas mislabeled as therapy');
   assert.match(await page.locator('#approach-title').innerText(),/Therapist-delivered interventions/);
   assert.match(await page.locator('#target-ideas .intervention-card').first().locator('.detail-label').first().innerText(),/WHAT THE THERAPIST DOES/i);
   await page.screenshot({path:path.join(out,'clinician-'+width+'.png'),animations:'disabled'});
   const first=page.locator('#target-ideas .intervention-card').first();
   await first.locator('.edit-idea').click();
   await first.locator('.edit-try').fill('Collaboratively adapt the formulation in session.');
   await first.locator('.edit-measure').fill('Compare functioning and chosen participation after three sessions.');
   await first.locator('.edit-idea').click();
   assert.match(await first.locator('.idea-try').innerText(),/adapt the formulation/);
   await first.locator('.copy-idea').click();
   await page.waitForFunction(()=>/Copied:|Clipboard unavailable/.test(document.querySelector('#copy-status').textContent),null,{timeout:7000});
   await page.locator('[data-approach="Environment & access"]').click();
   await page.locator('[data-approach=""]').click();
   assert.match(await page.locator('#target-ideas .intervention-card').first().locator('.idea-try').innerText(),/adapt the formulation/,'edits survive filtering');
   await page.locator('#menu-diagnosis').selectOption('autism');
   assert.equal(await page.locator('#target-ideas .intervention-card').count(),4,'therapist examples cover autism');
   await page.locator('#delivery-practice').click();
   assert.equal(await page.locator('#target-ideas .target-card').count(),7,'practice content broadened and distinct');
   await page.locator('#menu-area').selectOption('Standardized option');
   assert.equal(await page.locator('#measure-ideas .measure-card').count(),2,'two clearly labeled standardized choices');
   assert.equal(await page.locator('#measure-ideas .method-tag').count(),2);
   assert.equal(await page.locator('#measure-ideas .source-link').count(),2,'original scale links are shown');
   await page.locator('#menu-area').selectOption('Treatment process');
   assert.ok(await page.locator('#measure-ideas .measure-card').count()>=4,'therapy-process measurement methods');
   const m=page.locator('#measure-ideas .measure-card').first();
   await m.locator('.edit-idea').click();
   await m.locator('.edit-measure').fill('Review with the person after two sessions.');
   assert.match(await m.locator('.edit-measure').inputValue(),/after two sessions/);
   await page.locator('#menu-area').selectOption('');
   if(width===390){await page.locator('#measure-library>summary').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'measures-expanded-390.png'),animations:'disabled'});}
   await page.locator('#menu-reset').click();
   assert.equal(await page.locator('#target-ideas .target-card').count(),12);
   assert.equal(await page.locator('#delivery-practice').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('#measure-ideas .measure-card').count(),53);
   const laterWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
   assert.ok(laterWidth<=width+3,'no overflow after interactions @'+width+': '+laterWidth);
   assert.deepEqual(errors,[],'no JS errors @'+width);
   await context.close();
  }
 } finally {await browser.close()}
 console.log('PASS treatment menu: 210 practice, 111 therapist, 53 qualitative measurement options, editable and searchable at mobile/desktop.');
})().catch(error=>{console.error(error);process.exitCode=1;});
