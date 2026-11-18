'use strict';
/* Consumer editorial boundary QA: keep source/merge/approval notes in docs/qa, not reader copy.
   This test is deliberately distinct from clinical judgment or rights review.
 */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
 const p=path.join(dir,e.name);
 if(e.isDirectory())return walk(p);
 return e.isFile()&&p.endsWith('.html')?[p]:[];
});}
const files=[path.join(root,'index.html'),path.join(root,'library.html'),...walk(path.join(root,'resources')),...walk(path.join(root,'guides')),...walk(path.join(root,'legacy'))];
const strip=s=>s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
 .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
 .replace(/<!--[^]*?-->/g,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
const redFlags=[
 /all resources explicitly indexed to this topic/i,
 /every entry assigned this diagnostic tag/i,
 /source age and audience tags/i,
 /(?:CPL )?source catalog/i,
 /\bdirectly tagged resources\b/i,
 /current candidate is for review only/i,
 /\b(?:no merge|no deployment|publication authorization|release gates? remain open)\b/i,
 /\b(?:review[- ]only resource|review[- ]only draft|educational review candidate)\b/i,
 /\b(?:clinical\s*\/\s*rights\s*\/\s*accessibility (?:gates open|approval pending))\b/i,
 /\bdraft PR #\d+\b/i,
 /\bDraft for qualified clinical review\b/i
];
const audit=[];
for(const file of files){
 const rel=path.relative(root,file).replace(/\\/g,'/');
 if(rel==='resources/qa-status.html')continue; // legacy internal QA record: delisted + noindex, but still direct-path accessible
 const text=strip(fs.readFileSync(file,'utf8'));
 for(const term of redFlags) if(term.test(text))audit.push({file:rel,pattern:String(term),excerpt:text.match(term)?.[0]});
}
const inspected=audit.filter(x=>x.file.startsWith('resources/diagnoses/')||x.file==='resources/clinical-topics/index.html');
assert.deepEqual(inspected,[], 'Internal source/release jargon remains on reviewed public diagnosis surfaces: '+JSON.stringify(inspected));
const diagnosisIndex=fs.readFileSync(path.join(root,'resources/diagnoses/index.html'),'utf8');
const compIndex=fs.readFileSync(path.join(root,'resources/diagnoses/comprehensive/index.html'),'utf8');
const hubJS=fs.readFileSync(path.join(root,'resources/diagnoses/diagnosis-hubs.js'),'utf8');
const qaPage=fs.readFileSync(path.join(root,'resources/qa-status.html'),'utf8');
const adhdGuide=fs.readFileSync(path.join(root,'resources/diagnoses/adult-adhd.html'),'utf8');
const topicIndex=fs.readFileSync(path.join(root,'resources/clinical-topics/index.html'),'utf8');
assert(diagnosisIndex.includes('<h2 id="direct-head">Resources for this topic</h2>'));
assert(diagnosisIndex.includes('Being listed does not mean a resource is clinically suitable for everyone'));
assert(compIndex.includes('not validated diagnostic instruments or stand-alone treatment protocols'));
assert(hubJS.includes("data.resources.filter(")&&hubJS.includes("r.tags&&r.tags.diagnosis"),'Preserve fully sourced dynamic topic filter');
assert(hubJS.includes("direct.length+' resources for this topic'"),'Dynamic counter still exposes catalog metadata');
assert.equal((hubJS.match(/More topic resources/g)||[]).length,2,'Rendered resource group label must match its grouping-order key');
assert(adhdGuide.includes('Choose resources according to the person\'s goals, age, and circumstances')&&!adhdGuide.includes('live finder and dynamic ADHD index'), 'ADHD overview must speak to the reader, not explain catalog history');
assert(qaPage.includes('name="robots" content="noindex,nofollow"'));
assert(!topicIndex.includes('href="/resources/qa-status.html"'),'Internal QA link in reader-facing topic footer');
const firstSiteFlags=audit.filter(x=>!x.file.startsWith('resources/diagnoses/')&&x.file!=='resources/clinical-topics/index.html');
console.log('CONSUMER_EDITORIAL_QA_PASS '+JSON.stringify({
 publicHtmlScanned:files.length,diagnosisPagesChecked:files.filter(x=>x.includes('/resources/diagnoses/')).length,
 reviewedInternalCopyFindings:0,sitewideFollowupCount:firstSiteFlags.length,
 sitewideFollowupSample:firstSiteFlags.slice(0,18)
}));
