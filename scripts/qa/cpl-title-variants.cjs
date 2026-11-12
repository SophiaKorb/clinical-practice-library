// Exact and text-normalized duplicate-title candidate audit. No automatic removal.
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'../..');
const inventory=fs.readFileSync(path.join(ROOT,'resources/complete-resource-inventory.html'),'utf8');
const records=[...inventory.matchAll(/<li class="resource-entry" data-legacy="false"><a href="([^"]+)">([\s\S]*?)<\/a>/g)]
 .map(m=>({url:m[1],title:m[2].replace(/&amp;/g,'&').toLowerCase().trim()}));
const byTitle=new Map();
for(const r of records){const a=byTitle.get(r.title)||[];a.push(r.url);byTitle.set(r.title,a);}
const candidates=[...byTitle].filter(([,urls])=>urls.length>1).sort((a,b)=>a[0].localeCompare(b[0]));
function sha(s){return crypto.createHash('sha256').update(s).digest('hex').slice(0,16);}
const groups=candidates.map(([title,urls])=>{
 const files=urls.map(url=>{
  const full=path.join(ROOT,url.slice(1));assert.ok(full.startsWith(ROOT+path.sep),'Unsafe path');
  const source=fs.readFileSync(full,'utf8');
  const main=(source.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)||[])[1]||'';
  const text=main.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')
   .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ')
   .replace(/&(?:nbsp|amp|quot|rsquo|ldquo|rdquo);/g,' ')
   .replace(/\s+/g,' ').trim();
  return {url,bytes:Buffer.byteLength(source),fileSha:sha(source),visibleMainTextSha:sha(text),visibleMainWords:text.split(/\s+/).length,language:(source.match(/<html\b[^>]*lang="([^"]+)"/i)||[])[1]||'unmarked'};
 });
 const exactPairs=[],sameTextPairs=[];
 for(let i=0;i<files.length;i++)for(let j=i+1;j<files.length;j++){
   if(files[i].fileSha===files[j].fileSha)exactPairs.push([files[i].url,files[j].url]);
   else if(files[i].visibleMainTextSha===files[j].visibleMainTextSha)sameTextPairs.push([files[i].url,files[j].url]);
 }
 return {title,files,exactPairs,sameTextPairs,requiresContentReview:files.length>1};
});
const pairs=groups.flatMap(g=>g.exactPairs),textPairs=groups.flatMap(g=>g.sameTextPairs);
const summary={titleGroups:groups.length,candidateFiles:groups.reduce((n,g)=>n+g.files.length,0),exactFilePairs:pairs.length,sameVisibleMainTextNonidenticalPairs:textPairs.length};
assert.equal(summary.titleGroups,26,'Previously identified title groups changed; re-review');
assert.equal(summary.candidateFiles,54,'Previously identified title variants changed; re-review');
assert.ok(pairs.length>=1,'Known byte-identical Spanish pair not found');
console.log('CPL TITLE-VARIANT AUDIT '+JSON.stringify(summary));
console.log('EXACT_FILE_PAIRS '+JSON.stringify(pairs));
console.log('SAME_MAIN_TEXT_PAIRS '+JSON.stringify(textPairs));
for(const group of groups)console.log('GROUP '+JSON.stringify(group));
console.log('NOTICE: exact files can have separate links; same text or title does not authorize removal, redirect, clinical or translation approval.');
