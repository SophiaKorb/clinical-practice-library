'use strict';
const $=id=>document.getElementById(id);
const state={families:[],measures:[],showAll:false};
const el=(tag,text,className)=>{
  const n=document.createElement(tag);
  if(text!==undefined)n.textContent=text;
  if(className)n.className=className;
  return n;
};
const normalize=s=>String(s||'').toLocaleLowerCase().trim();
function addPair(parent,title,body,cls){
  const wrap=el('div',undefined,cls||'idea-detail');
  wrap.append(el('span',title,'detail-label'),el('p',body));
  parent.append(wrap);
}
function makeCopyButton(text,label){
  const button=el('button','Copy suggestion','copy-idea');
  button.type='button';
  button.setAttribute('aria-label','Copy '+label);
  button.addEventListener('click',async()=>{
    try{
      if(!navigator.clipboard||!navigator.clipboard.writeText)throw Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      $('copy-fallback').hidden=true;
      $('copy-status').textContent=label+' copied for adaptation.';
    }catch{
      $('copy-text').value=text;
      $('copy-fallback').hidden=false;
      $('copy-fallback').open=true;
      $('copy-status').textContent='Clipboard unavailable. Select and copy the suggestion in the text area at the bottom.';
    }
  });
  return button;
}
function makeTarget(family,target){
  const article=el('article',undefined,'idea-card target-card');
  article.append(el('div',family.name,'idea-tag'),el('h3',target.label));
  addPair(article,'Desired outcome',target.goal);
  addPair(article,'Possible measurable target',target.objective,'idea-detail target-example');
  const bottom=el('div',undefined,'card-end');
  bottom.append(makeCopyButton(
    'Goal idea: '+target.goal+'\nPossible measurable target: '+target.objective+'\nAdapt to observed baseline, client priorities, access needs and review interval.',
    target.label
  ));
  article.append(bottom);
  return article;
}
function makeMeasure(m){
  const article=el('article',undefined,'idea-card measure-card');
  article.append(el('div',m.area,'idea-tag'),el('h3',m.name));
  addPair(article,'What to track',m.track);
  addPair(article,'Example to adapt',m.example,'idea-detail target-example');
  if(m.source){const link=el('a','Official or explanatory source ↗','source-link');link.href=m.source;link.target='_blank';link.rel='noopener noreferrer';article.append(link);}
  article.append(makeCopyButton(
    'Measure idea: '+m.name+'\nWhat to track: '+m.track+'\nIllustrative example: '+m.example+'\nAdapt to the individual; not a universal threshold.',
    m.name
  ));
  return article;
}
function renderTargets(){
  const query=normalize($('menu-search').value);
  const selected=$('menu-diagnosis').value;
  const matches=state.families.flatMap(f=>f.targets.filter(t=>
    (!selected||selected===f.id)&&(!query||normalize([f.name,f.group,t.label,t.goal,t.need,t.objective,t.measure].join(' ')).includes(query))
  ).map(t=>({f,t})));
  const limit=state.showAll?matches.length:12;
  $('target-ideas').replaceChildren(...matches.slice(0,limit).map(({f,t})=>makeTarget(f,t)));
  $('target-count').textContent=matches.length+' suggestion'+(matches.length===1?'':'s');
  $('target-empty').hidden=matches.length!==0;
  $('targets-more').hidden=matches.length<=limit;
  $('targets-more').textContent='Show '+(matches.length-limit)+' more target ideas';
}
function renderMeasures(){
  const area=$('menu-area').value,query=normalize($('measure-search').value);
  const matches=state.measures.filter(m=>(!area||m.area===area)&&(!query||normalize([m.name,m.area,m.track,m.example].join(' ')).includes(query)));
  $('measure-ideas').replaceChildren(...matches.map(makeMeasure));
  $('measure-count').textContent=matches.length+' option'+(matches.length===1?'':'s');
  $('measure-empty').hidden=matches.length!==0;
}
async function init(){
  try{
    const response=await Promise.all([fetch('/data/treatment-plan-menu.json'),fetch('/data/treatment-plan-measure-ideas.json')]);
    if(response.some(r=>!r.ok))throw Error('One or more menu files did not load');
    const [catalog,measures]=await Promise.all(response.map(r=>r.json()));
    if(!Array.isArray(catalog.families)||!Array.isArray(measures.measures))throw Error('Menu data has an unexpected format');
    state.families=catalog.families;
    state.measures=measures.measures;
    const diagnoses=$('menu-diagnosis');
    for(const group of [...new Set(state.families.map(f=>f.group))]){
      const opt=el('optgroup');opt.label=group;
      for(const f of state.families.filter(f=>f.group===group)){
        const item=el('option',f.name);item.value=f.id;opt.append(item);
      }
      diagnoses.append(opt);
    }
    const areaSelect=$('menu-area');
    for(const area of [...new Set(state.measures.map(m=>m.area))].sort()){
      const option=el('option',area);option.value=area;areaSelect.append(option);
    }
    const params=new URLSearchParams(location.search);
    const requested=params.get('diagnosis');
    if(state.families.some(f=>f.id===requested))diagnoses.value=requested;
    $('menu-search').addEventListener('input',()=>{state.showAll=false;renderTargets();});
    diagnoses.addEventListener('change',()=>{state.showAll=false;renderTargets();});
    $('menu-area').addEventListener('change',renderMeasures);
    $('measure-search').addEventListener('input',renderMeasures);
    $('targets-more').addEventListener('click',()=>{state.showAll=true;renderTargets();});
    $('menu-reset').addEventListener('click',()=>{
      $('menu-search').value='';$('measure-search').value='';diagnoses.value='';areaSelect.value='';
      state.showAll=false;renderTargets();renderMeasures();$('copy-status').textContent='Filters reset.';
    });
    $('menu-count').textContent=state.families.reduce((n,f)=>n+f.targets.length,0)+' goal and target ideas · '+state.measures.length+' ways to measure progress';
    renderTargets();renderMeasures();
  }catch(e){
    $('menu-count').textContent='The suggestions could not load.';
    $('target-empty').hidden=false;
    $('target-empty').textContent='Menu data is temporarily unavailable. Reload to try again.';
    $('measure-empty').hidden=false;
    $('measure-empty').textContent='Progress-measure data is temporarily unavailable.';
  }
}
init();
