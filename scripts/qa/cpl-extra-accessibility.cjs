// Twenty extra, source-scoped HTML accessibility samples. Clinical/translation approval remains human.
'use strict';
const {chromium}=require('playwright'),axe=require('axe-core'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const urls=[
'/resources/assessment/free-official-measure-source-guide.html',
'/resources/assessment/trauma-ptsd-dissociation-safety.html',
'/resources/assessment/spanish-assessment-forms.html',
'/resources/assessment/ocd-bipolar-psychosis-substance-use.html',
'/resources/assessment/adhd-autism-trauma-differential-matrix.html',
'/resources/handouts/crisis-contact-card.html',
'/resources/handouts/reducing-harm-when-substance-use-is-part-of-the-picture.html',
'/resources/es/handouts/hoja-preparacion-plan-seguridad.html',
'/resources/es/handouts/tarjeta-contactos-crisis.html',
'/resources/therapy/harm-reduction-clinical-case-management-hub.html',
'/resources/therapy/treatment-planning-worksheet.html',
'/resources/training/diagnosis-comparer.html',
'/resources/training/dsm-from-zero.html',
'/resources/california/iep-parent-guide.html',
'/resources/utah/iep-parent-guide.html',
'/resources/clinical-depth/substance-use-cooccurring-care.html',
'/resources/therapy/psychosis-smi-rehabilitation-start-here.html',
'/resources/handouts/autism-family-cheat-sheet.html',
'/resources/clinical-topics/index.html',
'/resources/therapy/neurodevelopmental-executive-function-start-here.html'
];
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const results=[],severe=[],faults=[];
 try{
  for(const width of [320,390,768,1280]){
   const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
   const page=await context.newPage();
   let jsError=[];page.on('pageerror',e=>jsError.push(e.message));
   for(const route of urls){
    jsError=[];
    const r=await page.goto('http://127.0.0.1:8765'+route,{waitUntil:'load',timeout:25000});
    assert.equal(r.status(),200,'Missing resource '+route);
    const state=await page.evaluate(()=>({
     htmlLang:document.documentElement.lang||'MISSING',
     mains:document.querySelectorAll('main').length,
     h1s:document.querySelectorAll('h1').length,
     scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,
     firstFocusable:document.querySelector('a,button,input,select,textarea,[tabindex]')?.outerHTML?.slice(0,160)||null
    }));
    const row={route,width,...state,errors:jsError.slice(),axe:[]};
    if(state.scroll>state.client+1)faults.push({route,width,type:'horizontal_document_overflow',pixels:state.scroll-state.client});
    if(jsError.length)faults.push({route,width,type:'pageerror',errors:jsError.slice()});
    if(width===390){
      await page.addScriptTag({content:axe.source});
      const audit=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','best-practice']}}));
      row.axe=audit.violations.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length,targets:v.nodes.slice(0,3).map(n=>n.target)}));
      for(const finding of row.axe)if(['serious','critical'].includes(finding.impact))severe.push({route,...finding});
      console.log('AXE_EXTRA '+route+' '+JSON.stringify(row.axe));
    }
    await page.emulateMedia({media:'print'});
    row.printHasBody=await page.evaluate(()=>Boolean(document.body));
    await page.emulateMedia({media:'screen'});
    results.push(row);
   }
   await context.close();
  }
 }finally{await browser.close();}
 const out=path.join(__dirname,'../../review-artifacts');fs.mkdirSync(out,{recursive:true});
 const summary={routes:urls.length,viewports:4,pageViewportCombinations:results.length,seriousOrCriticalViolations:severe.length,layoutOrJavaScriptFaults:faults.length,limitations:'Automated axe at 390px and layout at 4 widths do not replace native screen readers or human clinical review'};
 fs.writeFileSync(path.join(out,'cpl-extra-accessibility.json'),JSON.stringify({summary,results,severe,faults},null,2)+'\n');
 console.log('EXTRA_ACCESSIBILITY_SUMMARY '+JSON.stringify(summary));
 console.log('EXTRA_ACCESSIBILITY_ISSUES '+JSON.stringify({severe,faults}).slice(0,8000));
 assert.deepEqual(severe,[],'Serious axe findings require verified safe fixes');
 assert.deepEqual(faults,[],'Document overflow or browser errors require review');
 console.log('PASS 20 extra HTML routes × 4 viewport sizes');
})().catch(e=>{console.error(e);process.exitCode=1});
