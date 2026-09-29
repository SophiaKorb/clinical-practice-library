const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const {execFileSync} = require('node:child_process');
const {chromium} = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES, 'playwright') : 'playwright');
const root = path.resolve(__dirname, '..');
const slugs = ['sensory-overload-and-recovery-plan', 'my-lower-risk-plan',
  'uncertainty-practice-plan-and-my-erp-practice'];
(async () => {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'cpl-print-'));
  const browser = await chromium.launch({
    ...(process.env.CPL_BROWSER_EXECUTABLE ? {executablePath:process.env.CPL_BROWSER_EXECUTABLE} : {}),
    headless:true, args:['--no-sandbox']
  });
  try {
    const page = await browser.newPage({viewport:{width:724,height:1000}});
    await page.emulateMedia({media:'print',colorScheme:'light'});
    for (const slug of slugs) {
      await page.goto((process.env.CPL_PREVIEW_ORIGIN || 'http://127.0.0.1:8765') +
        '/resources/handouts/' + slug + '.html', {waitUntil:'networkidle'});
      // US Letter at 96 CSS px/in, with the same .48-inch CSS print margins.
      await page.addStyleTag({content:'html,body{width:723.84px!important} input[type="checkbox"],input[type="radio"]{visibility:hidden}'});
      const flat = path.join(work, slug + '.pdf');
      await page.pdf({path:flat,printBackground:true,preferCSSPageSize:true});
      const layout = await page.evaluate(() => {
        const companion = document.querySelector('.companion-page').getBoundingClientRect().top;
        return [...document.querySelectorAll('form input,form textarea')].map(el => {
          const r = el.getBoundingClientRect();
          const second = Boolean(el.closest('.companion-page'));
          return {name:el.name || el.id,type:el.tagName === 'TEXTAREA' ? 'textarea' : el.type,
            value:el.type === 'radio' ? el.value : '',
            label:el.labels?.[0]?.innerText.trim() || el.name,
            page:second ? 1 : 0,x:r.left,y:r.top-(second ? companion : 0),width:r.width,height:r.height};
        });
      });
      const metadata = path.join(work, slug + '.json');
      fs.writeFileSync(metadata, JSON.stringify(layout));
      const target = path.join(root, 'resources/downloads', slug + '.pdf');
      execFileSync(process.env.CODEX_PRIMARY_RUNTIME_PYTHON || 'python3',
        [path.join(__dirname,'add-worksheet-fields.py'),flat,metadata,target],{stdio:'inherit'});
    }
  } finally {
    await browser.close();
    fs.rmSync(work,{recursive:true,force:true});
  }
})().catch(error => {console.error(error);process.exit(1)});
