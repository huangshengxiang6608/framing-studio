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
 function required234(row,part,dirty){
  const v=row?.result?.values?.[part==='top'?'K36':'K38'];
  return typeof v==='number'&&Number.isFinite(v)&&v>=0?(dirty?'上次 ':'')+'As req = '+BeamLoads.display208(v)+' mm²'+(dirty?' · 待更新':''):'As req · 待計算';
 }
 const rows237=f=>Array.from({length:8},(_,i)=>f+i+(i>3?66:0)),diameters237=[10,12,16,20,25,32,40];
 // Older cached automatic results omitted derived E58 from their steel object.
 function steel239(saved,result){
  const steel={...(saved||result?.steel||{})};
  if(steel.E58==null&&['MB','SB','TB','CB'].includes(result?.kind)&&result.inputs)steel.E58=SectionB.machine(result.kind,{...result.inputs,...steel}).get('E58');
  return steel;
 }
 function readSteel237(){
  const steel={};
  for(const [f,part]of [[40,'top'],[44,'bottom']]){
   const counts=$('ex-'+part+'-counts').value.split(/[,，]/).map(x=>Number(x.trim())),field=$('ex-'+part+'-dia'),dias=JSON.parse(field.dataset.layers237||'null');
   if(counts.length>8||counts.some(n=>!Number.isSafeInteger(n)||n<0))throw Error('每面最多 8 层，各层根数为非负整数');
   rows237(f).forEach((row,i)=>{const n=counts[i]||0,d=Number(dias?.[i]??field.value);if(!diameters237.includes(d))throw Error('請選擇有效主筋直徑');steel['C'+row]=n||'';steel['D'+row]=n?d:'';});
  }
  for(const [k,id]of Object.entries({E58:'link-legs',G58:'link-dia',H58:'link-space',E76:'tor-legs',G76:'tor-dia',H76:'tor-space'})){const v=Number($('ex-'+id).value);if(!Number.isFinite(v)||v<=0)throw Error('請填寫有效箍筋數值');steel[k]=v;}
  const linkErrors=SectionB.linkErrors267(steel);if(linkErrors.length)throw Error(linkErrors.join('；'));
  if(!Number.isSafeInteger(steel.E58)||!Number.isSafeInteger(steel.E76))throw Error('箍筋肢数须为整数');
  return steel;
 }
 function preview237(row,steel){
  const v=row?.result?.inputs;if(!v)return null;
  try{return {...row,result:SectionB.beam({acceptance261:'rc',kind:row.result.kind||row.kind,L:v.G12,b:v.G14,h:v.G15,cover:v.G16,fcu:v.G17,M:v.G23,V:v.G24,T:v.K25,steel})};}
  catch(e){return {...row,result:{status:'INPUT REQUIRED',fail:[e.message]}};}
 }
 function measures237(row,steel){
  const v=row?.result?.values||{},number=(x)=>typeof x==='number'&&Number.isFinite(x)?x:null,m=row?.result?.inputs?SectionB.machine(row.result.kind||row.kind,row.result.inputs):null,cell=k=>{if(number(v[k])!==null)return v[k];try{return number(m?.get(k));}catch{return null;}};
  const face=(f,req,provided,check)=>{const bars=steel||row?.result?.steel,area=bars?rows237(f).reduce((a,r)=>a+Number(bars['C'+r]||0)*Number(bars['D'+r]||0)**2*Math.PI/4,0):cell(provided),b=cell('G14'),h=cell('G15');return {req:cell(req),provided:area,ratio:area!=null&&b>0&&h>0?100*area/(b*h):null,status:v[check],unit:'mm²',symbol:'As'};};
  const link=(f,req,check)=>({req:cell(req),provided:steel&&['E','G','H'].every(k=>typeof steel[k+f]==='number'&&Number.isFinite(steel[k+f]))&&steel['H'+f]>0?Number(steel['E'+f])*Number(steel['G'+f])**2*Math.PI/4/Number(steel['H'+f]):cell('K'+f),status:(steel||row?.result?.steel)&&(Number((steel||row.result.steel)['G'+f])<10||Number((steel||row.result.steel)['H'+f])<100||Number((steel||row.result.steel)['H'+f])>250)?'NOT OKAY':v[check],unit:'mm²/mm',symbol:'Asv/s'});
  return {top:face(40,'K36','G40','N40'),bottom:face(44,'K38','G44','N44'),shear:link(58,'K56','N59'),torsion:link(76,'K72','N77')};
 }
 function metrics238(row,info={}){
  const values=row?.result?.values||{},inputs=row?.result?.inputs||{},context=['FRR','cover'];
  const items=[['G29','Effective depth · d',values.G29,'mm','受壓邊至受拉鋼筋重心'],['FRR','FRR · 耐火時間',info.fire,'h',info.floorFire?'樓層 FRR 設定':info.tb?'TB 獨立設定':'普通梁／CB 共用設定'],['cover','實際 cover',inputs.G16,'mm',typeof inputs.G16==='number'?(info.manualCover?'手動指定':'按 FRR 採用'):'更新 Check 後顯示實際採用值'],['K30','RC 彎矩係數 · K',values.K30,'','K = M / (b d² fcu)'],['K51','梁剪應力 · v',values.K51,'N/mm²','v = V / (b d)']];
  return items.map(([cell,label,value,unit,description])=>{
   const valid=typeof value==='number'&&Number.isFinite(value),display=cell==='FRR'?value:BeamLoads.display208(value);
   return '<div><dt>'+label+'</dt><dd '+(context.includes(cell)?'data-rc-context240':'data-rc-metric238')+'="'+cell+'">'+(valid?esc(display)+(unit?' '+unit:''):'待計算')+'</dd><small>'+description+'</small></div>';
  }).join('');
 }
 function diagram227(upper,lower,b,d,info={}){
  const step=30,top=148,upN=info.editable?8:Math.max(1,Math.min(8,upper.length)),lowN=info.editable?8:Math.max(1,Math.min(8,lower.length)),bottom=top+(upN+lowN-2)*step+144,base=bottom+28,height=base+244;
  const label=(x,y,text,attrs='')=>'<text x="'+x+'" y="'+y+'" '+attrs+'>'+esc(text)+'</text>';
  const editor=(key,value,x,y,width,title)=>{
   const dia=key.endsWith(':dia'),options=info.options?.[key.split(':')[0]]||diameters237,attrs=' data-inline-rebar234="'+key+'" aria-label="'+esc(title)+'" '+(info.errors?.[key]?'aria-invalid="true"':'');
   const field=dia?'<select'+attrs+'>'+options.map(d=>'<option value="'+d+'"'+(Number(value)===Number(d)?' selected':'')+(key.startsWith('shear:')||key.startsWith('torsion:')?Number(d)<10?' disabled':'':'')+'>'+d+(Number(d)<10?'（低於下限）':'')+'</option>').join('')+'</select>':'<input type="text" inputmode="numeric"'+attrs+' value="'+esc(info.drafts?.[key]??value)+'" autocomplete="off" spellcheck="false"/>';
   return '<foreignObject x="'+x+'" y="'+y+'" width="'+width+'" height="30"><div xmlns="http://www.w3.org/1999/xhtml" class="rebar-inline234">'+field+'</div></foreignObject>';
  };
  const measure=(part,y)=>{
   const m=info.measures?.[part],fmt=v=>typeof v==='number'&&Number.isFinite(v)?BeamLoads.display208(v):'待計算',tone=m?.status==='OKAY'?'#176b46':m?.status==='NOT OKAY'?'#b42318':'#526778',status=m?.status==='OKAY'?'通過':m?.status==='NOT OKAY'?'未通過':'待確認',symbol=m?.symbol||'As',unit=m?.unit||'mm²';
   return '<g data-measure237="'+part+'">'+label(302,y,symbol+' required = '+fmt(m?.req)+(m?.req!=null?' '+unit:''),'text-anchor="middle" class="rebar-required234" data-required234="'+(part===info.upperPart?'upper':part===info.lowerPart?'lower':part)+'"')+label(302,y+19,symbol+' provided = '+fmt(m?.provided)+(m?.provided!=null?' '+unit:''),'text-anchor="middle" class="rebar-required234" data-provided237="'+part+'"')+(['top','bottom'].includes(part)?label(302,y+38,'Steel ratio = '+(typeof m?.ratio==='number'&&Number.isFinite(m.ratio)?m.ratio.toFixed(3)+'%':'待計算'),'text-anchor="middle" class="rebar-required234" data-steel-ratio269="'+part+'" aria-label="實配鋼筋率：100 × As / (B × D)，各面所有層的鋼筋面積除以梁全截面面積"'):'')+label(302,y+(['top','bottom'].includes(part)?57:38),status,'text-anchor="middle" class="rebar-required234" fill="'+tone+'" data-pass237="'+part+'"')+'</g>';
  };
  const layers=(ns,up)=>{
   const tone=up?'#9c3d10':'#185ba2',part=up?info.upperPart:info.lowerPart,dias=up?info.upperDias:info.lowerDias,countLayers=up?upN:lowN;
   return Array.from({length:countLayers},(_,i)=>{
    const dia=dias?.[i]??(up?info.upperDia:info.lowerDia),n=ns[i]||0,y=up?top+i*step:bottom-i*step,count=info.pending?0:Math.min(Math.max(0,n),12),dots=Number.isInteger(n)?Array.from({length:count},(_,j)=>'<circle cx="'+(count===1?302:200+j*204/(count-1))+'" cy="'+y+'" r="3.2" fill="'+tone+'"/>').join(''):'';
    const text=(i+1)+' · '+n+'T'+(dia||''),field=info.editable?label(19,y+6,i+1,'fill="'+tone+'"')+editor(part+':'+i+':count',n,33,y-15,43,(up?'上筋':'下筋')+'第 '+(i+1)+' 層根數')+label(79,y+6,'T','data-fixed236="T"')+editor(part+':'+i+':dia',dia,96,y-15,64,(up?'上筋':'下筋')+'第 '+(i+1)+' 層直徑'):label(158,y+5,text,'text-anchor="end" fill="'+tone+'"');
    return '<g data-rebar-layer232="'+(up?'upper':'lower')+'" data-layer="'+(i+1)+'" data-rebar-edit232="'+esc(part||'')+'"><title>'+esc(text)+'</title>'+field+'<path d="M164 '+y+' H193" stroke="'+tone+'"/>'+dots+'</g>';
   }).join('');
  };
  const link=(part,y,title,value)=>info.editable?label(24,y+7,title)+editor(part+':legs',info[part+'Fields']?.legs??'',98,y-16,55,title+'肢數')+label(160,y+7,'T','data-fixed236="T"')+editor(part+':dia',info[part+'Fields']?.dia??'',182,y-16,65,title+'直徑')+label(258,y+7,'@','data-fixed236="@"')+editor(part+':space',info[part+'Fields']?.space??'',291,y-16,101,title+'間距 mm，100–250 mm')+label(402,y+7,'mm'):label(24,y+7,title+' · '+value);
  return '<svg role="group" viewBox="0 0 520 '+height+'" aria-label="梁截面配筋編輯，上筋在上、下筋在下；分別輸入根數及直徑；不按比例">'+label(302,22,'B = '+Math.round(b*1000)+' mm','text-anchor="middle"')+'<rect x="180" y="40" width="244" height="'+(base-40)+'" rx="2" fill="#f3f6f8" stroke="#5c7181"/><rect x="190" y="130" width="224" height="'+(base-142)+'" rx="9" fill="none" stroke="#18736b" stroke-width="2"/>'+label(158,58,'上筋 · '+(info.upperRole||''),'text-anchor="end" fill="#9c3d10"')+measure(info.upperPart,62)+label(158,bottom-(lowN-1)*step-66,'下筋 · '+(info.lowerRole||''),'text-anchor="end" fill="#185ba2"')+measure(info.lowerPart,bottom-(lowN-1)*step-66)+layers(upper,true)+layers(lower,false)+label(452,(40+base)/2,'D = '+Math.round(d*1000)+' mm','text-anchor="middle" transform="rotate(90 452 '+((40+base)/2)+')"')+link('shear',base+38,'抗剪',info.shear||'待確認')+measure('shear',base+65)+link('torsion',base+132,'抗扭',info.torsion||'待確認')+measure('torsion',base+159)+label(260,base+217,'逐層獨立選徑；0 表示該層無筋','text-anchor="middle" class="rebar-svg-note227"')+label(260,base+239,'截面不按比例；圓點不代表實際根數 · 箍筋直徑最小 10 mm；間距 100–250 mm','text-anchor="middle" class="rebar-svg-note227"')+'</svg>';
 }
 function decorate(h){
  const top=$('ex-top-counts'),bottom=$('ex-bottom-counts');if(!top||!bottom||$('beam-rebar116'))return;
  const model=Engine.floorModel(h.result,h.floor,h.key),beam=model.beams.find(b=>b.id===h.selected?.id&&b.kind===h.selected?.kind);if(!beam)return;
  const cb=(beam.displayKind||beam.kind)==='CB',{upper,lower}=faces227(cb),token=Loading.token(beam.kind,beam),row=h.memberResult?.(h.floor,token);
  const savedSteel=Loading.input(h.p,h.floor,token).steel||row?.result?.steel||{};
  for(const [f,part]of [[40,'top'],[44,'bottom']]){const field=$('ex-'+part+'-dia');field.dataset.layers237=JSON.stringify(rows237(f).map(r=>Number(savedSteel['D'+r])||Number(field.value)));}
  const fieldRows={top:top.closest('.row'),bottom:bottom.closest('.row'),shear:$('ex-link-dia').closest('.row'),torsion:$('ex-tor-dia').closest('.row')};
  const first=fieldRows.top,previous=first.previousElementSibling;if(previous?.tagName==='P'&&previous.textContent.includes('每面最多'))previous.remove();
  const saveRow=fieldRows.torsion.nextElementSibling;
  const card=document.createElement('section');card.id='beam-rebar116';card.className='beam-rebar116';card.setAttribute('aria-label','梁 RC 結果與配筋編輯');
  card.innerHTML='<header class="rebar-heading227"><strong>'+esc(beam.displayId||beam.id)+' · '+Math.round(beam.b*1000)+' × '+Math.round(beam.d*1000)+' mm</strong><span class="rebar-rc227" aria-live="polite"></span></header><p class="rebar-reasons227" aria-live="polite"></p><dl class="rebar-metrics238" aria-label="目前梁 RC 計算數值" aria-live="polite"></dl><div class="rebar-overview227"><div class="rebar-section227"></div><div class="rebar-summary227" aria-hidden="true"><p data-rebar-upper></p><p data-rebar-lower></p><p data-rebar-shear></p><p data-rebar-torsion></p></div></div><p class="rebar-ratio227"></p><div class="rebar-fields227" hidden></div><p class="rebar-status116" aria-live="polite"></p>';
  first.before(card);
  const titles={top:(cb?'下筋':'上筋')+' · 受壓面',bottom:(cb?'上筋':'下筋')+' · 受拉面',shear:'抗剪箍筋',torsion:'抗扭箍筋'};
  for(const part of [upper,lower,'shear','torsion']){
   const panel=document.createElement('section');panel.className='rebar-editor116';panel.id='rebar-editor116-'+part;
   const label=document.createElement('h4');label.textContent=titles[part];panel.append(label,fieldRows[part]);
   if(part==='shear'||part==='torsion'){const hint=document.createElement('small');hint.textContent='箍筋直徑最小 10 mm；間距 100–250 mm。';panel.append(hint);}
   if(part==='top'||part==='bottom'){
    const hint=document.createElement('small');hint.id='rebar-hint227-'+part;hint.textContent='每層根數用逗號分隔，例如 4, 3；由該面向內，最多 8 層。';panel.append(hint);panel.querySelector('#ex-'+part+'-counts').setAttribute('aria-describedby',hint.id);
   }
   card.querySelector('.rebar-fields227').append(panel);
  }
  if(saveRow?.querySelector('[data-ex="steel"]'))card.append(saveRow);
  const counts=part=>$('ex-'+part+'-counts').value.split(/[,，]/).map(x=>Number(x.trim()));
  const dias=part=>JSON.parse($('ex-'+part+'-dia').dataset.layers237);
  const countText=part=>{const ns=counts(part); return ns.some(x=>!Number.isInteger(x)||x<0)||ns.length>8?'請輸入有效根數':ns.some(x=>x>0)?ns.map((n,i)=>n>0?'第 '+(i+1)+' 層 '+n+'T'+dias(part)[i]:'').filter(Boolean).join(' + '):'未配筋';};
  const fields231=[...Object.values(fieldRows)].flatMap(fields=>[...fields.querySelectorAll('input,select')]),initial231=fields231.map(field=>field.value),mode231=$('ex-steel-mode').value;
  const initialDias237={top:dias('top'),bottom:dias('bottom')};
  const changed231=()=>$('ex-steel-mode').value!==mode231||fields231.some((field,i)=>field.value!==initial231[i])||['top','bottom'].some(part=>JSON.stringify(dias(part))!==JSON.stringify(initialDias237[part]));
  let dirty=false;const drafts234={},errors234={};
  function draw(){
   const active=document.activeElement,key=active?.dataset?.inlineRebar234,selection=key?[active.selectionStart,active.selectionEnd]:null;

   const automatic=$('ex-steel-mode').value==='AUTO',awaitAuto=automatic&&(dirty||!row),current=h.memberResult?.(h.floor,token),invalid=Object.keys(errors234).length>0;
   let steel=null,live=current,status;
   if(dirty&&!invalid&&!automatic){try{steel=readSteel237();live=preview237(current,steel);}catch(e){live=null;status={tone:'pending',text:'RC 輸入待修正',reasons:[e.message]};}}
   if(invalid){live=null;status={tone:'pending',text:'RC 輸入待修正',reasons:Object.values(errors234)};}
   status=status||status227(h.p,live,false);const measures=measures237(live,steel);
   if($('rebar-mode235'))$('rebar-mode235').textContent=automatic?'配筋：自動選筋':'配筋：手動'+(dirty?'（已修改，待保存）':'');
   const badge=card.querySelector('.rebar-rc227');badge.textContent=status.text;badge.dataset.tone=status.tone;
   card.querySelector('.rebar-reasons227').textContent=status.reasons.join('；');
   const cfg240=Loading.settings(h.p),tb240=beam.kind==='TB',input240=Loading.input(h.p,h.floor,token);
   card.querySelector('.rebar-metrics238').innerHTML=metrics238(live,{fire:Engine.beamFire241(h.p,h.floor,beam.kind),floorFire:Engine.floors(h.p).find(f=>f.n===h.floor)?.fire241!=null,tb:tb240,manualCover:input240.cover!=null});
   const linkText=prefix=>awaitAuto?'待自動選筋':$('ex-'+prefix+'-legs').value+' 肢 T'+$('ex-'+prefix+'-dia').value+' @ '+$('ex-'+prefix+'-space').value+' mm';
   card.querySelector('.rebar-section227').innerHTML=diagram227(awaitAuto?[]:counts(upper),awaitAuto?[]:counts(lower),beam.b,beam.d,{upperPart:upper,lowerPart:lower,upperDias:dias(upper),lowerDias:dias(lower),options:Object.fromEntries(['top','bottom','shear','torsion'].map(part=>[part,[...$('ex-'+(part==='shear'?'link':part==='torsion'?'tor':part)+'-dia').options].map(o=>Number(o.value))])),measures,upperRole:cb?'受拉':'受壓',lowerRole:cb?'受壓':'受拉',pending:awaitAuto,editable:true,drafts:drafts234,errors:errors234,shear:linkText('link'),torsion:linkText('tor'),shearFields:{legs:$('ex-link-legs').value,dia:$('ex-link-dia').value,space:$('ex-link-space').value},torsionFields:{legs:$('ex-tor-legs').value,dia:$('ex-tor-dia').value,space:$('ex-tor-space').value}});
   card.querySelector('[data-rebar-upper]').textContent='上筋 · '+(awaitAuto?'待自動選筋':countText(upper));
   card.querySelector('[data-rebar-lower]').textContent='下筋 · '+(awaitAuto?'待自動選筋':countText(lower));
   card.querySelector('[data-rebar-shear]').textContent='抗剪 · '+(awaitAuto?'待自動選筋':$('ex-link-legs').value+' 肢 T'+$('ex-link-dia').value+' @ '+$('ex-link-space').value+' mm');
   card.querySelector('[data-rebar-torsion]').textContent='抗扭 · '+(awaitAuto?'待自動選筋':$('ex-tor-legs').value+' 肢 T'+$('ex-tor-dia').value+' @ '+$('ex-tor-space').value+' mm');
   const input=Loading.input(h.p,h.floor,token),L=Math.hypot(beam.rawZ[0]-beam.rawA[0],beam.rawZ[1]-beam.rawA[1]);
   try{const size=Reports.sizing(h.p,{kind:beam.kind,member:beam,floor:h.floor,input,loading:{L}});card.querySelector('.rebar-ratio227').textContent='Span/Depth · L/h = '+Number(size.ratio.toFixed(3))+' / '+size.limit+' · '+size.status+'（獨立判定）';}catch{card.querySelector('.rebar-ratio227').textContent='';}
   card.querySelector('.rebar-status116').textContent=automatic?(awaitAuto?'待自動選筋；圖中修改格為輸入預設值，修改即轉為手動。':'自動選筋結果；可直接修改，修改後轉為手動。'):(dirty?'即時 RC 試算 · 尚未保存；按「保存配筋并检查」保存至項目。':'手動配筋；修改即時試算目前構件。');
   if(key){const replacement=card.querySelector('[data-inline-rebar234="'+key+'"]');replacement?.focus();if(selection&&replacement?.tagName?.toLowerCase()==='input'&&replacement?.setSelectionRange)replacement.setSelectionRange(...selection);}
  }
  for(const fields of Object.values(fieldRows))for(const field of fields.querySelectorAll('input,select'))field.addEventListener('input',()=>{if(['ex-top-dia','ex-bottom-dia'].includes(field.id))field.dataset.layers237=JSON.stringify(Array(8).fill(Number(field.value)));$('ex-steel-mode').value='MANUAL';dirty=changed231();draw();});
  const edit237=e=>{
   const key=e.target.dataset?.inlineRebar234;if(!key)return;drafts234[key]=e.target.value;$('ex-steel-mode').value='MANUAL';dirty=true;
   const parts=key.split(':'),part=parts[0],field=parts.at(-1),isLink=['shear','torsion'].includes(part),prefix=isLink?(part==='shear'?'link':'tor'):part;
   const raw=e.target.value.trim(),value=Number(raw),valid=(field==='space'?/^\d+(?:\.\d+)?$/:/^\d+$/).test(raw)&&Number.isSafeInteger(field==='space'?Math.trunc(value):value);
   let error=valid?'':'請輸入有效'+(field==='space'?'間距數值。':'整數。');
   if(!error&&field==='dia'&&![...$('ex-'+prefix+'-dia').options].some(o=>Number(o.value)===value))error='請使用原有可選鋼筋直徑。';
   if(!error&&field==='legs'&&value<1)error='箍筋肢數須為正整數。';
   if(!error&&isLink&&field==='dia'&&value<10)error='箍筋直徑不得小於 10 mm。';
   if(!error&&field==='space'&&(value<100||value>250))error='箍筋間距須為 100–250 mm。';
   if(!error){
    if(field==='count'){const ns=Array.from({length:8},(_,i)=>counts(prefix)[i]||0);ns[Number(parts[1])]=value;$('ex-'+prefix+'-counts').value=ns.join(', ');}
    else if(!isLink&&field==='dia'){const ds=dias(prefix);ds[Number(parts[1])]=value;$('ex-'+prefix+'-dia').dataset.layers237=JSON.stringify(ds);}
    else $('ex-'+prefix+'-'+field).value=String(value);
   }
   if(error)errors234[key]=error;else delete errors234[key];dirty=changed231()||Object.keys(errors234).length>0;draw();
  };
  card.addEventListener('input',e=>{if(e.target.tagName?.toLowerCase()!=='select')edit237(e);});
  card.addEventListener('change',e=>{if(e.target.tagName?.toLowerCase()==='select')edit237(e);});
  card.addEventListener('click',e=>{if(e.target.closest('[data-ex="steel"]')&&Object.keys(errors234).length){e.preventDefault();e.stopPropagation();card.querySelector('[aria-invalid="true"]')?.focus();}});
  $('ex-steel-mode').addEventListener('change',()=>{if($('ex-steel-mode').value==='AUTO'){for(const key of Object.keys(drafts234))delete drafts234[key];for(const key of Object.keys(errors234))delete errors234[key];}if(mode231==='AUTO'&&$('ex-steel-mode').value==='AUTO'){fields231.forEach((field,i)=>field.value=initial231[i]);for(const part of ['top','bottom'])$('ex-'+part+'-dia').dataset.layers237=JSON.stringify(initialDias237[part]);}dirty=changed231();draw();});draw();
 }
 return {decorate,faces227,status227,diagram227,required234,readSteel237,preview237,measures237,metrics238,steel239};
})();
