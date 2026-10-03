// Source: deflection_core_wall_BD_standalone.xlsm. Uniform-load, constant-EI
// cantilever flexure only. Rectangle union follows CoreWallSegments VBA.
window.Deflection=(()=>{
 const EPS=1e-9,finite=v=>typeof v==='number'&&Number.isFinite(v);
 const grades=Object.freeze({C20:18.7,C25:20.5,C30:22.2,C35:23.7,C40:25.1,C45:26.4,C50:27.7,C55:28.9,C60:30,C65:31.1,C70:32.2,C75:33.2,C80:34.2,C85:35.1,C90:36,C95:36.9});
 const unique=a=>a.sort((x,y)=>x-y).filter((x,i,s)=>!i||Math.abs(x-s[i-1])>=EPS);
 const defaults=face=>({mode:'UNIFORM',windSource:'manual',q:null,breadthSource:'model',breadth:null,base:null,grade:'',limit:500,direction:face==='B'?'X':'Y',wallSource:'model',floor:1,selected:[],walls:[],layerSource:'floors',layerDatum:'overall',windStart:null,layerPressures:{},layers:[]});
 function init(p){const d=p.deflection??={version:1,scope:'scheme1',include:true,plans:{}};d.plans??={};return d;}
 const planKeys=p=>['scheme1'];
 const label=key=>key==='shared'?'Scheme 1 / 2 · 共用核心墙':key==='scheme2'?'Scheme 2':'Scheme 1';
 function saved(p,key,face){const fcu=Loading.settings(p).wallFcu;return {...defaults(face),...p.deflection?.plans?.[key]?.[face],base:null,grade:finite(fcu)?'C'+fcu:'',limit:500};}
 function edit(p,key,face){const d=init(p);d.plans[key]??={};return d.plans[key][face]??=defaults(face);}
 function modelWalls(p,result,floor){const row=result.floors[floor-1],model=Engine.floorModel(result,floor);return (model?.walls||[]).map(w=>({id:w.id,x1:w.a[0],y1:w.a[1],x2:w.z[0],y2:w.z[1],t:w.b*1000}));}
 function section(walls){
  if(!walls.length)throw Error('请选择至少一段核心墙');
  if(walls.length>20)throw Error('原 Excel 最多 20 段墙；此组未核对，不截断墙段');
  for(const w of walls){if(!['x1','y1','x2','y2','t'].every(k=>finite(w[k]))||w.t<=EPS)throw Error('墙端点与厚度须填写完整，厚度须大于 0');if(Math.abs(w.x2-w.x1)<EPS&&Math.abs(w.y2-w.y1)<EPS)throw Error('墙段长度不能为 0');if(Math.abs(w.x2-w.x1)>=EPS&&Math.abs(w.y2-w.y1)>=EPS)throw Error('原 Excel 仅支持横向／纵向墙段');}
  const ox=Math.min(...walls.flatMap(w=>[w.x1,w.x2])),oy=Math.min(...walls.flatMap(w=>[w.y1,w.y2]));
  const local=walls.map(w=>({...w,x1:w.x1-ox,x2:w.x2-ox,y1:w.y1-oy,y2:w.y2-oy}));
  const axes={x:unique(local.flatMap(w=>[w.x1,w.x2])),y:unique(local.flatMap(w=>[w.y1,w.y2]))};
  if(axes.x.length>10||axes.y.length>10)throw Error('原 Excel 每方向最多 10 条坐标轴；此组未核对');
  const rects=local.map(w=>{const r={x0:Math.min(w.x1,w.x2),x1:Math.max(w.x1,w.x2),y0:Math.min(w.y1,w.y2),y1:Math.max(w.y1,w.y2)},t=w.t/2000;if(Math.abs(w.x2-w.x1)<EPS){r.x0-=t;r.x1+=t;}else{r.y0-=t;r.y1+=t;}return r;});
  const xs=unique(rects.flatMap(r=>[r.x0,r.x1])),ys=unique(rects.flatMap(r=>[r.y0,r.y1])),cells=[],occupied=new Set();
  for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){const x=(xs[i]+xs[i+1])/2,y=(ys[j]+ys[j+1])/2;if(rects.some(r=>x>r.x0&&x<r.x1&&y>r.y0&&y<r.y1)){occupied.add(i+','+j);cells.push({x,y,w:xs[i+1]-xs[i],h:ys[j+1]-ys[j]});}}
  const edges=new Map(),edge=(i,j,u,v)=>{const k=i+','+j;if(edges.has(k))throw Error('墙仅在一点接触，须为完整相连的核心墙');edges.set(k,u+','+v);};
  for(const k of occupied){const [i,j]=k.split(',').map(Number);if(!occupied.has(i+','+(j-1)))edge(i,j,i+1,j);if(!occupied.has((i+1)+','+j))edge(i+1,j,i+1,j+1);if(!occupied.has(i+','+(j+1)))edge(i+1,j+1,i,j+1);if(!occupied.has((i-1)+','+j))edge(i,j+1,i,j);}
  const loops=[];
  while(edges.size){const first=edges.keys().next().value,raw=[];let k=first;do{const [i,j]=k.split(',').map(Number);raw.push([xs[i],ys[j]]);if(!edges.has(k))throw Error('核心墙边界无法闭合');const next=edges.get(k);edges.delete(k);k=next;}while(k!==first);
   const pts=raw.filter((c,i)=>{const a=raw[(i+raw.length-1)%raw.length],b=raw[(i+1)%raw.length];return Math.abs((c[0]-a[0])*(b[1]-c[1])-(c[1]-a[1])*(b[0]-c[0]))>EPS;});
   if(pts.length>20)throw Error('原 Excel 每条轮廓最多 20 个转角；此组未核对');
   const area=pts.reduce((s,c,i)=>{const n=pts[(i+1)%pts.length];return s+(c[0]*n[1]-n[0]*c[1])/2;},0);if(Math.abs(area)<EPS)throw Error('核心墙面积为 0');loops.push({pts,area});
  }
  if(loops.filter(x=>x.area>0).length!==1)throw Error('原 Excel 要求单个相连的核心墙，不能合并分离墙组');
  if(loops.filter(x=>x.area<0).length>2)throw Error('原 Excel 最多 2 个平面孔洞；此组未核对');
  const area=cells.reduce((s,c)=>s+c.w*c.h,0),cx=cells.reduce((s,c)=>s+c.w*c.h*c.x,0)/area,cy=cells.reduce((s,c)=>s+c.w*c.h*c.y,0)/area;
  const Ixx=cells.reduce((s,c)=>s+c.w*c.h*(c.h*c.h/12+(c.y-cy)**2),0),Iyy=cells.reduce((s,c)=>s+c.w*c.h*(c.w*c.w/12+(c.x-cx)**2),0),Ixy=cells.reduce((s,c)=>s+c.w*c.h*(c.x-cx)*(c.y-cy),0),Ix=Iyy-Ixy*Ixy/Ixx,Iy=Ixx-Ixy*Ixy/Iyy;
  if(![area,Ixx,Iyy,Ix,Iy].every(v=>finite(v)&&v>EPS))throw Error('核心墙有效惯性矩须大于 0');
  return {area,cx,cy,Ixx,Iyy,Ixy,Ix,Iy,origin:{x:ox,y:oy},walls:local,rects,cells,axes,loops};
 }
 // Specified building-axis approximation; this is not a neutral-axis/frame analysis.
 function modelColumns(p,result,floor){const row=result.floors[floor-1],m=Engine.floorModel(result,floor);return (m?.columns||[]).map(c=>({id:c.id,x:c.cx??c.x,y:c.cy??c.y,b:c.b,d:c.d,status:c.status}));}
 function buildingAxis(result,floor){const m=Engine.floorModel(result,floor),ts=(m?.ts||[]).filter(t=>t.state!==0);if(!ts.length)throw Error('读取楼层没有建筑范围');const x0=Math.min(...ts.map(t=>t.x0)),x1=Math.max(...ts.map(t=>t.x1)),y0=Math.min(...ts.map(t=>t.y0)),y1=Math.max(...ts.map(t=>t.y1));return {x:(x0+x1)/2,y:(y0+y1)/2,x0,x1,y0,y1};}
 function buildingSection(v){
  const rects=[],Ew=grades[v.grade],Ec=grades[v.columnGrade];
  for(const w of v.walls||[]){if(!['x1','y1','x2','y2','t'].every(k=>finite(w[k]))||w.t<=0)throw Error('墙几何或厚度无效');const dx=Math.abs(w.x2-w.x1),dy=Math.abs(w.y2-w.y1);if((dx<EPS&&dy<EPS)||(dx>=EPS&&dy>=EPS))throw Error('简化计算只支持正交墙');if(!Ew)throw Error('请在共同材料设置 Wall 混凝土等级');rects.push({id:w.id,kind:'Wall',E:Ew,x:(w.x1+w.x2)/2,y:(w.y1+w.y2)/2,w:dx<EPS?w.t/1000:dx,h:dy<EPS?w.t/1000:dy});}
  for(const c of v.columns||[]){if(!['x','y','b','d'].every(k=>finite(c[k]))||c.b<=0||c.d<=0)throw Error('柱几何或尺寸无效');if(!Ec)throw Error('请在共同材料设置 Column 混凝土等级');rects.push({id:c.id,kind:'Column',E:Ec,x:c.x,y:c.y,w:c.b,h:c.d});}
  if(!rects.length)throw Error('请选择至少一个 Wall 或 Column');
  if(!finite(v.axis?.x)||!finite(v.axis?.y))throw Error('建筑中心线未确定');
  // Subdivide overlaps once. Different material grades in an overlap are ambiguous.
  const xs=unique(rects.flatMap(r=>[r.x-r.w/2,r.x+r.w/2])),ys=unique(rects.flatMap(r=>[r.y-r.h/2,r.y+r.h/2]));
  if((xs.length-1)*(ys.length-1)*rects.length>2e7)throw Error('所选截面过于复杂，请减少勾选构件');
  const cells=[],parts=rects.map(r=>({...r,area:0,Ilocal:0,parallel:0,I:0,EI:0}));
  for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){const x=(xs[i]+xs[i+1])/2,y=(ys[j]+ys[j+1])/2,ids=[];rects.forEach((r,k)=>{if(x>r.x-r.w/2&&x<r.x+r.w/2&&y>r.y-r.h/2&&y<r.y+r.h/2)ids.push(k)});if(!ids.length)continue;if(ids.some(k=>Math.abs(rects[k].E-rects[ids[0]].E)>EPS))throw Error('墙柱重叠区域的材料等级不同，请核对几何，不能重复计刚度');const w=xs[i+1]-xs[i],h=ys[j+1]-ys[j],A=w*h,ix=A*h*h/12+A*(y-v.axis.y)**2,iy=A*w*w/12+A*(x-v.axis.x)**2,c={owner:ids[0],x,y,w,h,E:rects[ids[0]].E,Ixx:ix,Iyy:iy};cells.push(c);const p=parts[ids[0]],local=A*(v.direction==='X'?w*w:h*h)/12,parallel=A*(v.direction==='X'?x-v.axis.x:y-v.axis.y)**2;p.area+=A;p.Ilocal+=local;p.parallel+=parallel;p.I+=local+parallel;p.EI+=c.E*1e6*(local+parallel);}
  const area=cells.reduce((s,c)=>s+c.w*c.h,0),cx=cells.reduce((s,c)=>s+c.w*c.h*c.x,0)/area,cy=cells.reduce((s,c)=>s+c.w*c.h*c.y,0)/area,Ixx=cells.reduce((s,c)=>s+c.Ixx,0),Iyy=cells.reduce((s,c)=>s+c.Iyy,0),EI=parts.reduce((s,c)=>s+c.EI,0),referenceE=Ew||Ec;
  if(!finite(EI)||EI<=0)throw Error('所选构件 EI 必须大于 0');
  return {area,cx,cy,Ixx,Iyy,Ixy:0,Ix:Iyy,Iy:Ixx,EI,referenceE,equivalentI:EI/(referenceE*1e6),axis:v.axis,origin:{x:0,y:0},parts,cells,rects};
 }
 function axisExpected(v,g,r){const s={B3:v.axis.x,B4:v.axis.y,B5:v.height,B6:v.q,B7:v.breadth,B8:500,B9:g.EI,B10:r.delta*1000,B11:r.allow*1000,B12:r.ratio,B13:r.status,B14:g.area,B15:v.base,B16:v.roof};g.cells.forEach((c,i)=>{const row=21+i;s['H'+row]=c.w*c.h;s['I'+row]=c.w*c.h*(v.direction==='X'?c.w*c.w:c.h*c.h)/12;s['J'+row]=v.direction==='X'?c.x-v.axis.x:c.y-v.axis.y;s['K'+row]=s['H'+row]*s['J'+row]**2;s['L'+row]=c.E*1e6*(s['I'+row]+s['K'+row]);});return {[v.direction==='X'?'B Axis':'D Axis']:s};}

 function calculate(v){const errors=[];let g;try{g=v.method==='BUILDING_AXIS'?buildingSection(v):section(v.walls||[]);}catch(e){errors.push(e.message);}
  const layered=v.mode==='LAYERED';if(!['UNIFORM','LAYERED'].includes(v.mode))errors.push('请选择均布或逐层风模式');
  for(const [k,s]of [...(layered?[]:[['q','均布使用阶段风压 q'],['breadth','迎风宽度']]),['height','悬臂高度 H'],['limit','挠度限值分母 n']])if(!finite(v[k])||v[k]<=0)errors.push(s+' 须大于 0');
  const layers=v.layers||[];
  if(layered){if(!layers.length)errors.push('请提供至少一段受风层');if(layers.length>500)errors.push('逐层输入最多 500 段');layers.forEach((l,i)=>{if(!['a','b','q','breadth'].every(k=>finite(l[k]))||l.a<0||l.b<=l.a||l.b>v.height+EPS||l.q<0||l.breadth<=0)errors.push((l.id||'第 '+(i+1)+' 段')+'：须补齐风压和宽度，层段须在固定端至楼顶之间');if(layers.slice(0,i).some(o=>Math.min(l.b,o.b)-Math.max(l.a,o.a)>EPS))errors.push('受风层段重叠，不能重复计风荷载');});}
  if(v.method!=='BUILDING_AXIS'&&!grades[v.grade])errors.push('请在共同材料中选择 Wall 混凝土等级');
  if(!['X','Y'].includes(v.direction))errors.push('请选择风向 X / Y');
  if(errors.length)return {ok:false,errors,geometry:g,input:v};
  const E=g.referenceE||grades[v.grade],I=v.method==='BUILDING_AXIS'?g.equivalentI:v.direction==='X'?g.Ix:g.Iy,w=layered?null:v.q*v.breadth;
  const bands=(layered?layers:[{a:0,b:v.height,q:v.q,breadth:v.breadth}]).map(l=>{const w=l.q*l.breadth,F=w*(l.b-l.a);return {...l,w,F,M:F*(l.a+l.b)/2,mm:w*(4*v.height*(l.b**3-l.a**3)-(l.b**4-l.a**4))/(24*E*1e6*I)*1000};});
  const delta=bands.reduce((s,l)=>s+l.mm,0)/1000,allow=v.height/v.limit,ratio=delta/allow,status=ratio<=1?'OK':'NOT OK',drift=delta===0?'NO DRIFT':v.height/delta;
  const profile=Array.from({length:11},(_,i)=>{const x=v.height*i/10;return {z:x,mm:bands.reduce((s,l)=>{const c=Math.min(l.b,x),d=Math.max(l.a,x),lower=l.a<x?x*(c**3-l.a**3)-(c**4-l.a**4)/4:0,upper=l.b>x?x*x*(1.5*(l.b*l.b-d*d)-x*(l.b-d)):0;return s+l.w*(lower+upper)/(6*E*1e6*I)*1000;},0)};});
  const expected={'Deflection Check':{B17:v.q,B18:v.breadth,B19:v.height,B20:E,B21:v.limit,B23:'Inputs complete',B24:v.grade,B28:g.area,B29:g.cx,B30:g.cy,B36:w,B37:E*1e6,B38:I,B39:delta,B40:delta*1000,B41:allow*1000,B42:ratio,B43:v.height/delta,B44:status,Z35:g.area,Z36:g.cx,Z37:g.cy,Z38:g.Ixx,Z39:g.Iyy,Z40:g.Ixy,Z41:g.Ix,Z42:g.Iy,Z44:I},'Core Wall':{J37:g.area,J38:g.cx,J39:g.cy,J40:g.Ixx,J41:g.Iyy,J42:g.Ixy,J43:g.Ix,J44:g.Iy,J45:'VALID',J46:v.direction}};
  expected['Deflection Check'].B43=drift;
  if(layered){delete expected['Deflection Check'].B17;delete expected['Deflection Check'].B18;expected['Deflection Check'].B36='See Layered Wind';}
  if(v.method==='BUILDING_AXIS'){const r={delta,allow,ratio,status};Object.keys(expected).forEach(k=>delete expected[k]);Object.assign(expected,axisExpected(v,g,r));}
  if(v.method!=='BUILDING_AXIS')profile.forEach((r,i)=>{expected['Deflection Check']['B'+(49+i)]=r.z;expected['Deflection Check']['C'+(49+i)]=r.mm;});
  return {ok:true,errors:[],input:v,geometry:g,E,I,w,delta,allow,ratio,status,profile,expected,bands,drift};
 }
 function input(p,result,key,face){const s=saved(p,key,face),errors=[],levels=OverallGeometry.levels(p),roof=levels.at(-1)?.z;let overall,base=null;
  try{overall=OverallGeometry.input(p,face);}catch(e){errors.push('Wind Load Check：'+e.message);}
  base=finite(overall?.leftEL)?overall.leftEL:null;s.base=base;
  s.floor=Number.isInteger(s.floor94)&&result.floors[s.floor94-1]?s.floor94:result.floors.find(f=>levels[f.n]?.z>base+EPS)?.n||1;s.wallSource='model';
  const model=modelWalls(p,result,s.floor),cols=modelColumns(p,result,s.floor),selected=s.selection92?s.selected:model.map(w=>w.id),selectedColumns=s.selectedColumns||[];s.selected=selected;
  const missing=selected.filter(id=>!model.some(w=>w.id===id)),walls=model.filter(w=>selected.includes(w.id)),columns=cols.filter(c=>selectedColumns.includes(c.id));
  if(selectedColumns.some(id=>!cols.some(c=>c.id===id)))errors.push('所选柱已删除／无效');
  if(s.wallSource==='model'&&missing.length)errors.push('所选墙已删除／无效：'+missing.join('、'));
  if(!finite(roof))errors.push('请在楼层设置填写模型底部 mPD，以确定楼顶');
  if(!finite(base))errors.push('请在 Wind Load Check 填写本面受风面底标高');
  if(finite(base)&&finite(levels[0]?.z)&&base<levels[0].z-EPS)errors.push('固定端低于模型底，请先补齐模型范围');
  const average=WindAverage93.fromInput(overall,face);errors.push(...average.errors.map(e=>'Wind Load Check：'+e));
  const q=average.q,breadth=average.breadth,mode='UNIFORM',layers=[];
  if(s.wallSource==='model'&&walls.length&&finite(base)){
   const signature=w=>JSON.stringify([w.x1,w.y1,w.x2,w.y2,w.t].map(v=>+v.toFixed(6)));
   const match=(a,b)=>signature(a)===signature(b)||signature(a)===signature({...b,x1:b.x2,y1:b.y2,x2:b.x1,y2:b.y1});
   const types=new Set();for(const f of result.floors)if(levels[f.n]?.z>base+EPS&&!types.has(f.type)){types.add(f.type);const ws=modelWalls(p,result,f.n);if(walls.some(w=>!ws.some(q=>match(w,q))))errors.push(FloorLevels.name(p,f.n)+' 的所选墙几何不同／不贯通；此简化估算要求沿高等截面');}
  }
  if(columns.length&&finite(base))for(const f of result.floors){if(levels[f.n]?.z<=base+EPS)continue;const cs=modelColumns(p,result,f.n);if(columns.some(c=>!cs.some(q=>['x','y','b','d'].every(k=>Math.abs(c[k]-q[k])<1e-6)&&q.status!=='上层柱')))errors.push(FloorLevels.name(p,f.n)+' 的所选柱不贯通／尺寸不同；此估算要求沿高等截面');}
  const height=finite(roof)&&finite(base)?roof-base:null,sourceLayers=average.layers;
  const axis=buildingAxis(result,s.floor);
  return {v:{windAverage:average,method:'BUILDING_AXIS',axis,columns,columnGrade:'C'+Loading.settings(p).columnFcu,sourceLayers,readFloor:s.floor,readFloorName:FloorLevels.name(p,s.floor),readFraming:result.floors[s.floor-1]?.type,q,breadth,height,base,roof,grade:s.grade,limit:s.limit,direction:face==='B'?'X':'Y',walls,mode,layers,sourceMode:overall?.mode,windStart:overall?.leftEL},s:{...s,mode,direction:face==='B'?'X':'Y'},errors,available:model,availableColumns:cols};
 }
 function assess(p,result,key,face){try{const v=input(p,result,key,face),r=calculate(v.v);return {...r,errors:[...v.errors,...r.errors],ok:r.ok&&!v.errors.length,settings:v.s,available:v.available,availableColumns:v.availableColumns};}catch(e){return {ok:false,errors:[e.message],input:{},settings:saved(p,key,face),available:[]};}}
 // Compatibility entry point: assessment always uses current inputs without changing the project.
 function runCheck(p,result,key,face){return assess(p,result,key,face);}
 function compare(B,D){if(!B.ok||!D.ok)return {governing:null,status:'待 B、D 两面资料完整'};return {governing:Math.abs(B.ratio-D.ratio)<1e-7?'B / D':B.ratio>D.ratio?'B':'D',status:B.status==='OK'&&D.status==='OK'?'OK':'NOT OK'};}
 function job(p,result,key){const faces={};for(const f of ['B','D']){const r=assess(p,result,key,f);if(!r.ok)throw Error(f+' 面：'+r.errors.join('；'));if(r.input.mode==='LAYERED'){const cols=f==='B'?['F','G','H','I','B']:['R','S','T','U','N'],cells={};r.bands.forEach((l,i)=>{['w','F','M','mm'].forEach((k,j)=>cells[cols[j]+(i+13)]=l[k]);});cells[cols[4]+'6']=r.bands.reduce((a,l)=>a+l.F,0);cells[cols[4]+'7']=r.bands.reduce((a,l)=>a+l.M,0);cells[cols[4]+'8']=r.delta*1000;cells[cols[4]+'9']=r.bands.length;cells[cols[4]+'10']='Inputs complete';r.expected['Layered Wind']=cells;}faces[f]={input:r.input,geometry:r.geometry,expected:r.expected};}
  return {type:'Deflection',method:'BUILDING_AXIS',section:'A',label:label(key)+' · Deflection B / D',scheme:label(key),project:p.name,faces};
 }
 function jobs(p,result,forReport=false){const batches=[],issues=[];if(forReport&&p.deflection?.include===false)return {batches,issues};for(const key of planKeys(p))try{batches.push(job(p,result,key));}catch(e){issues.push({id:label(key)+' · Deflection',reason:e.message});}return {batches,issues};}
 return {grades,defaults,init,planKeys,label,saved,edit,modelWalls,modelColumns,buildingAxis,buildingSection,section,calculate,input,assess,runCheck,compare,job,jobs};
})();
