/* Framing App A1. Geometry in metres; section inputs in millimetres. No external dependencies. */
const Engine=(()=>{
 const slabGeometry=typeof SlabGeometry120!=='undefined'?SlabGeometry120:require('./slab-geometry120.js');
 const eps=1e-6, clone=x=>JSON.parse(JSON.stringify(x)), near=(a,b)=>Math.abs(a-b)<eps;
 const unique=a=>[...new Set(a.map(x=>+x.toFixed(6)))].sort((a,b)=>a-b);
 function axisData(p,key){return (typeof key==='string'?p.types[key]:key)?.axes||p.axes;}
 function ownAxes(p,key){if(!p.types[key])throw Error('Framing 类型不存在');return p.types[key].axes??=clone(axisData(p,key));}
 function scoped(p,key){return {...p,axes:axisData(p,key)};}
 function axes(p,d,key){const grid=axisData(p,key);let v=grid.origin?.[d]||0;return grid[d].map((a,i)=>({id:a.id,v:v+=(i?a.gap:0)}));}
 function resolve(p,a,key){return a.ax!==undefined?[axes(p,'x',key).find(x=>x.id===a.ax)?.v+(a.dx||0),axes(p,'y',key).find(x=>x.id===a.ay)?.v+(a.dy||0)]:[a.x,a.y];}
 const panelRect=a=>({x0:a[0],x1:a[1],y0:a[2],y1:a[3]});
 const intersectArea=(a,b)=>Math.max(0,Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0))*Math.max(0,Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0));
 function secondaryAreaRule(t,panel){const r=panelRect(panel),hits=(t.secondaryAreas||[]).map(zone=>({zone,area:zone.rects.reduce((s,q)=>s+intersectArea(r,q),0)})).filter(x=>x.area>eps),area=(r.x1-r.x0)*(r.y1-r.y0);if(!hits.length)return null;if(hits.length===1&&Math.abs(hits[0].area-area)<eps)return hits[0].zone;return {error:'次梁分区边界与当前主梁格不一致或区域重叠，请重画区域',names:hits.map(x=>x.zone.name).join('、')};}
 function addSecondaryArea(p,key,box,direction,gap=null){if(!['X','Y'].includes(direction))throw Error('请选择 X 横向或 Y 纵向');if(gap!==null&&(!Number.isFinite(gap)||gap<100||gap>20000))throw Error('次梁间距须为 100–20000 mm，留空沿用整体');if(!['x0','x1','y0','y1'].every(k=>Number.isFinite(box[k]))||box.x1-box.x0<.01||box.y1-box.y0<.01)throw Error('请画出有效的次梁区域');const t=p.types[key],m=model(p,key),rects=m.panels.map(panelRect).filter(r=>intersectArea(r,box)>eps);let cantilever101=false,root101=null,cbSupported106=false;if(!rects.length){const xs=unique([...axes(p,'x',key).map(a=>a.v),...m.beams.flatMap(b=>[b.rawA[0],b.rawZ[0]]),...m.walls.flatMap(b=>[b.rawA[0],b.rawZ[0]])]),ys=unique([...axes(p,'y',key).map(a=>a.v),...m.beams.flatMap(b=>[b.rawA[1],b.rawZ[1]]),...m.walls.flatMap(b=>[b.rawA[1],b.rawZ[1]])]),snap=(v,values)=>{const x=values.reduce((a,b)=>Math.abs(a-v)<Math.abs(b-v)?a:b);return Math.abs(x-v)<.75?x:v;},r={x0:snap(box.x0,xs),x1:snap(box.x1,xs),y0:snap(box.y0,ys),y1:snap(box.y1,ys)},edges=[...m.walls,...m.beams.filter(b=>b.supportStatus==='connected'&&b.kind!=='SB'&&b.displayKind!=='CB')],choices=direction==='X'?[['left',[r.x0,r.y0],[r.x0,r.y1]],['right',[r.x1,r.y0],[r.x1,r.y1]]]:[['top',[r.x0,r.y0],[r.x1,r.y0]],['bottom',[r.x0,r.y1],[r.x1,r.y1]]],roots=choices.filter(([,a,z])=>covered(edges,a,z));const cb=m.beams.filter(b=>b.displayKind==='CB'&&b.supportStatus==='connected'),pair=choices.every(([,a,z])=>covered(cb,a,z));if((!pair&&roots.length!==1)||!rectAllowed(m.ts,(r.x0+r.x1)/2,(r.y0+r.y1)/2,r.x1-r.x0,r.y1-r.y0))throw Error('请选择完整梁格、两侧有有效根部的 CB 区域，或只有一条固定边的悬挑区域');rects.push(r);if(pair)cbSupported106=true;else{cantilever101=true;root101=roots[0][0];}}if((t.secondaryAreas||[]).some(z=>z.rects.some(a=>rects.some(b=>intersectArea(a,b)>eps))))throw Error('已选梁格属于另一次梁区域，请修改或删除原区域后重画');let n=1;while((t.secondaryAreas||[]).some(a=>a.id==='SBA'+n))n++;const area={id:'SBA'+n,name:'次梁区域 '+n,direction,gap,rects,...(cantilever101?{cantilever101,root101}:cbSupported106?{cbSupported106}:{})};t.autoBeams101=true;(t.secondaryAreas??=[]).push(area);return area;}

 function columnAxes(p,d,key){const t=typeof key==='string'?p.types[key]:key,values=t?.columnGrid?.[d];return values?values.map(v=>({id:'@cg:'+d+':'+v,v})):axes(p,d,key);}
 function columnGridDraft(p,key,x,y){const grid={targetX:x,targetY:y};for(const [d,target]of [['x',x],['y',y]]){if(!Number.isFinite(target)||target<=0||target>500)throw Error('目标柱间距须大于 0 且不超过 500 m');const a=axes(p,d,key),lo=a[0].v,hi=a.at(-1).v,n=Math.max(1,Math.round((hi-lo)/target));if(n>39)throw Error('柱轴线每方向最多 40 条，请增大目标间距');grid[d]=Array.from({length:n+1},(_,i)=>+(lo+(hi-lo)*i/n).toFixed(6));}return grid;}
 function noColumn(t,x,y){return (t.noColumnZones||[]).some(r=>x>r.x0+eps&&x<r.x1-eps&&y>r.y0+eps&&y<r.y1-eps);}
 function columnRecordValid(grid,c){const valid=(d,id)=>grid[d].some(a=>a.id===id)||typeof id==='string'&&new RegExp('^@cg:'+d+':-?\\d+(?:\\.\\d+)?$').test(id)&&Number.isFinite(+id.split(':')[2])&&Math.abs(+id.split(':')[2])<=10000;return valid('x',c.ax)&&valid('y',c.ay);}
 function addColumn(p,key,x,y){const t=p.types[key],m=model(p,key);if(![x,y].every(Number.isFinite))throw Error('请填写有效柱坐标');if(noColumn(t,x,y))throw Error('禁柱区内部不能补柱；边界和角点可以');if(![-eps,eps].some(dx=>[-eps,eps].some(dy=>inside(m.ts,x+dx,y+dy,true))))throw Error('柱须放在建筑范围内或边界上');if(m.columns.some(c=>{const ref=columnReference(p,key,c);return Math.hypot(ref[0]-x,ref[1]-y)<Math.min(c.b,c.d)/2;}))throw Error('此位置已有柱');let n=1;while([...t.columns,...m.columns].some(c=>c.id==='C'+n))n++;const c={id:'C'+n,x,y,b:p.defaults.cb,d:p.defaults.cd,status:'上下贯通',on:true,...(t.mode==='auto'?{autoAdded:true}:{})};t.columnPlacements=(t.columnPlacements||[]).filter(v=>v.key!=='id:'+c.id);t.columnAxisPositions=(t.columnAxisPositions||[]).filter(v=>v.key!=='id:'+c.id);t.columns.push(c);const built=baseModel(p,key).columns.find(q=>q.id===c.id);if(!built||!rectAllowed(m.ts,columnRect(built).x,columnRect(built).y,built.b,built.d,true)||m.columns.some(q=>overlap(columnRect(q),columnRect(built)))){t.columns.pop();throw Error('此位置与柱、墙或边界冲突，不能补柱');}return c;}
 function setColumnMode(p,key,mode){const t=p.types[key];if(!['auto','manual'].includes(mode))throw Error('柱模式无效');if(t.mode==='auto'&&mode==='manual'){const drawn=model(p,key).columns,positions=(t.columnAxisPositions||[]).map(r=>{const c=drawn.find(c=>columnPositionKey(c)===r.key);return c?{...r,key:'id:'+c.id}:r;});const hasPositions=positions.length>0,hidden=t.columns.filter(c=>!drawn.some(d=>d.id===c.id));if(t.columnPlacements?.length)t.columnPlacements=drawn.map(c=>({key:'id:'+c.id,x:columnRect(c).x,y:columnRect(c).y}));t.columns=[...drawn.map(c=>({id:c.id,x:(t.columnPlacements?.length||columnPositionRecord(t,c))?columnReference(p,key,c)[0]:c.reference?.[0]??c.x,y:(t.columnPlacements?.length||columnPositionRecord(t,c))?columnReference(p,key,c)[1]:c.reference?.[1]??c.y,b:c.b*1000,d:c.d*1000,status:c.status,on:true,transferColumn:!!c.transferManual})),...hidden];if(hasPositions)t.columnAxisPositions=positions;}t.mode=mode;}

 function structuralHeight(g){const hr=g.headroom,em=g.em,has=v=>v!==null&&v!==undefined&&v!=='';if(!has(hr)&&!has(em))return g.sh;if(!has(hr)||!has(em))throw Error('请同时填写 Headroom 和 E&M Zone（没有 E&M Zone 可填 0）');if(![g.h,hr,em].every(Number.isFinite)||hr<0||em<0)throw Error('层高、Headroom 和 E&M Zone 须为有效非负数');const sh=Math.round((g.h-hr-em)*1e6)/1000;if(sh<1||sh>10000)throw Error('层高 − Headroom − E&M Zone 须为 0.001–10 m');return sh;}
 function applyClearances(p,values){const draft=clone(p),groups=[];let from=1;for(const g of draft.groups){const to=g.end==='顶层'?draft.total:g.end;for(let f=from;f<=to;f++){const c={...g,...(values[f]||{}),end:f};c.sh=structuralHeight(c);const last=groups.at(-1),same=last&&JSON.stringify({...last,end:0})===JSON.stringify({...c,end:0});if(same)last.end=f;else groups.push(c);}from=to+1;}groups.at(-1).end='顶层';draft.groups=groups;validate(draft);p.groups=groups;}

 function validate(p){
  const fail=s=>{throw Error(s)},num=(n,lo,hi,s)=>{if(typeof n!=='number'||!Number.isFinite(n)||n<lo||n>hi)fail(s);};
  if(p?.format!=='framing-app'||p.version!==1)fail('不是本 App 的项目文件');
  if(p.overall!==undefined){if(p.overall?.version!==1||!p.overall.faces||typeof p.overall.faces!=='object')fail('Overall Check 数据无效');for(const f of Object.keys(p.overall.faces)){if(!['B','D'].includes(f))fail('Overall Check 面无效');const q=p.overall.faces[f];if(!q||typeof q!=='object')fail('Overall Check 输入无效');for(const field of ['input','committed','attempt'])if(q[field]!==undefined)Overall.normalize(q[field],f);}}
  if(p.elevationLevels!==undefined){const v=p.elevationLevels;if(!v||typeof v!=='object')fail('楼层标高数据无效');if(v.base!==null)num(v.base,-10000,10000,'模型底 mPD 无效');if(v.basementFromNames!==undefined&&typeof v.basementFromNames!=='boolean')fail('地下室识别设置无效');if(v.names!==undefined&&(!v.names||typeof v.names!=='object'||Object.entries(v.names).some(([k,n])=>!/^\d+$/.test(k)||typeof n!=='string'||n.length>40)))fail('楼层名称无效');}
  if(typeof p.name!=='string'||p.name.length>150)fail('项目名称无效');
  if(p.alignColumns!==undefined&&typeof p.alignColumns!=='boolean')fail('上下层柱对齐设置无效');
  num(p.total,1,500,'总层数应为 1–500');if(!Number.isInteger(p.total))fail('总层数须为整数');
  const validateAxes=grid=>{for(const d of ['x','y']){if(!Array.isArray(grid?.[d])||grid[d].length<2||grid[d].length>20)fail('每方向轴线数量为 2–20');const seen=new Set();grid[d].forEach((a,i)=>{if(typeof a.id!=='string'||!a.id||a.id.length>20||seen.has(a.id))fail('轴名不可为空或重复');seen.add(a.id);num(a.gap,i?.001:0,500,'轴距应为正数 (m)');});}if(grid.origin!==undefined){num(grid.origin.x??0,0,10000,'轴线 X 原点无效');num(grid.origin.y??0,0,10000,'轴线 Y 原点无效');}};validateAxes(p.axes);
  const keys=Object.keys(p.types||{});if(!keys.length||keys.length>30||keys.some(k=>!/^F[0-9A-Za-z_-]{1,20}$/.test(k)))fail('类型名称须以 F 开头，最多 30 种');
  if(!Array.isArray(p.groups)||!p.groups.length||p.groups.length>100)fail('须填写楼层分组');
  let end=0;const heights={};
  for(const g of p.groups){if(!keys.includes(g.type))fail('分组的 Framing 类型不存在');const e=g.end==='顶层'?p.total:g.end;num(e,1,500,'结束层须为整数或“顶层”');if(!Number.isInteger(e)||(end<p.total&&e<=end))fail('结束层须递增');end=Math.max(end,e);num(g.h,.1,30,'层高须为 0.1–30 m');const effectiveSH=structuralHeight(g);num(effectiveSH,1,10000,'Structural Height 须为 1–10000 mm');num(g.min,0,500,'最小柱距须为 0–500 m');if(p.types[g.type].beamDepth!=null)num(p.types[g.type].beamDepth,1,10000,'Framing 默认梁深须为 1–10000 mm');}
  if(end<p.total)fail('楼层分组未覆盖到顶层');
  for(const k of ['cb','cd','gap','mb','sb','tb','tbd','slab','wall'])num(p.defaults?.[k],k==='gap'?100:1,20000,'默认尺寸无效：'+k);
  if(!['自动','X','Y'].includes(p.defaults.direction))fail('次梁方向无效');
  const point=(a,key)=>{if(!a||typeof a!=='object')fail('端点缺失');const v=resolve(p,a,key);v.forEach(n=>num(n,-5000,10000,'轴线引用或坐标无效'));};
  for(const [key,t] of Object.entries(p.types)){if(t.columnDefaults101)for(const k of ['cb','cd'])num(t.columnDefaults101[k],1,20000,'Framing 默认柱尺寸无效：'+k);if(t.autoBeams101!==undefined&&typeof t.autoBeams101!=='boolean')fail('自动排梁设置无效');
   if(t.beamLayout116!==undefined){const v=t.beamLayout116;if(!v||typeof v!=='object'||typeof v.main!=='boolean'||typeof v.secondary!=='boolean'||!['XY','X','Y'].includes(v.mainDirection)||!['自动','X','Y'].includes(v.secondaryDirection)||!['all','selected'].includes(v.scope))fail('梁布置设置无效');num(v.gap,100,20000,'次梁间距须为 100–20000 mm');}
   if(t.slabDirections116!==undefined){const v=t.slabDirections116;if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).length>4000||Object.entries(v).some(([k,d])=>!k.startsWith('SLAB|')||!['X','Y'].includes(d)))fail('板受力方向设置无效');}
   if(t.beamWidths83!==undefined){if(!t.beamWidths83||typeof t.beamWidths83!=='object'||Array.isArray(t.beamWidths83))fail('自动梁宽记录无效');for(const value of Object.values(t.beamWidths83))num(value,1,20000,'自动梁宽无效');}const grid=axisData(p,key);validateAxes(grid);validateColumnPositions(t,grid);if(t.columnPlacements!==undefined){if(!Array.isArray(t.columnPlacements)||t.columnPlacements.length>2000)fail('柱对齐记录无效');const seen=new Set();for(const r of t.columnPlacements){if(typeof r.key!=='string'||seen.has(r.key))fail('柱对齐定位重复');seen.add(r.key);num(r.x,-5000,10000,'柱对齐 X 无效');num(r.y,-5000,10000,'柱对齐 Y 无效');}}
   if(t.columnGrid){for(const d of ['x','y']){const ar=t.columnGrid[d];if(!Array.isArray(ar)||ar.length<2||ar.length>40)fail('柱轴线每方向须为 2–40 条');ar.forEach((v,i)=>{num(v,-5000,10000,'柱轴线坐标无效');if(i&&v-ar[i-1]<.001)fail('柱轴线坐标须递增且间距至少 0.001 m');});}for(const d of ['targetX','targetY'])num(t.columnGrid[d],.001,500,'目标柱间距无效');}
   if(t.secondaryAreas!==undefined){if(!Array.isArray(t.secondaryAreas)||t.secondaryAreas.length>100)fail('次梁区域最多 100 个');const ids=new Set(),all=[];for(const z of t.secondaryAreas){if(typeof z.id!=='string'||!z.id||ids.has(z.id)||typeof z.name!=='string'||!z.name.trim()||z.name.length>80)fail('次梁区域名称／编号无效');ids.add(z.id);if(!['X','Y'].includes(z.direction))fail('次梁区域方向须为 X 或 Y');if(z.gap!==null)num(z.gap,100,20000,'区域次梁间距须为 100–20000 mm');if(!Array.isArray(z.rects)||!z.rects.length||z.rects.length>400)fail('次梁区域梁格记录无效');for(const r of z.rects){for(const k of ['x0','x1','y0','y1'])num(r[k],-5000,10000,'次梁区域坐标无效');if(r.x1<=r.x0||r.y1<=r.y0)fail('次梁区域范围无效');if(all.some(q=>intersectArea(r,q)>eps))fail('次梁区域不能重叠');all.push(r);if(all.length>400)fail('次梁区域最多覆盖 400 个梁格');}}}
   if(t.noColumnZones!==undefined){if(!Array.isArray(t.noColumnZones)||t.noColumnZones.length>400)fail('禁柱区最多 400 个');for(const r of t.noColumnZones){for(const k of ['x0','x1','y0','y1'])num(r[k],-5000,10000,'禁柱区坐标无效');if(r.x1-r.x0<.001||r.y1-r.y0<.001)fail('禁柱区须有有效宽度和高度');}}
   if(t.minColumnSpacing!==undefined)num(t.minColumnSpacing,0,500,'旧柱距限制无效');
   if(t.alignmentMinSpacing!==undefined)num(t.alignmentMinSpacing,0,500,'对齐柱距限制无效');
   if(!['manual','auto'].includes(t.mode))fail('柱模式无效');
   for(const layer of ['building','opening']){if(!t[layer]||typeof t[layer]!=='object'||Object.keys(t[layer]).length>400)fail('区域数据无效');for(const [k,v] of Object.entries(t[layer]))if(!/^\d+,\d+$/.test(k)||typeof v!=='boolean')fail('区域格数据无效');}
   for(const list of ['columns','walls','beams']){if(!Array.isArray(t[list])||t[list].length>2000)fail('构件数过多');const ids=new Set();for(const c of t[list]){if(typeof c.id!=='string'||!c.id||c.id.length>50||ids.has(c.id))fail(key+' 构件编号重复或无效');ids.add(c.id);num(c.b,1,20000,'构件宽度无效');if(typeof c.on!=='boolean')fail('启用状态无效');if(list==='columns'){if(c.transferColumn!==undefined&&typeof c.transferColumn!=='boolean')fail('Transfer column 标记无效');point(c,key);num(c.d,1,20000,'柱 D 无效');if(!['上下贯通','下层柱','上层柱'].includes(c.status))fail('柱状态无效');}else{point(c.a,key);point(c.z,key);if(list==='walls'&&c.axisPosition!==undefined){const a=resolve(p,c.a,key),z=resolve(p,c.z,key);if(!(near(a[1],z[1])?['auto','up','center','down']:['auto','left','center','right']).includes(c.axisPosition))fail('墙轴线位置与方向不符');}if(list==='beams'){if(c.widthMode!==undefined&&!['column','manual'].includes(c.widthMode))fail('梁宽模式无效');if(!['MB','SB','TB','CB'].includes(c.kind))fail('梁种类无效');if(c.d!==null)num(c.d,1,20000,'梁深无效');}}}}
   if(!Array.isArray(t.suppressed)||t.suppressed.length>2000||t.suppressed.some(s=>typeof s!=='string'))fail('梁覆盖记录无效');
   if(t.suppressedColumns!==undefined){if(!Array.isArray(t.suppressedColumns)||t.suppressedColumns.length>400)fail('柱删除记录无效');for(const c of t.suppressedColumns)if(!columnRecordValid(grid,c))fail('柱删除记录的轴名无效');}
   if(t.slabVoids!==undefined){if(!Array.isArray(t.slabVoids)||t.slabVoids.length>4000)fail('楼板删除记录过多');for(const r of t.slabVoids){for(const k of ['x0','x1','y0','y1'])num(r[k],-5000,10000,'楼板删除坐标无效');if(r.x1<=r.x0||r.y1<=r.y0)fail('楼板删除范围无效');}}
   if(t.transferColumns!==undefined){if(!Array.isArray(t.transferColumns)||t.transferColumns.length>400)fail('Transfer column 记录无效');for(const c of t.transferColumns)if(!columnRecordValid(grid,c))fail('Transfer column 轴名无效');}
   if(t.columnSizes!==undefined){if(!Array.isArray(t.columnSizes)||t.columnSizes.length>400)fail('柱尺寸记录无效');for(const c of t.columnSizes){if(!columnRecordValid(grid,c))fail('柱尺寸轴名无效');num(c.b,1,20000,'柱 B 无效');num(c.d,1,20000,'柱 D 无效');}}
   if(t.slabSizes!==undefined){if(!Array.isArray(t.slabSizes)||t.slabSizes.length>4000)fail('板厚记录无效');for(const s of t.slabSizes){if(typeof s.signature!=='string')fail('板厚范围无效');num(s.value,1,20000,'板厚无效');}}
  }
  if(typeof LocalHeights96!=="undefined")LocalHeights96.validate(p);
  return p;
 }
 function floors(p){let from=1,a=[];for(const g of p.groups){const to=Math.min(g.end==='顶层'?p.total:g.end,p.total);for(let n=from;n<=to;n++)a.push({n,name:FloorLevels.name(p,n),basement:FloorLevels.isBasement(FloorLevels.name(p,n)),h:g.h,type:g.type,sh:structuralHeight(g),headroom:g.headroom,em:g.em,min:g.min});from=to+1;}return a;}
 function tiles(p,t){const xs=axes(p,'x',t),ys=axes(p,'y',t),out=[];for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){const k=i+','+j;out.push({i,j,k,x0:xs[i].v,x1:xs[i+1].v,y0:ys[j].v,y1:ys[j+1].v,state:!t.building[k]?0:t.opening[k]?2:1});}return out;}
 const inside=(ts,x,y,building=false)=>ts.some(t=>(t.state===1||(building&&t.state===2))&&x>t.x0&&x<t.x1&&y>t.y0&&y<t.y1);
 function rectAllowed(ts,x,y,w,d,building=false){let area=0;for(const t of ts)if(t.state===1||(building&&t.state===2))area+=Math.max(0,Math.min(x+w/2,t.x1)-Math.max(x-w/2,t.x0))*Math.max(0,Math.min(y+d/2,t.y1)-Math.max(y-d/2,t.y0));return area>=w*d-1e-7;}
 function align(ts,a,z,b,wall=false,position="auto"){
  if(wall)return wallPosition(ts,a,z,b,position);
  const h=near(a[1],z[1]);if(!h&&!near(a[0],z[0])||Math.hypot(a[0]-z[0],a[1]-z[1])<eps)return null;
  const idx=h?0:1,lo=Math.min(a[idx],z[idx]),hi=Math.max(a[idx],z[idx]);const cuts=unique([lo,hi,...ts.flatMap(t=>h?[t.x0,t.x1]:[t.y0,t.y1]).filter(v=>v>lo&&v<hi)]);let shift;
  for(let i=0;i<cuts.length-1;i++){const mid=(cuts[i]+cuts[i+1])/2,x=h?mid:a[0],y=h?a[1]:mid,delta=.00001;const pl=inside(ts,x+(h?0:delta),y+(h?delta:0)),mi=inside(ts,x-(h?0:delta),y-(h?delta:0)),bp=inside(ts,x+(h?0:delta),y+(h?delta:0),true),bm=inside(ts,x-(h?0:delta),y-(h?delta:0),true);let s;if(wall&&bp!==bm)s=bp?b/2:-b/2;else if(pl&&mi)s=0;else if(pl!==mi)s=pl?b/2:-b/2;else return null;if(shift!==undefined&&!near(s,shift))return null;shift=s;}
  return {a:[a[0]+(h?0:shift),a[1]+(h?shift:0)],z:[z[0]+(h?0:shift),z[1]+(h?shift:0)]};
 }
 const rect=m=>({x:(m.a[0]+m.z[0])/2,y:(m.a[1]+m.z[1])/2,w:near(m.a[1],m.z[1])?Math.abs(m.z[0]-m.a[0]):m.b,d:near(m.a[1],m.z[1])?m.b:Math.abs(m.z[1]-m.a[1])});
 function lineAllowed(ts,a,z,b,edgeInset=false){
  const pos=align(ts,a,z,b);if(!pos)return null;
  const fits=pos=>{const r=rect({...pos,b});return rectAllowed(ts,r.x,r.y,r.w,r.d);};if(fits(pos))return pos;
  if(!edgeInset)return null;
  // Resizing may inset the physical section only; retain the input/support line.
  // Never move along the span, cross an opening, or move the reference outside B.
  const horizontal=near(a[1],z[1]),cross=horizontal?1:0,origin=a[cross];
  const candidates=unique(ts.filter(t=>t.state===1).flatMap(t=>horizontal?[t.y0+b/2,t.y1-b/2]:[t.x0+b/2,t.x1-b/2]))
   .filter(v=>Math.abs(v-origin)<=b/2+eps).map(v=>{const aa=[...a],zz=[...z];aa[cross]=zz[cross]=v;return {a:aa,z:zz};}).filter(fits)
   .sort((u,v)=>Math.abs(u.a[cross]-origin)-Math.abs(v.a[cross]-origin));
  if(!candidates.length)return null;
  if(candidates.length>1&&near(Math.abs(candidates[0].a[cross]-origin),Math.abs(candidates[1].a[cross]-origin)))return null;
  return candidates[0];
 }
 const overlap=(r,s)=>Math.abs(r.x-s.x)<(r.w+s.w)/2-eps&&Math.abs(r.y-s.y)<(r.d+s.d)/2-eps;
 const on=(q,m)=>{const r=rect(m);return Math.abs(q[0]-r.x)<=r.w/2+eps&&Math.abs(q[1]-r.y)<=r.d/2+eps;};
 const sig=(a,z)=>[a,z].map(v=>v.map(n=>n.toFixed(5)).join(',')).sort().join('|');
 function covered(list,a,z){const h=near(a[1],z[1]),idx=h?0:1,fix=h?1:0;let at=Math.min(a[idx],z[idx]),end=Math.max(a[idx],z[idx]);const intervals=list.filter(m=>near(m.rawA[fix],a[fix])&&near(m.rawZ[fix],a[fix])).map(m=>[Math.min(m.rawA[idx],m.rawZ[idx]),Math.max(m.rawA[idx],m.rawZ[idx])]).sort((a,b)=>a[0]-b[0]);for(const [lo,hi]of intervals){if(lo>at+eps)break;if(hi>at)at=hi;}return at>=end-eps;}
 const columnRect=c=>({x:c.cx??c.x,y:c.cy??c.y,w:c.b,d:c.d});
 // Optional section offsets. Missing records leave automatic placement byte-for-byte unchanged.
 const columnDirections={center:[0,0],up:[0,-1],down:[0,1],left:[-1,0],right:[1,0],'up-left':[-1,-1],'up-right':[1,-1],'down-left':[-1,1],'down-right':[1,1]};
 const columnPositionKey=c=>c.anchorX!==undefined?'axis:'+c.anchorX+'|'+c.anchorY:'id:'+c.id;
 const columnPositionRecord=(t,c)=>(t.columnAxisPositions||[]).find(r=>r.key===columnPositionKey(c));
 function validateColumnPositions(t,grid){
  if(t.columnAxisPositions===undefined)return;
  if(!Array.isArray(t.columnAxisPositions)||t.columnAxisPositions.length>2000)throw Error('手动柱位置记录无效');
  const seen=new Set();for(const r of t.columnAxisPositions){if(!r||typeof r.key!=='string'||!r.key.match(/^(id:.+|axis:.+\|.+)$/)||seen.has(r.key)||!Object.hasOwn(columnDirections,r.position))throw Error('手动柱位置无效');seen.add(r.key);}
 }
 function setColumnPosition(p,key,id,position){
  if(position!==''&&!Object.hasOwn(columnDirections,position))throw Error('请选择有效柱位置');
  const t=p.types[key],m=model(p,key),c=m.columns.find(c=>columnPositionKey(c)===id),stored=id.startsWith('id:')?t.columns.find(c=>'id:'+c.id===id):null;
  if(!c&&!stored)throw Error('柱已不存在，请重新选择');
  const records=t.columnAxisPositions,placements=t.columnPlacements;
  t.columnAxisPositions=(records||[]).filter(r=>r.key!==id);
  if(position){t.columnAxisPositions.push({key:id,position});t.columnPlacements=(placements||[]).filter(r=>r.key!==id);}
  try{
   if(c){const next=model(p,key),after=next.columns.find(q=>columnPositionKey(q)===id);if(!after)throw Error('此方向与墙或建筑范围冲突，请选择其他位置');const r=columnRect(after);if(!rectAllowed(next.ts,r.x,r.y,r.w,r.d,true))throw Error('此方向会使柱截面越出建筑范围，请选择其他位置');if(next.columns.some(q=>columnPositionKey(q)!==id&&overlap(columnRect(q),r)))throw Error('此方向会与其他柱重叠，请选择其他位置');}
  }catch(e){if(records===undefined)delete t.columnAxisPositions;else t.columnAxisPositions=records;if(placements===undefined)delete t.columnPlacements;else t.columnPlacements=placements;throw e;}
 }

 function secondaryDepth(span,height){return Math.min(Math.ceil(span*1000/15/50-1e-9)*50/1000,height);}

 // Walls use the input axis as their reference; their physical section can sit on either side.
 function wallPosition(ts,a,z,b,position='auto'){
  const h=near(a[1],z[1]);if((!h&&!near(a[0],z[0]))||Math.hypot(a[0]-z[0],a[1]-z[1])<eps)return null;
  if(!(h?['auto','up','center','down']:['auto','left','center','right']).includes(position))return null;
  const idx=h?0:1,lo=Math.min(a[idx],z[idx]),hi=Math.max(a[idx],z[idx]),cuts=unique([lo,hi,...ts.flatMap(t=>h?[t.x0,t.x1]:[t.y0,t.y1]).filter(v=>v>lo&&v<hi)]),sides=[];
  for(let i=0;i<cuts.length-1;i++){
   const mid=(cuts[i]+cuts[i+1])/2,x=h?mid:a[0],y=h?a[1]:mid,d=.00001;
   const plus=[x+(h?0:d),y+(h?d:0)],minus=[x-(h?0:d),y-(h?d:0)];
   if(!inside(ts,...plus,true)&&!inside(ts,...minus,true))return null;
   const opening=q=>ts.some(t=>t.state===2&&q[0]>t.x0&&q[0]<t.x1&&q[1]>t.y0&&q[1]<t.y1);
   const p=opening(plus),m=opening(minus);sides.push(p===m?0:p?1:-1);
  }
  const direction=position==='auto'?(sides.every(v=>v===sides[0])?sides[0]:0):['down','right'].includes(position)?1:['up','left'].includes(position)?-1:0;
  const shift=direction*b/2;return {a:[a[0]+(h?0:shift),a[1]+(h?shift:0)],z:[z[0]+(h?0:shift),z[1]+(h?shift:0)]};
 }
 function mainBeamWidth(columns,a,z,fallback){
  const h=near(a[1],z[1]),ends=columns.filter(c=>c.status!=='上层柱'&&[a,z].some(q=>Math.abs(columnRect(c).x-q[0])<=c.b/2+eps&&Math.abs(columnRect(c).y-q[1])<=c.d/2+eps));
  return ends.length?Math.min(...ends.map(c=>h?c.d:c.b)):fallback;
 }
 function baseModel(p,key,localRects=[],referenceModel=null){p=scoped(p,key);
  const t=p.types[key],ts=tiles(p,t).map(tile=>tile.state!==0&&localRects.some(r=>LocalHeights96.overlap(tile,r)>1e-7)?{...tile,state:2}:tile),gs=p.groups.filter(g=>g.type===key),sh=(t.beamDepth??(gs[0]?structuralHeight(gs[0]):600))/1000,min=t.columnGrid?0:t.minColumnSpacing??Math.max(0,...gs.map(g=>g.min)),df={...p.defaults,...t.columnDefaults101},issues=[],walls=[],columns=[],beams=[],panels=[];
  const issue=(id,msg)=>issues.push({type:key,id,msg});
  const layout=t.beamLayout116,autoMain=layout?.main??(t.autoBeams101!==false),autoSecondary=layout?.secondary??(t.autoBeams101!==false),mainDirection=layout?.mainDirection||'XY';
  if(referenceModel)walls.push(...clone(referenceModel.walls));
  for(const c of (referenceModel?[]:t.walls.filter(c=>c.on))){const a=resolve(p,c.a),z=resolve(p,c.z),b=c.b/1000,pos=align(ts,a,z,b,true,c.axisPosition??"auto");if(!pos){issue(c.id,'墙不在有效边界或贴边方向改变，请分段');continue;}walls.push({...c,...pos,b,rawA:a,rawZ:z,kind:'WALL'});}
  const wr=walls.map(rect);
  if(referenceModel){columns.push(...clone(referenceModel.columns));}else{
  let input=t.columns.filter(c=>c.on).map(c=>({...c,x:resolve(p,c)[0],y:resolve(p,c)[1],b:c.b/1000,d:c.d/1000}));
  {const xx=axes(p,'x'),yy=axes(p,'y');for(const c of input){c.cx=c.x+(near(c.x,xx[0].v)?c.b/2:near(c.x,xx.at(-1).v)?-c.b/2:0);c.cy=c.y+(near(c.y,yy[0].v)?c.d/2:near(c.y,yy.at(-1).v)?-c.d/2:0);}}
  if(t.mode==='auto'){const added=input.filter(c=>c.autoAdded);input=[];const cx=columnAxes(p,'x',key),cy=columnAxes(p,'y',key);for(const [ix,x]of cx.entries())for(const [iy,y]of cy.entries()){if(noColumn(t,x.v,y.v))continue;if(t.columnGrid&&(t.suppressedColumns||[]).some(q=>q.ax===x.id&&q.ay===y.id))continue;if(added.some(c=>near(c.x,x.v)&&near(c.y,y.v)))continue;const custom=t.columnSizes?.find(q=>q.ax===x.id&&q.ay===y.id),b=(custom?.b??df.cb)/1000,d=(custom?.d??df.cd)/1000;let found=false;for(const dx of [0,b/2,-b/2]){for(const dy of [0,d/2,-d/2]){let id=t.columnGrid?'ACG'+(ix+1)+'_'+(iy+1):'AC'+(input.length+1);while(added.some(c=>c.id===id))id+='A';const c={id,anchorX:x.id,anchorY:y.id,x:x.v+dx,y:y.v+dy,b,d,status:'上下贯通',on:true};const r={...c,w:b};if(!rectAllowed(ts,c.x,c.y,b,d,true)||wr.some(w=>overlap(r,w))||input.some(o=>Math.hypot(c.x-o.x,c.y-o.y)<min-eps||overlap(r,{...o,w:o.b})))continue;input.push(c);found=true;break;}if(found)break;}}input.push(...added);}
  for(const c of input){const placement=(t.columnPlacements||[]).find(v=>v.key===(c.anchorX!==undefined?'axis:'+c.anchorX+'|'+c.anchorY:'id:'+c.id));if(placement){c.alignmentReference=[c.x,c.y];c.x=c.cx=placement.x;c.y=c.cy=placement.y;c.alignmentNote='已应用柱对齐 · 可撤销';}}
  // Apply only explicit manual section positions after the unchanged auto-column search.
  for(const c of input){const record=columnPositionRecord(t,c);if(record&&!t.columnPlacements?.some(v=>v.key===columnPositionKey(c))){const ref=columnReference(p,key,c),offset=columnDirections[record.position];c.cx=ref[0]+offset[0]*c.b/2;c.cy=ref[1]+offset[1]*c.d/2;c.axisPosition=record.position;}}
  for(const c of input){if(c.anchorX===undefined&&noColumn(t,c.x,c.y))issue(c.id,'手动柱位于禁柱区内部，请移动或删除；现有柱保留');if(t.mode==='auto'&&c.anchorX!==undefined){const custom=t.columnSizes?.find(o=>o.ax===c.anchorX&&o.ay===c.anchorY);if(custom){c.b=custom.b/1000;c.d=custom.d/1000;}}if(t.mode==='auto'&&c.anchorX!==undefined&&(t.suppressedColumns||[]).some(s=>s.ax===c.anchorX&&s.ay===c.anchorY))continue;const allowed=[-1e-5,1e-5].some(dx=>[-1e-5,1e-5].some(dy=>inside(ts,c.x+dx,c.y+dy,true)));if(!allowed){issue(c.id,'柱位于建筑外，未作为支承');continue;}if(wr.some(w=>overlap(columnRect(c),w))){issue(c.id,'柱与墙重叠，未生成此柱');continue;}columns.push(c);if(!rectAllowed(ts,columnRect(c).x,columnRect(c).y,c.b,c.d,true))issue(c.id,'柱截面跨过建筑边界，请调整坐标');}
  }
  for(let i=0;i<columns.length;i++)for(let j=i+1;j<columns.length;j++){const a=columns[i],b=columns[j],limit=Math.max(min,t.alignmentMinSpacing||0),ar=columnRect(a),br=columnRect(b);if(Math.hypot(ar.x-br.x,ar.y-br.y)<limit-eps)issue(a.id+'/'+b.id,'柱距小于 '+limit+' m');if(overlap(ar,br))issue(a.id+'/'+b.id,'柱截面重叠');}
  const support=q=>columns.some(c=>Math.abs(columnRect(c).x-q[0])<=c.b/2+eps&&Math.abs(columnRect(c).y-q[1])<=c.d/2+eps&&c.status!=='上层柱')||walls.some(w=>on(q,{...w,a:w.rawA,z:w.rawZ}));
  for(const c of t.beams.filter(c=>c.on)){const a=resolve(p,c.a),z=resolve(p,c.z),b=c.kind==='MB'&&c.widthMode==='column'?mainBeamWidth(columns,a,z,(t.beamWidths83?.[sig(a,z)]??df.mb)/1000):(['MB','SB'].includes(c.kind)?t.beamWidths83?.[sig(a,z)]??c.b:c.b)/1000,pos=lineAllowed(ts,a,z,b,c.edgeInset===true);if(!pos){issue(c.id,'梁越界、穿 Opening 或非正交，未生成');continue;}beams.push({...c,...pos,b,d:c.kind==='SB'?secondaryDepth(Math.hypot(z[0]-a[0],z[1]-a[1]),sh):c.kind==='MB'?sh:(c.d??(c.kind==='TB'?df.tbd:sh*1000))/1000,rawA:a,rawZ:z,source:'manual'});}
  const xs=unique([...columns.map(c=>c.x),...walls.flatMap(w=>[w.rawA[0],w.rawZ[0]])]),ys=unique([...columns.map(c=>c.y),...walls.flatMap(w=>[w.rawA[1],w.rawZ[1]])]);
  const exists=(a,z)=>t.suppressed.includes(sig(a,z))||beams.some(b=>sig(b.rawA,b.rawZ)===sig(a,z))||covered(walls,a,z);
  const add=(a,z,kind)=>{if(exists(a,z))return;const b=kind==='MB'?mainBeamWidth(columns,a,z,(t.beamWidths83?.[sig(a,z)]??df.mb)/1000):(t.beamWidths83?.[sig(a,z)]??df.sb)/1000,pos=lineAllowed(ts,a,z,b);if(pos)beams.push({id:kind+(1+beams.filter(b=>b.kind===kind&&b.source==='auto').length),...pos,b,d:kind==='SB'?secondaryDepth(Math.hypot(z[0]-a[0],z[1]-a[1]),sh):sh,kind,rawA:a,rawZ:z,source:'auto'});};
  if(autoMain)for(let i=0;i<xs.length;i++)for(let j=0;j<ys.length;j++){const a=[xs[i],ys[j]];if(!support(a))continue;for(let k=i+1;k<xs.length;k++)if(support([xs[k],ys[j]])){if(mainDirection!=='Y')add(a,[xs[k],ys[j]],'MB');break;}for(let k=j+1;k<ys.length;k++)if(support([xs[i],ys[k]])){if(mainDirection!=='X')add(a,[xs[i],ys[k]],'MB');break;}}
  // Rooted CBs are valid receivers for SBs. Use the same directed support graph as Loading.
  const supported=new Set(),primary=beams.filter(b=>b.kind!=='SB');
  const held=q=>support(q)||[...supported].some(b=>on(q,b)||on(q,{...b,a:b.rawA,z:b.rawZ}));
  if(typeof Loading!=='undefined'&&floors(p).some(f=>f.type===key)){
   const resolved=Loading.supportModel(p,{key,ts,columns,walls,beams:primary.map(b=>({...b,displayKind:b.kind}))},null),valid=new Set(resolved.beams.filter(b=>b.supportStatus==='connected').map(b=>Loading.token(b.kind,b)));
   for(const b of primary)if(valid.has(Loading.token(b.kind,b)))supported.add(b);
  }else{
   let changed=true;while(changed){changed=false;for(const b of primary){if(supported.has(b))continue;const root=b.fixedEnd101,cb=b.kind==='CB',ok=cb?root==='a'?held(b.rawA):root==='z'?held(b.rawZ):support(b.rawA)!==support(b.rawZ):held(b.rawA)&&held(b.rawZ);if(ok){supported.add(b);changed=true;}}}
  }
  const edges=[...walls,...supported];const xx=unique(edges.flatMap(e=>[e.rawA[0],e.rawZ[0]])),yy=unique(edges.flatMap(e=>[e.rawA[1],e.rawZ[1]]));
  const cover=(a,z)=>covered(edges,a,z);let steps=0;
  for(let i=0;i<xx.length-1;i++)for(let j=0;j<yy.length-1;j++)for(let k=i+1;k<xx.length;k++){
   if(!cover([xx[i],yy[j]],[xx[k],yy[j]]))continue;
   for(let l=j+1;l<yy.length;l++){
    if(++steps>1500000)throw Error(key+' 梁格过于复杂，请减少自由坐标支承点');
    const a=xx[i],b=xx[k],c=yy[j],d=yy[l];if(!cover([a,c],[a,d])||!cover([b,c],[b,d])||!cover([a,d],[b,d]))continue;
    if(!xx.slice(i+1,k).some(x=>cover([x,c],[x,d]))&&!yy.slice(j+1,l).some(y=>cover([a,y],[b,y]))&&rectAllowed(ts,(a+b)/2,(c+d)/2,b-a,d-c)){
     panels.push([a,b,c,d]);if(!autoSecondary)break;const rule=secondaryAreaRule(t,[a,b,c,d]);if(layout?.scope==='selected'&&!rule)break;if(rule?.error){issue(rule.names,rule.error);break;}const direction=rule?.direction??layout?.secondaryDirection??df.direction,gap=rule?.gap??layout?.gap??df.gap,h=direction==='自动'?b-a<=d-c:direction==='X',n=Math.ceil((h?d-c:b-a)/(gap/1000));if(n>500)throw Error('次梁间距过小');for(let q=1;q<n;q++){const pos=h?c+(d-c)*q/n:a+(b-a)*q/n;add(h?[a,pos]:[pos,c],h?[b,pos]:[pos,d],'SB');}
    }break;
   }
  }
  for(const area of t.secondaryAreas||[])if(autoSecondary&&area.cbSupported106){const r=area.rects[0],horizontal=area.direction==='X',cb=[...supported].filter(b=>b.kind==='CB'),sides=horizontal?[[[r.x0,r.y0],[r.x0,r.y1]],[[r.x1,r.y0],[r.x1,r.y1]]]:[[[r.x0,r.y0],[r.x1,r.y0]],[[r.x0,r.y1],[r.x1,r.y1]]];if(!sides.every(([a,z])=>covered(cb,a,z))){issue(area.name,'次梁分区的 CB 支承已失效，请核对根部或重画');continue;}if(!panels.some(p=>intersectArea(panelRect(p),r)>eps))panels.push([r.x0,r.x1,r.y0,r.y1]);const first=horizontal?r.y0:r.x0,last=horizontal?r.y1:r.x1,n=Math.ceil((last-first)/((area.gap??layout?.gap??df.gap)/1000));if(n>500)throw Error('次梁间距过小');for(let q=1;q<n;q++){const v=first+(last-first)*q/n;add(horizontal?[r.x0,v]:[v,r.y0],horizontal?[r.x1,v]:[v,r.y1],'SB');}}
  for(const area of t.secondaryAreas||[])if(autoSecondary&&area.cantilever101){const r=area.rects[0],horizontal=area.direction==='X',root=area.root101,first=horizontal?r.y0:r.x0,last=horizontal?r.y1:r.x1,n=Math.ceil((last-first)/((area.gap??layout?.gap??df.gap)/1000));if(n>500)throw Error('次梁间距过小');const rootA=root==='left'?[r.x0,r.y0]:root==='right'?[r.x1,r.y0]:root==='top'?[r.x0,r.y0]:[r.x0,r.y1],rootZ=root==='left'?[r.x0,r.y1]:root==='right'?[r.x1,r.y1]:root==='top'?[r.x1,r.y0]:[r.x1,r.y1];if(!covered(edges,rootA,rootZ)){issue(area.name,'悬挑分区固定边支承已失效，请重画');continue;}for(let q=0;q<=n;q++){const v=first+(last-first)*q/n,a=horizontal?[r.x0,v]:[v,r.y0],z=horizontal?[r.x1,v]:[v,r.y1];add(a,z,'CB');const b=beams.find(b=>sig(b.rawA,b.rawZ)===sig(a,z));if(b&&b.source==='auto'){b.fixedEnd101=['left','top'].includes(root)?'a':'z';b.secondaryCantilever101=area.id;}}}
  for(const area of t.secondaryAreas||[])if(!area.cantilever101&&!area.cbSupported106&&!panels.some(p=>area.rects.some(r=>intersectArea(panelRect(p),r)>eps)))issue(area.name,'次梁区域已无对应的完整梁格，请删除或重画');
  let cbNumber=0;const reservedIds=new Set(beams.map(b=>b.id));
  for(const b of beams){
   const ok=b.kind==='SB'?held(b.rawA)&&held(b.rawZ):supported.has(b);
   b.supportStatus=ok?'connected':'unverified';
   // An explicit member type wins over the preliminary geometry inference.
   // Loading resolves CB-supported endpoints using the same rules as force transfer.
   b.displayKind=b.kind==='CB'||b.source!=='manual'&&b.kind!=='SB'&&!ok&&held(b.rawA)!==held(b.rawZ)?'CB':b.kind;
   b.displayId=b.id;if(b.displayKind==='CB'&&b.kind!=='CB'){do{b.displayId='CB-'+String(++cbNumber).padStart(2,'0');}while(reservedIds.has(b.displayId));}
   b.supportText=b.kind==='CB'?'Cantilever Beam（手动指定）：固定端在 Member Check 确认，cover 默认随梁 FRR；根部抗弯约束未验算':ok?'两端已有连接到柱／墙的几何支承路径；未验算':b.displayKind==='CB'?'Cantilever Beam（悬臂梁）：一端外伸，根部抗弯约束尚未确认；默认不采用，输入保留': '未建立两端有效支承路径：悬空或互相依赖；默认不采用，输入保留';
   if(!ok)issue(b.displayId,b.supportText);
  }
  for(const b of beams)if(b.kind==='SB'&&b.displayKind==='CB')b.d=sh;
  const slabVoids=(t.slabVoids||[]).flatMap(r=>ts.filter(t=>t.state===1).map(t=>({x0:Math.max(t.x0,r.x0),x1:Math.min(t.x1,r.x1),y0:Math.max(t.y0,r.y0),y1:Math.min(t.y1,r.y1)})).filter(r=>r.x1>r.x0&&r.y1>r.y0));
  const slabs=slabPanels(ts,beams,walls,slabVoids,columns);if(slabs===null)issue('SLAB','板块分隔过于复杂，未显示板块信息；请减少自由坐标分段');
  for(const s of slabs||[]){const zone=(t.secondaryAreas||[]).find(a=>a.cantilever101&&a.rects.some(r=>s.x0>=r.x0-eps&&s.x1<=r.x1+eps&&s.y0>=r.y0-eps&&s.y1<=r.y1+eps));if(zone)s.direction101=zone.direction==='X'?'Y':'X';}for(const s of slabs||[]){s.thickness=t.slabSizes?.find(o=>o.signature===slabSignature(s))?.value??t.slabSizes?.find(o=>s.legacySignatures120.includes(o.signature))?.value??df.slab;if(t.slabDirections116&&typeof Loading!=='undefined')s.direction116=slabGeometry.record(t.slabDirections116,s);if(layout)s.shortSpan116=true;}
  const uncovered=(slabs||[]).flatMap(s=>s.rects).reduce((sum,t)=>{let coveredArea=0;for(const [a,b,c,d]of panels)coveredArea+=Math.max(0,Math.min(b,t.x1)-Math.max(a,t.x0))*Math.max(0,Math.min(d,t.y1)-Math.max(c,t.y0));return sum+Math.max(0,(t.x1-t.x0)*(t.y1-t.y0)-coveredArea);},0);
  if(uncovered>.001)issue('SLAB',uncovered.toFixed(1)+' m² 未识别封闭梁格，请核对支承；未按悬臂板处理');
  return {key,ts,columns,walls,beams,issues,panels,slabs:slabs||[],slabVoids,sh,min};
 }
 function slabPanels(ts,beams,walls,voids=[],columns=[]){
  const concrete=slabGeometry.concrete(beams,walls,columns),cuts=[...voids,...concrete],xs=unique([...ts.flatMap(t=>[t.x0,t.x1]),...cuts.flatMap(r=>[r.x0,r.x1])]),ys=unique([...ts.flatMap(t=>[t.y0,t.y1]),...cuts.flatMap(r=>[r.y0,r.y1])]);
  const nx=xs.length-1,ny=ys.length-1;if(nx*ny>250000)return null;if(nx<1||ny<1)return [];
  const ix=new Map(xs.map((v,i)=>[v.toFixed(6),i])),iy=new Map(ys.map((v,i)=>[v.toFixed(6),i])),xi=v=>ix.get(v.toFixed(6)),yi=v=>iy.get(v.toFixed(6));
  const cells=new Int32Array(nx*ny).fill(-1),tileKeys=new Array(nx*ny),vertical=new Uint8Array((nx+1)*ny),horizontal=new Uint8Array(nx*(ny+1));
  for(const t of ts)if(t.state===1)for(let j=yi(t.y0);j<yi(t.y1);j++)for(let i=xi(t.x0);i<xi(t.x1);i++){const n=j*nx+i;cells[n]=-2;tileKeys[n]=t.k;}
  for(const r of cuts)for(let j=yi(r.y0);j<yi(r.y1);j++)for(let i=xi(r.x0);i<xi(r.x1);i++)cells[j*nx+i]=-1;
  const out=[];
  for(let seed=0;seed<cells.length;seed++)if(cells[seed]===-2){
   const group=out.length,queue=[seed];cells[seed]=group;
   for(let at=0;at<queue.length;at++){const n=queue[at],i=n%nx,j=Math.floor(n/nx);const visit=(to,blocked)=>{if(!blocked&&cells[to]===-2){cells[to]=group;queue.push(to);}};
    if(i>0)visit(n-1,vertical[j*(nx+1)+i]);if(i<nx-1)visit(n+1,vertical[j*(nx+1)+i+1]);if(j>0)visit(n-nx,horizontal[j*nx+i]);if(j<ny-1)visit(n+nx,horizontal[(j+1)*nx+i]);
   }
   queue.sort((a,b)=>a-b);let area=0,x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;const edges=[],keys=new Set(),rects=[];let previous=new Map(),row=-1;
   // Merge cell runs into rectangles for economical rendering; retain true outer edges.
   for(let at=0;at<queue.length;){const n=queue[at],j=Math.floor(n/nx),first=n%nx;let last=first;
    while(at+1<queue.length&&Math.floor(queue[at+1]/nx)===j&&queue[at+1]%nx===last+1){last++;at++;}at++;
    if(j!==row){previous=j===row+1?new Map(rects.filter(r=>r.lastRow===row).map(r=>[r.run,r])):new Map();row=j;}
    const run=first+','+last,r=previous.get(run);if(r){r.y1=ys[j+1];r.lastRow=j;}else rects.push({x0:xs[first],x1:xs[last+1],y0:ys[j],y1:ys[j+1],lastRow:j,run});
   }
   for(const n of queue){const i=n%nx,j=Math.floor(n/nx),a=xs[i],b=xs[i+1],c=ys[j],d=ys[j+1];area+=(b-a)*(d-c);x0=Math.min(x0,a);x1=Math.max(x1,b);y0=Math.min(y0,c);y1=Math.max(y1,d);keys.add(tileKeys[n]);
    if(i===0||cells[n-1]!==group)edges.push([[a,c],[a,d]]);if(i===nx-1||cells[n+1]!==group)edges.push([[b,c],[b,d]]);if(j===0||cells[n-nx]!==group)edges.push([[a,c],[b,c]]);if(j===ny-1||cells[n+nx]!==group)edges.push([[a,d],[b,d]]);
   }
   out.push({id:'SL-'+String(group+1).padStart(2,'0'),x0,x1,y0,y1,area,rectangular:Math.abs(area-(x1-x0)*(y1-y0))<1e-6,tileKeys:[...keys],rects:rects.map(({x0,x1,y0,y1})=>({x0,x1,y0,y1})),edges});
  }
  return slabGeometry.decorate(out,referencePanels120(ts,beams,walls,voids)||[]);
 }
 function referencePanels120(ts,beams,walls,voids=[]){
  // Coordinate-compressed planar cells; only physical segments block connectivity.
  // Axis lines alone and the extension of a short beam do not divide a slab.
  const lines=[...beams,...walls],xs=unique([...ts.flatMap(t=>[t.x0,t.x1]),...lines.flatMap(b=>[b.rawA[0],b.rawZ[0]]),...voids.flatMap(r=>[r.x0,r.x1])]),ys=unique([...ts.flatMap(t=>[t.y0,t.y1]),...lines.flatMap(b=>[b.rawA[1],b.rawZ[1]]),...voids.flatMap(r=>[r.y0,r.y1])]);
  const nx=xs.length-1,ny=ys.length-1;if(nx*ny>250000)return null;if(nx<1||ny<1)return [];
  const ix=new Map(xs.map((v,i)=>[v.toFixed(6),i])),iy=new Map(ys.map((v,i)=>[v.toFixed(6),i])),xi=v=>ix.get(v.toFixed(6)),yi=v=>iy.get(v.toFixed(6));
  const cells=new Int32Array(nx*ny).fill(-1),tileKeys=new Array(nx*ny),vertical=new Uint8Array((nx+1)*ny),horizontal=new Uint8Array(nx*(ny+1));
  for(const t of ts)if(t.state===1)for(let j=yi(t.y0);j<yi(t.y1);j++)for(let i=xi(t.x0);i<xi(t.x1);i++){const n=j*nx+i;cells[n]=-2;tileKeys[n]=t.k;}
  for(const r of voids)for(let j=yi(r.y0);j<yi(r.y1);j++)for(let i=xi(r.x0);i<xi(r.x1);i++)cells[j*nx+i]=-1;
  for(const b of lines){const a=b.rawA,z=b.rawZ;
   if(near(a[1],z[1])){const j=yi(a[1]);for(let i=xi(Math.min(a[0],z[0]));i<xi(Math.max(a[0],z[0]));i++)horizontal[j*nx+i]=1;}
   else if(near(a[0],z[0])){const i=xi(a[0]);for(let j=yi(Math.min(a[1],z[1]));j<yi(Math.max(a[1],z[1]));j++)vertical[j*(nx+1)+i]=1;}
  }
  const out=[];
  for(let seed=0;seed<cells.length;seed++)if(cells[seed]===-2){
   const group=out.length,queue=[seed];cells[seed]=group;
   for(let at=0;at<queue.length;at++){const n=queue[at],i=n%nx,j=Math.floor(n/nx);const visit=(to,blocked)=>{if(!blocked&&cells[to]===-2){cells[to]=group;queue.push(to);}};
    if(i>0)visit(n-1,vertical[j*(nx+1)+i]);if(i<nx-1)visit(n+1,vertical[j*(nx+1)+i+1]);if(j>0)visit(n-nx,horizontal[j*nx+i]);if(j<ny-1)visit(n+nx,horizontal[(j+1)*nx+i]);
   }
   queue.sort((a,b)=>a-b);let area=0,x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;const edges=[],keys=new Set(),rects=[];let previous=new Map(),row=-1;
   // Merge cell runs into rectangles for economical rendering; retain true outer edges.
   for(let at=0;at<queue.length;){const n=queue[at],j=Math.floor(n/nx),first=n%nx;let last=first;
    while(at+1<queue.length&&Math.floor(queue[at+1]/nx)===j&&queue[at+1]%nx===last+1){last++;at++;}at++;
    if(j!==row){previous=j===row+1?new Map(rects.filter(r=>r.lastRow===row).map(r=>[r.run,r])):new Map();row=j;}
    const run=first+','+last,r=previous.get(run);if(r){r.y1=ys[j+1];r.lastRow=j;}else rects.push({x0:xs[first],x1:xs[last+1],y0:ys[j],y1:ys[j+1],lastRow:j,run});
   }
   for(const n of queue){const i=n%nx,j=Math.floor(n/nx),a=xs[i],b=xs[i+1],c=ys[j],d=ys[j+1];area+=(b-a)*(d-c);x0=Math.min(x0,a);x1=Math.max(x1,b);y0=Math.min(y0,c);y1=Math.max(y1,d);keys.add(tileKeys[n]);
    if(i===0||cells[n-1]!==group)edges.push([[a,c],[a,d]]);if(i===nx-1||cells[n+1]!==group)edges.push([[b,c],[b,d]]);if(j===0||cells[n-nx]!==group)edges.push([[a,c],[b,c]]);if(j===ny-1||cells[n+nx]!==group)edges.push([[a,d],[b,d]]);
   }
   out.push({id:'SL-'+String(group+1).padStart(2,'0'),x0,x1,y0,y1,area,rectangular:Math.abs(area-(x1-x0)*(y1-y0))<1e-6,tileKeys:[...keys],rects:rects.map(({x0,x1,y0,y1})=>({x0,x1,y0,y1})),edges});
  }
  return out;
 }
 // Align physical sections on shared vertical column lines; input references stay unchanged.
 function columnReference(p,key,c){
  if(p.types[key].mode==='auto'&&c.anchorX!==undefined)return [columnAxes(p,'x',key).find(a=>a.id===c.anchorX).v,columnAxes(p,'y',key).find(a=>a.id===c.anchorY).v];
  return c.alignmentReference||[c.x,c.y];
 }
 function setTransferColumn(p,key,hit,value){
  if(typeof value!=='boolean')throw Error('Transfer column 标记无效');
  const t=p.types[key],c=baseModel(p,key).columns.find(c=>c.id===hit.id);if(!c)throw Error('柱已不存在');
  if(t.mode==='manual'||c.anchorX===undefined)t.columns.find(c=>c.id===hit.id).transferColumn=value;
  else{t.transferColumns=(t.transferColumns||[]).filter(a=>a.ax!==c.anchorX||a.ay!==c.anchorY);if(value)t.transferColumns.push({ax:c.anchorX,ay:c.anchorY});}
 }
 function alignedModels(p,fs){
  const models={},nodes=new Map(),byType=new Map(),parents=new Map(),warnings=[];
  const coord=a=>a.map(n=>n.toFixed(6)).join('|'),find=id=>{let r=id;while(parents.get(r)!==r)r=parents.get(r);while(parents.get(id)!==id){const n=parents.get(id);parents.set(id,r);id=n;}return r;},join=(a,b)=>parents.set(find(a),find(b));
  for(const key of Object.keys(p.types)){
   const m=models[key]=baseModel(p,key),map=new Map();byType.set(key,map);
   for(const c of m.columns){const ref=columnReference(p,key,c),id=key+'|'+c.id,n={id,key,c,ref,edge:ref.map((v,i)=>{const a=axes(p,i?'y':'x',key);return near(v,a[0].v)?1:near(v,a.at(-1).v)?-1:0;})};nodes.set(id,n);parents.set(id,id);const k=coord(ref);map.set(k,[...(map.get(k)||[]),n]);
    if(c.transferColumn===true||(p.types[key].transferColumns||[]).some(a=>a.ax===c.anchorX&&a.ay===c.anchorY)){c.isTransferColumn=true;c.transferManual=true;c.transferReason='手动标记 · 不参与上下层对齐';}
   }
  }
  // Infer only a supported upper column with no direct lower column. Proximity alone is insufficient.
  function detect(n,below,floor){
   if(n.c.isTransferColumn)return;
   const matches=(byType.get(below.key).get(coord(n.ref))||[]).filter(d=>d.c.status!=='上层柱');if(matches.length)return;
   const beams=below.beams.filter(b=>b.kind==='TB'&&on([n.c.x,n.c.y],b));
   if(beams.length===1){n.c.isTransferColumn=true;n.c.transferReason='几何识别：'+floor+'/F 柱落在 '+below.key+' / '+beams[0].id+'，无直接下层柱；不参与对齐';}
   else if(beams.length>1){n.c.isTransferColumn=true;n.c.transferReason='柱下有多根 TB，转移关系待确认；暂不参与对齐';}
  }
  for(let i=0;i<fs.length;i++)for(const n of nodes.values())if(n.key===fs[i].type){
   if(n.c.status==='上层柱')detect(n,models[n.key],fs[i].n+1);
   else if(i>0)detect(n,models[fs[i-1].type],fs[i].n);
  }
  return models;
 }

 function model(p,key){return alignedModels(p,floors(p))[key];}

 function setRegion(p,key,tileKey,layer,enabled){
  if(!['building','opening'].includes(layer)||typeof enabled!=='boolean')throw Error('区域操作无效');
  const t=p.types[key],tile=tiles(p,t).find(c=>c.k===tileKey);if(!tile)throw Error('轴线格不存在');
  t[layer][tileKey]=enabled;
  if(layer==='building'&&enabled){
   delete t.opening[tileKey];
   // Restore this cell even when a previously deleted slab crosses cell boundaries.
   if(t.slabVoids)t.slabVoids=t.slabVoids.flatMap(r=>{
    const x0=Math.max(r.x0,tile.x0),x1=Math.min(r.x1,tile.x1),y0=Math.max(r.y0,tile.y0),y1=Math.min(r.y1,tile.y1);
    if(x1<=x0||y1<=y0)return [r];
    return [{x0:r.x0,x1:x0,y0:r.y0,y1:r.y1},{x0:x1,x1:r.x1,y0:r.y0,y1:r.y1},{x0,x1,y0:r.y0,y1:y0},{x0,x1,y0:y1,y1:r.y1}].filter(v=>v.x1>v.x0&&v.y1>v.y0);
   });
  }
 }
 function generate(p){for(const t of Object.values(p.types)){if(t.alignmentMinSpacing!=null){t.minColumnSpacing=Math.max(t.minColumnSpacing||0,t.alignmentMinSpacing);delete t.alignmentMinSpacing;}}validate(p);for(const [key,t]of Object.entries(p.types))if(t.beamDepth==null){const g=p.groups.find(g=>g.type===key);t.beamDepth=g?structuralHeight(g):600;}const fs=floors(p),models=alignedModels(p,fs),floorModels=typeof FloorColumns101!=='undefined'?FloorColumns101.models(p,fs):{},get=f=>floorModels[f.n]||models[f.type],issues=[];for(const k of Object.keys(p.types))issues.push(...models[k].issues);for(let i=1;i<fs.length;i++){
  if(get(fs[i])===get(fs[i-1]))continue;const up=get(fs[i]),dn=get(fs[i-1]);const supports=[...dn.walls,...dn.beams.filter(b=>b.kind==='TB')];
  for(const c of up.columns.filter(c=>c.status!=='上层柱'))if(dn.columns.filter(d=>d.status!=='上层柱'&&overlap(columnRect(c),columnRect(d))).length!==1&&!supports.some(w=>on([c.x,c.y],w)))issues.push({type:up.key,id:c.id,msg:fs[i].n+'/F 上层柱与下层支承不连续；请核对并手动指定 TB'});
  for(const w of up.walls){const r=rect(w),h=near(w.a[1],w.z[1]),eligible=supports.filter(s=>{const rr=rect(s);return h?Math.abs(rr.y-r.y)+r.d/2<=rr.d/2+eps:Math.abs(rr.x-r.x)+r.w/2<=rr.w/2+eps;}).map(s=>({...s,rawA:s.a,rawZ:s.z}));if(!covered(eligible,w.a,w.z))issues.push({type:up.key,id:w.id,msg:fs[i].n+'/F 墙与下层墙／TB 不连续，请核对支承'});}
 }for(const f of fs){const m=get(f),local=typeof LocalHeights96!=='undefined'&&LocalHeights96.hasClearance(p,f.n),deep=m.beams.filter(b=>b.d*1000>(local?LocalHeights96.beamAllowance(p,f.n,b):f.sh)+1e-6);if(deep.length)issues.push({type:f.type,floor:f.n,id:deep.map(b=>b.displayId||b.id).join('、'),msg:FloorLevels.name(p,f.n)+'：'+deep.length+' 根梁深超过'+(local?'本层／局部结构预留高度':'本层结构预留高度 '+f.sh+' mm')+'；Framing 截面保持不变，请检查净高安排'});}for(const [n,m]of Object.entries(floorModels))issues.push(...m.issues.map(q=>({...q,floor:+n})));const result={models,floorModels,issues,floors:fs};const final=typeof LocalHeights96!=="undefined"?LocalHeights96.build(p,result,baseModel):result;slabGeometry.migrate(p,final);return final;}
 function removeAxis(p,dim,index,key){if(!key||!p.types[key])throw Error('请选择要修改轴线的 Framing');const grid=ownAxes(p,key);return removeAxisLocal({...p,axes:grid,types:{[key]:p.types[key]}},dim,index);}
 function removeAxisLocal(p,dim,index){
  const arr=p.axes[dim],count=arr.length;
  if(count<=2)throw Error('每个方向至少保留 2 条轴线');
  if(!Number.isInteger(index)||index<0||index>=count)throw Error('轴线序号无效');
  const idx=dim==='x'?0:1,ref=dim==='x'?'ax':'ay',name=arr[index].id,shift=0;
  const other=p.axes[dim==='x'?'y':'x'].length-1,cell=(i,j)=>dim==='x'?i+','+j:j+','+i;
  // Different adjacent regions cannot be represented by one merged bay.
  if(index>0&&index<count-1)for(const [key,t]of Object.entries(p.types))for(const layer of ['building','opening'])for(let j=0;j<other;j++){
   if(!!t[layer][cell(index-1,j)]!==!!t[layer][cell(index,j)])throw Error(key+' 的'+(layer==='building'?'建筑范围':'Opening')+'在这条轴两侧不同，请先调整区域再删除边界轴');
  }
  for(const t of Object.values(p.types)){
   if(t.transferColumns)t.transferColumns=t.transferColumns.filter(c=>c[ref]!==name);
  if(t.suppressedColumns)t.suppressedColumns=t.suppressedColumns.filter(c=>c[ref]!==name);
   if(t.columnSizes)t.columnSizes=t.columnSizes.filter(c=>c[ref]!==name);if(t.columnAxisPositions)t.columnAxisPositions=t.columnAxisPositions.filter(r=>!r.key.startsWith('axis:')||r.key.slice(5).split('|')[idx]!==name);
   if(shift)for(const r of t.slabVoids||[]){r[dim+'0']-=shift;r[dim+'1']-=shift;}
   if(shift)for(const entry of t.slabSizes||[]){const rects=entry.signature.split('|').map(r=>r.split(',').map(Number));if(rects.every(r=>r.length===4&&r.every(Number.isFinite))){for(const r of rects){r[idx*2]-=shift;r[idx*2+1]-=shift;}entry.signature=rects.map(r=>r.map(v=>v.toFixed(6)).join(',')).sort().join('|');}}
   for(const point of [...t.columns,...t.walls.flatMap(w=>[w.a,w.z]),...t.beams.flatMap(b=>[b.a,b.z])]){
    if(point[ref]===name){const xy=resolve(p,point);xy[idx]-=shift;delete point.ax;delete point.ay;point.x=xy[0];point.y=xy[1];point.dx=point.dy=0;}
    else if(point.ax===undefined&&shift)point[dim]-=shift;
   }
   if(shift){const moved=s=>{const ends=s.split('|').map(v=>v.split(',').map(Number));if(ends.length!==2||ends.some(v=>v.length!==2||v.some(n=>!Number.isFinite(n))))return s;ends.forEach(v=>v[idx]-=shift);return sig(...ends);};t.suppressed=t.suppressed.map(moved);for(const b of t.beams)if(b.original)b.original=moved(b.original);}
   for(const layer of ['building','opening']){const old=t[layer],next={};for(let n=0;n<count-2;n++)for(let j=0;j<other;j++){const oldIndex=index===0?n+1:n<index?n:n+1;next[cell(n,j)]=!!old[cell(oldIndex,j)];}t[layer]=next;}
  }
  if(index>0&&index<count-1)arr[index+1].gap+=arr[index].gap;
  if(index===0)p.axes.origin={...p.axes.origin,[dim]:(p.axes.origin?.[dim]||0)+arr[1].gap};
  arr.splice(index,1);arr[0].gap=0;
 }
 function openingGroups(p,key){
  const remaining=new Map(tiles(p,p.types[key]).filter(t=>t.state===2).map(t=>[t.k,t])),groups=[];
  while(remaining.size){const first=remaining.values().next().value,items=[first];remaining.delete(first.k);
   for(let n=0;n<items.length;n++){const t=items[n];for(const [i,j]of [[t.i-1,t.j],[t.i+1,t.j],[t.i,t.j-1],[t.i,t.j+1]]){const k=i+','+j;if(remaining.has(k)){items.push(remaining.get(k));remaining.delete(k);}}}
   const keys=new Set(items.map(t=>t.k)),edges=[];
   for(const t of items){if(!keys.has((t.i-1)+','+t.j))edges.push({h:false,at:t.x0,lo:t.y0,hi:t.y1});if(!keys.has((t.i+1)+','+t.j))edges.push({h:false,at:t.x1,lo:t.y0,hi:t.y1});if(!keys.has(t.i+','+(t.j-1)))edges.push({h:true,at:t.y0,lo:t.x0,hi:t.x1});if(!keys.has(t.i+','+(t.j+1)))edges.push({h:true,at:t.y1,lo:t.x0,hi:t.x1});}
   groups.push({items,edges});
  }return groups;
 }
 function removeOpening(p,key,index){p=scoped(p,key);
  const group=openingGroups(p,key)[index];if(!group)throw Error('Opening 已不存在，请重新选择');
  const t=p.types[key],kept=[],used=new Set(t.walls.map(w=>w.id));
  for(const wall of t.walls){const a=resolve(p,wall.a),z=resolve(p,wall.z),h=near(a[1],z[1]);
   if(!h&&!near(a[0],z[0])){kept.push(wall);continue;}
   const along=h?0:1,across=1-along,lo=Math.min(a[along],z[along]),hi=Math.max(a[along],z[along]);let parts=[[lo,hi]];
   for(const e of group.edges.filter(e=>e.h===h&&near(e.at,a[across]))){parts=parts.flatMap(([l,r])=>e.hi<=l+eps||e.lo>=r-eps?[[l,r]]:[[l,Math.min(r,e.lo)],[Math.max(l,e.hi),r]].filter(([x,y])=>y-x>eps));}
   if(parts.length===1&&near(parts[0][0],lo)&&near(parts[0][1],hi)){kept.push(wall);continue;}
   parts.forEach(([l,r],i)=>{let id=wall.id;if(i){let n=1;while(used.has(id+'_part'+n))n++;id=id+'_part'+n;used.add(id);}const aa=[...a],zz=[...z];aa[along]=a[along]<=z[along]?l:r;zz[along]=a[along]<=z[along]?r:l;kept.push({...wall,id,a:{x:aa[0],y:aa[1]},z:{x:zz[0],y:zz[1]}});});
  }
  for(const tile of group.items)t.opening[tile.k]=false;
  t.walls=kept;
 }
 function removeType(p,key){
  if(!Object.hasOwn(p.types,key))throw Error('此 Framing 类型不存在');
  if(Object.keys(p.types).length<=1)throw Error('至少保留一个 Framing 类型');
  if(p.groups.some(g=>g.type===key))throw Error(key+' 仍在楼层分组中使用，请先在“楼层”更换对应类型，再删除');
  delete p.types[key];
 }
 function removeBeam(p,key,id,kind,f){
  const t=p.types[key];if(!t)throw Error('Framing 类型不存在');
  const b=(f?floorModel(generate(p),f,key):model(p,key)).beams.find(b=>b.id===id&&b.kind===kind);if(!b)throw Error('所选梁已不存在');
  if(b.source==='manual'){const i=t.beams.findIndex(c=>c.id===id&&c.kind===kind);t.beams.splice(i,1);}
  const signature=sig(b.rawA,b.rawZ);if(!t.suppressed.includes(signature))t.suppressed.push(signature);
 }
 const slabSignature=s=>s.rects.map(r=>[r.x0,r.x1,r.y0,r.y1].map(v=>v.toFixed(6)).join(',')).sort().join('|');
 function editSize(p,key,hit,size){
  const t=p.types[key],m=hit.f?floorModel(generate(p),hit.f,key):model(p,key),number=(v,name)=>{if(v!==null&&(!Number.isFinite(v)||v<1||v>20000))throw Error(name+' 须为 1–20000 mm，或留空恢复默认');};number(size.b,'B / 厚度');number(size.d,'D');
  if(hit.kind==='SLAB'){const s=m.slabs.find(s=>s.id===hit.slabId);if(!s)throw Error('板块已不存在');const signature=slabSignature(s);t.slabSizes=(t.slabSizes||[]).filter(s=>s.signature!==signature);if(size.b!==null)t.slabSizes.push({signature,value:size.b});return;}
  if(hit.kind==='COL'){const c=m.columns.find(c=>c.id===hit.id);if(!c)throw Error('柱已不存在');if(t.mode==='auto'&&c.anchorX!==undefined){t.columnSizes=(t.columnSizes||[]).filter(o=>o.ax!==c.anchorX||o.ay!==c.anchorY);if(size.b!==null||size.d!==null)t.columnSizes.push({ax:c.anchorX,ay:c.anchorY,b:size.b??p.defaults.cb,d:size.d??p.defaults.cd});}else{const row=t.columns.find(c=>c.id===hit.id);row.b=size.b??p.defaults.cb;row.d=size.d??p.defaults.cd;}return;}
  if(hit.kind==='WALL'){const row=t.walls.find(w=>w.id===hit.id);if(!row)throw Error('墙已不存在');row.b=size.b??p.defaults.wall;return;}
  const b=m.beams.find(b=>b.id===hit.id&&b.kind===hit.kind);if(!b)throw Error('梁已不存在');const nextKind=size.kind??b.kind;if(!['MB','SB','TB','CB'].includes(nextKind))throw Error('梁类型须为 MB、SB、TB 或 CB');if(nextKind!==b.kind&&m.beams.some(other=>other!==b&&other.kind===nextKind&&sig(other.rawA,other.rawZ)===sig(b.rawA,b.rawZ)))throw Error('同位置已存在该类型的梁，请先检查重复构件');let row=t.beams.find(c=>c.id===b.id&&c.kind===b.kind&&b.source==='manual');
  if(!row){let n=1;while(t.beams.some(b=>b.id==='EDIT_'+n))n++;const signature=sig(b.rawA,b.rawZ);if(!t.suppressed.includes(signature))t.suppressed.push(signature);row={id:'EDIT_'+n,kind:b.kind,a:{x:b.rawA[0],y:b.rawA[1]},z:{x:b.rawZ[0],y:b.rawZ[1]},on:true,original:signature};t.beams.push(row);}
  if(t.beamWidths83)delete t.beamWidths83[sig(b.rawA,b.rawZ)];row.edgeInset=true;row.widthMode=nextKind==="MB"&&size.b===null?"column":"manual";row.kind=nextKind;row.b=size.b??p.defaults[nextKind==='SB'?'sb':nextKind==='TB'?'tb':'mb'];row.d=size.d;return {id:row.id,kind:row.kind,rawA:b.rawA,rawZ:b.rawZ};
 }
 function removeMember(p,key,hit){
  if(['MB','SB','TB','CB'].includes(hit.kind)){removeBeam(p,key,hit.id,hit.kind,hit.f);return;}
  const t=p.types[key];if(!t)throw Error('Framing 类型不存在');const m=hit.f?floorModel(generate(p),hit.f,key):model(p,key);
  if(hit.kind==='SLAB'){const s=m.slabs.find(s=>s.id===hit.slabId);if(!s)throw Error('所选板块已不存在');t.slabVoids=[...(t.slabVoids||[]),...clone(s.rects)];return;}
  if(hit.kind==='COL'){const c=m.columns.find(c=>c.id===hit.id);if(!c)throw Error('所选柱已不存在');if(t.columnAxisPositions)t.columnAxisPositions=t.columnAxisPositions.filter(r=>r.key!==columnPositionKey(c));if(t.mode==='auto'&&c.anchorX!==undefined){t.suppressedColumns=[...(t.suppressedColumns||[]),{ax:c.anchorX,ay:c.anchorY}];}else t.columns=t.columns.filter(c=>c.id!==hit.id);return;}
  if(hit.kind==='WALL'){if(!m.walls.some(w=>w.id===hit.id))throw Error('所选墙已不存在');t.walls=t.walls.filter(w=>w.id!==hit.id);return;}
  throw Error('请选择梁、楼板、柱或墙');
 }
 function viewRange(total,selected,scope,localCount=5,localRange){
  const floor=Math.max(1,Math.min(total,selected));
  if(scope==='all')return {lo:1,hi:total};
  if(scope==='local'&&localRange){const {lo,hi}=localRange;if(!Number.isInteger(lo)||!Number.isInteger(hi)||lo<1||hi>total||lo>hi)throw Error('请输入有效的局部楼层范围：1–'+total+'/F，起始层不能大于结束层');return {lo,hi};}
  if(scope==='five'||scope==='local'){const count=Math.max(1,Math.min(total,Math.round(Number(localCount)||5))),lo=Math.max(1,Math.min(floor-Math.floor((count-1)/2),total-count+1));return {lo,hi:lo+count-1};}
  return {lo:floor,hi:floor};
 }
 function floorModel(result,f,key){const n=typeof f==="object"?f.n:f,k=key??result?.floors[n-1]?.type;return result?.floorModels?.[n]?.key===k?result.floorModels[n]:result?.models[k];}
 return {baseModel,floorModel,columnDirections,columnPositionKey,columnPositionRecord,setColumnPosition,mainBeamWidth,wallPosition,columnReference,addSecondaryArea,secondaryAreaRule,columnAxes,columnGridDraft,noColumn,addColumn,setColumnMode,structuralHeight,applyClearances,clone,columnRect,setRegion,setTransferColumn,axisData,ownAxes,axes,resolve,validate,floors,tiles,rectAllowed,align,rect,overlap,on,sig,model,generate,removeAxis,removeType,openingGroups,removeOpening,viewRange,removeBeam,removeMember,editSize};
})();
if(typeof module!=='undefined')module.exports=Engine;