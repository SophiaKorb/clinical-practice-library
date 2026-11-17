/* Diagnose-based COMPLETE DISCOVERY navigation using existing catalog tags.
   Does not reclassify diagnoses, validate treatment, or replace individual sources. */
(function(){
'use strict';
if(typeof document==='undefined')return;
var data=globalThis.CPLFinderData;if(!data||!Array.isArray(data.resources))return;
var known=data.facets.diagnosis||[];
var selected=new URLSearchParams(location.search).get('topic')||'';
if(!known.includes(selected))selected='';
var subtitle={
 'ADHD':'Attention, executive functioning, access and everyday supports',
 'Autism':'Communication, sensory access, autonomy and participation',
 'Anxiety / OCD':'Fear, uncertainty, avoidance and collaborative intervention',
 'Depression':'Mood, reward, energy and daily functioning',
 'Trauma / dissociation':'Safety, memory, regulation, orientation and relationships',
 'Learning disorders':'Literacy, writing, mathematics and educational access',
 'Psychosis / bipolar':'Mood episodes, sleep changes, voices and coordinated care',
 'Substance use':'Safety, function, reducing harm and support',
 'Persistent conflict':'Function, safety, family and school supports',
 'Eating disorders':'Medical safety, eating function and interdisciplinary care',
 'Tic / repetitive behavior conditions':'Tics, body-focused patterns and tailored supports',
 'Intellectual disability':'Communication, consent, access and supported choice',
 'Sleep conditions':'Sleep health, differential questions and functional supports',
 'Grief / bereavement':'Meaning, connection, loss and everyday functioning'
};
var extra={
 'ADHD':[
  ['/resources/diagnoses/adult-adhd-collection/index.html','Adult ADHD: complete clinical and practical collection','Assessment, structured CBT, daily functioning, interactive map and print-ready tools'],
  ['/resources/diagnoses/adult-adhd.html','Adult ADHD: comprehensive clinical and practical guide','Assessment, treatment, daily living, relationships, accommodations and every relevant CPL tool'],
  ['/resources/therapy/neurodevelopmental-executive-function-start-here.html','Psychotherapy access and neurodevelopmental adaptations','Cross-diagnostic: adapt therapy demands, communication and sensory access'],
  ['/resources/therapy/neurodevelopmental-executive-function-practical-toolkit.html','Executive-function practical toolkit','Cross-diagnostic: barrier mapping and supported participation'],
  ['/resources/handouts/making-plans-easier-to-start-and-finish.html','Making Plans Easier to Start and Finish','Adult-facing education for planning, memory and follow-through'],
  ['/resources/handouts/task-launch-map.html','Task Launch Map','Worksheet for making task initiation more manageable'],
  ['/resources/downloads/task-launch-map-fillable.pdf','Task Launch Map — fillable PDF','Printable and fillable task initiation companion'],
  ['/resources/handouts/when-hygiene-tasks-are-hard.html','When Hygiene Tasks Are Hard','Cross-diagnostic: identify sensory, task and access barriers'],
  ['/resources/handouts/my-personal-care-plan.html','My Personal Care Plan','Cross-diagnostic: practical routine planning worksheet'],
  ['/resources/handouts/my-transition-map.html','My Transition Map','Cross-diagnostic: stopping one activity and starting another'],
  ['/resources/handouts/supporting-attention-and-learning-at-home.html','Supporting Attention and Learning at Home','Caregiver and child-facing strategies for attention and task access'],
  ['/resources/handouts/after-school-is-a-landing-not-a-launch.html','After School Is a Landing, Not a Launch','Cross-diagnostic caregiver guidance about recovery after school demands'],
  ['/resources/handouts/my-after-school-reset-plan.html','My After-School Reset Plan','Child-and-family worksheet for recovery and transitions'],
  ['/resources/handouts/helping-chores-go-more-smoothly.html','Helping Chores Go More Smoothly','Cross-diagnostic support for building household skills'],
  ['/resources/handouts/my-weekly-chore-chart.html','My Weekly Chore Chart','Printable visual organization tool for household routines'],
  ['/resources/therapy/neurodevelopment-child-behavior-parenting-resource-guide.html','Neurodevelopment, Child Behavior & Parenting resource guide','Curated external references: assessment, ADHD, parenting and function-linked support']
 ],
 'Autism':[
  ['/resources/therapy/communication-supports-toolkit.html','Communication Supports Toolkit','Cross-diagnostic communication choices, access and participation'],
  ['/resources/therapy/neurodevelopmental-executive-function-start-here.html','Adapt psychotherapy for neurodevelopmental access','Clinical planning for communication, sensory load and executive demands'],
  ['/resources/handouts/autism-family-cheat-sheet.html','Autism — A Family Cheat Sheet','Family-oriented explanation of autism and support'],
  ['/resources/handouts/friendship-peer-safety-family-guide.html','Friendship & Peer Safety family guide','Autism-related peer inclusion, safety and friendship']
 ],
 'Anxiety / OCD':[
  ['/resources/therapy/anxiety-exposure-ocd-start-here.html','Anxiety, Exposure & OCD','Formulation-first treatment navigation'],
  ['/resources/handouts/grounding.html','Grounding','Cross-diagnostic, optional orientation support']
 ],
 'Depression':[
  ['/resources/handouts/making-plans-easier-to-start-and-finish.html','Making Plans Easier to Start and Finish','Cross-diagnostic functional support']
 ],
 'Learning disorders':[
  ['/resources/therapy/neurodevelopmental-executive-function-practical-toolkit.html','Access and task-demand toolkit','Cross-diagnostic functional adaptation']
 ],
 'Persistent conflict':[
  ['/resources/handouts/abc-observation-guide.html','ABC Observation Guide','Functional observation without guessing motive']
 ]
};
function elem(tag,cls,txt){var x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x;}
function link(href,title){var a=elem('a',null,title);a.href=href;return a;}
function groupFor(r){
 var u=r.url||'',title=r.title||'';
 if(u.includes('/clinical-topics/'))return 'Clinical topic collections and formats';
 if(u.includes('/downloads/')||u.includes('/handouts/'))return 'Worksheets, handouts and PDFs';
 if(u.includes('/school/')||u.startsWith('/guides/'))return 'School, family and learning';
 if(u.includes('/assessment/')||u.includes('/clinical-depth/')||u.includes('/therapy/'))return 'Assessment and professional practice';
 if(r.externalUrl||u.includes('#ext-'))return 'External and publisher references';
 return 'Other directly indexed resources';
}
var groupsOrder=['Clinical topic collections and formats','Assessment and professional practice','Worksheets, handouts and PDFs','School, family and learning','External and publisher references','Other directly indexed resources'];
function renderTopics(){
 var grid=document.getElementById('topic-grid');if(!grid)return;
 var select=document.getElementById('topic-select');
 for(var t of known){
  var count=data.resources.filter(r=>(r.tags&&r.tags.diagnosis||[]).includes(t)).length;
  var opt=elem('option',null,t+' · '+count+' indexed');opt.value=t;select.appendChild(opt);
  var card=elem('article','topic-choice'),h=elem('h3');
  h.appendChild(link('?topic='+encodeURIComponent(t),t));
  card.appendChild(h);card.appendChild(elem('p',null,count+' directly tagged resources'));
  grid.appendChild(card);
 }
 select.value=selected;
 select.addEventListener('change',function(){location.href='?topic='+encodeURIComponent(select.value);});
}
function renderResourceCard(r){
 var li=elem('li'),a=link(r.url,r.title);
 li.appendChild(a);
 var parts=[],stages=(r.tags&&r.tags.stage)||[],roles=(r.tags&&r.tags.role)||[];
 if(stages.length)parts.push(stages.join(' / '));
 if(roles.length)parts.push(roles.join(' · '));
 if((r.url||'').endsWith('.pdf'))parts.push('PDF');
 if(r.externalUrl)parts.push('Publisher reference');
 if(parts.length)li.appendChild(elem('p','resource-meta',parts.join(' · ')));
 return li;
}
function renderSelected(){
 var shown=document.getElementById('topic-page'),overview=document.getElementById('topic-overview');
 if(!selected){shown.hidden=true;overview.hidden=false;return;}
 shown.hidden=false;overview.hidden=true;
 document.getElementById('adhd-focus').hidden=(selected!=='ADHD');
 document.title=selected+' — Full resource index | Clinical Practice Library';
 document.getElementById('topic-name').textContent=selected;
 document.getElementById('topic-lede').textContent=subtitle[selected]||'Clinical topic resources';
 var direct=data.resources.filter(r=>(r.tags&&r.tags.diagnosis||[]).includes(selected));
 document.getElementById('topic-stat').textContent=direct.length+' directly indexed resources';
 var byGroup=new Map();
 for(var r of direct){var k=groupFor(r);if(!byGroup.has(k))byGroup.set(k,[]);byGroup.get(k).push(r);}
 var root=document.getElementById('direct-groups');
 for(var name of groupsOrder){
  var records=byGroup.get(name)||[];if(!records.length)continue;
  var section=elem('section','resource-group'),h=elem('h3',null,name);
  var ul=elem('ul','resource-list');
  records.sort((a,b)=>a.title.localeCompare(b.title));
  for(var r of records)ul.appendChild(renderResourceCard(r));
  section.appendChild(h);section.appendChild(ul);root.appendChild(section);
 }
 var supplemental=document.getElementById('related-section'),list=document.getElementById('related-list');
 var directUrls=new Set(direct.map(r=>r.url)),extras=(extra[selected]||[]).filter(x=>!directUrls.has(x[0]));
 if(extras.length){
  for(var [url,title,reason] of extras){
   var li=elem('li');li.appendChild(link(url,title));li.appendChild(elem('span',null,reason));list.appendChild(li);
  }
 }else supplemental.hidden=true;
 document.getElementById('topic-find').href='/resources/clinical-resource-finder.html?q='+encodeURIComponent(selected);
 var ex=document.getElementById('topic-find');ex.textContent='Search the rest of the CPL for '+selected+' and related questions';
}
renderTopics();renderSelected();
})();