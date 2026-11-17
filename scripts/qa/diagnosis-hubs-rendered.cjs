'use strict';
/* Browser review of diagnosis hubs, one resource per catalog match, nonproduction. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const base=process.env.CPL_QA_ORIGIN||'http://127.0.0.1:8765';
const dir=path.resolve(process.cwd(),'qa-artifacts/diagnosis-hubs');
fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 let results=[];
 try{
  for(const width of [1280,640,390,320]){
   const ctx=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
   const page=await ctx.newPage(),errs=[];page.on('pageerror',e=>errs.push(e.message));
   let resp=await page.goto(base+'/resources/diagnoses/adult-adhd.html',{waitUntil:'networkidle'});
   assert.equal(resp.status(),200);
   assert.match(await page.locator('h1').innerText(),/Adult ADHD/);
   assert.equal(await page.locator('#direct-adhd .resource-list > li').count(),12,'Original 19 links should appear in 12 grouped cards');
   assert.equal(await page.locator('#direct-adhd .resource-list a').count(),19,'No original tagged resource link may be lost');
   assert.equal(await page.locator('#direct-adhd .companion-bundle a').count(),8,'Focused toolkit needs one main and seven companion links');
   assert.equal(await page.locator('#direct-adhd .companion-bundle').count(),1,'Focused toolkit must be one grouped card');
   assert.equal(await page.locator('#related-supports .handout-grid li').count(),12,'Cross-diagnostic support count changed');
   const jump=page.locator('a[href="#assessment"]').first();await jump.focus();
   assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')),'#assessment');
   const tooWide=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert(tooWide<=2,'Adult guide horizontal overflow '+width+' '+tooWide);
   await page.screenshot({path:path.join(dir,'adult-adhd-'+width+'.png'),fullPage:true});
   // Adult ADHD supplementary collection: actual pages, screen-width reflow, keyboard and map interaction.
   const collectionPages=['index','assessment','psychotherapy','everyday-life','treatment-planning','printable-worksheets','interactive-barrier-map'];
   for(const slug of collectionPages){
    const url=base+'/resources/diagnoses/adult-adhd-collection/'+slug+'.html';
    const loaded=await page.goto(url,{waitUntil:'networkidle'});
    assert.equal(loaded.status(),200,'Missing ADHD collection page '+slug);
    assert(await page.locator('h1').count()===1,'Missing heading '+slug);
    const over=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    assert(over<=2,'Collection horizontal overflow '+slug+' '+width+': '+over);
    await page.locator('a.skip').focus();
    assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('skip')),true,'Unfocusable skip link '+slug);
    if(slug==='interactive-barrier-map'){
     await page.locator('#target').fill('Bring materials to an appointment');
     await page.locator('#barrier').selectOption('Remembering');
     await page.locator('#support').fill('Place materials near the door');
     await page.locator('#view').click();
     assert.equal(await page.locator('#v-support').innerText(),'Place materials near the door');
     await page.locator('#clear').click();
     assert.equal(await page.locator('#result').isHidden(),true,'Reset does not clear visual');
    }
    await page.addScriptTag({path:require.resolve('axe-core')});
    const accessibility=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
    assert.equal(accessibility.violations.filter(v=>['critical','serious'].includes(v.impact)).length,0,'Collection serious axe violation '+slug+' '+width+': '+JSON.stringify(accessibility.violations.map(v=>v.id)));
    if(width===390||width===1280)await page.screenshot({path:path.join(dir,'adhd-collection-'+slug+'-'+width+'.png'),fullPage:true});
    if(width===1280&&slug==='printable-worksheets'){
     await page.emulateMedia({media:'print'});
     assert(await page.locator('a.skip').isHidden(),'Focused skip link must not print in adult ADHD worksheets');
     const pdf=await page.pdf({format:'Letter',printBackground:false});
     assert(pdf.length>4000,'Print worksheet PDF unexpectedly tiny');
     fs.writeFileSync(path.join(dir,'adhd-collection-worksheets-print.pdf'),pdf);
     await page.emulateMedia({media:'screen'});
    }
   }
   const cmPages=['youth-morning','youth-schoolwork','youth-transitions','youth-cft','youth-repair','youth-stepup','youth-adhd-support','index','appointments','paperwork','time','tasks','home','medication','money','work','communication','relationships','crisis','shared-plan','session-packet','practice-guide','session-choice-map'];
   for(const slug of cmPages){
    const url=base+'/resources/diagnoses/adult-adhd-collection/case-management/'+slug+'.html';
    const loaded=await page.goto(url,{waitUntil:'networkidle'});
    assert.equal(loaded.status(),200,'Missing case-manager resource '+slug);
    assert.equal(await page.locator('h1').count(),1,'Case manager page heading '+slug);
    const over=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    if(over>2){
     const offenders=await page.evaluate(()=>[...document.querySelectorAll('main *, header *, footer *')].filter(el=>{const r=el.getBoundingClientRect();return r.right>innerWidth+2||r.left < -2}).slice(0,8).map(el=>({tag:el.tagName,text:(el.textContent||'').slice(0,65),right:Math.round(el.getBoundingClientRect().right)})));
     throw new Error('Case manager resource horizontal overflow '+slug+' '+width+': '+over+'; offenders '+JSON.stringify(offenders));
    }
    await page.locator('a.skip').focus();
    assert.equal(await page.evaluate(()=>document.activeElement.classList.contains('skip')),true,'Case manager keyboard skip '+slug);
    if(slug==='session-choice-map'){
     await page.selectOption('#need','appointments');
     assert.equal(await page.locator('#chosen').isVisible(),true,'No visual map after selection');
     assert.equal(await page.locator('#go').getAttribute('href'),'./appointments.html','Wrong case manager activity link');
     await page.selectOption('#need','');
     assert.equal(await page.locator('#chosen').isHidden(),true,'Reset selection does not clear map');
    }
    if(['index','appointments','paperwork','session-packet','practice-guide','session-choice-map'].includes(slug)){
     await page.addScriptTag({path:require.resolve('axe-core')});
     const a=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
     assert.equal(a.violations.filter(v=>['critical','serious'].includes(v.impact)).length,0,'Case manager serious accessibility issue '+slug+' '+width+': '+JSON.stringify(a.violations.map(v=>v.id)));
    }
    if(width===390&&['index','appointments','session-choice-map'].includes(slug))await page.screenshot({path:path.join(dir,'adhd-case-management-'+slug+'-390.png'),fullPage:true});
    if(width===1280&&slug==='session-packet'){
     await page.emulateMedia({media:'print'});
     assert(await page.locator('a.skip').isHidden(),'Focused skip link must not print in case-manager packet');
     const pdf=await page.pdf({format:'Letter',printBackground:false});
     assert(pdf.length>4000,'Case-manager worksheet PDF unexpectedly tiny');
     fs.writeFileSync(path.join(dir,'adhd-case-management-browser-print.pdf'),pdf);
     await page.emulateMedia({media:'screen'});
    }
   }
   // Comprehensive diagnosis-depth pages — new review-only content, isolated from protected catalog.
   const comprehensivePages=['index','autism','anxiety-ocd','depression','trauma-dissociation',
      'learning-disorders','psychosis-bipolar','substance-use','persistent-conflict',
      'eating-disorders','tic-repetitive-behavior','intellectual-disability',
      'sleep-conditions','grief-bereavement','dyslexia','dyscalculia','dysgraphia'];
   if(width===390||width===1280){
    for(const slug of comprehensivePages){
     const route='/resources/diagnoses/comprehensive/'+slug+'.html';
     const opened=await page.goto(base+route,{waitUntil:'domcontentloaded'});
     assert.equal(opened.status(),200,'Missing comprehensive guide '+slug);
     assert.equal(await page.locator('h1').count(),1,'Missing or duplicate primary heading '+slug);
     assert(await page.locator('a.skip').count()===1,'Keyboard skip link missing '+slug);
     await page.locator('a.skip').focus();
     assert(await page.evaluate(()=>document.activeElement.classList.contains('skip')),'Skip link cannot receive focus '+slug);
     const over=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
     assert(over<=2,'Horizontal reflow failure '+slug+' '+width+' overflow '+over);
     await page.addScriptTag({path:require.resolve('axe-core')});
     const ax=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
     fs.writeFileSync(path.join(dir,'comprehensive-axe-'+slug+'-'+width+'.json'),JSON.stringify({violations:ax.violations,incomplete:ax.incomplete},null,2));
     assert.equal(ax.violations.filter(v=>['serious','critical'].includes(v.impact)).length,0,
       'Serious comprehensive guide accessibility violation '+slug+' '+width+': '+JSON.stringify(ax.violations.map(v=>v.id)));
     await page.screenshot({path:path.join(dir,'comprehensive-'+slug+'-'+width+'.png'),fullPage:true});
     if(width===1280&&slug==='learning-disorders'){
      const pdf=await page.pdf({format:'Letter',printBackground:false});
      assert(pdf.length>3000,'Printed learning guide unexpectedly small');
      fs.writeFileSync(path.join(dir,'comprehensive-learning-print.pdf'),pdf);
     }
    }
   }
   if(width===390||width===1280){
    const cmSlugs=['index','adhd','autism','anxiety-ocd','depression','trauma-dissociation','learning-disorders','psychosis-bipolar','substance-use','persistent-conflict','eating-disorders','tic-repetitive-behavior','intellectual-disability','sleep-conditions','grief-bereavement'];
    for(const slug of cmSlugs){
     const route='/resources/diagnoses/comprehensive/case-management/'+slug+'.html';
     const opened=await page.goto(base+route,{waitUntil:'domcontentloaded'});
     assert.equal(opened.status(),200,'Missing case-management page '+slug);
     assert.equal(await page.locator('h1').count(),1,'Case-management heading '+slug);
     const over=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
     assert(over<=2,'Case-management overflow '+slug+' '+width+' '+over);
     await page.locator('a.skip').focus();
     assert(await page.evaluate(()=>document.activeElement.classList.contains('skip')),'Case-management skip link '+slug);
     if(['index','adhd','autism','eating-disorders','psychosis-bipolar'].includes(slug)){
      await page.addScriptTag({path:require.resolve('axe-core')});
      const ax=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
      assert.equal(ax.violations.filter(v=>['serious','critical'].includes(v.impact)).length,0,'Serious case manager axe issue '+slug+' '+width+': '+ax.violations.map(v=>v.id).join(','));
     }
     if(width===390&&['index','adhd','eating-disorders'].includes(slug))
      await page.screenshot({path:path.join(dir,'comprehensive-case-management-'+slug+'-390.png'),fullPage:true});
     if(width===1280&&slug==='adhd'){
      await page.emulateMedia({media:'print'});
      assert(await page.locator('a.skip').isHidden(),'Focused skip link must not appear on printed case manager sheet');
      const pdf=await page.pdf({format:'Letter',printBackground:false});
      assert(pdf.length>3000,'Case management print PDF unexpectedly small');
      fs.writeFileSync(path.join(dir,'comprehensive-case-manager-print.pdf'),pdf);
     await page.emulateMedia({media:'screen'});
     }
    }
   }
   await page.goto(base+'/resources/diagnoses/index.html?topic=ADHD',{waitUntil:'networkidle'});
   await page.waitForSelector('#direct-groups .resource-list li');
   assert.equal(await page.locator('#direct-groups .resource-list > li').count(),43,'Fifty ADHD resource links should occupy forty-three grouped cards');
   assert.equal(await page.locator('#direct-groups .resource-list a').count(),50,'Dynamic ADHD index must preserve every tagged resource link');
   assert.equal(await page.locator('#direct-groups .resource-bundle a').count(),8,'Dynamic ADHD task-start formats are one collection');
   assert.equal(await page.locator('#direct-groups .resource-bundle').count(),1,'Dynamic ADHD toolkit must not duplicate cards');
   await page.locator('#direct-groups .resource-bundle .bundle-links a').first().focus();
   assert(await page.evaluate(()=>document.activeElement.closest('.resource-bundle')!==null),'Companion link must be keyboard focusable');
   assert.match(await page.locator('#topic-name').innerText(),/ADHD/);
   assert(await page.locator('#direct-groups a[href="/resources/diagnoses/adult-adhd-collection/assessment.html"]').count()>0,'Supplemental ADHD clinical assessment must appear in dynamic index');
   assert.equal(await page.locator('#adhd-focus').isVisible(),true,'Prominent adult comprehensive guide missing');
   let overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert(overflow<=2,'Diagnosis index overflow '+width+' '+overflow);
   await page.screenshot({path:path.join(dir,'adhd-index-'+width+'.png'),fullPage:true});
   await page.addScriptTag({path:require.resolve('axe-core')});
   const hubAxe=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
   fs.writeFileSync(path.join(dir,'axe-index-'+width+'.json'),JSON.stringify({violations:hubAxe.violations,incomplete:hubAxe.incomplete},null,2));
   assert.equal(hubAxe.violations.filter(x=>x.impact==='critical'||x.impact==='serious').length,0,
    'Serious topic-index axe issue '+width+': '+JSON.stringify(hubAxe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.slice(0,2).map(n=>n.html)}))));
   await page.goto(base+'/resources/diagnoses/index.html?topic=Autism',{waitUntil:'networkidle'});
   await page.waitForSelector('#direct-groups .resource-list li');
   assert.equal(await page.locator('#direct-groups .resource-list li').count(),29,'Autism diagnosis hub missing tagged resources');
   assert.equal(await page.locator('#adhd-focus').isHidden(),true,'Adult ADHD content leaked into unrelated diagnosis');
   await page.goto(base+'/resources/diagnoses/index.html',{waitUntil:'networkidle'});
   await page.waitForSelector('#topic-grid .topic-choice');
   assert.equal(await page.locator('#topic-grid .topic-choice').count(),14,'Missing diagnosis categories');
   await page.selectOption('#topic-select','ADHD');
   await page.waitForURL(/topic=ADHD/);
   assert.match(await page.locator('#topic-name').innerText(),/ADHD/,'Diagnosis picker broken');
   await page.goto(base+'/#diagnosis-guides',{waitUntil:'networkidle'});
   assert.equal(await page.locator('.diagnosis-card').count(),8);
   assert.equal(await page.locator('.diagnosis-card .diagnosis-hub-link').count(),8);
   await page.goto(base+'/guides/adhd.html',{waitUntil:'networkidle'});
   assert(await page.locator('a[href="/resources/diagnoses/index.html?topic=ADHD"]').count()>0,'Original guide link missing');
   assert.deepEqual(errs,[],'Browser JS errors');
   await page.addScriptTag({path:require.resolve('axe-core')});
   const axe=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
   fs.writeFileSync(path.join(dir,'axe-guide-'+width+'.json'),JSON.stringify({violations:axe.violations,incomplete:axe.incomplete},null,2));
   assert.equal(axe.violations.filter(x=>x.impact==='critical'||x.impact==='serious').length,0,'Serious original guide axe failure '+width+': '+JSON.stringify(axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.slice(0,3).map(n=>n.html)}))));
   await page.goto(base+'/resources/diagnoses/adult-adhd.html',{waitUntil:'networkidle'});
   await page.addScriptTag({path:require.resolve('axe-core')});
   const adultAxe=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
   fs.writeFileSync(path.join(dir,'axe-adult-'+width+'.json'),JSON.stringify({violations:adultAxe.violations,incomplete:adultAxe.incomplete},null,2));
   assert.equal(adultAxe.violations.filter(x=>x.impact==='critical'||x.impact==='serious').length,0,'Serious adult guide accessibility failure '+width+': '+JSON.stringify(adultAxe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.slice(0,3).map(n=>n.html)}))));
   if(width===1280){
    const pdf=await page.pdf({format:'Letter',printBackground:false});
    assert(pdf.length>10000,'Printable guide unexpectedly tiny');
    fs.writeFileSync(path.join(dir,'adult-adhd-browser-print.pdf'),pdf);
    await page.emulateMedia({forcedColors:'active'});
    await page.screenshot({path:path.join(dir,'adult-adhd-forced-colors.png'),fullPage:true});
   }
   results.push({width,adultOverflow:tooWide,hubOverflow:overflow,adhdIndexed:50,autismIndexed:29,axeSerious:0,originalGuidesLinked:true});
   await ctx.close();
  }
  console.log('DIAGNOSIS_HUB_RENDERED_PASS '+JSON.stringify(results));
  fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify({status:'PASS',scope:'Headless Chromium; 320/390/640/1280 CSSpx, not native 200%/400% zoom or actual screen-reader testing',results},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
