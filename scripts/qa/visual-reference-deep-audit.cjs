// Deep CPL accessibility and print QA; local synthetic-free static page only.
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const axe=require('axe-core');
const URL='http://127.0.0.1:8765/resources/therapy/visual-access-12-tool-reference-review-2026-10-25.html';
async function run(){
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const failures=[],warnings=[],axelog=[];
 try {
  for(const width of [320,390,768,1280]){
   const ctx=await browser.newContext({viewport:{width,height:920},reducedMotion:'reduce'});
   const page=await ctx.newPage();
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(URL,{waitUntil:'load'});
   await page.addScriptTag({content:axe.source});
   const results=await page.evaluate(async()=>window.axe.run(document,{
     runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}
   }));
   const violations=results.violations.map(v=>({id:v.id,impact:v.impact,description:v.help,targets:v.nodes.map(n=>n.target.join(',')).slice(0,5),count:v.nodes.length}));
   axelog.push({width,passes:results.passes.length,violations});
   for(const v of violations){
     if(['critical','serious'].includes(v.impact)) failures.push(width+' axe '+v.id+': '+JSON.stringify(v));
     else warnings.push(width+' axe '+v.id+': '+JSON.stringify(v));
   }
   const structural=await page.evaluate(()=>{
     const main=document.querySelector('main'),sheets=[...document.querySelectorAll('.sheet')];
     const names=[...document.querySelectorAll('#jump option')].map(x=>x.textContent.trim());
     const buttons=[...document.querySelectorAll('[data-choice]')];
     return {mainCount:document.querySelectorAll('main').length,mainFocus:main?.tabIndex,
       sheets:sheets.length,toolChoices:names.length,unnamed:buttons.filter(x=>!x.getAttribute('aria-label')&&!x.textContent.trim()).length,
       repeatedButtonNames:buttons.filter(x=>!x.getAttribute('aria-pressed')).length,
       headings:sheets.map(x=>({text:x.querySelector('h1')?.textContent?.trim(),h2:x.querySelectorAll('h2').length})),
       focusableOutsideMain:[...document.querySelectorAll('a[href],button,select,input,[tabindex]:not([tabindex="-1"])')].filter(x=>!main.contains(x)).map(x=>x.outerHTML.slice(0,160))};
   });
   if(structural.mainCount!==1||structural.mainFocus!==-1||structural.sheets!==13||structural.toolChoices!==12||structural.unnamed||structural.repeatedButtonNames)failures.push(width+' semantics '+JSON.stringify(structural));
   assert.equal(structural.headings.length,13);
   const first=(await page.locator('button[data-choice]').first().getAttribute('aria-label'));
   if(!first?.trim()) failures.push(width+' first choice accessible name empty');
   await page.keyboard.press('Tab');
   if(await page.evaluate(()=>document.activeElement?.className)!=='cpl-skip')failures.push(width+' skip not first');
   await page.keyboard.press('Tab');
   if(await page.evaluate(()=>document.activeElement?.id)!=='jump')failures.push(width+' expected toolbar select second');
   const focusSteps=[];
   for(let i=0;i<3;i++){await page.keyboard.press('Tab');focusSteps.push(await page.evaluate(()=>document.activeElement?.id));}
   if(JSON.stringify(focusSteps)!==JSON.stringify(['print-one','print-all','reset']))failures.push(width+' toolbar order '+JSON.stringify(focusSteps));
   if(errors.length)failures.push(width+' runtime errors '+errors.join(';'));
   console.log('AXE',width,'passRules',results.passes.length,'violations',JSON.stringify(violations));
   console.log('FOCUS',width,'toolbar sequence',JSON.stringify(focusSteps));
   await ctx.close();
  }
  const ctx=await browser.newContext({viewport:{width:1280,height:920},reducedMotion:'reduce'});
  const page=await ctx.newPage();
  await page.goto(URL,{waitUntil:'load'});
  await page.emulateMedia({media:'print'});
  // Geometry QA examines printed sheet and text-line rectangles before PDF export.
  const geometry=await page.evaluate(()=>{
    const eps=2.2,issues=[],sheets=[...document.querySelectorAll('.sheet')];
    for(let i=0;i<sheets.length;i++){
      const sheet=sheets[i],sr=sheet.getBoundingClientRect();
      const iterator=document.createTreeWalker(sheet,NodeFilter.SHOW_TEXT);
      let text;
      while((text=iterator.nextNode())){
        if(!text.textContent.trim())continue;
        const parent=text.parentElement;
        if(!parent || getComputedStyle(parent).display==='none')continue;
        const range=document.createRange();range.selectNodeContents(text);
        for(const r of range.getClientRects()){
         if(r.width<=0||r.height<=0)continue;
         if(r.left<sr.left-eps||r.right>sr.right+eps||r.top<sr.top-eps||r.bottom>sr.bottom+eps){
          issues.push({sheet:i+1,text:text.textContent.trim().slice(0,42),box:[r.left,r.top,r.right,r.bottom].map(x=>Math.round(x)),sheetBox:[sr.left,sr.top,sr.right,sr.bottom].map(x=>Math.round(x))});
         }
        }
      }
    }
    return {sheetCount:sheets.length,issues:issues.slice(0,35),totalIssues:issues.length};
  });
  console.log('PRINT_GEOMETRY',JSON.stringify(geometry));
  if(geometry.totalIssues)warnings.push('print geometry text outside sheet edges '+JSON.stringify(geometry));
  const pdf=await page.pdf({format:'Letter',preferCSSPageSize:true,printBackground:true});
  fs.writeFileSync('/tmp/cpl-visual-deep-qa.pdf',pdf);
  console.log('PDF_WRITTEN',pdf.length);
  await ctx.close();
 }finally{await browser.close();}
 const summary={warnings,axelog,failures};
 fs.writeFileSync('/tmp/cpl-visual-deep-qa.json',JSON.stringify(summary,null,2));
 console.log('DEEP_QA_SUMMARY',JSON.stringify({violations:axelog.flatMap(x=>x.violations).length,warnings:warnings.length,failures:failures.length}));
 warnings.forEach(x=>console.warn('REVIEW',x));
 failures.forEach(x=>console.error('FAIL',x));
 if(failures.length)process.exitCode=1;
}
run().catch(e=>{console.error(e);process.exitCode=1});
