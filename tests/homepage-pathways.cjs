/* Regression guard for preserved diagnosis guides and the clinical intern hub. */
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const homepage = read('index.html');
const intern = read('resources/therapy/clinical-intern-learning-hub.html');
const style = read('preview/cpl2.css');
const basename = [
 ['adhd','adhd','adhd'],
 ['autism','autism','autism'],
 ['anxiety','anxiety','anxiety'],
 ['depression','depression','depression'],
 ['dyslexia','dyslexia','dyslexia'],
 ['dyscalculia','dyscalculia','dyscalculia'],
 ['dysgraphia','dysgraphia','dysgraphia'],
 ['persistent-conflict-odd','odd-persistent-conflict-behavior','persistent-conflict-odd']
];
assert.match(homepage, /id="diagnosis-guides"/);
assert.match(homepage, /id="intern-resources"/);
assert.match(homepage, /href="\/#diagnosis-guides"/);
assert.match(homepage, /href="\/resources\/therapy\/clinical-intern-learning-hub.html"/);
assert.equal((homepage.match(/class="diagnosis-card"/g)||[]).length, 8);
assert.equal((homepage.match(/class="diagnosis-links"/g)||[]).length, 8);
let count=0;
for (const [clinical,family,home] of basename) {
 for (const p of [
  'resources/school/clinical/'+clinical+'.html',
  'guides/'+family+'.html',
  'resources/school/homeschool/'+home+'.html'
 ]) {
  assert.ok(fs.existsSync(path.join(root,p)), 'missing original guide: '+p);
  assert.ok(homepage.includes('href="/'+p+'"'), 'missing homepage link: '+p);
  count++;
 }
}
assert.equal(count,24);
assert.match(intern,/id="pathway"/);
assert.match(intern,/id="formulation"/);
assert.match(intern,/id="sources"/);
assert.match(intern,/id="supervision"/);
assert.equal((intern.match(/class="source"/g)||[]).length,10);
assert.match(intern,/more than one|multiple explanations|competing explanations|several plausible explanations/i);
assert.match(intern,/scope|supervision|independently/i);
assert.match(style,/\.diagnosis-grid/);
assert.match(style,/@media\(max-width:700px\)/);
console.log('Homepage pathways: 8 diagnoses, 24 original guide links, 10 intern resources, supervision & responsive styles verified.');
