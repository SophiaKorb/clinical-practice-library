/* Canonical CPL finder interface. Offline deterministic search; no PHI or external processing. */
(function(){
'use strict';
if(typeof document==='undefined')return;
var engine=globalThis.CPLFinderLab,data=globalThis.CPLFinderData;
if(!engine||!data){return;}
var by=id=>document.getElementById(id);
var catalog=engine.index(data.resources),limit=10;
var keys=['scope','population','need','audience'],advKeys=['diagnosis','symptom','function','intervention','stage','task','step','community','place','community-topic'];
var state={q:'',scope:'',population:'',need:'',audience:'',advanced:{}};
var humanRole={clinician:'Clinician',trainee:'Trainee',case_manager:'Case manager',school_team:'School team',client:'Client',caregiver:'Caregiver'};
var humanPop={birth5:'Birth–5',children:'School-age/teen indexed',teens:'School-age/teen indexed',adults:'Adult'};
var el=(tag,cls,txt)=>{
 var x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x;
};
function appendLabel(container,txt,style){var span=el('span','chip'+(style?' '+style:''),txt);container.appendChild(span);}
function paramsState(){
 var p=new URLSearchParams(location.search),out={q:(p.get('q')||'').slice(0,160),scope:'',population:'',need:'',audience:'',advanced:{},legacyRole:''};
 for(var key of keys){
  var input=by('lab-'+key),value=p.get(key)||'';
  out[key]=input&&[...input.options].some(o=>o.value===value)?value:'';
 }
 // Preserve existing CPL links ?age=children, ?age=birth5 and ?child=1.
 if(!out.population){
  var previous=p.get('age')||(p.get('child')==='1'?'children':'');
  if([...by('lab-population').options].some(o=>o.value===previous))out.population=previous;
 }
 // Historical role links used 5 catalog roles. Client/caregiver has no
 // verified one-to-one mapping to the new separated audience controls.
 var roleMap={'Clinician':'clinician','Graduate trainee':'trainee',
  'Staff / case manager':'case_manager','School team':'school_team'};
 var previousRole=p.get('role')||'';
 if(!out.audience&&roleMap[previousRole])out.audience=roleMap[previousRole];
 if(!out.audience&&previousRole==='Client / caregiver')out.legacyRole=previousRole;
 for(var a of advKeys){
  var select=by('lab-'+a),v=p.get(a)||'';
  out.advanced[a]=select&&[...select.options].some(o=>o.value===v)?v:'';
 }
 return out;
}
function getParams(){
 var params=new URLSearchParams();
 if(state.q)params.set('q',state.q);
 for(var key of keys)if(state[key])params.set(key,state[key]);
 for(var a of advKeys)if(state.advanced[a])params.set(a,state.advanced[a]);
 if(state.legacyRole)params.set('role',state.legacyRole);
 return params;
}
function syncInputs(){
 by('lab-q').value=state.q;
 for(var key of keys)by('lab-'+key).value=state[key];
 for(var a of advKeys)by('lab-'+a).value=state.advanced[a]||'';
 if(Object.entries(state.advanced).some(([k,v])=>v&&!['community','community-topic'].includes(k)))by('lab-advanced').open=true;
}
function cardFor(group){
 var item=group.best.item,article=el('article','result-card');
 var title=el('h3'),a=el('a',null,item.title);a.href=item.url;title.appendChild(a);article.appendChild(title);
 var chips=el('div','chips');appendLabel(chips,item.typeLabel);
 if(item.format==='PDF')appendLabel(chips,'PDF','chip--neutral');
 if(item.language==='es')appendLabel(chips,'Español','chip--neutral');
 if(item.isExternal)appendLabel(chips,'Publisher reference','chip--neutral');
 if(item.original.communityCollection)appendLabel(chips,item.original.communityCollection==='transition-age'?'TAY community':'Family community guide','chip--neutral');
 if(item.population.length===1)appendLabel(chips,humanPop[item.population[0]]||item.population[0],'chip--neutral');
 if(item.acrossAges)appendLabel(chips,'Adapt for the person','chip--neutral');
 article.appendChild(chips);
 article.appendChild(el('p',null,item.description));
 if(item.original.providerEvidenceUrl){
  var evidence=el('p','match-explain'),source=el('a',null,'Official provider details');source.href=item.original.providerEvidenceUrl;source.target='_blank';source.rel='noopener noreferrer';evidence.appendChild(source);article.appendChild(evidence);
 }
 if(item.original.referralCaution)article.appendChild(el('p','caveat',item.original.referralCaution));
 var roles=item.audience.map(r=>humanRole[r]).filter(Boolean);
 if(roles.length)article.appendChild(el('p','match-explain',(item.audienceAggregated?'Collection includes formats for: ':'Indexed for: ')+roles.join(' · ')));
 if(item.audienceUndifferentiated)article.appendChild(el('p','match-explain','Audience not fully distinguished in the original catalog.'));
 if(item.populationNote && state.population)article.appendChild(el('p','match-explain',item.populationNote));
 if(state.q)article.appendChild(el('p','match-explain','Matched by: '+group.best.reason+'.'));
 if(group.allFamily.length>1){
  var d=el('details','family'),s=el('summary',null,'View '+(group.allFamily.length-1)+' more formats in this collection');
  d.appendChild(s);
  var list=el('ul');
  for(var member of group.allFamily){
   if(member.url===item.url)continue;
   var li=el('li'),link=el('a',null,member.title.replace(/^.*? — /,''));
   link.href=member.url;li.appendChild(link);list.appendChild(li);
  }
  d.appendChild(list);
  d.appendChild(el('p','caveat','These additional formats may not match your selected audience or filters.'));
  article.appendChild(d);
 }
 return article;
}
function render(changeURL){
 var result=engine.search(catalog,state),results=by('lab-results');
 results.replaceChildren();
 var visible=result.groups.slice(0,limit);
 for(var group of visible)results.appendChild(cardFor(group));
 by('lab-empty').hidden=result.groups.length>0;
 by('lab-more').hidden=result.groups.length<=limit;
 by('lab-status').textContent=result.groups.length+' groups · '+result.matches+' matching resources'+(result.groups.length>limit?' · showing '+visible.length+' groups':'');
 if(state.q&&!result.hasDirect && result.groups.length)by('lab-status').textContent+=' · related terms';
 var num=keys.filter(k=>!!state[k]).length+advKeys.filter(k=>!!state.advanced[k]).length+(state.legacyRole?1:0);
 by('active-filters').textContent=num?num+' active filter'+(num===1?'':'s')+(state.legacyRole?' · Legacy client/caregiver audience':''):'';
 if(changeURL){var p=getParams();history.replaceState(null,'',location.pathname+(p.size?'?'+p.toString():'')+location.hash);}
}
function update(){limit=10;render(true);}
function reset(){state={q:'',scope:'',population:'',need:'',audience:'',advanced:{},legacyRole:''};syncInputs();update();}
for(var key of advKeys){
 var sel=by('lab-'+key);
 for(var value of data.facets[key]||[]){var opt=el('option',null,value);opt.value=value;sel.appendChild(opt);}
 sel.addEventListener('change',function(k){return function(){state.advanced[k]=by('lab-'+k).value;update();};}(key));
}
state=paramsState();syncInputs();
by('lab-form').addEventListener('submit',function(e){e.preventDefault();state.q=by('lab-q').value.slice(0,160);update();});
by('lab-q').addEventListener('input',function(){state.q=this.value.slice(0,160);update();});
for(var key of keys)by('lab-'+key).addEventListener('change',function(k){return function(){state[k]=by('lab-'+k).value;if(k==='audience')state.legacyRole='';update();};}(key));
by('lab-clear').addEventListener('click',reset);
by('lab-recover').addEventListener('click',function(){state.scope='';state.population='';state.need='';state.audience='';state.advanced={};state.legacyRole='';syncInputs();update();by('lab-q').focus();});
by('lab-more').addEventListener('click',function(){limit+=10;render(false);});
document.querySelectorAll('[data-example]').forEach(button=>button.addEventListener('click',function(){state.q=button.getAttribute('data-example');syncInputs();update();by('lab-q').focus();}));
addEventListener('popstate',function(){state=paramsState();syncInputs();limit=10;render(false);});
render(false);
})();