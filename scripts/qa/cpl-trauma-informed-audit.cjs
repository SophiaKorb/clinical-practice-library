// Trauma-informed care coverage triage across all current and historical CPL resource files.
// Heuristic flags never establish clinical validity, permissions, treatment selection, or trauma history.
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'../..'),OUT=path.join(ROOT,'review-artifacts');
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const src=read('docs/qa/2026-11-12-all-resource-coverage-seed.csv').trimEnd().split(/\r?\n/);
const headers=src.shift().split(',');
const records=src.map((s,i)=>{
 const vals=[...s.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g)].map(x=>x[1].replace(/""/g,'"'));
 assert.equal(vals.length,headers.length,'Malformed coverage row '+(i+2));
 return Object.fromEntries(headers.map((h,j)=>[h,vals[j]]));
});
assert.equal(records.length,802);
const ledger=JSON.parse(read('docs/qa/2026-11-13-trauma-informed-primary-source-ledger.json'));
assert.equal(ledger.records.length,7);
assert.ok(ledger.records.every(r=>r.clinicalApproved===false&&r.rightsApproved===false&&r.publicationApproved===false));
const map=new Map();
for(const r of ledger.records)for(const p of r.relatedFiles){
 const key='/'+p.replace(/^\/+/,'');const ids=map.get(key)||[];ids.push(r.id);map.set(key,ids);
}
const strip=s=>s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
 .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ')
 .replace(/&(?:amp|nbsp|quot|rsquo|ldquo|rdquo);/gi,' ').replace(/\s+/g,' ').trim();
