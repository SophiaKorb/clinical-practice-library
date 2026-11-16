/* Isolated combined PR #40 + #41 rendered QA. No production requests. */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const origin='http://127.0.0.1:8765';
const pages=[
 '/resources/community/online-lgbtq-resources.html',
 '/resources/community/affirming-clinical-conversation.html',
 '/resources/community/caregiver-support-lgbtq-youth.html',
 '/resources/community/youth-school-community-access.html'
];
const widths=[320,390,640,1280]; // 320px is the WCAG 400% reflow-equivalent CSS viewport for a 1280px window.
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const failures=[];let checks=0;
 const mark=(ok,message)=>{checks++;if(!ok)failures.push(message);};
 try{
  for(const width of widths){
   const ctx=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1});
   const page=await ctx.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   for(const p of pages){
    errors.length=0;
    const resp=await page.goto(origin+p,{waitUntil:'load',timeout:30000});
    mark(resp?.status()===200,p+' '+width+' HTTP '+resp?.status());
    const x=await page.evaluate(()=>({
     scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,
     h1:document.querySelectorAll('main h1').length,main:!!document.getElementById('content'),
     first:document.querySelector('body > a.skip')?.getAttribute('href'),
     badImages:[...document.images].filter(i=>!i.hasAttribute('alt')).length
    }));
    mark(x.scroll<=x.client+1,p+' '+width+' horizontal overflow '+x.scroll+'/'+x.client);
    mark(x.h1===1&&x.main,p+' '+width+' heading/main');
    mark(x.first==='#content',p+' '+width+' skip link missing');
    mark(x.badImages===0,p+' '+width+' images without alt');
    await page.keyboard.press('Tab');
    const first=await page.evaluate(()=>document.activeElement?.getAttribute('href'));
    mark(first==='#content',p+' '+width+' first focus '+first);
    await page.keyboard.press('Enter');
    const landed=await page.evaluate(()=>({hash:location.hash,active:document.activeElement?.id}));
    mark(landed.hash==='#content'&&landed.active==='content',p+' '+width+' skip target focus '+JSON.stringify(landed));
    mark(errors.length===0,p+' '+width+' JS errors '+errors.join('; '));
    if(width===390){
      await page.emulateMedia({reducedMotion:'reduce'});
      const scroll=await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior);
      mark(scroll==='auto',p+' missing reduced-motion override: '+scroll);
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.emulateMedia({media:'print'});
      const printSkip=await page.locator('a.skip').evaluate(el=>getComputedStyle(el).display);
      mark(printSkip==='none',p+' printed skip-link visible');
      const pdf=await page.pdf({format:'Letter',printBackground:true});
      mark(pdf.length>1500&&pdf.subarray(0,4).toString()==='%PDF',p+' printed PDF invalid');
      await page.emulateMedia({media:'screen'});
    }
   }
   await ctx.close();
  }
  const context=await browser.newContext({viewport:{width:390,height:900}});
  const page=await context.newPage();
  const response=await page.goto(origin+'/resources/clinical-resource-finder.html?q=LGBTQ',{waitUntil:'load',timeout:30000});
  mark(response?.status()===200,'Finder response '+response?.status());
  await page.waitForSelector('.finder-card h3 a');
  const displayed=await page.locator('.finder-card').count();
  mark(displayed===24,'Finder initially shows '+displayed+' not 24');
  mark(await page.locator('.finder-card .tag-list,.finder-card small,.finder-card details').count()===0,'Result cards expose internal tags or accordions');
  const firstStatus=await page.locator('#finder-status').innerText();
  mark(/^30 matching resources; showing 24\./.test(firstStatus),'LGBTQ search status '+firstStatus);
  for(const age of ['children','teens','adults']){
   for(const role of ['Client / caregiver','School team','Staff / case manager','Graduate trainee','Clinician']){
    await page.locator('#finder-reset').click();
    await page.selectOption('#age-audience',age);
    await page.selectOption('#facet-role',role);
    const t=await page.locator('#finder-status').innerText();
    const count=Number(t.match(/^(\d+) matching resources/)?.[1]);
    mark(Number.isFinite(count)&&count>0,age+' '+role+' finder empty '+t);
   }
  }
  for(const name of ['Eon','TrevorSpace']){
   await page.goto(origin+'/resources/clinical-resource-finder.html?q='+encodeURIComponent(name)+'&age=children',{waitUntil:'load'});
   const status=await page.locator('#finder-status').innerText();
   mark(/^0 matching resources/.test(status),name+' should not be listed for under-13 children: '+status);
   await page.selectOption('#age-audience','teens');
   const teen=await page.locator('#finder-status').innerText();
   mark(/^[1-9]\d* matching resources/.test(teen),name+' should be offered for teens: '+teen);
  }
  await context.close();
 }finally{await browser.close()}
 console.log('COMBINED QA:',checks,'checks;',failures.length,'failures');
 for(const error of failures)console.error('FAIL:',error);
 if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
