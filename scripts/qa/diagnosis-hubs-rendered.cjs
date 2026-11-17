'use strict';
/* Browser review of diagnosis hubs, one resource per catalog match, nonproduction. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const base=process.env.CPL_QA_ORIGIN||'http://127.0.0.1:8765';
const dir=path.resolve(process.cwd(),'qa-artifacts/diagnosis-hubs');
fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 let results=[];
 try{
  for(const width of [1280,640,390,320]){
   const ctx=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
   const page=await ctx.newPage(),errs=[];page.on('pageerror',e=>errs.push(e.message));
   let resp=await page.goto(base+'/resources/diagnoses/adult-adhd.html',{waitUntil:'networkidle'});
   assert.equal(resp.status(),200);
   assert.match(await page.locator('h1').innerText(),/Adult ADHD/);
   assert.equal(await page.locator('#direct-adhd .resource-list li').count(),19,'Static directory not complete');
   assert.equal(await page.locator('#related-supports .handout-grid li').count(),12,'Cross-diagnostic support count changed');
   const jump=page.locator('a[href="#assessment"]').first();await jump.focus();
   assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')),'#assessment');
   const tooWide=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert(tooWide<=2,'Adult guide horizontal overflow '+width+' '+tooWide);
   await page.screenshot({path:path.join(dir,'adult-adhd-'+width+'.png'),fullPage:true});
   await page.goto(base+'/resources/diagnoses/index.html?topic=ADHD',{waitUntil:'networkidle'});
   await page.waitForSelector('#direct-groups .resource-list li');
   assert.equal(await page.locator('#direct-groups .resource-list li').count(),19,'Dynamic diagnosis hub missing ADHD resources');
   assert.match(await page.locator('#topic-name').innerText(),/ADHD/);
   assert.equal(await page.locator('#adhd-focus').isVisible(),true,'Prominent adult comprehensive guide missing');
   let overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert(overflow<=2,'Diagnosis index overflow '+width+' '+overflow);
   await page.screenshot({path:path.join(dir,'adhd-index-'+width+'.png'),fullPage:true});
   await page.addScriptTag({path:require.resolve('axe-core')});
   const hubAxe=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
   fs.writeFileSync(path.join(dir,'axe-index-'+width+'.json'),JSON.stringify({violations:hubAxe.violations,incomplete:hubAxe.incomplete},null,2));
   assert.equal(hubAxe.violations.filter(x=>x.impact==='critical'||x.impact==='serious').length,0,
    'Serious topic-index axe issue '+width+': '+JSON.stringify(hubAxe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.slice(0,2).map(n=>n.html)}))));
   await page.goto(base+'/resources/diagnoses/index.html?topic=Autism',{waitUntil:'networkidle'});
   await page.waitForSelector('#direct-groups .resource-list li');
   assert.equal(await page.locator('#direct-groups .resource-list li').count(),29,'Autism diagnosis hub missing tagged resources');
   assert.equal(await page.locator('#adhd-focus').isHidden(),true,'Adult ADHD content leaked into unrelated diagnosis');
   await page.goto(base+'/resources/diagnoses/index.html',{waitUntil:'networkidle'});
   await page.waitForSelector('#topic-grid .topic-choice');
   assert.equal(await page.locator('#topic-grid .topic-choice').count(),14,'Missing diagnosis categories');
   await page.selectOption('#topic-select','ADHD');
   await page.waitForURL(/topic=ADHD/);
   assert.match(await page.locator('#topic-name').innerText(),/ADHD/,'Diagnosis picker broken');
   await page.goto(base+'/#diagnosis-guides',{waitUntil:'networkidle'});
   assert.equal(await page.locator('.diagnosis-card').count(),8);
   assert.equal(await page.locator('.diagnosis-card .diagnosis-hub-link').count(),8);
   await page.goto(base+'/guides/adhd.html',{waitUntil:'networkidle'});
   assert(await page.locator('a[href="/resources/diagnoses/index.html?topic=ADHD"]').count()>0,'Original guide link missing');
   assert.deepEqual(errs,[],'Browser JS errors');
   await page.addScriptTag({path:require.resolve('axe-core')});
   const axe=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
   fs.writeFileSync(path.join(dir,'axe-guide-'+width+'.json'),JSON.stringify({violations:axe.violations,incomplete:axe.incomplete},null,2));
   assert.equal(axe.violations.filter(x=>x.impact==='critical'||x.impact==='serious').length,0,'Serious original guide axe failure '+width+': '+JSON.stringify(axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.slice(0,3).map(n=>n.html)}))));
   await page.goto(base+'/resources/diagnoses/adult-adhd.html',{waitUntil:'networkidle'});
   await page.addScriptTag({path:require.resolve('axe-core')});
   const adultAxe=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
   fs.writeFileSync(path.join(dir,'axe-adult-'+width+'.json'),JSON.stringify({violations:adultAxe.violations,incomplete:adultAxe.incomplete},null,2));
   assert.equal(adultAxe.violations.filter(x=>x.impact==='critical'||x.impact==='serious').length,0,'Serious adult guide accessibility failure '+width+': '+JSON.stringify(adultAxe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.slice(0,3).map(n=>n.html)}))));
   if(width===1280){
    const pdf=await page.pdf({format:'Letter',printBackground:false});
    assert(pdf.length>10000,'Printable guide unexpectedly tiny');
    fs.writeFileSync(path.join(dir,'adult-adhd-browser-print.pdf'),pdf);
    await page.emulateMedia({forcedColors:'active'});
    await page.screenshot({path:path.join(dir,'adult-adhd-forced-colors.png'),fullPage:true});
   }
   results.push({width,adultOverflow:tooWide,hubOverflow:overflow,adhdIndexed:19,autismIndexed:29,axeSerious:0,originalGuidesLinked:true});
   await ctx.close();
  }
  console.log('DIAGNOSIS_HUB_RENDERED_PASS '+JSON.stringify(results));
  fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify({status:'PASS',scope:'Headless Chromium; 320/390/640/1280 CSSpx, not native 200%/400% zoom or actual screen-reader testing',results},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
