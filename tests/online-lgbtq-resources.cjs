'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const html = fs.readFileSync(path.join(root,'resources/community/online-lgbtq-resources.html'),'utf8');
const community = fs.readFileSync(path.join(root,'resources/community/index.html'),'utf8');
const home = fs.readFileSync(path.join(root,'index.html'),'utf8');
const dataText = fs.readFileSync(path.join(root,'resources/clinical-finder-data.js'),'utf8');
const data = JSON.parse(dataText.replace(/^globalThis\.CPLFinderData\s*=\s*/,'').replace(/;\s*$/,''));
const base = '/resources/community/online-lgbtq-resources.html#';
const records = data.resources.filter(r=>r.url.startsWith(base));
assert.equal(records.length,17,'All 17 online resource entries must be indexed');
assert.match(community,/href="\/resources\/community\/online-lgbtq-resources\.html"/);
assert.match(home,/href="\/resources\/community\/online-lgbtq-resources\.html"/);
const urls = data.resources.map(r=>r.url);
assert.equal(new Set(urls).size,urls.length,'Finder resource URLs must be unique');
for(const r of records){
 const id = r.url.slice(base.length);
 assert(html.includes('id="'+id+'"'),'Missing anchor '+id);
 assert((r.searchTerms||[]).some(t=>/LGBTQ|queer|transgender/i.test(t)),'Missing LGBTQ search alias: '+id);
 assert.equal(r.tags.diagnosis.length,0,'Identity is not a diagnosis: '+id);
 for (const [facet,values] of Object.entries(r.tags)){
  const allowed = data.facets[facet];
  assert(allowed,'Unknown facet '+facet);
  for(const v of values) assert(allowed.includes(v),'Unrecognized '+facet+' '+v);
 }
 assert(r.tags.stage.length&&r.tags.role.length&&r.tags.task.length,'Missing age/role/task indexing: '+id);
}
const byId=id=>records.find(r=>r.url===base+id);
for(const id of ['trevor-space','trevor-coming-out','trevor-safety','scarleteen'])assert(byId(id).tags.stage.includes('School age / adolescence'),'Teens should find '+id);
for(const id of ['fap-booklet','pflag-resources','hrc-family'])assert(byId(id).tags.role.includes('Client / caregiver'),'Family filter should find '+id);
for(const id of ['cdc-support','cdc-gsa'])assert(byId(id).tags.role.includes('School team'),'Schools should find '+id);
for(const id of ['a4te-id','trans-lifeline'])assert(byId(id).tags.stage.includes('Adult'),'Adult filter should find '+id);
for(const id of ['fap-program','cdc-support'])assert(byId(id).tags.role.includes('Clinician'),'Clinicians should find '+id);
const countLgbt=data.resources.filter(r=>[r.title,r.url,...(r.searchTerms||[])].join(' ').toLowerCase().includes('lgbt')).length;
assert(countLgbt>=27,'Broad LGBTQ finder search should surface at least 27 entries, found '+countLgbt);
console.log('Online LGBTQ index QA PASS: '+records.length+' new resources, >=27 LGBTQ matches, multi-facet tags, navigation and anchors.');
