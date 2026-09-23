let allResources=[];let taxonomy=null;let filteredResources=[];let pathways=[];let showAllPathways=false;let showAllResources=false;

const q=s=>document.querySelector(s);
const qa=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const unique=a=>[...new Set(a.filter(Boolean))].sort((x,y)=>String(x).localeCompare(String(y)));

function optionize(sel,vals){vals.forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;sel.appendChild(o)})}
function searchText(r){return Object.values(r).flatMap(v=>Array.isArray(v)?v:[v]).filter(v=>["string","number"].includes(typeof v)).join(" ").toLowerCase()}
function filters(){return{term:q("#search").value.trim().toLowerCase(),section:q("#sectionFilter").value,type:q("#typeFilter").value,domain:q("#domainFilter").value,priority:q("#priorityFilter").value,evidence:q("#evidenceFilter").value,sort:q("#sortBy").value}}

function jumpToLibrary(){q("#library").scrollIntoView({behavior:"smooth",block:"start"})}
function setSearch(term){
  q("#search").value=term;
  q("#heroSearch").value=term;
  showAllResources=false;
  apply();
  jumpToLibrary();
}
function setSection(section){
  q("#sectionFilter").value=section;
  showAllResources=false;
  apply();
  jumpToLibrary();
}
function setType(type){
  q("#typeFilter").value=type;
  showAllResources=false;
  apply();
  jumpToLibrary();
}


function renderVisualizations(){
  const total=allResources.length;
  const counts={
    research:allResources.filter(r=>r.resourceType==="Research article").length,
    assessment:allResources.filter(r=>r.resourceType==="Assessment / screening tool").length,
    school:allResources.filter(r=>r.resourceType==="School support").length
  };
  const donut=q("#resourceDonut");
  if(donut){
    const p1=counts.research/total*100;
    const p2=p1+counts.assessment/total*100;
    donut.style.background="conic-gradient(var(--green) 0 "+p1+"%, var(--gold) "+p1+"% "+p2+"%, #b98f86 "+p2+"% 100%)";
    donut.setAttribute("aria-label",counts.research+" research articles, "+counts.assessment+" assessment tools, and "+counts.school+" school-support guides");
  }
  if(q("#donutTotal"))q("#donutTotal").textContent=total;

  const legend=q("#mixLegend");
  if(legend){
    const rows=[
      {label:"Research core",count:counts.research,type:"Research article",color:"var(--green)"},
      {label:"Assessment & screening",count:counts.assessment,type:"Assessment / screening tool",color:"var(--gold)"},
      {label:"School-support guides",count:counts.school,type:"School support",color:"#b98f86"}
    ];
    legend.replaceChildren(...rows.map(r=>{
      const b=document.createElement("button");b.type="button";b.className="legend-row";
      b.innerHTML='<span class="legend-dot" style="background:'+r.color+'"></span><span class="legend-name">'+esc(r.label)+'</span><span class="legend-count">'+r.count+'</span>';
      b.addEventListener("click",()=>setType(r.type));return b;
    }));
  }

  const topicDefs=[
    {label:"Anxiety & mood",re:/anxiety|depress|mood/i},
    {label:"Autism & sensory",re:/autis|sensory|social communication/i},
    {label:"ADHD & executive function",re:/adhd|executive function|inattention|attention/i},
    {label:"Trauma & dissociation",re:/trauma|ptsd|dissoci/i},
    {label:"Therapy & treatment",re:/psychotherapy|therapy|cbt|dbt|treatment/i},
    {label:"Parenting & family",re:/parent|family|caregiver/i}
  ].map(d=>({...d,count:allResources.filter(r=>d.re.test(searchText(r))).length}))
   .sort((a,b)=>b.count-a.count);
  const maxTopic=Math.max(...topicDefs.map(d=>d.count),1);
  const topicHost=q("#topicBars");
  if(topicHost){
    topicHost.replaceChildren(...topicDefs.map(d=>{
      const row=document.createElement("div");row.className="topic-row";
      row.innerHTML='<span class="topic-name">'+esc(d.label)+'</span><span class="topic-track"><span class="topic-fill" style="width:'+(d.count/maxTopic*100)+'%"></span></span><span class="topic-count">'+d.count+'</span>';
      return row;
    }));
  }

  const research=allResources.filter(r=>r.resourceType==="Research article"&&Number(r.year));
  const eras=[
    {label:"1970s–80s",sub:"foundations",min:0,max:1989},
    {label:"1990s–2000s",sub:"core literature",min:1990,max:2009},
    {label:"2010–2025",sub:"recent base",min:2010,max:2025},
    {label:"2026",sub:"current refresh",min:2026,max:2026}
  ].map(e=>({...e,count:research.filter(r=>Number(r.year)>=e.min&&Number(r.year)<=e.max).length}));
  const maxEra=Math.max(...eras.map(e=>e.count),1);
  const eraHost=q("#eraBars");
  if(eraHost){
    eraHost.replaceChildren(...eras.map(e=>{
      const col=document.createElement("div");col.className="era-col";
      const height=Math.max(8,e.count/maxEra*100);
      col.innerHTML='<div class="era-bar-space"><div class="era-bar" style="height:'+height+'%"><strong>'+e.count+'</strong></div></div><div class="era-label">'+esc(e.label)+'</div><div class="era-sub">'+esc(e.sub)+'</div>';
      return col;
    }));
  }
}

