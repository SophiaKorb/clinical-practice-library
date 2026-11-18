'use strict';
/* Screenshot, keyboard, four-option interaction, print and responsive proxy QA. Not native screen-reader certification. */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.CPL_QA_ORIGIN||'http://127.0.0.1:8765',prefix='/resources/diagnoses/practice-labs/wave-2/';
const slugs=['learning','psychosis-bipolar','substance-use','grief'],pages=['index','facilitator','map','worksheets'];
const dir=path.resolve(process.cwd(),'qa-artifacts/diagnosis-wave2');fs.mkdirSync(dir,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true});const report=[];
try{
 for(const width of [1280,640,390,320]){
  const ctx=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const slug of slugs){
   for(const kind of pages){
    const uri=prefix+slug+'/'+kind+'.html',r=await page.goto(base+uri,{waitUntil:'networkidle'});
    assert.equal(r.status(),200,'Missing '+uri);
    assert.equal(await page.locator('h1').count(),1,'H1 count '+uri);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    assert(overflow<=2,'Overflow '+uri+' width='+width+' over='+overflow);
    const skip=page.locator('a.skip');await skip.focus();assert(await skip.evaluate(el=>document.activeElement===el),'Skip not focusable '+uri);
    await skip.evaluate(el=>el.blur());
    if(kind==='map'){
     const choices=page.locator('button[data-choice]');assert.equal(await choices.count(),4,'Four interactive topics '+uri);
     for(let i=0;i<4;i++){
      await choices.nth(i).click();
      assert.equal(await choices.nth(i).getAttribute('aria-pressed'),'true','Selected button state '+uri);
      assert.equal(await page.locator('.panel:not([hidden])').count(),1,'One visible panel '+uri);
      const id=await choices.nth(i).getAttribute('data-choice');
      assert.equal(await page.locator('[data-choice-panel="'+id+'"]').isVisible(),true,'Wrong discussion panel '+uri);
     }
     const status=await page.locator('#choice-summary').innerText();assert(status.includes('Selected:'),'Live region not updated '+uri);
    }
    if((width===390||width===1280)&&['map','index'].includes(kind)){await page.screenshot({path:path.join(dir,slug+'-'+kind+'-'+width+'.png'),fullPage:true});}
    if((width===390||width===1280)&&['index','map','worksheets'].includes(kind)){
      await page.addScriptTag({path:require.resolve('axe-core')});
      const axe=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
      const serious=axe.violations.filter(v=>v.impact==='serious'||v.impact==='critical');
      assert.equal(serious.length,0,'Serious axe '+uri+' '+width+': '+JSON.stringify(serious.map(v=>v.id)));
    }
    if(width===1280&&kind==='worksheets'){
      await page.emulateMedia({media:'print'});
      assert(await page.locator('main>h1').isHidden(),'Screen heading leaking into print '+uri);
      assert(await page.locator('#sheet-one').isVisible()&&await page.locator('#sheet-two').isVisible(),'Worksheets hidden at print '+uri);
      const bytes=await page.pdf({format:'Letter',printBackground:false});
      assert(bytes.length>4000,'PDF sample unexpectedly empty '+uri);
      fs.writeFileSync(path.join(dir,slug+'-worksheets-print.pdf'),bytes);await page.emulateMedia({media:'screen'});
    }
    report.push({slug,kind,width,overflow});
   }
  }
  assert.deepEqual(errors,[],'Browser page script failures '+width);
  await ctx.close();
 }
 fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({status:'PASS',checks:report.length,report},null,2));
 console.log('DIAGNOSIS_WAVE2_RENDERED_PASS '+JSON.stringify({pages:report.length,maps:4,printPDFs:4,widths:[1280,640,390,320]}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
