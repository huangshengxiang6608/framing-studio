const BeamSizing83=(()=>{
 const signature=b=>Engine.sig(b.rawA,b.rawZ),step=50;
 function limit(p,m,b){
  if(b.kind==='SB')return m.sh*1000;
  const horizontal=Math.abs(b.rawA[1]-b.rawZ[1])<1e-6;
  const cols=m.columns.filter(c=>c.status!=="上层柱"&&[b.rawA,b.rawZ].some(q=>Math.abs(Engine.columnRect(c).x-q[0])<=c.b/2+1e-6&&Math.abs(Engine.columnRect(c).y-q[1])<=c.d/2+1e-6));
  return cols.length?Math.min(...cols.map(c=>(horizontal?c.d:c.b)*1000)):(horizontal?p.defaults.cd:p.defaults.cb);
 }
 async function prepare(project,requested){
  const p=Engine.clone(project),chosen=new Set(requested||['selected','reportA','reportB'].flatMap(k=>Object.entries(p.explorer?.[k]||{}).filter(([,v])=>v).map(([id])=>id)));
  let r=Engine.generate(p);const targets=new Set();for(const f of r.floors)for(const b of Engine.floorModel(r,f).beams)if(['MB','SB'].includes(b.kind)&&b.displayKind!=='CB'&&chosen.has(f.n+'|'+Loading.token(b.kind,b)))targets.add(f.type+'|'+signature(b));
  const changes=[],stopped=[];let out;
  for(let iteration=0;iteration<=400;iteration++){
   r=Engine.generate(p);const test=Engine.clone(p);Loading.init(test);test.explorer.selected={};
   for(const f of r.floors)for(const b of Engine.floorModel(r,f).beams)if(targets.has(f.type+'|'+signature(b)))test.explorer.selected[f.n+'|'+Loading.token(b.kind,b)]=true;
   out=Loading.run(test,r,'B');const groups=new Map();
   for(const row of out.rows)if(row.checked&&targets.has(row.framing+'|'+signature(row.member))){const k=row.framing+'|'+signature(row.member);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(row);}
   let changed=false;stopped.length=0;
   for(const [k,rows]of groups){const row=rows[0],b=row.member,m=Engine.floorModel(r,row.floor,row.framing),max=limit(p,m,b),width=Math.round(b.b*1000*1e6)/1e6;
    const invalid=rows.find(x=>x.result.status==='INPUT REQUIRED');
    const failure=rows.some(x=>x.result.status!=='OK');
    if(width>max+1e-6){stopped.push({id:row.id,framing:row.framing,reason:'当前梁宽已超过'+(b.kind==='SB'?'Structural Depth':'柱宽')+'上限 '+max+' mm'});continue;}
    if(!failure)continue;
    if(invalid){stopped.push({id:row.id,framing:row.framing,reason:'输入或传荷待补：'+invalid.result.fail.join('；')});continue;}
    if(width+step>max+1e-6){stopped.push({id:row.id,framing:row.framing,reason:'达到梁宽上限 '+max+' mm，仍未通过；下一步 +50 mm 将超限'});continue;}
    const map=p.types[row.framing].beamWidths83??={},sig=signature(b),previous=map[sig];map[sig]=width+step;const candidate=Engine.floorModel(Engine.generate(p),row.floor,row.framing);if(!candidate.beams.some(x=>signature(x)===sig)){if(previous===undefined)delete map[sig];else map[sig]=previous;stopped.push({id:row.id,framing:row.framing,reason:'加宽后截面超出可布置范围，保留原宽并标记未通过'});continue;}changes.push({framing:row.framing,id:row.id,from:width,to:width+step});changed=true;
   }
   if(!changed)break;if(iteration===400)throw Error('梁宽调整未收敛，未应用本次修改');
   await new Promise(resolve=>setTimeout(resolve,0));
  }
  return {project:p,changes,stopped};
 }
 async function apply(host,requested){const original=JSON.stringify(host.get().p),v=await prepare(host.get().p,requested);if(JSON.stringify(host.get().p)!==original)throw Error('计算期间输入已改变，请重新计算');
  if(v.changes.length&&host.transact(()=>{for(const [key,t]of Object.entries(v.project.types))host.get().p.types[key].beamWidths83=t.beamWidths83;})===false)throw Error('梁宽调整未能保存，已撤销');
  return v;
 }
 return {prepare,apply,limit};
})();

