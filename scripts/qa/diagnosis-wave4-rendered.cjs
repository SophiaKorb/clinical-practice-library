'use strict';
/* Real Chromium; not native screen-reader, legally valid safety or treatment review. */
const {chromium}=require('playwright'),assert=require('assert/strict'),fs=require('fs'),path=require('path');
const origin=process.env.CPL_QA_ORIGIN||'http://127.0.0.1:8765',url='/resources/diagnoses/practice-labs/wave-4/team-voice.html';
const out=path.resolve('qa-artifacts/diagnosis-wave4');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true}),results=[];
 try{
  for(const cfg of [{width:1280,font:17},{width:640,font:17},{width:390,font:17},{width:320,font:17},{width:256,font:17},{width:390,font:34}]){
   const ctx=await browser.newContext({viewport:{width:cfg.width,height:850},reducedMotion:'reduce'}),page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const response=await page.goto(origin+url,{waitUntil:'networkidle'});assert.equal(response.status(),200);
   await page.evaluate(n=>document.documentElement.style.fontSize=n+'px',cfg.font);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert(overflow<=2,'Horizontal overflow '+JSON.stringify({cfg,overflow}));
   const cards=page.locator('.role-lane');assert.equal(await cards.count(),4);
   const boxes=await cards.evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}));
   for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){
    const a=boxes[i],b=boxes[j],ox=Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)),oy=Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
    assert(ox*oy<1,'Overlapping lanes '+JSON.stringify({cfg,i,j,boxes}));
   }
   const skip=page.locator('a.skip');await skip.focus();assert(await skip.evaluate(e=>document.activeElement===e));await skip.evaluate(e=>e.blur());
   const buttons=page.locator('button[data-lens]');assert.equal(await buttons.count(),4);
   for(let i=0;i<4;i++){const button=buttons.nth(i);await button.focus();await page.keyboard.press(i%2?'Space':'Enter');assert.equal(await button.getAttribute('aria-pressed'),'true','Keyboard state '+i);const target=await button.getAttribute('aria-controls');assert.equal(await page.locator('#'+target).isVisible(),true,'Panel invisibility '+i);assert.equal(await page.locator('[data-lens-panel]:visible').count(),1,'More than one visible panel');}
   assert.equal(await page.locator('form,input,textarea,[contenteditable]').count(),0,'Unexpected client data entry');
   assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0,'Client data unexpectedly persisted');
   assert.equal(await page.locator('.sheet').count(),2);assert.equal(await page.locator('.prompt').count(),10);
   if(cfg.width===390&&cfg.font===17){
    await page.addScriptTag({path:require.resolve('axe-core')});
    const axe=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
    const severe=axe.violations.filter(v=>['serious','critical'].includes(v.impact));assert.equal(severe.length,0,'Severe WCAG axe '+JSON.stringify(severe.map(v=>v.id)));
    await page.screenshot({path:path.join(out,'team-voice-390.png'),fullPage:true});
   }
   if(cfg.width===390&&cfg.font===34)await page.screenshot({path:path.join(out,'team-voice-text200.png'),fullPage:true});
   if(cfg.width===1280){
    await page.screenshot({path:path.join(out,'team-voice-desktop.png'),fullPage:true});
    await page.emulateMedia({media:'print'});assert.equal(await page.locator('#sheet-1').isVisible(),true);assert.equal(await page.locator('#sheet-2').isVisible(),true);
    const pdf=await page.pdf({format:'Letter',printBackground:false});assert(pdf.length>5000,'Print PDF empty');fs.writeFileSync(path.join(out,'team-voice-print.pdf'),pdf);
    await page.emulateMedia({media:'screen'});
   }
   assert.deepEqual(errors,[],'JS errors');results.push({cfg,overflow,overlap:false,buttons:4});await ctx.close();
  }
  const cx=await browser.newContext({viewport:{width:1280,height:850}}),page=await cx.newPage(),filters=[];
  for(const [population,audience,want] of [['children','case_manager',true],['teens','school_team',true],['children','caregiver',true],['teens','clinician',true],['adults','case_manager',false]]){
   const res=await page.goto(origin+'/resources/clinical-resource-finder.html',{waitUntil:'networkidle'});assert.equal(res.status(),200);
   await page.locator('#lab-q').fill('youth-led cross-system team planning');await page.locator('#lab-form button[type="submit"]').click();
   await page.locator('#lab-population').selectOption(population);await page.locator('#lab-audience').selectOption(audience);
   const count=await page.locator('#lab-results a[href="'+url+'"]').count();assert.equal(count>0,want,'Wrong finder result '+JSON.stringify({population,audience,count}));filters.push({population,audience,found:count>0});
  }
  await cx.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({status:'PASS',results,filters},null,2));console.log('DIAGNOSIS_WAVE4_RENDERED_PASS '+JSON.stringify({views:results.length,keyboardActions:24,ageRoleJourneys:filters.length,printPDF:1}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
