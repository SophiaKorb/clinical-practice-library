/* Nonproduction rendered keyboard/print QA. Use a local file-serving origin; never hit production. */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = 'http://127.0.0.1:8765';
const skipRoutes = require('./skip-navigation-routes.cjs');
const repairedPaths = new Set([...skipRoutes.jurisdictions, ...skipRoutes.legacy]);
const functionalPaths = new Set([...repairedPaths, skipRoutes.worksheet]);
const paths = [...new Set([
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
  ...skipRoutes.jurisdictions, ...skipRoutes.legacy,
])];
const widths = [320, 390, 768, 1280];
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
          firstSkip:(document.querySelector('a.skip,a.skip-link,a.cpl-skip')?.getAttribute('href')||''),
          hasSpanish:!!document.getElementById('espanol')
        }));
        if (metrics.scroll > metrics.client+1) failures.push(path + ' ' + width + 'px: overflow '+metrics.scroll+'/'+metrics.client);
        if (!metrics.title) failures.push(path + ' ' + width + 'px: missing title');
        await page.keyboard.press('Tab');
        const focus = await page.evaluate(() => document.activeElement?.getAttribute('href')||'');
        if (!metrics.firstSkip.startsWith('#')) {
          failures.push(path + ' ' + width + 'px: missing first skip link');
        } else if (focus !== metrics.firstSkip) {
          failures.push(path + ' ' + width + 'px: first Tab focus '+focus+' expected '+metrics.firstSkip);
        }
        if (functionalPaths.has(path)) {
          const before = await page.evaluate(() => {
            const a=document.activeElement, target=a?.hash && document.getElementById(decodeURIComponent(a.hash.slice(1)));
            const box=a.getBoundingClientRect();
            const top=document.elementFromPoint(box.x+box.width/2,box.y+box.height/2);
            return {valid:!!target && target.matches('main'), visible:box.top>=0 && box.bottom<=innerHeight && (top===a || a.contains(top))};
          });
          if (!before.valid || !before.visible) failures.push(path+' '+width+'px: invalid target or obscured skip focus');
          await page.keyboard.press('Enter');
          const landed = await page.evaluate(() => {
            const target=document.getElementById('main-content');
            return {fragment:location.hash, focused:document.activeElement===target};
          });
          if (landed.fragment !== '#main-content' || (repairedPaths.has(path) && !landed.focused)) failures.push(path+' '+width+'px: skip activation did not reach main');
          await page.keyboard.press('Tab');
          const continued = await page.evaluate(() => {
            const target=document.getElementById('main-content');
            const next=target.querySelector('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),summary');
            return {hasNext:!!next, correct:!next || document.activeElement===next};
          });
          if (!continued.correct) failures.push(path+' '+width+'px: next Tab did not continue at first main control');
          // Long documents must keep the link visible at 200% text size and in forced colors.
          if (width===390) {
            await page.goto(base+path,{waitUntil:'domcontentloaded'});
            await page.emulateMedia({forcedColors:'active'});
            await page.addStyleTag({content:'.cpl-skip{font-size:200%}'});
            await page.keyboard.press('Tab');
            const accessible=await page.evaluate(() => {
              const a=document.activeElement,b=a.getBoundingClientRect();
              return a.matches('a.cpl-skip') && b.top>=0 && b.right<=innerWidth && b.bottom<=innerHeight && getComputedStyle(a).outlineStyle!=='none';
            });
            if (!accessible) failures.push(path+': forced-colors/large-text skip focus');
            await page.emulateMedia({forcedColors:'none'});
          }
        }
        if (path === '/' && !metrics.hasSpanish) failures.push('homepage ' + width + 'px: missing #espanol');
        if (exceptions.length) failures.push(path + ' ' + width + 'px JS error '+exceptions.join('; ').slice(0,200));
        console.log('CHECK',width,path,'HTTP',response?.status(),'scroll/client',metrics.scroll+'/'+metrics.client,'firstTab',focus);
      }
      if (width === 390) {
        for (const path of ['/', '/resources/clinical-topics/aphasia-communication-access/index.html', skipRoutes.worksheet, skipRoutes.jurisdictions[0], skipRoutes.jurisdictions[1], ...skipRoutes.legacy]) {
          const response = await page.goto(base+path,{waitUntil:'domcontentloaded'});
          assert.equal(response.status(),200);
          await page.emulateMedia({media:'print'});
          const skipHidden = await page.locator('a.cpl-skip').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).display==='none'));
          if (!skipHidden) failures.push('PRINT '+path+': skip link should be hidden');
          const pdf = await page.pdf({format:'Letter',printBackground:true});
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
