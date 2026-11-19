'use strict';
/* Chromium source-backed reflow, keyboard and print tests; not native AT or clinical review. */
const {chromium}=require('playwright'),assert=require('assert/strict'),fs=require('fs'),path=require('path');
const origin=process.env.CPL_QA_ORIGIN||'http://127.0.0.1:8765',url='/resources/diagnoses/practice-labs/sleep-2026/compare-treatment.html';
const out=path.resolve('qa-artifacts/sleep-2026');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true}),reports=[];
try {
for(const cfg of [{w:1280,font:17},{w:640,font:17},{w:390,font:17},{w:320,font:17},{w:256,font:17},{w:390,font:34}]){
 const context=await browser.newContext({viewport:{width:cfg.w,height:850},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(origin+url,{waitUntil:'networkidle'});assert.equal(response.status(),200);
 await page.evaluate(v=>document.documentElement.style.fontSize=v+'px',cfg.font);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);assert(overflow<=2,'Horizontal overflow '+JSON.stringify({cfg,overflow}));
 const cards=page.locator('.comparison-card');assert.equal(await cards.count(),3);
 const bounds=await cards.evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}));
 for(let a=0;a<3;a++)for(let b=a+1;b<3;b++){let i=bounds[a],j=bounds[b],w=Math.max(0,Math.min(i.x+i.w,j.x+j.w)-Math.max(i.x,j.x)),h=Math.max(0,Math.min(i.y+i.h,j.y+j.h)-Math.max(i.y,j.y));assert(w*h<1,'Comparator cards overlap '+JSON.stringify({cfg,bounds}));}
 const skip=page.locator('.skip');await skip.focus();assert(await skip.evaluate(e=>document.activeElement===e),'Skip not focusable');await skip.evaluate(e=>e.blur());
 const btn=page.locator('button[data-lens]');assert.equal(await btn.count(),4);
 for(let i=0;i<4;i++){const b=btn.nth(i);await b.focus();await page.keyboard.press(i%2?'Space':'Enter');assert.equal(await b.getAttribute('aria-pressed'),'true','Keyboard choice '+i);const id=await b.getAttribute('aria-controls');assert(await page.locator('#'+id).isVisible(),'Chosen panel not shown '+i);assert.equal(await page.locator('[data-lens-panel]:visible').count(),1,'More than one explanation visible');}
 assert.equal(await page.locator('form,input,textarea,[contenteditable]').count(),0,'Personal data entry found');
 assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0,'Unexpected client storage');
 assert.equal(await page.locator('.sheet').count(),2);assert.equal(await page.locator('.prompt').count(),10);
 if(cfg.w===390&&cfg.font===17){await page.addScriptTag({path:require.resolve('axe-core')});const result=await page.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));const serious=result.violations.filter(v=>['serious','critical'].includes(v.impact));assert.equal(serious.length,0,'Serious axe WCAG '+JSON.stringify(serious.map(v=>v.id)));await page.screenshot({path:path.join(out,'sleep-390.png'),fullPage:true});}
 if(cfg.w===390&&cfg.font===34)await page.screenshot({path:path.join(out,'sleep-200-text.png'),fullPage:true});
 if(cfg.w===1280){await page.screenshot({path:path.join(out,'sleep-desktop.png'),fullPage:true});await page.emulateMedia({media:'print'});assert(await page.locator('#sheet-1').isVisible()&&await page.locator('#sheet-2').isVisible());assert(await page.locator('main>h1').isHidden(),'Print header not hidden');const buf=await page.pdf({format:'Letter',printBackground:false});assert(buf.length>5000);fs.writeFileSync(path.join(out,'sleep-2026-print.pdf'),buf);await page.emulateMedia({media:'screen'});}
 assert.deepEqual(errors,[],'Browser JS errors');reports.push({cfg,overflow,overlap:false,buttons:4});await context.close();
}
const ctx=await browser.newContext({viewport:{width:1280,height:850}}),finder=await ctx.newPage(),checks=[];
for(const [age,audience,want] of [['adults','clinician',true],['adults','case_manager',true],['adults','client',true],['adults','caregiver',false],['children','clinician',false],['teens','case_manager',false]]){
 const r=await finder.goto(origin+'/resources/clinical-resource-finder.html',{waitUntil:'networkidle'});assert.equal(r.status(),200);
 await finder.locator('#lab-q').fill('adult chronic insomnia compare CBT-I combination medication evidence');await finder.locator('#lab-form button[type="submit"]').click();
 await finder.locator('#lab-population').selectOption(age);await finder.locator('#lab-audience').selectOption(audience);
 const found=await finder.locator('#lab-results a[href="'+url+'"]').count()>0;assert.equal(found,want,'Incorrect age/audience '+JSON.stringify({age,audience,found,want}));checks.push({age,audience,found});
}
await ctx.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({status:'PASS',reports,checks},null,2));
console.log('SLEEP_2026_EVIDENCE_RENDERED_PASS '+JSON.stringify({views:reports.length,keyboardActions:24,realFinderChecks:checks.length,printPDFs:1}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
