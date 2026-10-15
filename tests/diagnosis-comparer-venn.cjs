/* Actual browser behavior across all authored pairs and both text styles. */
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const output=process.env.DSM_QA_OUTPUT||'/tmp/cpl-dsm-venn-evidence';fs.mkdirSync(output,{recursive:true});
(async()=>{
 let server;const base=process.env.DSM_BASE_URL||'http://127.0.0.1:8765';
 if(!process.env.DSM_BASE_URL){server=http.createServer((req,res)=>{const file=path.resolve('.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(process.cwd()+path.sep)){res.writeHead(403);res.end();return;}try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});await new Promise(resolve=>server.listen(8765,'127.0.0.1',resolve));}
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote']});
 try{
 for(const width of [320,390,768,1280]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const response=await page.goto(base+'/resources/training/diagnosis-comparer.html',{waitUntil:'load'});assert.equal(response.status(),200);
 assert.equal(await page.locator('#a option').count(),26);assert.equal(await page.locator('#b option').count(),26);
 assert.equal(await page.locator('#presets button').count(),31);assert.equal(await page.locator('#tbody tr').count(),7);
 const pairs=await page.locator('#presets button').evaluateAll(elements=>elements.map(e=>e.dataset.key.split('|')));
 for(const mode of ['clinical','plain']){
 await page.locator('#mode-'+mode).click();assert.equal(await page.locator('#mode-'+mode).getAttribute('aria-pressed'),'true');
 for(const [a,b] of pairs){
 await page.selectOption('#a',a);await page.selectOption('#b',b);
 assert.equal(await page.locator('#venn-regions .venn-shared li').count(),3,`${width}/${mode}/${a}/${b}`);
 assert.equal(await page.locator('#venn-pairwise article').count(),4);
 assert.ok(await page.locator('#venn-two-a tspan').count()>=1);assert.ok(await page.locator('#venn-two-b tspan').count()>=1);
 const cards=await page.locator('#venn-regions .venn-card').allTextContents();
 const table=await page.locator('#tbody td').allTextContents();assert.ok(table.every(t=>t.length>20));
 await page.selectOption('#a',b);await page.selectOption('#b',a);
 const reversed=await page.locator('#venn-regions .venn-card').allTextContents();
 assert.equal(cards[0],reversed[2]);assert.equal(cards[2],reversed[0]);assert.equal(cards[1],reversed[1]);
 await page.locator('#mode-'+(mode==='plain'?'clinical':'plain')).click();
 assert.equal(await page.inputValue('#a'),b);assert.equal(await page.inputValue('#b'),a);
 await page.locator('#mode-'+mode).click();
 assert.equal(await page.inputValue('#a'),b);assert.equal(await page.inputValue('#b'),a);
 }
 await page.selectOption('#a','ocd');await page.selectOption('#b','schizo');
 assert.equal(await page.locator('#venn-regions .venn-shared li').count(),0);assert.match(await page.locator('#venn-message').textContent(),/No authored overlap|not yet written|not yet described|not yet mapped/i);
 await page.selectOption('#b','ocd');assert.equal(await page.locator('#venn-regions article').count(),0);assert.equal(await page.locator('#venn-two').isVisible(),false);
 await page.selectOption('#a','cannabis');await page.selectOption('#b','schizo');
 assert.match(await page.locator('#venn-regions article').first().innerText(),/Cannabis use disorder/);assert.match(await page.locator('#venn-regions article').last().innerText(),/Schizophrenia/);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'no page overflow '+width+'/'+mode);
 await page.locator('.differential-presets summary').click();assert.equal(await page.locator('.differential-presets').getAttribute('open'),'');await page.locator('.differential-presets summary').click();
 if(width===390||width===1280){await page.screenshot({path:path.join(output,`comparer-${mode}-${width}.png`),fullPage:true});}
 if(width===1280){await page.emulateMedia({media:'print'});assert.equal(await page.locator('#choose-section').isVisible(),false);assert.equal(await page.locator('#venn-section').isVisible(),true);await page.pdf({path:path.join(output,`comparer-${mode}.pdf`),format:'Letter',landscape:true,printBackground:true});await page.emulateMedia({media:'screen'});}
 }
 // Text style survives navigation. Course interactions survive switching styles.
 await page.goto(base+'/resources/training/dsm-from-zero.html',{waitUntil:'load'});
 assert.equal(await page.locator('#dsm-language-plain').getAttribute('aria-pressed'),'true');
 await page.locator('details.practice-set').first().evaluate(e=>e.open=true);
 const first=page.locator('[data-quiz]').first();await first.locator('[data-answer="yes"]').click();
 const feedback=await first.locator('.feedback').innerText();await page.locator('[data-done]').first().click();
 await page.locator('#dsm-language-clinical').click();assert.equal(await page.locator('[data-done]').first().getAttribute('aria-pressed'),'true');assert.equal(await first.locator('[data-answer="yes"]').getAttribute('aria-pressed'),'false');
 assert.match(await first.locator('.feedback').innerText(),/Choose an answer for feedback/);assert.ok(feedback.length>20);
 assert.equal(await page.locator('[data-quiz]').count(),80);
 await page.goto(base+'/resources/training/diagnosis-comparer.html',{waitUntil:'load'});assert.equal(await page.locator('#mode-clinical').getAttribute('aria-pressed'),'true');
 await page.locator('#a').focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('Tab');assert.equal(await page.locator('#b').evaluate(e=>e===document.activeElement),true);
 assert.deepEqual(errors,[],'no runtime errors');await page.close();
 }
 fs.writeFileSync(path.join(output,'result.json'),JSON.stringify({base,widths:[320,390,768,1280],styles:2,pairs:31,orders:2,pairChecks:496,profiles:26,rows:7,errors:0,courseQuestionsRetained:80,scope:'Comparer/browser regression; full course bilingual/clinical review remains separate'},null,2));
 console.log('PASS: 496 pair/style/order checks, 26 selectors, unsupported/duplicate cases, retained selection, cross-page preference, retained course progress/answers, keyboard, four widths, print PDFs and zero runtime errors.');
 }finally{await browser.close();if(server)server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
