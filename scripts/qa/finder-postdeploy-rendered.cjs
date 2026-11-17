'use strict';
/* Post-release candidate browser review. Reflow at 640/320 CSS-px is a proxy for
   200%/400% zoom of a 1280px window, NOT a claim of native user-agent zoom QA. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(process.cwd(),'qa-artifacts/pr43/finder-postdeploy');
fs.mkdirSync(root,{recursive:true});
const base=process.env.CPL_QA_ORIGIN||'http://127.0.0.1:8765';
(async()=>{
 const browser=await chromium.launch({headless:true});
 const details=[];
 try{
  for(const width of [1280,640,390,320]){
   const ctx=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
   const page=await ctx.newPage();
   const pageErrors=[];
   page.on('pageerror',e=>pageErrors.push(e.message));
   const response=await page.goto(base+'/resources/clinical-resource-finder.html',{waitUntil:'networkidle'});
   assert.equal(response.status(),200);
   assert.equal(await page.locator('.result-card').count(),10);
   let metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    width:document.documentElement.clientWidth}));
   assert(metrics.overflow<=2,'Reflow overflow at '+width+' CSS px: '+JSON.stringify(metrics));
   await page.fill('#lab-q','autistic child being bullied in school');
   await page.selectOption('#lab-population','children');
   await page.selectOption('#lab-audience','caregiver');
   const top=await page.locator('#lab-results .result-card h3 a').first().innerText();
   assert.match(top,/Friendship & Peer Safety/,'Caregiver peer-safety discovery failed at '+width);
   assert.match(await page.locator('#lab-results .result-card').first().innerText(),/friendship|teasing|peer safety/i,'No source-specific card preview');
   await page.screenshot({path:path.join(root,'caregiver-peer-safety-'+width+'.png'),fullPage:true});
   await page.fill('#lab-q','teen self harm worksheet');
   await page.selectOption('#lab-population','teens');
   await page.selectOption('#lab-audience','');
   assert.equal(await page.locator('#lab-unclassified').isHidden(),false,'Age-unclassified results absent');
   const unclassified=await page.locator('#lab-unclassified').innerText();
   assert.match(unclassified,/unverified age coverage/,'Developmental uncertainty label missing');
   assert.match(unclassified,/Safety Planning Preparation Sheet/,'Age-unclassified worksheet not discoverable');
   assert.equal(await page.locator('#lab-results a[href="/resources/handouts/safety-planning-preparation-sheet.html"]').count(),0,
    'Unverified teen worksheet incorrectly appears in age-filtered results');
   await page.screenshot({path:path.join(root,'unclassified-age-'+width+'.png'),fullPage:true});
   await page.fill('#lab-q','adult ADHD');
   await page.selectOption('#lab-population','');
   await page.selectOption('#lab-audience','caregiver');
   const first=page.locator('#lab-results .result-card').first();
   const summary=first.locator('details.family summary');
   assert(await summary.count(),'No multi-format collection disclosure');
   await summary.click();
   const links=await first.locator('details.family a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
   assert(!links.some(x=>x&&x.includes('/client-workbook.html')),'Collection UI ignores audience filter');
   await page.fill('#lab-q','nonsense_nonexistent_resource_xyz');
   await page.selectOption('#lab-audience','');
   assert(await page.locator('#lab-empty').isVisible(),'No-match recovery must be visible');
   await page.locator('#lab-recover').click();
   assert.equal(await page.evaluate(()=>document.activeElement.id),'lab-q','Filter-recovery focus not returned to search');
   await page.fill('#lab-q','after school meltdowns');
   await page.selectOption('#lab-audience','caregiver');
   await page.locator('#lab-q').focus();
   await page.keyboard.press('Tab');
   assert.equal(await page.evaluate(()=>document.activeElement.className),'search-action','Keyboard submit not reachable');
   await page.addScriptTag({path:require.resolve('axe-core')});
   const axe=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
   fs.writeFileSync(path.join(root,'axe-'+width+'.json'),JSON.stringify({violations:axe.violations,incomplete:axe.incomplete},null,2));
   assert.equal(axe.violations.filter(v=>v.impact==='critical'||v.impact==='serious').length,0,
     'Serious/critical axe findings at '+width);
   metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    width:document.documentElement.clientWidth}));
   assert(metrics.overflow<=2,'Post-search overflow at '+width);
   assert.deepEqual(pageErrors,[],'Browser script errors '+width);
   if(width===1280){
    await page.emulateMedia({forcedColors:'active'});
    await page.screenshot({path:path.join(root,'forced-colors.png'),fullPage:true});
    await page.emulateMedia({forcedColors:'none'});
    const pdf=await page.pdf({format:'Letter',printBackground:false});
    fs.writeFileSync(path.join(root,'browser-print-sample.pdf'),pdf);
   }
   details.push({viewportCSSPixels:width,reflowScaleProxy:1280/width,overflowCSSPixels:metrics.overflow,axeWCAGViolations:axe.violations.length,knownAgeSeparation:true,keyboard:true,relatedFormatFilter:true});
   await ctx.close();
  }
  fs.writeFileSync(path.join(root,'rendered-summary.json'),JSON.stringify({result:'PASS',scope:'Chromium 1280/640/390/320 CSS px, keyboard, axe, forced colors and browser print. No native AT/actual browser zoom/physical print claim.',details},null,2));
  console.log('FINDER_POSTDEPLOY_RENDERED_PASS '+JSON.stringify(details));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
