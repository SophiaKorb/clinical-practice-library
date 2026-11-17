'use strict';
/* Review-only browser QA: source-verified Spanish equivalents, accessible
   disclosure and filtered school users. Native AT/real zoom still open. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const dir=path.join(process.cwd(),'qa-artifacts/pr43/finder-source-audit');
fs.mkdirSync(dir,{recursive:true});
const base=process.env.CPL_QA_ORIGIN||'http://127.0.0.1:8765';
(async()=>{
 const browser=await chromium.launch({headless:true});
 const results=[];
 try{
 for(const width of [1280,640,390,320]){
  const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const route=base+'/resources/clinical-resource-finder.html';
  await page.goto(route+'?q=higiene',{waitUntil:'networkidle'});
  await page.waitForSelector('#lab-results .result-card');
  const first=page.locator('#lab-results .result-card').first();
  assert.match(await first.locator('h3').innerText(),/tareas de higiene/i);
  assert.equal(await page.locator('#lab-results .result-card').count(),1,'Exactly matching Spanish articles must group, not multiply cards');
  const details=first.locator('details.family');
  assert.equal(await details.count(),1);
  const summary=details.locator('summary');
  assert.match(await summary.innerText(),/other Spanish address/i);
  await summary.focus();await page.keyboard.press('Enter');
  assert.equal(await details.getAttribute('open'),'','Keyboard disclosure inaccessible');
  assert(await first.locator('a[href="/resources/es/handouts/higiene-tareas-dificiles.html"]').count()>0,
    'Other exact-source address not retained');
  await page.screenshot({path:path.join(dir,'spanish-equivalent-'+width+'.png'),fullPage:true});
  await page.fill('#lab-q','hacer que los planes sean más fáciles');
  await page.waitForTimeout(90);
  const cards=page.locator('#lab-results .result-card');
  assert(await cards.count()>0);
  const plan=cards.first();
  assert(await plan.locator('a[href="/resources/es/handouts/planes-empezar-terminar.html"]').count()>0,
    'Current Spanish executive function source not prioritized over archived siblings');
  await plan.locator('details.family summary').click();
  assert(await plan.locator('a[href="/resources/es/handouts/planes-faciles-empezar-terminar.html"]').count()>0,
    'Retained earlier version not discoverable');
  await page.screenshot({path:path.join(dir,'spanish-historical-'+width+'.png'),fullPage:true});
  await page.fill('#lab-q','hoja de preparación para un plan de seguridad');
  assert(await page.locator('#lab-results a[href="/resources/es/handouts/hoja-preparacion-plan-seguridad.html"]').count()>0,
    'Fillable-linked safety worksheet missing');
  assert(await page.locator('#lab-results a[href="/resources/es/handouts/preparacion-plan-seguridad.html"]').count()>0,
    'Separate same-title safety article wrongly collapsed');
  await page.fill('#lab-q','TDAH');
  await page.selectOption('#lab-population','children');
  await page.selectOption('#lab-audience','caregiver');
  const p=page.locator('a[href="/resources/es/school/clinical/tdah.html"]');
  assert(await p.count()>0,'Spanish clinical school guide not discoverable for explicit family audience');
  // Narrative Spanish query survives UI input and age/role filters.
  await page.fill('#lab-q','mi adolescente siente que todo es injusto');
  await page.selectOption('#lab-population','teens');
  await page.selectOption('#lab-audience','client');
  const fairness=page.locator('#lab-results a[href="/resources/es/handouts/justicia-flexibilidad.html"]');
  assert(await fairness.count()>0,'Spanish adolescent narrative query must surface original source');
  await page.screenshot({path:path.join(dir,'spanish-natural-language-'+width+'.png'),fullPage:true});
  await page.fill('#lab-q','se me olvida todo cuando intento empezar tareas');
  await page.selectOption('#lab-population','adults');
  assert(await page.locator('#lab-results a[href="/resources/es/handouts/planes-empezar-terminar.html"]').count()>0,
    'Spanish executive-function narrative query disappeared under adult client filters');
  assert((await page.locator('#lab-q').inputValue()).includes('se me olvida'),'Search entry was not preserved');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert(overflow<=2,'Overflow at '+width+': '+overflow);
  await page.addScriptTag({path:require.resolve('axe-core')});
  const axe=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
  assert.equal(axe.violations.filter(x=>x.impact==='serious'||x.impact==='critical').length,0,
    'Serious axe violations '+width+': '+axe.violations.map(x=>x.id).join(','));
  fs.writeFileSync(path.join(dir,'axe-'+width+'.json'),JSON.stringify({violations:axe.violations,incomplete:axe.incomplete},null,2));
  assert.deepEqual(errors,[],'Browser exceptions '+width);
  results.push({viewport:width,equivalentGrouped:true,olderCurrentLink:true,sameTitleDistinct:true,caregiverSchoolGuide:true,overflow,axeViolations:axe.violations.length});
  await context.close();
 }
  fs.writeFileSync(path.join(dir,'summary.json'),JSON.stringify({status:'PASS',scope:'Chromium 1280/640/390/320 CSS px, keyboard disclosure, age+audience, axe; no native AT or physical print',results},null,2));
  console.log('CPL_SOURCE_RENDERED_PASS '+JSON.stringify(results));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