function renderGuideCards(){
  const host=q("#guideCards");if(!host)return;
  const guides=allResources.filter(r=>r.collection==="Barrier Support School Access Toolkit");
  host.replaceChildren(...guides.map((r,i)=>{
    const card=document.createElement("article");card.className="guide-card";
    const body=document.createElement("div");
    body.innerHTML='<span class="guide-index">Guide '+String(i+1).padStart(2,"0")+'</span><h3>'+esc(r.domain)+'</h3><p>'+esc("Plain-language help connecting observable school barriers with supports that can actually be implemented.")+'</p>';
    const actions=document.createElement("div");actions.className="guide-actions";
    if(r.pageUrl){const a=document.createElement("a");a.className="primary-link";a.href=r.pageUrl;a.textContent="Open guide";actions.appendChild(a)}
    const b=document.createElement("button");b.type="button";b.className="text-button";b.textContent="Related resources";b.addEventListener("click",()=>setSearch(r.domain));actions.appendChild(b);
    card.append(body,actions);return card;
  }));
}

function renderPathways(){
  const host=q("#pathwayCards");if(!host)return;
  const shown=showAllPathways?pathways:pathways.slice(0,4);
  host.replaceChildren(...shown.map(p=>{
    const d=document.createElement("details");d.className="pathway-card";
    const s=document.createElement("summary");s.textContent=p.clinicalQuestion+(p.tier?" · "+p.tier:"");d.appendChild(s);
    const body=document.createElement("div");body.className="pathway-body";
    [["Look at",p.components],["Decision point",p.decisionPoint],["Next step",p.nextStep],["Time",p.burden]].forEach(x=>{if(x[1]){const row=document.createElement("div");row.innerHTML="<strong>"+esc(x[0])+"</strong><span>"+esc(x[1])+"</span>";body.appendChild(row)}});
    d.appendChild(body);return d;
  }));
  q("#showAllPathways").textContent=showAllPathways?"Show fewer pathways":"Show all "+pathways.length+" pathways";
}

function apply(){
  const f=filters();
  filteredResources=allResources.filter(r=>{
    if(f.term&&!searchText(r).includes(f.term))return false;
    if(f.section&&r.section!==f.section)return false;
    if(f.type&&r.resourceType!==f.type)return false;
    if(f.domain&&r.domain!==f.domain)return false;
    if(f.priority&&r.priority!==f.priority)return false;
    if(f.evidence&&r.evidenceStrength!==f.evidence)return false;
    return true
  });
  if(f.sort==="title")filteredResources.sort((a,b)=>a.title.localeCompare(b.title));
  else if(f.sort==="newest")filteredResources.sort((a,b)=>(b.year||0)-(a.year||0)||a.title.localeCompare(b.title));
  else if(f.sort==="domain")filteredResources.sort((a,b)=>(a.domain||"").localeCompare(b.domain||"")||a.title.localeCompare(b.title));
  else filteredResources.sort((a,b)=>a.collection!==b.collection?a.collection.localeCompare(b.collection):(a.coreNumber||9999)-(b.coreNumber||9999)||a.title.localeCompare(b.title));
  render();
}

