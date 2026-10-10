// Member Check interface only: reuse the original steel fields and save/check path.
const BeamRebar116=(()=>{
 const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const faces227=cb=>({upper:cb?'bottom':'top',lower:cb?'top':'bottom'});
 function status227(p,row,dirty){
  if(dirty)return {tone:'pending',text:'RC 待重新檢查',reasons:['配筋已修改；請保存配筋並檢查。']};
  if(!row)return {tone:'pending',text:'RC 待計算',reasons:['請到 Summary Check 更新全樓 Check。']};
  const rc=Loading.auditChecks205(p,row).b,ok=/^OK(?:$|[ (])/.test(rc.status);
  return {tone:ok?'pass':rc.status==='NOT OK'?'fail':'pending',text:ok?'RC 通過':rc.status==='NOT OK'?'RC 未通過':'RC 待確認',reasons:rc.reasons||[]};
 }
 function diagram227(upper,lower,b,d){
  // A schematic cross-section: dots identify layers, labels give the actual counts.
  const dots=(ns,up)=>ns.slice(0,8).map((n,i)=>{
   if(!Number.isInteger(n)||n<=0)return '';
   const count=Math.min(n,12),y=up?58+i*7:174-i*7;
   return Array.from({length:count},(_,j)=>'<circle cx="'+(count===1?160:83+j*154/(count-1))+'" cy="'+y+'" r="2.8" fill="'+(up?'#9c3d10':'#185ba2')+'"/>').join('');
  }).join('');
  return '<svg role="img" viewBox="0 0 320 222" aria-label="梁截面配筋示意，上筋在上、下筋在下；不按比例，根數以輸入為準"><text x="160" y="16" text-anchor="middle">B = '+esc(Math.round(b*1000))+' mm</text><rect x="62" y="30" width="196" height="172" rx="2" fill="#f3f6f8" stroke="#5c7181"/><rect x="74" y="43" width="172" height="146" rx="9" fill="none" stroke="#18736b" stroke-width="2"/>'+dots(upper,true)+dots(lower,false)+'<text x="281" y="116" text-anchor="middle" transform="rotate(90 281 116)">D = '+esc(Math.round(d*1000))+' mm</text><text x="26" y="61" text-anchor="middle">上</text><text x="26" y="177" text-anchor="middle">下</text><text x="160" y="219" text-anchor="middle" class="rebar-svg-note227">截面示意 · 根數及層數以輸入為準</text></svg>';
 }
 function decorate(h){
  const top=$('ex-top-counts'),bottom=$('ex-bottom-counts');if(!top||!bottom||$('beam-rebar116'))return;
  const model=Engine.floorModel(h.result,h.floor,h.key),beam=model.beams.find(b=>b.id===h.selected?.id&&b.kind===h.selected?.kind);if(!beam)return;
  const cb=(beam.displayKind||beam.kind)==='CB',{upper,lower}=faces227(cb),token=Loading.token(beam.kind,beam),row=h.memberResult?.(h.floor,token);
  const fieldRows={top:top.closest('.row'),bottom:bottom.closest('.row'),shear:$('ex-link-dia').closest('.row'),torsion:$('ex-tor-dia').closest('.row')};
  const first=fieldRows.top,previous=first.previousElementSibling;if(previous?.tagName==='P'&&previous.textContent.includes('每面最多'))previous.remove();
  const saveRow=fieldRows.torsion.nextElementSibling;
  const card=document.createElement('section');card.id='beam-rebar116';card.className='beam-rebar116';card.setAttribute('aria-label','梁 RC 結果與配筋編輯');
  card.innerHTML='<header class="rebar-heading227"><strong>'+esc(beam.displayId||beam.id)+' · '+Math.round(beam.b*1000)+' × '+Math.round(beam.d*1000)+' mm</strong><span class="rebar-rc227" aria-live="polite"></span></header><p class="rebar-reasons227" aria-live="polite"></p><div class="rebar-overview227"><div class="rebar-section227"></div><div class="rebar-summary227"><p data-rebar-upper></p><p data-rebar-lower></p><p data-rebar-shear></p><p data-rebar-torsion></p></div></div><p class="rebar-ratio227"></p><div class="rebar-fields227"></div><p class="rebar-status116" aria-live="polite"></p>';
  first.before(card);
  const titles={top:(cb?'下筋':'上筋')+' · 受壓面',bottom:(cb?'上筋':'下筋')+' · 受拉面',shear:'抗剪箍筋',torsion:'抗扭箍筋'};
  for(const part of [upper,lower,'shear','torsion']){
   const panel=document.createElement('section');panel.className='rebar-editor116';panel.id='rebar-editor116-'+part;
   const label=document.createElement('h4');label.textContent=titles[part];panel.append(label,fieldRows[part]);
   if(part==='top'||part==='bottom'){
    const hint=document.createElement('small');hint.id='rebar-hint227-'+part;hint.textContent='每層根數用逗號分隔，例如 4, 3；由該面向內，最多 8 層。';panel.append(hint);panel.querySelector('#ex-'+part+'-counts').setAttribute('aria-describedby',hint.id);
   }
   card.querySelector('.rebar-fields227').append(panel);
  }
  if(saveRow?.querySelector('[data-ex="steel"]'))card.append(saveRow);
  const counts=part=>$('ex-'+part+'-counts').value.split(/[,，]/).map(x=>Number(x.trim()));
  const countText=part=>{const ns=counts(part),dia=$('ex-'+part+'-dia').value;return ns.some(x=>!Number.isInteger(x)||x<0)||ns.length>8?'請輸入有效根數':ns.some(x=>x>0)?ns.map((n,i)=>n>0?'第 '+(i+1)+' 層 '+n+'T'+dia:'').filter(Boolean).join(' + '):'未配筋';};
  let dirty=false;
  function draw(){
   const automatic=$('ex-steel-mode').value==='AUTO',awaitAuto=automatic&&(dirty||!row),status=status227(h.p,row,dirty);
   const badge=card.querySelector('.rebar-rc227');badge.textContent=status.text;badge.dataset.tone=status.tone;
   card.querySelector('.rebar-reasons227').textContent=status.reasons.join('；');
   card.querySelector('.rebar-section227').innerHTML=diagram227(awaitAuto?[]:counts(upper),awaitAuto?[]:counts(lower),beam.b,beam.d);
   card.querySelector('[data-rebar-upper]').textContent='上筋 · '+(awaitAuto?'待自動選筋':countText(upper));
   card.querySelector('[data-rebar-lower]').textContent='下筋 · '+(awaitAuto?'待自動選筋':countText(lower));
   card.querySelector('[data-rebar-shear]').textContent='抗剪 · '+(awaitAuto?'待自動選筋':$('ex-link-legs').value+' 肢 T'+$('ex-link-dia').value+' @ '+$('ex-link-space').value+' mm');
   card.querySelector('[data-rebar-torsion]').textContent='抗扭 · '+(awaitAuto?'待自動選筋':$('ex-tor-legs').value+' 肢 T'+$('ex-tor-dia').value+' @ '+$('ex-tor-space').value+' mm');
   const input=Loading.input(h.p,h.floor,token),L=Math.hypot(beam.rawZ[0]-beam.rawA[0],beam.rawZ[1]-beam.rawA[1]);
   try{const size=Reports.sizing(h.p,{kind:beam.kind,member:beam,floor:h.floor,input,loading:{L}});card.querySelector('.rebar-ratio227').textContent='Span/Depth · L/h = '+Number(size.ratio.toFixed(3))+' / '+size.limit+' · '+size.status+'（獨立判定）';}catch{card.querySelector('.rebar-ratio227').textContent='';}
   card.querySelector('.rebar-status116').textContent=automatic?(awaitAuto?'待自動選筋；以下為輸入預設值，修改即轉為手動。':'自動選筋結果；可直接修改，修改後轉為手動。'):'手動配筋；修改後按「保存配筋并检查」。';
  }
  for(const fields of Object.values(fieldRows))for(const field of fields.querySelectorAll('input,select'))field.addEventListener('input',()=>{dirty=true;$('ex-steel-mode').value='MANUAL';draw();});
  $('ex-steel-mode').addEventListener('change',()=>{dirty=true;draw();});draw();
 }
 return {decorate,faces227,status227,diagram227};
})();
