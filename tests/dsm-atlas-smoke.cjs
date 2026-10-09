'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const html = fs.readFileSync(path.join(__dirname, '../resources/therapy/dsm-assessment-atlas.html'), 'utf8');
const match = html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(match, 'Inline application script must exist');
const script = match[1];
new vm.Script(script); // Fail on syntax errors before attempting any interactions.

class Element {
  constructor(id) {
    this.id = id;
    this.value = '';
    this.disabled = false;
    this.style = {};
    this.dataset = {};
    this.attrs = {};
    this.innerHTML = '';
    this.textContent = '';
    this.events = {};
    this.classList = { toggle: (_name, flag) => { this.visible = flag; } };
  }
  setAttribute(key, value) { this.attrs[key] = value; }
  addEventListener(name, handler) { this.events[name] = handler; }
}

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(x => x[1]);
const elements = Object.fromEntries(ids.map(id => [id, new Element(id)]));
const tabs = [...html.matchAll(/<button data-panel="([^"]+)"/g)].map(m => {
  const tab = new Element(m[1]);
  tab.dataset.panel = m[1];
  return tab;
});
const panels = ['explore', 'compare', 'intake', 'handoff'].map(id => elements[id]);
const buttons = (id, attr) => [...elements[id].innerHTML.matchAll(new RegExp('data-' + attr + '="([^"]+)"', 'g'))]
  .map(match => { const el = new Element('button'); el.dataset[attr] = match[1]; return el; });
const current = {};
const document = {
  getElementById(id) {
    if (elements[id]) return elements[id];
    // Generated buttons appear when an exercise renders.
    if (Object.values(elements).some(el => el.innerHTML.includes('id="' + id + '"'))) {
      return (elements[id] = new Element(id));
    }
    return null;
  },
  querySelectorAll(selector) {
    if (selector === '.nav button') return tabs;
    if (selector === '.panel') return panels;
    if (selector === '[data-family]') return (current.family = buttons('family-list', 'family'));
    if (selector === '[data-option]') return (current.option = buttons('quiz', 'option'));
    if (selector === '[data-interview]') return (current.interview = buttons('interview', 'interview'));
    return [];
  }
};

vm.runInNewContext(script, { document, navigator: { clipboard: { writeText: async () => {} } } });
const el = id => elements[id];
assert.equal(current.family.length, 11, 'Diagnostic families should render');
assert.equal(current.option.length, 3, 'Quiz answers should render');
assert.equal(current.interview.length, 3, 'Intake options should render');

tabs[2].events.click();
assert.equal(tabs[2].attrs['aria-selected'], 'true', 'Tab switching works');
tabs[0].events.click();
current.family[6].onclick();
assert.match(el('family-detail').innerHTML, /Neurodevelopmental disorders/, 'Family selection works');
el('family-search').value = 'nonexistent';
el('family-search').events.input();
assert.match(el('family-list').innerHTML, /No families match/, 'Search empty state');
el('family-search').value = '';
el('family-search').events.input();
assert.equal(current.family.length, 11, 'Search clear works');

current.option[1].onclick();
assert.match(el('quiz').innerHTML, /Good assessment choice/, 'Quiz feedback');
el('next-quiz').onclick();
assert.match(el('quiz').innerHTML, /Question 2 of 6/, 'Quiz advances');
current.option[1].onclick();
assert.match(el('quiz').innerHTML, /A stronger choice/, 'Incorrect answer feedback');
el('next-quiz').onclick();
for (const correct of [2, 1, 2, 1]) {
  current.option[correct].onclick();
  el('next-quiz').onclick();
}
assert.match(el('quiz').innerHTML, /Question 1 of 6/, 'Quiz restarts');

for (const correct of [0, 1, 0, 2, 1]) {
  current.interview[correct].onclick();
  assert.match(el('interview').innerHTML, /Useful choice/, 'Intake feedback');
  el('advance-interview').onclick();
}
assert.match(el('interview').innerHTML, /Intake complete/, 'Intake reaches summary');
el('restart-intake').onclick();
assert.match(el('interview').innerHTML, /Interview decision 1 of 5/, 'Intake restarts');

el('observation').value = 'Client reports worry';
el('timeline').value = 'Two months';
el('differential').value = 'Consider other explanations';
el('followup').value = 'Clinical review pending';
el('generate-handoff').onclick();
assert.match(el('handoff-preview').textContent, /Client reports worry/, 'Handoff generated');
assert.equal(el('copy-handoff').disabled, false, 'Copy enabled after generation');

console.log('PASS: DSM assessment atlas parses and its core interactions run.');
