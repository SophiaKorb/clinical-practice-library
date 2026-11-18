'use strict';
/* Review-only 25-collection consumer-copy browser preflight.
 * Tests CSS viewport equivalents, NOT native zoom/AT/physical print or clinical approval.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const origin=process.env.CPL_QA_ORIGIN||'http://127.0.0.1:8765';
const dir=path.join(process.cwd(),'qa-artifacts/clinical-topic-editorial');
fs.mkdirSync(dir,{recursive:true});
const families=[
'adult-adhd-task-starts','adult-autism-load-recovery','aphasia-communication-access',
'bfrb-awareness-support','binge-eating-patterns','bipolar-episode-timeline',
'body-dysmorphia-checking','child-aggression-caregiver-coaching',
'child-grief-continuing-bonds','chronic-pain-pacing','depression-activity-reward',
'dissociation-function-orientation','health-anxiety-medical-plan',
'insomnia-cbti-readiness','intellectual-disability-supported-choice',
'learning-instruction-access','ocd-mental-rituals','panic-alarm-loop',
'restrictive-eating-coordination','sibling-conflict-safety-repair',
'sleep-loss-activation','social-anxiety-attention','tics-context-impact',
'trauma-cue-orientation','voices-collaborative-coping'];
const sampleFormats=['index','care-partner','case','client-workbook','formulation','progress-review','support-map'];
(async()=>{
 const browser=await chromium.launch({headless:true});
 const records=[];
 try{
  for(const width of [390,1280]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   const page=await context.newPage();
   const pageErrors=[];page.on('pageerror',err=>pageErrors.push(err.message));
   for(const slug of families){
    const route='/resources/clinical-topics/'+slug+'/index.html';
    const response=await page.goto(origin+route,{waitUntil:'domcontentloaded'});
    assert.equal(response.status(),200,'Missing clinical-topic index '+slug);
    const text=await page.locator('main').innerText();
    assert(text.includes('These original teaching aids have not been independently validated as assessment or treatment protocols.'),'Missing honest validation caution '+slug);
    assert(text.includes('Evidence and appropriate use')&&text.includes('About using these resources'),'Missing reader-facing source links '+slug);
    assert(!/tool validation and qualified clinical (?:approval|review) (?:remain )?pending/i.test(text),'Internal QA status visible '+slug);
    assert.equal(await page.locator('a.skip').count(),1,'Missing keyboard skip link '+slug);
    await page.locator('a.skip').focus();
    assert(await page.evaluate(()=>document.activeElement.classList.contains('skip')),'Keyboard skip link cannot focus '+slug);
    const overflow=await page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth));
    assert(overflow<=2,'Horizontal overflow '+slug+' '+width+': '+overflow);
    if(width===390){
     await page.addScriptTag({path:require.resolve('axe-core')});
     const audit=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
     const serious=audit.violations.filter(x=>['serious','critical'].includes(x.impact));
     assert.equal(serious.length,0,'Serious axe violations '+slug+': '+serious.map(x=>x.id).join(','));
    }
    if(['aphasia-communication-access','child-grief-continuing-bonds','voices-collaborative-coping'].includes(slug)){
     await page.screenshot({path:path.join(dir,slug+'-'+width+'.png'),fullPage:true});
    }
    if(width===1280&&slug==='aphasia-communication-access'){
     const pdf=await page.pdf({format:'Letter',printBackground:false});
     assert(pdf.length>5000,'Clinical-topic browser print unexpectedly short');
     fs.writeFileSync(path.join(dir,'aphasia-index-browser-print.pdf'),pdf);
    }
    records.push({slug,width,overflow,sourceCaution:true,focus:true});
   }
   if(width===390){
    for(const slug of ['aphasia-communication-access','child-grief-continuing-bonds']){
     for(const format of sampleFormats){
      const response=await page.goto(origin+'/resources/clinical-topics/'+slug+'/'+format+'.html',{waitUntil:'domcontentloaded'});
      assert.equal(response.status(),200);
      const body=await page.locator('main').innerText();
      assert(body.includes('These original teaching aids have not been independently validated as assessment or treatment protocols.'),'Missing source caution on '+slug+'/'+format);
      const over=await page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-document.documentElement.clientWidth));
      assert(over<=2,'Overflow '+slug+'/'+format+': '+over);
     }
    }
   }
   assert.deepEqual(pageErrors,[],'Browser errors in shared-topic index QA');
   await context.close();
  }
  const summary={pages:records.length,collections:families.length,formatsSampled:14,overflowFailures:0,limit:'CSS widths only; native screen readers, actual page zoom and physical grayscale printing are human gates'};
  fs.writeFileSync(path.join(dir,'summary.json'),JSON.stringify({summary,records},null,2));
  console.log('CLINICAL_TOPIC_EDITORIAL_RENDERED_PASS '+JSON.stringify(summary));
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1;});
