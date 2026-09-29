const fs = require('node:fs');
const assert = require('node:assert/strict');
const pairs = {
  adhd: ['adhd', 47], autism: ['autism', 40], anxiety: ['anxiety', 35],
  depression: ['depression', 35], dyslexia: ['dyslexia', 35],
  dyscalculia: ['dyscalculia', 40], dysgraphia: ['dysgraphia', 30],
  'odd-persistent-conflict-behavior': ['persistent-conflict-odd', 30]
};
function words(value) {
  return value.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&')
    .replace(/&#(?:0*39|x27);|&apos;/gi, "'").replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}
function audit(plain, clinical, expected) {
  const errors = [];
  const familyRows = [...plain.matchAll(/<tr\b[^>]*data-support-code="([^"]+)"[^>]*>(.*?)<\/tr>/gs)].map(m => {
    const cells = [...m[2].matchAll(/<td\b[^>]*>(.*?)<\/td>/gs)];
    const inputId = m[2].match(/<input\b[^>]*id="([^"]+)"/);
    const labelId = cells[2]?.[1].match(/<label\b[^>]*for="([^"]+)"/);
    if (!inputId || !labelId || inputId[1] !== labelId[1]) errors.push('Unlabeled checkbox: ' + m[1]);
    return [m[1], words(cells[2]?.[1] || '')];
  });
  const clinicalRows = [...clinical.matchAll(/<span class="support-code">([^<]+)<\/span><span>(.*?)<\/span>/gs)]
    .map(m => [m[1], words(m[2])]);
  if (familyRows.length !== expected || clinicalRows.length !== expected) {
    errors.push('Expected ' + expected + ' supports; family=' + familyRows.length + ', clinical=' + clinicalRows.length);
  }
  const familyMap = new Map(familyRows), clinicalMap = new Map(clinicalRows);
  if (familyMap.size !== familyRows.length) errors.push('Duplicate family support identifier');
  if (clinicalMap.size !== clinicalRows.length) errors.push('Duplicate clinical support identifier');
  for (const [code, text] of clinicalMap) {
    if (!familyMap.has(code)) errors.push('Missing family support: ' + code);
    else if (familyMap.get(code) === text) errors.push('Family text repeats clinical text: ' + code);
  }
  for (const [code, text] of familyMap) {
    if (!clinicalMap.has(code)) errors.push('Extra family support: ' + code);
    if (!text) errors.push('Empty family support: ' + code);
    if (/^(?:Make copying|Make simultaneous load|Make visual crowding|Let the student processing time|Make the barrier, not)\b/i.test(text)) errors.push('Broken generated phrase: ' + code);
    if (/\b(?:phonemes?|graphemes?|morphology|construct|fade (?:prompts? )?by data|trial data)\b/i.test(text)) errors.push('Unexplained clinical wording in family support: ' + code);
  }
  if (!/<body\b[^>]*data-family="true"/.test(plain)) errors.push('Missing family-guide marker');
  if (/<h2[^>]*>\s*Barrier \d+:/.test(plain)) errors.push('Clinical barrier numbering in family heading');
  if (/<th[^>]*>\s*Code\s*<\/th>/.test(plain)) errors.push('Visible support-code heading');
  if (/bring the short codes|Circle a few support codes|support codes or plan items|Barrier and support code/i.test(plain)) errors.push('Instructions require hidden support codes');
  if ((plain.match(/Sophia Cohon, PhD/g) || []).length !== 1) errors.push('Author byline should appear once');
  const ids = [...plain.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  if (new Set(ids).size !== ids.length) errors.push('Duplicate HTML id');
  for (const m of plain.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.includes(m[1])) errors.push('Broken section link: ' + m[1]);
  }
  return errors;
}
function selfTest() {
  const plain = fs.readFileSync('guides/dysgraphia.html', 'utf8');
  const clinical = fs.readFileSync('resources/school/clinical/dysgraphia.html', 'utf8');
  assert.deepEqual(audit(plain, clinical, 30), []);
  const row = plain.match(/<tr\b[^>]*data-support-code="1-A"[^>]*>.*?<\/tr>/s)[0];
  const mutations = {
    'empty guides': ['', ''],
    'missing support': [plain.replace(row, ''), clinical],
    'duplicate support': [plain.replace(row, row + row), clinical],
    'wrong support id': [plain.replace('data-support-code="1-A"', 'data-support-code="99-Z"'), clinical],
    'clinical copy': [plain.replace(/(<label for="dysgraphia-t3-r0">).*?(<\/label>)/s,
      '$1Reduce copying. Provide notes, printed directions, or digital text.$2'), clinical],
    'broken phrase': [plain.replace('Reduce copying. Give', 'Make copying. Give'), clinical],
    'numbered heading': [plain.replace('When handwriting is slow, exhausting, or painful</h2>', 'Barrier 1: Handwriting</h2>'), clinical],
    'missing checkbox label': [plain.replace('for="dysgraphia-t3-r0"', 'for="missing-input"'), clinical],
    'broken navigation': [plain.replace('href="#barrier-1-handwriting-is-slow-effortful-or-painful"', 'href="#missing-section"'), clinical]
  };
  for (const [name, [p, c]] of Object.entries(mutations)) assert.ok(audit(p, c, 30).length, name);
  console.log('PASS regression checks: ' + Object.keys(mutations).length + ' invalid cases rejected');
}
let failed = false;
for (const [name, [clinicalName, expected]] of Object.entries(pairs)) {
  const errors = audit(fs.readFileSync('guides/' + name + '.html', 'utf8'),
    fs.readFileSync('resources/school/clinical/' + clinicalName + '.html', 'utf8'), expected);
  if (errors.length) { failed = true; console.error('FAIL', name, errors); }
  else console.log('PASS', name, expected + ' paired supports with distinct, labeled family text');
}
if (failed) process.exit(1);
if (process.argv.includes('--self-test')) selfTest();
