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
 /\bDraft for qualified clinical review\b/i,
 /\bthis review branch\b/i,
 /\bqualified (?:clinical )?review pending\b/i,
 /\baccessibility review pending\b/i,
 /\btool validation and qualified clinical approval remain pending\b/i,
 /\bqualified (?:specialty|assessment) clinical review pending\b/i,
 /\breview candidate only\b/i,
 /\bno production navigation altered\b/i,
 /\b(?:clinical, privacy, accessibility, publication and rights gates remain open|publication approvals remain open|professional educational, clinical, rights, and accessibility review pending)\b/i,
 /\b(?:remain subject to clinical, rights, accessibility and publication review|publication and rights gates remain open)\b/i,
 /\bBrowser PDF output has not been tagged for PDF\/UA\b/i,
 /\bDynamic ADHD-tagged index\b/i,
 /\bIndexing supports discovery\b/i,
 /\bresults use the current CPL catalog\b/i,
 /\bpopulation tags indicate possible relevance\b/i,
 /\bevery explicitly tagged CPL item\b/i
];
const audit=[];
for(const file of files){
 const rel=path.relative(root,file).replace(/\\/g,'/');
 const text=strip(fs.readFileSync(file,'utf8'));
 for(const term of redFlags) if(term.test(text))audit.push({file:rel,pattern:String(term),excerpt:text.match(term)?.[0]});
}
const priorityPages=['index.html','resources/clinical-resource-finder.html','resources/qa-status.html','resources/diagnoses/adult-adhd-collection/index.html'];
const inspected=audit.filter(x=>x.file.startsWith('resources/diagnoses/')||x.file==='resources/clinical-topics/index.html'||priorityPages.includes(x.file));
assert.deepEqual(inspected,[], 'Internal source/release jargon remains on reviewed public diagnosis surfaces: '+JSON.stringify(inspected));
const diagnosisIndex=fs.readFileSync(path.join(root,'resources/diagnoses/index.html'),'utf8');
const compIndex=fs.readFileSync(path.join(root,'resources/diagnoses/comprehensive/index.html'),'utf8');
const hubJS=fs.readFileSync(path.join(root,'resources/diagnoses/diagnosis-hubs.js'),'utf8');
const qaPage=fs.readFileSync(path.join(root,'resources/qa-status.html'),'utf8');
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
const finder=fs.readFileSync(path.join(root,'resources/clinical-resource-finder.html'),'utf8');
const adhdCollection=fs.readFileSync(path.join(root,'resources/diagnoses/adult-adhd-collection/index.html'),'utf8');
const adhdGuide=fs.readFileSync(path.join(root,'resources/diagnoses/adult-adhd.html'),'utf8');
const topicIndex=fs.readFileSync(path.join(root,'resources/clinical-topics/index.html'),'utf8');
assert(diagnosisIndex.includes('<h2 id="direct-head">Resources for this topic</h2>'));
assert(diagnosisIndex.includes('Being listed does not mean a resource is clinically suitable for everyone'));
assert(compIndex.includes('not validated diagnostic instruments or stand-alone treatment protocols'));
assert(!compIndex.includes('All indexed diagnoses')&&!compIndex.includes('existing indexed resources'),'Comprehensive guide must not explain catalog internals in reader navigation');
assert(hubJS.includes("data.resources.filter(")&&hubJS.includes("r.tags&&r.tags.diagnosis"),'Preserve fully sourced dynamic topic filter');
assert(hubJS.includes("direct.length+' resources for this topic'"),'Dynamic counter still exposes catalog metadata');
assert.equal((hubJS.match(/More topic resources/g)||[]).length,2,'Rendered resource group label must match its grouping-order key');
assert(adhdGuide.includes('Choose resources according to the person\'s goals, age, and circumstances')&&!adhdGuide.includes('live finder and dynamic ADHD index'), 'ADHD overview must speak to the reader, not explain catalog history');
assert(home.includes('Choose a topic to explore guides, worksheets, and related supports')&&!home.includes('every explicitly tagged CPL item'),'Homepage must explain diagnosis browsing, not internal tags');
assert(home.includes('Browse and search all resources'),'Full inventory navigation must use an accurate label');
assert(finder.includes('Search results are suggestions, not clinical endorsements')&&!finder.includes('Results use the current CPL catalog'),'Finder explanation must address reader choices');
assert(finder.includes('No helpful matches found'),'Empty result heading must be understandable');
assert(adhdCollection.includes('All ADHD topic resources')&&!adhdCollection.includes('This review branch'),'Adult ADHD collection cannot describe draft mechanics');
assert(qaPage.includes('<h1>About these resources</h1>')&&!qaPage.includes('October 2026 checkpoint'),'Old public QA route must show safe reader-facing information');
const guideNames=['anxiety-ocd','autism','depression','dyscalculia','dysgraphia','dyslexia','eating-disorders','grief-bereavement','intellectual-disability','learning-disorders','persistent-conflict','psychosis-bipolar','sleep-conditions','substance-use','tic-repetitive-behavior','trauma-dissociation'];
for(const slug of guideNames){
 const guide=fs.readFileSync(path.join(root,'resources/diagnoses/comprehensive',slug+'.html'),'utf8');
 assert(!/gates remain open|publication approvals remain open|publication review|review pending|qualified (?:clinical )?review|PDF\/UA/i.test(strip(guide)),'Internal approval or PDF/UA jargon in public guide '+slug);
 assert(/2026/.test(guide),'Source review date lost in '+slug);
}
for(const slug of ['learning-disorders','persistent-conflict','psychosis-bipolar','substance-use']){
 const guide=fs.readFileSync(path.join(root,'resources/diagnoses/comprehensive',slug+'.html'),'utf8');
 assert(guide.includes('Check accessibility before sharing a copy.'),'Screen-reader print caution missing '+slug);
}
assert(qaPage.includes('name="robots" content="noindex,nofollow"'));
assert(!topicIndex.includes('href="/resources/qa-status.html"'),'Internal QA link in reader-facing topic footer');
const topicFamilies=['aphasia-communication-access','child-aggression-caregiver-coaching','child-grief-continuing-bonds','health-anxiety-medical-plan'];
const topicFormats=['index','care-partner','case','client-workbook','formulation','progress-review','support-map'];
for(const family of topicFamilies)for(const format of topicFormats){
 const src=fs.readFileSync(path.join(root,'resources/clinical-topics',family,format+'.html'),'utf8');
 assert(src.includes('These original teaching aids have not been independently validated as assessment or treatment protocols.'),'Collection evidence caution missing '+family+'/'+format);
 assert(src.includes('Evidence and appropriate use')&&src.includes('About using these resources'),'Reader-friendly collection navigation missing '+family+'/'+format);
}
for(const file of ['complex-dissociation-functional-care','neuropsych-evaluation-access-validity']){
 const src=fs.readFileSync(path.join(root,'resources/clinical-depth',file+'.html'),'utf8');
 assert(!/Phase 8B|Review gate:|accessibility review pending|clinical review pending/i.test(strip(src)),'Clinical-depth reviewer instructions remain public '+file);
}
const alternate=fs.readFileSync(path.join(root,'resources/finder-lab.html'),'utf8');
assert(alternate.includes('Alternate search layout')&&!alternate.includes('Review candidate only'),'Alternate finder exposes developer release notes');
const firstSiteFlags=audit.filter(x=>!x.file.startsWith('resources/diagnoses/')&&x.file!=='resources/clinical-topics/index.html'&&!priorityPages.includes(x.file));
assert.equal(firstSiteFlags.length,0,'Unresolved internal editorial terms on other public pages: '+JSON.stringify(firstSiteFlags));
console.log('CONSUMER_EDITORIAL_QA_PASS '+JSON.stringify({
 publicHtmlScanned:files.length,diagnosisPagesChecked:files.filter(x=>x.includes('/resources/diagnoses/')).length,
 reviewedInternalCopyFindings:0,sitewideFollowupCount:firstSiteFlags.length,
 sitewideFollowupDetails:firstSiteFlags
}));
