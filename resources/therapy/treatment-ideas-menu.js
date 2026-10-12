'use strict';
const $=id=>document.getElementById(id);
const state={families:[],ideas:[],measures:[],visible:12,approach:'',edits:new Map()};
const approaches=[
 ['','All approaches'],
 ['Thinking & meaning','Thinking'],
 ['Environment & access','Environment'],
 ['Behavior & practice','Action & practice'],
 ['People & support','People & support'],
 ['Routines & regulation','Body & routines'],
 ['Values & autonomy','Values & choice'],
 ['Ready-to-try example','More practical examples']
];
const el=(tag,text,className)=>{
 const n=document.createElement(tag);
 if(text!==undefined)n.textContent=text;
 if(className)n.className=className;
 return n;
};
const normalize=value=>String(value||'').toLocaleLowerCase().trim();
async function copyText(text,label){
 try{
  if(!navigator.clipboard?.writeText)throw Error('Clipboard not supported');
  await navigator.clipboard.writeText(text);
  $('copy-fallback').hidden=true;
  $('copy-status').textContent='Copied: '+label;
 }catch{
  $('copy-text').value=text;
  $('copy-fallback').hidden=false;
  $('copy-fallback').open=true;
  $('copy-status').textContent='Clipboard unavailable. Select the text below to copy it.';
 }
}
function makeCard(item,type){
 const key=type+':'+item.id;
 const original={try:item.try,measure:item.measure};
 const existing=state.edits.get(key);
 const draft=existing?{...existing}:{...original};
 const card=el('article',undefined,'idea-card '+(type==='measure'?'measure-card':'target-card'));
 card.dataset.ideaId=item.id;
 const top=el('div',undefined,'card-top');
 top.append(el('span',type==='measure'?item.area:item.approach,'idea-tag'));
 if(type!=='measure')top.append(el('span',item.presentationName,'topic-tag'));
 card.append(top,el('h3',item.title));
 const tryBox=el('div',undefined,'idea-detail');
 const tryTitle=el('span',type==='measure'?'What to track':'Try this','detail-label');
 const tryView=el('p',draft.try,'idea-try');
 const tryEdit=el('textarea',undefined,'card-edit edit-try');
 tryEdit.value=draft.try;tryEdit.rows=4;tryEdit.hidden=true;
 tryEdit.setAttribute('aria-label','Edit '+item.title+' suggestion');
 tryBox.append(tryTitle,tryView,tryEdit);
 const measureBox=el('div',undefined,'idea-detail progress-detail');
 const measureTitle=el('span',type==='measure'?'Example you could adapt':'Notice progress','detail-label');
 const measureView=el('p',draft.measure,'idea-measure');
 const measureEdit=el('textarea',undefined,'card-edit edit-measure');
 measureEdit.value=draft.measure;measureEdit.rows=3;measureEdit.hidden=true;
 measureEdit.setAttribute('aria-label','Edit '+item.title+' progress example');
 measureBox.append(measureTitle,measureView,measureEdit);
 card.append(tryBox,measureBox);
 const controls=el('div',undefined,'card-actions');
 const edit=el('button','Edit this idea','edit-idea');edit.type='button';
 edit.setAttribute('aria-expanded','false');
 const copy=el('button','Copy','copy-idea');copy.type='button';
 const reset=el('button','Restore original','restore-idea');reset.type='button';reset.hidden=true;
 function updateDraft(){
  const next={try:tryEdit.value,measure:measureEdit.value};
  state.edits.set(key,next);
  tryView.textContent=next.try;measureView.textContent=next.measure;
  reset.hidden=next.try===original.try&&next.measure===original.measure;
 }
 tryEdit.addEventListener('input',updateDraft);
 measureEdit.addEventListener('input',updateDraft);
 edit.addEventListener('click',()=>{
  const opening=tryEdit.hidden;
  tryEdit.hidden=!opening;measureEdit.hidden=!opening;
  tryView.hidden=opening;measureView.hidden=opening;
  edit.textContent=opening?'Done editing':'Edit this idea';
  edit.setAttribute('aria-expanded',String(opening));
  if(opening)tryEdit.focus();
 });
 reset.addEventListener('click',()=>{
  tryEdit.value=original.try;measureEdit.value=original.measure;
  updateDraft();state.edits.delete(key);reset.hidden=true;
 });
 copy.addEventListener('click',()=>{
  const current=state.edits.get(key)||original;
  return copyText(item.title+'\n'+(type==='measure'?'What to track: ':'Try this: ')+current.try+'\n'+(type==='measure'?'Example: ':'Notice progress: ')+current.measure,item.title);
 });
 controls.append(edit,copy,reset);
 if(item.source){
  const a=el('a','Source ↗','source-link');a.href=item.source;a.target='_blank';a.rel='noopener noreferrer';controls.append(a);
 }
 card.append(controls);
 return card;
}
function renderChips(){
 const host=$('approach-filters');host.replaceChildren();
 for(const [id,label] of approaches){
  const b=el('button',label,'approach-choice');
  b.type='button';b.dataset.approach=id;
  b.setAttribute('aria-pressed',String(state.approach===id));
  b.addEventListener('click',()=>{state.approach=id;state.visible=12;renderChips();renderTargets();});
  host.append(b);
 }
}
function renderTargets(){
 const query=normalize($('menu-search').value),selected=$('menu-diagnosis').value;
 const items=state.ideas.filter(i=>
  (!selected||i.presentation===selected)&&(!state.approach||i.approach===state.approach)&&
  (!query||normalize([i.presentationName,i.approach,i.title,i.try,i.measure].join(' ')).includes(query))
 );
 const shown=items.slice(0,state.visible);
 $('target-ideas').replaceChildren(...shown.map(i=>makeCard(i,'target')));
 $('target-count').textContent=items.length+' ideas';
 $('target-empty').hidden=items.length!==0;
 $('targets-more').hidden=items.length<=state.visible;
 $('targets-more').textContent='Show '+Math.min(12,items.length-state.visible)+' more ideas';
 const selectedText=selected?$('menu-diagnosis').selectedOptions[0]?.textContent:'All concerns';
 const approachText=approaches.find(([id])=>id===state.approach)?.[1]||'All approaches';
 $('active-view').textContent=selectedText+' · '+approachText;
}
function renderMeasures(){
 const area=$('menu-area').value,query=normalize($('measure-search').value);
 const items=state.measures.filter(i=>(!area||i.area===area)&&
   (!query||normalize([i.title,i.area,i.try,i.measure].join(' ')).includes(query)));
 $('measure-ideas').replaceChildren(...items.map(i=>makeCard(i,'measure')));
 $('measure-count').textContent=items.length+' choices';
 $('measure-empty').hidden=items.length!==0;
}
async function init(){
 try{
  const sources=[
   '/data/treatment-plan-menu.json',
   '/data/treatment-goal-try-it-examples.json',
   '/data/treatment-approach-ideas.json',
   '/data/treatment-plan-measure-ideas.json'
  ];
  const responses=await Promise.all(sources.map(path=>fetch(path)));
  if(responses.some(r=>!r.ok))throw Error('One or more source files could not load');
  const [catalog,ready,alternative,measureData]=await Promise.all(responses.map(r=>r.json()));
  if(!Array.isArray(catalog.families)||!Array.isArray(alternative.ideas)||!Array.isArray(measureData.measures))throw Error('Unexpected idea library format');
  state.families=catalog.families;
  const familyById=new Map(catalog.families.map(f=>[f.id,f]));
  state.ideas=alternative.ideas.map(i=>({...i,presentationName:i.presentation==='anxiety'?'Anxiety and overwhelm':familyById.get(i.presentation)?.name||i.presentation}));
  for(const f of catalog.families)for(const target of f.targets){
   const suggestion=ready.examples?.[target.id];
   if(!suggestion)continue;
   state.ideas.push({id:'ready-'+target.id,presentation:f.id,presentationName:f.name,
    approach:'Ready-to-try example',title:target.label,try:suggestion,measure:target.measure});
  }
  state.measures=measureData.measures.map(m=>({
   id:m.id,area:m.area,title:m.name,try:m.track,measure:m.example,source:m.source
  }));
  const selector=$('menu-diagnosis');
  const all=el('option','All concerns');all.value='';selector.replaceChildren(all);
  const anxiety=el('option','Anxiety and overwhelm');anxiety.value='anxiety';selector.append(anxiety);
  for(const group of [...new Set(catalog.families.map(f=>f.group))]){
   const optgroup=el('optgroup');optgroup.label=group;
   for(const f of catalog.families.filter(f=>f.group===group)){
    const option=el('option',f.name);option.value=f.id;optgroup.append(option);
   }selector.append(optgroup);
  }
  const requested=new URLSearchParams(location.search).get('diagnosis');
  selector.value=state.ideas.some(x=>x.presentation===requested)?requested:'anxiety';
  const measureSelect=$('menu-area');
  for(const area of [...new Set(state.measures.map(m=>m.area))].sort()){
   const o=el('option',area);o.value=area;measureSelect.append(o);
  }
  $('menu-search').addEventListener('input',()=>{state.visible=12;renderTargets();});
  selector.addEventListener('change',()=>{state.visible=12;renderTargets();});
  $('targets-more').addEventListener('click',()=>{state.visible+=12;renderTargets();});
  $('menu-reset').addEventListener('click',()=>{
   selector.value='';$('menu-search').value='';state.approach='';state.visible=12;
   $('measure-search').value='';measureSelect.value='';renderChips();renderTargets();renderMeasures();
  });
  $('menu-area').addEventListener('change',renderMeasures);
  $('measure-search').addEventListener('input',renderMeasures);
  $('menu-count').textContent=state.ideas.length+' ideas across '+(catalog.families.length+1)+' concerns · '+state.measures.length+' progress measures';
  renderChips();renderTargets();renderMeasures();
 }catch(err){
  $('menu-count').textContent='The idea library could not load. Please reload this page.';
  $('target-empty').hidden=false;
  $('target-empty').textContent='Suggestions are temporarily unavailable.';
  $('measure-empty').hidden=false;
 }
}
init();
