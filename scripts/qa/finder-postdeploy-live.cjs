'use strict';
/* Read-only, no-secret spot-check of the EXISTING production domain as of PR #52.
   It never deploys and never treats an auth challenge as proof of route health. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(process.cwd(),'qa-artifacts/pr43/finder-postdeploy');
fs.mkdirSync(root,{recursive:true});
const origin='https://clinical-practice-library.vercel.app';
const routes=[
 ['/', 'Clinical Practice Library'],
 ['/resources/clinical-resource-finder.html','id="lab-q"'],
 ['/resources/clinical-resource-finder-classic.html','id="finder-query"'],
 ['/resources/finder-live-ui.js','lab-q'],
 ['/resources/finder-lab-engine.js','CPLFinderLab'],
 ['/resources/clinical-finder-data.js','CPLFinderData'],
 ['/resources/complete-resource-inventory.html','Complete'],
 ['/resources/birth-to-five/index.html','Early Childhood Resources'],
 ['/resources/birth-to-five/tucson-pima-local-resources.html','Pima'],
 ['/resources/handouts/grounding.html','Grounding'],
 ['/resources/handouts/after-school-is-a-landing-not-a-launch.html','After School'],
 ['/resources/handouts/safety-planning-preparation-sheet.html','Safety Planning'],
 ['/resources/es/handouts/autismo-guia-rapida-familias.html','Autismo'],
 ['/resources/community/expanded-external-resources.html','Mental health publications'],
 ['/resources/clinical-resource-finder.html?q=IEP','id="lab-q"']
];
async function check([route,marker]){
 const url=origin+route;
 try{
  const r=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(9000),headers:{Accept:'text/html,application/javascript;q=0.9,*/*;q=0.8'}});
  const body=(await r.text()).slice(0,1500000);
  const challenge=/(sign in to vercel|authentication required|deployment protection|log in to vercel)/i.test(body);
  let status;
  if([401,403,429].includes(r.status)||challenge)status='ACCESS_BLOCKED';
  else if(r.status===200&&body.includes(marker))status='PASS';
  else if(r.status===200)status='WRONG_CONTENT_OR_INTERSTITIAL';
  else status='HTTP_ERROR';
  return {route,status,http:r.status,bytes:body.length,markerPresent:body.includes(marker),finalOrigin:new URL(r.url).origin};
 }catch(e){return {route,status:'NETWORK_BLOCKED',error:String(e&&e.message||e).slice(0,200)};}
}
(async()=>{
 const results=await Promise.all(routes.map(check));
 const summary={
  source:'Published CPL canonical domain; no PHI, no auth, read-only',
  classification:'Live HTTP spot check only; catalog link integrity remains separately covered by local static CI',
  checked:results.length,
  passing:results.filter(x=>x.status==='PASS').length,
  accessBlocked:results.filter(x=>/BLOCKED/.test(x.status)).length,
  broken:results.filter(x=>x.status==='HTTP_ERROR'||x.status==='WRONG_CONTENT_OR_INTERSTITIAL').length,
  results
 };
 fs.writeFileSync(path.join(root,'live-production-route-check.json'),JSON.stringify(summary,null,2));
 console.log('CPL_LIVE_ROUTE_EVIDENCE '+JSON.stringify(summary));
 if(summary.broken)process.exitCode=1;
 if(summary.accessBlocked)console.log('LIVE CHECK INCOMPLETE: public endpoint blocked; do not claim independent HTTP verification.');
})().catch(e=>{console.error(e);process.exitCode=1;});
