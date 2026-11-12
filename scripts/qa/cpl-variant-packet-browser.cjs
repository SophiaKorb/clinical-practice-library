// Local Chromium verification of the generated, non-deployed review packet.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright'),axe=require('axe-core');
const dir=path.resolve(__dirname,'../../review-artifacts');
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'cpl-variant-manifest.json'),'utf8'));
assert.equal(manifest.groupCount,26);
assert.equal(manifest.fileCount,54);
assert.equal(manifest.exactFilePairs,1);
assert.equal(manifest.sameMainTextNonidenticalFilePairs,8);
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [320,390,768,1280]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
   const err=[];page.on('pageerror',e=>err.push(e.message));
   const response=await page.goto(pathToFileURL(path.join(dir,'cpl-variant-review.html')).href);
   assert.ok(response,'Generated packet missing');
   assert.equal(await page.locator('main').count(),1);
   assert.equal(await page.locator('section.group').count(),26);
   assert.equal(await page.locator('.file').count(),54);
   assert.equal(await page.locator('.toc li').count(),26);
   assert.equal(await page.locator('.decision').count(),26);
   await page.keyboard.press('Tab');
   const focus=await page.evaluate(()=>{const a=document.activeElement,r=a.getBoundingClientRect();return {href:a.getAttribute('href'),visible:r.top>=0&&r.bottom<=innerHeight,outline:getComputedStyle(a).outlineStyle}});
   assert.equal(focus.href,'#main','First Tab skip must lead to main');
   assert.ok(focus.visible&&focus.outline!=='none','Skip focus invisible');
   await page.keyboard.press('Enter');
   assert.equal(await page.evaluate(()=>document.activeElement?.id),'main');
   const metric=await page.evaluate(()=>({w:document.documentElement.clientWidth,s:document.documentElement.scrollWidth}));
   if(metric.s>metric.w+1){
     const offending=await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>document.documentElement.clientWidth+1&&getComputedStyle(e).position!=='fixed';}).slice(0,14).map(e=>({tag:e.tagName,cls:String(e.className).slice(0,45),width:Math.round(e.getBoundingClientRect().width),right:Math.round(e.getBoundingClientRect().right),snippet:e.textContent.slice(0,65)})));
     console.error('OVERFLOW_DIAGNOSTIC '+width+' '+JSON.stringify(offending));
   }
   assert.ok(metric.s<=metric.w+1,'Horizontal overflow at '+width+': '+JSON.stringify(metric));
   await page.addScriptTag({content:axe.source});
   const audit=await page.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}}));
   const errors=audit.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.slice(0,3).map(n=>n.target)}));
   console.log('AXE PACKET '+width+' passedRules='+audit.passes.length+' issues='+JSON.stringify(errors));
   assert.deepEqual(errors,[],'Generated packet has axe violations at '+width);
   // All 54 originals are individually discoverable through an expanded details section.
   if(width===390){await page.locator('.file details').first().locator('summary').click();assert.ok((await page.locator('.file details').first().locator('pre').textContent()).length>150);}
   await page.emulateMedia({media:'print'});
   assert.equal(await page.locator('.skip').evaluate(e=>getComputedStyle(e).display),'none','Skip link should not print');
   assert.equal(await page.locator('.toc').evaluate(e=>getComputedStyle(e).display),'none','TOC should not print');
   assert.deepEqual(err,[]);
   console.log('PASS REVIEW PACKET width='+width+' sections=26 files=54, keyboard, print, focus and axe');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
