// Same-floor trusses occupy the structural zone below the fixed floor level.
const TrussZone122=(()=>{
 const isZone=t=>t.layout==='floor-zone',eps=1e-8;
 function clippedArea(polygon,r){
  let points=polygon;
  for(const [axis,bound,sign]of [[0,r.x0,1],[0,r.x1,-1],[1,r.y0,1],[1,r.y1,-1]]){
   const out=[];
   for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length],insideA=sign*(a[axis]-bound)>=-eps,insideB=sign*(b[axis]-bound)>=-eps;
    if(insideA)out.push(a);
    if(insideA!==insideB){const t=(bound-a[axis])/(b[axis]-a[axis]);out.push(a.map((v,k)=>v+t*(b[k]-v)));}
   }
   points=out;if(!points.length)return 0;
  }
  return Math.abs(points.reduce((sum,a,i)=>{const b=points[(i+1)%points.length];return sum+a[0]*b[1]-b[0]*a[1];},0))/2;
 }
 function allowance(p,f,a,z,width=.001){
  const span=Math.hypot(z[0]-a[0],z[1]-a[1]);if(span<eps)throw Error('桁架跨度须大于零');
  const half=width/2,n=[-(z[1]-a[1])/span,(z[0]-a[0])/span],point=(q,s)=>q.map((v,i)=>v+s*half*n[i]);
  const polygon=[point(a,1),point(z,1),point(z,-1),point(a,-1)],zones=LocalHeights96.zones(p,f),hits=[];
  for(const zone of zones){const area=clippedArea(polygon,zone.rect);if(area>eps)hits.push({...zone,area});}
  const covered=hits.reduce((s,x)=>s+x.area,0),errors=[],floor=Engine.floors(p)[f-1];
  if(covered<span*width*(1-1e-7))errors.push('桁架全跨及杆件宽度须位于当前楼层的 Structural zone 内');
  if(hits.some(x=>!Number.isFinite(x.sh)||x.sh<=0||x.error))errors.push('桁架经过的局部 Structural zone 输入未完整');
  const depth=hits.length?Math.min(...hits.map(x=>x.sh??0))/1000:0;
  if(depth>floor.h+eps)errors.push('Structural zone 高度超过当前层的层高，请先核对楼层净高／E&M 输入');
  return {depth,width,errors,names:[...new Set(hits.map(x=>x.name))]};
 }
 function geometry(p,t,a,z){
  const available=allowance(p,t.topFloor,a,z),H=t.structuralDepth==null?available.depth:t.structuralDepth/1000;
  const errors=[...available.errors],floorZ=LocalHeights96.levelAt(p,t.topFloor,...a);
  if(!Number.isFinite(H)||H<=0)errors.push('同层桁架 Structural depth 须大于零');
  if(H>available.depth+eps)errors.push('桁架外包高度 '+(H*1000).toFixed(0)+' mm 超过全跨可用 Structural zone '+(available.depth*1000).toFixed(0)+' mm');
  return {zone:true,zoneAvailable:available.depth,zoneDepth:H,zoneTop:floorZ,zoneBottom:floorZ-H,zoneNames:available.names,depth:H,zTop:floorZ,zBottom:floorZ-H,pendingSectionFit:true,errors};
 }
 function place(p,t,g,c){
  const fit=c.input.structuralEnvelope;if(!fit)throw Error('同层桁架缺少截面外包高度计算');
  const width=Math.max(...c.members.map(m=>m.section.B))/1000,available=allowance(p,t.topFloor,g.a,g.z,width),errors=[...available.errors];
  if(fit.depth>available.depth+eps)errors.push('所选杆件宽度经过较浅 Structural zone：可用 '+(available.depth*1000).toFixed(0)+' mm，小于桁架外包 '+(fit.depth*1000).toFixed(0)+' mm');
  const zTop=g.zoneTop-fit.topInset,zBottom=g.zoneBottom+fit.bottomInset;
  for(const m of c.members){
   const projection=m.section.D/2000*Math.abs(m.c),lo=zBottom+Math.min(c.nodes[m.i].y,c.nodes[m.j].y)-projection,hi=zBottom+Math.max(c.nodes[m.i].y,c.nodes[m.j].y)+projection;
   if(lo<g.zoneBottom-1e-7||hi>g.zoneTop+1e-7)errors.push(m.id+' 截面外包超出 Structural zone');
  }
  return {...g,depth:c.input.depth,zTop,zBottom,topInset:fit.topInset,bottomInset:fit.bottomInset,zoneAvailable:available.depth,zoneWidth:width,pendingSectionFit:false,errors:[...g.errors,...errors]};
 }
 return {isZone,allowance,geometry,place,clippedArea};
})();
if(typeof module!=='undefined')module.exports=TrussZone122;