function addDetail(dl,label,value){
  if(value==null||value===""||(Array.isArray(value)&&!value.length))return;
  const dt=document.createElement("dt"),dd=document.createElement("dd");
  dt.textContent=label;dd.textContent=Array.isArray(value)?value.join(", "):value;dl.append(dt,dd)
}

function summaryFor(r){
  if(r.resourceType==="Assessment / screening tool"){
    const bits=[r.constructFocus,r.clinicalPurpose&&r.clinicalPurpose[0],r.interpretiveLimit].filter(Boolean);
    return bits.join(" · ")||"Assessment decision-support reference."
  }
  if(r.resourceType==="School support")return r.caveat||"Plain-language school access resource.";
  return r.caveat||r.evidenceRole||r.notes||"Curated clinical reference."
}

function card(r){
  const n=q("#cardTemplate").content.firstElementChild.cloneNode(true);n.id=r.id;
  const ps=n.querySelector(".pills");
  [r.resourceType,r.priority,r.evidenceStrength].filter(Boolean).forEach(v=>{const p=document.createElement("span");p.className="pill"+(String(v).startsWith("P")?" priority-"+v:"");p.textContent=v;ps.appendChild(p)});
  n.querySelector(".card-title").textContent=r.title;
  n.querySelector(".card-subtitle").textContent=[r.abbreviation,r.domain,r.year].filter(Boolean).join(" · ");
  n.querySelector(".card-summary").textContent=summaryFor(r);

  const dl=n.querySelector(".details-grid");
  [["Collection",r.section],["Topic",r.domain],["Jurisdiction",r.jurisdiction],["Evidence role",r.evidenceRole],["Clinical caveat",r.caveat],["Core status",r.coreStatus],["Access",r.accessStatus],["Canonical filename",r.canonicalFilename],["Next action",r.nextAction],["Construct / focus",r.constructFocus],["Age range",r.ageRange],["Clinical purpose",r.clinicalPurpose],["Respondent",r.respondent],["Telehealth",r.telehealth],["Repeat measure",r.repeatMeasure],["Copyright / ethics",r.copyrightCaution],["Interpretive limit",r.interpretiveLimit],["Evidence strength",r.evidenceStrength],["Outpatient utility",r.outpatientUtility],["Progress utility",r.progressUtility],["Notes",r.notes]].forEach(x=>addDetail(dl,x[0],x[1]));

  const actions=n.querySelector(".card-actions");
  if(r.pageUrl){const a=document.createElement("a");a.className="primary-link";a.href=r.pageUrl;a.textContent="Open guide";actions.appendChild(a)}
  else if(r.sourceUrl){const a=document.createElement("a");a.className="source-link";a.href=r.sourceUrl;a.target="_blank";a.rel="noopener noreferrer";a.textContent="Open source";actions.appendChild(a)}
  else{const s=document.createElement("span");s.className="card-subtitle";s.textContent="Source link pending verification";actions.appendChild(s)}

  n.querySelector(".copy-link").addEventListener("click",async e=>{
    const u=location.href.split("#")[0]+"#"+r.id;
    try{await navigator.clipboard.writeText(u);e.currentTarget.textContent="Copied";setTimeout(()=>e.currentTarget.textContent="Copy link",1200)}catch{location.hash=r.id}
  });
  return n
}

function render(){
  const active=filters();
  const hasFilter=Boolean(active.term||active.section||active.type||active.domain||active.priority||active.evidence);
  const limit=showAllResources?filteredResources.length:(hasFilter?18:12);
  const visible=filteredResources.slice(0,limit);
  q("#cards").replaceChildren(...visible.map(card));
  q("#resultSummary").textContent="Showing "+visible.length+" of "+filteredResources.length+" matching resources";
  q("#emptyState").hidden=filteredResources.length!==0;
  q("#showMoreResources").hidden=visible.length>=filteredResources.length;
  q("#showMoreResources").textContent="Show more resources";
  const chips=[active.term&&'search: “'+active.term+'”',active.section,active.type,active.domain,active.priority,active.evidence].filter(Boolean);
  q("#activeFilters").textContent=chips.length?chips.join(" · "):"No filters applied";
}

