'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('resources/clinical-finder-data.js');
const data=JSON.parse(source.replace(/^globalThis\.CPLFinderData\s*=\s*/,'').replace(/;\s*$/,''));
assert.equal(data.resources.length,615,'Original published catalog must remain frozen');
const before=JSON.stringify(data.resources);
const context={CPLFinderData:data};
vm.runInNewContext(read('resources/diagnoses/adult-adhd-collection/finder-overlay.js'),context);
const additions=data.resources.filter(r=>r.url.startsWith('/resources/diagnoses/adult-adhd-collection/'));
assert.equal(additions.length,8,'Exactly eight added ADHD records');
assert.equal(data.resources.length,623,'Supplemental finder dataset must contain 623 records');
assert.equal(JSON.stringify(data.resources.slice(0,615)),before,'Original published records must remain in order and unchanged');
for(const r of additions){
 assert(r.tags.diagnosis.includes('ADHD')&&r.tags.stage.includes('Adult'),'Incorrect ADHD/age facet: '+r.url);
 assert(r.tags.role.length&&r.tags.task.length,'Missing audience/task: '+r.url);
 assert(fs.existsSync(path.join(root,r.url.slice(1))),'Missing indexed file: '+r.url);
}
vm.runInNewContext(read('resources/diagnoses/adult-adhd-collection/finder-overlay.js'),context);
assert.equal(data.resources.length,623,'Overlay must be idempotent');
for(const p of ['resources/clinical-resource-finder.html','resources/diagnoses/index.html']){
 const html=read(p);const base=html.indexOf('/resources/clinical-finder-data.js'),extra=html.indexOf('/resources/diagnoses/adult-adhd-collection/finder-overlay.js');
 assert(base>0&&extra>base,'Overlay must load after catalog in '+p);
}
for(const p of ['resources/diagnoses/adult-adhd.html','resources/diagnoses/adult-adhd-clinical-depth.html','resources/clinical-topics/adult-adhd-task-starts/index.html','resources/diagnoses/diagnosis-hubs.js']){
 assert(read(p).includes('/resources/diagnoses/adult-adhd-collection/index.html'),'Missing inbound collection link '+p);
}
for(const slug of ['index','assessment','psychotherapy','everyday-life','treatment-planning','printable-worksheets','interactive-barrier-map']){
 const html=read('resources/diagnoses/adult-adhd-collection/'+slug+'.html');
 assert(html.includes('<main')&&html.includes('name="viewport"')&&html.includes('</html>'),'HTML scaffold '+slug);
 assert(html.includes('class="skip"'),'Keyboard skip '+slug);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(new Set(ids).size,ids.length,'Unique IDs '+slug);
 for(const m of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(m[1]),'Missing local anchor '+slug+' #'+m[1]);
}
const map=read('resources/diagnoses/adult-adhd-collection/interactive-barrier-map.html');
assert(!/localStorage|sessionStorage|fetch\(|XMLHttpRequest|sendBeacon/.test(map),'Interactive map must not transmit or persist entries');
for(const id of ['target','barrier','context','support','outcome'])assert(map.includes('id="'+id+'"')&&map.includes('id="v-'+id+'"'),'Mapped visual field '+id);
console.log('ADULT_ADHD_COLLECTION_QA_PASS: 8 supplemental index records; original 615 frozen; 7 pages; inbound navigation; no persistent map state');
