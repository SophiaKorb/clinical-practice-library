// Review-only Chromium sampling of trauma resources, printed layout, keyboard first-tab focus, axe.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright'),axe=require('axe-core');
const edited=[
'/resources/trauma/start-here-families-children-trauma.html',
'/resources/trauma/children-families-trauma-curated-clinical-guide.html',
'/resources/trauma/trauma-school-neurodevelopment-crosswalk.html',
'/resources/trauma/caregiver-family-youth-trauma-resources.html',
'/resources/trauma/foster-kinship-adoption-child-welfare.html',
'/resources/therapy/trauma-ptsd-practical-toolkit.html',
'/resources/handouts/grounding.html',
'/resources/handouts/my-grounding-menu.html'
];
const others=[
'/resources/therapy/trauma-ptsd-start-here.html',
'/resources/therapy/trauma-stewardship-self-care-vicarious-trauma.html',
'/resources/clinical-topics/trauma-cue-orientation/formulation.html',
'/resources/clinical-depth/complex-dissociation-functional-care.html'
];
const routes=[...edited,...others];
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const axeIssues=[],faults=[],results=[];
 try{
  for(const width of [320,390,768,1280]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   const page=await context.newPage();
   let jsErrors=[];page.on('pageerror',e=>jsErrors.push(e.message));
   for(const route of routes){
    jsErrors=[];const response=await page.goto('http://127.0.0.1:8765'+route,{waitUntil:'load',timeout:30000});
    assert.equal(response.status(),200,'Resource not found '+route);
    const metrics=await page.evaluate(()=>({
      width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,
      mainCount:document.querySelectorAll('main').length,h1Count:document.querySelectorAll('h1').length,
      documentLang:document.documentElement.lang||'MISSING'
    }));
    if(metrics.scroll>metrics.width+1)faults.push({route,width,type:'horizontal document overflow',pixels:metrics.scroll-metrics.width});
    if(jsErrors.length)faults.push({route,width,type:'pageerror',errors:jsErrors});
    if(metrics.mainCount!==1||metrics.h1Count!==1||metrics.documentLang==='MISSING')faults.push({route,width,type:'structure',metrics});
    let skipResult='EXISTING_TEMPLATE_NOT_FOCUS_TESTED';
    if(edited.includes(route)){
      await page.keyboard.press('Tab');
      const focus=await page.evaluate(()=>{
        const el=document.activeElement,b=el.getBoundingClientRect();
        return {href:el?.getAttribute('href'),visible:b.top>=0&&b.bottom<=innerHeight,
          outline:getComputedStyle(el).outlineStyle};
      });
      assert.equal(focus.href,'#main-content','Missing first-tab skip '+route+' @'+width);
      assert.ok(focus.visible&&focus.outline!=='none','Skip not visibly focused '+route+' @'+width);
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(()=>document.activeElement?.id),'main-content','Skip target not focused '+route+' @'+width);
      skipResult='VISIBLE_AND_FOCUSABLE';
    }
    if(width===390){
      await page.addScriptTag({content:axe.source});
      const report=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','best-practice']}}));
      const issues=report.violations.map(x=>({route,id:x.id,impact:x.impact,nodeCount:x.nodes.length,targets:x.nodes.slice(0,4).map(n=>n.target)}));
      axeIssues.push(...issues);
      console.log('TRAUMA_AXE '+route+' '+JSON.stringify(issues));
    }
    await page.emulateMedia({media:'print'});
    if(edited.includes(route))assert.equal(await page.locator('.cpl-skip').evaluate(el=>getComputedStyle(el).display),'none','Skip prints '+route);
    await page.emulateMedia({media:'screen'});
    results.push({route,width,skipResult,axeSampled:width===390,documentOverflowPixels:metrics.scroll-metrics.width});
   }
   await context.close();
  }
 }finally{await browser.close();}
 const summary={routes:routes.length,editedRoutes:edited.length,widths:4,routeViewportChecks:results.length,
  axeSampledPages:routes.length,axeTotalViolations:axeIssues.length,seriousAxeViolations:axeIssues.filter(x=>['critical','serious'].includes(x.impact)).length,
  browserAndOverflowFaults:faults.length,nativeAssistiveTechnology:'NOT_TESTED',
  physicalPrint:'NOT_TESTED',clinicalContentApproval:'PENDING_HUMAN'};
 const out=path.resolve('review-artifacts');fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'cpl-trauma-browser-review.json'),JSON.stringify({summary,axeIssues,faults,results},null,2)+'\n');
 console.log('TRAUMA_BROWSER_SUMMARY '+JSON.stringify(summary));
 console.log('TRAUMA_BROWSER_FAILURES '+JSON.stringify({axeIssues,faults}).slice(0,8500));
 assert.deepEqual(axeIssues.filter(x=>['critical','serious'].includes(x.impact)),[],'Serious browser accessibility findings require source-level investigation');
 assert.deepEqual(faults,[],'Browser errors or horizontal document overflow');
 console.log('PASS CPL trauma resource browser sample; this is not clinical or native AT certification');
})().catch(e=>{console.error(e);process.exitCode=1});
