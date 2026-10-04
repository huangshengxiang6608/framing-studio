// Horizontal illustration only. Original calculations and Vertical / other report pages stay unchanged.
const HorizontalPath133=(()=>{
 const legacy={...LoadPath84},C={blue:'#0057b8',red:'#c00000',green:'#008000',grey:'#647581',soil:'#986a31',water:'#187ca2',q:'#794798'},eps=.001;
 const valid=v=>typeof v==='number'&&Number.isFinite(v),fmt=v=>Number(v.toFixed(2)).toString(),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function options(p){const v=p.explorer?.loadPath84?.horizontal133||{};return {autoCuts:v.autoCuts!==false,faceAuto:v.faceAuto!==false,sign:v.sign===-1?-1:1};}
 function merge(ranges){const out=[];for(const r of ranges.map(r=>[...r]).sort((a,b)=>a[0]-b[0])){const last=out.at(-1);if(last&&r[0]<=last[1]+eps)last[1]=Math.max(last[1],r[1]);else out.push(r);}return out;}
 function collect(p,m){
  const v=legacy.settings(p,m),levels=LocalHeights96.levels(p),offset=levels[v.lo-1],height=LocalHeights96.extent(p,v.lo,v.hi)-offset,solids=[];
  for(const f of m.floors.filter(f=>f.n>=v.lo&&f.n<=v.hi))for(const s of LocalHeights96.solids(p,m,f.n,Engine.floorModel(m,f),v.hi)){
   if(s.member.on===false||s.kind==='COL'&&s.member.status==='上层柱'&&f.n>=v.hi)continue;
   const z0=Math.max(0,s.z0-offset),z1=Math.min(height,s.z1-offset);
   if(z1>z0+eps&&Object.values(s.r).every(valid))solids.push({...s,z0,z1});
  }
  return {v,solids,offset,height,levels};
 }
 function slice(data,axis,at){const ix=axis==='X',out=[];for(const s of data.solids){const r=s.r,q=ix?r.x:r.y,half=(ix?r.w:r.d)/2;if(at<q-half-eps||at>q+half+eps)continue;const c=ix?r.y:r.x,w=ix?r.d:r.w;out.push({...s,a:c-w/2,b:c+w/2});}return out;}
 // Merge only touching rectangles. Do not bridge a missing storey or opening.
 function bands(rows){
  const groups=new Map();for(const r of rows){const k=[r.kind,r.a.toFixed(6),r.b.toFixed(6)].join('|');if(!groups.has(k))groups.set(k,{...r,ranges:[],ids:new Set()});const g=groups.get(k);g.ranges.push([r.z0,r.z1]);g.ids.add(r.id);}
  let out=[];for(const g of groups.values())for(const [z0,z1]of merge(g.ranges))out.push({...g,z0,z1,ids:[...g.ids]});
  const vertical=new Map();for(const r of out){const k=[r.kind,r.z0.toFixed(6),r.z1.toFixed(6)].join('|');if(!vertical.has(k))vertical.set(k,[]);vertical.get(k).push(r);}
  out=[];for(const rows of vertical.values())for(const r of rows.sort((a,b)=>a.a-b.a)){const last=out.at(-1);if(last&&last.kind===r.kind&&Math.abs(last.z0-r.z0)<eps&&Math.abs(last.z1-r.z1)<eps&&r.a<=last.b+eps){last.b=Math.max(last.b,r.b);last.ids=[...new Set([...last.ids,...r.ids])];}else out.push({...r});}return out;
 }
 function continuous(rows,h,kind='WALL'){return bands(rows.filter(s=>s.kind===kind)).filter(s=>s.z0<=eps&&s.z1>=h-eps);}
 function cuts(p,m,data=collect(p,m)){
  const o=options(p),out={};for(const key of ['one','two']){const original=data.v.cuts[key],cut={...original,automatic:false};
   if(o.autoCuts&&!continuous(slice(data,cut.axis,cut.at),data.height).length){
    const candidates=[...new Set(data.solids.filter(s=>s.kind==='WALL').map(s=>cut.axis==='X'?s.r.x:s.r.y))];
    const ranked=candidates.map(at=>({at,score:continuous(slice(data,cut.axis,at),data.height).reduce((n,w)=>n+w.b-w.a,0)})).filter(v=>v.score>eps).sort((a,b)=>b.score-a.score||a.at-b.at);
    if(ranked.length){cut.at=ranked[0].at;cut.automatic=Math.abs(cut.at-original.at)>eps;}
   }
   out[key]={...cut,originalAt:original.at,face:o.faceAuto?(cut.axis==='Y'?'B':'D'):data.v.face,sign:o.sign};
  }return out;
 }
 function axialPair(rows,data,axis){
  const ws=continuous(rows,data.height),ix=axis==='X';
  // Connected wall footprints at the section bottom distinguish separate cores.
  const roots=data.solids.filter(s=>s.kind==='WALL'&&s.z0<=eps),parent=roots.map((_,i)=>i),find=i=>{while(parent[i]!==i)i=parent[i];return i;};
  const touch=(a,b)=>Math.abs(a.x-b.x)<=(a.w+b.w)/2+eps&&Math.abs(a.y-b.y)<=(a.d+b.d)/2+eps;
  for(let i=0;i<roots.length;i++)for(let j=0;j<i;j++)if(touch(roots[i].r,roots[j].r))parent[find(i)]=find(j);
  const groups=new Map();for(const w of ws){const k=roots.findIndex(s=>w.ids.includes(s.id)&&touch(s.r,w.r)),id=k<0?'single:'+w.a:find(k);if(!groups.has(id))groups.set(id,[]);groups.get(id).push(w);}
  const pairs=[];for(const walls of groups.values()){
   const sorted=walls.sort((a,b)=>a.a-b.a),l=sorted[0],r=sorted.at(-1),long=s=>s.b-s.a>(ix?s.r.w:s.r.d)+eps;
   const x0=long(l)?l.a:(l.a+l.b)/2,x1=long(r)?r.b:(r.a+r.b)/2;
   if(x1-x0>eps)pairs.push({x0,x1,z0:0,z1:data.height,left:l,right:r,kind:'wall'});
  }
  if(pairs.length)return pairs.sort((a,b)=>(b.x1-b.x0)-(a.x1-a.x0))[0];
  // A frame couple is shown only on continuous real columns, never the podium's outer bounds.
  if(ws.length)return null;
  const cs=continuous(rows,data.height,'COL').sort((a,b)=>a.a-b.a);
  if(cs.length<2)return null;
  return {x0:(cs[0].a+cs[0].b)/2,x1:(cs.at(-1).a+cs.at(-1).b)/2,z0:0,z1:data.height,left:cs[0],right:cs.at(-1),kind:'frame'};
 }
 function loading(p,face,base,top){
  const n=OverallGeometry.input(p,face),out={input:n,wind:[],pressure:[],pending:[]};
  if(!n||!valid(base)){out.pending.push('Overall levels required');return out;}
  const machine=Overall.machine(n,face),get=(role,cell)=>machine.safe(Overall.roles[role],cell),ground=n.leftEL;
  if(valid(ground)&&valid(get(1,'K5'))&&valid(get(1,'B9'))&&get(1,'B9')>0&&!n._auto?.windError){
   if(n.mode==='LAYERED')for(let r=24;r<124;r++){const low=get(1,'BG'+r)+ground,high=get(1,'BH'+r)+ground,q=get(1,'BK'+r);if(get(1,'BO'+r)==='OK'&&[low,high,q].every(valid)&&q>=0&&high>low)out.wind.push({low,high,q});}
   if(n.mode==='UNIFORM'){const q=get(1,'B36');if(valid(q)&&q>=0&&valid(n.height)&&n.height>ground)out.wind.push({low:ground,high:n.height,q});}
  }
  if(!out.wind.length)out.pending.push('Wind inputs required');
  out.wind=out.wind.map(w=>({...w,low:Math.max(base,w.low),high:Math.min(top,w.high)})).filter(w=>w.high>w.low).sort((a,b)=>a.low-b.low);
  if(n.basement==='Yes')for(const [side,prefix,col]of [['L','left','B'],['R','right','G']]){
   const el=n[prefix+'EL'],gwl=n[prefix+'GWL'],referenceBase=n.baseRL;if(!valid(el)||!valid(referenceBase)||el<referenceBase){out.pending.push(side+' ground / O levels required');continue;}
   const lower=Math.max(base,referenceBase);if(el<=lower||top<=lower)continue;
   const high=Math.min(top,el),gamma=n[prefix==='left'?'gammaLeft':'gammaRight'],sub=n[prefix==='left'?'submergedLeft':'submergedRight'];
   const soil=get(3,col+'48'),water=get(3,col+'47'),surcharge=get(3,col+'49'),q=n[prefix+'Q'];
   const dry=valid(gwl)&&gwl<=el?Math.max(0,Math.min(el-referenceBase,el-gwl)):null,wet=valid(dry)?el-referenceBase-dry:null;
   if(valid(dry)&&valid(n.phi)&&n.phi>=0&&n.phi<90&&(dry<=eps||valid(gamma)&&gamma>0)&&(wet<=eps||valid(sub)&&sub>0)&&valid(soil)&&soil>=0){
    const raw=z=>(valid(gamma)?gamma:0)*Math.max(0,Math.min(el-z,dry))+(valid(sub)?sub:0)*Math.max(0,el-z-dry),den=raw(referenceBase);
    if(soil>0&&den>0){const points=[lower,high,...(gwl>lower&&gwl<high?[gwl]:[])].sort((a,b)=>a-b).map(z=>({z,q:soil*raw(z)/den}));out.pressure.push({side,kind:'Soil',color:C.soil,points,basePressure:soil});}
   }else out.pending.push(side+' soil inputs required');
   if(valid(gwl)&&gwl<=el&&valid(n.gammaWater)&&n.gammaWater>0&&valid(water)&&water>=0){if(gwl>lower&&water>0)out.pressure.push({side,kind:'Water',color:C.water,points:[{z:lower,q:water*(gwl-lower)/(gwl-referenceBase)},{z:Math.min(top,gwl),q:water*Math.max(0,gwl-top)/(gwl-referenceBase)}],basePressure:water});}
   else out.pending.push(side+' water inputs required');
   if(valid(q)&&q>=0&&valid(surcharge)&&surcharge>=0&&(q===0||valid(n.phi)&&n.phi>=0&&n.phi<90)){if(surcharge>0)out.pressure.push({side,kind:'Surcharge',color:C.q,points:[{z:lower,q:surcharge},{z:high,q:surcharge}],basePressure:surcharge});}
   else out.pending.push(side+' surcharge required');
  }
  return out;
 }
 function diagram(p,m,which='one',report=false,data=collect(p,m)){
  const opt=cuts(p,m,data)[which],rows=slice(data,opt.axis,opt.at),along=opt.axis==='X'?'y':'x',all=m.floors.filter(f=>f.n>=data.v.lo&&f.n<=data.v.hi),axis=Engine.axes(p,along,all[0].type),bounds=all.flatMap(f=>Engine.axes(p,along,f.type).map(a=>a.v)),lo=Math.min(...bounds),hi=Math.max(...bounds),height=Math.max(eps,data.height),X=x=>96+(x-lo)*206/Math.max(1,hi-lo),Y=z=>322-z*270/Math.max(1,height),shapes=[],members=[],lines=[];
  const text=(s,x,y,w=120,size=7,color=C.grey,more={})=>shapes.push({type:'text',text:String(s),x,y,w,h:14,size,color,...more});
  const line=(x,y,x2,y2,color=C.blue,width=1,arrow=false,more={})=>shapes.push({type:'line',x,y,x2,y2,color,width,arrow,...more});
  const rect=(x,y,w,h,more={})=>shapes.push({type:'rect',x,y,w:Math.max(.8,w),h:Math.max(.8,h),color:C.blue,width:1,...more});
  text('Section '+(which==='one'?'1–1':'2–2')+' · '+opt.axis+' = '+fmt(opt.at)+' m',20,4,310,10,C.blue);
  text((opt.sign>0?'+':'−')+along.toUpperCase()+' · Overall '+opt.face+' · Direction schematic',20,20,305,6.5,C.red);
  for(let i=1;i<axis.length;i++)text(fmt(axis[i].v-axis[i-1].v)+' m',X((axis[i].v+axis[i-1].v)/2)-18,37,36,6,'#000000',{center:true,h:8});
  const supportBands=bands(rows.filter(s=>s.kind==='COL'||s.kind==='WALL'));
  for(const s of supportBands){const center=(s.a+s.b)/2,meta={role133:'support',kind:s.kind,ids:s.ids,world:{a:s.a,b:s.b,z0:s.z0,z1:s.z1}};
   if(s.kind==='WALL'&&X(s.b)-X(s.a)>3)rect(X(s.a),Y(s.z1),X(s.b)-X(s.a),Y(s.z0)-Y(s.z1),meta);
   else line(X(center),Y(s.z1),X(center),Y(s.z0),C.blue,s.kind==='WALL'?1.5:1,false,meta);
   members.push([s.kind==='WALL'?'wall':'column',s.f,s.ids.join('/'),center]);
  }
  const floors=new Map(),tbs=new Map();for(const s of rows){
   if(['SLAB','MB','SB','TB','CB'].includes(s.kind)){const k=s.z1.toFixed(6);if(!floors.has(k))floors.set(k,{z:s.z1,ranges:[]});floors.get(k).ranges.push([s.a,s.b]);}
   if(s.kind==='TB'){const k=s.id+'|'+s.z1.toFixed(6);if(!tbs.has(k))tbs.set(k,{...s,ranges:[]});tbs.get(k).ranges.push([s.a,s.b]);}
  }
  const floorRows=[...floors.values()].sort((a,b)=>a.z-b.z);for(const f of floorRows)for(const [a,b]of merge(f.ranges)){line(X(a),Y(f.z),X(b),Y(f.z),C.blue,1,false,{role133:'floor',world:{a,b,z:f.z}});members.push(['slab',0,'floor',a,b]);}
  for(const b of tbs.values())for(const [a,z]of merge(b.ranges)){
   rect(X(a),Y(b.z1)-2,X(z)-X(a),4,{role133:'TB',id:b.id,world:{a,b:z,z:b.z1}});
   for(let x=X(a)+2;x<X(z)-3;x+=7)line(x,Y(b.z1)+2,x+4,Y(b.z1)-2,C.blue,.5);
   const tx=X((a+z)/2),label=String(b.displayId||b.id)+' · TB',w=Math.max(54,label.length*3.8);
   text(label,Math.min(336-w,Math.max(96,tx-w/2)),Y(b.z1)-21,w,6,C.blue,{center:true,h:9,role133:'TB-label',id:b.id});line(tx,Y(b.z1)-11,tx,Y(b.z1)-3,C.blue,.6);
  }
  // Sparse arrows indicate one load direction, not an invented stiffness-based force split.
  const sampled=floorRows.filter((_,i)=>i===floorRows.length-1||i%Math.max(1,Math.ceil(floorRows.length/6))===0);
  for(const f of sampled)for(const [a,b]of merge(f.ranges)){
   const l=X(a)+3,r=X(b)-3;if(r-l<9)continue;
   const count=Math.max(1,Math.floor((r-l)/28));for(let i=0;i<count;i++){const start=l+(r-l)*i/count,end=l+(r-l)*(i+.8)/count;line(opt.sign>0?start:end,Y(f.z)-2,opt.sign>0?end:start,Y(f.z)-2,C.red,.95,true,{role133:'floor-force',world:{a,b,z:f.z}});}
  }
  const pair=axialPair(rows,data,opt.axis);
  if(pair){
   for(const [x,side,support]of [[pair.x0,'left',pair.left],[pair.x1,'right',pair.right]])for(const [a,b]of [[.06,.25],[.36,.55],[.66,.85]]){
    const up=(side==='left')===(opt.sign>0),z0=height*a,z1=height*b;
    line(X(x),Y(up?z0:z1),X(x),Y(up?z1:z0),C.green,1.2,true,{role133:'axial',side,ids:support.ids,world:{x,z0,z1,support:{a:support.a,b:support.b,z0:support.z0,z1:support.z1}}});
   }
   const gap=X(pair.x1)-X(pair.x0),mid=(X(pair.x0)+X(pair.x1))/2;
   if(gap>22){text(pair.kind==='wall'?'Core':'Frame',mid-gap/2+2,Y(height*.6)-16,gap-4,6.5,C.blue,{center:true});if(pair.kind==='wall')text('wall',mid-gap/2+2,Y(height*.6)-5,gap-4,6.5,C.blue,{center:true});const radius=Math.min(12,gap/2-6),cy=Y(height*.5),points=Array.from({length:13},(_,i)=>{const a=Math.PI+i*Math.PI/12;return [mid+radius*Math.cos(a),cy+radius*Math.sin(a)];});if(opt.sign<0)points.reverse();for(let i=1;i<points.length;i++)line(...points[i-1],...points[i],C.red,1,i===points.length-1,{role133:'bending'});}
   else {const edge=X(pair.x1);text('Core / wall',Math.min(edge+8,260),Y(height*.61),72,7,C.blue);line(edge+1,Y(height*.6),Math.min(edge+6,258),Y(height*.6),C.blue,.6);}
  }
  if(!report){const names=[all[0],all[Math.floor(all.length/2)],all.at(-1)].filter((f,i,a)=>a.findIndex(q=>q.n===f.n)===i);for(const f of names)text(FloorLevels.name(p,f.n),3,Y(data.levels[f.n]-data.offset)-4,44,6,C.grey);}
  if(data.v.lo===1){rect(X(lo),Y(0),X(hi)-X(lo),16,{role133:'foundation'});text('FOUNDATION',X(lo),Y(0)+1,X(hi)-X(lo),8,C.blue,{center:true,h:14});}
  else {line(X(lo),Y(0)+3,X(hi),Y(0)+3,C.blue,1.2);text('Section bottom',X(lo),Y(0)+6,150,7,C.blue);}
  const datum=FloorLevels.base(p),base=valid(datum)?datum+data.offset:null,loads=loading(p,opt.face,base,valid(base)?base+height:null),max=Math.max(0,...loads.wind.map(v=>v.q));
  const edge=opt.sign>0?X(lo)-5:X(hi)+5,sgn=opt.sign>0?-1:1;
  for(const w of loads.wind){if(max<=0)continue;const outer=edge+sgn*24*w.q/max,yt=Y(w.high-base),yb=Y(w.low-base);line(outer,yt,outer,yb,C.red,.8);line(edge,yt,edge,yb,C.red,.8);line(outer,yt,edge,yt,C.red,.7);line(outer,yb,edge,yb,C.red,.7);const count=Math.max(1,Math.ceil((yb-yt)/34));for(let i=0;i<count;i++){const yy=yt+(yb-yt)*(i+.5)/count;line(outer,yy,edge,yy,C.red,.9,true,{role133:'wind',world:w});}}
  const maxP={};for(const q of loads.pressure)maxP[q.kind]=Math.max(maxP[q.kind]||0,q.basePressure);
  for(const q of loads.pressure){const ix=['Soil','Water','Surcharge'].indexOf(q.kind),side=q.side==='L'?-1:1,edge=q.side==='L'?80-ix*22:310+ix*13,width=q.side==='L'?17:10,pts=q.points.map(a=>({x:edge+side*width*a.q/maxP[q.kind],y:Y(a.z-base),...a}));
   line(edge,pts[0].y,edge,pts.at(-1).y,q.color,.65);for(let i=1;i<pts.length;i++)line(pts[i-1].x,pts[i-1].y,pts[i].x,pts[i].y,q.color,.8);line(pts[0].x,pts[0].y,edge,pts[0].y,q.color,.65);line(pts.at(-1).x,pts.at(-1).y,edge,pts.at(-1).y,q.color,.65);
   for(let i=0;i<pts.length-1;i++)for(const t of [.25,.75]){const a=pts[i],b=pts[i+1],y=a.y+(b.y-a.y)*t,x=a.x+(b.x-a.x)*t;if(Math.abs(x-edge)>eps)line(x,y,edge,y,q.color,.8,true,{role133:'pressure',side:q.side,kind:q.kind,basePressure:q.basePressure});}
  }
  text('Red: horizontal force direction',20,348,300,7,C.red);
  text(pair?'Green: Push–Pull axial increment (schematic)':'Push–Pull: no continuous support pair in this cut',20,360,320,7,pair?C.green:C.grey);
  if(loads.input?.basement==='Yes'){text('Soil',20,372,42,6.5,C.soil);text('Water',63,372,42,6.5,C.water);text('Surcharge · inward on each side',107,372,230,6.5,C.q);}
  else text('No basement in current model',20,372,300,6.5,C.grey);
  const pending=[...new Set(loads.pending)];text(pending.length?pending.join(' / '):'Wind / ground pressure profiles: Overall inputs',20,384,326,Math.min(6.5,326/Math.max(1,pending.join(' / ').length)*1.75),C.grey);
  text('Load Path (Section '+(which==='one'?'1–1':'2–2')+')',84,394,245,8,C.blue,{center:true,h:12});
  // Fixed mechanism is deliberately identical to the original report figure.
  text('Load Transfer Mechanism',354,7,175,9,C.blue,{fixed:true});
  ['Horizontal load','External surface','Rigid floor diaphragm','Column / core wall','Foundation'].forEach((t,i)=>{text(t,355,43+i*38,175,8,C.blue,{fixed:true,center:true,h:16});if(i<4)line(442.5,62+i*38,442.5,77+i*38,C.red,1,true,{fixed:true});});
  text('Load Transfer Mechanism',354,239,175,8,C.blue,{fixed:true,center:true,h:16});
  if(data.v.note)lines.push({text:data.v.note});lines.push({text:'Arrows illustrate direction and lateral axial increments, not calculated force sharing. Profiles use Overall inputs; member sections are schematic.'});
  return {shapes,lines,height:410,members,selection:opt,diagnostics:{pair:pair?{kind:pair.kind,x0:pair.x0,x1:pair.x1}:null,pending,wind:loads.wind,pressure:loads.pressure}};
 }
 function reportDiagram(p,m){const data=collect(p,m),keys=data.v.picks.horizontal==='both'?['one','two']:[data.v.picks.horizontal],ds=keys.map(k=>diagram(p,m,k,true,data));if(ds.length===1)return ds[0];const shapes=[];ds.forEach((d,i)=>d.shapes.forEach(s=>{if(s.fixed){if(!i)shapes.push(s);return;}shapes.push({...s,y:s.y*.76+i*315,...(s.y2!==undefined?{y2:s.y2*.76+i*315}:{}),...(s.type==='rect'||s.type==='ellipse'?{h:s.h*.76}:{})});}));return {shapes,height:640,lines:ds[0].lines,members:ds.flatMap(d=>d.members),sections:ds.map(d=>({selection:d.selection,diagnostics:d.diagnostics}))};}
 function svg(d){return '<svg role="img" aria-label="Horizontal load path" viewBox="0 0 540 '+d.height+'" style="width:100%;background:white">'+d.shapes.map(s=>{const c=s.color||C.grey,meta=s.role133?' data-role133="'+esc(s.role133)+'"':'';if(s.type==='text')return '<text x="'+(s.x+(s.center?s.w/2:0))+'" y="'+(s.y+(s.center?s.h/2:s.size))+'" '+(s.center?'text-anchor="middle" dominant-baseline="central" ':'')+'font-size="'+s.size+'" fill="'+c+'"'+meta+'>'+esc(s.text)+'</text>';if(s.type==='rect')return '<rect x="'+s.x+'" y="'+s.y+'" width="'+s.w+'" height="'+s.h+'" fill="none" stroke="'+c+'" stroke-width="'+s.width+'"'+meta+'/>';let out='<path d="M '+s.x+' '+s.y+' L '+s.x2+' '+s.y2+'" fill="none" stroke="'+c+'" stroke-width="'+s.width+'"'+meta+'/>';if(s.arrow){const len=Math.hypot(s.x2-s.x,s.y2-s.y),u=(s.x2-s.x)/len,v=(s.y2-s.y)/len;if(len)out+='<path d="M '+(s.x2-u*4-v*2)+' '+(s.y2-v*4+u*2)+' L '+s.x2+' '+s.y2+' L '+(s.x2-u*4+v*2)+' '+(s.y2-v*4-u*2)+'" fill="none" stroke="'+c+'" stroke-width="'+s.width+'"/>';}return out;}).join('')+'</svg>';}
 function controlExtra(p,m){const o=options(p),c=cuts(p,m);return '<section class="wp-card hp133-controls"><h2>Horizontal · 水平传力图</h2><div class="wp-grid"><label><input type="checkbox" id="lp84-h133-cuts" '+(o.autoCuts?'checked':'')+'> 自动选择穿过连续墙的剖面</label><label><input type="checkbox" id="lp84-h133-face" '+(o.faceAuto?'checked':'')+'> 按剖面方向读取 Overall B / D</label><label>示意荷载方向<select id="lp84-h133-sign"><option value="1" '+(o.sign>0?'selected':'')+'>正向 →</option><option value="-1" '+(o.sign<0?'selected':'')+'>反向 ←</option></select></label></div><p>'+['one','two'].map((k,i)=>'Section '+(i+1)+'–'+(i+1)+'：'+c[k].axis+' = '+fmt(c[k].at)+' m · Overall '+c[k].face+(c[k].automatic?'（自动穿墙）':'')).join('；')+'</p><p class="wp-sub">红色：水平力方向；绿色：侧向作用的轴力增量示意。风、土、水及地面附加荷载读取 Overall；缺少的输入保留待补。剖面自动选位只用于 Horizontal。</p></section>';}
 function controls(p,m){let html=legacy.controls(p,m);if(options(p).faceAuto)html=html.replace('id="lp84-face"','id="lp84-face" disabled');return html+controlExtra(p,m);}
 function readControls(p,m){const v=legacy.readControls(p,m),get=k=>document.getElementById('lp84-h133-'+k),old=options(p);v.horizontal133={autoCuts:get('cuts')?.checked??old.autoCuts,faceAuto:get('face')?.checked??old.faceAuto,sign:get('sign')?.value==='-1'?-1:get('sign')?1:old.sign};return v;}
 function plan(p,m){const v=legacy.settings(p,m),c=cuts(p,m),f=Engine.floorModel(m,v.lo),xs=Engine.axes(p,'x',f.key),ys=Engine.axes(p,'y',f.key),x0=xs[0].v,x1=xs.at(-1).v,y0=ys[0].v,y1=ys.at(-1).v,scale=Math.min(390/Math.max(1,x1-x0),250/Math.max(1,y1-y0)),X=x=>65+(x-x0)*scale,Y=y=>38+(y-y0)*scale;
  let s='<svg role="img" aria-label="Horizontal section positions" viewBox="0 0 540 330" style="width:100%">';
  for(const wall of f.walls){const r=Engine.rect(wall);s+='<rect x="'+X(r.x-r.w/2)+'" y="'+Y(r.y-r.d/2)+'" width="'+r.w*scale+'" height="'+r.d*scale+'" fill="#d9e9f7" stroke="'+C.blue+'"/>';}
  for(const a of xs)s+='<path d="M '+X(a.v)+' 25 V '+(Y(y1)+12)+'" stroke="#c9d2d9" stroke-dasharray="3 3"/><text x="'+X(a.v)+'" y="18" text-anchor="middle" font-size="8">'+esc(a.id)+'</text>';
  for(const a of ys)s+='<path d="M 48 '+Y(a.v)+' H '+(X(x1)+12)+'" stroke="#c9d2d9" stroke-dasharray="3 3"/><text x="40" y="'+(Y(a.v)+3)+'" text-anchor="end" font-size="8">'+esc(a.id)+'</text>';
  for(const [i,k]of ['one','two'].entries()){const q=c[k],isX=q.axis==='X',x=isX?X(q.at):X(x0),y=isX?Y(y0):Y(q.at);s+='<path d="M '+x+' '+y+' L '+(isX?x:X(x1))+' '+(isX?Y(y1):y)+'" stroke="'+(i?C.green:C.red)+'" stroke-width="2"/><text x="'+(isX?x+4:X(x1)+5)+'" y="'+(isX?Y(y1)+20:y-5)+'" fill="'+(i?C.green:C.red)+'" font-size="9">'+(i+1)+'–'+(i+1)+'</text>';}
  return '<section class="wp-card hp133-plan"><h2>Horizontal · 剖切位置</h2>'+s+'</svg></section>';
 }
 function preview(p,m){const original=legacy.preview(p,m),oldControls=legacy.controls(p,m);return original.replace(oldControls,controls(p,m)).replace('<h2>剖切位置 ·','<h2>Vertical · 剖切位置 ·').replace('<div class="wp-cards">',plan(p,m)+'<div class="wp-cards">').replace(/(<section class="wp-card"><h2>Horizontal Load Path<\/h2>)[\s\S]*?<\/svg>/,(_,head)=>head+svg(reportDiagram(p,m)));}
 Object.assign(LoadPath84,{controls,readControls,preview,diagram:(p,m,kind,key,report)=>kind==='horizontal'?diagram(p,m,key,report):legacy.diagram(p,m,kind,key,report),reportDiagram:(p,m,kind)=>kind==='horizontal'?reportDiagram(p,m):legacy.reportDiagram(p,m,kind)});
 return {options,collect,slice,bands,cuts,axialPair,loading,diagram,reportDiagram,svg,legacy};
})();
