// Accessible local artifact review; no production network or PHI.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),axe=require('axe-core');
const file=path.resolve(__dirname,'../../review-artifacts/cpl-resource-coverage-dashboard.html');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [320,390,768,1280]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
   await page.goto('file://'+file,{waitUntil:'load'});
   assert.equal(await page.locator('tbody tr').count(),802);
   await page.keyboard.press('Tab');
   assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('href')),'#main');
   const focus=await page.evaluate(()=>{const b=document.activeElement.getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight});
   assert.ok(focus,'Skip must visibly focus at '+width);
   await page.keyboard.press('Enter');
   assert.equal(await page.evaluate(()=>document.activeElement?.id),'main');
   const metrics=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
   assert.ok(metrics.scroll<=metrics.width+1,'Mobile overflow: '+JSON.stringify(metrics));
   await page.locator('#scope').selectOption('current');
   assert.equal(await page.locator('tbody tr:not([hidden])').count(),508);
   await page.locator('#scope').selectOption('historical');
   assert.equal(await page.locator('tbody tr:not([hidden])').count(),268);
   await page.locator('#scope').selectOption('unindexed');
   assert.equal(await page.locator('tbody tr:not([hidden])').count(),26);
   await page.locator('#scope').selectOption('all');
   await page.locator('#format').selectOption('PDF');
   assert.equal(await page.locator('tbody tr:not([hidden])').count(),61);
   await page.locator('#format').selectOption('all');
   if(width===390){
    await page.addScriptTag({content:axe.source});
    const a=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','best-practice']}}));
    console.log('DASHBOARD_AXE '+JSON.stringify(a.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length}))));
    assert.deepEqual(a.violations.map(v=>v.id),[],'Dashboard needs accessible rendering');
   }
   await page.emulateMedia({media:'print'});
   assert.equal(await page.locator('.filters').evaluate(el=>getComputedStyle(el).display),'none');
   console.log('PASS_MATRIX_DASHBOARD '+width+' 802 rows, filters, keyboard, print');
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
