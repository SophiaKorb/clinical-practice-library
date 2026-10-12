/* Two presentations, one course. No analytics and no learning data stored. */
(function(){
  const key='cpl-dsm-foundations-view';
  function start(){
    const buttons=[...document.querySelectorAll('[data-experience-choice]')];
    const status=document.getElementById('experience-status');
    if(buttons.length!==2||!status)return;
    function apply(view,persist){
      const chosen=view==='clarity'?'clarity':'studio';
      document.body.dataset.experience=chosen;
      buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.experienceChoice===chosen)));
      status.textContent=chosen==='studio'
        ?'Visual studio: conceptual maps and editorial illustrations, with the full course and all practice questions.'
        :'Clarity: the same complete lessons and questions in a calmer, linear reading layout.';
      if(persist){try{localStorage.setItem(key,chosen)}catch(_e){/* storage optional */}}
    }
    let saved=null;
    try{saved=localStorage.getItem(key)}catch(_e){/* private browsing is supported */}
    const request=new URLSearchParams(window.location.search).get('view');
    apply(request==='studio'||request==='clarity'?request:saved,false);
    buttons.forEach(button=>button.addEventListener('click',()=>apply(button.dataset.experienceChoice,true)));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
  else start();
})();
