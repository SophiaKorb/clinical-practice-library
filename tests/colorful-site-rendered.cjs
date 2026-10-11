/* Rendered CPL preview smoke tests. Runs in GitHub Actions with Chromium.
   Exercises high-traffic tools and the DSM course at four viewport widths. */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const assert=require('node:assert/strict');
const root='http://127.0.0.1:8765';
const out='/tmp/cpl-phase-8b-rendered';
const routes=[
 ['start','/resources/start-here.html'],
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
     const audience=page.locator('#audience');
     assert.equal(await audience.getAttribute('open'),null,'audience closed on load');
     await audience.locator('summary').focus();
     await page.keyboard.press('Enter');
     assert.equal(await audience.getAttribute('open'),'','keyboard opens audience');
     await page.keyboard.press('Enter');
     assert.equal(await audience.getAttribute('open'),null,'keyboard closes audience');
     assert.equal(await page.locator('.lesson').count(),12,'11 lessons and summary');
     assert.equal(await page.locator('[data-quiz]').count(),99);
     assert.equal(await page.locator('.worked-example').count(),33);
     assert.equal(await page.locator('.course-color-key').count(),1);
     assert.equal(await page.locator('.worked-example .worked-steps li').count(),132,'33 cases with four numbered steps');
     const questionReview=page.locator('#all-questions-toggle');
     await questionReview.click();
     assert.equal(await questionReview.getAttribute('aria-pressed'),'true','all questions review enabled');
     assert.equal(await page.locator('details.practice-set[open], details.optional-bank[open]').count(),22,'all practice banks opened');
     assert.ok(await page.locator('#lesson-11 .check').last().isVisible(),'last question can be viewed');
     await questionReview.click();
     assert.equal(await questionReview.getAttribute('aria-pressed'),'false','lesson view restored');
     assert.equal(await page.locator('details.practice-set[open], details.optional-bank[open]').count(),0,'original disclosure state restored');
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
    if(name==='start'){
     assert.equal(await page.locator('.door-grid .door').count(),3,'exactly three high-level routes');
     assert.equal(await page.locator('.route-cycle .cycle-stage').count(),4,'four linked stages');
     const cycleCols=await page.locator('.route-cycle').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length);
     assert.equal(cycleCols,width<=760?1:7,'responsive decision loop '+width);
     assert.ok(await page.locator('a[href="/resources/clinical-depth/complex-dissociation-functional-care.html#assessment-instruments"]').count()>=1);
    }
    if(name==='visual'){
     const fork=page.locator('#decision .decision-branches');
     const branches=await fork.evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length);
     assert.equal(branches,2,'safety alternatives remain parallel at '+width);
     assert.equal(await page.locator('#decision svg.branch-fork').count(),1,'visible fork connector');
     const firstVisual=await page.locator('#decision .visual').boundingBox();
     assert.ok(firstVisual,'decision graphic actually exists '+width);
     if(width<=390)assert.ok(firstVisual.y<480,'first graphic visible on initial phone viewport: y='+firstVisual.y+' @'+width);
     const toolMenu=page.locator('details.tool-jump');
     assert.equal(await toolMenu.count(),1,'one compact tool menu');
     assert.equal(await toolMenu.getAttribute('open'),null,'tool menu starts collapsed');
     await toolMenu.locator('summary').click();
     assert.ok(await toolMenu.locator('.menu a').count()>=8,'all other visuals remain reachable');
     await toolMenu.locator('summary').click();
     assert.equal(await page.locator('.loop-figure .loop .node').count(),4,'four distinct cycle stages');
     assert.equal(await page.locator('.quadrant .node').count(),4,'actual two-by-two matrix');
     const layout=await page.locator('.loop-figure .loop').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length);
     assert.equal(layout,2,'cycle stays two-dimensional at width '+width);
     const matrix=await page.locator('.quadrant').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length);
     assert.equal(matrix,2,'skill vs access matrix stays two-dimensional at width '+width);
     if(width===390){
      for(const target of ['decision','cycle','quadrant','function']){
       const selector=target==='decision'?'#decision .visual':target==='cycle'?'#cycle .loop':target==='quadrant'?'#quadrant .quadrant':'#function .visual';
       await page.locator(selector).screenshot({path:path.join(out,'cpl-visual-'+target+'-390.png'),animations:'disabled'});
      }
     }
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
