(function(){
const supports={language:'Show one step and confirm meaning through the preferred response mode. Review comprehension and independence; do not infer a language diagnosis from one trial.',skill:'Offer explicit instruction, modeling, and supported practice alongside access supports. Review accuracy and learning over time.',overload:'Reduce competing input, offer predictable steps and a real pause. Review participation and support burden; investigate pain or medical changes when indicated.',worry:'Validate uncertainty and clarify the first step. With a trained clinician, distinguish useful access from avoidance or repeated reassurance.'};
const levels=['Keep what helps; offer choice.', 'Notice an early signal; ask what would help.', 'Reduce language and competing demands; offer a pause.', 'Pause the task; use agreed support and check safety.', 'Reduce stimulation; involve the agreed support person. Avoid debate.', 'If danger or urgent medical concerns are present, activate the local response pathway now.'];
const body={head:'Head: pressure, warmth, buzzing—or something else? You can skip this.',chest:'Chest: tight, fast, heavy—or something else? New or severe symptoms need medical attention.',belly:'Belly: fluttery, tense, empty—or something else? There is no fixed emotional meaning.',hands:'Hands: shaky, clenched, warm—or something else? What support would you choose?',unsure:'Not sure is a complete answer. Try external noticing or pause.'};
if(typeof module!=='undefined')module.exports={supports,levels,body};
if(typeof document==='undefined')return;
const by=id=>document.getElementById(id);
function toggle(id,cls){by(id).addEventListener('click',()=>{const on=document.body.classList.toggle(cls);by(id).setAttribute('aria-pressed',String(on));});}
toggle('client-view','client-view');toggle('contrast','high-contrast');by('print').addEventListener('click',()=>window.print());
const showBarrier=()=>by('barrier-result').textContent=supports[by('barrier').value];by('barrier').addEventListener('change',showBarrier);showBarrier();
document.querySelectorAll('[data-level]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-level]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));by('scale-result').textContent=levels[Number(btn.dataset.level)];}));
const bodyControls=[...document.querySelectorAll('[data-body]')];
function selectBody(region){
  bodyControls.forEach(control=>control.setAttribute('aria-pressed',String(control.dataset.body===region)));
  by('body-result').textContent=body[region];
}
bodyControls.forEach(btn=>{
  btn.setAttribute('aria-pressed','false');
  const activate=()=>selectBody(btn.dataset.body);
  btn.addEventListener('click',activate);
  if(btn.tagName.toLowerCase()==='circle')btn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});
});
document.querySelectorAll('[data-choice]').forEach(btn=>btn.addEventListener('click',()=>{by('choice-result').textContent='You chose: '+btn.dataset.choice+'. Confirm together whether this is helpful and available. You can change your mind.';}));
by('example').addEventListener('click',()=>{const ids=['before','behavior','after','trial'];if(ids.some(id=>by(id).value.trim())){by('map-status').textContent='Example not loaded: clear your map first to avoid overwriting it.';return;}['Three spoken instructions in a loud room','Pushed worksheet away; said no','Adult removed work and spoke quietly','Model one step in a quieter space; review starts, accuracy, distress, and support needed'].forEach((v,i)=>by(ids[i]).value=v);by('map-status').textContent='Fictional example loaded. Function remains a hypothesis.';});
by('clear-map').addEventListener('click',()=>{['before','behavior','after','trial'].forEach(id=>by(id).value='');by('map-status').textContent='Map cleared.';});
})();