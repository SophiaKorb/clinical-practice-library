/* Nonproduction PR #19 rendered smoke QA. Use a local file-serving origin; never hit production. */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = 'http://127.0.0.1:8765';
const paths = [
  '/', '/library.html', '/resources/start-here.html',
  '/resources/clinical-resource-finder.html',
  '/resources/clinical-topics/index.html',
  '/resources/clinical-topics/aphasia-communication-access/index.html',
  '/resources/clinical-topics/bipolar-episode-timeline/index.html',
  '/resources/clinical-topics/voices-collaborative-coping/case.html',
  '/resources/therapy/visual-reasoning-toolkit.html',
  '/resources/training/dsm-from-zero.html',
  '/resources/training/diagnosis-comparer.html',
  '/resources/therapy/treatment-planning-worksheet.html',
  '/resources/california/iep-parent-guide.html',
  '/legacy/resources/handouts/grounding.html',
];
const widths = [320, 390, 768, 1280];
// Existing approved-main files, not added or modified by PR #19. Keep debt visible;
// never count them as new-route skip-link successes.
const inheritedSkipLinkDebt = new Set([
  '/resources/therapy/treatment-planning-worksheet.html',
  '/resources/california/iep-parent-guide.html',
  '/legacy/resources/handouts/grounding.html',
]);
(async () => {
  const browser = await chromium.launch({headless: true, args: ['--no-sandbox']});
  const failures = [];
  let checks = 0;
  try {
    for (const width of widths) {
      const context = await browser.newContext({viewport:{width,height:860}, deviceScaleFactor:1});
      const page = await context.newPage();
      const exceptions = [];
      page.on('pageerror', err => exceptions.push(err.message));
      for (const path of paths) {
        exceptions.length = 0;
        const response = await page.goto(base + path, {waitUntil:'domcontentloaded',timeout:30000});
        checks++;
        if (!response || response.status() !== 200) failures.push(path + ' ' + width + 'px: HTTP ' + (response?.status() ?? 'none'));
        const metrics = await page.evaluate(() => ({
          scroll:document.documentElement.scrollWidth,
          client:document.documentElement.clientWidth,
          title:document.title,
          firstSkip:(document.querySelector('a.skip,a.skip-link')?.getAttribute('href')||''),
          hasSpanish:!!document.getElementById('espanol')
        }));
        if (metrics.scroll > metrics.client+1) failures.push(path + ' ' + width + 'px: overflow '+metrics.scroll+'/'+metrics.client);
        if (!metrics.title) failures.push(path + ' ' + width + 'px: missing title');
        await page.keyboard.press('Tab');
        const focus = await page.evaluate(() => document.activeElement?.getAttribute('href')||'');
        if (!metrics.firstSkip.startsWith('#')) {
          if (inheritedSkipLinkDebt.has(path)) {
            console.warn('BASELINE_A11Y_DEBT', width, path, 'lacks skip link; first Tab='+focus);
            if (!focus) failures.push(path + ' ' + width + 'px: no keyboard-focusable first link');
          } else failures.push(path + ' ' + width + 'px: missing first skip link');
        } else if (focus !== metrics.firstSkip) {
          failures.push(path + ' ' + width + 'px: first Tab focus '+focus+' expected '+metrics.firstSkip);
        }
        if (path === '/' && !metrics.hasSpanish) failures.push('homepage ' + width + 'px: missing #espanol');
        if (exceptions.length) failures.push(path + ' ' + width + 'px JS error '+exceptions.join('; ').slice(0,200));
        console.log('CHECK',width,path,'HTTP',response?.status(),'scroll/client',metrics.scroll+'/'+metrics.client,'firstTab',focus);
      }
      if (width === 390) {
        for (const path of ['/', '/resources/clinical-topics/aphasia-communication-access/index.html', '/resources/therapy/treatment-planning-worksheet.html']) {
          const response = await page.goto(base+path,{waitUntil:'domcontentloaded'});
          assert.equal(response.status(),200);
          await page.emulateMedia({media:'print'});
          const pdf = await page.pdf({format:'A4',printBackground:true});
          checks++;
          if (pdf.length < 1500 || pdf.subarray(0,4).toString() !== '%PDF') failures.push('PRINT '+path+': invalid PDF '+pdf.length+' bytes');
          console.log('PRINT',path,'PDF bytes',pdf.length);
          await page.emulateMedia({media:'screen'});
        }
      }
      await context.close();
    }
  } finally { await browser.close(); }
  console.log('SUMMARY',checks,'checks', failures.length,'failures');
  failures.forEach(s => console.error('FAIL',s));
  if (failures.length) process.exitCode=1;
})().catch(e=>{console.error(e); process.exitCode=1;});
