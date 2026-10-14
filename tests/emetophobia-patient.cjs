/* Patient ERP/emetophobia companion: real-browser interaction, print, and access smoke test. */
"use strict";
const {chromium}=require("playwright"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root="http://127.0.0.1:8765";
const url="/resources/therapy/emetophobia-medical-anxiety-erp.html";
const output="/tmp/cpl-emetophobia-evidence";
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try {
  for(const width of [320,390,768,1280]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   const response=await page.goto(root+url,{waitUntil:"load"});
   assert.equal(response.status(),200,"HTML loads at "+width);
   assert.equal(await page.locator("h1").count(),1,"one h1");
   assert.equal(await page.locator(".cpl-static-nav").count(),1,"one shared navigation");
   assert.equal(await page.locator("#activity-list .practice-choice").count(),7,"seven vomiting-fear choices");
   assert.equal(await page.locator("#life-options button").count(),6,"six vomiting-fear avoidance domains");
   await page.locator("#life-options button[data-area=plans]").click();
   assert.match(await page.locator("#life-value").inputValue(),/Spend time with people/);
   await page.locator("#life-first").fill("Attend a safe get-together for a short while");
   await page.locator("#life-next").fill("Return for another ordinary gathering");
   assert.match(await page.locator("#preview-first").innerText(),/safe get-together/);
   assert.match(await page.locator("#preview-next").innerText(),/another ordinary gathering/);
   await page.locator("#use-approach").click();
   assert.match(await page.locator("#try-step").inputValue(),/safe get-together/);
   assert.match(await page.locator("#goal").inputValue(),/Spend time with people/);
   assert.match(await page.locator("#ritual").inputValue(),/asking everyone/);
   assert.match(await page.locator("#care-boundary").inputValue(),/public-health guidance/);
   assert.equal(await page.locator("#tab-emet").getAttribute("aria-pressed"),"true");
   const overflow=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:innerWidth}));
   assert.ok(overflow.document<=overflow.viewport+3,"no horizontal overflow at "+width+": "+JSON.stringify(overflow));
   await page.locator("#tab-health").click();
   assert.equal(await page.locator("#tab-health").getAttribute("aria-pressed"),"true");
   assert.equal(await page.locator("#activity-list .practice-choice").count(),7,"seven medical anxiety choices");
   assert.equal(await page.locator("#life-options button").count(),6,"six medical avoidance domains");
   await page.locator("#life-options button[data-area=visits]").click();
   assert.match(await page.locator("#life-avoided").inputValue(),/delay or cancel indicated/);
   await page.locator("#life-first").fill("Schedule the routine appointment I have avoided");
   await page.locator("#life-value").fill("Get appropriate follow-up care");
   await page.locator("#use-approach").click();
   assert.equal(await page.locator("#try-step").inputValue(),"Schedule the routine appointment I have avoided");
   assert.equal(await page.locator("#goal").inputValue(),"Get appropriate follow-up care");
   assert.match(await page.locator("#care-boundary").inputValue(),/Keep indicated appointments/);
   await page.locator("#gate-new").click();
   assert.match(await page.locator("#gate-output").innerText(),/Medical care takes priority/);
   await page.locator("#activity-list button[data-id=question]").click();
   assert.match(await page.locator("#try-step").inputValue(),/one concrete/);
   await page.locator("#goal").fill("Attend my follow-up visit");
   await page.locator("#try-step").fill("Ask one planned nonurgent question");
   await page.locator("#ritual").fill("Avoid repeat portal checks");
   await page.locator("#plan-form button[type=submit]").click();
   assert.match(await page.locator("#s-goal").innerText(),/Attend my follow-up visit/);
   assert.match(await page.locator("#s-ritual").innerText(),/Avoid repeat portal checks/);
   await page.locator("#did-choice").check();
   await page.locator("#did-return").check();
   assert.equal(await page.locator("#did-return").isChecked(),true,"reclaiming life is included in reflection");
   assert.match(await page.locator("#reflect-summary").innerText(),/reflection, not a success score/i);
   await page.locator("#reset-reflect").click();
   assert.equal(await page.locator("#did-choice").isChecked(),false);
   assert.equal(await page.locator("#did-return").isChecked(),false);
   const choices=await page.locator("#activity-list .practice-choice[aria-pressed=true]").count();
   assert.equal(choices,1,"one chosen example");
   if(width===390){
    await page.screenshot({path:path.join(output,"patient-mobile-390.png"),fullPage:true,animations:"disabled"});
    await page.emulateMedia({media:"print"});
    assert.equal(await page.locator(".cpl-static-nav").isVisible(),false,"navigation hidden for print");
    assert.equal(await page.locator("#plan-summary").isVisible(),true,"practice card prints");
    assert.equal(await page.locator("#life-return").isVisible(),true,"return-to-life ladder prints");
    assert.equal(await page.locator("#use-approach").isVisible(),false,"avoidance button hidden on print");
    const pdf=await page.pdf({format:"Letter",path:path.join(output,"patient-practice-print.pdf"),printBackground:true});
    assert.ok(pdf.byteLength>7000,"print PDF generated");
    await page.emulateMedia({media:"screen"});
   }
   if(width===1280)await page.screenshot({path:path.join(output,"patient-desktop-1280.png"),fullPage:true,animations:"disabled"});
   await page.reload();
   assert.equal(await page.locator("#goal").inputValue(),"","personal notes not stored in browser");
   assert.notEqual(await page.locator("#life-first").inputValue(),"Schedule the routine appointment I have avoided","avoidance notes not stored after reload");
   assert.equal(await page.locator("#tab-emet").getAttribute("aria-pressed"),"true","initial track restored");
   assert.deepEqual(errors,[],"zero JavaScript exceptions");
   await page.close();
  }
  console.log("PASS: 4 viewport widths; navigation, ERP track, safe care gate, action selection, form, reflection, reset, print, no persistence, no JS errors.");
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});