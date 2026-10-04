'use strict';
const byId=id=>document.getElementById(id);
const selected=new Map();
let families=[],current;
const fieldIds=['formulation','priorities','strengths','access','service','coordination','review','discharge','participation'];
const fieldLabels=['Diagnosis / formulation','Client priorities','Strengths and resources','Access needs and barriers','Service / frequency / duration','Coordination / risk / referrals','Review date','Discharge / step-down criteria','Client participation'];
const targetFields=[['need','Need / functional impairment'],['goal','Goal'],['objective','Measurable objective / baseline / target date'],['intervention','Planned intervention / responsible clinician'],['measure','Progress measure / review schedule']];
function node(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
function link(label,url){const a=node('a',label);a.href=url;return a;}
function drawFamily(){
  current=families.find(f=>f.id===byId('diagnosis').value);
  if(!current)return;
  const host=byId('family');host.replaceChildren();
  host.append(node('p',current.context));
  host.append(node('p','Age / setting: '+current.age,'muted'));
  host.append(node('p',current.caution,'clinical-note'));
  const grid=node('div',undefined,'targets');
  current.targets.forEach(t=>{
    const card=node('article',undefined,'target');
    const label=node('label',undefined,'check');
    const box=node('input');box.type='checkbox';box.checked=selected.has(t.id);box.value=t.id;
    label.append(box,node('span',t.label));card.append(label);
    const dl=node('dl');
    targetFields.forEach(([key,title])=>dl.append(node('dt',title),node('dd',t[key])));card.append(dl);
    box.addEventListener('change',()=>{
      if(box.checked)selected.set(t.id,{...t,familyId:current.id,familyName:current.name});
      else selected.delete(t.id);
      drawSelected();
    });grid.append(card);
  });
  host.append(grid);
  const sources=node('div',undefined,'source-links');
  sources.append(link('Related library guide',current.guide));
  current.sources.forEach(s=>sources.append(link(s.label,s.url)));host.append(sources,node('p',current.evidence,'muted'));
}
function drawSelected(){
  const host=byId('selected');host.replaceChildren();
  selected.forEach((t,id)=>{
    const article=node('article',undefined,'selected-target');
    const remove=node('button','Remove target','remove');remove.type='button';remove.setAttribute('aria-label','Remove '+t.label);
    remove.addEventListener('click',()=>{selected.delete(id);drawSelected();drawFamily();});
    article.append(remove,node('h3',t.label),node('p',t.familyName,'muted'));
    const fields=node('div',undefined,'fields');
    targetFields.forEach(([key,title])=>{
      const label=node('label',title),area=node('textarea');area.value=t[key];area.rows=4;
      area.addEventListener('input',()=>{t[key]=area.value;refresh();});label.append(area);fields.append(label);
    });article.append(fields);host.append(article);
  });
  byId('selected-count').textContent=selected.size?selected.size+' target'+(selected.size===1?'':'s')+' selected':'No targets selected';
  byId('copy').disabled=byId('print').disabled=selected.size===0;
  refresh();
}
function planText(){
  const lines=['TREATMENT PLAN DRAFT',''];
  fieldIds.forEach((id,i)=>lines.push(fieldLabels[i]+': '+(byId(id).value.trim()||'[Complete '+fieldLabels[i].toLowerCase()+']'),'') );
  selected.forEach(t=>{
    lines.push(t.label+' — '+t.familyName);
    targetFields.forEach(([key,title])=>lines.push(title+': '+(t[key].trim()||'[Complete '+title.toLowerCase()+']')));
    lines.push('');
  });
  lines.push('Clinician signature / date: [Complete in approved chart]','Client / representative attestation: [Document per practice policy]');
  return lines.join('\n');
}
function refresh(){byId('output').textContent=planText();byId('feedback').textContent='';}
function preparationMessage(){return /\[[^\]]+\]/.test(planText())?'Draft copied. Replace bracketed prompts, confirm the targets with the client, and complete chart attestation.':'Draft copied. Review clinical fit and complete chart attestation.';}
async function init(){
  try{
    const r=await fetch('/data/treatment-plan-menu.json');if(!r.ok)throw new Error('Menu data unavailable');
    const data=await r.json();families=data.families;
    const select=byId('diagnosis');select.replaceChildren();
    [...new Set(families.map(f=>f.group))].forEach(group=>{
      const optgroup=node('optgroup');optgroup.label=group;
      families.filter(f=>f.group===group).forEach(f=>{const o=node('option',f.name);o.value=f.id;optgroup.append(o);});select.append(optgroup);
    });
    const requested=new URLSearchParams(location.search).get('diagnosis');
    if(families.some(f=>f.id===requested))select.value=requested;
    byId('scope').textContent=families.length+' diagnosis families and presentations · '+families.reduce((n,f)=>n+f.targets.length,0)+' adaptable targets';
    select.addEventListener('change',()=>{drawFamily();const url=new URL(location.href);url.searchParams.set('diagnosis',select.value);history.replaceState(null,'',url);});
    fieldIds.forEach(id=>byId(id).addEventListener('input',refresh));
    byId('copy').addEventListener('click',async()=>{
      try{await navigator.clipboard.writeText(planText());byId('feedback').textContent=preparationMessage();}
      catch{byId('output').parentElement.open=true;byId('feedback').textContent='Clipboard access is unavailable. Select and copy the wording in the preview below.';}
    });
    byId('print').addEventListener('click',()=>{byId('print-plan').textContent=planText();window.print();});
    window.addEventListener('beforeprint',()=>{byId('print-plan').textContent=selected.size?planText():'Treatment planning menu\n\nChoose one or more targets, then use Print / Save PDF in Build the plan.';});
    byId('clear').addEventListener('click',()=>{selected.clear();fieldIds.forEach(id=>byId(id).value='');drawFamily();drawSelected();byId('feedback').textContent='Plan cleared.';});
    drawFamily();drawSelected();
  }catch(e){byId('diagnosis').disabled=true;byId('scope').textContent='The menu could not load. Reload this page to try again.';byId('copy').disabled=byId('print').disabled=true;}
}
init();
