/* Original practice interactions; no storage, network submission or clinical scoring. */
(function(){
 function feedbackText(button){return button.getAttribute('data-feedback')||'';}
 function select(button,buttons,output){buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));output.textContent=feedbackText(button);}
 const api={feedbackText,select};if(typeof module!=='undefined')module.exports=api;
 if(typeof document==='undefined')return;
 document.querySelectorAll('.case-options').forEach(group=>{const buttons=[...group.querySelectorAll('[data-feedback]')];const output=document.querySelector('.case-feedback');buttons.forEach(button=>{button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>select(button,buttons,output));});});
 document.querySelectorAll('[data-clear]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('textarea').forEach(x=>x.value='');}));
 document.querySelectorAll('[data-print]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('details').forEach(x=>x.open=true);window.print();}));
})();