// Summary-only sizing search. Every accepted trial reruns geometry, self weight,
// load transfer and the existing Section B solver; no report/formula changes.
const SBAdvice220=(()=>{
 const isSB=b=>b.kind==='SB'&&(b.displayKind||b.kind)==='SB';
 const identity=b=>(b.source||'manual')+'|'+(b.splitSecondaryParent200||b.id);
 const signature=b=>Engine.sig(b.rawA,b.rawZ);
 const step=50,eps=1e-6;
 function groups(p,r,key){
  const map=new Map();
  for(const f of r.floors.filter(f=>f.type===key))for(const b of Engine.floorModel(r,f).beams.filter(isSB)){
   const id=identity(b);if(!map.has(id))map.set(id,{id,b:0,d:0,limit:Infinity,refs:[]});const g=map.get(id);
   g.b=Math.max(g.b,b.b*1000);g.d=Math.max(g.d,b.d*1000);g.limit=Math.min(g.limit,LocalHeights96.beamAllowance(p,f.n,b));g.refs.push({floor:f.n,token:Loading.token(b.kind,b),sig:signature(b)});
  }
  return map;
 }
 function write(p,key,map,uniform=null){
  const t=p.types[key];
  for(const g of map.values()){
   const size=uniform||g;if(!(size.b>0&&size.d>0&&size.d<=g.limit+eps))throw Error('SB 建議深度超過共用樓層／局部 Structural Zone');
   for(const ref of g.refs){(t.beamWidths83??={})[ref.sig]=size.b;(t.beamDepths201??={})[ref.sig]=size.d;}
   for(const row of t.beams||[])if(row.kind==='SB'&&g.id==='manual|'+row.id){row.b=size.b;row.d=size.d;row.depthOverride184=size.d;row.widthMode='manual';(t.beamWidths83??={})[Engine.sig(Engine.resolve(p,row.a,key),Engine.resolve(p,row.z,key))]=size.b;}
   for(const row of t.autoBeamSnapshot?.secondary||[])if(row.kind==='SB'&&g.id==='auto|'+row.id){row.b=size.b/1000;row.depthOverride184=size.d;row.widthMode='manual';}
  }
  if(uniform){t.sbWidth=uniform.b;t.beamDepth=uniform.d;}
 }
 function next(size){if(size.d<size.limit-eps){size.d=Math.min(size.limit,Math.round((size.d+step)*1e6)/1e6);return true;}if(size.b+step<=size.limit+eps){size.b=Math.round((size.b+step)*1e6)/1e6;return true;}return false;}
 function inventory(r){return r.floors.flatMap(f=>Engine.floorModel(r,f).beams.map(b=>f.n+'|'+b.kind+'|'+signature(b))).sort().join(';');}
 function* analyze(p,r,rows,solve,rc){
  const answer={members:{},framings:{}},keys=[...new Set(rows.filter(row=>isSB(row.member)&&rc(row.result).status==='NOT OK').map(row=>row.framing))];
  for(const key of keys){
   const map=groups(p,r,key),all=[...map.values()],failed=new Set(rows.filter(row=>row.framing===key&&isSB(row.member)&&rc(row.result).status==='NOT OK').map(row=>identity(row.member)));
   const baseline=inventory(r),source=Engine.clone(p);let current=rows,reason='',iterations=0;
   const evaluate=function*(uniform){const trial=Engine.clone(source);write(trial,key,map,uniform);const model=Engine.generate(trial);if(inventory(model)!==baseline)throw Error('加大尺寸會改變梁佈置或令構件消失，請另行調整');
    // Verify actual depths, not a silently capped model value.
    for(const f of model.floors.filter(f=>f.type===key))for(const b of Engine.floorModel(model,f).beams.filter(isSB)){const g=map.get(identity(b)),size=uniform||g;if(!g||Math.abs(b.b*1000-size.b)>eps||Math.abs(b.d*1000-size.d)>eps)throw Error('尺寸未能完整套用，請檢查個別梁覆寫');}
    Loading.init(trial).selected={};for(const g of all)for(const ref of g.refs)trial.explorer.selected[ref.floor+'|'+ref.token]=true;
    return (yield* solve(trial,model,'B')).rows;
   };
   try{
    while(true){
     yield {phase:'SB 建議尺寸 · '+key,floor:all[0]?.refs[0]?.floor||1,id:'優先加深'};
     const bad=[];
     for(const g of all){const checks=g.refs.map(ref=>current.find(row=>row.floor===ref.floor&&row.token===ref.token)).map(row=>row?rc(row.result):{status:'INPUT REQUIRED'});
      if(checks.some(c=>!['OK','NOT OK'].includes(c.status))){reason='同 Framing 有 SB 缺少完整 RC 輸入，未能確認統一尺寸';g.reason=reason;continue;}
      if(checks.some(c=>c.status!=='OK'))bad.push(g);
     }
     if(!bad.length)break;let advanced=false;
     for(const g of bad){if(g.reason)continue;if(g.d>g.limit+eps||!next(g)){g.reason='已達 Structural Zone／加闊上限，仍未找到 RC 通過尺寸';reason=g.reason;}else advanced=true;}
     if(!advanced)break;if(++iterations>800)throw Error('尺寸搜尋未收斂，請人工核對');
     current=yield* evaluate(null);
    }
    for(const g of all)if(failed.has(g.id))for(const ref of g.refs)answer.members[ref.floor+'|'+ref.token]=g.reason?{reason:g.reason}:{b:g.b,d:g.d,limit:g.limit};
    const common={b:Math.max(...all.map(g=>g.b)),d:Math.max(...all.map(g=>g.d)),limit:Math.min(...all.map(g=>g.limit))};
    if(reason)throw Error(reason);if(common.d>common.limit+eps)throw Error('最大建議深度 '+common.d+' mm 超過部分 SB Structural Zone '+common.limit+' mm，不能統一套用');
    // A common size is independently checked on the original project, including
    // SBs that passed initially, before a one-click action is offered.
    while(true){
     yield {phase:'SB Framing 統一尺寸 · '+key,floor:all[0].refs[0].floor,id:common.b+' × '+common.d};
     current=yield* evaluate(common);const checks=all.flatMap(g=>g.refs.map(ref=>current.find(row=>row.floor===ref.floor&&row.token===ref.token))).map(row=>row?rc(row.result):{status:'INPUT REQUIRED'});
     if(checks.every(c=>c.status==='OK'))break;
     if(checks.some(c=>!['OK','NOT OK'].includes(c.status)))throw Error('統一尺寸後有 RC 輸入／傳荷待確認');
     if(!next(common))throw Error('統一尺寸已達 Structural Zone／加闊上限，仍有 SB RC 不通過');
     if(++iterations>800)throw Error('尺寸搜尋未收斂，請人工核對');
    }
    answer.framings[key]={...common,count:all.length,floors:new Set(all.flatMap(g=>g.refs.map(ref=>ref.floor))).size};
   }catch(e){answer.framings[key]={reason:e.message};for(const g of all)if(failed.has(g.id))for(const ref of g.refs)answer.members[ref.floor+'|'+ref.token]??={reason:e.message};}
  }
  return answer;
 }
 function apply(p,r,key,advice){
  if(!advice||advice.reason||![advice.b,advice.d].every(v=>Number.isFinite(v)&&v>0))throw Error('沒有可套用的 SB 建議尺寸');
  const map=groups(p,r,key);if(!map.size)throw Error('此 Framing 沒有 SB');
  if([...map.values()].some(g=>advice.b<g.b-eps||advice.d<g.d-eps))throw Error('建議已過期或會縮小現有 SB，請更新全樓 Check');
  const trial=Engine.clone(p);write(trial,key,map,advice);const result=Engine.generate(trial);if(inventory(result)!==inventory(r))throw Error('尺寸改動會改變梁佈置，未套用');
  for(const f of result.floors.filter(f=>f.type===key))for(const b of Engine.floorModel(result,f).beams.filter(isSB))if(Math.abs(b.b*1000-advice.b)>eps||Math.abs(b.d*1000-advice.d)>eps)throw Error('部分 SB 未能套用建議尺寸');
  p.types[key]=trial.types[key];return {count:map.size,floors:advice.floors};
 }
 return {analyze,apply,groups,next};
})();