const traumaPath=/^\/resources\/(?:trauma\/|therapy\/trauma-|clinical-topics\/(?:trauma-cue-orientation|dissociation-function-orientation)\/|clinical-depth\/(?:complex-dissociation|dissociation-function)|assessment\/(?:trauma|adhd-autism-trauma)|handouts\/(?:grounding(?:-quick-card)?|my-grounding-menu|helping-your-child-prepare-practice-and-regulate)|therapy\/early-childhood-regulation-communication)/;
const traumaTitle=/\b(trauma|traumatic|ptsd|dissociation|dissociative|grounding|vicarious)\b/i;
const traumaContent=/trauma.informed|trauma.focused|traumatic stress|trauma reminders|trauma cues|trauma history|retraumati[sz]/i;
const rows=[];
for(const r of records){
 const p=r.source_path,canon=p.replace(/^\/legacy(?=\/)/,'');
 if(r.asset_format!=='HTML'){
  const related=/(trauma|grounding|dissociat|ptsd)/i.test(p);
  rows.push({path:p,scope:r.inventory_scope,format:'PDF',category:related?'PDF_REVIEW_CANDIDATE':'OUT_OF_FOCUSED_SCOPE',
   priority:related?'REVIEW_CANDIDATE':'UNTRIAGED',pageHasExternalLinks:null,skipLinkRecognized:null,
   language:'NOT_HTML',referencedOfficialSources:[],narrowEvidenceIds:map.get(canon)||[],
   sourceContentVerification:'NOT_VERIFIED',clinicalApproval:'PENDING_HUMAN',
   traumaInformedOrganizationalApproval:'NOT_ASSESSED',rightsApproval:'PENDING_HUMAN',
   translationReview:'PENDING_HUMAN_IF_APPLICABLE',accessibilityManualReview:'NOT_TESTED',releaseApproval:'NOT_AUTHORIZED'});
  continue;
 }
 const source=read(p.slice(1));
 const title=strip((source.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||'');
 const body=strip((source.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)||[])[1]||source);
 const direct=traumaPath.test(canon)||traumaTitle.test(title);
 const crosscutting=(!direct)&&traumaContent.test(body);
 const external=[...source.matchAll(/<a\b[^>]*\bhref=["'](https?:\/\/[^"']+)["']/gi)].map(x=>x[1]);
 const officialHosts=[...new Set(external.map(url=>{try{return new URL(url).hostname.toLowerCase()}catch{return 'invalid-url'}}))];
 const safetyFlag=/\b(current danger|emergency|immediate safety|suicid|overdose|abuse|coercion|safeguarding)\b/i.test(body);
 const consentFlag=/\b(ask permission|consent|opt.out|choice|can decline|do not force|not impos|patient preference)\b/i.test(body);
 const differentiation=/\b(differential|do not assume|not (?:the )?same|other possible|competing explanation|distinct from)\b/i.test(body);
 const culture=/\b(cultur|language|racism|historic|gender|disabilit|neurodiver|accessibility)\b/i.test(body);
 const strengths=/\b(strength|protective|resilien|support|collaborat)\b/i.test(body);
 const scope=direct?'DIRECT_TRAUMA_CANDIDATE':crosscutting?'CROSSCUTTING_MENTION':'NO_FOCUS_KEYWORDS';
 const priority=direct&&/(assess|dissociat|ptsd|trauma-cue|model|clinical-guide|child-welfare)/i.test(canon)?'T0_SPECIALIST_CANDIDATE':
  direct?'T1_TOPIC_CANDIDATE':crosscutting?'T2_CONTEXT_CANDIDATE':'NOT_SCOPED';
 const evidenceIds=map.get(canon)||[];
 rows.push({path:p,scope:r.inventory_scope,format:'HTML',category:scope,priority,title,language:(source.match(/<html\b[^>]*lang=["']([^"']+)/i)||[])[1]||'MISSING',
  direct,contextMention:crosscutting,safetyLanguageDetected:safetyFlag,consentOrChoiceLanguageDetected:consentFlag,
  differentialLanguageDetected:differentiation,culturalOrAccessLanguageDetected:culture,strengthsOrSupportLanguageDetected:strengths,
  pageHasExternalLinks:external.length>0,externalLinkCount:external.length,referencedOfficialSources:officialHosts,
  skipLinkRecognized:/<a\b[^>]*class=["'][^"']*(?:\bskip\b|cpl-skip)[^"']*["'][^>]*href=["']#/.test(source),
  narrowEvidenceIds:evidenceIds,sourceContentVerification:evidenceIds.length?'LIMITED_CLAIM_COMPARISON_ONLY':'NOT_VERIFIED',
  editorialReviewDateMention:/\b(reviewed|revisado)\s*:\s*[A-ZÁÉÍÓÚa-záéíóú]+\s+\d{4}/.test(body),
  clinicalApproval:'PENDING_HUMAN',traumaInformedOrganizationalApproval:'NOT_ASSESSED',
  rightsApproval:'PENDING_HUMAN',translationReview:'PENDING_HUMAN_IF_APPLICABLE',
  accessibilityManualReview:'NOT_TESTED',releaseApproval:'NOT_AUTHORIZED'});
}
assert.equal(rows.length,802);
assert.equal(rows.filter(r=>r.format==='HTML').length,741);
assert.equal(rows.filter(r=>r.format==='PDF').length,61);
const direct=rows.filter(x=>x.category==='DIRECT_TRAUMA_CANDIDATE'),
 cross=rows.filter(x=>x.category==='CROSSCUTTING_MENTION'),pdf=rows.filter(x=>x.category==='PDF_REVIEW_CANDIDATE');
const trauma=rows.filter(x=>x.category!=='NO_FOCUS_KEYWORDS'&&x.category!=='OUT_OF_FOCUSED_SCOPE');
const currentTrauma=trauma.filter(x=>x.scope==='current');
const withoutSource=currentTrauma.filter(x=>x.format==='HTML'&&!x.pageHasExternalLinks);
const noSkip=currentTrauma.filter(x=>x.format==='HTML'&&!x.skipLinkRecognized);
const sum={auditDate:'2026-11-13',sourceSha:process.env.HEAD_SHA||'local',allFiles:802,html:741,pdfs:61,
 directTraumaCandidates:direct.length,crosscuttingMentionCandidates:cross.length,traumaRelatedPdfCandidates:pdf.length,
 currentTraumaRelatedCandidates:currentTrauma.length,currentTraumaHtmlWithoutExternalAnchors:withoutSource.length,
 currentTraumaHtmlWithoutRecognizedSkipPattern:noSkip.length,limitedPrimarySourceRecords:ledger.records.length,
 resourcesWithAnyNarrowEvidenceIds:rows.filter(r=>r.narrowEvidenceIds?.length).length,
 clinicalApproved:0,rightsApproved:0,publicationAuthorized:0,
 limitation:'Path/title and word heuristics are reviewer triage only. Neither positive nor missing wording indicates trauma, diagnosis, correctness, consent, organization-level implementation or rights.'};
const cols=['path','scope','format','category','priority','title','language','safetyLanguageDetected','consentOrChoiceLanguageDetected',
'differentialLanguageDetected','culturalOrAccessLanguageDetected','strengthsOrSupportLanguageDetected','pageHasExternalLinks',
'externalLinkCount','skipLinkRecognized','narrowEvidenceIds','sourceContentVerification','clinicalApproval',
'traumaInformedOrganizationalApproval','rightsApproval','translationReview','accessibilityManualReview','releaseApproval'];
const quote=x=>'"'+String(Array.isArray(x)?x.join(';'):x??'').replace(/"/g,'""')+'"';
const csv=[cols.join(','),...rows.map(r=>cols.map(k=>quote(r[k])).join(','))].join('\n')+'\n';
fs.mkdirSync(OUT,{recursive:true});
fs.writeFileSync(path.join(OUT,'cpl-trauma-informed-matrix.json'),JSON.stringify({summary:sum,rows},null,2)+'\n');
fs.writeFileSync(path.join(OUT,'cpl-trauma-informed-matrix.csv'),csv);
fs.writeFileSync(path.join(OUT,'cpl-trauma-informed-summary.json'),JSON.stringify(sum,null,2)+'\n');
console.log('TIC_COVERAGE_SUMMARY '+JSON.stringify(sum));
console.log('TIC_FOCUSED_PRIORITY '+JSON.stringify(direct.filter(x=>x.scope==='current').map(x=>({path:x.path,priority:x.priority,links:x.externalLinkCount,skip:x.skipLinkRecognized}))).slice(0,13000));
console.log('PASS trauma informed candidate triage across all 802 files; every human sign-off remains pending');
