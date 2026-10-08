// One set of monochrome vector symbols for screen, SVG and native report copies.
const FramingSymbols98=(()=>{
 const ink='#000000',esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 const line=(out,x,y,x2,y2,width=.7,dash=false)=>out.push({type:'line',x,y,x2,y2,width,dash,color:ink,mono98:true});
 const text=(out,t,x,y,w=36,h=12,size=8,center=true)=>out.push({type:'text',text:String(t),x,y,w,h,size,center,color:ink,mono98:true});
 function hatch(out,r,cross=false,spacing=6){
  // Clip each hatch to the physical rectangle, without changing its footprint.
  for(const sign of cross?[1,-1]:[1])for(let k=-r.h;k<=r.w+r.h;k+=spacing){
   const pts=[],add=(x,y)=>{if(x>=-1e-6&&x<=r.w+1e-6&&y>=-1e-6&&y<=r.h+1e-6&&!pts.some(p=>Math.hypot(p[0]-x,p[1]-y)<1e-6))pts.push([x,y]);};
   // x + sign*y = k
   add(k,0);add(k-sign*r.h,r.h);add(0,k/sign);add(r.w,(k-r.w)/sign);
   if(pts.length===2)line(out,r.x+pts[0][0],r.y+pts[0][1],r.x+pts[1][0],r.y+pts[1][1],.55);
  }
 }
 function support(out,r,status,column=true){
  const below=status==='下层柱',above=status==='上层柱';
  // The model has generic structural walls, not a bearing/hanger/screen-wall class.
  // Use the reference's common COLUMN/WALL symbols for all three level states.
  out.push({type:'rect',...r,color:ink,width:.85,fill:!below?'#a0a0a0':'#ffffff',dash:below,mono98:true});
  if(above||below)hatch(out,r,below);
 }
 function wallItems(result,floor){
  const curr=Engine.floorModel(result,floor).walls.filter(w=>w.on!==false),upper=result.floors[floor]?Engine.floorModel(result,floor+1).walls.filter(w=>w.on!==false):[];
  // Split at every footprint boundary, so partial continuation is not marked continuous.
  const rs=[...curr.map(w=>({w,r:Engine.rect(w),above:false})),...upper.map(w=>({w,r:Engine.rect(w),above:true}))],out=[];
  const xs=[...new Set(rs.flatMap(o=>[o.r.x-o.r.w/2,o.r.x+o.r.w/2]))].sort((a,b)=>a-b),ys=[...new Set(rs.flatMap(o=>[o.r.y-o.r.d/2,o.r.y+o.r.d/2]))].sort((a,b)=>a-b);
  for(let i=1;i<xs.length;i++)for(let j=1;j<ys.length;j++){const x=(xs[i-1]+xs[i])/2,y=(ys[j-1]+ys[j])/2,at=rs.filter(o=>Math.abs(x-o.r.x)<o.r.w/2-1e-8&&Math.abs(y-o.r.y)<o.r.d/2-1e-8);if(!at.length)continue;const a=at.some(o=>o.above),b=at.some(o=>!o.above);out.push({wall:at[0].w,r:{x,y,w:xs[i]-xs[i-1],d:ys[j]-ys[j-1]},status:a?(b?'上下贯通':'上层柱'):'下层柱'});}
  return out;
 }
 function slabMark(out,mark,label,thickness,X,Y,unit=1){
  const x=X(mark.x),y=Y(mark.y),v=mark.dir==='Y',half=10*unit,hook=4*unit,tw=Math.max(24,Math.max(String(label).length,('('+Math.round(thickness)+')').length)*4.8);
  const tr=(a,b)=>v?[x-b,y+a]:[x+a,y+b];
  // Opposite, open end ticks match the supplied slab mark; never guess unknown span.
  if(mark.dir){for(const [a,b,c,d]of [[-half,0,half,0],[-half,0,-half+hook,-hook],[half,0,half-hook,hook]])line(out,...tr(a,b),...tr(c,d),.8*unit);}
  else text(out,'?',x-5*unit,y-5*unit,10*unit,10*unit,8*unit);
  text(out,label,x+(v?6:-tw/2)*unit,y-17*unit,tw*unit,12*unit,8*unit);
  text(out,'('+Math.round(thickness)+')',x+(v?6:-tw/2)*unit,y+3*unit,tw*unit,12*unit,8*unit);
 }
 // Trim display footprints only; Engine lengths, supports and hit targets stay unchanged.
 function beamRects108(beam,beams){
  let pieces=[Engine.rect(beam)];if(beam.kind!=='SB')return pieces;
  for(const support of beams.filter(b=>['MB','TB','CB'].includes(b.kind)&&b.on!==false)){
   const q=Engine.rect(support),qx0=q.x-q.w/2,qx1=q.x+q.w/2,qy0=q.y-q.d/2,qy1=q.y+q.d/2,next=[];
   for(const r of pieces){const x0=r.x-r.w/2,x1=r.x+r.w/2,y0=r.y-r.d/2,y1=r.y+r.d/2,a=Math.max(x0,qx0),b=Math.min(x1,qx1),c=Math.max(y0,qy0),d=Math.min(y1,qy1);
    if(b-a<=1e-8||d-c<=1e-8){next.push(r);continue;}
    for(const [l,h,t,v]of [[x0,a,y0,y1],[b,x1,y0,y1],[a,b,y0,c],[a,b,d,y1]])if(h-l>1e-8&&v-t>1e-8)next.push({x:(l+h)/2,y:(t+v)/2,w:h-l,d:v-t});
   }pieces=next;
  }return pieces;
 }
 function members(p,m,f,result,X,Y,scale,opt={}){
  const out=[],hits=[],visible=opt.visible||{},assigned=result.floors[f-1]?.type===m.key,columns=opt.columnPlan||(assigned?ColumnPlan87.items(result,f):m.columns.map(column=>({column,status:column.status}))),walls=assigned?wallItems(result,f):m.walls.map(wall=>({wall,r:Engine.rect(wall),status:'上下贯通'}));
  const rect=r=>({x:X(r.x-r.w/2),y:Y(r.y-r.d/2),w:r.w*scale,h:r.d*scale});
  const displayBeams191=opt.drawingOffsets191?ReviewLayout191.model(m,opt.drawingOffsets191).beams:m.beams;for(const [i,source]of m.beams.entries()){if(visible[source.kind]===false||typeof TrussModel109!=='undefined'&&TrussModel109.replacement(p,f,source))continue;const b=displayBeams191[i],r=Engine.rect(b);for(const part of beamRects108(b,displayBeams191))out.push({type:'rect',...rect(part),color:ink,width:.75,dash:true,mono98:true});hits.push({r,id:b.id,displayId:b.displayId||b.id,kind:b.kind,source:b.source});if(opt.labels!==false)text(out,opt.beamLabel?.(b)||b.displayId||b.id,X(b.a[0]+(b.z[0]-b.a[0])*.28)+3,Y(b.a[1]+(b.z[1]-b.a[1])*.28)-12,45,11,7,false);}
  if(assigned&&typeof TrussModel109!=='undefined')for(const {t,g}of TrussModel109.visuals(p,result,f,f)){line(out,X(g.a[0]),Y(g.a[1]),X(g.z[0]),Y(g.z[1]),1.6,true);text(out,t.name+' · TT '+FloorLevels.range(p,t.bottomFloor,t.topFloor),X((g.a[0]+g.z[0])/2)+4,Y((g.a[1]+g.z[1])/2)-12,110,13,8,false);}
  if(visible.WALL!==false)for(const w of walls){support(out,rect(w.r),w.status,false);hits.push({r:w.r,id:w.wall.id,kind:'WALL'});}
  const labelledColumns101=new Set();if(visible.COL!==false)for(const c of columns){const r=c.rect||Engine.columnRect(c.column);support(out,rect(r),c.status,true);hits.push({r,id:c.column.id,kind:'COL',f:c.floor,columnStatus:c.status});if(opt.labels!==false&&!labelledColumns101.has(c.floor+'|'+c.column.id)){labelledColumns101.add(c.floor+'|'+c.column.id);const q=Engine.columnRect(c.column);text(out,opt.columnLabel?.(c.column)||c.column.id,X(q.x)+4,Y(q.y)-13,36,11,7,false);}}
  if(visible.COL!==false&&assigned){const markers=[...TransferMarkers83.landing(p,result,f),...(f>1?TransferMarkers83.landing(p,result,f-1):[])],seen=new Set();for(const marker of markers){const r=Engine.columnRect(marker.column),key=[r.x,r.y,marker.beam.id].join('|');if(seen.has(key))continue;seen.add(key);text(out,'TC → '+marker.beam.id,X(r.x)+8,Y(r.y)+6,65,11,7,false);}}
  if(opt.labels!==false&&visible.WALL!==false){const seen=new Set();for(const w of walls){if(seen.has(w.wall.id))continue;seen.add(w.wall.id);text(out,opt.wallLabel?.(w.wall)||w.wall.id,X(w.r.x)+3,Y(w.r.y)-12,40,11,7,false);}}
  // One mark per connected slab; choose the largest safe interior strip.
  const slabTypes=[...new Set(m.slabs.map(s=>s.thickness))];
  for(const s of m.slabs){
   const marks=SlabMarks83.layout(p,f,s,m,scale),mark=marks.sort((a,b)=>(b.part.x1-b.part.x0)*(b.part.y1-b.part.y0)-(a.part.x1-a.part.x0)*(a.part.y1-a.part.y0))[0];if(!mark)continue;
   const width=(mark.part.x1-mark.part.x0)*scale,height=(mark.part.y1-mark.part.y0)*scale,label=opt.slabLabel?.(s)||'S'+(slabTypes.indexOf(s.thickness)+1);
   const tw=Math.max(24,Math.max(String(label).length,('('+Math.round(s.thickness)+')').length)*4.8),vertical=mark.dir==='Y',bw=vertical?tw+10:tw,pad=Math.min(2,width*.07,height*.07);
   // Scale the entire symbol, including text and stroke, to the available slab area.
   // No minimum display scale forces a mark outside its slab and no leaders are added.
   const u=Math.min(opt.unit||1,(width-2*pad)/bw,(height-2*pad)/32);if(!(u>0))continue;
   const anchor={...mark,x:mark.x-(vertical?(tw+2)*u/2/scale:0),y:mark.y+u/scale};
   const begin=out.length;slabMark(out,anchor,label,s.thickness,X,Y,u);
   for(let i=begin;i<out.length;i++)Object.assign(out[i],{slabMark99:s.id,slabBounds99:{x0:X(mark.part.x0),x1:X(mark.part.x1),y0:Y(mark.part.y0),y1:Y(mark.part.y1)}});
  }
  return {shapes:out,hits};
 }
 function scene(p,m,f,result,X,Y,scale,opt={}){
  const out=[],xs=Engine.axes(p,'x',m.key),ys=Engine.axes(p,'y',m.key),maxX=xs.at(-1).v,maxY=ys.at(-1).v,u=opt.unit||1;
  for(const t of [...m.ts.filter(t=>t.state===2),...m.slabVoids]){line(out,X(t.x0),Y(t.y0),X(t.x1),Y(t.y1),.4);line(out,X(t.x0),Y(t.y1),X(t.x1),Y(t.y0),.4);text(out,'OP',X((t.x0+t.x1)/2)-12*u,Y((t.y0+t.y1)/2)-6*u,24*u,12*u,8*u);}
  for(const [axes,isX]of [[xs,true],[ys,false]])for(const a of axes){const x=isX?X(a.v):X(0)-32*u,y=isX?Y(0)-32*u:Y(a.v);line(out,isX?x:X(0)-22*u,isX?Y(0)-22*u:y,isX?x:X(maxX)+8*u,isX?Y(maxY)+8*u:y,.45*u,true);out.push({type:'ellipse',x:x-9*u,y:y-9*u,w:18*u,h:18*u,fill:'#ffffff',color:ink,width:.6*u,mono98:true});text(out,a.id,x-9*u,y-9*u,18*u,18*u,9*u);}
  for(let i=1;i<xs.length;i++)text(out,((xs[i].v-xs[i-1].v)*1000).toFixed(0),X((xs[i].v+xs[i-1].v)/2)-20*u,Y(0)-17*u,40*u,10*u,7*u);
  for(let i=1;i<ys.length;i++)text(out,((ys[i].v-ys[i-1].v)*1000).toFixed(0),X(0)-30*u,Y((ys[i].v+ys[i-1].v)/2)-5*u,26*u,10*u,7*u);
  if(opt.showColumnGrid===true){const g=p.types[m.key].columnGrid;if(g){for(const x of g.x)out.push({type:'line',x:X(x),y:Y(0),x2:X(x),y2:Y(maxY),color:'#888888',width:.45,dash:true});for(const y of g.y)out.push({type:'line',x:X(0),y:Y(y),x2:X(maxX),y2:Y(y),color:'#888888',width:.45,dash:true});}}
  if(opt.showNoColumn===true)for(const r of p.types[m.key].noColumnZones||[])out.push({type:'rect',x:X(r.x0),y:Y(r.y0),w:(r.x1-r.x0)*scale,h:(r.y1-r.y0)*scale,color:'#777777',width:1,dash:true});
  const content=members(p,m,f,result,X,Y,scale,opt);out.push(...content.shapes);return {shapes:out,hits:content.hits};
 }
 function canvas(ctx,shapes){for(const a of shapes){ctx.save();ctx.strokeStyle=a.color||ink;ctx.fillStyle=a.fill||ink;ctx.lineWidth=a.width||.7;ctx.setLineDash(a.dash?[5,3]:[]);ctx.beginPath();if(a.type==='line'){ctx.moveTo(a.x,a.y);ctx.lineTo(a.x2,a.y2);ctx.stroke();}else if(a.type==='text'){ctx.fillStyle=ink;ctx.font=`${a.size||8}px Arial`;ctx.textAlign=a.center?'center':'left';ctx.textBaseline=a.center?'middle':'top';ctx.fillText(a.text,a.x+(a.center?a.w/2:0),a.y+(a.center?a.h/2:0));}else{if(a.type==='ellipse')ctx.ellipse(a.x+a.w/2,a.y+a.h/2,a.w/2,a.h/2,0,0,Math.PI*2);else ctx.rect(a.x,a.y,a.w,a.h);if(a.fill)ctx.fill();ctx.stroke();}ctx.restore();}}
 function svgShapes(shapes){return shapes.map(a=>{const style=`stroke="${a.color||ink}" stroke-width="${a.width||.7}" fill="${a.fill||'none'}"${a.dash?' stroke-dasharray="5 3"':''}`;if(a.type==='line')return `<path d="M${a.x} ${a.y}L${a.x2} ${a.y2}" ${style}/>`;if(a.type==='text')return `<text x="${a.x+(a.center?a.w/2:0)}" y="${a.y+(a.center?a.h/2:(a.size||8)*.82)}" font-family="Arial" font-size="${a.size||8}" fill="black"${a.center?' text-anchor="middle" dominant-baseline="central"':''}>${esc(a.text)}</text>`;if(a.type==='ellipse')return `<ellipse cx="${a.x+a.w/2}" cy="${a.y+a.h/2}" rx="${a.w/2}" ry="${a.h/2}" ${style}/>`;return `<rect x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" ${style}/>`;}).join('');}
 function plan(ctx,w,h,p,m,opt){if(Engine.floors(p)[(opt.floor||1)-1]?.type===m.key)m=Loading.supportModel(p,m,opt.floor);const result=opt.result||Engine.generate(p),f=opt.floor||1,xs=Engine.axes(p,'x',m.key),ys=Engine.axes(p,'y',m.key),maxX=xs.at(-1).v,maxY=ys.at(-1).v,bounds=opt.viewBounds||{x0:0,x1:maxX,y0:0,y1:maxY},scale=Math.min((w-125)/(bounds.x1-bounds.x0+2),(h-120)/(bounds.y1-bounds.y0+2))*(opt.zoom||1),ox=(w-(bounds.x1-bounds.x0)*scale)/2+20-bounds.x0*scale+(opt.panX||0),oy=(h-(bounds.y1-bounds.y0)*scale)/2+20-bounds.y0*scale+(opt.panY||0);ctx.clearRect(0,0,w,h);ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);const v=scene(p,m,f,result,x=>ox+x*scale,y=>oy+y*scale,scale,{...opt,unit:1.35});canvas(ctx,v.shapes);if(opt.selected){const hit=v.hits.find(h=>h.id===opt.selected.id&&h.kind===opt.selected.kind);ctx.save();ctx.strokeStyle='#000';ctx.lineWidth=2.5;ctx.setLineDash([]);if(hit){const r=hit.r;ctx.strokeRect(ox+(r.x-r.w/2)*scale-3,oy+(r.y-r.d/2)*scale-3,r.w*scale+6,r.d*scale+6);}else if(opt.selected.kind==='SLAB'){const slab=m.slabs.find(s=>s.id===opt.selected.slabId);if(slab){ctx.beginPath();for(const [a,z]of slab.edges){ctx.moveTo(ox+a[0]*scale,oy+a[1]*scale);ctx.lineTo(ox+z[0]*scale,oy+z[1]*scale);}ctx.stroke();}}ctx.restore();}return {scale,ox,oy,hits:v.hits,slabs:m.slabs,csMarkers:[],checkHighlights:[],world:(x,y)=>[(x-ox)/scale,(y-oy)/scale]};}
 function svg(p,m,ratio,labels,visible,paper){if(Engine.floors(p)[(paper.floor||1)-1]?.type===m.key)m=Loading.supportModel(p,m,paper.floor);const W=paper.size==='A3'?(paper.portrait?297:420):297,H=paper.size==='A3'?(paper.portrait?420:297):210,unit=2.83465,xs=Engine.axes(p,'x',m.key),ys=Engine.axes(p,'y',m.key),scale=1000/ratio*unit,maxX=xs.at(-1).v*scale,maxY=ys.at(-1).v*scale;if(!Number.isFinite(ratio)||ratio<=0)throw Error('打印比例须为正数');if(maxX>(W-42)*unit||maxY>(H-55)*unit)throw Error('此比例放不下，请增大比例分母；不会自动缩小');const ox=(W*unit-maxX)/2,oy=(H*unit-maxY)/2,f=paper.floor||Engine.floors(p).find(f=>f.type===m.key)?.n,result=Engine.generate(p),s=scene(p,m,f,result,x=>ox+x*scale,y=>oy+y*scale,scale,{visible,labels,...(paper.drawingOffsets191?{drawingOffsets191:paper.drawingOffsets191}:{})});text(s.shapes,p.name+' · '+(result.floors[f-1]?.type===m.key?FloorLevels.name(p,f):m.key+' 模板（未分配楼层）')+' · 1:'+ratio,12*unit,(H-12)*unit,350,15,10,false);return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W*unit} ${H*unit}"><rect width="100%" height="100%" fill="white"/>${paper.grid?`<defs><pattern id="graph98" width="${5*unit}" height="${5*unit}" patternUnits="userSpaceOnUse"><path d="M ${5*unit} 0 H 0 V ${5*unit}" fill="none" stroke="#e0e0e0" stroke-width=".25"/></pattern></defs><rect width="100%" height="100%" fill="url(#graph98)"/>`:""}${svgShapes(s.shapes)}</svg>`;}
 return {beamRects108,members,wallItems,support,slabMark,canvas,svgShapes,plan,svg};
})();