// TB recommendations use the existing depth-following mode before trying width.
// Only cloned projects are edited. Results are advisory; no live sizing is applied.
const TBAdvice221=(()=>{
 const eps=1e-6,step=50,maxWidth=20000;
 const sig=b=>Engine.sig(b.rawA,b.rawZ);
 const inventory=r=>r.floors.flatMap(f=>Engine.floorModel(r,f).beams.map(b=>f.n+'|'+b.kind+'|'+sig(b))).sort().join(';');
 function* analyze(p,r,rows,solve,rc){
  const answer={},groups=new Map(),baseline=inventory(r);
  for(const row of rows)if(row.kind==='TB'&&rc(row.result).status==='NOT OK'){
   const key=row.framing+'|'+sig(row.member);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(row);
  }
  for(const targets of groups.values()){
   const first=targets[0],signature=sig(first.member),refs=rows.filter(row=>row.framing===first.framing&&['MB','SB','TB','CB'].includes(row.kind)&&sig(row.member)===signature);
   let width=Math.max(...refs.map(row=>row.member.b*1000)),problem='',candidateRows=null,candidateModel=null;
   const limits=new Map(targets.map(row=>[row.floor,LocalHeights96.beamAllowance(p,row.floor,row.member)]));
   try{
    if(refs.some(row=>!['OK','NOT OK'].includes(rc(row.result).status)))throw Error('共用 Framing 同位置梁有 RC 輸入／傳荷待確認');
    while(width<=maxWidth+eps){
     yield {phase:'TB 建議梁闊 · 先用盡 Structural Zone',floor:first.floor,id:first.id+' · '+width+' mm'};
     const trial=Engine.clone(p);
     // Clearing an explicit D uses the existing per-floor/local Structural Zone
     // rule. Auto-identified TBs retain their original underlying beam category.
     Engine.editSize(trial,first.framing,{id:first.member.id,kind:first.kind,f:first.floor},{b:width,d:null,kind:first.kind,depthOverride184:true});
     const model=Engine.generate(trial);if(inventory(model)!==baseline)throw Error('試加闊會改變梁佈置或令構件消失，請另行調整');
     for(const ref of refs){const b=Engine.floorModel(model,ref.floor).beams.find(b=>sig(b)===signature&&b.kind===ref.kind);if(!b||Math.abs(b.b*1000-width)>eps)throw Error('梁闊未能完整套用，請檢查共用梁覆寫');
      const zone=LocalHeights96.beamAllowance(trial,ref.floor,b);if(b.d*1000>zone+eps||b.d<ref.member.d-eps)throw Error('恢復 Structural Zone 深度會縮小共用梁，請先核對深度');
      if(ref.kind==='TB'&&Math.abs(b.d*1000-zone)>eps)throw Error('TB 未能用盡 Structural Zone，請先核對深度覆寫');
     }
     Loading.init(trial).selected={};for(const ref of refs)trial.explorer.selected[ref.floor+'|'+ref.token]=true;
     const result=yield* solve(trial,model,'B'),checked=refs.map(ref=>result.rows.find(row=>row.floor===ref.floor&&row.token===ref.token));
     if(checked.some(row=>!row||!['OK','NOT OK'].includes(rc(row.result).status)))throw Error('試尺寸後有 RC 輸入／傳荷待確認');
     if(checked.every(row=>rc(row.result).status==='OK')){candidateRows=checked;candidateModel=model;break;}
     width=Math.round((width+step)*1e6)/1e6;
    }
    if(!candidateRows)throw Error('搜尋至梁闊輸入上限 '+maxWidth+' mm，仍未找到 RC 通過尺寸');
   }catch(e){problem=e.message;}
   for(const row of targets){const current=row.member.d*1000,limit=limits.get(row.floor),candidate=candidateRows?.find(v=>v.floor===row.floor&&v.token===row.token);
    answer[row.floor+'|'+row.token]={currentDepth:current,limit,depthFull:Math.abs(current-limit)<=eps,...(problem?{reason:problem}:{b:width,d:candidate.member.d*1000,trialLimit:LocalHeights96.beamAllowance(p,row.floor,candidate.member),floors:refs.length})};
   }
  }
  return answer;
 }
 return {analyze};
})();

