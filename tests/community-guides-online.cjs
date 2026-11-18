'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=JSON.parse(read('resources/clinical-finder-data.js').replace(/^globalThis\.CPLFinderData\s*=\s*/,'').replace(/;\s*$/,''));
const family=data.resources.filter(r=>r.communityCollection==='family');
const tay=data.resources.filter(r=>r.communityCollection==='transition-age');
assert.equal(family.length,170);assert.equal(tay.length,28);assert.equal(data.resources.length,813);
const familyHtml=read('resources/community/family-guide.html'),tayHtml=read('resources/community/transition-age-guide.html');
for(const [html,entries,type] of [[familyHtml,family,'family'],[tayHtml,tay,'tay']]){
  const cards=[...html.matchAll(/<article class="entry" id="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(cards.length,entries.length,'Missing online cards for '+type);
  const summaries=[...html.matchAll(/<p class="entry-desc">([^<]*)<\/p>/g)].map(m=>m[1].trim());
  assert.equal(summaries.length,entries.length,'Missing online entry descriptions for '+type);
  assert(summaries.every(t=>/[.!?…]$/.test(t)),'Online guide contains abruptly cut-off catalog excerpts: '+type);
  assert(!summaries.some(t=>/Services \/ good to k$|family resourc$|routines, lim$/i.test(t)),'Truncated description artifact remains: '+type);

  assert.equal(new Set(cards).size,cards.length,'Duplicate card anchors for '+type);
  for(const item of entries){
    const hash=item.url.split('#')[1];
    const id=hash||(item.url==='/resources/community/iamyou360.html'?'iam-you-360':null);
    assert(id&&cards.includes(id),'Original item lacks online entry: '+item.url);
    assert(html.includes('href="'+item.url.replace(/&/g,'&amp;')+'"'),'Online card lost original source link '+item.url);
    if(item.providerEvidenceUrl)assert(html.includes('href="'+item.providerEvidenceUrl+'"'),'Official source evidence link lost '+item.url);
  }
  assert(html.includes('id="guide-query"')&&html.includes('id="guide-status"')&&html.includes('role="status"'),'Client-only guide filtering and announcements missing');
  assert(html.includes('@media print')&&html.includes('@media(max-width:520px)'),'Print/small-screen layout missing');
  assert(html.includes('id="guide-print"')&&html.includes("window.print()"),'Online guide lacks print/save PDF action');
  assert(html.includes('Print all web listings')&&html.includes('shorter web summaries')&&html.includes('bookmarks and document tags'),'The web print action must not be confused with the approved source PDF');
  assert(html.includes('.section[hidden]{display:block!important}')&&html.includes('.entry[hidden]{display:block!important}'),'Filtered listing must not disappear from full-guide print');
  assert(html.includes('.section{break-before:auto;margin-bottom:18px}')&&html.includes('.section-head{break-inside:avoid;break-after:avoid}'),'Print layout must not force a blank partial cover page and must keep headings with their section');
  assert(html.includes('.entries{display:block;columns:initial}.entry{display:block;width:100%;margin:0 0 10px}'),'Print listing content must allow pagination without unbreakable two-column blocks');
  assert(html.includes('link.parentElement.hidden=')&&html.includes('No matches. Try a different search'),'Filtered navigation and no-match instruction missing');
  assert(html.includes('localCount===0')&&html.includes('LGBTQ+ supplemental resources shown'),'Local supplementary listings not included in guide filtering and status');
  assert(html.includes('.lgbtq-extra[hidden]{display:block!important}')&&html.includes('.lgbtq-listing[hidden]{display:list-item!important}'),'Local supplementary listings excluded from full-guide printing');
  assert(!/<iframe|<form[^>]*action=|fetch\(/i.test(html),'Unexpected external processing or embedded content');
}
for(let n=1;n<=170;n++)assert(familyHtml.includes('id="listing-'+n+'"'),'Missing numbered family entry '+n);
for(let n=1;n<=27;n++)assert(tayHtml.includes('id="youth-listing-'+n+'"'),'Missing TAY entry '+n);
assert(tayHtml.includes('id="iam-you-360"'),'Added youth provider profile missing');
for(const p of ['resources/community/index.html','index.html','resources/start-here.html','resources/clinical-resource-finder.html']){
 const s=read(p);
 for(const name of ['family-guide.html','transition-age-guide.html'])assert(s.includes(name),'No visible route to '+name+' in '+p);
}
// Local LGBTQ+ supplemental listings are visible INSIDE each online community guide, not just on the hub.
// They must not change any of the 170/27 original numbered entries, 28 TAY index records,
// their search facets or the byte-identical October PDF publications.
const localIds=['eon','pride','fluxx','stars','stars-name','stars-update','fluxx-clinic','fluxx-health'];
const localHub=read('resources/community/index.html');
for(const [html,type] of [[familyHtml,'family'],[tayHtml,'transition-age']]){
 assert(html.includes('id="lgbtq-community-resources"'),'No local LGBTQ section in '+type);
 assert(html.includes('href="#lgbtq-community-resources"'),'Local LGBTQ supplement missing TOC or top navigation in '+type);
 assert(html.includes('not part of the original October 25, 2026 numbered guide or approved PDF'),'Original/supplement distinction missing '+type);
 assert(html.includes('href="/resources/community/online-lgbtq-resources.html"'),'Online/national LGBTQ collection missing '+type);
 assert.equal((html.match(/<li class="lgbtq-listing"/g)||[]).length,localIds.length,'Wrong count of local LGBTQ resource additions '+type);
 for(const id of localIds){
  const source=localHub.match(new RegExp('<article class="card" id="'+id+'">([\\s\\S]*?)<\\/article>'));
  assert(source,'Original community hub card missing '+id);
  const url=source[1].match(/<a href="(https?:[^"]+)"/)?.[1];
  assert(url&&html.includes('href="'+url+'"'),'Missing original provider link for '+id+' in '+type);
  assert(html.includes('id="local-lgbtq-'+id+'"'),'Missing direct heading anchor '+id+' in '+type);
  assert(html.includes('href="/resources/community/index.html#'+id+'"'),'Missing CPL contextual notes for '+id+' in '+type);
 }
}

// Distinguish source-specific community legal guides from current government procedure.
const legalReaders=[familyHtml,tayHtml,read('resources/community/index.html')];
const officialLegalLinks=["https://www.sc.pima.gov/how-do-i","https://www.azcourts.gov/selfservicecenter/Forms/Name-Change","https://www.ssa.gov/life-events/change-name","https://azdot.gov/mvd/services/driver-license-ID/change-your-name","https://www.azdhs.gov/licensing/vital-records/index.php","https://travel.state.gov/en/passports/apply/unique-needs/sex-markers.html"];
for(const [i,html] of legalReaders.entries()){
 assert.equal((html.match(/id="current-legal-records"/g)||[]).length,1,'Missing one-and-only-one legal source caution on community page '+i);
 assert(html.includes('do not rely on a community handout alone'.replace('do','Do')),'Missing advice to verify primary sources on community page '+i);
 for(const url of officialLegalLinks)assert(html.includes('href="'+url+'"'),'Missing authoritative legal reference '+url+' on community page '+i);
}

// User-approved final print+digital PDFs are published byte-identically to canonical Drive sources.
// They supersede the older archived 38-page/9-page PDF snapshots, not the source-text companions.
const crypto=require('node:crypto');
const pdfs=[
  {
    "path": "resources/community/original-pdfs/Tucson_Regional_Family_Resource_Guide_QA_Revised_2026.pdf",
    "size": 779066,
    "sha": "eae42c74b0870d0e4faf389e44b56b4e0104866f08389c42f279b43dd0a6f713",
    "pages": 52
  },
  {
    "path": "resources/community/original-pdfs/Southern_Arizona_Youth_Transition_Resources_2026.pdf",
    "size": 218122,
    "sha": "c051a12c8a5a8f7385260c64a5a53623a54e9480d0ee5f53518b1aeb04537091",
    "pages": 13
  }
];
const hub=read('resources/community/index.html');
const finder=read('resources/clinical-resource-finder.html');
for(const pdf of pdfs){
 const bytes=fs.readFileSync(path.join(root,pdf.path));
 assert.equal(bytes.length,pdf.size,'Approved PDF length changed: '+pdf.path);
 assert.equal(bytes.subarray(0,5).toString(),'%PDF-','Not a real PDF: '+pdf.path);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),pdf.sha,'PDF source bytes differ from approved final edition: '+pdf.path);
 const route='/'+pdf.path;
 assert(hub.includes('href="'+route+'"'),'Missing download on community hub: '+route);
 assert(finder.includes('href="'+route+'"'),'Missing download from unified finder: '+route);
 const reader=pdf.pages===52?familyHtml:tayHtml;
 assert(reader.includes('href="'+route+'"'),'Missing source PDF download from online guide: '+route);
 assert(reader.includes(String(pdf.pages)+'-page'),'Wrong final edition page count: '+route);
}
assert(hub.includes('52 pages')&&hub.includes('13 pages'),'Community hub still describes superseded PDF page counts');

const ui=read('resources/finder-live-ui.js');
assert(ui.includes("'Read in online guide'"),'Finder individual result does not offer online reader');
for(const src of ['resources/community/family-community-guide-text.html','resources/community/youth-community-guide-text.html'])assert(fs.existsSync(path.join(root,src)),'Original source text removed');
console.log('COMMUNITY_ONLINE_GUIDES_PASS '+JSON.stringify({family:family.length,tay:tay.length,oldSourceAnchors:197,totalCatalog:data.resources.length}));
