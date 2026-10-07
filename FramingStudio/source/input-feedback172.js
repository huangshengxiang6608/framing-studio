// Presentation only: rejected edits never change the stored model.
const InputFeedback172=(()=>{
 let current=null,serial=0;
 const editable=e=>e?.matches?.('input:not([type=checkbox]):not([type=radio]):not([type=file]):not([readonly]),select,textarea');
 function number(value){if(value===null||value===undefined||value==='')return '';const n=Number(value);return Number.isFinite(n)?String(Number(n.toPrecision(12))):String(value);}
 function capture(){
  const e=current||document.activeElement;if(!editable(e))return null;
  const attributes=[...e.attributes].filter(a=>a.name.startsWith('data-')&&!['data-input-state','data-feedback172','data-model-value172'].includes(a.name));
  const selector=e.id?'#'+CSS.escape(e.id):e.tagName.toLowerCase()+attributes.map(a=>'['+CSS.escape(a.name)+'="'+CSS.escape(a.value)+'"]').join('');
  if(!e.id&&!attributes.length)return null;
  return {selector,value:e.value,description:e.getAttribute('aria-describedby')||''};
 }
 function clear(e){
  if(!e?.dataset?.feedback172)return;
  const id=e.dataset.feedback172;document.getElementById(id)?.remove();
  const rest=(e.getAttribute('aria-describedby')||'').split(/\s+/).filter(v=>v&&v!==id);
  if(rest.length)e.setAttribute('aria-describedby',rest.join(' '));else e.removeAttribute('aria-describedby');
  e.removeAttribute('aria-invalid');delete e.dataset.feedback172;
 }
 function reject(snapshot,message){
  if(!snapshot)return;const matches=document.querySelectorAll(snapshot.selector);if(matches.length!==1)return;
  const e=matches[0];clear(e);e.value=snapshot.value;
  const note=document.createElement('span'),id='input-error172-'+(++serial);
  note.id=id;note.className='input-error172';note.setAttribute('role','alert');note.textContent=message+'；此输入尚未应用。';
  e.dataset.feedback172=id;e.setAttribute('aria-invalid','true');e.setAttribute('aria-describedby',[snapshot.description,id].filter(Boolean).join(' '));e.after(note);
  e.focus({preventScroll:true});
 }
 function ready(){const e=document.querySelector('[data-feedback172][aria-invalid=true]');if(e){e.focus({preventScroll:false});return false;}return true;}
 if(typeof document!=='undefined'){
  document.addEventListener('change',e=>{if(!editable(e.target))return;current=e.target;queueMicrotask(()=>{if(current===e.target)current=null;});},true);
  document.addEventListener('input',e=>clear(e.target),true);
 }
 return {number,capture,reject,clear,ready};
})();
if(typeof module!=='undefined')module.exports=InputFeedback172;
