const Loading=(()=>{
 const slabGeometry=typeof SlabGeometry120!=='undefined'?SlabGeometry120:require('./slab-geometry120.js');
 const supportPlanner=()=>typeof SlabSupport132!=='undefined'?SlabSupport132:require('./slab-support132.js');
 const LD=typeof LoadData!=='undefined'?LoadData:require('./load-data.js');
 const E=typeof Engine!=='undefined'?Engine:require('./engine.js'),S=typeof SectionB!=='undefined'?SectionB:require('./checks.js');
 const tol=1e-6,nice=n=>Math.round(n*1e6)/1e6,eq=(a,b)=>Math.abs(a-b)<tol,pt=(a,b)=>eq(a[0],b[0])&&eq(a[1],b[1]),pos=c=>[c.x,c.y],contains=(c,q)=>{const r=E.columnRect(c);return Math.abs(r.x-q[0])<=r.w/2+tol&&Math.abs(r.y-q[1])<=r.d/2+tol;},a=b=>b.rawA||b.a,z=b=>b.rawZ||b.z,L=b=>Math.hypot(z(b)[0]-a(b)[0],z(b)[1]-a(b)[1]);
 function on(p,b){const len=L(b);return len>tol&&Math.abs((p[0]-a(b)[0])*(z(b)[1]-a(b)[1])-(p[1]-a(b)[1])*(z(b)[0]-a(b)[0]))<tol*len&&distance(p,b)>=-tol&&distance(p,b)<=len+tol;}
 function distance(p,b){return ((p[0]-a(b)[0])*(z(b)[0]-a(b)[0])+(p[1]-a(b)[1])*(z(b)[1]-a(b)[1]))/L(b);}
 // Preserve saved reference stations; also accept the current, moved centreline.
 // Physical contact is projected back to the reference span for load positions.
 function contact(point,b){
  const len=L(b);if(on(point,b)){const x=distance(point,b);return {x:Math.max(0,Math.min(len,x)),section:false};}
  if(['MB','SB','TB','CB'].includes(b.kind)){
   if(!b.a||!b.z)return null;const dx=b.z[0]-b.a[0],dy=b.z[1]-b.a[1],ll=dx*dx+dy*dy;if(ll<tol*tol)return null;
   const t=((point[0]-b.a[0])*dx+(point[1]-b.a[1])*dy)/ll;
   if(t<-tol||t>1+tol||Math.abs((point[0]-b.a[0])*dy-(point[1]-b.a[1])*dx)>tol*Math.sqrt(ll))return null;
   return {x:Math.max(0,Math.min(1,t))*len,section:false,moved173:true};
  }
  if(!E.on(point,b))return null;const x=distance(point,b);return x>=-tol&&x<=len+tol?{x:Math.max(0,Math.min(len,x)),section:true}:null;
 }
 function columnLoadPoint(p,model,c){return E.columnReference(p,model.key,c);}
 function token(kind,c){if((c.autoTransfer||c.autoCantilever173)&&kind===c.kind)kind=c.baseKind;if(kind==='COL')return 'COL|'+pos(c).map(nice);if(kind==='SLAB')return 'SLAB|'+JSON.stringify(c.rects.map(r=>[r.x0,r.x1,r.y0,r.y1].map(nice)));return kind+'|'+[c.cantileverOrigin173?.rawA||a(c),c.cantileverOrigin173?.rawZ||z(c)].map(p=>p.map(nice).join(',')).sort().join('|');}
 const defaults={fcu:45,fire:2,columnFcu:60,columnFire:2,tbFcu:60,tbFire:2,columnRatio:2.5,columnFactor:1,columnProject:1.25,wallFcu:60};
 function settings(p){const cfg={...defaults,...p.explorer?.settings};if(cfg.wallFcu===null||cfg.wallFcu===undefined||cfg.wallFcu==='')cfg.wallFcu=defaults.wallFcu;return cfg;}
 function init(p){p.explorer??={};p.explorer.settings??={};p.explorer.floors??={};p.explorer.members??={};p.explorer.selected??={};return p.explorer;}
 const sharedSupportKeys=['supportA','supportZ','fixedEnd','slabType','csFixedEdge','sectionASupport','beamSpan','slabSpan131','slabSupports132'];
 function framingFloors(p,f){if(!Array.isArray(p.groups))return [f];const floors=E.floors(p),type=floors[f-1]?.type;return type?floors.filter(x=>x.type===type).map(x=>x.n):[f];}
 function input(p,f,t){const records=p.explorer?.members||{},local=records[f+'|'+t]||{},out={...local},floors=framingFloors(p,f),conflicts=[];
  for(const k of sharedSupportKeys){const values=floors.map(n=>records[n+'|'+t]).filter(x=>x&&Object.hasOwn(x,k)).map(x=>x[k]==='auto'||x[k]===''?null:x[k]),distinct=[...new Map(values.map(v=>[JSON.stringify(v),v])).values()];if(distinct.length===1)out[k]=distinct[0];else if(distinct.length>1)conflicts.push(k);}
  if(conflicts.length)out.supportConflicts=conflicts;return out;
 }
 function saveFramingSupports(p,f,t,values,keys=sharedSupportKeys){init(p);for(const n of framingFloors(p,f)){const row=p.explorer.members[n+'|'+t]??={};for(const k of keys){if(!sharedSupportKeys.includes(k))continue;if(Object.hasOwn(values,k)&&values[k]!==undefined)row[k]=values[k];else delete row[k];}}}
 function clearFramingRecord(p,f,t){for(const n of framingFloors(p,f))delete p.explorer?.members?.[n+'|'+t];}

 // The plan remains geometric. Only the beam analysis coordinate uses a manual span.
 function beamSpan(c,o={}){
  const automatic=L(c),manual=o.beamSpan!=null&&o.beamSpan!==''&&o.beamSpan!=='auto',requested=manual?o.beamSpan:automatic;
  const valid=typeof requested==='number'&&Number.isFinite(requested)&&requested>0&&(!manual||requested>=.001)&&Number.isFinite(requested/automatic)&&Number.isFinite(automatic/requested),conflict=o.supportConflicts?.includes('beamSpan');
  return {automatic,value:valid?requested:automatic,manual,ratio:valid?requested/automatic:1,error:conflict?'同 Framing 各层 Span 设置冲突，请修改并保存统一':valid?null:'Span 须为不小于 0.001 m 的有效数值'};
 }
 function beamSpanLoads(span,lines,points){
  const ratio=span.ratio,station=x=>Math.abs(x-span.automatic)<1e-9?span.value:Math.abs(x)<1e-9?0:x*ratio;
  // Round at the receiving beam before rescaling; do not round again and alter the resultant.
  const line=r=>{const v=BeamLoads.rounded(r);if(ratio===1)return v;const out={...v,start:station(r.start),end:station(r.end),spanAdjusted130:true};if(!r.slabLoad179)for(const k of ['g','q','sw','dl','sdl','ug183','uq183'])if(Number.isFinite(v[k]))out[k]=v[k]/ratio;return out;};
  return {lines:lines.map(line),points:points.map(r=>{const v=BeamLoads.rounded(r);return ratio===1?v:{...v,x:station(r.x)};})};
 }

 function members(p,r,f){const m=E.floorModel(r,f);return [...m.slabs.map(c=>({kind:'SLAB',id:c.id,member:c})),...m.beams.filter(c=>typeof TrussModel109==='undefined'||!TrussModel109.replacement(p,f,c)).map(c=>({kind:c.kind,id:c.displayId||c.id,member:c})),...m.columns.map(c=>({kind:'COL',id:c.id,member:c}))].map(c=>({...c,token:token(c.kind,c.member)}));}
 function floorload(p,f){return LD.floor(p,f);}
 function available(v){return typeof v==='number'&&Number.isFinite(v)&&v>=0;}
 function actions(len,gd,ql,points=[],cb=false,lines=[],rounding183=null){
  if(!(len>0)||!available(gd)||!available(ql)||points.some(p=>!available(p.g)||!available(p.q)||!available(p.x)||p.x>len)||lines.some(l=>!available(l.g)||!available(l.q)||!available(l.start)||!(l.end>l.start)||l.end>len+tol))throw Error('荷载／位置无效');
  function one(w,ps,ls){const total=w*len+ps.reduce((s,p)=>s+p.v,0)+ls.reduce((s,l)=>s+l.v*(l.end-l.start),0),moment=w*len*len/2+ps.reduce((s,p)=>s+p.v*p.x,0)+ls.reduce((s,l)=>s+l.v*(l.end*l.end-l.start*l.start)/2,0);
   if(cb)return {left:total,right:0,M:moment,V:total};const right=moment/len,left=total-right;
   const M=x=>left*x-w*x*x/2-ps.reduce((s,p)=>s+p.v*Math.max(0,x-p.x),0)-ls.reduce((s,l)=>{const t=Math.max(0,Math.min(x,l.end)-l.start);return s+l.v*t*(x-l.start-t/2);},0);
   const V=x=>left-w*x-ps.filter(p=>p.x<=x+tol).reduce((s,p)=>s+p.v,0)-ls.reduce((s,l)=>s+l.v*Math.max(0,Math.min(x,l.end)-l.start),0);
   const cuts=[...new Set([0,len,...ps.map(p=>p.x),...ls.flatMap(l=>[l.start,l.end])])].sort((a,b)=>a-b);let max=0;
   for(let i=0;i<cuts.length;i++){max=Math.max(max,M(cuts[i]));if(i<cuts.length-1){const mid=(cuts[i]+cuts[i+1])/2,q=w+ls.filter(l=>l.start<mid&&l.end>mid).reduce((s,l)=>s+l.v,0);if(q>0){const x=cuts[i]+V(cuts[i])/q;if(x>cuts[i]&&x<cuts[i+1])max=Math.max(max,M(x));}}}
   return {left,right,M:max,V:Math.max(Math.abs(left),Math.abs(right))};
  }
  const calc=(g,q)=>one(g*gd+q*ql,points.map(p=>({...p,v:g*p.g+q*p.q})),lines.map(l=>({...l,v:g*l.g+q*l.q}))),dead=calc(1,0),live=calc(0,1);
  if(rounding183){const up=BeamLoads.up,uniform=rounding183.uniform||BeamLoads.factored({g:gd,q:ql}),ps=points.map(p=>({...p,...BeamLoads.factored(p)})),ls=lines.map(l=>({...l,...BeamLoads.factored(l)})),round=r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,up(v)])),factoredDead=round(one(uniform.g,ps.map(p=>({...p,v:p.g})),ls.map(l=>({...l,v:l.g})))),factoredLive=round(one(uniform.q,ps.map(p=>({...p,v:p.q})),ls.map(l=>({...l,v:l.q})))),combined=round(one(up(uniform.g+uniform.q),ps.map(p=>({...p,v:up(p.g+p.q)})),ls.map(l=>({...l,v:up(l.g+l.q)}))));
   // End reactions are the sum of the displayed, rounded G/Q reactions.
   combined.left=up(factoredDead.left+factoredLive.left);combined.right=up(factoredDead.right+factoredLive.right);combined.V=Math.max(combined.left,combined.right);if(cb)combined.M=up(factoredDead.M+factoredLive.M);
   return {dead,live,...combined,factoredDead,factoredLive,rounded183:true,udlDead:gd,udlLive:ql,points,lines,totalDead:dead.left+dead.right,totalLive:live.left+live.right};
  }
  return {dead,live,...calc(1.4,1.6),udlDead:gd,udlLive:ql,points,lines,totalDead:dead.left+dead.right,totalLive:live.left+live.right};
 }
 // All beams use their full depth. Slab self-weight is measured between faces.
 function beamSelfWeight(c,len=L(c)){if(!(len>tol&&c.b>0&&c.d>0))throw Error('梁自重计算缺少有效尺寸');return [{start:0,end:len,g:BeamLoads.up(24.5*c.b*c.d),q:0,label:'梁自重'}];}
 function columnAreaGroups(p,result,f,t){
  const o=input(p,f,t),manual=String(o.sectionAAreas||'').trim()&&o.sectionAAreaMode!=='auto';
  const data=manual?{groups:parseColumnAreaRows(o.sectionAAreas,p,f),errors:[]}:columnAreas(p,result,f,t),overrides=o.sectionAAreaOverrides115||{};
  let groups=data.groups.flatMap(g=>Array.from({length:g.hi-g.lo+1},(_,i)=>({...g,lo:g.lo+i,hi:g.lo+i})));
  for(const [key,value]of Object.entries(overrides)){const n=Number(key);if(n<f||n>p.total)continue;if(!Number.isFinite(value)||value<0)throw Error('手动面积须为非负数');const old=groups.filter(g=>g.lo===n),sum=old.reduce((v,g)=>v+g.area,0);groups=groups.filter(g=>g.lo!==n);
   if(sum>0)groups.push(...old.map(g=>({...g,area:g.area*value/sum,b:null,d:null,rects:[],polygons:[],manualArea:true})));
   else groups.push({lo:n,hi:n,area:value,b:null,d:null,rects:[],polygons:[],manualArea:true,automatic:true,areaId:null,areaName:'整层默认'});
  }
  return {...data,groups:groups.sort((a,b)=>a.lo-b.lo)};
 }
 function supportSummary(p,r,f,c){const model=E.floorModel(r,f),root=c.displayKind==='CB'?cbRoot(p,r,f,c):null;
  return ['a','z'].map(end=>{const label=end==='a'?'A':'B';if(root&&root.fixedEnd!==end)return {end:label,text:root.fixedEnd?'自由端':'固定端未确认'};
   const chosen=manualSupport(p,model,f,c,end);let hits=[];
   if(chosen){if(chosen.invalid)return {end:label,text:'手动 Support 已失效'};hits=[chosen];}
   else{const opts=supportOptions(model,c,end),cols=opts.filter(x=>x.type==='COL'),walls=opts.filter(x=>x.type==='WALL'),point=end==='a'?a(c):z(c);hits=cols.length?cols:walls.length?walls:opts.filter(x=>x.type==='BEAM'&&(contact(point,x.member)?.x>tol&&contact(point,x.member).x<L(x.member)-tol||cbTipSupport(p,r,f,x.member,point)));if(hits.length>1&&hits.every(x=>x.type==='WALL')){const joined=new Set([hits[0].member]);let change=true;while(change){change=false;for(const w of model.walls)if(!joined.has(w)&&[...joined].some(v=>[a(w),z(w)].some(q=>on(q,v))||[a(v),z(v)].some(q=>on(q,w)))){joined.add(w);change=true;}}if(hits.every(x=>joined.has(x.member)))hits=[{label:hits.map(x=>x.label).join(' / ')}];}}
   return {end:label,text:(root?'固定端 · ':'')+(hits.length===1?hits[0].label:hits.length?'多重连接，待确认':'未找到支承')};
  });
 }


 function supportOptions(model,c,end){const point=end==='a'?a(c):z(c);return [...model.columns.filter(x=>x.status!=='上层柱'&&contains(x,point)).map(x=>({type:'COL',member:x})),...model.walls.filter(x=>contact(point,x)).map(x=>({type:'WALL',member:x})),...model.beams.filter(x=>x!==c&&token(x.kind,x)!==token(c.kind,c)&&contact(point,x)).map(x=>({type:'BEAM',member:x}))].map(x=>({...x,value:token(x.member.kind||x.type,x.member),label:(x.member.displayId||x.member.id)+' · '+(x.member.displayKind||x.member.kind||x.type)+(x.type==='BEAM'&&contact(point,x.member)?.section?' · 截面相接':'')}));}
 function manualSupport(p,model,f,c,end){const o=input(p,f,token(c.kind,c)),key=end==='a'?'supportA':'supportZ';if(o.supportConflicts?.includes(key))return {manual:true,invalid:true,conflict:true};const value=o[key];if(!value||value==='auto')return null;const choice=supportOptions(model,c,end).find(x=>x.value===value);return choice?{...choice,manual:true}:{manual:true,invalid:true,value};}

 function cbRoot(p,r,f,c){
  const resolved=input(p,f,token(c.kind,c)),saved=resolved.fixedEnd??c.fixedEnd101,model=E.floorModel(r,f);
  const hits=q=>[...model.columns.filter(x=>x.status!=='上层柱'&&contains(x,q)).map(x=>'柱 '+x.id),...model.walls.filter(w=>contact(q,w)).map(w=>'墙 '+w.id)];
  const connections={a:hits(a(c)),z:hits(z(c))};if(resolved.supportConflicts?.includes('fixedEnd'))return {fixedEnd:null,mode:'conflict',connections,message:'同 Framing 各层 CB 固定端设置冲突，请选择一次并保存统一'};
  if(['a','z'].includes(saved)){const automatic=c.autoCantilever173&&resolved.fixedEnd==null;return {fixedEnd:saved,mode:automatic?'auto':'manual',connections,message:(automatic?'自動識別 ':'手动指定 ')+saved+' 端'};}
  if(!!connections.a.length!==!!connections.z.length){const fixedEnd=connections.a.length?'a':'z';return {fixedEnd,mode:'auto',connections,message:'自动选 '+fixedEnd+' 端：连接'+connections[fixedEnd].join('、')};}
  return {fixedEnd:null,mode:'auto',connections,message:connections.a.length?'两端均连接柱／墙，请手动指定 CB 固定端':'两端未找到唯一的柱／墙根部，请手动指定 CB 固定端'};
 }
 function cbTipSupport(p,r,f,c,point){if(c.displayKind!=='CB')return false;const root=cbRoot(p,r,f,c);return !!root.fixedEnd&&root.connections[root.fixedEnd].length>0&&!!contact(point,c)&&eq(contact(point,c).x,root.fixedEnd==='a'?L(c):0);}
 // Geometry only: identify a directed, non-circular route to a column or wall.
 // The CB tip reaction uses the same candidate rule as the force solver below.
 function supportModel(p,model,f){
  const floors=E.floors(p);if(!f||floors[f-1]?.type!==model.key)f=floors.find(x=>x.type===model.key)?.n;if(!f)return model;
  const r={floors,models:{[model.key]:model}},memo=new Map();
  const direct=q=>model.columns.filter(c=>c.status!=='上层柱'&&contains(c,q)).length===1||model.walls.some(w=>contact(q,w));
  function held(point,exclude,path){const end=pt(point,a(exclude))?'a':'z',manual=manualSupport(p,model,f,exclude,end);if(manual)return !manual.invalid&&(manual.type!=='BEAM'||connected(manual.member,path));if(direct(point))return true;const hits=model.beams.filter(b=>b!==exclude&&contact(point,b)&&(contact(point,b)?.x>tol&&contact(point,b).x<L(b)-tol||cbTipSupport(p,r,f,b,point)));return hits.length===1&&connected(hits[0],path);}
  function connected(b,path=new Set()){
   if(path.has(b))return false;if(memo.has(b))return memo.get(b);const next=new Set(path);next.add(b);const root=b.displayKind==='CB'?cbRoot(p,r,f,b):null;
   const ok=root?!!root.fixedEnd&&held(root.fixedEnd==='a'?a(b):z(b),b,next):held(a(b),b,next)&&held(z(b),b,next);memo.set(b,ok);return ok;
  }
  return {...model,beams:model.beams.map(b=>{const ok=connected(b);return {...b,supportStatus:ok?'connected':'unverified',supportText:ok?(b.displayKind==='CB'?'CB 计算根部已有柱／墙／承托梁的几何连接路径；节点抗弯约束未验算':'两端已有到柱／墙的几何传荷路径，可经 CB 自由端传递；节点及整体结构未验算'):b.supportText};})};
 }
 function resolvedInput(p,r,f,c){const o=input(p,f,token(c.kind,c));return c.displayKind==='CB'?{...o,fixedEnd:cbRoot(p,r,f,c).fixedEnd}:o;}
 // Each strip has a continuous slab span; holes and separate lobes stay separate.
 function slabStrips118(c,dir){
  if(c.rectangular)return [{x0:c.x0,x1:c.x1,y0:c.y0,y1:c.y1}];
  const along=dir==='X'?'y':'x',cross=dir==='X'?'x':'y',cuts=[...new Set(c.rects.flatMap(r=>[r[along+'0'],r[along+'1']]))].sort((a,b)=>a-b),out=[];
  for(let i=0;i<cuts.length-1;i++){
   const lo=cuts[i],hi=cuts[i+1],mid=(lo+hi)/2;if(hi-lo<=tol)continue;
   const ranges=c.rects.filter(r=>mid>r[along+'0']&&mid<r[along+'1']).map(r=>[r[cross+'0'],r[cross+'1']]).sort((a,b)=>a[0]-b[0]),merged=[];
   for(const range of ranges){const last=merged.at(-1);if(last&&range[0]<=last[1]+tol)last[1]=Math.max(last[1],range[1]);else merged.push([...range]);}
   for(const [a,z]of merged)out.push({[along+'0']:lo,[along+'1']:hi,[cross+'0']:a,[cross+'1']:z});
  }
  return out;
 }
 // Project convention: beam/support centre-to-centre design dimensions.
 // A cantilever extends from the root centre to its actual free edge.
 // Design and transfer use L; physical Area tracing keeps the occupied floor geometry.
 function slabSpan(c,dir,model,fixedEdge=null,supports={},allowFree=false){
  const clear=dir==='X'?c.x1-c.x0:dir==='Y'?c.y1-c.y0:null;
  if(!clear||!slabGeometry.designRectangle(c,model)||!(c.thickness>0))return {clear,effective:null,segments:[],errors:['板有效跨度：净跨、板厚或矩形范围未确认']};
  if(!c.rectangular){const spans=slabStrips118(c,dir).map(part=>slabSpan({...c,...part,rectangular:true},dir,model,fixedEdge,supports,allowFree)),errors=[...new Set(spans.flatMap(v=>v.errors))],segments=spans.flatMap(v=>v.segments);return {clear,effective:errors.length||!segments.length?null:Math.max(...segments.map(v=>v.effective)),segments,errors};}
  if(!c.netBoundary120)return {clear,effective:clear,segments:[],errors:[]};
  const cross=dir==='X'?0:1,along=1-cross,dim=cross?'y':'x',other=cross?'x':'y',lo=c[other+'0'],hi=c[other+'1'],sides=fixedEdge?[['left','top'].includes(fixedEdge)?0:1]:[0,1];
  const members=[...model.columns.filter(c=>c.status!=='上层柱').map(member=>({type:'COL',member})),...model.walls.map(member=>({type:'WALL',member})),...model.beams.map(member=>({type:'BEAM',member}))];
  const candidates=sides.map(side=>members.filter(v=>slabFace(c,v.member,cross,c[dim+side]))),cuts=[...new Set([lo,hi,...[...candidates.flatMap((list,i)=>list.flatMap(v=>slabFace(c,v.member,cross,c[dim+sides[i]]))),...(Array.isArray(supports.slabSupports132?.segments)?supports.slabSupports132.segments.filter(Boolean).flatMap(s=>[s.start,s.end]):[])].filter(v=>v>lo+tol&&v<hi-tol)])].sort((a,b)=>a-b),segments=[],errors=[];
  for(let i=1;i<cuts.length;i++){const mid=(cuts[i-1]+cuts[i])/2,extensions=[],supportDetails=[];for(let j=0;j<sides.length;j++){
   const point=[];point[along]=mid;point[cross]=c[dim+sides[j]];const hit=supportPlanner().resolve(c,dir,supports,{side:sides[j]?'B':'A',face:c[dim+sides[j]],start:cuts[i-1],end:cuts[i],point,options:candidates[j]}).hit;
   if(!hit){if(allowFree&&!candidates[j].some(v=>{const face=slabFace(c,v.member,cross,c[dim+sides[j]]);return face&&mid>face[0]-tol&&mid<face[1]+tol;})){extensions.push(0);supportDetails.push({side:sides[j],id:'自由邊',width:0});continue;}errors.push('板中心距：支承边不完整或重复');break;}
   const rect=hit.type==='COL'?E.columnRect(hit.member):E.rect(hit.member),width=cross?rect.d:rect.w;
   extensions.push(width/2);supportDetails.push({side:sides[j],id:hit.member.displayId||hit.member.id,width});
  }if(extensions.length===sides.length)segments.push({start:cuts[i-1],end:cuts[i],extensions,supports:supportDetails,effective:clear+extensions.reduce((n,v)=>n+v,0)});}
  return {clear,effective:errors.length||!segments.length?null:Math.max(...segments.map(s=>s.effective)),segments,errors:[...new Set(errors)]};
 }
 // One saved slab calculation input; transfer follows L, framing stays geometric.
 function slabCalculation(c,dir,model,o={}){
  const automatic=slabSpan(c,dir,model,o.slabType==='CS'?o.csFixedEdge:null,o),saved=o.slabSpan131,manual=saved!=null,
   widthSpan=dir?slabSpan(c,dir==='X'?'Y':'X',model,null,{},true):null,geometricWidth=widthSpan?.effective??null,netArea=LoadRegions83.netSelfWeight(c,model).reduce((n,r)=>n+LoadRegions83.area(r),0),errors=[];
  const valid=v=>typeof v==='number'&&Number.isFinite(v)&&v>=.001;
  if(manual&&(!saved||typeof saved!=='object'||Array.isArray(saved)||!valid(saved.L)||saved.width!=null&&!valid(saved.width)||!['span','net'].includes(saved.selfWeight)))errors.push('板 Span L、板宽 B 须为不小于 0.001 m 的有效数值，并选择自重面积');
  if(o.supportConflicts?.includes('slabSpan131'))errors.push('同 Framing 各层板 Span 设置冲突，请修改并保存统一');
  const width=manual&&saved?.width!=null?saved.width:geometricWidth,L=manual?saved?.L:automatic.effective;
  const clear=dir==='X'?c.x1-c.x0:c.y1-c.y0,area=manual&&saved?.selfWeight==='span'?L*width:(L>0&&clear>0?netArea*L/clear:netArea);
  if(manual&&(!Number.isFinite(area)||!(area>0)||!(netArea>0)||!Number.isFinite(area/netArea)))errors.push('板计算面积无效，请核对 L、B 及实际板区');
  if(!valid(width))errors.push('板寬 B 未確認，請核對兩側梁或輸入指定板寬');
  if(!manual)errors.push(...automatic.errors,...(widthSpan?.errors||[]));
  return {manual,automatic,L:errors.length?null:L,width,geometricWidth,netArea,selfWeightArea:errors.length?netArea:area,selfWeightScale:errors.length?1:area/netArea,selfWeight:manual?saved?.selfWeight:'net',errors:[...new Set(errors)]};
 }
 // Transfer the slab load over the same L used by its design check. Geometry
 // remains unchanged; support-centre strips are claimed once from beam tops.
 function slabTransfer177(p,f,c,dir,model,o,part,calculation,claims,assigned=LoadRegions83.surfaceRegions(p,f,model)){
  const cross=dir==='X'?'x':'y',along=dir==='X'?'y':'x',lo=part[cross+'0'],hi=part[cross+'1'],cs=o.slabType==='CS';
  if(!(calculation.L>0))return null;
  const automatic=slabSpan({...c,...part,rectangular:true},dir,model,cs?o.csFixedEdge:null,o),segments=automatic.segments.length?automatic.segments:[{start:part[along+'0'],end:part[along+'1'],extensions:[],supports:[]}],zones=[];
  for(const segment of segments){
   const start=Math.max(part[along+'0'],segment.start),end=Math.min(part[along+'1'],segment.end);if(end-start<=tol)continue;
   const extensions=[0,0];segment.supports.forEach((v,i)=>extensions[v.side]=segment.extensions[i]);
   const physical={...part,[along+'0']:start,[along+'1']:end,[cross+'0']:lo-extensions[0],[cross+'1']:hi+extensions[1]},physicalSpan=physical[cross+'1']-physical[cross+'0'],span=calculation.manual?calculation.L:physicalSpan,origin=physical[cross+'0'],scale=span/physicalSpan;
   // Exact coordinate load regions retain their location before mapping to a
   // user-specified design span; a panel assignment includes its beam-top share.
   const map=r=>({...r,[cross+'0']:origin+(r[cross+'0']-origin)*scale,[cross+'1']:origin+(r[cross+'1']-origin)*scale});
   const pieces=LoadRegions83.pieces(p,f,{rects:[physical]},assigned).map(map),concrete=[map({...physical,load:{dl:0,sdl:0,ll:0}})];
   zones.push({start,end,origin,span,pieces,concrete});
   const additions=LoadRegions83.difference([physical],c.rects);
   claims.push(...additions.map(r=>({...r,h:c.thickness/1000,slab:c.id})));
  }
  return {zones,swScale:calculation.manual&&calculation.selfWeight==='span'?calculation.width/(calculation.netArea/(dir==='X'?c.x1-c.x0:c.y1-c.y0)):1};
 }
 function slabReaction177(transfer,mid,right,cs,sw,autoSW,factored183=false){
  const z=transfer.zones.find(z=>mid>z.start-tol&&mid<z.end+tol);if(!z)return null;
  const parts=factored183?z.pieces.map(p=>({...p,load:{...p.load,...BeamLoads.surface(p.load)}})):z.pieces,r=LoadRegions83.reaction(parts,sw.dir,mid,z.origin,z.span,right,cs,0,autoSW);
  if(autoSW){const concrete=LoadRegions83.reaction(z.concrete,sw.dir,mid,z.origin,z.span,right,cs,factored183?BeamLoads.surface({sw:BeamLoads.up(sw.value*transfer.swScale)}).sw:sw.value*transfer.swScale,true);for(const k of ['g','sw','mG'])r[k]+=concrete[k];}
  return r;
 }
 // A slab reaction is an external line load on the receiving member. Map its
 // complete support strip to 0..L without diluting the line-load intensity.
 // Keep different slab sides separate; local load changes retain their order.
 function fullSpanSlabLoads179(lines,len){
  const groups=new Map();
  for(const line of lines){if(!line.slabLoad179)continue;const key=line.label+'|'+line.slabSide179,group=groups.get(key)||[];group.push(line);groups.set(key,group);}
  const bounds=new Map([...groups].map(([key,group])=>[key,{lo:Math.min(...group.map(l=>l.start)),hi:Math.max(...group.map(l=>l.end))}]));
  return lines.map(line=>{if(!line.slabLoad179)return line;const {lo,hi}=bounds.get(line.label+'|'+line.slabSide179);if(hi-lo<=tol)return line;return {...line,start:eq(line.start,lo)?0:(line.start-lo)/(hi-lo)*len,end:eq(line.end,hi)?len:(line.end-lo)/(hi-lo)*len};});
 }
 function addBeamSurface(p,f,model,beams,autoSW,areaTracing,claims=[]){
  for(const {beam:b,rects,parts,errors}of LoadRegions83.beamSurface(p,f,model,beams,claims)){
   b.errors.push(...errors);
   const c=b.member,along=eq(a(c)[1],z(c)[1])?'x':'y',cross=along==='x'?'y':'x',idx=along==='x'?0:1,origin=a(c)[idx],sign=z(c)[idx]>origin?1:-1;
   b.surfaceArea=rects.reduce((n,r)=>n+LoadRegions83.area(r),0);
   const cuts=[...new Set(parts.flatMap(r=>[r[along+'0'],r[along+'1']]))].sort((a,b)=>a-b);
   for(let i=1;i<cuts.length;i++){
    const lo=cuts[i-1],hi=cuts[i],mid=(lo+hi)/2,cover=parts.filter(r=>mid>r[along+'0']&&mid<r[along+'1']);if(!cover.length)continue;
    let dl=0,sdl=0,q=0;const sources101=[];
    for(const r of cover){const load=r.load,width=r[cross+'1']-r[cross+'0'],dead=autoSW?0:load.dl;
     if(![dead,load.sdl,load.ll].every(available)||!autoSW&&load.basis!=='total'){b.errors.push('梁顶 '+load.areaName+'：SDL / LL 或总 DL 未确认，请在 Loading 填写');continue;}
     dl+=dead*width;sdl+=load.sdl*width;q+=load.ll*width;
     if(areaTracing&&load.ll>tol)sources101.push({floor:f,slab:'梁顶 '+c.id,rect:{...r,[along+'0']:lo,[along+'1']:hi,load:undefined},area:load.ll*width*(hi-lo)});
    }
    const start=Math.min((lo-origin)*sign,(hi-origin)*sign),end=Math.max((lo-origin)*sign,(hi-origin)*sign);
    if(start<-tol||end>L(c)+tol){b.errors.push('梁顶荷载超出实际梁长度，请核对端点');continue;}
    if(dl+sdl+q>tol)b.lines.push({start:Math.max(0,start),end:Math.min(L(c),end),g:dl+sdl,q,sw:0,dl,sdl,sources101,surface126:true,label:autoSW?'梁顶 SDL / LL':'梁顶 DL / SDL / LL'});
   }
  }
 }
 // Loads over a column footprint enter that column directly, once. They do
 // not add slab concrete or duplicate the beam-top strips at column joints.
 function addColumnSurface(p,f,model,columns,autoSW,areaTracing,claims=[]){
  for(const {column,rects,parts,errors}of LoadRegions83.columnSurface(p,f,model)){const c=columns.find(c=>c.member===column);if(!c)continue;c.errors.push(...errors);c.surfaceArea=rects.reduce((n,r)=>n+LoadRegions83.area(r),0);
   for(const r of parts.flatMap(r=>LoadRegions83.difference([r],claims).map(q=>({...r,...q})))){const load=r.load,A=LoadRegions83.area(r),dl=autoSW?0:load.dl;if(![dl,load.sdl,load.ll].every(available)||!autoSW&&load.basis!=='total'){c.errors.push('柱位 '+load.areaName+'：請填寫 DL / SDL / LL');continue;}c.g+=(dl+load.sdl)*A;c.q+=load.ll*A;if(areaTracing&&load.ll>tol)(c.sources101??=[]).push({floor:f,slab:'柱位 '+column.id,rect:{...r,load:undefined},area:load.ll*A});}
  }
 }
 function run(...args){const steps=runSteps(...args);let next;do{next=steps.next();}while(!next.done);return next.value;}
 function* runSteps(p,r,section="B",areaTracing=false,inspectionFloor=null){const autoSW=section!=="A",roundLoads183=section!=="A"&&!areaTracing,cfg=settings(p),rows=[],memo=new Map(),columnAbove=[],wallAbove=[],issues=[],rootMoments=[],tt=typeof TrussModel109!=='undefined'?TrussModel109.manager(p,r):null;
  function design(method,o){const stamp=JSON.stringify([method,o]);if(!memo.has(stamp)){try{memo.set(stamp,S[method](o));}catch(e){memo.set(stamp,{status:'INPUT REQUIRED',fail:[e.message],description:'—'});}}return memo.get(stamp);}
  const queue=(method,o)=>({status:'NOT SELECTED',fail:[],description:'未选作 Check',pendingCheck:{method,o}});
  for(let f=inspectionFloor??p.total;f>=(inspectionFloor??1);f--){const model=E.floorModel(r,f),fl=floorload(p,f),columns=model.columns.filter(c=>c.status!=='上层柱').map(c=>({member:c,g:0,q:0,errors:[]})),walls=model.walls.map(c=>({member:c,g:0,q:0,errors:[]}));
   const beams=model.beams.map(c=>({member:c,kind:c.kind,token:token(c.kind,c),lines:[],points:[],errors:[],csMoments:[],cbMoments:[],done:false})),map=new Map(beams.map(b=>[b.token,b]));const local=[],slabClaims177=[];let transferRegions177;const areaErrors=LD.validate(p,f,model.slabs.map(c=>token('SLAB',c)),model);const slabTokens=new Set(model.slabs.map(c=>token('SLAB',c)));
   for(const [key,value]of Object.entries(p.explorer?.members||{}))if(key.startsWith(f+'|SLAB|')&&value.slabType==='CS'&&!slabTokens.has(key.slice(String(f).length+1)))areaErrors.push('CS 板块几何已改变，请重新指定悬臂板及固定边；旧记录：'+key);
   areaErrors.forEach(msg=>issues.push({floor:f,msg}));
   // Connected walls receive joint reactions as one vertical wall group; no artificial
   // split among wall legs is introduced, and no wall capacity check is added.
   const parent=walls.map((_,i)=>i),root=i=>parent[i]===i?i:(parent[i]=root(parent[i]));
   for(let i=0;i<walls.length;i++)for(let j=0;j<i;j++)if([a(walls[i].member),z(walls[i].member)].some(x=>on(x,walls[j].member))||[a(walls[j].member),z(walls[j].member)].some(x=>on(x,walls[i].member)))parent[root(i)]=root(j);
   const groupMap=new Map();walls.forEach((w,i)=>{const k=root(i);if(!groupMap.has(k))groupMap.set(k,{member:w.member,members:[],g:0,q:0,errors:[],slabs:new Set()});w.group=groupMap.get(k);w.group.members.push(w.member);});const wallGroups=[...groupMap.values()];wallGroups.forEach(g=>g.signature=g.members.map(c=>token('WALL',c)).sort().join(';'));

   function addRow(kind,c,extra={}){const t=token(kind,c),rr={floor:f,framing:r.floors[f-1].type,kind,id:c.displayId||c.id,token:t,member:c,input:input(p,f,t),...extra};local.push(rr);return rr;}
   function sink(point,exclude){const end=pt(point,a(exclude.member))?'a':'z',manual=manualSupport(p,model,f,exclude.member,end);if(manual){if(manual.invalid)return null;const t=manual.value;if(manual.type==='COL')return {type:'COL',target:columns.find(x=>token('COL',x.member)===t)};if(manual.type==='WALL')return {type:'WALL',target:walls.find(x=>token('WALL',x.member)===t).group};const target=beams.find(x=>x.token===t);return {type:'BEAM',target,x:contact(point,target.member).x};}const cs=columns.filter(c=>contains(c.member,point));if(cs.length===1)return {type:'COL',target:cs[0]};if(cs.length>1)return null;const ws=walls.filter(c=>contact(point,c.member));if(ws.length&&ws.every(w=>w.group===ws[0].group))return {type:'WALL',target:ws[0].group};let bs=beams.filter(b=>b!==exclude&&contact(point,b.member)&&(contact(point,b.member)?.x>tol&&contact(point,b.member).x<L(b.member)-tol||cbTipSupport(p,r,f,b.member,point)));if(bs.length===1)return {type:'BEAM',target:bs[0],x:contact(point,bs[0].member).x};return null;}
   // TT provenance is independent of area tracing and of whether reactions can
   // be solved. Keep it on every receiver so overrides cannot hide missing loads.
   function inheritTruss(target,sources=[]){if(!sources.length)return;target.truss109=[...new Set([...(target.truss109||[]),...sources])];if(target.row)target.row.truss109=[...target.truss109];}
   function send(s,g,q,error,label,sourceEnd,sources101=[],truss109=[],factored183=null){if(!s)return;inheritTruss(s.target,truss109);if(s.type==='BEAM'){s.target.points.push({x:s.x,g,q,...(factored183||{}),label,sourceEnd,sources101,...(truss109.length?{truss109:[...truss109]}:{})});if(error)s.target.errors.push(error);}else{if(areaTracing)(s.target.sources101??=[]).push(...sources101);s.target.g+=g;s.target.q+=q;if(error)s.target.errors.push(error);}}
   for(const b of beams){const o=resolvedInput(p,r,f,b.member),isCB=b.member.displayKind==='CB';for(const end of (isCB?['a','z'].filter(x=>x===o.fixedEnd):['a','z']))if(manualSupport(p,model,f,b.member,end)?.invalid)b.errors.push('手动 '+(end==='a'?'起点':'终点')+' Support 已失效：所选构件不存在或不再连接该端，请重新选择');b.sinks=isCB?[null,null]:[sink(a(b.member),b),sink(z(b.member),b)];if(isCB){if(o.fixedEnd==='a'||o.fixedEnd==='z'){const k=o.fixedEnd==='a'?0:1;b.sinks[k]=sink(k?z(b.member):a(b.member),b);if(!b.sinks[k])b.errors.push('CB 固定端未找到柱／墙／承托梁');}else b.errors.push('CB：'+cbRoot(p,r,f,b.member).message);}else if(b.sinks.some(s=>!s))b.errors.push('未找到明确的两端简支支承');b.supportErrors=[...b.errors];}
   // Error reachability follows the directed support graph, never every column on a floor.
   function markEdges(edges,msg,truss109=[]){
    const overlaps=(e,b)=>{const [u,v]=e,aa=a(b),zz=z(b),axis=eq(u[0],v[0])?1:0,cross=1-axis;const face=slabGeometry.face(b,cross,u[cross]),interval=face||(eq(aa[cross],u[cross])&&eq(zz[cross],u[cross])?[Math.min(aa[axis],zz[axis]),Math.max(aa[axis],zz[axis])]:null);return interval&&Math.min(Math.max(u[axis],v[axis]),interval[1])-Math.max(Math.min(u[axis],v[axis]),interval[0])>tol;};
    for(const c of columns)if(edges.some(([u,v])=>{const axis=eq(u[0],v[0])?1:0,face=slabGeometry.face(c.member,1-axis,u[1-axis]);return face&&Math.min(Math.max(u[axis],v[axis]),face[1])-Math.max(Math.min(u[axis],v[axis]),face[0])>tol;}))c.errors.push(msg);
    for(const b of beams)if(edges.some(e=>overlaps(e,b.member))){b.errors.push(msg);inheritTruss(b,truss109);}
    for(const w of walls)if(edges.some(e=>overlaps(e,w.member))){w.group.errors.push(msg);inheritTruss(w.group,truss109);}
   }
   function markLanding(point,msg,truss109=[]){let found=false;for(const c of columns)if(contains(c.member,point)){c.errors.push(msg);inheritTruss(c,truss109);found=true;}for(const w of walls)if(on(point,w.member)){w.group.errors.push(msg);inheritTruss(w.group,truss109);found=true;}for(const b of beams)if(on(point,b.member)){b.errors.push(msg);inheritTruss(b,truss109);found=true;}if(!found)for(const slab of model.slabs)if(slab.rects.some(q=>point[0]>=q.x0-tol&&point[0]<=q.x1+tol&&point[1]>=q.y0-tol&&point[1]<=q.y1+tol))markEdges(slab.edges,msg,truss109);}
   function markWallLanding(up,msg){for(const w of up.members){markLanding(a(w),msg,up.truss109);markLanding(z(w),msg,up.truss109);if(up.truss109?.length)for(const c of columns)if(contact(pos(c.member),w))markLanding(pos(c.member),msg,up.truss109);const lo=[Math.min(a(w)[0],z(w)[0]),Math.min(a(w)[1],z(w)[1])],hi=[Math.max(a(w)[0],z(w)[0]),Math.max(a(w)[1],z(w)[1])];for(const b of beams)if([0,1].every(i=>Math.max(lo[i],Math.min(a(b.member)[i],z(b.member)[i]))<=Math.min(hi[i],Math.max(a(b.member)[i],z(b.member)[i]))+tol)){b.errors.push(msg);inheritTruss(b,up.truss109);}}}
   function possibleSinks(b){const o=resolvedInput(p,r,f,b.member),ends=b.member.displayKind==='CB'&&['a','z'].includes(o.fixedEnd)?[o.fixedEnd]:['a','z'],list=[];for(const end of ends){const known=b.sinks[end==='a'?0:1];if(known){list.push(known);continue;}for(const candidate of supportOptions(model,b.member,end)){const target=candidate.type==='COL'?columns.find(x=>x.member===candidate.member):candidate.type==='WALL'?walls.find(x=>x.member===candidate.member)?.group:beams.find(x=>x.member===candidate.member);if(target)list.push({type:candidate.type,target});}}return list;}
   function traceProblem(origin,msg){const seen=new Set();function visit(b){if(seen.has(b))return;seen.add(b);inheritTruss(b,origin.truss109);if(b!==origin){const o=input(p,f,b.token);if(o.mode==='manual'&&b.row?.actions&&!origin.truss109?.length&&!b.truss109?.length)return;b.errors.push(msg);if(b.row){delete b.row.actions;b.row.result={status:'INPUT REQUIRED',fail:[...new Set([...(b.row.result.fail||[]),msg])],description:'上游可能传入的荷载未完整'};}}
     for(const s of possibleSinks(b))if(s.type==='BEAM')visit(s.target);else {s.target.errors.push(msg);inheritTruss(s.target,b.truss109);}
    }visit(origin);}

   // Vertical forces are characteristic G/Q, so load factors are applied only once.
   for(const up of (tt?tt.consume(f,columnAbove):columnAbove)){const matches=columns.filter(c=>E.overlap(E.columnRect(c.member),E.columnRect(up.member)));if(matches.length===1){matches[0].g+=up.g;matches[0].q+=up.q;matches[0].errors.push(...up.errors);inheritTruss(matches[0],up.truss109);if(areaTracing)(matches[0].sources101??=[]).push(...up.sources101||[]);}else{const point=columnLoadPoint(p,E.floorModel(r,f+1),up.member),target=matches.length?null:E.transferBeamAt(p,model,f,point),tbs=target?.kind==='TB'?beams.filter(b=>b.member.id===target.id&&b.kind==='TB'):[];if(tbs.length===1){let g=up.g,q=up.q,landingErrors=[...up.errors];if(!up.truss109?.length&&!areaTracing&&input(p,f+1,token('COL',up.member)).mode!=='manual'){try{const col=Reports.columnA(p,{floor:f+1,token:token('COL',up.member),id:up.member.id},r);landingErrors=[...col.errors];g=col.rows.reduce((v,x)=>v+x.area*x.count*(x.dl+x.sdl),0);q=col.rows.reduce((v,x)=>v+x.area*x.count*x.ll,0);}catch(e){landingErrors=[e.message];g=q=0;}}inheritTruss(tbs[0],up.truss109);tbs[0].points.push({x:contact(point,tbs[0].member).x,g,q,label:FloorLevels.name(p,f+1)+' '+up.member.id,sources101:up.sources101||[],...(up.truss109?.length?{truss109:[...up.truss109]}:{})});tbs[0].errors.push(...landingErrors);}else{const ambiguous=beams.filter(b=>b.kind==='TB'&&contact(point,b.member)),msg=FloorLevels.name(p,f+1)+' 柱 '+up.member.id+' 未找到下层柱或唯一指定 TB'+(ambiguous.length>1?'（相接：'+ambiguous.map(b=>b.member.id).join('、')+'；须明确唯一承托梁）':matches.length>1?'（下层柱截面重叠）':'');issues.push({floor:f,msg});markLanding(point,msg,up.truss109);beams.filter(b=>b.kind==='TB'&&E.overlap(E.columnRect(up.member),E.rect(b.member))).forEach(b=>{b.errors.push(msg);inheritTruss(b,up.truss109);});}}}
   for(const up of wallAbove){const exact=wallGroups.find(w=>w.signature===up.signature);if(exact){exact.g+=up.g;exact.q+=up.q;exact.errors.push(...up.errors);inheritTruss(exact,up.truss109);if(areaTracing)(exact.sources101??=[]).push(...up.sources101||[]);}else{const msg=FloorLevels.name(p,f+1)+' 墙 '+up.member.id+' 未连续：请在 TB 输入其线荷载';issues.push({floor:f,msg});markWallLanding(up,msg);}}
   columnAbove.length=0;wallAbove.length=0;
   for(const c of model.slabs){yield {phase:'传荷',floor:f,id:c.id};const rr=addRow('SLAB',c),o=rr.input,cs=o.slabType==='CS',edgeName=o.csFixedEdge,edgeValid=['left','right','top','bottom'].includes(edgeName),load=(()=>{try{return LoadRegions83.summary(LoadRegions83.pieces(p,f,c));}catch(e){return {dl:null,sdl:null,ll:null,basis:'total',areaName:'荷载区域',inputError:e.message};}})(),dir=slabDirection(p,f,rr.token,c,model),span=dir==='X'?c.x1-c.x0:c.y1-c.y0,width=dir==='X'?c.y1-c.y0:c.x1-c.x0;
    const pieces=LoadRegions83.pieces(p,f,c),netSW=autoSW?LoadRegions83.netSelfWeight(c,model):[];const calculation=slabCalculation(c,dir,model,o),spanData=calculation.automatic,designRectangle=slabGeometry.designRectangle(c,model),originalDL=load.dl;if(autoSW)load.dl=0;rr.displayType=cs?'CS':'SLAB';rr.loading={...load,direction:dir,L:calculation.L,clearSpan:span,effectiveSpan:spanData.effective,spanSegments:spanData.segments,width:calculation.width,clearWidth:width,area:c.area,...(calculation.manual?{manualSpan:calculation.L,calculationWidth:calculation.width,selfWeightBasis:calculation.selfWeight,selfWeightArea:calculation.selfWeightArea}:{}),selfWeightNetArea:netSW.reduce((v,x)=>v+LoadRegions83.area(x),0),originalDL,sw:autoSW?c.thickness/1000*24.5:0,support:cs?'Cantilever':'Simply-supported',fixedEdge:cs?edgeName:null};if(roundLoads183){for(const k of ['sw','dl','sdl','ll'])if(Number.isFinite(rr.loading[k]))rr.loading[k]=BeamLoads.up(rr.loading[k]);rr.loading.factored183=BeamLoads.surface(rr.loading);}let errors=[...areaErrors.filter(e=>e!=='板块荷载区域重复'),...(load.inputError?[load.inputError]:[])];if(calculation.manual&&calculation.errors.length)errors.push(...calculation.errors);if(o.supportConflicts?.some(k=>['slabType','csFixedEdge'].includes(k)))errors.push('同 Framing 各层板支承设置冲突，请重新选择板类型及固定边，统一保存');if(cs&&!edgeValid)errors.push('CS：请选择上／下／左／右固定边');if(!dir)errors.push('等边单向板：请选择 X 或 Y 受力方向');if(!autoSW&&load.basis!=='total')errors.push('旧版 DL 为附加荷载：请在 Loading 确认含结构自重的总 DL 并保存');if(!designRectangle&&!calculation.manual)errors.push('非矩形板块：现有 Excel 单向矩形板输入不适用');const missing=(autoSW?['sdl','ll']:['dl','sdl','ll']).filter(k=>!available(load[k]));if(missing.length)errors.push('Section '+section+'：请在 Loading 的'+load.areaName+'填写 '+missing.map(k=>({dl:'D.L.（含自重）',sdl:'SDL',ll:'LL'}[k])).join('、')+'（kPa，可填 0）');const axis=dir==='X'?1:0,cross=1-axis;
    const supportPlan=supportPlanner().plan(c,dir,model,o);errors.push(...supportPlan.errors);rr.supportSegments132=supportPlan.rows.map(v=>({side:v.side,face:v.face,start:v.start,end:v.end,target:v.value,manual:!!v.manual,error:v.error}));const strips=(dir?slabStrips118(c,dir):[]).map(part=>{const ends=dir==='X'?[[[part.x0,part.y0],[part.x0,part.y1]],[[part.x1,part.y0],[part.x1,part.y1]]]:[[[part.x0,part.y0],[part.x1,part.y0]],[[part.x0,part.y1],[part.x1,part.y1]]];return {part,ends,edges:cs?(edgeValid?[ends[['left','top'].includes(edgeName)?0:1]]:[]):ends};}),supportEdges=strips.flatMap(s=>s.edges);rr.rootMoments=[];rr.slabReactions=[];const transferPieces177=[];
    for(const strip of strips){const {part,ends}=strip,span=dir==='X'?part.x1-part.x0:part.y1-part.y0,spanStart=dir==='X'?part.x0:part.y0,clip=rs=>rs.flatMap(r=>{const hit=LoadRegions83.intersect(r,part);return hit?[{...r,...hit}]:[];}),localPieces=c.rectangular?pieces:clip(pieces),localSW=c.rectangular?netSW:clip(netSW),transfer=areaTracing?null:slabTransfer177(p,f,c,dir,model,o,part,calculation,slabClaims177,transferRegions177??=LoadRegions83.surfaceRegions(p,f,model));if(transfer)transferPieces177.push(...transfer.zones.flatMap(z=>z.pieces));
    for(const [e1,e2]of strip.edges){const candidates=[...(c.netBoundary120?columns.map(v=>({type:'COL',target:v,member:v.member})):[]),...walls.map(w=>({type:'WALL',target:w.group,member:w.member})),...beams.map(b=>({type:'BEAM',target:b,member:b.member}))].filter(v=>slabFace(c,v.member,cross,e1[cross]));const cuts=[e1[axis],e2[axis],...supportPlan.rows.filter(v=>eq(v.face,e1[cross])).flatMap(v=>[v.start,v.end]).filter(v=>v>e1[axis]&&v<e2[axis]),...(transfer?transfer.zones.flatMap(z=>[z.start,z.end,...z.pieces.flatMap(r=>axis===1?[r.y0,r.y1]:[r.x0,r.x1])]):[]),...[...localPieces,...localSW].flatMap(r=>axis===1?[r.y0,r.y1]:[r.x0,r.x1]),...candidates.flatMap(v=>slabFace(c,v.member,cross,e1[cross])).filter(v=>v>e1[axis]&&v<e2[axis])].sort((a,b)=>a-b);let edges=[];for(let j=0;j<cuts.length-1;j++){if(cuts[j+1]-cuts[j]<tol)continue;const mid=[...e1];mid[axis]=(cuts[j]+cuts[j+1])/2;const side=eq(e1[cross],ends[1][0][cross])?'B':'A',match=supportPlanner().resolve(c,dir,o,{side,face:e1[cross],start:cuts[j],end:cuts[j+1],point:mid,options:candidates}),hit=match.hit;if(!hit)continue;edges.push({...hit,start:cuts[j],end:cuts[j+1]});}
     for(const edge of edges){let reaction=LoadRegions83.reaction(localPieces,dir,(edge.start+edge.end)/2,spanStart,span,eq(e1[cross],ends[1][0][cross]),cs,0,autoSW);if(autoSW){const concrete=LoadRegions83.reaction(localSW,dir,(edge.start+edge.end)/2,spanStart,span,eq(e1[cross],ends[1][0][cross]),cs,rr.loading.sw*(areaTracing?1:calculation.selfWeightScale),true);for(const k of ['g','sw','mG'])reaction[k]+=concrete[k];}if(transfer)reaction=slabReaction177(transfer,(edge.start+edge.end)/2,eq(e1[cross],ends[1][0][cross]),cs,{dir,value:rr.loading.sw},autoSW)||reaction;const {good}=reaction,g=BeamLoads.up(reaction.g),q=BeamLoads.up(reaction.q);let design183=null;if(roundLoads183){design183=transfer?slabReaction177(transfer,(edge.start+edge.end)/2,eq(e1[cross],ends[1][0][cross]),cs,{dir,value:rr.loading.sw},autoSW,true):null;if(!design183){const loads=localPieces.map(p=>({...p,load:{...p.load,...BeamLoads.surface(p.load)}}));design183=LoadRegions83.reaction(loads,dir,(edge.start+edge.end)/2,spanStart,span,eq(e1[cross],ends[1][0][cross]),cs,0,autoSW);if(autoSW){const v=LoadRegions83.reaction(localSW,dir,(edge.start+edge.end)/2,spanStart,span,eq(e1[cross],ends[1][0][cross]),cs,BeamLoads.surface({sw:rr.loading.sw*calculation.selfWeightScale}).sw,true);for(const k of ['g','sw','mG'])design183[k]+=v[k];}}for(const k of ['g','q','mG','mQ'])design183[k]=BeamLoads.up(design183[k]);}const factored183=design183?{ug183:design183.g,uq183:design183.q}:{};rr.slabReactions.push({side:eq(e1[cross],ends[1][0][cross])?'B':'A',supportType:edge.type,supportId:edge.member.displayId||edge.member.id,start:edge.start,end:edge.end,g,q,...factored183,length:edge.end-edge.start,good});
      const sources101=areaTracing?localPieces.filter(r=>r.load.ll>tol).map(r=>{const along=dir==='X'?'y':'x',lo=Math.max(r[along+'0'],edge.start),hi=Math.min(r[along+'1'],edge.end);if(hi-lo<=tol)return null;const rect={x0:r.x0,x1:r.x1,y0:r.y0,y1:r.y1};rect[along+'0']=lo;rect[along+'1']=hi;const q=LoadRegions83.reaction([r],dir,(lo+hi)/2,spanStart,span,eq(e1[cross],ends[1][0][cross]),cs,0,false).q;return q>tol?{floor:f,slab:c.id,rect,area:q*(hi-lo)}:null;}).filter(Boolean):[];
      if(cs&&good){const root={floor:f,slab:c.id,slabToken:rr.token,fixedEdge:edgeName,supportType:edge.type,supportId:edge.member.displayId||edge.member.id,start:edge.start,end:edge.end,length:edge.end-edge.start,g,q,mG:reaction.mG,mQ:reaction.mQ};root.mULS=design183?BeamLoads.up(design183.mG+design183.mQ):1.4*root.mG+1.6*root.mQ;root.totalMULS=design183?BeamLoads.up(root.mULS*root.length):root.mULS*root.length;rr.rootMoments.push(root);rootMoments.push(root);if(edge.type==='BEAM')edge.target.csMoments.push(root);}
      if(edge.type==='WALL'||edge.type==='COL'){if(edge.type==='WALL')edge.target.slabs.add(c.id);if(areaTracing)(edge.target.sources101??=[]).push(...sources101);edge.target.g+=g*(edge.end-edge.start);edge.target.q+=q*(edge.end-edge.start);if(!good)edge.target.errors.push(c.id+' 荷载未填');}else{const u=[...e1],v=[...e1];u[axis]=edge.start;v[axis]=edge.end;const start=distance(u,edge.member),end=distance(v,edge.member);if(Math.abs(end-start)<tol)edge.target.points.push({x:Math.max(0,Math.min(L(edge.member),start)),g:g*(edge.end-edge.start),q:q*(edge.end-edge.start),...(design183?{ug183:BeamLoads.up(design183.g*(edge.end-edge.start)),uq183:BeamLoads.up(design183.q*(edge.end-edge.start))}:{}),sources101,label:c.id});else edge.target.lines.push({start:Math.min(start,end),end:Math.max(start,end),g,q,...factored183,sources101,sw:reaction.sw,dl:reaction.dl,sdl:reaction.sdl,label:c.id,...(!areaTracing?{slabLoad179:true,slabSide179:eq(e1[cross],ends[1][0][cross])?'B':'A'}:{})});if(!good||!designRectangle&&!calculation.manual)edge.target.errors.push(c.id+' 荷载／单向板范围未确认');}}
    }}
    const transferErrors=[...new Set(errors)];rr.transferErrors=transferErrors;
    if(errors.length){markEdges(supportEdges.length&&!o.supportConflicts?.length?supportEdges:c.edges,FloorLevels.name(p,f)+' '+c.id+'：'+[...new Set(errors)].join('；'));wallGroups.filter(w=>w.slabs.has(c.id)).forEach(w=>w.errors.push(c.id+' 荷载或支承边未确认'));beams.filter(b=>[...b.lines,...b.points].some(l=>l.label===c.id)).forEach(b=>b.errors.push(c.id+'：'+errors[0]));issues.push({floor:f,msg:c.id+'：'+[...new Set(errors)].join('；')});}
    if(calculation.manual)errors=errors.filter(e=>!supportPlan.errors.includes(e));errors.push(...calculation.errors);
    if(new Set([...pieces,...transferPieces177].map(r=>JSON.stringify(autoSW?[r.load.sdl,r.load.ll]:[r.load.dl,r.load.sdl,r.load.ll]))).size>1&&!areaTracing)errors.push('此板含局部或不同区域荷载：已按实际范围传荷；原 Excel 均布荷载板验算不适用，需单独验算');rr.result=errors.length?{status:'INPUT REQUIRED',fail:[...new Set(errors)],description:'—'}:queue('slab',{kind:cs?'CS':'SLAB',id:c.id,L:calculation.L,h:c.thickness,fcu:cfg.fcu,fire:cfg.fire,dl:load.dl,sdl:load.sdl,ll:load.ll,steel:o.steel,dlIncludesSelfWeight:!autoSW});
   }
   // Design transfer already carries the slab load across the whole receiving beam.
   // Retain geometric surface bookkeeping only for the existing Area/Section A path.
   if(areaTracing||section==='A')addBeamSurface(p,f,model,beams,autoSW,areaTracing,slabClaims177);
   addColumnSurface(p,f,model,columns,autoSW,areaTracing,slabClaims177);
   function solve(b,path=new Set()){if(b.done)return;if(path.has(b)){for(const item of path)item.errors.push('梁之间形成相互支承，简支传荷顺序不明确');b.errors.push('梁之间形成相互支承，简支传荷顺序不明确');return;}path=new Set(path);path.add(b);for(const child of beams.filter(x=>x.sinks.some(s=>s?.target===b)))solve(child,path);if(b.done)return;const c=b.member,rr=addRow(b.kind,c),o=resolvedInput(p,r,f,c),span=beamSpan(c,o),len=span.value,scaled=beamSpanLoads(span,areaTracing?b.lines:fullSpanSlabLoads179(b.lines,span.automatic),b.points),manual=o.mode==='manual'&&!b.truss109?.length,isCB=c.displayKind==='CB',table=Array.isArray(o.beamLoads)?BeamLoads.resolve(o,len):null;let gd=0,ql=0,points=scaled.points.map(x=>({...x})),error=[...b.errors];b.lines=scaled.lines;b.points=scaled.points;b.row=rr;inheritTruss(b,b.truss109);if(b.truss109?.length&&o.mode==='manual')error.push('此梁承接桁架反力，须恢复自动传荷模式，避免覆盖反力或掩盖上游不完整输入');
    const replacement=tt?.replaced(f,b);if(replacement){tt.rejectDirect(replacement,b,o);b.done=true;rr.replacedByTruss=replacement.t.id;rr.result={status:'REPLACED',fail:[],description:replacement.t.name+' 独立桁架设计'};if(replacement.errors.length)traceProblem(b,replacement.errors.join('；'));return;}
    if(manual){error=[...b.supportErrors,...b.errors.filter(x=>x.includes('相互支承'))];if(isCB&&!['a','z'].includes(o.fixedEnd))error.push('CB：'+cbRoot(p,r,f,c).message);if(table){error.push(...table.errors);}else if(!available(o.udlDead)||!available(o.udlLive))error.push('请填写手动线荷载 G、Q（含结构自重）');else {gd+=o.udlDead;ql=o.udlLive;}points=[];if(areaTracing)error.push('使用手动总荷载，无法对应自动承载面积');}
    if(span.error)error.push(span.error);
    // Slab regions produce exact piecewise uniform line loads; do not average them.
    if(!table&&o.extraDead!==undefined&&o.extraDead!==null){if(!available(o.extraDead))error.push('附加线恒载须不小于 0');else gd+=o.extraDead;}
    if(!table&&o.points!=null&&!Array.isArray(o.points))error.push('集中荷载记录格式无效，请重新输入');for(const x of !table&&Array.isArray(o.points)?o.points:[]){if(!x||!available(x.x)||x.x>len||!available(x.g)||!available(x.q))error.push('集中荷载位置／G／Q 无效');else points.push({...x,label:x.label||'手动集中荷载'});}
    if(table){if(!manual)error.push(...table.errors);points.push(...table.points);}
    const swParts=(manual?table?.selfWeight:autoSW)?beamSelfWeight(c,len):[],uniformSW=swParts.length===1&&swParts[0].start===0&&eq(swParts[0].end,len)?swParts[0].g:0,varyingSW=uniformSW?[]:swParts;const uniform183={g:BeamLoads.up([manual&&!table?o.udlDead:0,!table?o.extraDead:0,uniformSW].reduce((sum,v)=>sum+BeamLoads.factored({g:v||0,q:0}).g,0)),q:BeamLoads.factored({g:0,q:ql}).q};gd+=uniformSW;
    gd=BeamLoads.up(gd);ql=BeamLoads.up(ql);points=points.map(BeamLoads.rounded);if(table){table.lines=table.lines.map(BeamLoads.rounded);table.points=table.points.map(BeamLoads.rounded);}
    if(isCB&&o.fixedEnd==='z')points=points.map(x=>({...x,x:len-x.x}));rr.loading={L:span.error?null:len,...(span.manual?{automaticSpan:span.automatic,manualSpan:span.value}:{}),fixedEnd:isCB?o.fixedEnd:null,rootSelection:isCB?cbRoot(p,r,f,c):null,sw:uniformSW,selfWeight:swParts.reduce((v,x)=>v+x.g*(x.end-x.start),0),selfWeightLines:swParts,automaticLines:[...b.lines,...varyingSW],automaticPoints:b.points.map(x=>({...x})),udlDead:gd,udlLive:ql,points,surfaceArea:b.surfaceArea||0,mode:manual?'手动总荷载':'自动传荷',support:isCB?'Cantilever':'Simply-supported',sources:manual?[]:b.lines};
    rr.supportMoments=b.csMoments;rr.cbSupportMoments=b.cbMoments;const designErrors=isCB&&o.cover!=null&&(!Number.isFinite(o.cover)||o.cover<=0)?['CB 手动保护层 cover 须大于 0；留空按 FRR 自动取值']:[];
    if(b.cbMoments.length)designErrors.push('承托 CB '+b.cbMoments.map(x=>x.id).join('、')+' 根部：竖向反力已传入；根部弯矩及梁系抗扭尚未分析，须另行计算');
    if(b.csMoments.some(x=>x.mULS>tol))designErrors.push('承托 CS '+[...new Set(b.csMoments.map(x=>x.slab))].join('、')+'：竖向传荷已算；固定边弯矩会作用于承托梁，梁系抗扭及节点尚未分析，须另行计算');
    if(error.length)issues.push({floor:f,msg:c.id+'：'+[...new Set(error)].join('；')});
    if(error.length)rr.result={status:'INPUT REQUIRED',fail:[...new Set(error)],description:'—'};else try{const lines=[...(manual?[]:b.lines),...varyingSW,...(table?.lines||[])].map(l=>isCB&&o.fixedEnd==='z'?{...l,start:len-l.end,end:len-l.start}:l);rr.actions=actions(len,gd,ql,points,isCB,lines,roundLoads183?{uniform:uniform183}:null);rr.loading.lines=lines;rr.result=designErrors.length?{status:'INPUT REQUIRED',fail:designErrors,description:'竖向传荷已计算；构件设计待补'}:queue('beam',{kind:isCB?'CB':b.kind,L:len,b:c.b*1000,h:c.d*1000,fcu:b.kind==='TB'?cfg.tbFcu:cfg.fcu,fire:b.kind==='TB'?cfg.tbFire:cfg.fire,cover:o.cover??undefined,M:rr.actions.M,V:rr.actions.V,T:o.torsion??0,steel:o.steel});}catch(e){rr.result={status:'INPUT REQUIRED',fail:[e.message],description:'—'};}
    function traceTo(i){if(!areaTracing||!rr.actions)return [];const out=[],reverse=isCB&&o.fixedEnd==='z',take=v=>isCB?v.live.left:i?v.live.right:v.live.left;for(const l of b.lines)for(const x of l.sources101||[]){const line={start:reverse?len-l.end:l.start,end:reverse?len-l.start:l.end,g:0,q:x.area/(l.end-l.start)},area=take(actions(len,0,0,[],isCB,[line]));if(area>tol)out.push({...x,area});}for(const pt of b.points)for(const x of pt.sources101||[]){const area=take(actions(len,0,0,[{x:reverse?len-pt.x:pt.x,g:0,q:x.area}],isCB));if(area>tol)out.push({...x,area});}return out;}
    b.done=true;const ac=rr.actions,err=ac?null:c.id+' 荷载未完整';if(isCB){const idx=o.fixedEnd==='z'?1:0;if(!b.sinks[idx])issues.push({floor:f,msg:c.id+' 固定端反力未找到传荷对象，柱自动累计荷载待确认'});if(ac&&b.sinks[idx]?.type==='BEAM')b.sinks[idx].target.cbMoments.push({id:c.id,mG:ac.dead.M,mQ:ac.live.M,mULS:ac.M});send(b.sinks[idx],ac?.totalDead||0,ac?.totalLive||0,err,c.id,idx?'B':'A',traceTo(idx),b.truss109,ac?.rounded183?{ug183:ac.factoredDead.left,uq183:ac.factoredLive.left}:null);}else for(let i=0;i<2;i++){if(!b.sinks[i])issues.push({floor:f,msg:c.id+' 端部反力未找到传荷对象，柱自动累计荷载待确认'});send(b.sinks[i],ac?.dead[i?'right':'left']||0,ac?.live[i?'right':'left']||0,err,c.id,i?'B':'A',traceTo(i),b.truss109,ac?.rounded183?{ug183:ac.factoredDead[i?'right':'left'],uq183:ac.factoredLive[i?'right':'left']}:null);}
   }
   for(const b of beams){yield {phase:'传荷',floor:f,id:b.member.id};solve(b);}
   tt?.solveFloor(f);tt?.receive(f,columns);const failedSources=beams.filter(b=>!b.row?.actions&&!b.row?.replacedByTruss);for(const b of failedSources)traceProblem(b,FloorLevels.name(p,f)+' '+(b.member.displayId||b.member.id)+'：'+[...new Set(b.row?.result.fail||b.errors)].join('；'));
   for(const c of columns){const rr=addRow('COL',c.member,{sources101:c.sources101||[],...(c.truss109?.length?{truss109:c.truss109}:{})}),o=rr.input,manual=o.mode==='manual'&&!c.truss109?.length,areaMode=o.mode==='area'&&!c.truss109?.length;let areaCalc=null,gd=c.g,ql=c.q,err=[...c.errors];if(c.truss109?.length&&['manual','area'].includes(o.mode))err.push('此柱承接桁架反力，须恢复自动累计模式，避免覆盖反力');if(manual){err=[];gd=o.dead;ql=o.live;if(!available(gd)||!available(ql))err.push('请填写柱累计 G、Q（含自重）');}if(areaMode){try{areaCalc=columnAreaLoads(p,r,f,o,section);gd=areaCalc.dead;ql=areaCalc.live;err=areaCalc.errors;}catch(e){err=[e.message];gd=ql=0;}}rr.loading={dead:gd,live:ql,selfWeight:0,surfaceArea:c.surfaceArea||0,areaCalculation:areaCalc,mode:c.truss109?.length?'TT 反力＋逐层累计 G/Q':areaMode?'手动面积备用':manual?'手动累计荷载':'逐层自动累积'};rr.result=err.length?{status:'INPUT REQUIRED',fail:[...new Set(err)],description:'—'}:queue('column',{id:c.member.id,b:c.member.b*1000,h:c.member.d*1000,height:LocalHeights96.columnHeight(p,r,f,c.member),factor:o.factor??cfg.columnFactor,fcu:cfg.columnFcu,ratio:cfg.columnRatio,projectFactor:cfg.columnProject,dead:gd,live:ql,system:o.system||'Braced',steel:o.steel});columnAbove.push({...c,g:available(gd)?gd:0,q:available(ql)?ql:0,errors:err});}
   for(const w of wallGroups)wallAbove.push({...w,g:w.g});rows.push(...local.filter(x=>!x.replacedByTruss));
  }
  for(const rr of rows){yield {phase:'验算',floor:rr.floor,id:rr.id};rr.checked=p.explorer?.selected?.[rr.floor+'|'+rr.token]===true;
   // Column design uses the same area schedule as Section A. This is applied
   // after physical reactions are propagated, so beam loading is unaffected.
   if(!areaTracing&&rr.kind==='COL'&&rr.checked){
    rr.loading.transferDead=rr.loading.dead;rr.loading.transferLive=rr.loading.live;rr.loading.transferErrors=rr.result.status==='INPUT REQUIRED'?[...rr.result.fail]:[];
    try{const a=Reports.columnA(p,rr,r),dead=a.rows.reduce((s,x)=>s+x.area*x.count*(x.dl+x.sdl),0),live=a.rows.reduce((s,x)=>s+x.area*x.count*x.ll,0),o=rr.input;
     rr.columnA=a;rr.loading={...rr.loading,dead,live,areaCalculation:{...a,dead,live},mode:rr.truss109?.length?'TT 反力＋逐层累计 G/Q':'面积法 · A / B 共用 DL、SDL、LL'};
     const columnErrors=[...new Set(a.errors)];rr.result=columnErrors.length?{status:'INPUT REQUIRED',fail:columnErrors,description:'面积法输入待补'}:queue('column',{id:rr.id,b:rr.member.b*1000,h:rr.member.d*1000,height:LocalHeights96.columnHeight(p,r,rr.floor,rr.member),factor:o.factor??cfg.columnFactor,fcu:cfg.columnFcu,ratio:cfg.columnRatio,projectFactor:cfg.columnProject,dead,live,system:o.system||'Braced',steel:o.steel});
    }catch(e){rr.result={status:'INPUT REQUIRED',fail:[e.message],description:'面积法输入待补'};}
   }
rr.loadErrors=rr.result.status==='INPUT REQUIRED'?rr.result.fail:[];if(rr.checked&&rr.result.pendingCheck){const {method,o}=rr.result.pendingCheck;rr.result=E.clone(design(method,o));if(['MB','SB'].includes(rr.kind)&&rr.member.displayKind!=='CB'){const max=BeamSizing83.limit(p,E.floorModel(r,rr.floor,rr.framing),rr.member),width=rr.member.b*1000;if(width>max+1e-6){rr.result.widthViolation=true;rr.result.status='NOT OK';rr.result.fail.push('梁宽 '+width.toFixed(1)+' mm 超过'+(rr.kind==='SB'?' Structural Depth':'相接柱宽')+'上限 '+max.toFixed(1)+' mm');}else if(rr.result.status!=='OK'&&width+50>max+1e-6)rr.result.fail.push('梁宽上限 '+max.toFixed(1)+' mm；下一步加宽 50 mm 将超限，仍未通过');}}else if(!rr.checked){rr.loadErrors=rr.result.status==='INPUT REQUIRED'?rr.result.fail:[];rr.result={status:'NOT SELECTED',fail:[],description:'未勾选 Check'};}}
  return {section,rootMoments,trusses:tt?.results||[],reportA:p.explorer?.reportA||{},reportB:p.explorer?.reportB||{},rows:rows.sort((a,b)=>a.floor-b.floor),issues,settings:cfg,assumptions:!autoSW?'Section A 沿用已保存的 D.L. 含自重口径，另加 SDL、LL，不再重复加入自重。':'普通板自动寻找完整的相对两边支承，两组均完整时选短跨；显式指定的 CS 按所选固定边作悬臂板，全部反力传到该边，根部弯矩单列。承托梁抗扭、墙及节点抗弯未在此分析；MB、SB、TB 默认按简支梁计算。CB 按选定根部的悬臂梁计算。柱验算采用与 Section A 共用的几何半跨面积及总 DL、SDL、LL；梁传荷另按支承模型检查。Section B：板自重按梁／墙侧面之间净面积、梁自重按全截面及 24.5 kN/m³ 计算；梁荷载向上取两位小数后计算，另加 SDL、LL；已保存的面荷载 D.L. 不再计入 Section B。手动总荷载仍按含自重的完整输入使用。配筋与检查沿用 Excel v106 Section B。',source:'Section A RC - Section B v106 Loading.xlsm'};
 }
 function parseColumnAreaRows(text,p,floor){if(!String(text||'').trim())return [];const rows=[];for(const [i,line]of String(text).trim().split(/\r?\n/).entries()){if(!line.trim())continue;const a=line.split(/[,，]/).map(x=>x.trim()),direct=/^A\s*=/i.test(a[2]||'');if(direct?a.length<3||a.length>4:a.length<4||a.length>5)throw Error('A 柱面积第 '+(i+1)+' 行：起始层, 结束层, A=面积m², 可选区域；或原 B,D 格式');const lo=Number(a[0]),hi=Number(a[1]),b=direct?null:Number(a[2]),d=direct?null:Number(a[3]),area=direct?Number(a[2].replace(/^A\s*=/i,'')):b*d;if(!Number.isInteger(lo)||!Number.isInteger(hi)||lo<floor||hi>p.total||hi<lo||!Number.isFinite(area)||area<=0||!direct&&(!(b>0)||!(d>0)))throw Error('A 柱面积第 '+(i+1)+' 行：楼层范围或面积无效');rows.push({lo,hi,b,d,area,areaName:a[direct?3:4]||'',manualArea:direct});}return rows;}

 function columnAreaLoads(p,result,f,o,section='B'){const groups=parseColumnAreaRows(o.sectionAAreas,p,f),errors=[],rows=[],isA=section==='A';let dead=0,live=0;
  if(!groups.length)errors.push('面积备用：请填写承载面积及楼层范围');
  for(const x of groups)for(let n=x.lo;n<=x.hi;n++){let load=floorload(p,n),panels=E.floorModel(result,n).slabs;
   if(x.areaName){const matches=LD.areas(p,n).filter(a=>a.name===x.areaName||a.id===x.areaName);if(matches.length!==1){errors.push(FloorLevels.name(p,n)+' 未找到唯一荷载区域 '+x.areaName);continue;}load={...matches[0],basis:matches[0].basis||load.basis};panels=panels.filter(c=>matches[0].rects?c.rects.some(r=>matches[0].rects.some(q=>LoadRegions83.intersect(r,q))):matches[0].panels.includes(token('SLAB',c)));}
   if(isA&&load.basis!=='total'){errors.push(FloorLevels.name(p,n)+' 面积备用：旧版 DL 为附加荷载，请在 Loading 确认含结构自重的总 DL 并保存');continue;}const ll=LD.live(load),thicknesses=[...new Set(panels.map(c=>c.thickness))],automatic=o.areaSlabSW==null,sw=isA?load.dl:automatic?(thicknesses.length===1?thicknesses[0]/1000*24.5:null):o.areaSlabSW;
   if(!available(sw))errors.push(FloorLevels.name(p,n)+' 面积备用：'+(isA?'请在 Loading 填 A 总 DL':'板厚不唯一或无板块，请填写该柱的 B 板自重 kPa'));
   if(!available(load.sdl)||!available(ll))errors.push(FloorLevels.name(p,n)+' 面积备用：请在 Loading 填 SDL、LL');
   const area=x.area??x.b*x.d;if(available(sw)&&available(load.sdl)&&available(ll)){const g=area*(sw+load.sdl),q=area*ll;dead+=g;live+=q;rows.push({floor:n,area,areaName:x.areaName,sw,sdl:load.sdl,ll,dead:g,live:q,automaticSW:automatic});}
  }
  if(!isA){if(!available(o.areaExtraDead))errors.push('面积备用：请补 B 梁等结构自重合计 kN（上述楼层范围，无则明确填 0）');else dead+=o.areaExtraDead;}
  return {dead,live,rows,extraDead:isA?0:o.areaExtraDead,errors:[...new Set(errors)]};
 }

 // Column geometry is measured before loads and does not depend on beam reactions.
 function columnAreas(p,result,f,target){return ColumnAreas103.calculate(p,result,f,target);}

 function slabFace(c,b,cross,coordinate){return c.netBoundary120?slabGeometry.face(b,cross,coordinate):eq(a(b)[cross],coordinate)&&eq(z(b)[cross],coordinate)?[Math.min(a(b)[1-cross],z(b)[1-cross]),Math.max(a(b)[1-cross],z(b)[1-cross])]:null;}
 function slabContact(c,b,cross,point){const face=slabFace(c,b,cross,point[cross]);return face&&point[1-cross]>=face[0]-tol&&point[1-cross]<=face[1]+tol;}
 function slabWinner(c,candidates,cross,point){for(const type of ['COL','WALL','BEAM']){const hits=candidates.filter(v=>v.type===type&&slabContact(c,v.member,cross,point));if(hits.length){const sides=type==='COL'?hits:hits.filter(v=>Math.abs(v.member.a[cross]-v.member.z[cross])<tol),owners=sides.length?sides:hits;return owners.length===1?owners[0]:null;}}return null;}
 function oppositeSupports(model,c,dir){if(!model||!c.rectangular)return false;const axis=dir==='X'?1:0,cross=1-axis,lo=dir==='X'?c.y0:c.x0,hi=dir==='X'?c.y1:c.x1;
  return (dir==='X'?[c.x0,c.x1]:[c.y0,c.y1]).every(coordinate=>{const members=[...(c.netBoundary120?model.columns.filter(c=>c.status!=='上层柱').map(member=>({type:'COL',member})):[]),...model.walls.map(member=>({type:'WALL',member})),...model.beams.map(member=>({type:'BEAM',member}))].filter(v=>slabFace(c,v.member,cross,coordinate)),cuts=[lo,hi,...members.flatMap(v=>slabFace(c,v.member,cross,coordinate)).filter(x=>x>lo&&x<hi)].sort((x,y)=>x-y);
   for(let i=1;i<cuts.length;i++){if(cuts[i]-cuts[i-1]<tol)continue;const q=[];q[axis]=(cuts[i]+cuts[i-1])/2;q[cross]=coordinate;if(!slabWinner(c,members,cross,q))return false;}return true;});
 }

 // Resolve an equal-span panel only from independently known directions in its
 // enclosing primary-beam/wall bay. Never use inferred peers as new evidence.
 function slabDirection(p,f,t,c,model){
  const own=slabOwnDirection161(p,f,t,c,model);
  if(own||!c.netBoundary120||input(p,f,t).slabType==='CS')return own;
  model??=E.floorModel(E.generate(p),f);
  const inside=(s,b)=>s.x0>=b[0]-tol&&s.x1<=b[1]+tol&&s.y0>=b[2]-tol&&s.y1<=b[3]+tol;
  const bays=[...new Map((model.panels||[]).filter(b=>inside(c,b)).map(b=>[b.map(nice).join(','),b])).values()];
  if(bays.length!==1)return null;
  const known=new Set();
  for(const peer of model.slabs||[]){
   if(peer===c||!inside(peer,bays[0]))continue;
   const pt=token('SLAB',peer);if(input(p,f,pt).slabType==='CS')continue;
   const dir=slabOwnDirection161(p,f,pt,peer,model);if(dir)known.add(dir);
   if(known.size>1)return null;
  }
  return known.size===1?[...known][0]:null;
 }
 // Use the same support-centre dimensions as the slab calculation when both axes resolve.
 function slabAutoDimensions184(c,model){const clear=[c.x1-c.x0,c.y1-c.y0];if(!c.netBoundary120||!c.rectangular||!model?.beams||!model?.walls||!model?.columns||!(c.thickness>0))return clear;const spans=['X','Y'].map(dir=>slabSpan(c,dir,model).effective);return spans.every(v=>v>0)?spans:clear;}
 function slabOwnDirection161(p,f,t,c,model){if(c.direction101&&!c.direction116&&!c.shortSpan116&&!input(p,f,t).direction)return c.direction101;const o=input(p,f,t);if(o.slabType==='CS'){if(['left','right'].includes(o.csFixedEdge))return 'X';if(['top','bottom'].includes(o.csFixedEdge))return 'Y';return null;}if(['X','Y'].includes(c.direction116))return c.direction116;if(c.netBoundary120&&['X','Y'].includes(o.direction))return o.direction;model??=E.floorModel(E.generate(p),f);const [sx,sy]=slabAutoDimensions184(c,model);if(c.netBoundary120&&Math.abs(sx-sy)<tol)return null;const short=sx<=sy?'X':'Y',other=short==='X'?'Y':'X';if(c.shortSpan116||c.netBoundary120)return short;model??=E.floorModel(E.generate(p),f);return oppositeSupports(model,c,short)?short:oppositeSupports(model,c,other)?other:short;}
 // Slab inspection has no upper-floor dependencies; only expose its slab row,
 // never the partial column/beam accumulation from this single-floor preview.
 // Inspect every current member without changing the user's Check/report selections.
 function audit(p,r){const steps=auditSteps(p,r);let next;do{next=steps.next();}while(!next.done);return next.value;}
 function* auditSteps(p,r){
  const q=E.clone(p),ex=init(q);ex.selected={};for(const f of r.floors)for(const m of members(q,r,f.n))if(m.kind!=='COL'||m.member.status!=='上层柱')ex.selected[f.n+'|'+m.token]=true;
  const out=yield* runSteps(q,r,'B'),items=[],zones=new Map();
  const add=(row,status,reasons,path,recommendation)=>{if(!reasons.length)return;items.push({floor:row.floor,framing:row.framing||r.floors[row.floor-1]?.type,id:row.id,token:row.token,kind:row.displayType||row.member?.displayKind||row.kind,status,path,reasons:[...new Set(reasons)],...(recommendation?{recommendation,columnKey:E.columnPositionKey(row.member)}:{})});};
  for(const row of out.rows){yield {phase:'汇总',floor:row.floor,id:row.id};if(!row.checked)continue;const s=row.result.status||'ERROR';if(!/^OK(?:$|[ (])/.test(s)){const advice=row.kind==='COL'?S.columnAdvice(row.result):null;add(row,s,advice?.reasons||(row.result.fail?.length?row.result.fail:[row.result.description||s]),'Check',advice?.recommendation);}
   const transfer=row.kind==='COL'?row.loading.transferErrors:row.transferErrors;if(transfer?.length)add(row,'TRANSFER PENDING',transfer,'传荷');
   if(['MB','SB','TB','CB'].includes(row.kind)){if(!zones.has(row.floor))zones.set(row.floor,LocalHeights96.zones(q,row.floor));const box=slabGeometry.box(E.rect(row.member)),hits=zones.get(row.floor).filter(z=>LocalHeights96.overlap(z.rect,box)>1e-7),limit=hits.length?Math.min(...hits.map(z=>z.sh??0)):r.floors[row.floor-1].sh,depth=row.member.d*1000;if(Number.isFinite(limit)&&depth>limit+tol)add(row,'HEIGHT',[`梁深 ${depth.toFixed(0)} mm 超过本构件所在区域结构高度 ${limit.toFixed(0)} mm`],'结构高度');}
  }
  for(const issue of r.issues||[]){const fs=issue.floor?[r.floors[issue.floor-1]]:r.floors.filter(f=>!issue.type||f.type===issue.type);for(const f of fs.filter(Boolean)){const row=out.rows.find(v=>v.floor===f.n&&[v.id,v.member.id].includes(issue.id));add(row||{floor:f.n,framing:f.type,id:issue.id||'模型',kind:'MODEL'},'MODEL',[issue.msg],'模型');}}
  return {items:items.sort((a,b)=>a.floor-b.floor||a.id.localeCompare(b.id)),total:out.rows.filter(r=>r.checked).length};
 }
 function inspectSlab(p,r,f,t){if(!Number.isInteger(f)||f<1||f>p.total||!E.floorModel(r,f).slabs.some(s=>token('SLAB',s)===t))throw Error('板块已变化，请重新选择');const preview=E.clone(p);init(preview).selected={[f+'|'+t]:true};return run(preview,r,'B',false,f).rows.find(row=>row.floor===f&&row.kind==='SLAB'&&row.token===t);}
 return {slabTransfer177,slabReaction177,fullSpanSlabLoads179,columnLoadPoint,slabStrips118,slabFace,slabWinner,audit,auditSteps,slabCalculation,beamSpan,beamSpanLoads,slabSpan,inspectSlab,columnAreaGroups,supportSummary,contact,parseColumnAreaRows,columnAreaLoads,sharedSupportKeys,framingFloors,saveFramingSupports,clearFramingRecord,oppositeSupports,supportOptions,manualSupport,columnAreas,supportModel,cbRoot,beamSelfWeight,slabDirection,settings,defaults,init,input,members,floorload,token,run,actions};
})();
if(typeof module!=='undefined')module.exports=Loading;
