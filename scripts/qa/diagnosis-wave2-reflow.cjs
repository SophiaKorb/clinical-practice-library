'use strict';
/* Independent screen reflow proxies. Not a substitute for native browser zoom or screen readers. */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=process.env.CPL_QA_ORIGIN||'http://127.0.0.1:8765';
const target='/resources/diagnoses/practice-labs/wave-2/';
const out=path.resolve('qa-artifacts/diagnosis-wave2/reflow');fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true});const observations=[];try{
 for(const check of [
  {name:'200pct-width-proxy',width:640,font:17},
  {name:'400pct-width-proxy',width:320,font:17},
  {name:'256px-narrow',width:256,font:17},
  {name:'200pct-text-at-390',width:390,font:34}
 ]) {
  const ctx=await browser.newContext({viewport:{width:check.width,height:880},reducedMotion:'reduce'});
  const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const slug of ['learning','psychosis-bipolar','substance-use','grief']){
   const uri=target+slug+'/map.html',r=await page.goto(root+uri,{waitUntil:'networkidle'});
   assert.equal(r.status(),200,uri);
   await page.evaluate(size=>{document.documentElement.style.fontSize=size+'px';},check.font);
   const tooWide=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   if(tooWide>2){const offenders=await page.evaluate(()=>[...document.querySelectorAll('body *')].map(el=>({tag:el.tagName,text:(el.textContent||'').trim().slice(0,55),left:Math.round(el.getBoundingClientRect().left),right:Math.round(el.getBoundingClientRect().right)})).filter(x=>x.right>innerWidth+2||x.left < -2).slice(0,15));throw new Error('Reflow overflow '+JSON.stringify({slug,...check,tooWide,offenders}));}
   const b=page.locator('button[data-choice]').last();
   await b.focus();await page.keyboard.press('Enter');
   assert.equal(await b.getAttribute('aria-pressed'),'true','Keyboard Enter selection '+slug+' '+check.name);
   assert.equal(await page.locator('.panel:not([hidden])').count(),1,'Selected panel missing');
   const first=page.locator('button[data-choice]').first();
   await first.focus();await page.keyboard.press('Space');
   assert.equal(await first.getAttribute('aria-pressed'),'true','Keyboard Space selection '+slug+' '+check.name);
   const tooWideAfter=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert(tooWideAfter<=2,'Selected panel overflow '+JSON.stringify({slug,...check,tooWideAfter}));
   if(check.name==='200pct-text-at-390')await page.screenshot({path:path.join(out,slug+'-text200.png'),fullPage:true});
   observations.push({slug,test:check.name,width:check.width,fontSize:check.font,overflow:tooWide});
  }
  assert.deepEqual(errors,[],'Browser errors at '+check.name);await ctx.close();
 }
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({status:'PASS',observations},null,2));
 console.log('DIAGNOSIS_WAVE2_REFLOW_PASS '+JSON.stringify({observations:observations.length,mobile:true,text200:true,keyboard:true}));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
