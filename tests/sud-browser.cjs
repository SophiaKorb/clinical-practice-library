const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true});const url=pathToFileURL(path.resolve('resources/training/substance-use-disorder-tool.html')).href;const dir='sud-qa-evidence';fs.mkdirSync(dir,{recursive:true});
for(const width of [320,390,768,1280]){
 const page=await browser.newPage({viewport:{width,height:850}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){},speak(u){window.__spoken=u.text}}});Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:function(t){this.text=t}})});await page.goto(url);await page.waitForSelector('.item');
 assert.equal(await page.locator('#criteria .item').count(),11);
 assert.equal(await page.locator('#practice-step').innerText(),'Criterion 1 of 11');
 await page.locator('input[name="practice-answer"][value="yes"]').check();
 await page.locator('#practice-reveal').click();
 assert.match(await page.locator('#practice-feedback').innerText(),/Teaching interpretation/);
 await page.locator('#practice-next').click();
 assert.equal(await page.locator('#practice-step').innerText(),'Criterion 2 of 11');
 await page.locator('[data-example="cannabis"]').click();assert.match(await page.locator('#example-output').innerText(),/medical cannabis/i);
 await page.locator('[data-example="mat"]').click();assert.match(await page.locator('#example-output').innerText(),/buprenorphine/i);

 assert.equal(await page.locator('#plain').getAttribute('aria-pressed'),'true');
 assert.equal(await page.locator('#plain').innerText(),'Plain language');
 const plainIntro=await page.locator('.lead').innerText();
 await page.locator('#clinical').click();
 const clinicalIntro=await page.locator('.lead').innerText();
 assert.notEqual(plainIntro,clinicalIntro,'Intro must actually change language');
 const clinicalDefinition=await page.locator('#intro-definition').innerText();
 const clinicalFramework=await page.locator('#intro-framework').innerText();
 await page.locator('#plain').click();
 assert.notEqual(await page.locator('#intro-definition').innerText(),clinicalDefinition);
 assert.notEqual(await page.locator('#intro-framework').innerText(),clinicalFramework);
 await page.locator('#clinical').click();

 await page.locator('#plain').click();
 assert.equal(await page.locator('.lead').innerText(),plainIntro);

 assert.equal(await page.locator('#cannabis-teaching').isVisible(),false);
 await page.locator('#substance').selectOption('cannabis');
 assert.equal(await page.locator('#cannabis-teaching').isVisible(),true);
 await page.locator('#substance').selectOption('alcohol');
 assert.equal(await page.locator('#cannabis-teaching').isVisible(),false);
 assert.equal(await page.evaluate(()=>document.querySelector('#language-panel').compareDocumentPosition(document.querySelector('#learning-path')) & Node.DOCUMENT_POSITION_FOLLOWING),4);
 assert.equal(await page.evaluate(()=>document.querySelector('#mat-learning').compareDocumentPosition(document.querySelector('#criteria')) & Node.DOCUMENT_POSITION_PRECEDING),2);

 await page.locator('#clinical').click();assert.equal(await page.locator('#clinical').getAttribute('aria-pressed'),'true');
 await page.locator('#plain').click();assert.equal(await page.locator('#plain').getAttribute('aria-pressed'),'true');
 await page.locator('#drug-query').fill('molly');await page.locator('#drug-query').press('Enter');assert.match(await page.locator('#drug-result').innerText(),/MDMA/);
 await page.locator('#drug-query').fill('xanax');await page.locator('#drug-search').click();assert.match(await page.locator('#drug-result').innerText(),/Sedative/);
 await page.getByRole('button',{name:'Hear the class'}).click();assert.match(await page.evaluate(()=>window.__spoken),/Sedative/);
 await page.locator('#drug-query').fill('blues');await page.locator('#drug-search').click();assert.match(await page.locator('#drug-result').innerText(),/Ambiguous/);
 await page.locator('#drug-query').fill('invented-unrecognized-name');await page.locator('#drug-search').click();assert.match(await page.locator('#drug-result').innerText(),/Not found/);
 await page.locator('.opts input[value=yes]').first().check();assert.equal((await page.locator('#yescount').innerText()).trim(),'1');
 assert.equal(errors.length,0,errors.join('; '));
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert(!overflow,'horizontal overflow '+width);
 await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});const access=await page.evaluate(async()=>await axe.run('main',{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));assert.equal(access.violations.length,0,JSON.stringify(access.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,html:n.html,summary:n.failureSummary}))}))));
 await page.screenshot({path:dir+'/sud-'+width+'.png',fullPage:true});await page.close();
}
const page=await browser.newPage();await page.goto(url);await page.locator('#drug-query').fill('mdma');await page.locator('#drug-search').click();
const speech=await page.locator('button:has-text("Hear the class")').count();assert(speech===0||speech===1);
const pdf=await page.pdf({format:'Letter',printBackground:true});fs.writeFileSync(dir+'/sud-print.pdf',pdf);assert(pdf.length>1000);
await browser.close();console.log('SUD browser viewport/keyboard/print/speech-control assertions PASS');
})().catch(e=>{console.error(e);process.exit(1)});
