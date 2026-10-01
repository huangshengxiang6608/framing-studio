const ColumnPlan87=(()=>{
 const bounds=c=>{const r=Engine.columnRect(c);return {x0:r.x-r.w/2,x1:r.x+r.w/2,y0:r.y-r.d/2,y1:r.y+r.d/2};},rect=b=>({x:(b.x0+b.x1)/2,y:(b.y0+b.y1)/2,w:b.x1-b.x0,d:b.y1-b.y0});
 function subtract(r,cuts){let parts=[r];for(const c of cuts)parts=parts.flatMap(a=>{const x0=Math.max(a.x0,c.x0),x1=Math.min(a.x1,c.x1),y0=Math.max(a.y0,c.y0),y1=Math.min(a.y1,c.y1);return x1-x0<1e-7||y1-y0<1e-7?[a]:[{x0:a.x0,x1:x0,y0:a.y0,y1:a.y1},{x0:x1,x1:a.x1,y0:a.y0,y1:a.y1},{x0,x1,y0:a.y0,y1:y0},{x0,x1,y0:y1,y1:a.y1}].filter(a=>a.x1-a.x0>1e-7&&a.y1-a.y0>1e-7);});return parts;}
 function items(result,floor){const current=Engine.floorModel(result,floor),next=result.floors[floor]&&Engine.floorModel(result,floor+1),lower=current.columns.filter(c=>c.status!=='上层柱'),upper=(next?.columns||[]).filter(c=>c.status!=='上层柱'),out=[],add=(c,b,f,status)=>out.push({column:c,rect:rect(b),floor:f,status});
  for(const c of lower){const r=bounds(c),cuts=[];for(const u of upper){const b=bounds(u),v={x0:Math.max(r.x0,b.x0),x1:Math.min(r.x1,b.x1),y0:Math.max(r.y0,b.y0),y1:Math.min(r.y1,b.y1)};if(v.x1-v.x0>1e-7&&v.y1-v.y0>1e-7){cuts.push(v);add(c,v,floor,'上下贯通');}}for(const b of subtract(r,cuts))add(c,b,floor,'下层柱');}
  for(const c of upper)for(const b of subtract(bounds(c),lower.map(bounds)))add(c,b,floor+1,'上层柱');for(const c of current.columns.filter(c=>c.status==='上层柱'))add(c,bounds(c),floor,'上层柱');return out;}
 return {items,subtract,bounds};
})();
const MemberPopup87=(()=>{
 const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
 const clamp=(x,a,b)=>Math.max(a,Math.min(x,Math.max(a,b)));
 function choose(area,size,obstacles,selected){
  const maxX=area.x+area.w-size.w,maxY=area.y+area.h-size.h,points=[];
  const xs=[...new Set([area.x,maxX,...obstacles.flatMap(r=>[r.x-size.w-10,r.x+r.w+10])].map(x=>Math.round(clamp(x,area.x,maxX))))].slice(0,48),ys=[...new Set([area.y,maxY,...obstacles.flatMap(r=>[r.y-size.h-10,r.y+r.h+10])].map(y=>Math.round(clamp(y,area.y,maxY))))].slice(0,48);
  for(const x of xs)for(const y of ys)points.push({x,y,w:size.w,h:size.h});
  return points.reduce((best,p)=>{const score=obstacles.reduce((n,r)=>n+overlap(p,r),0)+(selected?overlap(p,selected)*1000:0);return !best||score<best.score?{...p,score}:best;},null);
 }
 function place(box,canvas,plot,model,selected){
  box.style.maxHeight=Math.max(180,innerHeight-24)+'px';const b=box.getBoundingClientRect(),c=canvas.getBoundingClientRect();
  const area={x:Math.max(8,c.left+8),y:Math.max(8,c.top+8),w:Math.max(b.width,Math.min(innerWidth-8,c.right)-Math.max(8,c.left+8)),h:Math.max(b.height,Math.min(innerHeight-8,c.bottom)-Math.max(8,c.top+8))};
  let obstacles=[],target=null;
  if(plot?.scale){const rect=r=>({x:c.left+plot.ox+r.x0*plot.scale,y:c.top+plot.oy+r.y0*plot.scale,w:(r.x1-r.x0)*plot.scale,h:(r.y1-r.y0)*plot.scale});obstacles=model.ts.filter(t=>t.state!==0).map(rect);const hit=plot.hits.find(h=>h.id===selected.id&&h.kind===selected.kind&&(!selected.f||!h.f||h.f===selected.f));if(hit?.r){const r=hit.r;target=rect({x0:r.x-r.w/2,x1:r.x+r.w/2,y0:r.y-r.d/2,y1:r.y+r.d/2});}}
  else if(plot?.hits?.length){const points=plot.hits.flatMap(h=>h.pts||[]);if(points.length){let x=Infinity,y=Infinity,x1=-Infinity,y1=-Infinity;for(const p of points){x=Math.min(x,p[0]);y=Math.min(y,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]);}obstacles=[{x:c.left+x,y:c.top+y,w:x1-x,h:y1-y}];}}
  const pos=choose(area,{w:b.width,h:b.height},obstacles,target);box.style.left=clamp(pos.x,8,innerWidth-b.width-8)+'px';box.style.top=clamp(pos.y,8,innerHeight-b.height-8)+'px';
 }
 function bind(box){const handle=box.querySelector('.info-top');handle.style.cursor='move';handle.style.touchAction='none';let drag;
  handle.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button'))return;const r=box.getBoundingClientRect();drag={x:e.clientX,y:e.clientY,left:r.left,top:r.top};handle.setPointerCapture(e.pointerId);e.preventDefault();});
  handle.addEventListener('pointermove',e=>{if(!drag)return;const r=box.getBoundingClientRect();box.style.left=clamp(drag.left+e.clientX-drag.x,8,innerWidth-r.width-8)+'px';box.style.top=clamp(drag.top+e.clientY-drag.y,8,innerHeight-r.height-8)+'px';});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(event,()=>drag=null);
 }
 return {choose,place,bind};
})();
