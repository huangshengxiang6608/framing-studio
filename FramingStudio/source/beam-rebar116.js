// Reuse the existing reinforcement fields and Save/Check path; no report rendering.
const BeamRebar116=(()=>{
 const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function decorate(h){
  const top=$('ex-top-counts'),bottom=$('ex-bottom-counts');if(!top||!bottom||$('beam-rebar116'))return;
  const model=Engine.floorModel(h.result,h.floor,h.key),beam=model.beams.find(b=>b.id===h.selected?.id&&b.kind===h.selected?.kind);if(!beam)return;
  const cb=(beam.displayKind||beam.kind)==='CB',fieldRows={top:top.closest('.row'),bottom:bottom.closest('.row'),shear:$('ex-link-dia').closest('.row'),torsion:$('ex-tor-dia').closest('.row')};
  const first=fieldRows.top,previous=first.previousElementSibling;if(previous?.tagName==='P'&&previous.textContent.includes('每面最多'))previous.remove();
  const card=document.createElement('section');card.id='beam-rebar116';card.className='beam-rebar116';card.setAttribute('aria-label','梁配筋图，点击标注修改');
  card.innerHTML='<div class="rebar-buttons116"><button type="button" data-rebar-edit="'+(cb?'bottom':'top')+'" aria-expanded="false"></button></div><svg role="img" viewBox="0 0 380 190" aria-label="梁上筋与下筋示意"><g fill="none" stroke="#315bb7" stroke-width="2"><path d="M40 12V175M340 12V175M30 44H350M30 150H350M40 174H340M180 44V30M180 150V164"/></g><text x="190" y="105" text-anchor="middle" fill="#c53645" font-size="15" data-rebar-ratio></text></svg><div class="rebar-buttons116 rebar-bottom116"><button type="button" data-rebar-edit="'+(cb?'top':'bottom')+'" aria-expanded="false"></button></div><div class="rebar-buttons116" style="margin-top:12px"><button type="button" data-rebar-edit="shear" aria-expanded="false"></button><button type="button" data-rebar-edit="torsion" aria-expanded="false"></button></div><p class="rebar-id116">'+esc(beam.displayId||beam.id)+' ('+Math.round(beam.b*1000)+' × '+Math.round(beam.d*1000)+')</p><p class="rebar-status116" aria-live="polite"></p>';
  first.before(card);
  for(const [part,row]of Object.entries(fieldRows)){
   const panel=document.createElement('div');panel.className='rebar-editor116';panel.id='rebar-editor116-'+part;panel.hidden=true;row.before(panel);panel.append(row);
   const label=document.createElement('p');label.textContent=part==='top'?'受压面配筋':part==='bottom'?'受拉面配筋':part==='shear'?'抗剪箍筋':'抗扭箍筋';panel.prepend(label);
   const close=document.createElement('button');close.type='button';close.textContent='收起';close.onclick=()=>{panel.hidden=true;card.querySelector('[data-rebar-edit="'+part+'"]').setAttribute('aria-expanded','false');};panel.append(close);
  }
  const counts=part=>$('ex-'+part+'-counts').value.split(/[,，]/).map(x=>Number(x.trim())),countText=part=>{const ns=counts(part),dia=$('ex-'+part+'-dia').value;return ns.some(x=>x>0)?ns.map((n,i)=>n>0?(i?'第 '+(i+1)+' 层 ':'')+n+'T'+dia:'').filter(Boolean).join(' + '):'未配筋';};
  function draw(){
   const upper=cb?'bottom':'top',lower=cb?'top':'bottom',automatic=$('ex-steel-mode').value==='AUTO',hasBars=[...counts('top'),...counts('bottom')].some(n=>n>0);
   card.querySelector('[data-rebar-edit="'+upper+'"]').textContent='上筋 · '+(automatic&&!hasBars?'自动选筋':countText(upper));
   card.querySelector('[data-rebar-edit="'+lower+'"]').textContent='下筋 · '+(automatic&&!hasBars?'自动选筋':countText(lower));
   card.querySelector('[data-rebar-edit=shear]').textContent='箍筋 '+$('ex-link-legs').value+' 肢 T'+$('ex-link-dia').value+' @ '+$('ex-link-space').value;
   card.querySelector('[data-rebar-edit=torsion]').textContent='抗扭 '+$('ex-tor-legs').value+' 肢 T'+$('ex-tor-dia').value+' @ '+$('ex-tor-space').value;
   const input=Loading.input(h.p,h.floor,Loading.token(beam.kind,beam)),L=Math.hypot(beam.rawZ[0]-beam.rawA[0],beam.rawZ[1]-beam.rawA[1]);
   try{const size=Reports.sizing(h.p,{kind:beam.kind,member:beam,floor:h.floor,input,loading:{L}});card.querySelector('[data-rebar-ratio]').textContent='L/h = '+Number(size.ratio.toFixed(3))+' / '+size.limit+' · '+size.status;}catch{card.querySelector('[data-rebar-ratio]').textContent='';}
   card.querySelector('.rebar-status116').textContent=automatic?(hasBars?'自动选筋 · 点击标注可修改':'自动选筋 · 计算 Check 后显示结果'):'手动配筋 · 修改后点“保存配筋并检查”';
  }
  card.addEventListener('click',e=>{const b=e.target.closest('[data-rebar-edit]');if(!b)return;const panel=$('rebar-editor116-'+b.dataset.rebarEdit);for(const [part]of Object.entries(fieldRows)){$('rebar-editor116-'+part).hidden=part!==b.dataset.rebarEdit;card.querySelector('[data-rebar-edit="'+part+'"]').setAttribute('aria-expanded',String(part===b.dataset.rebarEdit));}panel.querySelector('select,input')?.focus({preventScroll:true});});
  for(const row of Object.values(fieldRows))for(const field of row.querySelectorAll('input,select'))field.addEventListener('input',()=>{$('ex-steel-mode').value='MANUAL';draw();});
  $('ex-steel-mode').addEventListener('change',draw);draw();
 }
 return {decorate};
})();
