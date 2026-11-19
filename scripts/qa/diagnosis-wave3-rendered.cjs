'use strict';
/* Source-backed Chromium reflow/keyboard/print proxies, not native AT or medical endorsement. */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.CPL_QA_ORIGIN||'http://127.0.0.1:8765',prefix='/resources/diagnoses/practice-labs/wave-3/';
const out=path.resolve('qa-artifacts/diagnosis-wave3');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true});let report=[];try{
 for(const check of [{width:1280,font:17},{width:640,font:17},{width:390,font:17},{width:320,font:17},{width:256,font:17},{width:390,font:34}]){
 const context=await browser.newContext({viewport:{width:check.width,height:850},reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 for(const slug of ['index','supported-choice','medical-first']){
  const uri=prefix+slug+'.html',res=await page.goto(base+uri,{waitUntil:'networkidle'});assert.equal(res.status(),200,'Missing '+uri);await page.evaluate(font=>document.documentElement.style.fontSize=font+'px',check.font);
  assert.equal(await page.locator('h1').count(),1,'One main title '+slug);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(overflow>2){const offenders=await page.evaluate(()=>[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,cls:(e.className||'').toString().slice(0,40),text:(e.textContent||'').trim().slice(0,40),scroll:e.scrollWidth,client:e.clientWidth})).filter(x=>x.scroll>x.client+2).slice(0,15));throw Error('Unexpected horizontal overflow '+JSON.stringify({slug,check,overflow,offenders}));}
  const skip=page.locator('a.skip');await skip.focus();assert(await skip.evaluate(el=>document.activeElement===el),'Skip link not focusable '+slug);await skip.evaluate(e=>e.blur());
  if(slug==='index'){
   const cards=page.locator('.route-grid > .route');assert.equal(await cards.count(),2,'Index must show two distinct lab choices');
   const first=await cards.nth(0).boundingBox(),second=await cards.nth(1).boundingBox();
   assert(first&&second,'Index lab cards not rendered');
   const overlapX=Math.max(0,Math.min(first.x+first.width,second.x+second.width)-Math.max(first.x,second.x));
   const overlapY=Math.max(0,Math.min(first.y+first.height,second.y+second.height)-Math.max(first.y,second.y));
   assert(overlapX*overlapY<1,'Two lab choices overlap or hide each other '+JSON.stringify({check,first,second}));
   assert.equal(await cards.nth(0).locator('h2').innerText(),'Supported decision-making');
   assert.equal(await cards.nth(1).locator('h2').innerText(),'Eating concerns');
  }
  if(slug!=='index'){
   const buttons=page.locator('button[data-lens]');assert.equal(await buttons.count(),4,'Distinct perspectives '+slug);
   assert.equal(await page.locator('.route').count(),4,'Visual structure incomplete '+slug);
   for(let i=0;i<4;i++){const b=buttons.nth(i);await b.focus();await page.keyboard.press('Enter');assert.equal(await b.getAttribute('aria-pressed'),'true','Keyboard selection '+slug+'/'+i);const id=await b.getAttribute('aria-controls');assert.equal(await page.locator('#'+id).isVisible(),true,'Accessible visible explanation '+slug+'/'+i);assert.equal(await page.locator('[data-lens-panel]:visible').count(),1,'Multiple visible panels '+slug+'/'+i)}
   await buttons.first().focus();await page.keyboard.press('Space');assert.equal(await buttons.first().getAttribute('aria-pressed'),'true','Space activation '+slug);
   assert((await page.locator('[data-selected-summary]').innerText()).includes('No response is saved'),'Live region information missing '+slug);
   assert.equal(await page.locator('.sheet').count(),2);assert.equal(await page.locator('.prompt').count(),10);
   assert.equal(await page.locator('form,input,textarea,[contenteditable]').count(),0,'Public patient-entry control '+slug);
   assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0,'Unexpected stored state '+slug);
   if(check.width===1280&&check.font===17){await page.emulateMedia({media:'print'});assert(await page.locator('#sheet-1').isVisible()&&await page.locator('#sheet-2').isVisible(),'Sheets hidden in print');assert(await page.locator('main>h1').isHidden(),'Screen header leaked to print');const pdf=await page.pdf({format:'Letter',printBackground:false});assert(pdf.length>4000,'PDF empty');fs.writeFileSync(path.join(out,slug+'-print.pdf'),pdf);await page.emulateMedia({media:'screen'});}
  }
  if((check.width===390||check.width===1280)&&check.font===17){await page.addScriptTag({path:require.resolve('axe-core')});const axe=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));const severe=axe.violations.filter(x=>x.impact==='serious'||x.impact==='critical');assert.equal(severe.length,0,'Serious/critical axe '+slug+' '+JSON.stringify(severe.map(x=>x.id)));}
  if(check.width===390&&check.font===34){await page.screenshot({path:path.join(out,slug+'-text200.png'),fullPage:true});}
  if(check.width===390&&check.font===17){await page.screenshot({path:path.join(out,slug+'-390.png'),fullPage:true});}
  report.push({slug,width:check.width,font:check.font,overflow});
 }
 assert.deepEqual(errors,[],'Browser JavaScript errors '+check.width);await context.close();}
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({status:'PASS',report},null,2));console.log('DIAGNOSIS_WAVE3_RENDERED_PASS '+JSON.stringify({views:report.length,interactive:12,printPDFs:2,axes:'sampled at 390 and 1280',scope:'CSS viewport+root font stress, not native browser zoom'}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