function clearAll(){
  q("#search").value="";q("#heroSearch").value="";
  ["sectionFilter","typeFilter","domainFilter","priorityFilter","evidenceFilter"].forEach(id=>q("#"+id).value="");
  q("#sortBy").value="default";showAllResources=false;apply()
}

function csv(rows){const keys=["id","section","collection","resourceType","title","year","domain","evidenceRole","coreNumber","priority","evidenceStrength","ageRange","clinicalPurpose","accessStatus","sourceUrl","nextAction"],quote=v=>'"'+String(Array.isArray(v)?v.join("; "):(v??"")).replace(/"/g,'""')+'"';return[keys.join(","),...rows.map(r=>keys.map(k=>quote(r[k])).join(","))].join("\n")}
function download(name,mime,body){const a=document.createElement("a"),u=URL.createObjectURL(new Blob([body],{type:mime}));a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),500)}

async function init(){
  try{
    const rs=await Promise.all([fetch("data/library.json"),fetch("data/taxonomy.json"),fetch("data/pathways.json")]);
    if(!rs[0].ok||!rs[1].ok||!rs[2].ok)throw new Error("Library data could not be loaded");
    const lib=await rs[0].json();taxonomy=await rs[1].json();const pathData=await rs[2].json();
    pathways=pathData.pathways||[];allResources=lib.resources||[];

    q("#totalCount").textContent=allResources.length;
    q("#researchCount").textContent=allResources.filter(r=>r.collection==="Clinical Research Core").length;
    q("#assessmentCount").textContent=allResources.filter(r=>r.collection==="Clinical Assessment Decision-Support Library").length;

    optionize(q("#sectionFilter"),unique(allResources.map(r=>r.section)));
    optionize(q("#typeFilter"),unique(allResources.map(r=>r.resourceType)));
    optionize(q("#domainFilter"),unique(allResources.map(r=>r.domain)));
    optionize(q("#evidenceFilter"),unique(allResources.map(r=>r.evidenceStrength)));

    renderGuideCards();renderPathways();renderVisualizations();

    q("#heroSearchButton").addEventListener("click",()=>setSearch(q("#heroSearch").value.trim()));
    q("#heroSearch").addEventListener("keydown",e=>{if(e.key==="Enter")setSearch(e.currentTarget.value.trim())});
    qa("[data-search]").forEach(b=>b.addEventListener("click",()=>setSearch(b.dataset.search)));
    qa("[data-section]").forEach(b=>b.addEventListener("click",()=>setSection(b.dataset.section)));
    qa("[data-type]").forEach(b=>b.addEventListener("click",()=>setType(b.dataset.type)));
    qa("[data-jump]").forEach(b=>b.addEventListener("click",()=>q(b.dataset.jump).scrollIntoView({behavior:"smooth"})));

    ["search","sectionFilter","typeFilter","domainFilter","priorityFilter","evidenceFilter","sortBy"].forEach(id=>q("#"+id).addEventListener(id==="search"?"input":"change",()=>{showAllResources=false;apply()}));
    q("#clearFilters").addEventListener("click",clearAll);
    q("#showAllPathways").addEventListener("click",()=>{showAllPathways=!showAllPathways;renderPathways()});
    q("#showMoreResources").addEventListener("click",()=>{showAllResources=true;render()});
    q("#exportCsv").addEventListener("click",()=>download("clinical-practice-library-filtered.csv","text/csv;charset=utf-8",csv(filteredResources)));
    q("#exportJson").addEventListener("click",()=>download("clinical-practice-library-filtered.json","application/json",JSON.stringify(filteredResources,null,2)));

    apply();
    if(location.hash){const el=document.getElementById(location.hash.slice(1));if(el){el.scrollIntoView();const d=el.querySelector("details");if(d)d.open=true}}
  }catch(err){
    q("#cards").innerHTML='<div class="empty"><h3>Library data did not load</h3><p>'+esc(err.message)+'</p></div>'
  }
}
init();