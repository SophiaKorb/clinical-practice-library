// Library-wide review browser QA; local candidate only, no production requests or PHI.
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const axe=require('axe-core');
const base='http://127.0.0.1:8765';
const targets=[
 {path:'/resources/index.html',skip:'#main-content',target:'main-content'},
 {path:'/resources/complete-resource-inventory.html',skip:'#main-content',target:'main-content'},
 {path:'/resources/clinical-resource-finder.html',skip:'#finder',target:'finder'}
];
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 let checked=0;const violations=[];
 try{
  for(const width of [320,390,768,1280]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   const page=await context.newPage();const jsErrors=[];
   page.on('pageerror',e=>jsErrors.push(e.message));
   for(const route of targets){
    const response=await page.goto(base+route.path,{waitUntil:'load'});
    assert.equal(response.status(),200,route.path+' HTTP response at '+width);
    await page.keyboard.press('Tab');
    const focus=await page.evaluate(()=>{
     const el=document.activeElement,b=el.getBoundingClientRect();
     return {href:el.getAttribute('href'),visible:b.top>=0&&b.bottom<=innerHeight&&b.right<=innerWidth,outline:getComputedStyle(el).outlineStyle};
    });
    assert.equal(focus.href,route.skip,route.path+' skip first Tab at '+width);
    assert.ok(focus.visible&&focus.outline!=='none',route.path+' skip visible focus at '+width);
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>document.activeElement?.id),route.target,route.path+' skip focus target at '+width);
    const metrics=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
    assert.ok(metrics.scroll<=metrics.client+1,route.path+' horizontal overflow at '+width+' '+JSON.stringify(metrics));
    if(width===390){
      await page.addScriptTag({content:axe.source});
      const a=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','best-practice']}}));
      const issues=a.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.slice(0,5).map(n=>n.target),count:v.nodes.length}));
      violations.push(...issues.filter(v=>v.impact==='critical'||v.impact==='serious').map(v=>({path:route.path,...v})));
      console.log('AXE',route.path,'rules',a.passes.length,'issues',JSON.stringify(issues));
    }
    await page.emulateMedia({media:'print'});
    if(route.path.includes('inventory')){
      assert.equal(await page.locator('.cpl-static-nav').evaluate(el=>getComputedStyle(el).display),'none','Printed inventory nav hidden');
    }
    if(route.path.includes('index.html')||route.path.includes('inventory')){
      assert.equal(await page.locator('.cpl-skip').evaluate(el=>getComputedStyle(el).display),'none','Printed skip hidden');
    }
    await page.emulateMedia({media:'screen'});
    assert.deepEqual(jsErrors,[],route.path+' browser exceptions at '+width);
    console.log('PASS',width,route.path,'skip, focus, overflow, print');
    checked++;
   }
   await page.goto(base+'/resources/clinical-resource-finder.html?q=aphasia',{waitUntil:'load'});
   assert.ok((await page.locator('#finder-status').textContent()).includes('matching resources'),'Finder status missing');
   assert.ok((await page.locator('.finder-card').count())>0,'No aphasia results');
   await page.locator('#finder-query').fill('school');
   assert.ok((await page.locator('#finder-status').textContent()).includes('matching resources'),'Search status missing');
   await page.locator('#finder-reset').click();
   assert.equal(await page.locator('#finder-query').inputValue(),'','Finder reset did not clear query');
   await page.goto(base+'/resources/complete-resource-inventory.html',{waitUntil:'load'});
   await page.locator('#inventory-scope').selectOption('all');
   assert.equal(await page.locator('.resource-entry:not([hidden])').count(),776,'Expected restored inventory entries');
   await page.locator('#inventory-query').fill('practica');
   assert.ok((await page.locator('.resource-entry:not([hidden])').count())>0,'Spanish accent-insensitive search failed');
   await page.locator('#inventory-query').fill('');
   await page.locator('#inventory-scope').selectOption('legacy');
   assert.equal(await page.locator('.resource-entry:not([hidden])').count(),268,'Legacy scope should show 268 records');
   await context.close();
  }
  assert.deepEqual(violations,[],'High-impact axe violations on discovery routes: '+JSON.stringify(violations));
 }finally{await browser.close();}
 console.log('PASS CPL library-wide browser review:',checked,'route/width combinations, search, scope and keyboard');
})().catch(e=>{console.error(e);process.exitCode=1});
