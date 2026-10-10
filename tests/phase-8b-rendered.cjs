/* Actual Chromium render smoke for Phase 8B. No PHI, no external browser plugin. */
const { chromium } = require('playwright');
const fs = require('node:fs'), path = require('node:path');
const assert = require('node:assert/strict');
const url = 'http://127.0.0.1:8765';
const output = '/tmp/cpl-phase-8b-rendered';
fs.mkdirSync(output,{recursive:true});
const cases=[
 ['index','/resources/clinical-depth/index.html'],
 ['safety','/resources/clinical-depth/self-harm-safety-continuity.html'],
 ['dissociation','/resources/clinical-depth/complex-dissociation-functional-care.html'],
 ['personality','/resources/clinical-depth/complex-personality-longitudinal-care.html'],
 ['assessment','/resources/clinical-depth/neuropsych-evaluation-access-validity.html'],
 ['report','/resources/clinical-depth/assessment-decision-report-planner.html'],
 ['function','/resources/clinical-depth/dissociation-function-observation.html'],
 ['homepage','/']
];
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 let issues=[];
 for(const width of [320,390,768,1280]){
  const context=await browser.newContext({viewport:{width,height:820},deviceScaleFactor:1, reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',e=>issues.push(width+' JS: '+e.message));
  for(const [name,route] of cases){
   const response=await page.goto(url+route,{waitUntil:'load',timeout:20000});
   assert.equal(response.status(),200,route+' HTTP 200');
   await page.locator('h1').first().waitFor();
   const geo=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:window.innerWidth,nav:document.querySelectorAll('nav.cpl-static-nav').length,h1:getComputedStyle(document.querySelector('h1')).fontSize}));
   assert.equal(geo.nav,1,'single top nav '+name);
   if(geo.width>width+3)issues.push(name+' @'+width+': horizontal document overflow '+geo.width+' > '+width);
   const file=path.join(output,name+'-'+width+'.png');
   await page.screenshot({path:file,fullPage:true,animations:'disabled'});
   if(name==='safety'){
    assert.equal(await page.locator('.two-tracks .diagram-track').count(),2);
    assert.ok(await page.locator('#formulation table tbody tr').count()>=4);
   }
   if(name==='dissociation'){
    const reveal=page.locator('#case details').first();
    const sum=reveal.locator('summary');
    await sum.focus();
    await page.keyboard.press('Enter');
    assert.equal(await reveal.getAttribute('open'),'','worked case keyboard disclosure '+width);
    await page.keyboard.press('Enter');
    assert.equal(await reveal.getAttribute('open'),null,'worked case collapses '+width);
   }
   if(name==='personality'){
    assert.equal(await page.locator('.cycle-map .cycle-node').count(),5);
    assert.ok(await page.locator('#select tbody tr').count()>=4);
   }
   if(name==='assessment')assert.ok(await page.locator('#access tbody tr').count()>=4);
   if(name==='report'){
    await page.locator('textarea#decision').fill('Fictional example');
    await page.getByRole('button',{name:'Clear entries'}).click();
    assert.equal(await page.locator('textarea#decision').inputValue(),'');
   }
   if(name==='function'){
    await page.locator('textarea#task').fill('Fictional example only');
    await page.getByRole('button',{name:'Clear all entries'}).click();
    assert.equal(await page.locator('textarea#task').inputValue(),'','clear input');
   }
   if(name==='index'&&width<=390){
    const more=page.locator('.cpl-static-nav__more');
    const sum=more.locator('summary');
    await sum.focus();
    await page.keyboard.press('Enter');
    assert.equal(await more.getAttribute('open'),'','mobile More via keyboard');
    await page.keyboard.press('Enter');
   }
  }
  if(width===390){
   await page.goto(url+'/resources/clinical-depth/self-harm-safety-continuity.html');
   await page.pdf({path:path.join(output,'safety-print.pdf'),format:'Letter',printBackground:true});
   await page.goto(url+'/resources/clinical-depth/complex-dissociation-functional-care.html');
   await page.pdf({path:path.join(output,'dissociation-print.pdf'),format:'Letter',printBackground:true});
  }
  await context.close();
 }
 for(const file of ['safety-print.pdf','dissociation-print.pdf']){
   const bytes=fs.readFileSync(path.join(output,file));
   assert.ok(bytes.subarray(0,5).toString()==='%PDF-','valid PDF '+file);
 }
 await browser.close();
 if(issues.length)throw Error(issues.join('\n'));
 console.log('PASS 8 routes at 320/390/768/1280; Chromium screenshots, no document overflow, print PDFs, keyboard disclosure and native More, clear fields');
})().catch(e=>{console.error(e);process.exitCode=1});
