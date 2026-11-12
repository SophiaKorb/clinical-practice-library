// Exhaustive, non-clinical source inventory. No external network or publication actions.
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'review-artifacts');
const csv=fs.readFileSync(path.join(root,'docs/qa/2026-11-12-all-resource-coverage-seed.csv'),'utf8').trimEnd().split(/\r?\n/);
const headers=csv.shift().split(',');
const records=csv.map((line,i)=>{
 const vals=[...line.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g)].map(x=>x[1].replace(/""/g,'"'));
 assert.equal(vals.length,headers.length,'Seed CSV row '+(i+1));
 return Object.fromEntries(headers.map((h,j)=>[h,vals[j]]));
});
assert.equal(records.length,802,'Coverage must include all 802 file entries');
const pdfPath=path.join(out,'cpl-pdf-text-audit.json');
const pdf=JSON.parse(fs.readFileSync(pdfPath,'utf8'));
const byPdf=new Map(pdf.files.map(x=>[x.path,x]));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex').slice(0,20);
const files=records.map(r=>{
 const resolved=path.resolve(root,r.source_path.slice(1));
 assert.ok(resolved.startsWith(root+path.sep),'Invalid path');
 const buffer=fs.readFileSync(resolved),text=r.asset_format==='HTML'?buffer.toString('utf8'):'';
 const urls=[...text.matchAll(/<a\b[^>]*href=["'](https?:\/\/[^"']+)["']/gi)].map(x=>x[1]);
 const data=byPdf.get(r.source_path);
 return {...r,currentFileSha256:sha(buffer),fileBytes:buffer.length,
  htmlLang:r.asset_format==='HTML'?(text.match(/<html\b[^>]*lang=["']([^"']+)["']/i)||[])[1]||'MISSING':'NOT_HTML',
  h1Count:r.asset_format==='HTML'?(text.match(/<h1\b/gi)||[]).length:null,
  mainLandmarkCount:r.asset_format==='HTML'?(text.match(/<main\b/gi)||[]).length:null,
  skipNavigationPattern:r.asset_format==='HTML'?/<a\b[^>]*class=["'][^"']*(?:\bskip\b|cpl-skip)[^"']*["'][^>]*href=["']#/.test(text):null,
  externalLinkCount:urls.length,
  externalDomains:[...new Set(urls.map(u=>{try{return new URL(u).hostname}catch{return 'INVALID'}}))],
  citationContentChecked:'NO_FULL_SOURCE_REVIEW',
  pdfPages:data?.pages??null,pdfSelectableTextPages:data?.selectableTextPages??null,
  pdfNoTextPages:data?.noTextPages??null,pdfWordCount:data?.wordCount??null,
  pdfFormFields:data?.formFields??null,pdfTextStatus:data?.status??'NOT_APPLICABLE',
  clinicalApproval:'PENDING_HUMAN',rightsApproval:'PENDING_HUMAN',
  nativeAssistiveTechnologyReview:'NOT_TESTED',physicalPrintReview:'NOT_TESTED',
  publicationApproval:'NOT_AUTHORIZED'};
});
const byScope=Object.fromEntries(['current','historical','unindexed'].map(x=>[x,files.filter(f=>f.inventory_scope===x).length]));
assert.deepEqual(byScope,{current:508,historical:268,unindexed:26});
const sourceLinks=files.reduce((n,r)=>n+r.externalLinkCount,0);
const missingLanguage=files.filter(x=>x.asset_format==='HTML'&&x.htmlLang==='MISSING').length;
const noH1=files.filter(x=>x.asset_format==='HTML'&&x.h1Count===0).length;
const noMain=files.filter(x=>x.asset_format==='HTML'&&x.mainLandmarkCount===0).length;
const noSkipPattern=files.filter(x=>x.asset_format==='HTML'&&!x.skipNavigationPattern).length;
const summary={sha:process.env.HEAD_SHA||'local',auditDate:'2026-11-12',files:files.length,scope:byScope,
 formats:{html:files.filter(x=>x.asset_format==='HTML').length,pdf:pdf.summary.totalFiles},
 separateCatalogMetadataRecords:156,previouslySampledAutomatedAccessibility:files.filter(x=>x.automated_axe_sample!=='NOT_SAMPLED').length,
 targetedSourceEvidenceFiles:files.filter(x=>x.targeted_source_evidence_ids).length,sourceLinksEnumerated:sourceLinks,
 htmlMissingLang:missingLanguage,htmlMissingH1:noH1,htmlMissingMain:noMain,htmlWithoutRecognizedSkipPattern:noSkipPattern,
 pdf:pdf.summary,clinicalApprovedByThisAudit:0,rightsClearedByThisAudit:0,
 caution:'Site-wide static checks and source links do NOT establish clinical source correctness, native screen-reader support, translation validity, rights, or publication approval.'};
const cols=['source_path','inventory_scope','asset_format','display_title','triage_priority_heuristic','htmlLang','h1Count','mainLandmarkCount','skipNavigationPattern','externalLinkCount','externalDomains','currentFileSha256','fileBytes','pdfPages','pdfSelectableTextPages','pdfNoTextPages','pdfWordCount','pdfFormFields','pdfTextStatus','targeted_source_evidence_ids','citationContentChecked','automated_axe_sample','clinicalApproval','rightsApproval','spanish_translation_review','nativeAssistiveTechnologyReview','physicalPrintReview','publicationApproval'];
const quote=x=>'"'+(Array.isArray(x)?x.join(';'):String(x??'')).replace(/"/g,'""')+'"';
const exported=[cols.join(','),...files.map(f=>cols.map(k=>quote(f[k])).join(','))].join('\n')+'\n';
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'cpl-complete-resource-matrix.json'),JSON.stringify({summary,files},null,2)+'\n');
fs.writeFileSync(path.join(out,'cpl-complete-resource-matrix.csv'),exported);
fs.writeFileSync(path.join(out,'cpl-complete-resource-summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log('CPL_COMPLETE_COVERAGE '+JSON.stringify(summary));
