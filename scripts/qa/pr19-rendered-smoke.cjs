/* Nonproduction rendered keyboard/print QA. Use a local file-serving origin; never hit production. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const base = 'http://127.0.0.1:8765';
const skipRoutes = require('./skip-navigation-routes.cjs');
const repairedPaths = new Set([...skipRoutes.jurisdictions, ...skipRoutes.legacy, ...skipRoutes.additional]);
const functionalPaths = new Set([...repairedPaths, skipRoutes.worksheet]);
const paths = [...new Set([
  '/', '/library.html', '/resources/start-here.html',
  '/resources/clinical-resource-finder.html',
  '/resources/clinical-topics/index.html',
  '/resources/clinical-topics/aphasia-communication-access/index.html',
  '/resources/clinical-topics/bipolar-episode-timeline/index.html',
  '/resources/clinical-topics/voices-collaborative-coping/case.html',
  '/resources/therapy/visual-reasoning-toolkit.html',
  '/resources/therapy/clinical-intern-learning-hub.html',
  '/resources/training/dsm-from-zero.html',
  '/resources/training/diagnosis-comparer.html',
  '/resources/therapy/treatment-planning-worksheet.html',
  '/resources/california/iep-parent-guide.html',
  '/legacy/resources/handouts/grounding.html',
  ...skipRoutes.jurisdictions, ...skipRoutes.legacy, ...skipRoutes.additional,
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
        if (path === '/resources/therapy/clinical-intern-learning-hub.html') {
          const assignmentQA = await page.evaluate(() => {
            const cards=[...document.querySelectorAll('#assignments article.assignment')];
            return {
              count:cards.length,
              inView:cards.every(c=>c.scrollWidth<=c.clientWidth+1),
              width:document.documentElement.scrollWidth,
              visibleHeading:!!document.querySelector('#assignments h2'),
              links:cards.every(c=>[...c.querySelectorAll('a')].every(a=>a.getAttribute('href')?.startsWith('/resources/'))),
              standards:cards.every(c=>c.querySelector('.submission')&&c.querySelector('.feedback'))
            };
          });
          if (assignmentQA.count!==6 || !assignmentQA.visibleHeading || !assignmentQA.links || !assignmentQA.standards || !assignmentQA.inView)
            failures.push('Supervisee assignment display regression at '+width+'px: '+JSON.stringify(assignmentQA));
          if (width===390 || width===1280) {
            const out='qa-artifacts/pr43/supervisee-assignments';
            fs.mkdirSync(out,{recursive:true});
            await page.locator('#assignments').scrollIntoViewIfNeeded();
            await page.screenshot({path:out+'/supervisee-'+width+'.png',animations:'disabled'});
          }
        }
        if (path === '/' && !metrics.hasSpanish) failures.push('homepage ' + width + 'px: missing #espanol');
        if (path === '/' && width >= 601) {
          const nav = await page.locator('.cpl-static-nav__links').evaluate(n => ({
            client:n.clientWidth,scroll:n.scrollWidth,
            communityVisible:!![...n.querySelectorAll('a')].find(a => a.getAttribute('href')==='/resources/community/index.html' && getComputedStyle(a).display!=='none')
          }));
          if (nav.scroll > nav.client + 1) failures.push('Desktop navigation horizontal clipping at '+width+'px: '+nav.scroll+'/'+nav.client);
          if (width >= 1050 && !nav.communityVisible) failures.push('Community missing from primary desktop navigation at '+width+'px');
          // Explicit navigation priorities must survive markup reordering. This
          // guards against future additions silently hiding important routes.
          const stable = await page.locator('.cpl-static-nav__links').evaluate(n => {
            const links=[...n.querySelectorAll('a')];
            const before=links.map(a=>({href:a.getAttribute('href'),visible:getComputedStyle(a).display!=='none',priority:a.dataset.navPriority,compact:a.dataset.navCompact}));
            [...links].reverse().forEach(a=>n.appendChild(a));
            const after=links.map(a=>getComputedStyle(a).display!=='none');
            links.forEach(a=>n.appendChild(a));
            const primary=before.filter(a=>a.priority==='primary');
            const unexpected=before.filter(a=>!['primary','more'].includes(a.priority));
            const expected=before.every(a=>a.visible === (a.priority==='primary' && !(innerWidth<=1040 && a.compact==='hide')));
            return {same:before.every((a,i)=>a.visible===after[i]),expected,primary:primary.length,unexpected:unexpected.length};
          });
          if (!stable.same || !stable.expected || stable.primary!==5 || stable.unexpected) failures.push('Desktop navigation priority/reorder regression at '+width+'px: '+JSON.stringify(stable));
        }
        if (exceptions.length) failures.push(path + ' ' + width + 'px JS error '+exceptions.join('; ').slice(0,200));
        console.log('CHECK',width,path,'HTTP',response?.status(),'scroll/client',metrics.scroll+'/'+metrics.client,'firstTab',focus);
      }
      if (width === 390) {
        for (const path of ['/', '/resources/therapy/clinical-intern-learning-hub.html', '/resources/clinical-topics/aphasia-communication-access/index.html', skipRoutes.worksheet, skipRoutes.jurisdictions[0], skipRoutes.jurisdictions[1], ...skipRoutes.legacy, ...skipRoutes.additional]) {
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
      // Review-only visual captures of the redesigned production routes. No network or PHI.
      if (width === 390 || width === 1280) {
        const out = 'qa-artifacts/pr43/editorial-tiles';
        fs.mkdirSync(out, {recursive:true});
        await page.goto(base+'/', {waitUntil:'domcontentloaded'});
        await page.locator('#shelves .shelf.expandable-shelf').first().scrollIntoViewIfNeeded();
        await page.screenshot({path:out+'/home-'+width+'.png',animations:'disabled'});
        await page.locator('#parent-patient').evaluate(node => {node.open = true;});
        await page.locator('#parent-patient').evaluate(node => window.scrollTo({top:window.scrollY + node.getBoundingClientRect().top - 74,behavior:'instant'}));
        await page.screenshot({path:out+'/home-expanded-'+width+'.png',animations:'disabled'});
        await page.locator('.cpl-static-nav__more > summary').focus();
        await page.keyboard.press('Enter');
        const menuOpen = await page.locator('.cpl-static-nav__more').evaluate(n => n.open);
        const communityLink = page.locator('.cpl-static-nav__menu a[href="/resources/community/index.html"]');
        const queerLink = page.locator('.cpl-static-nav__menu a[href="/resources/community/online-lgbtq-resources.html"]');
        if (!menuOpen || !await communityLink.isVisible() || !await queerLink.isVisible()) failures.push('More menu missing community routes at '+width+'px');
        await page.evaluate(() => window.scrollTo({top:0,behavior:'instant'}));
        const menuOnscreen = await page.locator('.cpl-static-nav__menu').evaluate(n=>{
          const b=n.getBoundingClientRect();
          return b.top>=0 && b.left>=0 && b.right<=innerWidth+1 && b.bottom<=innerHeight+1;
        });
        if (!menuOnscreen) failures.push('Open More menu cropped outside viewport at '+width+'px');
        if (width===390) {
          const lastShown=await page.locator('.cpl-static-nav__menu a').last().evaluate(a=>{
            const b=a.getBoundingClientRect(),parent=a.closest('.cpl-static-nav__menu').getBoundingClientRect();
            return b.top>=parent.top && b.bottom<=parent.bottom+1 && b.bottom<=innerHeight+1;
          });
          if (!lastShown) failures.push('More menu final destination requires undisclosed scrolling at standard mobile height');
        }
        await page.screenshot({path:out+'/home-more-'+width+'.png',animations:'disabled'});
        await page.keyboard.press('Tab');
        const firstLinkFocused = await page.locator('.cpl-static-nav__menu a').first().evaluate(a=>document.activeElement===a);
        if (!firstLinkFocused) failures.push('More menu keyboard focus did not enter link list at '+width+'px');
        await page.goto(base+'/resources/community/index.html', {waitUntil:'domcontentloaded'});
        await page.locator('.cards .card').first().scrollIntoViewIfNeeded();
        await page.screenshot({path:out+'/community-'+width+'.png',animations:'disabled'});
        await page.goto(base+'/resources/clinical-resource-finder.html', {waitUntil:'domcontentloaded'});
        await page.locator('#lab-q').fill('TAY');
        await page.locator('#lab-results .result-card').first().scrollIntoViewIfNeeded();
        await page.screenshot({path:out+'/finder-tay-'+width+'.png',animations:'disabled'});
      }
      await context.close();
    }
  } finally { await browser.close(); }
  console.log('SUMMARY',checks,'checks', failures.length,'failures');
  failures.forEach(s => console.error('FAIL',s));
  if (failures.length) process.exitCode=1;
})().catch(e=>{console.error(e); process.exitCode=1;});
