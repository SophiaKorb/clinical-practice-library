const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function harness({throwPrint = false} = {}) {
  const listeners = {};
  const classStore = new Set();
  const body = {classList:{
    add: value => classStore.add(value),
    remove: value => classStore.delete(value),
    contains: value => classStore.has(value)
  }};
  const tools = [0,1].map(i => {
    const css = new Set();
    const tool = {
      classList: {
        add: value => css.add(value),
        remove: value => css.delete(value),
        contains: value => css.has(value)
      },
      querySelector: selector => selector === 'h3' ? {textContent:'Practice visual '+i} : null
    };
    const example = {
      open: i === 0,
      appended: [],
      closest: selector => selector === '.tool' ? tool : null,
      appendChild: child => example.appended.push(child)
    };
    return {tool, example};
  });
  const controls = Object.fromEntries(['[data-expand-tools]','[data-collapse-tools]','[data-print-tools]'].map(s=>[s,{addEventListener:(type,handler)=>{listeners[s+':'+type]=handler;}}]));
  const snap = [];
  const document = {
    body,
    querySelectorAll(selector) {
      if(selector === 'details.example')return tools.map(t=>t.example);
      if(selector === '.print-selected')return tools.filter(t=>t.tool.classList.contains('print-selected')).map(t=>t.tool);
      return [];
    },
    querySelector: selector => controls[selector],
    createElement(tag) {
      assert.equal(tag,'button');
      return {setAttribute(){},addEventListener(type,handler){this.click = handler;},textContent:'',type:'',className:''};
    }
  };
  const window = {
    addEventListener: (name,handler) => {listeners['window:'+name]=handler;},
    print() {
      snap.push({open:tools.map(t=>t.example.open),single:classStore.has('print-single'),selected:tools.map(t=>t.tool.classList.contains('print-selected'))});
      if(throwPrint)throw Error('print blocked');
    }
  };
  vm.runInNewContext(fs.readFileSync('resources/therapy/communication-toolkit.js','utf8'),{document,window});
  return {tools,body,listeners,snap};
}

const full=harness();
full.listeners['[data-print-tools]:click']();
assert.equal(full.snap.length,1);
assert.deepEqual(full.snap[0],{open:[true,true],single:false,selected:[false,false]});
assert.deepEqual(full.tools.map(t=>t.example.open),[true,true],'do not restore before the print dialog has captured the view');
full.listeners['window:afterprint']();
assert.deepEqual(full.tools.map(t=>t.example.open),[true,false],'afterprint restores original details state');
const single=harness();
single.tools[1].example.appended[0].click();
assert.equal(single.snap[0].single,true);
assert.deepEqual(single.snap[0].selected,[false,true]);
assert.ok(single.body.classList.contains('print-single'),'single-print selection persists until afterprint');
single.listeners['window:beforeprint']();
assert.deepEqual(single.tools.map(t=>t.example.open),[true,true]);
single.listeners['window:afterprint']();
assert.ok(!single.body.classList.contains('print-single'));
assert.deepEqual(single.tools.map(t=>t.tool.classList.contains('print-selected')),[false,false]);
assert.deepEqual(single.tools.map(t=>t.example.open),[true,false]);
const blocked=harness({throwPrint:true});
assert.throws(()=>blocked.listeners['[data-print-tools]:click'](),/print blocked/);
assert.deepEqual(blocked.tools.map(t=>t.example.open),[true,false]);
const source=fs.readFileSync('resources/therapy/communication-toolkit.js','utf8');
assert.ok(!source.includes('localStorage')&&!source.includes('sessionStorage'));
console.log('PASS communication visuals: full and single print keep layout through print preview; afterprint/caught error restore state. This is a source-level behavioral test, not a real print-dialog test.');
