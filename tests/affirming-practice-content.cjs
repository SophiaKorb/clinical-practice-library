'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const hub=read('resources/community/online-lgbtq-resources.html');
assert(hub.includes('@page{size:letter;margin:0.65in 0.70in}'),'Online resource hub must retain printable Letter margins');
const data=JSON.parse(read('resources/clinical-finder-data.js').replace(/^globalThis\.CPLFinderData\s*=\s*/,'').replace(/;\s*$/,''));
const slugs=['affirming-clinical-conversation','caregiver-support-lgbtq-youth','youth-school-community-access'];
assert.equal(new Set(data.resources.map(r=>r.url)).size,data.resources.length,'No finder URL collisions');
for(const slug of slugs){
 const p='resources/community/'+slug+'.html';
 const s=read(p),r=data.resources.find(r=>r.url==='/'+p);
 assert(r,'Missing finder record: '+p);
 assert(hub.includes('href="/'+p+'"'),'Missing link from online hub: '+p);
 assert(s.includes('class="sources"'),'Sources section missing: '+p);
 assert((s.match(/<section class="panel"/g)||[]).length>=4,'Practical sections missing: '+p);
 assert((s.match(/<a href=/g)||[]).length>=4,'Need sources and navigation: '+p);
 assert(!s.includes('class="other"'),'No repeated generic bottom disclaimer: '+p);
 assert(s.includes('@page{size:letter;margin:0.65in 0.70in}'),'Letter print safe margins missing: '+p);
 assert.deepEqual(r.tags.diagnosis,[],'LGBTQ identity must not be a diagnosis');
 for(const [k,vs] of Object.entries(r.tags))for(const v of vs)assert(data.facets[k]?.includes(v),'Bad '+k+' '+v);
 assert(r.tags.role.length>0&&r.tags.stage.length>0&&r.tags.task.length>0,'Incomplete multiple indexing');
}
assert(data.resources.length>=532,'Content expansion must be additive');
console.log('PASS three content guides, primary-source references, interlinking and complete finder indexing');
