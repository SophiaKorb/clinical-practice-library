'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const page = p => fs.readFileSync(path.join(root, p), 'utf8');
const paths = [
  'resources/trauma/start-here-families-children-trauma.html',
  'resources/therapy/start-here-therapy-resource-shelves.html',
  'resources/assessment/assessment-start-here.html',
  'resources/school/homeschool/start-here.html',
  'resources/es/school/homeschool/start-here.html'
];
const slugs = [
  'cbt-behavioral-activation','anxiety-exposure-ocd','act-psychological-flexibility',
  'dbt-informed-emotion-regulation','trauma-ptsd','child-adolescent-parenting-family',
  'motivational-interviewing-substance-use','psychosis-smi-rehabilitation',
  'sleep-pain-health-psychology','personality-complex-presentations',
  'relational-supportive-psychodynamic','neurodevelopmental-executive-function'
];
for (const slug of slugs) paths.push('resources/therapy/'+slug+'-start-here.html');
function links(html) { return [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(x => x[1]); }
function targetExists(href) {
  if (!href.startsWith('/')) return true;
  let pathname = href.split(/[?#]/)[0];
  if (pathname === '/') pathname = '/index.html';
  const local = path.join(root, pathname.replace(/^\/+/, ''));
  return fs.existsSync(local) || fs.existsSync(local+'.html') || fs.existsSync(path.join(local, 'index.html'));
}
let checked = 0;
for (const p of paths) {
  const html = page(p);
  const local = links(html).filter(x => x.startsWith('/') && !x.startsWith('//'));
  for (const href of local) { assert(targetExists(href), p + ' has broken destination: ' + href); ++checked; }
}
const trauma = page(paths[0]);
for (const destination of [
  '/resources/trauma/children-families-trauma-curated-clinical-guide.html',
  '/resources/trauma/caregiver-family-youth-trauma-resources.html',
  '/resources/trauma/foster-kinship-adoption-child-welfare.html',
  '/resources/trauma/trauma-school-neurodevelopment-crosswalk.html'
]) assert(links(trauma).includes(destination), 'Unlinked trauma destination: '+destination);
assert.equal((trauma.match(/class="trauma-destination"/g)||[]).length, 4);
assert(!/conjoint work/i.test(trauma), 'Index should use plain-language joint-session terminology');
const therapy = page(paths[1]);
assert.equal((therapy.match(/<a class="shelf" href=/g)||[]).length, 12, 'All therapy shelves must navigate');
assert(!therapy.includes('href="/resources/therapy/treatment-plan-menu.html"'), 'Unreviewed menu should not be promoted');
for (const slug of slugs) {
  const p = 'resources/therapy/'+slug+'-start-here.html';
  assert(links(therapy).includes('/'+p), 'Missing therapy shelf: '+slug);
  assert(links(page(p)).includes('/resources/therapy/'+slug+'-practical-toolkit.html'), 'Missing toolkit navigation: '+p);
}
const assessment = page('resources/assessment/assessment-start-here.html');
for (const name of ['broad-intake-depression-anxiety-outcomes','pediatric-developmental-neurodevelopmental','trauma-ptsd-dissociation-safety','ocd-bipolar-psychosis-substance-use','functioning-disability-formal-testing','free-official-measure-source-guide','spanish-assessment-forms']) {
 assert(links(assessment).includes('/resources/assessment/'+name+'.html'), 'Assessment destination missing: '+name);
}
const english = page('resources/school/homeschool/start-here.html');
const spanish = page('resources/es/school/homeschool/start-here.html');
for (const topic of ['adhd','autism','anxiety','depression','dyslexia','dyscalculia','dysgraphia','persistent-conflict-odd']) {
 assert(links(english).includes('/resources/school/homeschool/'+topic+'.html'), 'English homeschool link missing: '+topic);
}
for (const topic of ['tdah','autismo','ansiedad','depresion','dislexia','discalculia','disgrafia','conflicto-persistente-tnd','derivacion']) {
 assert(links(spanish).includes('/resources/es/school/homeschool/'+topic+'.html'), 'Spanish homeschool link missing: '+topic);
}
console.log('Navigation destination QA passed: '+paths.length+' entry pages, '+checked+' internal links, 4 trauma collections, 12 therapy shelves, 7 assessment routes, English/Spanish homeschool guides.');
