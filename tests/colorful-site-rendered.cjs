/* Rendered CPL preview smoke tests. Runs in GitHub Actions with Chromium.
   Exercises high-traffic tools and the DSM course at four viewport widths. */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const assert=require('node:assert/strict');
const root='http://127.0.0.1:8765';
const out='/tmp/cpl-phase-8b-rendered';
const routes=[
 ['dsm','/resources/training/dsm-from-zero.html'],
 ['visual','/resources/therapy/visual-reasoning-toolkit.html'],
 ['communication','/resources/therapy/communication-supports-toolkit.html'],
 ['treatment','/resources/therapy/treatment-plan-menu.html'],
 ['finder','/resources/clinical-resource-finder.html'],
 ['topics','/resources/clinical-topics/index.html']
];
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 let visited=0;
 const errors=[];
 try{
  for(const width of [320,390,768,1280]){
   const context=await browser.newContext({viewport:{width,height:850},deviceScaleFactor:1,reducedMotion:'reduce'});
   const page=await context.newPage();
   page.on('pageerror',e=>errors.push(width+' JS error: '+e.message));
   for(const [name,url] of routes){
    const response=await page.goto(root+url,{waitUntil:'load',timeout:25000});
    assert.ok(response,'navigation response '+name);
    assert.equal(response.status(),200,'HTTP 200: '+name);
    await page.locator('h1').first().waitFor({state:'visible'});
    const geometry=await page.evaluate(()=>({
     width:document.documentElement.scrollWidth,
     client:document.documentElement.clientWidth,
     navigation:document.querySelectorAll('nav.cpl-static-nav').length,
     heading:document.querySelectorAll('h1').length,
     viewport:window.innerWidth
    }));
    assert.equal(geometry.navigation,1,'single global navigation '+name+' @ '+width);
    assert.equal(geometry.heading,1,'one h1 '+name+' @ '+width);
    if(geometry.width>geometry.viewport+3){
     const offenders=await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>window.innerWidth+3).slice(0,8).map(e=>({tag:e.tagName,cls:String(e.className).slice(0,70),id:e.id,right:Math.round(e.getBoundingClientRect().right)})));
     errors.push(name+' @'+width+' horizontal overflow '+JSON.stringify({geometry,offenders}));
    }
    visited++;
    if((width===390||width===1280)){
     await page.screenshot({path:path.join(out,'cpl-'+name+'-'+width+'.png'),animations:'disabled'});
    }
    if(name==='dsm'){
     assert.equal(await page.locator('.lesson').count(),12,'11 lessons and summary');
     assert.equal(await page.locator('[data-quiz]').count(),99);
     assert.equal(await page.locator('.worked-example').count(),33);
     assert.equal(await page.locator('.course-color-key').count(),1);
     const quiz=page.locator('#lesson-7 details.practice-set');
     await quiz.locator('summary').click();
     const first=quiz.locator('[data-quiz]').first();
     await first.locator('button[data-answer="yes"]').click();
     assert.equal(await first.locator('.feedback').getAttribute('data-result'),'correct');
     const green=await first.locator('.feedback').evaluate(e=>getComputedStyle(e).backgroundColor);
     await first.locator('button[data-answer="no"]').first().click();
     assert.equal(await first.locator('.feedback').getAttribute('data-result'),'incorrect');
     const red=await first.locator('.feedback').evaluate(e=>getComputedStyle(e).backgroundColor);
     assert.notEqual(green,red,'correct and incorrect feedback distinctly styled');
     await page.locator('#vocab-dock-details>summary').click();
     await page.locator('#vocab-search').fill('naloxone');
     const matches=await page.locator('[data-vocab-entry]').evaluateAll(els=>els.filter(x=>!x.hidden).map(x=>x.querySelector('dt').textContent));
     assert.deepEqual(matches,['Naloxone'],'glossary search filters');
     await page.locator('#vocab-close').click();
     if(width===390){
      await page.locator('#lesson-7').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(out,'cpl-dsm-sud-mobile.png'),animations:'disabled'});
      await page.pdf({path:path.join(out,'cpl-dsm-print.pdf'),format:'Letter',printBackground:true});
     }
    }
    if(name==='visual'){
     const items=page.locator('[data-level]');
     assert.equal(await items.count(),6,'six thermometer levels');
     await items.nth(3).click();
     assert.equal(await items.nth(3).getAttribute('aria-pressed'),'true');
    }
    if(name==='communication'){
     assert.ok(await page.locator('details').count()>=10,'progressive disclosure available');
    }
    if(name==='treatment'){
     assert.ok(await page.locator('button').count()>=3,'interactive planning controls');
    }
   }
   await context.close();
  }
 }finally{await browser.close()}
 assert.deepEqual(errors,[],'No JS error or document-width overflow');
 console.log('PASS CPL rendered: '+visited+' page-view combinations; DSM quiz/colors/glossary, visual-scale interaction, 320/390/768/1280 geometry, screenshots and printable DSM.');
})().catch(e=>{console.error(e);process.exitCode=1});
