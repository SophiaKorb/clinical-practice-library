// Review-only rendered QA: local Chromium, no production URLs or PHI.
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const url='http://127.0.0.1:8765/resources/therapy/visual-access-12-tool-reference-review-2026-10-25.html';
const pageCount=pdf=>(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;
async function pdfWithPages(page,expected,label){
  const pdf=await page.pdf({printBackground:true,preferCSSPageSize:true,format:'Letter'});
  assert.ok(pdf.length>3500,label+' PDF is empty');
  assert.equal(pageCount(pdf),expected,label+' PDF sheet count');
}
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  let checks=0;
  try {
    for(const width of [320,390,768,1280]){
      const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1,reducedMotion:'reduce'});
      await context.addInitScript(()=>{window.print=()=>{window.__cplPrintCalls=(window.__cplPrintCalls||0)+1;};});
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      const res=await page.goto(url,{waitUntil:'load'});
      assert.equal(res.status(),200,width+' page HTTP');
      assert.equal(await page.getByRole('main').count(),1,width+' main landmarks');
      assert.equal(await page.locator('.sheet').count(),13,width+' sheets');
      assert.equal(await page.locator('button[data-choice]').count(),67,width+' choices');
      assert.deepEqual(await page.locator('#jump option').evaluateAll(options=>options.map(o=>o.value)),
        ['1','2','3','4','5','6','7','8','9','10','11','12'],width+' distinct tool options');
      const metrics=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
      assert.ok(metrics.scroll<=metrics.client+1,width+' horizontal overflow '+JSON.stringify(metrics));
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('href')),'#main-content',width+' first Tab must be skip');
      const skipVisible=await page.locator('.cpl-skip').evaluate(a=>{const b=a.getBoundingClientRect(),style=getComputedStyle(a);return b.top>=0&&b.right<=innerWidth&&b.bottom<=innerHeight&&style.outlineStyle!=='none'});
      assert.ok(skipVisible,width+' skip focus visibility');
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(()=>location.hash),'#main-content',width+' skip target');
      assert.equal(await page.evaluate(()=>document.activeElement?.id),'main-content',width+' main focused');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-choice')!==null),true,width+' next Tab reaches tool choice');
      const first=page.locator('button[data-choice]').first();
      await first.focus();
      await page.keyboard.press('Space');
      assert.equal(await first.getAttribute('aria-pressed'),'true',width+' Space toggles choice');
      await page.keyboard.press('Enter');
      assert.equal(await first.getAttribute('aria-pressed'),'false',width+' Enter toggles choice');
      await first.click();
      await page.locator('#reset').click();
      assert.equal(await page.locator('button[data-choice][aria-pressed="true"]').count(),0,width+' reset');
      await page.locator('#jump').selectOption('2');
      const printButton=page.locator('#print-one');
      await printButton.click();
      assert.deepEqual(await page.locator('.sheet:not(.print-hidden)').evaluateAll(nodes=>nodes.map(n=>n.dataset.tool)),['2','2'],width+' dictionary both pages selected');
      const beforePrint=await page.evaluate(()=>window.__cplPrintCalls);
      assert.equal(beforePrint,1,width+' print current event');
      await page.emulateMedia({media:'print'});
      assert.equal(await page.locator('.cpl-skip').evaluate(a=>getComputedStyle(a).display),'none',width+' skip hidden in print');
      assert.equal(await page.locator('.toolbar').evaluate(a=>getComputedStyle(a).display),'none',width+' toolbar hidden in print');
      if(width===390){
        await pdfWithPages(page,2,'Visual Dictionary');
        await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
        assert.equal(await page.locator('.sheet.print-hidden').count(),0,'afterprint restores all');
        await page.locator('#jump').selectOption('12');
        await page.locator('#print-one').click();
        await pdfWithPages(page,1,'Words That Help');
        await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
        await page.locator('#print-all').click();
        assert.equal(await page.locator('.sheet.print-hidden').count(),0,'Print all restores all sheets');
        await pdfWithPages(page,13,'All visual tools');
      }
      assert.deepEqual(errors,[],width+' browser errors');
      checks+=15;
      await context.close();
      console.log('PASS',width+'px','keyboard, skip, tools, choices, print targets');
    }
  }finally{await browser.close();}
  console.log('PASS visual-reference rendered QA',checks,'assertion groups; PDF pages 2/1/13 validated at 390px');
})().catch(e=>{console.error(e);process.exitCode=1});
