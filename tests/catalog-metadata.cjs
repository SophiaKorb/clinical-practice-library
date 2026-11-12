// Catalog and documentation invariants; not a clinical approval test.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const catalog = JSON.parse(fs.readFileSync('data/library.json', 'utf8'));
assert.ok(Array.isArray(catalog.resources), 'resources must be an array');
const records = catalog.resources;
assert.equal(catalog.meta.records, records.length, 'meta.records must match actual records');
const ids = new Set(), counts = new Map();
for (const [i, r] of records.entries()) {
  assert.ok(typeof r.id === 'string' && r.id.trim(), 'Missing id at '+i);
  assert.ok(!ids.has(r.id), 'Duplicate id '+r.id);
  ids.add(r.id);
  assert.ok(typeof r.collection === 'string' && r.collection, 'Missing collection '+r.id);
  assert.equal(r.publicMetadataOnly, true, 'Missing publicMetadataOnly flag '+r.id);
  counts.set(r.collection, (counts.get(r.collection)||0)+1);
}
for (const [name, n, meta] of [
  ['Clinical Research Core',95,'researchCoreRecords'],
  ['Clinical Assessment Decision-Support Library',31,'assessmentRecords'],
  ['Barrier Support School Access Toolkit',8,'schoolSupportRecords'],
  ['Clinical Handout Library',21,'therapyHandoutCollections'],
  ['Treatment Planning Tools',1,null],
]) {
  assert.equal(counts.get(name),n,'Incorrect group count for '+name);
  if (meta) assert.equal(catalog.meta[meta],n,'Stale meta field '+meta);
}
assert.equal([...counts.values()].reduce((a,b)=>a+b,0),records.length);
for (const path of ['README.md','STATUS.md']) {
  assert.ok(fs.readFileSync(path,'utf8').includes(records.length+' indexed catalog records total'),path+' catalog total is stale');
}
console.log('PASS: '+records.length+' unique metadata records, group totals and README/STATUS counts');
