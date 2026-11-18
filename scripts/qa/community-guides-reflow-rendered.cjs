'use strict';
/* PR74 independent companion test: narrow-equivalent desktop zoom and text stress.
 * Browser zoom itself is not automated here; CSS viewport equivalence approximates
 * 1280px desktop at 200% (640 CSS px) and 400% (320 CSS px).
 * Native browser zoom + screen reader + physical print remain HUMAN GATES.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const base=process.env.CPL_QA_ORIGIN||'http://127.0.0.1:8765';
const dir=path.join(process.cwd(),'qa-artifacts/pr43/community-reflow');
fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true});
 const results=[];
 try{
  for(const guide of ['family-guide','transition-age-guide']){
   for(const test of [
    {name:'desktop-200pct-viewport-equivalent',width:640,fontBoost:1},
    {name:'desktop-400pct-viewport-equivalent',width:320,fontBoost:1},
    {name:'narrow-256-stress',width:256,fontBoost:1},
    {name:'text-enlarge-200pct-at-390',width:390,fontBoost:2}
   ]){
    const context=await browser.newContext({viewport:{width:test.width,height:900},reducedMotion:'reduce'});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    const response=await page.goto(base+'/resources/community/'+guide+'.html',{waitUntil:'networkidle'});
    assert.equal(response.status(),200,guide+' unavailable');
    if(test.fontBoost!==1)await page.addStyleTag({content:'html{font-size:200%!important}body{font-size:34px!important}'}); // approximately 2x the baseline 17px body text; not actual browser zoom
    const geom=await page.evaluate(()=>{
      const root=document.documentElement,selectors=['.wrap','.reader','.guide-main','.search-panel','.lgbtq-extra','.legal-source-check','.lgbtq-listing','.entry','.route'];
      const samples={};for(const sel of selectors){const nodes=[...document.querySelectorAll(sel)];samples[sel]=nodes.length?Math.max(...nodes.map(el=>Math.max(0,el.getBoundingClientRect().right-innerWidth))):null;}
      const offenders=[...document.querySelectorAll('body *')].filter(el=>{const style=getComputedStyle(el);return style.display!=='none'&&style.visibility!=='hidden'&&el.getBoundingClientRect().right>root.clientWidth+1;}).slice(0,12).map(el=>({tag:el.tagName,cls:String(el.className).slice(0,80),text:(el.textContent||'').trim().slice(0,50),right:Math.round(el.getBoundingClientRect().right)}));
      return {scrollWidth:root.scrollWidth,clientWidth:root.clientWidth,overflow:Math.max(0,root.scrollWidth-root.clientWidth),samples,offenders};
    });
    assert(geom.overflow<=2,guide+' horizontal page overflow at '+test.name+': '+JSON.stringify(geom));
    const input=page.locator('#guide-query'),reset=page.locator('#guide-clear');
    assert(await input.isVisible()&&await reset.isVisible(),guide+' search and reset unusable at '+test.name);
    assert.equal(await page.locator('.lgbtq-listing').count(),8,guide+' supplement count differs');
    const legal=page.locator('#current-legal-records');
    assert(await legal.isVisible(),guide+' legal source warning inaccessible at '+test.name);
    assert.equal(await legal.locator('a[href^="https://"]').count(),6,guide+' government source links missing');
    const direct=page.locator('.route a[href="#lgbtq-community-resources"]');
    await direct.focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>location.hash),'#lgbtq-community-resources',guide+' keyboard quick route failed at '+test.name);
    await input.fill('passport');
    assert((await page.locator('#guide-status').innerText()).includes('LGBTQ+ supplemental'),guide+' status absent at '+test.name);
    await input.fill('Pride Student Space');
    assert.equal(await page.locator('.lgbtq-listing:visible').count(),1,guide+' supplemental search failure at '+test.name);
    await reset.click();assert.equal(await page.locator('.lgbtq-listing:visible').count(),8,guide+' reset failure at '+test.name);
    const focusMetrics=await page.evaluate(()=>{
      const el=document.activeElement,rect=el.getBoundingClientRect();
      return {tag:el.tagName,focusOutline:getComputedStyle(el).outlineStyle,rect:{left:rect.left,right:rect.right,width:rect.width}};
    });
    assert.equal(focusMetrics.tag,'INPUT',guide+' reset fails to restore input focus at '+test.name);
    assert.equal(errors.length,0,guide+' script error at '+test.name+': '+errors.join(', '));
    if(test.name!=='narrow-256-stress') await page.screenshot({path:path.join(dir,guide+'-'+test.name+'.png'),fullPage:false});
    if(test.width===320){
      await page.addScriptTag({path:require.resolve('axe-core')});
      const audit=await page.evaluate(async()=>await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
      assert.equal(audit.violations.length,0,guide+' axe violations at 320: '+audit.violations.map(v=>v.id).join(', '));
    }
    results.push({guide,test:test.name,width:test.width,fontBoost:test.fontBoost,overflow:geom.overflow,legalLinks:6,localItems:8,focusRestored:true});
    await context.close();
   }
  }
  fs.writeFileSync(path.join(dir,'summary.json'),JSON.stringify({results,limitation:'Viewport and CSS text-equivalent tests; actual browser 200%/400% zoom, native assistive technology, physical print not tested'},null,2));
  console.log('COMMUNITY_GUIDES_REFLOW_RENDERED_PASS '+JSON.stringify(results));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
