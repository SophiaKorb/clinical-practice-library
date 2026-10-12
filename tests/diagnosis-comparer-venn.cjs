/* DSM Foundations comparer: Venn overlaps, non-misleading unsupported pairs, access and print. */
"use strict";
const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root="http://127.0.0.1:8765/resources/training/diagnosis-comparer.html";
const output="/tmp/cpl-dsm-venn-evidence";
fs.mkdirSync(output,{recursive:true});
(async()=>{
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
 for(const width of [320,390,768,1280]){
  const page=await browser.newPage({viewport:{width,height:870},reducedMotion:"reduce"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  const response=await page.goto(root,{waitUntil:"load"});
  assert.equal(response.status(),200,"comparer route loads");
  assert.equal(await page.locator(".cpl-static-nav").count(),1);
  assert.equal(await page.locator("h1").count(),1);
  assert.equal(await page.locator("#presets button").count(),10,"ten curated differential pairs");
  assert.equal(await page.locator("#venn-two circle").count(),2);
  assert.equal(await page.locator("#venn-three circle").count(),3);
  assert.equal(await page.locator("#venn-regions .venn-card").count(),3);
  assert.equal(await page.locator("#venn-regions .venn-shared li").count(),3,"default ADHD/GAD overlap mapped");
  assert.match(await page.locator("#venn-message").innerText(),/curated comparison/i);
  assert.match(await page.locator("#venn-svg").getAttribute("aria-label"),/ADHD/);
  assert.equal(await page.locator("#venn-three").evaluate(e=>getComputedStyle(e).display),"none");
  assert.ok((await page.locator("#venn-regions").innerText()).includes("Childhood-onset"),"distinctive feature present");
  const bbox=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,window:innerWidth,diagram:document.querySelector(".venn-stage").scrollWidth}));
  assert.ok(bbox.doc<=bbox.window+3,"no document overflow at "+width+": "+JSON.stringify(bbox));
  if(width<=390)assert.ok(bbox.diagram>=500,"mobile uses readable scrollable SVG instead of tiny text");
  await page.locator('#presets button[data-key="ocd|ocpd"]').click();
  assert.match(await page.locator("#venn-regions .venn-shared").innerText(),/rigidity|repetitive/i);
  assert.match(await page.locator("#venn-pairwise").innerText(),/purpose of repeated acts/i);
  assert.equal(await page.locator("#venn-two").evaluate(e=>getComputedStyle(e).display),"inline");
  await page.locator("#c").selectOption("gad");
  assert.equal(await page.locator("#venn-three").evaluate(e=>getComputedStyle(e).display),"inline");
  assert.equal(await page.locator("#venn-regions .venn-card").count(),3);
  assert.equal(await page.locator("#venn-pairwise article").count(),3);
  assert.match(await page.locator("#venn-message").innerText(),/does not assert/i);
  assert.match(await page.locator("#venn-regions").innerText(),/focus/i);
  await page.locator("#c").selectOption("");
  await page.locator("#a").selectOption("ocd");
  await page.locator("#b").selectOption("schizo");
  assert.match(await page.locator("#venn-message").innerText(),/no authored overlap/i);
  assert.equal(await page.locator("#venn-regions .venn-shared li").count(),0,"unsupported pairs don't invent common symptoms");
  await page.locator("#b").selectOption("ocd");
  assert.match(await page.locator("#status").innerText(),/duplicate/i);
  assert.equal(await page.locator("#venn-regions .venn-card").count(),0,"duplicates don't render Venn evidence");
  await page.locator("#a").selectOption("asd");
  await page.locator("#b").selectOption("social");
  assert.equal(await page.locator("#venn-regions .venn-shared li").count(),3);
  const lbl=await page.locator("#venn-two-a tspan").allTextContents();
  assert.deepEqual(lbl,["Autism"],"short readable circle labels");
  await page.locator("#a").selectOption("bpd");
  await page.locator("#b").selectOption("bipolar2");
  const mult=await page.locator("#venn-two-a tspan").allTextContents();
  assert.deepEqual(mult,["Borderline","personality"],"multi-line SVG label wraps");
  if(width===390){
   await page.screenshot({path:path.join(output,"venn-390.png"),animations:"disabled",fullPage:true});
   await page.emulateMedia({media:"print"});
   assert.equal(await page.locator("#venn-section").isVisible(),true,"Venn visible on print");
   assert.equal(await page.locator(".cpl-static-nav").isVisible(),false,"global nav hidden on print");
   const pdf=await page.pdf({path:path.join(output,"diagnosis-venn-print.pdf"),format:"Letter",landscape:true,printBackground:true});
   assert.ok(pdf.byteLength>7000,"printable file generated");
  }
  if(width===1280)await page.screenshot({path:path.join(output,"venn-1280.png"),animations:"disabled",fullPage:true});
  assert.deepEqual(errors,[],"zero page JS errors");
  await page.close();
 }
 console.log("PASS: 2-/3-circle Venn, 10 curated differentials, unsupported pairs, duplication protection, SVG labels, 320–1280 widths, accessibility basics, print.");
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
