// Headless keyboard, responsive and axe checks for nine current school guide pages.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),axe=require('axe-core');
const routes=["guides/adhd.html","guides/anxiety.html","guides/arizona-school-support-process.html","guides/autism.html","guides/depression.html","guides/dyscalculia.html","guides/dysgraphia.html","guides/dyslexia.html","guides/odd-persistent-conflict-behavior.html"];
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const severe=[],issues=[],faults=[],rows=[];
 try{
  for(const width of [320,390,768,1280]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   const page=await context.newPage();
   let pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
   for(const route of routes){
    pageErrors=[];
    const resp=await page.goto('http://127.0.0.1:8765/'+route,{waitUntil:'load',timeout:25000});
    assert.equal(resp?.status(),200,'Guide route missing '+route);
    await page.keyboard.press('Tab');
    const state=await page.evaluate(()=>{
     const e=document.activeElement,b=e.getBoundingClientRect();
     return {href:e?.getAttribute('href'),onScreen:b.top>=0&&b.bottom<=innerHeight&&b.left>=0&&b.right<=innerWidth,outline:getComputedStyle(e).outlineStyle};
    });
    assert.equal(state.href,'#main-content','Guide skip first focus '+route+' '+width);
    assert.ok(state.onScreen&&state.outline!=='none','Guide skip focus invisible '+route+' '+width);
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>document.activeElement?.id),'main-content','Skip target not focused '+route+' '+width);
    const metrics=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,mains:document.querySelectorAll('main').length,h1s:document.querySelectorAll('h1').length}));
    if(metrics.scroll>metrics.width+1){
      const elems=await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(el=>{const b=el.getBoundingClientRect();return b.right>document.documentElement.clientWidth+1&&getComputedStyle(el).position!=='fixed';}).slice(0,12).map(el=>({node:el.tagName,className:String(el.className).slice(0,90),right:Math.round(el.getBoundingClientRect().right),width:Math.round(el.getBoundingClientRect().width),text:el.textContent.slice(0,60)})));
      console.log('GUIDE_OVERFLOW_ELEMENTS '+route+' '+width+' '+JSON.stringify(elems));
      faults.push({route,width,kind:'overflow',difference:metrics.scroll-metrics.width,elems});
    }
    if(metrics.mains!==1||metrics.h1s!==1)faults.push({route,width,kind:'landmarks',metrics});
    if(pageErrors.length)faults.push({route,width,kind:'pageerror',errors:pageErrors.slice()});
    if(width===390){
     await page.addScriptTag({content:axe.source});
     const audit=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','best-practice']}}));
     const found=audit.violations.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length,targets:v.nodes.slice(0,5).map(n=>n.target)}));
     issues.push({route,found,passingRules:audit.passes.length});
     for(const v of found)if(['serious','critical'].includes(v.impact))severe.push({route,...v});
     console.log('GUIDE_AXE '+route+' '+JSON.stringify(found));
    }
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('.cpl-skip').evaluate(e=>getComputedStyle(e).display),'none','Skip prints '+route);
    await page.emulateMedia({media:'screen'});
    rows.push({route,width,keyboard:'PASS',print:'PASS',overflowPx:Math.max(0,metrics.scroll-metrics.width)});
    console.log('PASS_GUIDE '+route+' '+width);
   }
   await context.close();
  }
 }finally{await browser.close();}
 const summary={routes:routes.length,viewports:4,checks:rows.length,axeSampledWidth:390,axeReports:issues.length,axeSeriousOrCritical:severe.length,overflowOrBrowserFaults:faults.length,clinicalApproval:'PENDING_HUMAN',nativeScreenReader:'NOT_TESTED'};
 const out=path.resolve('review-artifacts');fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'cpl-guides-accessibility-review.json'),JSON.stringify({summary,issues,faults,rows},null,2)+'\n');
 console.log('CPL_GUIDES_ACCESS_SUMMARY '+JSON.stringify(summary));
 console.log('CPL_GUIDES_UNRESOLVED '+JSON.stringify({severe,faults}).slice(0,8000));
 assert.deepEqual(severe,[],'Serious axe findings in guide sample');
 assert.deepEqual(faults,[],'Guide page overflow/browser/landmark defects');
 console.log('PASS all 9 guides × 4 responsive widths and print/keyboard; axe sample complete');
})().catch(e=>{console.error(e);process.exitCode=1});
