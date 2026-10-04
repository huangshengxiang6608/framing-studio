// Actual slab boundary segments, shared by inspection and load transfer.
const SlabSupport132=(()=>{
 const load=()=>typeof Loading!=='undefined'?Loading:require('./loading.js');
 const eps=1e-6,near=(a,b)=>Math.abs(a-b)<eps;
 const records=o=>Array.isArray(o.slabSupports132?.segments)?o.slabSupports132.segments.filter(s=>s&&typeof s==='object'):[];
 const value=v=>load().token(v.member.kind||v.type,v.member);
 const candidates=model=>[...model.columns.filter(c=>c.status!=='上层柱').map(member=>({type:'COL',member})),...model.walls.map(member=>({type:'WALL',member})),...model.beams.map(member=>({type:'BEAM',member}))];
 function geometry(c,dir,model,o={}){
  if(!['X','Y'].includes(dir))return [];const cross=dir==='X'?0:1,along=1-cross,all=candidates(model),cs=o.slabType==='CS',fixed=['left','top'].includes(o.csFixedEdge)?'A':'B',rows=[];
  for(const rect of load().slabStrips118(c,dir))for(const side of ['A','B']){
   if(cs&&side!==fixed)continue;const face=rect[(cross?'y':'x')+(side==='A'?'0':'1')],start=rect[(along?'y':'x')+'0'],end=rect[(along?'y':'x')+'1'];
   const options=all.filter(v=>load().slabFace(c,v.member,cross,face)),cuts=[start,end,...options.flatMap(v=>load().slabFace(c,v.member,cross,face)),...records(o).filter(s=>s.side===side&&near(s.face,face)).flatMap(s=>[s.start,s.end])].filter(x=>Number.isFinite(x)&&x>=start&&x<=end).sort((a,b)=>a-b);
   for(let i=1;i<cuts.length;i++){if(cuts[i]-cuts[i-1]<eps)continue;const point=[];point[cross]=face;point[along]=(cuts[i]+cuts[i-1])/2;const choices=options.filter(v=>{const range=load().slabFace(c,v.member,cross,face);return point[along]>range[0]-eps&&point[along]<range[1]+eps;});rows.push({side,face,start:cuts[i-1],end:cuts[i],point,options:choices});}
  }return rows;
 }
 function resolve(c,dir,o,row){
  const manual=o.slabSupports132,overrides=records(o),chosen=overrides.filter(s=>s.side===row.side&&near(s.face,row.face)&&s.start<row.end-eps&&s.end>row.start+eps),cross=dir==='X'?0:1,options=row.options.filter(v=>{const range=load().slabFace(c,v.member,cross,row.face);return range&&range[0]<=row.start+eps&&range[1]>=row.end-eps;});
  if(manual&&manual.direction!==dir)return {error:'方向已改变，请更新手动 Support 或恢复自动'};
  if(chosen.length>1)return {error:'手动支承区段重叠'};
  if(chosen.length){const s=chosen[0],hits=options.filter(v=>value(v)===s.target),hit=hits.length===1?hits[0]:null;return hit&&s.start<=row.start+eps&&s.end>=row.end-eps?{hit,manual:true}:{error:'手动支承不再接触该板边区段，请重新选择'};}
  const hit=load().slabWinner(c,options,cross,row.point);return hit?{hit,manual:false}:{error:options.length?'同一区段有多个承托构件，请指定':'该区段未找到相接支承'};
 }
 function plan(c,dir,model,o={}){
  const rows=geometry(c,dir,model,o),saved=o.slabSupports132,errors=[];
  if(o.supportConflicts?.includes('slabSupports132'))errors.push('同 Framing 各层 Slab Support 冲突，请重新保存');
  if(saved){if(!['X','Y'].includes(saved.direction)||!Array.isArray(saved.segments))errors.push('手动 Slab Support 数据无效');
   else for(const s of saved.segments){if(!s||!['A','B'].includes(s.side)||![s.face,s.start,s.end].every(Number.isFinite)||!(s.end>s.start)||typeof s.target!=='string'){errors.push('手动支承区段数据无效');continue;}const covered=rows.filter(r=>r.side===s.side&&near(r.face,s.face)).reduce((n,r)=>n+Math.max(0,Math.min(r.end,s.end)-Math.max(r.start,s.start)),0);if(Math.abs(covered-(s.end-s.start))>eps)errors.push('手动支承区段已不在板边上，请重新选择');}
  }
  for(const row of rows){const selected=resolve(c,dir,o,row);Object.assign(row,selected);row.value=selected.hit?value(selected.hit):'';if(selected.error)errors.push((dir==='X'?(row.side==='A'?'左':'右'):(row.side==='A'?'上':'下'))+'侧支承边 '+row.start.toFixed(3)+'–'+row.end.toFixed(3)+' m（'+(dir==='X'?'X':'Y')+'='+row.face.toFixed(3)+'）：'+selected.error);}
  return {rows,errors:[...new Set(errors)]};
 }
 return {plan,resolve,value};
})();

if(typeof module!=='undefined')module.exports=SlabSupport132;
