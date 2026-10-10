/* Original practice interactions; no storage, network submission or clinical scoring. */
(function(){
 function feedbackText(button){return button.getAttribute('data-feedback')||'';}
 function select(button,buttons,output){buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));output.textContent=feedbackText(button);}
 function clear(areas,buttons,outputs){areas.forEach(x=>x.value='');buttons.forEach(x=>x.setAttribute('aria-pressed','false'));outputs.forEach(x=>x.textContent='Choose an option to review the reasoning. This does not score clinical competence.');}
 const api={feedbackText,select,clear};if(typeof module!=='undefined')module.exports=api;
 if(typeof document==='undefined')return;
 document.querySelectorAll('.case-options').forEach(group=>{const buttons=[...group.querySelectorAll('[data-feedback]')];const output=document.querySelector('.case-feedback');buttons.forEach(button=>{button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>select(button,buttons,output));});});
 document.querySelectorAll('[data-clear]').forEach(b=>b.addEventListener('click',()=>{clear([...document.querySelectorAll('textarea')],[...document.querySelectorAll('[data-feedback]')],[...document.querySelectorAll('.case-feedback')]);}));
 document.querySelectorAll('[data-print]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('details').forEach(x=>x.open=true);window.print();}));
})();
