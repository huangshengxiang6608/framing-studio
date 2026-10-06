const Drawing=(()=>{
 const palette={COL:'#d44d91',WALL:'#8159ad',MB:'#ce793a',SB:'#3b936e',TB:'#ef233c',CB:'#ffd000',CS:'#7847aa',SLAB:'#dde6dc'};
 const columnColor=c=>c.status==='上层柱'?'#2474a3':c.status==='下层柱'?'#593696':palette.COL;
 const memberColor=b=>palette[b.displayKind||b.kind]||palette[b.kind];
 const memberOutline=b=>(b.displayKind||b.kind)==='CB'?'#966b00':(b.displayKind||b.kind)==='TB'?'#a40019':null;
 const text=(ctx,s,x,y,size=12,color='#536779')=>{ctx.fillStyle=color;ctx.font=`${size}px "Segoe UI", "Microsoft YaHei", sans-serif`;ctx.fillText(s,x,y);};

 const checkColour='#dc1d78';
 function checkMembers(p,m,f,opt={}){if(opt.highlightScope==='none')return [];if(typeof Loading==='undefined')return [];const floors=Engine.floors(p);f??=floors.find(x=>x.type===m.key)?.n;if(!f||floors[f-1]?.type!==m.key)return [];const key=opt.highlightScope==='A'?'reportA':opt.highlightScope==='B'?'reportB':'selected',map=p.explorer?.[key]||{};
  return [...m.slabs.map(member=>({kind:'SLAB',member})),...m.beams.map(member=>({kind:member.kind,member})),...m.columns.map(member=>({kind:'COL',member}))].filter(x=>map[f+'|'+Loading.token(x.kind,x.member)]===true&&(x.kind==='SLAB'||opt.visible?.[x.kind]!==false)).map(x=>({...x,id:x.member.displayId||x.member.id,f}));
 }
 function checkLegend(ctx,opt,count,x,y){if(!count)return;const label=(opt.highlightScope==='A'?'A 抄':opt.highlightScope==='B'?'B 抄':'Check')+' 已选 '+count+' · 玫红边框；蓝色为当前点选';ctx.save();ctx.font='12px "Segoe UI", "Microsoft YaHei", sans-serif';ctx.fillStyle='#ffffffed';ctx.fillRect(x-6,y-16,ctx.measureText(label).width+12,24);text(ctx,label,x,y,12,checkColour);ctx.restore();}

 // Place the entire badge inside a visible, opening-free part of the load region.
 function loadAreaLabel(ctx,area,rects,plot,w,h){
  const {ox,oy,scale}=plot,pieces=rects.map(r=>({x0:Math.max(4,ox+r.x0*scale),x1:Math.min(w-4,ox+r.x1*scale),y0:Math.max(4,oy+r.y0*scale),y1:Math.min(h-4,oy+r.y1*scale)})).filter(r=>r.x1>r.x0&&r.y1>r.y0);
  function merge(rs,axis){const cross=axis==='x'?'y':'x',groups=new Map();for(const r of rs){const key=r[cross+'0'].toFixed(5)+'|'+r[cross+'1'].toFixed(5);if(!groups.has(key))groups.set(key,[]);groups.get(key).push({...r});}const out=[];for(const list of groups.values()){list.sort((a,b)=>a[axis+'0']-b[axis+'0']);let last;for(const r of list){if(last&&r[axis+'0']<=last[axis+'1']+1e-6)last[axis+'1']=Math.max(last[axis+'1'],r[axis+'1']);else{last=r;out.push(last);}}}return out;}
  const candidates=[...pieces,...merge(merge(pieces,'x'),'y'),...merge(merge(pieces,'y'),'x')];ctx.font='12px "Segoe UI", "Microsoft YaHei", sans-serif';
  function fit(label,compact){const fits=[];for(const r of candidates){const available=r.x1-r.x0-20;if(available<=0)continue;const lines=[];let line='',failed=false;for(const char of Array.from(label)){if(ctx.measureText(char).width>available){failed=true;break;}if(line&&ctx.measureText(line+char).width>available){lines.push(line);line='';}line+=char;}if(line)lines.push(line);if(failed||!lines.length||lines.length>3)continue;const width=Math.max(...lines.map(s=>ctx.measureText(s).width))+12,height=lines.length*16+6;if(height+8>r.y1-r.y0)continue;fits.push({x:(r.x0+r.x1-width)/2,y:(r.y0+r.y1-height)/2,width,height,lines,compact,room:(r.x1-r.x0)*(r.y1-r.y0)});}return fits.sort((a,b)=>a.lines.length-b.lines.length||b.room-a.room)[0];}
  return fit(String(area.name||area.number||''),false)||fit(String(area.number||'選'),true)||null;
 }

 function plan(ctx,w,h,p,m,opt={}){
  if(opt.monochrome)return FramingSymbols98.plan(ctx,w,h,p,m,opt);
  if(m.columnsOnly)opt={...opt,membersOnly:true};
  if(typeof Loading!=='undefined'&&Engine.floors(p)[(opt.floor||1)-1]?.type===m.key)m=Loading.supportModel(p,m,opt.floor);
  const xx=Engine.axes(p,'x',m.key),yy=Engine.axes(p,'y',m.key),maxX=xx.at(-1).v,maxY=yy.at(-1).v;
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#fbfcfd';ctx.fillRect(0,0,w,h);
  const bounds=opt.viewBounds||{x0:0,x1:maxX,y0:0,y1:maxY},scale=Math.min((w-125)/(bounds.x1-bounds.x0+2),(h-120)/(bounds.y1-bounds.y0+2))*(opt.zoom||1),ox=(w-(bounds.x1-bounds.x0)*scale)/2+20-bounds.x0*scale+(opt.panX||0),oy=(h-(bounds.y1-bounds.y0)*scale)/2+20-bounds.y0*scale+(opt.panY||0);
  const xy=(x,y)=>[ox+x*scale,oy+y*scale],box=(x,y,b,d,fill,stroke)=>{const [px,py]=xy(x,y);ctx.fillStyle=fill;ctx.fillRect(px,py,b*scale,d*scale);if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.strokeRect(px,py,b*scale,d*scale);}};
  if(!opt.membersOnly)for(const t of m.ts){box(t.x0,t.y0,t.x1-t.x0,t.y1-t.y0,t.state===0?'#edf0f3':t.state===2||opt.loadAreas?.length||(opt.columnLoadArea?.rects.length||opt.columnLoadArea?.polygons?.length)?'#ffffff':'#f3edd6','#d9e0e4');if(t.state===2){const a=xy(t.x0,t.y0),b=xy(t.x1,t.y1);ctx.strokeStyle='#b1bec5';ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.moveTo(a[0],b[1]);ctx.lineTo(b[0],a[1]);ctx.stroke();if(scale>6)text(ctx,'OP',(a[0]+b[0])/2-9,(a[1]+b[1])/2);}}
  if(!opt.membersOnly)for(const t of m.slabVoids){box(t.x0,t.y0,t.x1-t.x0,t.y1-t.y0,'#ffffff','#c9d3d9');const a=xy(t.x0,t.y0),b=xy(t.x1,t.y1);ctx.strokeStyle='#b1bec5';ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.moveTo(a[0],b[1]);ctx.lineTo(b[0],a[1]);ctx.stroke();text(ctx,'无楼板',(a[0]+b[0])/2-18,(a[1]+b[1])/2,11);}
  for(const area of opt.loadAreas||[]){ctx.save();ctx.fillStyle=area.colour;ctx.globalAlpha=(area.unassigned?1:area.draft?.15:area.overview?.32:area.active?.25:.13)*Math.min(1,area.fraction??1);for(const t of area.rects||[])ctx.fillRect(ox+t.x0*scale,oy+t.y0*scale,(t.x1-t.x0)*scale,(t.y1-t.y0)*scale);ctx.globalAlpha=1;ctx.strokeStyle=area.unassigned?'#dce3e6':area.colour;ctx.lineWidth=area.draft?3:area.active?3:1;if(!area.draft){ctx.beginPath();for(const [a,z]of LoadRegions83.boundary(area.rects||[])){ctx.moveTo(...xy(...a));ctx.lineTo(...xy(...z));}ctx.stroke();}ctx.restore();}
  if(opt.loadAreaView&&opt.loadBeamReference){ctx.save();ctx.strokeStyle='#839397';ctx.lineWidth=1;ctx.setLineDash([4,3]);for(const b of m.beams){ctx.beginPath();ctx.moveTo(...xy(...b.a));ctx.lineTo(...xy(...b.z));ctx.stroke();}ctx.restore();}
  ctx.lineWidth=1.2;ctx.strokeStyle='#315d91';ctx.setLineDash([4,5]);for(const a of xx){const pos=xy(a.v,0);ctx.beginPath();ctx.moveTo(pos[0],oy-31);ctx.lineTo(pos[0],oy+maxY*scale+10);ctx.stroke();}for(const a of yy){const pos=xy(0,a.v);ctx.beginPath();ctx.moveTo(ox-31,pos[1]);ctx.lineTo(ox+maxX*scale+10,pos[1]);ctx.stroke();}ctx.setLineDash([]);
  for(const a of xx){const [x]=xy(a.v,0);ctx.fillStyle='#fff';ctx.strokeStyle='#315d91';ctx.beginPath();ctx.arc(x,oy-43,12,0,Math.PI*2);ctx.fill();ctx.stroke();text(ctx,a.id,x-ctx.measureText(a.id).width/2,oy-39,12,'#315d91');}
  for(const a of yy){const [,y]=xy(0,a.v);ctx.fillStyle='#fff';ctx.strokeStyle='#315d91';ctx.beginPath();ctx.arc(ox-43,y,12,0,Math.PI*2);ctx.fill();ctx.stroke();text(ctx,a.id,ox-43-ctx.measureText(a.id).width/2,y+4,12,'#315d91');}
  for(let i=1;i<xx.length;i++){const [x]=xy((xx[i].v+xx[i-1].v)/2,0);text(ctx,(xx[i].v-xx[i-1].v).toFixed(2),x-14,oy-16,10);}
  for(let i=1;i<yy.length;i++){const [,y]=xy(0,(yy[i].v+yy[i-1].v)/2);ctx.save();ctx.translate(ox-18,y+14);ctx.rotate(-Math.PI/2);text(ctx,(yy[i].v-yy[i-1].v).toFixed(2),0,0,10);ctx.restore();}
  if(opt.showNoColumn!==false)for(const r of p.types[m.key].noColumnZones||[])box(r.x0,r.y0,r.x1-r.x0,r.y1-r.y0,'rgba(203,76,85,.12)','#c94c55');
  if(opt.showNoColumn!==false&&opt.selected?.kind==='ZONE'){const r=p.types[m.key].noColumnZones?.[opt.selected.index];if(r){const q=xy(r.x0,r.y0);ctx.save();ctx.strokeStyle='#0086d1';ctx.lineWidth=3;ctx.strokeRect(...q,(r.x1-r.x0)*scale,(r.y1-r.y0)*scale);text(ctx,'禁柱区 '+(opt.selected.index+1),q[0]+5,q[1]+16,12,'#006da8');ctx.restore();}}
  const cg=opt.gridPreview||p.types[m.key].columnGrid;if(cg&&opt.showColumnGrid!==false){ctx.save();ctx.strokeStyle='#b6a5d8';ctx.lineWidth=1;ctx.setLineDash([8,5]);for(const x of cg.x){ctx.beginPath();ctx.moveTo(...xy(x,yy[0].v));ctx.lineTo(...xy(x,maxY));ctx.stroke();}for(const y of cg.y){ctx.beginPath();ctx.moveTo(...xy(xx[0].v,y));ctx.lineTo(...xy(maxX,y));ctx.stroke();}ctx.setLineDash([]);if(opt.points)for(const x of cg.x)for(const y of cg.y){ctx.beginPath();ctx.arc(...xy(x,y),2.5,0,Math.PI*2);ctx.fillStyle='#b6a5d8';ctx.fill();}ctx.restore();}
  const hits=[];for(const b of [...m.beams,...m.walls]){if(opt.visible?.[b.kind]===false)continue;const r=Engine.rect(b);box(r.x-r.w/2,r.y-r.d/2,r.w,r.d,memberColor(b),memberOutline(b));if(b.supportStatus==='unverified'){const [x,y]=xy(r.x-r.w/2,r.y-r.d/2);ctx.save();ctx.setLineDash([5,4]);ctx.strokeStyle='#684400';ctx.lineWidth=2;ctx.strokeRect(x-2,y-2,r.w*scale+4,r.d*scale+4);ctx.restore();}hits.push({r,id:b.id,displayId:b.displayId||b.id,kind:b.kind,source:b.source});if(opt.labels){const [x,y]=xy(r.x,r.y);text(ctx,b.displayId||b.id,x+3,y-4,10,memberColor(b));}}
  if(opt.beamCenters)for(const b of m.beams){if(opt.visible?.[b.kind]===false)continue;ctx.save();ctx.strokeStyle='#164a66';ctx.lineWidth=1;ctx.setLineDash([6,3]);ctx.beginPath();ctx.moveTo(...xy(...b.a));ctx.lineTo(...xy(...b.z));ctx.stroke();ctx.setLineDash([]);for(const q of [b.a,b.z]){ctx.beginPath();ctx.arc(...xy(...q),4,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.stroke();}const mid=xy((b.a[0]+b.z[0])/2,(b.a[1]+b.z[1])/2);ctx.beginPath();ctx.moveTo(mid[0],mid[1]-4);ctx.lineTo(mid[0]+4,mid[1]);ctx.lineTo(mid[0],mid[1]+4);ctx.lineTo(mid[0]-4,mid[1]);ctx.closePath();ctx.fillStyle='#fff';ctx.fill();ctx.stroke();ctx.restore();}
  if(opt.visible?.COL!==false)for(const entry of opt.columnPlan||m.columns.map(c=>({column:c,status:c.status,floor:opt.floor}))){const c=entry.column,cr=entry.rect||Engine.columnRect(c);box(cr.x-cr.w/2,cr.y-cr.d/2,cr.w,cr.d,columnColor({status:entry.status}),'#526878');if(entry.status!=='上下贯通'){const x=ox+(cr.x-cr.w/2)*scale,y=oy+(cr.y-cr.d/2)*scale,ww=cr.w*scale,hh=cr.d*scale;ctx.save();ctx.beginPath();ctx.rect(x,y,ww,hh);ctx.clip();ctx.strokeStyle=entry.status==='上层柱'?'#103d59':'#e4dff0';ctx.lineWidth=.8;for(let d=-hh;d<ww+hh;d+=7){ctx.beginPath();ctx.moveTo(x+d,y+hh);ctx.lineTo(x+d+hh,y);if(entry.status==='下层柱'){ctx.moveTo(x+d,y);ctx.lineTo(x+d+hh,y+hh);}ctx.stroke();}ctx.restore();if(entry.status==='下层柱'){ctx.save();ctx.setLineDash([5,3]);ctx.strokeStyle='#35215a';ctx.lineWidth=1.4;ctx.strokeRect(x,y,ww,hh);ctx.restore();}}hits.push({r:cr,id:c.id,kind:'COL',f:entry.floor,columnStatus:entry.status});if(opt.labels){const [x,y]=xy(cr.x,cr.y);text(ctx,c.id,x+5,y+14,10);}}
  if(opt.visible?.COL!==false)for(const marker of opt.transferMarkers||[]){const c=marker.column,[x,y]=xy(c.x,c.y);ctx.save();ctx.strokeStyle='#246b95';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.moveTo(x-4,y-4);ctx.lineTo(x+4,y+4);ctx.moveTo(x-4,y+4);ctx.lineTo(x+4,y-4);ctx.stroke();const label='TC · '+FloorLevels.name(p,marker.floor)+' '+c.id+' → '+marker.beam.id;ctx.font='11px Segoe UI';const tw=ctx.measureText(label).width,tx=Math.max(8,Math.min(w-tw-8,x+12)),ty=Math.max(18,y-18);ctx.fillStyle='#ffffffee';ctx.fillRect(tx-3,ty-12,tw+6,17);text(ctx,label,tx,ty,11,'#246b95');ctx.restore();}
  if(opt.columnSnaps)for(const c of m.columns)for(const q of FloorColumns101.snap(c,opt.start)){ctx.beginPath();ctx.arc(...xy(...q),3,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#0577ae';ctx.lineWidth=1.4;ctx.stroke();}if(opt.points)for(const x of xx)for(const y of yy){if(opt.columnSnaps&&m.columns.some(c=>{const r=Engine.columnRect(c);return Math.abs(x.v-r.x)<=r.w/2+1e-7&&Math.abs(y.v-r.y)<=r.d/2+1e-7;}))continue;const a=xy(x.v,y.v);ctx.beginPath();ctx.arc(...a,2.5,0,Math.PI*2);ctx.fillStyle='#315d91';ctx.fill();}
  if(opt.start){const [x,y]=xy(...opt.start);ctx.strokeStyle='#008fa0';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.stroke();}


  if(opt.showSecondaryAreas)for(const [i,area]of (p.types[m.key].secondaryAreas||[]).entries()){const colour=['#0e8397','#8a58ad','#bd722b'][i%3];for(const r of area.rects){box(r.x0,r.y0,r.x1-r.x0,r.y1-r.y0,i%2?'rgba(138,88,173,.09)':'rgba(14,131,151,.09)',colour);const mid=xy((r.x0+r.x1)/2,(r.y0+r.y1)/2),horiz=area.direction==='X',len=Math.min(30,(horiz?r.x1-r.x0:r.y1-r.y0)*scale/3);ctx.save();ctx.strokeStyle=colour;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(mid[0]-(horiz?len:0),mid[1]-(horiz?0:len));ctx.lineTo(mid[0]+(horiz?len:0),mid[1]+(horiz?0:len));ctx.lineTo(mid[0]+(horiz?len-6:6),mid[1]+(horiz?-6:len-6));ctx.moveTo(mid[0]+(horiz?len:0),mid[1]+(horiz?0:len));ctx.lineTo(mid[0]+(horiz?len-6:-6),mid[1]+(horiz?6:len-6));ctx.stroke();text(ctx,area.name+' · '+area.direction,mid[0]+8,mid[1]-10,11,colour);ctx.restore();}}
  const areaPlot={scale,ox,oy,hits},columnAreaPaint=opt.columnLoadArea&&typeof ColumnLoads101!=='undefined'?ColumnLoads101.region(ctx,areaPlot,w,h,opt.columnLoadArea):null;
  const checkHighlights=checkMembers(p,m,opt.floor,opt);
  // Outline the actual selected members; do not change type colours or support warnings.
  for(const x of checkHighlights){const c=x.member;ctx.save();ctx.setLineDash([]);ctx.beginPath();
   if(x.kind==='SLAB'){for(const [a,z]of c.edges){ctx.moveTo(...xy(...a));ctx.lineTo(...xy(...z));}}
   else {const r=x.kind==='COL'?Engine.columnRect(c):Engine.rect(c),q=xy(r.x-r.w/2,r.y-r.d/2);ctx.rect(q[0]-6,q[1]-6,r.w*scale+12,r.d*scale+12);}
   ctx.strokeStyle='#fff';ctx.lineWidth=7;ctx.stroke();ctx.strokeStyle=checkColour;ctx.lineWidth=3;ctx.stroke();ctx.restore();
  }

  const csMarkers=[],drawingFloor=opt.floor||Engine.floors(p).find(f=>f.type===m.key)?.n;
  if(!opt.membersOnly&&!opt.loadAreaView&&typeof Loading!=='undefined')for(const slab of m.slabs){const o=Loading.input(p,drawingFloor,Loading.token('SLAB',slab));if(o.slabType!=='CS')continue;const labels={left:'左',right:'右',top:'上',bottom:'下'},edge=o.csFixedEdge,cx=(slab.x0+slab.x1)/2,cy=(slab.y0+slab.y1)/2;
   const endpoints={left:[[slab.x0,slab.y0],[slab.x0,slab.y1]],right:[[slab.x1,slab.y0],[slab.x1,slab.y1]],top:[[slab.x0,slab.y0],[slab.x1,slab.y0]],bottom:[[slab.x0,slab.y1],[slab.x1,slab.y1]]}[edge];
   csMarkers.push({id:slab.id,edge,endpoints});ctx.save();ctx.strokeStyle=palette.CS;ctx.lineWidth=3;ctx.setLineDash([]);
   if(endpoints){ctx.beginPath();ctx.moveTo(...xy(...endpoints[0]));ctx.lineTo(...xy(...endpoints[1]));ctx.stroke();const center=xy(cx,cy),target=xy((endpoints[0][0]+endpoints[1][0])/2,(endpoints[0][1]+endpoints[1][1])/2),end=center.map((v,i)=>v+(target[i]-v)*.7),angle=Math.atan2(end[1]-center[1],end[0]-center[0]);ctx.beginPath();ctx.moveTo(...center);ctx.lineTo(...end);for(const d of [-.55,.55]){ctx.moveTo(...end);ctx.lineTo(end[0]-10*Math.cos(angle+d),end[1]-10*Math.sin(angle+d));}ctx.stroke();}
   const label='CS · '+(labels[edge]?labels[edge]+'固定':'待选固定边'),q=xy(cx,cy);text(ctx,label,q[0]+5,q[1]-10,12,palette.CS);ctx.restore();
  }

  if(!opt.membersOnly&&opt.labels&&typeof SlabMarks83!=='undefined'){const types=[...new Set(m.slabs.map(s=>s.thickness))];for(const slab of m.slabs)for(const mark of SlabMarks83.layout(p,drawingFloor,slab,m,scale)){const q=xy(mark.x,mark.y),label='S'+(types.indexOf(slab.thickness)+1),dx=mark.dir==='X'?Math.min(9,(mark.part.x1-mark.part.x0)*scale*.3):0,dy=mark.dir==='Y'?Math.min(9,(mark.part.y1-mark.part.y0)*scale*.3):0;ctx.save();ctx.strokeStyle='#3b936e';ctx.lineWidth=1.5;if(mark.dir){ctx.beginPath();ctx.moveTo(q[0]-dx,q[1]-dy);ctx.lineTo(q[0]+dx,q[1]+dy);for(const sign of [-1,1]){const ex=q[0]+sign*dx,ey=q[1]+sign*dy;ctx.moveTo(ex-(dx?sign*4:4),ey-(dy?sign*4:4));ctx.lineTo(ex,ey);ctx.lineTo(ex-(dx?sign*4:-4),ey-(dy?sign*4:-4));}ctx.stroke();}else text(ctx,'?',q[0]-3,q[1]+3,11,'#a76a21');const tx=q[0]+(mark.narrow?12:10),ty=q[1]-12;ctx.fillStyle='#ffffffee';ctx.fillRect(tx-2,ty-11,24,15);text(ctx,label,tx,ty,11,'#286e62');if(mark.narrow){ctx.strokeStyle='#81939c';ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(tx,ty);ctx.stroke();}ctx.restore();}}
  if(opt.selected){
   const s=opt.selected,slab=s.kind==='SLAB'?m.slabs.find(t=>t.id===s.slabId):null;
   const o=hits.find(o=>o.id===s.id&&o.kind===s.kind&&(!o.f||o.f===(s.f??opt.floor))),r=o?.r;
   if(slab){ctx.save();ctx.fillStyle='rgba(0,175,255,.28)';for(const t of slab.rects){const [x,y]=xy(t.x0,t.y0);ctx.fillRect(x,y,(t.x1-t.x0)*scale,(t.y1-t.y0)*scale);}ctx.setLineDash([]);ctx.beginPath();for(const [a,z]of slab.edges){ctx.moveTo(...xy(...a));ctx.lineTo(...xy(...z));}ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.stroke();ctx.strokeStyle='#008cdb';ctx.lineWidth=3;ctx.stroke();ctx.restore();const [x,y]=xy(slab.x0,slab.y0);text(ctx,'选中 '+slab.id,x+5,y-10,12,'#006da8');}
   if(r){const [x,y]=xy(r.x-r.w/2,r.y-r.d/2),ww=r.w*scale,dd=r.d*scale;ctx.save();ctx.setLineDash([]);ctx.fillStyle='rgba(0,175,255,.28)';ctx.fillRect(x,y,ww,dd);ctx.strokeStyle='#ffffff';ctx.lineWidth=6;ctx.strokeRect(x-3,y-3,ww+6,dd+6);ctx.strokeStyle='#008cdb';ctx.lineWidth=3;ctx.strokeRect(x-3,y-3,ww+6,dd+6);ctx.restore();text(ctx,'选中 '+(o?.displayId||s.id),x+5,y-10,12,'#006da8');}
  }
  const loadAreaLabels=[],loadLabelCuts=[...m.ts.filter(t=>t.state===2),...(m.slabVoids||[])];
  for(const area of opt.loadAreas||[]){if(area.unassigned||!area.overview&&!area.draft)continue;ctx.save();if(area.draft){ctx.strokeStyle=area.colour;ctx.lineWidth=3;ctx.beginPath();for(const [a,z]of LoadRegions83.boundary(area.outlineRects||area.rects)){ctx.moveTo(...xy(...a));ctx.lineTo(...xy(...z));}ctx.stroke();ctx.restore();continue;}const rects=LoadRegions83.difference(area.rects||[],loadLabelCuts),badge=loadAreaLabel(ctx,area,rects,{ox,oy,scale},w,h);if(badge){const {x,y,width,height,lines}=badge;ctx.fillStyle='#ffffff';ctx.globalAlpha=.94;ctx.fillRect(x,y,width,height);ctx.globalAlpha=1;lines.forEach((line,i)=>text(ctx,line,x+6,y+15+i*16,12,area.colour));loadAreaLabels.push({...badge,name:area.name,number:area.number});}ctx.restore();}
  checkLegend(ctx,opt,checkHighlights.length,20,h-18);
  const columnAreaBadge=opt.columnLoadArea&&typeof ColumnLoads101!=='undefined'?ColumnLoads101.badge(ctx,areaPlot,w,h,opt.columnLoadArea,columnAreaPaint):null;
  return {scale,ox,oy,hits,loadAreaLabels,csMarkers,checkHighlights,columnAreaPaint,columnAreaBadge,slabs:opt.membersOnly?[]:m.slabs,world:(x,y)=>[(x-ox)/scale,(y-oy)/scale]};
 }
 function elevationData(p,result,direction,opt={}){
  const lo=Math.max(1,Math.min(result.floors.length,opt.lo||1)),hi=Math.max(lo,Math.min(result.floors.length,opt.hi||result.floors.length)),axis=direction==='X'?0:1,cross=1-axis,cut=opt.cut===undefined||opt.cut==='all'?null:Number(opt.cut),tops=[0],items=[];
  result.floors.forEach(f=>tops.push(tops.at(-1)+f.h));const bottom=tops[lo-1],top=LocalHeights96.extent(p,lo,hi),levels=[];
  const intersects=(r,ref)=>cut===null||Number.isFinite(cut)&&(cut>=(cross?r.y-r.d/2:r.x-r.w/2)-1e-6&&cut<=(cross?r.y+r.d/2:r.x+r.w/2)+1e-6||ref!==undefined&&Math.abs(cut-ref)<1e-6);
  const add=(r,z0,z1,kind,id,f,ref)=>{if(opt.visible?.[kind]===false||!intersects(r,ref))return;z0=Math.max(bottom,z0);z1=Math.min(top,z1);if(z1<=z0)return;items.push({u0:axis?r.y-r.d/2:r.x-r.w/2,u1:axis?r.y+r.d/2:r.x+r.w/2,z0,z1,kind,id,f});};
  const axes=new Map();
  for(let f=lo;f<=hi;f++){const floor=result.floors[f-1],m=Engine.floorModel(result,floor),z=tops[f],bot=tops[f-1];levels.push({f,z,h:floor.h,type:floor.type});for(const a of Engine.axes(p,axis?'y':'x',m.key)){const k=a.v.toFixed(6);if(!axes.has(k))axes.set(k,{v:a.v,names:new Set()});axes.get(k).names.add(a.id);}
   if(LocalHeights96.changed(p)){for(const s of LocalHeights96.solids(p,result,f,m,hi)){const q=s.member,ref=s.kind==='COL'?(cross?q.y:q.x):q.rawA&&q.rawA[cross]===q.rawZ[cross]?q.rawA[cross]:undefined;add(s.r,s.z0,s.z1,s.kind,s.displayId,f,ref);}continue;}
   for(const wall of m.walls)add(Engine.rect(wall),bot,z,'WALL',wall.id,f,wall.rawA[cross]===wall.rawZ[cross]?wall.rawA[cross]:undefined);
   for(const c of m.columns){let z0=bot,z1=z;if(c.status==='上层柱'){z0=z;z1=tops[f+1]??z+floor.h;if(f<hi&&Engine.floorModel(result,f+1).columns.some(n=>n.status!=='上层柱'&&Math.hypot(n.x-c.x,n.y-c.y)<1e-6))continue;}add(Engine.columnRect(c),z0,z1,'COL',c.id,f,cross?c.y:c.x);}
   for(const b of m.beams)add(Engine.rect(b),z-b.d,z,b.kind,b.displayId||b.id,f,b.rawA[cross]===b.rawZ[cross]?b.rawA[cross]:undefined);
   for(const slab of m.slabs)for(const r of slab.rects)add({x:(r.x0+r.x1)/2,y:(r.y0+r.y1)/2,w:r.x1-r.x0,d:r.y1-r.y0},z-slab.thickness/1000,z,'SLAB',slab.id,f);
  }
  const grid=[...axes.values()].sort((a,b)=>a.v-b.v).map(a=>({v:a.v,id:[...a.names].join('/')})),u0=Math.min(...grid.map(a=>a.v),...items.map(a=>a.u0)),u1=Math.max(...grid.map(a=>a.v),...items.map(a=>a.u1));
  return {direction,cut,lo,hi,bottom,top,levels,items,axes:grid,u0,u1};
 }
 function elevationInputs(ctx,plot,p){
  const hits=[],fmt=v=>typeof v==='number'?Number(v.toFixed(3)).toString():'—';
  for(const [i,v]of plot.views.entries()){
   const face=i===0?'B':'D',n=OverallGeometry.input(p,face),b=v.box,l=b.x+12,r=b.x+b.w-112,c=b.x+b.w/2,top=b.y+35,base=OverallGeometry.levels(p)[0].z,manual=(key,label,x,y,w=100)=>{const disabled=n.basement==='No'&&['leftGWL','rightGWL','leftQ','rightQ'].includes(key),h=39;const empty=n[key]===null;ctx.fillStyle=disabled?'#fafbfc':'#f7fafb';ctx.beginPath();ctx.roundRect(x,y,w,h,5);ctx.fill();ctx.strokeStyle=disabled?'#e5eaf0':empty?'#d8bd79':'#99bcc6';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+5,y+h-1);ctx.lineTo(x+w-5,y+h-1);ctx.stroke();text(ctx,label,x+6,y+12,9.5,disabled?'#99a5b0':'#718493');text(ctx,disabled?'不适用':key==='basement'?(n.basement==='Yes'?'有 Basement':'无 Basement'):empty?(['leftQ','rightQ'].includes(key)?'填写荷载':'填写标高'):fmt(n[key]),x+6,y+30,12,disabled?'#a3adb5':empty?'#a28348':'#245b6b');if(!disabled)hits.push({face,key,x,y,w,h});},read=(label,x,y)=>text(ctx,label,x,y,11,'#315d79');
   read('B（迎风宽） '+fmt(n.breadth)+' m',l,top+2);read('D（顺风深） '+fmt(n.depth)+' m',r,top+2);
   const roofY=v.oy-(v.top-v.bottom)*v.scale,roofX=Math.max(l,v.ox-135),edgeX=v.ox+(v.u1-v.u0)*v.scale;manual('height',base===null?'楼顶 mPD · 设定基准':'楼顶 mPD · 点击修改',roofX,roofY-59,125);manual('basement','Basement',r,top+17);
   const yGround=b.y+b.h*.57,yWater=yGround+51,yO=Math.min(b.y+b.h-80,v.oy+31);
   manual('leftQ','左 Surcharge kPa',l,yGround-51);manual('rightQ','右 Surcharge kPa',r,yGround-51);manual('leftEL','左地面 mPD',l,yGround);manual('rightEL','右地面 mPD',r,yGround);manual('leftGWL','左水位 mPD',l,yWater);manual('rightGWL','右水位 mPD',r,yWater);manual('baseRL','O 点 mPD',Math.max(l,Math.min(r-110,edgeX-100)),yO);if(base===null||n.baseRL===null||Math.abs(n.baseRL-base)<1e-6){ctx.fillStyle='#264d6c';ctx.beginPath();ctx.arc(edgeX,v.oy,3,0,Math.PI*2);ctx.fill();text(ctx,'O',edgeX+6,v.oy+12,11,'#264d6c');}
   if([n.height,n.leftEL,n.rightEL].every(Number.isFinite)){read('Hp = '+fmt(n.height-Math.min(n.leftEL,n.rightEL))+' m',l,top+80);read('He = '+fmt(n.height-n.leftEL)+' m',l,top+96);if(Number.isFinite(n.baseRL))read('风力臂 = '+fmt((n.height-n.leftEL)/2+n.leftEL-n.baseRL)+' m',l,top+112);}
   // Ground / water reference marks use the same absolute datum as model levels.
   if(base!==null){for(const [key,x0,x1,color,dash]of [['leftEL',v.ox,(v.ox+edgeX)/2-4,'#736552',false],['rightEL',(v.ox+edgeX)/2+4,edgeX,'#736552',false],['leftGWL',v.ox,(v.ox+edgeX)/2-4,'#6f59a0',true],['rightGWL',(v.ox+edgeX)/2+4,edgeX,'#6f59a0',true]]){if(!Number.isFinite(n[key])||(dash&&n.basement==='No'))continue;const y=v.oy-(n[key]-base-v.bottom)*v.scale;if(y<b.y+155||y>b.y+b.h-85)continue;ctx.save();ctx.strokeStyle=color;ctx.lineWidth=1.4;ctx.setLineDash(dash?[4,3]:[]);ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();ctx.restore();}}
   text(ctx,'其他参数 ›',r,b.y+b.h-18,10,'#62818e');hits.push({face,key:'all',x:r,y:b.y+b.h-35,w:100,h:29});
  }return hits;
 }


 function elevation(ctx,w,h,p,result,opt={}){
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#f5f8fa';ctx.fillRect(0,0,w,h);const wide=w>=1120,gap=12,panels=wide?[{x:8,y:8,w:(w-28)/2,h:h-46},{x:20+(w-28)/2,y:8,w:(w-28)/2,h:h-46}]:[{x:8,y:8,w:w-16,h:(h-62)/2},{x:8,y:20+(h-62)/2,w:w-16,h:(h-62)/2}],views=[];
  const datasets=['X','Y'].map(direction=>elevationData(p,result,direction,{...opt,cut:direction==='X'?opt.cutY:opt.cutX})),fits=datasets.map((data,i)=>Math.max(.05,Math.min(Math.max(30,panels[i].w-435)/Math.max(.1,data.u1-data.u0),Math.max(30,panels[i].h-310)/Math.max(.1,data.top-data.bottom))));
  for(const [i,direction]of ['X','Y'].entries()){
   const box=panels[i],data=datasets[i],span=Math.max(.1,data.u1-data.u0),scale=(wide?Math.min(...fits):fits[i])*(opt.zoom||1),ox=box.x+225+(box.w-435-span*scale)/2+(opt.panX||0),oy=box.y+170+(box.h-310+(data.top-data.bottom)*scale)/2+(opt.panY||0),xy=(u,z)=>[ox+(u-data.u0)*scale,oy-(z-data.bottom)*scale];
   views.push({...data,scale,ox,oy,box});ctx.save();ctx.beginPath();ctx.rect(box.x,box.y,box.w,box.h);ctx.clip();ctx.fillStyle='#fff';ctx.fillRect(box.x,box.y,box.w,box.h);ctx.strokeStyle='#e4ebef';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(box.x+.5,box.y+.5,box.w-1,box.h-1,8);ctx.stroke();
   text(ctx,(direction==='X'?'正立面 · X–Z':'侧立面 · Y–Z')+'  '+(data.cut===null?'全部投影':(direction==='X'?'Y':'X')+' = '+data.cut.toFixed(3)+' m'),box.x+12,box.y+21,13,'#264d6c');
   ctx.strokeStyle='#d6e1ea';ctx.lineWidth=.7;ctx.setLineDash([4,4]);for(const a of data.axes){const [x]=xy(a.v,0);ctx.beginPath();ctx.moveTo(x,xy(0,data.bottom)[1]);ctx.lineTo(x,xy(0,data.top)[1]-10);ctx.stroke();}ctx.setLineDash([]);
   const rank={WALL:0,COL:1,SLAB:2,MB:3,SB:3,CB:3,TB:4};for(const it of [...data.items].sort((a,b)=>rank[a.kind]-rank[b.kind])){const [x,y]=xy(it.u0,it.z1),ww=(it.u1-it.u0)*scale,hh=(it.z1-it.z0)*scale;ctx.fillStyle=palette[it.kind];ctx.fillRect(x,y,Math.max(.7,ww),Math.max(.7,hh));if(opt.labels&&ww>40&&hh>8)text(ctx,it.id,x+3,y+Math.min(hh-1,12),10,'#24445c');}
   const levels=[{f:data.lo-1,z:data.bottom},...data.levels];let lastY=-Infinity;for(const level of [...levels].reverse()){const y=xy(0,level.z)[1],edge=level.z===data.top||level.z===data.bottom;if(!edge&&y-lastY<19)continue;lastY=y;ctx.strokeStyle='#7d97a8';ctx.lineWidth=.6;ctx.setLineDash([2,4]);ctx.beginPath();ctx.moveTo(ox-7,y);ctx.lineTo(ox+span*scale+7,y);ctx.stroke();ctx.setLineDash([]);text(ctx,(p.elevationLevels?.names?.[level.f]||(level.f===0?'模型底':level.f+'/F'))+'  '+(OverallGeometry.levels(p)[0].z===null?level.z.toFixed(2):(level.z+OverallGeometry.levels(p)[0].z).toFixed(2)),Math.max(box.x+5,ox-85),y+4,10,'#315d91');}
   let lastX=-Infinity;for(const a of data.axes){const [x,y]=xy(a.v,data.bottom);if(x-lastX<26)continue;lastX=x;text(ctx,a.id,x-4,y+17,10,'#315d91');}
   for(const level of data.levels)if(level.h*scale>=28){const y=xy(0,level.z-level.h/2)[1];text(ctx,level.h.toFixed(2)+' m',ox+span*scale+10,y+4,10);}
   if(!data.items.length)text(ctx,'此位置／楼层范围没有可见构件',box.x+16,box.y+48,12,'#8b6845');ctx.restore();
  }
  text(ctx,(OverallGeometry.levels(p)[0].z===null?'尚未填写楼顶 mPD，图中暂示模型相对高度 · ':'标高 mPD · ')+(wide?'两图同一比例，楼层标高对齐':'两图分别适合窗口')+' · 点击带下划线的数值可编辑',12,h-12,10);
  const plot={elevation:true,views,hits:[]};plot.inputHits=elevationInputs(ctx,plot,p);return plot;
 }

 function three(ctx,w,h,p,result,opt={}){
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#f6f8fa';ctx.fillRect(0,0,w,h);
  const fs=result.floors,maxX=Math.max(...Object.keys(result.models).map(k=>Engine.axes(p,'x',k).at(-1).v)),maxY=Math.max(...Object.keys(result.models).map(k=>Engine.axes(p,'y',k).at(-1).v)),floor=Math.min(opt.floor||1,fs.length),{lo,hi}=Engine.viewRange(fs.length,floor,opt.scope,opt.localCount,opt.localRange);
  let tops=[0];fs.forEach(f=>tops.push(tops.at(-1)+f.h));const z0=tops[lo-1],z1=LocalHeights96.extent(p,lo,hi),yaw=opt.yaw??-.65,el=opt.el??.5,cs=Math.cos(yaw),sn=Math.sin(yaw),ce=Math.cos(el),se=Math.sin(el);
  const raw=(x,y,z)=>{x-=maxX/2;y=maxY-y-maxY/2;z-=opt.scope==='single'?z0+Math.max(...fs.map(f=>f.h))/2:(z0+z1)/2;return [x*cs-y*sn,x*sn*se+y*cs*se+z*ce,-x*sn*ce-y*cs*ce+z*se];};
  const cameraTop=opt.scope==='single'?z0+Math.max(...fs.map(f=>f.h)):z1;const bounds=[];for(const x of [0,maxX])for(const y of [0,maxY])for(const z of [z0,cameraTop])bounds.push(raw(x,y,z));
  const u=Math.max(...bounds.map(a=>a[0]))-Math.min(...bounds.map(a=>a[0])),v=Math.max(...bounds.map(a=>a[1]))-Math.min(...bounds.map(a=>a[1])),scale=Math.min((w-70)/Math.max(u,1),(h-70)/Math.max(v,1))*(opt.zoom||1);
  const project=(x,y,z)=>{const a=raw(x,y,z);return [w/2+a[0]*scale+(opt.panX||0),h/2-a[1]*scale+(opt.panY||0),a[2]];},faces=[];
  let meshCount=0;const checkKeys=new Set();
  const box=(x,y,ww,dd,bottom,top,color,id,kind,f,slabId)=>{
   const a=[[x,y,bottom],[x+ww,y,bottom],[x+ww,y+dd,bottom],[x,y+dd,bottom],[x,y,top],[x+ww,y,top],[x+ww,y+dd,top],[x,y+dd,top]].map(v=>project(...v));
   for(const ids of [[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]]){const pts=ids.map(i=>a[i]);faces.push({pts,z:pts.reduce((s,a)=>s+a[2],0)/4,color,id,kind,f,slabId});}meshCount++;
  };
  for(let f=lo;f<=hi;f++){const m=typeof Loading!=='undefined'?Loading.supportModel(p,Engine.floorModel(result,f),f):Engine.floorModel(result,f),z=tops[f],bottom=tops[f-1];
   for(const x of checkMembers(p,m,f,opt))if(x.kind!=='SLAB'||opt.visible?.SLAB)checkKeys.add(f+'|'+x.kind+'|'+x.member.id);
   if(LocalHeights96.changed(p)){
    for(const s of LocalHeights96.solids(p,result,f,m,hi)){if(opt.visible?.[s.kind]===false||s.kind==='SLAB'&&!opt.visible?.SLAB)continue;const r=s.r,color=s.kind==='SLAB'?(typeof Loading!=='undefined'&&Loading.input(p,f,Loading.token('SLAB',s.member)).slabType==='CS'?palette.CS:palette.SLAB):s.kind==='COL'?palette.COL:memberColor(s.member);box(r.x-r.w/2,r.y-r.d/2,r.w,r.d,s.z0,s.z1,color,s.id,s.kind,f,s.kind==='SLAB'?s.id:undefined);}
   }else{
   if(opt.visible?.COL!==false)for(const c of m.columns){let bot=bottom,top=z;if(c.status==='上层柱'){bot=z;top=tops[f+1]??z+fs[f-1].h;if(f<hi&&Engine.floorModel(result,f+1).columns.some(n=>n.status!=='上层柱'&&Math.hypot(n.x-c.x,n.y-c.y)<1e-6))continue;}box(Engine.columnRect(c).x-c.b/2,Engine.columnRect(c).y-c.d/2,c.b,c.d,bot,top,palette.COL,c.id,'COL',f);}
   for(const b of [...m.beams,...m.walls])if(opt.visible?.[b.kind]!==false){const r=Engine.rect(b);box(r.x-r.w/2,r.y-r.d/2,r.w,r.d,b.kind==='WALL'?bottom:z-b.d,z,memberColor(b),b.id,b.kind,f);}
   if(opt.visible?.SLAB)for(const slab of m.slabs)for(const t of slab.rects)box(t.x0,t.y0,t.x1-t.x0,t.y1-t.y0,z-slab.thickness/1000,z,typeof Loading!=='undefined'&&Loading.input(p,f,Loading.token('SLAB',slab)).slabType==='CS'?palette.CS:palette.SLAB,slab.id,'SLAB',f,slab.id);
   }
   if(meshCount>50000){text(ctx,'构件过多，请选择“局部 5 层”或“单层”',30,50,16);return {hits:[]};}
  }
  faces.sort((a,b)=>a.z-b.z);ctx.lineWidth=.3;
  for(const face of faces){const s=opt.selected,active=s&&s.id===face.id&&s.kind===face.kind&&face.f===(s.f??floor)&&(s.kind!=='SLAB'||s.slabId===face.slabId);face.highlighted=!!active;face.checkHighlighted=checkKeys.has(face.f+'|'+face.kind+'|'+face.id);ctx.beginPath();face.pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=active?'#48c7ff':face.color;ctx.fill();ctx.strokeStyle=active?'#006aab':face.checkHighlighted?checkColour:memberOutline({kind:face.kind})||'#394e6344';ctx.lineWidth=active?2.5:face.checkHighlighted?2:memberOutline({kind:face.kind})?1:.3;ctx.stroke();}
  text(ctx,`${FloorLevels.range(p,lo,hi)} · ${meshCount} 个构件 · 顶标高 ${z1.toFixed(2)} m`,20,h-18,12);
  checkLegend(ctx,opt,checkKeys.size,20,h-44);return {hits:faces,lo,hi,checkCount:checkKeys.size};
 }
 function pick(plot,x,y){
  if(!plot)return null;
  if(plot.world){const q=plot.world(x,y),pad=5/plot.scale;
   const hit=[...plot.hits].reverse().find(o=>Math.abs(q[0]-o.r.x)<=o.r.w/2+pad&&Math.abs(q[1]-o.r.y)<=o.r.d/2+pad);if(hit)return hit;
   const t=plot.slabs.find(s=>s.rects.some(t=>q[0]>=t.x0&&q[0]<t.x1&&q[1]>=t.y0&&q[1]<t.y1));
   return t?{kind:'SLAB',id:t.id,slabId:t.id}:null;
  }
  // Test faces in the reverse of their actual painter order, respecting occlusion.
  const contains=pts=>{let inside=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;};
  return [...plot.hits].reverse().find(o=>contains(o.pts))||null;
 }
 function info(p,result,key,floor,hit){
  if(!hit)return null;const f=hit.f??floor,k=hit.f?result.floors[f-1]?.type:key,base=Engine.floorModel(result,f,k);if(!base)return null;const m=typeof Loading!=='undefined'?Loading.supportModel(p,base,f):base;
  const assigned=result.floors[f-1]?.type===k,rows=[['Framing',k],['楼层',assigned?FloorLevels.name(p,f):'尚未分配到当前楼层']],fmt=n=>Number(n).toFixed(3),point=a=>a.map(fmt).join(', ')+' m';
  let title=hit.id,note='',size;
  if(hit.kind==='SLAB'){
   const t=m.slabs.find(t=>t.id===hit.slabId);if(!t)return null;
   const xx=Engine.axes(p,'x',m.key),yy=Engine.axes(p,'y',m.key);title='楼板 · '+hit.id;if(typeof Loading!=='undefined'){const o=Loading.input(p,f,Loading.token('SLAB',t));rows.push(['板类型',o.slabType==='CS'?'CS · 悬臂板':'普通单向板']);if(o.slabType==='CS')rows.push(['固定边',({left:'左',right:'右',top:'上',bottom:'下'}[o.csFixedEdge]||'未选择')]);}
   const location=t.tileKeys.map(k=>{const [i,j]=k.split(',').map(Number);return 'X '+xx[i].id+'–'+xx[i+1].id+' / Y '+yy[j].id+'–'+yy[j+1].id;}).join('；');
   rows.push(['板厚',t.thickness+' mm'],['所在轴线格',location],['板块形状',t.rectangular?'矩形':'不规则／含洞板块'],[t.rectangular?'板块尺寸':'外包尺寸',fmt(t.x1-t.x0)+' × '+fmt(t.y1-t.y0)+' m'],['板块面积',t.area.toFixed(2)+' m²'],['X 范围',fmt(t.x0)+' → '+fmt(t.x1)+' m'],['Y 范围',fmt(t.y0)+' → '+fmt(t.y1)+' m']);size={b:t.thickness,d:null};
   note='按主梁、次梁、墙的参考线及建筑／Opening 边界分隔。面积扣除 Opening，未扣梁墙宽度；几何尺寸不等于净跨或计算跨度。';
  }else if(['MB','SB','TB','CB'].includes(hit.kind)){
   const b=m.beams.find(b=>b.id===hit.id&&b.kind===hit.kind);if(!b)return null;
   title=({'MB':'主梁 MB','SB':'次梁 SB','TB':'转换梁 TB','CB':'悬臂梁 CB'}[b.kind])+' · '+b.id;
   rows.push(['输入类型',b.kind],['B × D',Math.round(b.b*1000)+' × '+Math.round(b.d*1000)+' mm'],['参考线长度',fmt(Math.hypot(b.rawZ[0]-b.rawA[0],b.rawZ[1]-b.rawA[1]))+' m'],['起点 X, Y',point(b.rawA)],['终点 X, Y',point(b.rawZ)],['来源',b.source==='auto'?'自动生成':'手动输入']);rows.push(...Loading.supportSummary(p,result,f,b).map(x=>[x.end+' 端 Support',x.text]));
   if(b.a.some((v,i)=>Math.abs(v-b.rawA[i])>1e-6)||b.z.some((v,i)=>Math.abs(v-b.rawZ[i])>1e-6))rows.push(['贴边后中心线',point(b.a)+' → '+point(b.z)]);
   note='参考线长度不是净跨或设计计算跨度。仅检查几何支承路径，未核实连接刚度、荷载及承载力。';
   if(b.supportStatus==='unverified')title=b.displayKind==='CB'?(b.kind==='CB'?'悬臂梁 CB · '+b.id:b.displayId):'⚠ 支承未确认 · '+b.id;
   if(b.displayKind==='CB'){const input=rows.find(r=>r[0]==='输入类型');if(input){input[0]='类型';input[1]=b.kind==='CB'?'CB · 悬臂梁（手动指定）':'CB · 悬臂梁（按外伸几何识别）';}}
   size={b:b.b*1000,d:b.d*1000};
  }else if(hit.kind==='COL'){
   const c=m.columns.find(c=>c.id===hit.id);if(!c)return null;title='柱 · '+c.id;size={b:c.b*1000,d:c.d*1000};rows.push(['B × D',size.b+' × '+size.d+' mm'],['定位参考 X, Y',point([c.x,c.y])],['截面中心 X, Y',point([Engine.columnRect(c).x,Engine.columnRect(c).y])],['状态',c.status]);rows.push(['上下层关系',c.transferReason||c.alignmentNote||'保留当前柱位']);note='Transfer column 保留原位置，不参与上下层对齐。按项目保存的柱位计算。自动识别依据为下方 TB 与柱的几何关系；可手动标记排除。定位坐标及梁参考跨度保留。';
  }else if(hit.kind==='WALL'){
   const w=m.walls.find(w=>w.id===hit.id);if(!w)return null;title='墙 · '+w.id;size={b:w.b*1000,d:null};rows.push(['墙厚',size.b+' mm'],['参考线长度',fmt(Math.hypot(w.rawZ[0]-w.rawA[0],w.rawZ[1]-w.rawA[1]))+' m'],['起点 X, Y',point(w.rawA)],['终点 X, Y',point(w.rawZ)]);note='墙厚修改后重新贴边；删除只作用于选中的墙段。';
  }else return null;
  return {title,rows,note,size};
 }
 function graphGrid(W,H){
  const x=W<H?13.5:10,y=W<H?10:13.5,w=Math.floor((W-2*x)/10)*10,h=Math.floor((H-2*y)/10)*10;
  let s='<g class="graph-paper" aria-label="1 mm / 5 mm / 10 mm graph paper" fill="none" stroke="#d4fcd9">';
  for(let i=0;i<=w;i++)s+=`<path d="M${x+i},${y} v${h}" stroke-width="${i%10===0?.25:i%5===0?.17:.085}"/>`;
  for(let i=0;i<=h;i++)s+=`<path d="M${x},${y+i} h${w}" stroke-width="${i%10===0?.25:i%5===0?.17:.085}"/>`;
  return s+'</g>';
 }
 function svg(p,m,ratio,labels=true,visible={},paper={}){
  return FramingSymbols98.svg(p,m,ratio,labels,visible,paper);
  const size=paper.size==='A3'?'A3':'A4',portrait=paper.portrait===true,W=size==='A3'?(portrait?297:420):297,H=size==='A3'?(portrait?420:297):210;
  if(typeof Loading!=='undefined')m=Loading.supportModel(p,m);
  if(!Number.isFinite(ratio)||ratio<=0)throw Error('打印比例须为正数');const xs=Engine.axes(p,'x',m.key),ys=Engine.axes(p,'y',m.key),sx=1000/ratio,maxX=xs.at(-1).v*sx,maxY=ys.at(-1).v*sx;
  if(maxX>W-42||maxY>H-55)throw Error('此比例放不下 '+size+'，请增大比例分母；不会自动缩小');
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const ox=(W-maxX)/2+3,oy=(H-maxY)/2+2,x=v=>ox+v*sx,y=v=>oy+v*sx;
  const rect=(a,b,w,h,fill)=>`<rect x="${x(a)}" y="${y(b)}" width="${w*sx}" height="${h*sx}" fill="${fill}"/>`,line=(a,b,c,d,style='')=>`<path d="M${a},${b} L${c},${d}" fill="none" stroke="#576b7b" stroke-width="0.15" ${style}/>`;
  let parts=[`<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="white"/>${paper.grid?graphGrid(W,H):''}<g font-family="Arial,Microsoft YaHei,sans-serif" font-size="2.4" fill="#233b4c">`];
  for(const t of m.ts.filter(t=>t.state===2))parts.push(line(x(t.x0),y(t.y0),x(t.x1),y(t.y1)),line(x(t.x0),y(t.y1),x(t.x1),y(t.y0)));
  for(const t of m.slabVoids)parts.push(line(x(t.x0),y(t.y0),x(t.x1),y(t.y1)),line(x(t.x0),y(t.y1),x(t.x1),y(t.y0)),`<text x="${x((t.x0+t.x1)/2)}" y="${y((t.y0+t.y1)/2)}" text-anchor="middle">无楼板</text>`);
  for(const a of xs)parts.push(line(x(a.v),oy-8,x(a.v),oy+maxY,'stroke-dasharray="1,1"'),`<circle cx="${x(a.v)}" cy="${oy-10}" r="2.4" fill="white" stroke="#536b7c" stroke-width=".2"/><text x="${x(a.v)}" y="${oy-9.2}" text-anchor="middle">${esc(a.id)}</text>`);
  for(const a of ys)parts.push(line(ox-8,y(a.v),ox+maxX,y(a.v),'stroke-dasharray="1,1"'),`<circle cx="${ox-10}" cy="${y(a.v)}" r="2.4" fill="white" stroke="#536b7c" stroke-width=".2"/><text x="${ox-10}" y="${y(a.v)+.8}" text-anchor="middle">${esc(a.id)}</text>`);
  for(let i=1;i<xs.length;i++)parts.push(`<text x="${x((xs[i].v+xs[i-1].v)/2)}" y="${oy-3}" text-anchor="middle">${((xs[i].v-xs[i-1].v)*1000).toFixed(0)}</text>`);
  for(let i=1;i<ys.length;i++)parts.push(`<text transform="translate(${ox-3},${y((ys[i].v+ys[i-1].v)/2)}) rotate(-90)" text-anchor="middle">${((ys[i].v-ys[i-1].v)*1000).toFixed(0)}</text>`);
  for(const b of [...m.beams,...m.walls]){if(visible[b.kind]===false)continue;const r=Engine.rect(b);parts.push(rect(r.x-r.w/2,r.y-r.d/2,r.w,r.d,memberColor(b)));if(labels||b.supportStatus==='unverified')parts.push(`<text x="${x(r.x)+.5}" y="${y(r.y)-.8}" font-size="1.8">${esc(b.displayId||b.id)}${b.supportStatus==='unverified'?' [支承未确认]':''}</text>`);}
  if(visible.COL!==false)for(const c of m.columns)parts.push(rect(Engine.columnRect(c).x-c.b/2,Engine.columnRect(c).y-c.d/2,c.b,c.d,columnColor(c)));
  if(labels){const f=paper.floor||Engine.floors(p).find(f=>f.type===m.key)?.n,types=[...new Set(m.slabs.map(s=>s.thickness))];for(const slab of m.slabs)for(const mark of SlabMarks83.layout(p,f,slab,m,sx*2.83465)){const id='S'+(types.indexOf(slab.thickness)+1),cx=x(mark.x),cy=y(mark.y),dx=mark.dir==='X'?Math.min(2.5,(mark.part.x1-mark.part.x0)*sx*.3):0,dy=mark.dir==='Y'?Math.min(2.5,(mark.part.y1-mark.part.y0)*sx*.3):0;parts.push(`<text x="${cx+3}" y="${cy-2}" fill="#286e62">${id}</text>`);if(mark.dir){parts.push(line(cx-dx,cy-dy,cx+dx,cy+dy));for(const sign of [-1,1]){const ex=cx+sign*dx,ey=cy+sign*dy;parts.push(line(ex-(dx?sign:1),ey-(dy?sign:1),ex,ey),line(ex,ey,ex-(dx?sign:-1),ey-(dy?sign:-1)));}}else parts.push(`<text x="${cx}" y="${cy+1}">?</text>`);if(mark.narrow)parts.push(line(cx,cy,cx+3,cy-2));}}
  parts.push(`<text x="12" y="${H-11}" font-size="3.2">${esc(p.name)} · ${esc(m.key)} · 1:${ratio} · ${size}</text><text x="12" y="${H-5}" font-size="2">COL 柱 · WALL 墙 · MB 主梁 · SB 次梁 · TB 转换梁 · CB 悬臂梁 | 几何布置图，未作承载力验算 | 打印：${size} ${portrait?'纵向':'横向'}，100%，关闭页眉页脚</text></g></svg>`);return parts.join('');
 }
 function elevationHeight(width,available){const panel=Math.max(460,Math.min(850,available-36));return width>=1120?panel+46:panel*2+62;}
 return {loadAreaLabel,elevationHeight,plan,three,elevation,elevationData,svg,palette,pick,info};
})();
if(typeof module!=='undefined')module.exports=Drawing;