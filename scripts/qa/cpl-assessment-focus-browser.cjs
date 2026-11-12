// Chromium browser test of shared-template assessment pages. Review-only and synthetic.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),axe=require('axe-core');
const routes=["resources/assessment/adhd-autism-trauma-differential-matrix.html","resources/assessment/broad-intake-depression-anxiety-outcomes.html","resources/assessment/broad-intake-form-downloads.html","resources/assessment/free-official-measure-source-guide.html","resources/assessment/functioning-disability-formal-testing.html","resources/assessment/functioning-formal-testing-downloads.html","resources/assessment/ocd-bipolar-psychosis-substance-use-form-downloads.html","resources/assessment/ocd-bipolar-psychosis-substance-use.html","resources/assessment/pediatric-developmental-form-downloads.html","resources/assessment/pediatric-developmental-neurodevelopmental.html","resources/assessment/spanish-assessment-forms.html","resources/assessment/trauma-ptsd-dissociation-safety.html","resources/assessment/trauma-safety-form-downloads.html","resources/es/formularios-oficiales-evaluacion.html"];
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const violations=[],layoutFaults=[],results=[];
 try{
  for(const width of [320,390,768,1280]){
   const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
   const page=await context.newPage();
   let errors=[];page.on('pageerror',e=>errors.push(e.message));
   for(const route of routes){
    errors=[];const url='http://127.0.0.1:8765/'+route;
    const response=await page.goto(url,{waitUntil:'load',timeout:25000});
    assert.equal(response?.status(),200,'Resource HTTP '+route);
    await page.keyboard.press('Tab');
    const first=await page.evaluate(()=>{
      const el=document.activeElement,b=el.getBoundingClientRect();
      return {href:el?.getAttribute('href'),visible:b.top>=0&&b.bottom<=innerHeight,outline:getComputedStyle(el).outlineStyle};
    });
    assert.equal(first.href,'#main-content','First keyboard stop '+route+' @'+width);
    assert.ok(first.visible&&first.outline!=='none','Skip not visibly focused '+route+' @'+width);
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>document.activeElement?.id),'main-content','Target not focused '+route+' @'+width);
    const sizing=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
    if(sizing.scroll>sizing.width+1)layoutFaults.push({route,width,overflow:sizing.scroll-sizing.width});
    if(errors.length)layoutFaults.push({route,width,errors});
    if(width===390){
      await page.addScriptTag({content:axe.source});
      const audit=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','best-practice']}}));
      const issues=audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length,targets:v.nodes.slice(0,4).map(n=>n.target)}));
      violations.push(...issues.map(v=>({route,...v})));
      console.log('ASSESSMENT_AXE '+route+' '+JSON.stringify(issues));
    }
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('.cpl-skip').evaluate(el=>getComputedStyle(el).display),'none','Print skip not hidden '+route);
    await page.emulateMedia({media:'screen'});
    results.push({route,width,skip:'PASS',print:'PASS',overflowPx:sizing.scroll-sizing.width});
   }
   await context.close();
  }
 }finally{await browser.close();}
 const summary={routes:routes.length,widths:4,pageViewportCombinations:results.length,axeAt:'390px',axeViolations:violations.length,layoutOrJavascriptIssues:layoutFaults.length,nativeScreenReader:'NOT_TESTED',clinical:'PENDING_HUMAN'};
 const out=path.resolve('review-artifacts');fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'cpl-assessment-skip-review.json'),JSON.stringify({summary,violations,layoutFaults,results},null,2)+'\n');
 console.log('ASSESSMENT_FOCUS_SUMMARY '+JSON.stringify(summary));
 assert.deepEqual(violations.filter(v=>['serious','critical'].includes(v.impact)),[],'Serious axe issue requires correction');
 assert.deepEqual(layoutFaults,[],'Browser overflow or error requires correction');
 console.log('PASS 14 assessment pages × 4 viewports, keyboard, print and sampled axe');
})().catch(e=>{console.error(e);process.exitCode=1});