// Apply only the recommended physical TB, using the same full-zone mode as its trial.
const TBApply222=(()=>{
 function apply(p,r,item){
  const a=item?.tbAdvice221,eps=1e-6;
  if(item?.kind!=='TB'||!a||a.reason||![a.b,a.d].every(v=>Number.isFinite(v)&&v>=1&&v<=20000))throw Error('沒有可套用的 TB 建議尺寸');
  const floor=r.floors.find(f=>f.n===item.floor);
  if(!floor||floor.type!==item.framing)throw Error('TB 樓層已改變，請更新全樓 Check');
  const beam=Engine.floorModel(r,floor).beams.find(b=>b.kind==='TB'&&Loading.token(b.kind,b)===item.token);
  if(!beam)throw Error('TB 已不存在，請更新全樓 Check');
  const sig=b=>Engine.sig(b.rawA,b.rawZ),signature=sig(beam),zone=LocalHeights96.beamAllowance(p,item.floor,beam);
  if(Math.abs(a.currentDepth-beam.d*1000)>eps||Math.abs(a.limit-zone)>eps||Math.abs(a.d-zone)>eps||a.b<beam.b*1000-eps)throw Error('TB 建議已過期，請更新全樓 Check');
  const entries=model=>model.floors.flatMap(f=>Engine.floorModel(model,f).beams.map(b=>({f,b,key:f.n+'|'+b.kind+'|'+sig(b)})));
  const before=entries(r),trial=Engine.clone(p);
  Engine.editSize(trial,item.framing,{id:beam.id,kind:beam.kind,f:item.floor},{b:a.b,d:null,kind:beam.kind,depthOverride184:true});
  const model=Engine.generate(trial),after=entries(model),byKey=new Map(after.map(v=>[v.key,v]));
  if(before.length!==after.length||before.some(v=>!byKey.has(v.key)))throw Error('尺寸改動會改變梁佈置，未套用');
  let count=0;
  for(const old of before){const next=byKey.get(old.key).b,target=old.f.type===item.framing&&sig(old.b)===signature;
   if(target){const limit=LocalHeights96.beamAllowance(trial,old.f.n,next);count++;
    if(Math.abs(next.b*1000-a.b)>eps||next.b<old.b.b-eps||next.d<old.b.d-eps||next.d*1000>limit+eps||(next.kind==='TB'&&Math.abs(next.d*1000-limit)>eps))throw Error('共用梁尺寸或 Structural Zone 未能符合建議，未套用');
   }else if(Math.abs(next.b-old.b.b)>eps||Math.abs(next.d-old.b.d)>eps)throw Error('尺寸改動會影響其他梁尺寸，未套用');
  }
  if(count!==a.floors)throw Error('共用樓層已改變，請更新全樓 Check');
  p.types[item.framing]=trial.types[item.framing];return {floors:count,b:a.b,d:a.d};
 }
 return {apply};
})();
