'use strict';
/* Browser-level canonical finder release smoke, preserving historic URL contracts. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {chromium}=require('playwright');
const base=process.env.CPL_QA_ORIGIN||'http://127.0.0.1:8765';
const dir=path.join(process.cwd(),'qa-artifacts/pr43/finder-release');
fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 const checks=[];
 try{
  for(const width of [1280,390,320]){
   const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
   const page=await context.newPage();
   const exceptions=[];page.on('pageerror',e=>exceptions.push(e.message));
   let response=await page.goto(base+'/resources/clinical-resource-finder.html?q=IEP',{waitUntil:'networkidle'});
   assert.equal(response.status(),200,'Canonical route unavailable');
   await page.waitForSelector('.result-card h3 a');
   assert(/IEP/i.test(await page.locator('.result-card h3 a').first().innerText()),'IEP search not leading relevant resources');
   const countText=await page.locator('#lab-status').innerText();
   const matchCount=Number(countText.match(/(\d+) matching resources/)?.[1]);
   assert(matchCount>0&&matchCount<40,'Legacy IEP noise not resolved: '+countText);
   assert.equal(await page.title(),'Find clinical and community resources | Clinical Practice Library');
   assert(await page.locator('a[href="/resources/clinical-resource-finder-classic.html"]').count()>0,'Classic route link absent');
   assert(await page.locator('a[href="/resources/birth-to-five/index.html"]').count()>0,'Birth–5 link absent');
   await page.screenshot({path:path.join(dir,'canonical-iep-'+width+'.png'),fullPage:true});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert(overflow<=2,'Horizontal overflow at '+width+': '+overflow);
   await page.reload({waitUntil:'networkidle'});
   assert.equal(await page.inputValue('#lab-q'),'IEP','Search state lost on reload');
   await page.goto(base+'/resources/clinical-resource-finder.html?age=children',{waitUntil:'networkidle'});
   assert.equal(await page.inputValue('#lab-population'),'children','Legacy child population URL broken');
   await page.goto(base+'/resources/clinical-resource-finder.html?child=1',{waitUntil:'networkidle'});
   assert.equal(await page.inputValue('#lab-population'),'children','Legacy child=1 URL broken');
   await page.goto(base+'/resources/clinical-resource-finder.html?age=birth5&role=Clinician',{waitUntil:'networkidle'});
   assert.equal(await page.inputValue('#lab-population'),'birth5','Birth–5 old URL not recognized');
   assert.equal(await page.inputValue('#lab-audience'),'clinician','Clinician old role not mapped');
   assert((await page.locator('#lab-status').innerText()).includes('matching resources'),'Birth5 clinician search empty');
   await page.goto(base+'/resources/clinical-resource-finder.html?age=children&role=Client%20%2F%20caregiver',{waitUntil:'networkidle'});
   assert((await page.locator('#active-filters').innerText()).includes('Legacy client/caregiver'),'Combined original audience not preserved');
   assert(await page.locator('.result-card').count()>0,'Combined original audience returned no results');
   await page.locator('#lab-clear').click();
   assert(!(await page.url()).includes('role='),'Legacy filter not cleared');
   await page.goto(base+'/resources/clinical-resource-finder.html?step=Understanding&symptom=Communication%20difficulty&stage=School%20age%20%2F%20adolescence',{waitUntil:'networkidle'});
   assert.equal(await page.inputValue('#lab-step'),'Understanding','Legacy step not honored');
   assert.equal(await page.inputValue('#lab-symptom'),'Communication difficulty','Legacy symptom not honored');
   assert.equal(await page.inputValue('#lab-stage'),'School age / adolescence','Legacy stage not honored');
   await page.goto(base+'/resources/clinical-resource-finder.html?q=Eon&age=children',{waitUntil:'networkidle'});
   assert.equal(await page.locator('.result-card').count(),0,'Teen-only Eon service returned for children: '+JSON.stringify(await page.locator('.result-card h3').allInnerTexts()));
   await page.selectOption('#lab-population','teens');
   assert(await page.locator('.result-card').count()>0,'Teen eligibility route missing for Eon');
   await page.goto(base+'/resources/clinical-resource-finder.html?community=family&place=Marana',{waitUntil:'networkidle'});
   assert.equal(await page.inputValue('#lab-community'),'family','Community collection URL filter not restored');
   assert.equal(await page.inputValue('#lab-place'),'Marana','Grounded location URL filter not restored');
   const localityLinks=await page.locator('.result-card h3 a').evaluateAll(links=>links.map(a=>a.getAttribute('href')));
   assert(localityLinks.length>0&&localityLinks.every(url=>url.startsWith('/resources/community/family-community-guide-text.html#listing-')),'Unverified source admitted to Marana family filter: '+JSON.stringify(localityLinks));
   await page.selectOption('#lab-place','Catalina');
   assert((await page.locator('#lab-status').innerText()).includes('matching resources'),'Changing location filter should refresh live results');
   await page.goto(base+'/resources/clinical-resource-finder.html?community=transition-age&community-topic=Employment%20%26%20work%20preparation',{waitUntil:'networkidle'});
   assert.equal(await page.inputValue('#lab-community-topic'),'Employment & work preparation','Community topic filter query restore failed');
   const focused=await page.locator('.result-card h3 a').allInnerTexts();
   assert(focused.some(x=>/Youth Employment Center|Pre-Employment/i.test(x)),'Employment topic filter missing priority programs');
   await page.goto(base+'/resources/clinical-resource-finder.html?community=transition-age',{waitUntil:'networkidle'});
   assert.equal(await page.inputValue('#lab-community'),'transition-age','Transition-age guide URL filter not restored');
   assert(await page.locator('.result-card h3 a').count()>0,'Youth source-specific filter returned no listings');
   assert(await page.locator('#lab-community').isVisible(),'TAY selector must be visible without expanding details');
   assert(await page.locator('#lab-community-topic').isVisible(),'Community need selector must be visible without expanding details');
   assert(await page.locator('#lab-scope').isVisible(),'Community collection selector must be visible');
   await page.goto(base+'/resources/clinical-resource-finder.html?q=I%20AM%20YOU%20360&scope=community&community=transition-age',{waitUntil:'networkidle'});
   assert.equal(await page.inputValue('#lab-scope'),'community','Community scope query param not restored');
   assert(await page.locator('.result-card h3 a[href="/resources/community/iamyou360.html"]').count()>0,'IAMYOU360 missing from unified community results');
   await page.selectOption('#lab-community-topic','Foster-care transitions');
   assert(await page.locator('.result-card h3 a[href="/resources/community/iamyou360.html"]').count()>0,'IAMYOU360 missing from foster-care need filter');
   await page.locator('#lab-clear').click();
   assert.equal(await page.inputValue('#lab-scope'),'','Clear button must reset community scope');
   assert.equal(await page.inputValue('#lab-community'),'','Clear button must reset TAY guide filter');
   assert.equal(await page.inputValue('#lab-community-topic'),'','Clear button must reset community need filter');
   assert.equal(await page.inputValue('#lab-q'),'','Clear button must reset search query');
   
   
   await page.goto(base+'/resources/clinical-resource-finder.html?q=tantrums',{waitUntil:'networkidle'});
   assert(/Child aggression/.test(await page.locator('.result-card h3 a').first().innerText()),'Conversational search failed');
   await page.goto(base+'/resources/clinical-resource-finder-classic.html?q=IEP',{waitUntil:'networkidle'});
   await page.waitForSelector('.finder-card');
   assert(await page.locator('.finder-card').count()>0,'Preserved classic finder not functional');
   // Source-preserving online guide editions: complete, navigable, and functional.
   for(const guide of [
    {slug:'family-guide',count:170,query:'Parent Aid',target:'listing-2'},
    {slug:'transition-age-guide',count:28,query:'housing',target:'iam-you-360'}
   ]){
    const webGuide=base+'/resources/community/'+guide.slug+'.html';
    const online=await page.goto(webGuide,{waitUntil:'networkidle'});
    assert.equal(online.status(),200,'Online community guide route is unavailable: '+guide.slug);
    const approvedPdf=guide.slug==='family-guide'
     ?{path:'/resources/community/original-pdfs/Tucson_Regional_Family_Resource_Guide_QA_Revised_2026.pdf',bytes:779066,sha:'eae42c74b0870d0e4faf389e44b56b4e0104866f08389c42f279b43dd0a6f713'}
     :{path:'/resources/community/original-pdfs/Southern_Arizona_Youth_Transition_Resources_2026.pdf',bytes:218122,sha:'c051a12c8a5a8f7385260c64a5a53623a54e9480d0ee5f53518b1aeb04537091'};
    assert(await page.locator('a[href="'+approvedPdf.path+'"]').count()>0,'Approved PDF missing from guide: '+guide.slug);
    if(width===1280){
      const pdfDownload=await page.request.get(base+approvedPdf.path);
      assert.equal(pdfDownload.status(),200,'Approved PDF unavailable over public-shaped route: '+approvedPdf.path);
      const pdfBytes=await pdfDownload.body();
      assert.equal(pdfBytes.length,approvedPdf.bytes,'PDF bytes truncated over HTTP: '+guide.slug);
      assert.equal(crypto.createHash('sha256').update(pdfBytes).digest('hex'),approvedPdf.sha,'PDF HTTP bytes differ from original: '+guide.slug);
      assert(/pdf/i.test(pdfDownload.headers()['content-type']||''),'PDF MIME type incorrect: '+guide.slug);
    }
    assert.equal(await page.locator('.entry').count(),guide.count,'Online community guide incomplete: '+guide.slug);
    assert(await page.locator('#'+guide.target).count()>0,'Direct entry anchor missing from online guide');
    assert(await page.locator('.contents a').count()>0,'Accessible section navigation missing');
    assert.equal(await page.locator('.lgbtq-listing').count(),8,'LGBTQ+ local supplement count changed: '+guide.slug);
    assert(await page.locator('.contents a[href="#lgbtq-community-resources"]').count()===1,'Supplement TOC link missing: '+guide.slug);
    assert(await page.locator('.route a[href="#lgbtq-community-resources"]').count()===1,'Supplement quick link missing: '+guide.slug);
    assert.equal(await page.locator('.lgbtq-listing a[href^="https://"]').count(),8,'Supplement provider URLs missing: '+guide.slug);
    await page.locator('.route a[href="#lgbtq-community-resources"]').focus();
    assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')),'#lgbtq-community-resources','Keyboard focus cannot reach supplement route: '+guide.slug);
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>location.hash),'#lgbtq-community-resources','Keyboard anchor activation failed: '+guide.slug);
    await page.screenshot({path:path.join(dir,'community-'+guide.slug+'-lgbtq-'+width+'.png'),fullPage:false});
    await page.locator('#guide-query').fill('STARS');
    assert(await page.locator('.lgbtq-listing:visible').count()>=2,'STARS supplementary listings not searchable: '+guide.slug);
    assert(!(await page.locator('#guide-status').innerText()).includes('No matches'),'Supplementary matches incorrectly reported as zero: '+guide.slug);
    assert((await page.locator('#guide-status').innerText()).includes('of 8 LGBTQ+ supplemental'),'Status excludes supplemental collection: '+guide.slug);
    await page.locator('#guide-clear').click();
    assert.equal(await page.locator('.lgbtq-listing:visible').count(),8,'Supplement reset did not restore listings: '+guide.slug);
    const guideOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
    assert(!guideOverflow,'Online community guide overflows at '+width+': '+guide.slug);
    await page.locator('#guide-query').fill(guide.query);
    const shown=await page.locator('.entry:visible').count();
    assert(shown>=1&&shown<guide.count,'Online guide client-side search failed: '+guide.slug);
    assert((await page.locator('#guide-status').innerText()).includes('of '+guide.count),'Guide status not announced');
    const sectionLinkCount=await page.locator('.contents li').count();
    const visibleSectionLinks=await page.locator('.contents li:visible').count();
    assert(visibleSectionLinks>0&&visibleSectionLinks<sectionLinkCount,'Search navigation still links to hidden sections: '+guide.slug);
    if(width<1280)await page.screenshot({path:path.join(dir,'community-'+guide.slug+'-filtered-'+width+'.png'),fullPage:false});
    await page.emulateMedia({media:'print'});
    const printedEntries=await page.locator('.entry').evaluateAll(nodes=>nodes.filter(node=>
      getComputedStyle(node).display!=='none'&&getComputedStyle(node.closest('.section')).display!=='none'
    ).length);
    assert.equal(printedEntries,guide.count,'Printing a filtered view omitted guide listings: '+guide.slug);
    const printedLocal=await page.locator('.lgbtq-listing').evaluateAll(nodes=>nodes.filter(el=>getComputedStyle(el).display!=='none'&&getComputedStyle(el.closest('.lgbtq-extra')).display!=='none').length);
    assert.equal(printedLocal,8,'Printing filtered view omitted local LGBTQ+ supplements: '+guide.slug);
    assert.equal(await page.locator('.search-panel').evaluate(el=>getComputedStyle(el).display),'none','Print CSS did not hide the search panel: '+guide.slug);
    assert.equal(await page.locator('.contents').evaluate(el=>getComputedStyle(el).display),'none','Print CSS did not hide navigation: '+guide.slug);
    assert.equal(await page.locator('.section').first().evaluate(el=>getComputedStyle(el).breakBefore),'auto','Print CSS forces wasteful section page breaks: '+guide.slug);
    assert.equal(await page.locator('.section-head').first().evaluate(el=>getComputedStyle(el).breakAfter),'avoid','Print section heading could become orphaned: '+guide.slug);
    assert.equal(await page.locator('.entries').first().evaluate(el=>getComputedStyle(el).columnCount),'auto','Print CSS leaves entries in an unbreakable two-column box: '+guide.slug);
    assert.equal(await page.locator('.entry').first().evaluate(el=>getComputedStyle(el).display),'block','Print CSS leaves entries in unbreakable inline-block layout: '+guide.slug);
    await page.emulateMedia({media:'screen'});
    assert.equal(await page.locator('.entry:visible').count(),shown,'Screen filter lost after print: '+guide.slug);
    await page.locator('#guide-query').fill('unlikelynonexistentguidequeryxyz');
    assert.equal(await page.locator('.entry:visible').count(),0,'No-match query still shows entries: '+guide.slug);
    assert((await page.locator('#guide-status').innerText()).includes('No matches'),'No-match guidance is missing: '+guide.slug);

    await page.locator('#guide-clear').click();
    assert.equal(await page.locator('.entry:visible').count(),guide.count,'Guide reset did not restore full source set');
    // Clear the explicit screen-media emulation: page.pdf() must use actual print CSS.
    await page.emulateMedia({media:null});
    if(width===390){
      await page.addScriptTag({path:require.resolve('axe-core')});
      const audit=await page.evaluate(async()=>await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
      assert.equal(audit.violations.length,0,'Online guide axe violations: '+guide.slug+' '+JSON.stringify(audit.violations.map(v=>v.id)));
    }
    if(width===1280){
      await page.screenshot({path:path.join(dir,'community-'+guide.slug+'-1280.png'),fullPage:false});
      const webPdf=await page.pdf({format:'Letter',printBackground:false,pageRanges:'1-2'});
      assert(webPdf.length>5000,'Guide print/PDF output unexpectedly empty: '+guide.slug);
      fs.writeFileSync(path.join(dir,'community-'+guide.slug+'-print-sample.pdf'),webPdf);
      const completePdf=await page.pdf({format:'Letter',printBackground:false});
      fs.writeFileSync(path.join(dir,'community-'+guide.slug+'-complete-print.pdf'),completePdf);
    }
   }
   await page.goto(base+'/resources/clinical-resource-finder.html',{waitUntil:'networkidle'});
   await page.locator('#lab-q').focus();
   assert.equal(await page.evaluate(()=>document.activeElement.id),'lab-q','Search input focus missing');
   await page.keyboard.press('Tab');
   assert.equal(await page.evaluate(()=>document.activeElement.className),'search-action','Keyboard submit unreachable');
   await page.addScriptTag({path:require.resolve('axe-core')});
   const axe=await page.evaluate(async()=>await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
   fs.writeFileSync(path.join(dir,'canonical-axe-'+width+'.json'),JSON.stringify({violations:axe.violations,incomplete:axe.incomplete},null,2));
   assert.equal(axe.violations.length,0,'Axe violations at '+width+': '+JSON.stringify(axe.violations.map(x=>x.id)));
   assert.deepEqual(exceptions,[],'Uncaught script errors at '+width);
   if(width===1280){await page.fill('#lab-q','IEP');const pdf=await page.pdf({format:'Letter',printBackground:false});fs.writeFileSync(path.join(dir,'canonical-iep-browser-print.pdf'),pdf);}
   checks.push({width,overflow,axe:axe.violations.length,legacyLinkRecovery:true,classicFunctional:true});
   await context.close();
  }
  // Isolated extra reflow/stress regression: run only after the original smoke checks pass.
  // Its viewport equivalents do not claim actual browser zoom certification.
  require('node:child_process').execFileSync(process.execPath,[path.join(__dirname,'community-guides-reflow-rendered.cjs')],{stdio:'inherit',timeout:150000,env:process.env});
  console.log('FINDER_RELEASE_RENDERED_PASS '+JSON.stringify(checks));
  fs.writeFileSync(path.join(dir,'summary.json'),JSON.stringify({result:'PASS',scope:'Chromium 320,390,1280 CSS pixels; native AT, real browser zoom, physical print remain human review',checks},null,2));
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1;});