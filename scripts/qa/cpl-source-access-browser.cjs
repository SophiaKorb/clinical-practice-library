// Technical accessibility sampling independent of native screen-reader evaluation.
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright'),axe=require('axe-core');
const root='http://127.0.0.1:8765';
const edited=[
'/resources/handouts/making-a-suicide-crisis-safer.html',
'/resources/handouts/suspected-opioid-overdose.html',
'/resources/handouts/safety-planning-preparation-sheet.html',
'/resources/assessment/assessment-start-here.html',
'/resources/es/handouts/hacer-crisis-suicida-mas-segura.html',
'/resources/es/handouts/hacer-mas-segura-crisis-suicida.html'
];
const more=[
'/resources/therapy/anxiety-exposure-ocd-start-here.html',
'/resources/therapy/trauma-ptsd-start-here.html',
'/resources/therapy/treatment-plan-menu.html',
'/resources/clinical-depth/self-harm-safety-continuity.html',
'/resources/start-here.html'
];
const routes=[...edited,...more];
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const violations=[],errors=[],otherFindings=[];
 try{
  for(const width of [320,390,768,1280]){
   const ctx=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
   const page=await ctx.newPage();
   page.on('pageerror',e=>errors.push('Javascript '+e.message));
   for(const route of routes){
    const res=await page.goto(root+route,{waitUntil:'load'});
    assert.equal(res.status(),200,'route HTTP status '+route);
    const sizing=await page.evaluate(()=>({inner:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,main:document.querySelectorAll('main').length}));
    if(sizing.main!==1)errors.push(route+' main landmarks '+sizing.main);
    if(sizing.scroll>sizing.inner+1)errors.push(width+' '+route+' horizontal overflow '+JSON.stringify(sizing));
    await page.keyboard.press('Tab');
    if(edited.includes(route)){
      const skip=await page.evaluate(()=>{
       const e=document.activeElement, b=e.getBoundingClientRect();
       return {href:e?.getAttribute('href'),visible:b.top>=0&&b.bottom<=innerHeight,outline:getComputedStyle(e).outlineStyle};
      });
      assert.equal(skip.href,'#main-content',width+' skip link '+route);
      assert.ok(skip.visible&&skip.outline!=='none',width+' visibly focused skip '+route);
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(()=>document.activeElement?.id),'main-content',width+' skip destination '+route);
    }else if(width===390){
      otherFindings.push({route,firstTab:(await page.evaluate(()=>document.activeElement?.outerHTML.slice(0,160)))});
    }
    if(width===390){
      await page.addScriptTag({content:axe.source});
      const report=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}}));
      const failing=report.violations.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length,targets:v.nodes.slice(0,4).map(n=>n.target)}));
      if(failing.length)violations.push({route,issues:failing});
      console.log('AXE '+route+' '+JSON.stringify(failing));
    }
    await page.emulateMedia({media:'print'});
    if(edited.includes(route)){
      const hidden=await page.locator('.cpl-skip').evaluate(el=>getComputedStyle(el).display);
      assert.equal(hidden,'none',route+' printed skip link');
    }
    await page.emulateMedia({media:'screen'});
    console.log('PASS '+width+' '+route+' page and viewport');
   }
   await ctx.close();
  }
 }finally{await browser.close();}
 console.log('ACCESSIBILITY_SUMMARY '+JSON.stringify({sampledRoutes:routes.length,widths:4,issues:violations,otherFindings,jsOrOverflowErrors:errors}));
 assert.deepEqual(errors,[],'Browser errors or layout overflow');
 assert.deepEqual(violations.filter(g=>g.issues.some(v=>['critical','serious'].includes(v.impact))),[],'Serious axe failures in sampled pages');
 console.log('PASS CPL deep source/accessibility browser sample');
})().catch(e=>{console.error(e);process.exitCode=1});
