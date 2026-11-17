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
  assert(!/<iframe|<form[^>]*action=|fetch\(/i.test(html),'Unexpected external processing or embedded content');
}
for(let n=1;n<=170;n++)assert(familyHtml.includes('id="listing-'+n+'"'),'Missing numbered family entry '+n);
for(let n=1;n<=27;n++)assert(tayHtml.includes('id="youth-listing-'+n+'"'),'Missing TAY entry '+n);
assert(tayHtml.includes('id="iam-you-360"'),'Added youth provider profile missing');
for(const p of ['resources/community/index.html','index.html','resources/start-here.html','resources/clinical-resource-finder.html']){
 const s=read(p);
 for(const name of ['family-guide.html','transition-age-guide.html'])assert(s.includes(name),'No visible route to '+name+' in '+p);
}
const ui=read('resources/finder-live-ui.js');
assert(ui.includes("'Read in online guide'"),'Finder individual result does not offer online reader');
for(const src of ['resources/community/family-community-guide-text.html','resources/community/youth-community-guide-text.html'])assert(fs.existsSync(path.join(root,src)),'Original source text removed');
console.log('COMMUNITY_ONLINE_GUIDES_PASS '+JSON.stringify({family:family.length,tay:tay.length,oldSourceAnchors:197,totalCatalog:data.resources.length}));
