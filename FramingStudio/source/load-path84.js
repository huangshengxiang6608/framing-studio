// Geometric section and qualitative load-path illustrations; no replacement analysis.
const LoadPath84=(()=>{
 let positionOpen=false;
 document.addEventListener('toggle',e=>{if(e.target.id==='lp84-position-fold'&&e.target.isConnected)positionOpen=e.target.open;},true);
 const C={black:'#000000',blue:'#0057b8',red:'#c00000',green:'#008000'},esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function settings(p,model){
  const first=model.floors[0]?.type||Object.keys(p.types)[0],saved=p.explorer?.loadPath84||{},n=model.floors.length,axis=(direction)=>Engine.axes(p,direction.toLowerCase(),first);
  const cut=(key,dir)=>{const a=saved.cuts?.[key]||{},d=a.axis==='X'||a.axis==='Y'?a.axis:dir,list=axis(d);return {axis:d,at:Number.isFinite(a.at)?a.at:list[Math.floor(list.length/2)]?.v||0};};
  const picks={vertical:['one','two','both'].includes(saved.picks?.vertical)?saved.picks.vertical:'both',horizontal:['one','two','both'].includes(saved.picks?.horizontal)?saved.picks.horizontal:'both'};
  return {cuts:{one:cut('one','Y'),two:cut('two','X')},picks,lo:Math.max(1,Math.min(n,saved.lo||1)),hi:Math.max(1,Math.min(n,saved.hi||n)),face:saved.face==='D'?'D':'B',replace:{vertical:true,horizontal:true},note:saved.note||'',grids:true,heights:true,tags:true};
 }
 function controls(p,model){const v=settings(p,model),select=(id,value,options)=>'<select id="lp84-'+id+'">'+options.map(([a,b])=>'<option value="'+a+'" '+(a===String(value)?'selected':'')+'>'+esc(b)+'</option>').join('')+'</select>',floors=model.floors.map(f=>[String(f.n),FloorLevels.name(p,f.n)]);return '<details class="wp-card lp-position-fold" id="lp84-position-fold" '+(positionOpen?'open':'')+'><summary>剖面位置</summary><div class="wp-grid">'+['one','two'].map((k,i)=>'<label>Section '+(i+1)+'–'+(i+1)+' · 剖切方向'+select(k+'-axis',v.cuts[k].axis,[['Y','X 向 · 固定 Y 坐标'],['X','Y 向 · 固定 X 坐标']])+'</label><label>剖切坐标 · m<input id="lp84-'+k+'-at" type="number" step="0.1" list="lp84-axes-'+k+'" value="'+v.cuts[k].at+'"><datalist id="lp84-axes-'+k+'">'+Engine.axes(p,v.cuts[k].axis.toLowerCase(),model.floors[v.lo-1].type).map(a=>'<option value="'+a.v+'">'+esc(a.id)+' 轴</option>').join('')+'</datalist></label>').join('')+'<label>起始层'+select('lo',v.lo,floors)+'</label><label>结束层'+select('hi',v.hi,floors)+'</label></div></details><section class="wp-card"><h2>带入 Section A</h2><div class="wp-grid">'+['vertical','horizontal'].map(k=>'<label>'+k[0].toUpperCase()+k.slice(1)+' 使用的剖面'+select(k+'-pick',v.picks[k],[['both','两张都加入'],['one','Section 1–1'],['two','Section 2–2']])+'</label>').join('')+'<label>Horizontal · Overall 荷载面'+select('face',v.face,[['B','B'],['D','D']])+'</label><label>图注<input id="lp84-note" value="'+esc(v.note)+'" maxlength="180"></label></div><p class="wp-sub">设置随项目保存；重新生成 A 抄时读取最新模型。固定 Load Transfer Mechanism 和原照片说明文字保留。箭头表示传力示意。</p></section>';}
 function readControls(p,m){const v=settings(p,m),el=k=>document.getElementById('lp84-'+k);for(const key of ['one','two']){v.cuts[key].axis=el(key+'-axis').value;const a=el(key+'-at').value;if(a===''||!Number.isFinite(+a))throw Error('请输入有效剖切坐标');v.cuts[key].at=+a;}for(const key of ['lo','hi'])v[key]=+el(key).value;if(v.lo>v.hi)throw Error('起始层不能高于结束层');for(const k of ['vertical','horizontal']){v.picks[k]=el(k+'-pick').value;v.replace[k]=true;}for(const k of ['grids','heights','tags'])v[k]=true;v.face=el('face').value;v.note=el('note').value;return v;}
 function diagram(p,model,kind,which='one',report111=false){const settings84={...settings(p,model),...(report111?{grids:false,heights:false}:{})},opt={...settings84.cuts[which],face:settings84.face,note:settings84.note},index=opt.axis==='X'?0:1,along=1-index,all=model.floors.filter(f=>f.n>=settings84.lo&&f.n<=settings84.hi),shapes=[],lines=[],members=[];
  let fixed=false;const text=(s,x,y,w=100,size=8,color=C.black)=>shapes.push({fixed,type:'text',text:String(s),x,y,w,h:16,size,color});
  const line=(x,y,x2,y2,color=C.blue,width=1,arrow=false)=>shapes.push({fixed,type:'line',x,y,x2,y2,color,width,arrow});
  const rect=(x,y,w,h,color=C.blue,width=1)=>shapes.push({type:'rect',x,y,w:Math.max(.8,w),h:Math.max(.8,h),color,width});
  const bounds=[];for(const f of all)for(const a of Engine.axes(p,along?'y':'x',f.type))bounds.push(a.v);const lo=Math.min(...bounds),hi=Math.max(...bounds),height=LocalHeights96.extent(p,settings84.lo,settings84.hi)-LocalHeights96.levels(p)[settings84.lo-1],baseLevel=FloorLevels.base(p),offset=model.floors.filter(f=>f.n<settings84.lo).reduce((n,f)=>n+f.h,0),base=baseLevel===null?null:baseLevel+offset,X=x=>92+(x-lo)*230/Math.max(1,hi-lo),Y=z=>322-z*270/Math.max(1,height);
  text('Section '+(which==='one'?'1–1':'2–2')+' · '+opt.axis+' = '+opt.at.toFixed(1)+' m',20,5,310,10,C.blue);
  if(settings84.grids||report111){const axes=Engine.axes(p,along?'y':'x',all[0].type);for(const a of axes)if(settings84.grids){const x=X(a.v);shapes.push({type:'ellipse',x:x-5,y:24,w:10,h:10,color:C.black,width:.7});shapes.push({type:'text',text:a.id,x:x-5,y:24,w:10,h:10,size:6,color:C.black,center:true});line(x,34,x,42,C.black,.6);}for(let i=1;i<axes.length;i++)text((axes[i].v-axes[i-1].v).toFixed(1)+' m',X((axes[i].v+axes[i-1].v)/2)-12,35,45,6);}
  let elevation=0;const cut=opt.at;
  function sectionSegment(a,b,width){const qa=a[index],qb=b[index];if(Math.abs(qa-qb)<1e-8){return Math.abs(qa-cut)<=width/2+.001?[Math.min(a[along],b[along]),Math.max(a[along],b[along])]:null;}const t=(cut-qa)/(qb-qa);if(t<0||t>1)return null;const v=a[along]+t*(b[along]-a[along]);return[v-width/2,v+width/2];}
  for(const f of all){const m=Engine.floorModel(model,f),z0=elevation,z1=elevation+f.h;elevation=z1;const py=Y(z1),bottom=Y(z0);
   if(settings84.heights){text(FloorLevels.name(p,f.n),0,py-7,48,6);text(f.h.toFixed(1)+' m',29,(py+bottom)/2-4,28,6);}
   const solids=LocalHeights96.solids(p,model,f.n,m,settings84.hi).filter(s=>{const r=s.r,q=s.member,ref=s.kind==='COL'?(index?q.y:q.x):q.rawA&&q.rawA[index]===q.rawZ[index]?q.rawA[index]:NaN;return q.on!==false&&(Math.abs((index?r.y:r.x)-cut)<=(index?r.d:r.w)/2+.001||Math.abs(ref-cut)<.001);});
   const floors=new Map(),drawn=new Set();let transferLabel=false;
   for(const s of solids){const r=s.r,q=s.member,a=(along?r.y:r.x)-(along?r.d:r.w)/2,b=a+(along?r.d:r.w),yt=Y(s.z1-offset),yb=Y(s.z0-offset),k=s.kind;
    if(k==='COL'&&q.status==='上层柱'&&f.n>=settings84.hi)continue;
    if(k==='COL'||k==='WALL'){
     // One centre line per structural support, irrespective of its real B / D.
     const center=k==='COL'?(along?(q.cy??q.y):(q.cx??q.x)):(a+b)/2,key=k+'|'+s.id+'|'+center+'|'+s.z0+'|'+s.z1;
     if(drawn.has(key))continue;drawn.add(key);line(X(center),yt,X(center),yb,k==='WALL'?C.black:C.blue,k==='WALL'?1.5:1);
     shapes[shapes.length-1].schematic108=k;members.push([k==='COL'?'column':'wall',f.n,s.id,center]);
     if(k==='COL'&&settings84.tags&&(q.status==='上层柱'||f.n>1&&TransferMarkers83.landing(p,model,f.n-1).some(t=>Math.hypot(t.column.x-q.x,t.column.y-q.y)<1e-6)))text('TC',X(center)+4,yt+5,25,6,C.red);
     if(kind==='vertical'&&yb-yt>8)line(X(center),yt+3,X(center),yb-2,C.red,.9,true);
    }else if(k==='TB'){
     // Transfer beams are schematic hatched strips, not actual-depth cross sections.
     const key=s.id+'|'+a+'|'+b+'|'+s.z1;if(drawn.has(key))continue;drawn.add(key);
     rect(X(a),yt-3,Math.max(4,X(b)-X(a)),4,C.red,1.2);shapes[shapes.length-1].schematic108='TB';
     for(let x=X(a)+2;x<X(b)-2;x+=7)line(x,yt+1,x+4,yt-3,C.red,.5);
     if(settings84.tags&&!transferLabel){text('Transfer beam',X(lo),yt-10,75,6,C.red);transferLabel=true;}members.push(['TB',f.n,s.id,a,b]);
    }
    // Slabs and beams parallel to the section become a single floor line.
    if(k==='SLAB'||['MB','CB','TB'].includes(k)&&Math.abs((q.rawA||q.a)[index]-(q.rawZ||q.z)[index])<1e-8){
     const key=s.z1.toFixed(7);if(!floors.has(key))floors.set(key,{z:s.z1,spans:[]});floors.get(key).spans.push([a,b]);
    }
   }
   for(const {z,spans}of floors.values()){
    spans.sort((a,b)=>a[0]-b[0]);const merged=[];for(const [a,b]of spans){const last=merged.at(-1);if(last&&a<=last[1]+.001)last[1]=Math.max(last[1],b);else merged.push([a,b]);}
    const y=Y(z-offset),supports=solids.filter(t=>['COL','WALL'].includes(t.kind)&&t.z0<=z+.001&&t.z1>=z-.001).map(t=>along?t.r.y:t.r.x);
    for(const [a,b]of merged){line(X(a),y,X(b),y,C.blue,1);shapes[shapes.length-1].schematic108='FLOOR';members.push(['slab',f.n,'floor',a,b]);
     if(kind==='vertical'){
      const count=Math.max(1,Math.min(8,Math.ceil((X(b)-X(a))/32)));for(let i=0;i<count;i++){const mid=a+(b-a)*(i+.5)/count;line(X(mid),y-8,X(mid),y-1,C.red,.8,true);}
      const inSpan=supports.filter(x=>x>=a-.001&&x<=b+.001).sort((a,b)=>a-b);
      for(let i=1;i<inSpan.length;i++){const left=inSpan[i-1],right=inSpan[i],mid=(left+right)/2;if(X(right)-X(left)>18){line(X(mid)-2,y+4,X(left)+3,y+4,C.red,.65,true);line(X(mid)+2,y+4,X(right)-3,y+4,C.red,.65,true);}}
     }else if(supports.length){const mid=(a+b)/2,target=[...supports].sort((a,b)=>Math.abs(a-mid)-Math.abs(b-mid))[0];if(Math.abs(X(target)-X(mid))>8)line(X(mid),y-5,X(target),y-5,C.green,1,true);}
    }
   }
  }

  line(X(lo),Y(0)+3,X(hi),Y(0)+3,C.black,2);text(settings84.lo===1?'Foundation':'Section bottom',X(lo),Y(0)+14,160,8);
  if(!members.length)text('No members intersect this section.',60,160,265,9,C.red);
  fixed=true;text('Load Transfer Mechanism',354,7,175,9,C.blue);
  if(kind==='vertical'){
   const labels=[['Vertical load',43],['Slab',89],['Beam',135],['Column / wall',181],['Column / wall',279],['Foundation',325]];
   for(const [label,y]of labels)text(label,355,y,115,8,C.blue);
   for(const [a,b]of [[59,83],[105,129],[151,175],[198,272],[295,319]])line(390,a,390,b,C.blue,1,true);
   text('#',407,111,18,11,C.red);text('#',407,156,18,11,C.red);text('△',404,220,20,12,C.red);text('△',405,302,20,12,C.red);
   line(430,188,488,213,C.blue,1,true);text('△',462,189,20,12,C.red);text('Transfer beam',455,225,85,8,C.blue);line(487,242,429,273,C.blue,1,true);text('#',481,256,18,11,C.red);
   text('# Bending + Shear',450,35,90,8,C.red);text('△ Axial',450,51,90,8,C.red);
  }else {const mechanism=['Horizontal load','External surface','Rigid floor diaphragm','Column / core wall','Foundation'];mechanism.forEach((t,i)=>{text(t,355,43+i*38,175,8,C.blue);shapes[shapes.length-1].center=true;if(i<mechanism.length-1)line(442.5,62+i*38,442.5,77+i*38,C.blue,1,true);});}
  fixed=false;if(kind==='horizontal'){
   const input=OverallGeometry.input(p,opt.face),valid=v=>typeof v==='number'&&Number.isFinite(v);text('Overall face '+opt.face,18,386,180,8,C.black);
   if(input&&base!==null){const top=base+height,ground=input.leftEL;
    if(valid(ground)&&top>ground){
     const machine=Overall.machine(input,opt.face),get=a=>machine.safe(Overall.roles[1],a),wind=[];
     const ready=valid(get('K5'))&&valid(get('B9'))&&get('B9')>0&&!input._auto?.windError;
     if(ready&&input.mode==='LAYERED'){
      for(let r=24;r<124;r++)if(get('BO'+r)==='OK'){
       const low=get('BG'+r)+ground,high=get('BH'+r)+ground,q=get('BK'+r);
       if([low,high,q].every(valid)&&q>=0&&high>low)wind.push({low,high,q});
      }
     }else if(ready&&input.mode==='UNIFORM'){
      const q=get('B36');if(valid(q)&&q>=0&&valid(input.height))wind.push({low:ground,high:input.height,q});
     }
     const visible=wind.map(w=>({...w,low:Math.max(base,w.low),high:Math.min(top,w.high)})).filter(w=>w.high>w.low).sort((a,b)=>a.low-b.low),max=Math.max(0,...wind.map(w=>w.q)),edge=X(lo)-3;
     let previous=null;
     for(const w of visible){
      if(!max)continue;
      const outer=edge-26*w.q/max,yt=Y(w.high-base),yb=Y(w.low-base);
      line(outer,yt,outer,yb,C.red,.8);line(edge,yt,edge,yb,C.red,.8);
      if(previous&&Math.abs(previous.high-w.low)<1e-6)line(previous.outer,yb,outer,yb,C.red,.8);
      else line(outer,yb,edge,yb,C.red,.8);
      const count=input.mode==='UNIFORM'?Math.max(2,Math.ceil((yb-yt)/24)):1;
      if(w.q>0)for(let i=0;i<count;i++){const yy=yt+(yb-yt)*(i+.5)/count;line(outer,yy,edge,yy,C.red,1,true);}
      previous={high:w.high,outer};
     }
     if(previous)line(previous.outer,Y(previous.high-base),edge,Y(previous.high-base),C.red,.8);
     text(visible.length?'Wind · '+input.mode:'Wind inputs required',230,5,120,7,C.red);
    }

    if(input.basement==='Yes')for(const [side,ground,gwl]of [['L',input.leftEL,input.leftGWL],['R',input.rightEL,input.rightGWL]]){const edge=side==='L'?X(lo):X(hi),sign=side==='L'?-1:1;if(valid(ground)&&ground>base){const upper=Y(Math.min(top,ground)-base);line(edge+sign*4,upper,edge+sign*4,Y(0),C.green);const gamma=input[side==='L'?'gammaLeft':'gammaRight'],sub=input[side==='L'?'submergedLeft':'submergedRight'],depth=Math.min(top,ground)-base,dry=Math.max(0,Math.min(depth,ground-gwl)),total=gamma*dry+sub*(depth-dry),split=Y(Math.min(top,ground)-dry-base);if(valid(gamma)&&valid(sub)&&total>0&&dry>0&&dry<depth){line(edge+sign*4,upper,edge+sign*(4+18*gamma*dry/total),split,C.green);line(edge+sign*(4+18*gamma*dry/total),split,edge+sign*22,Y(0),C.green);}else line(edge+sign*4,upper,edge+sign*22,Y(0),C.green);line(edge+sign*22,Y(0),edge+sign*4,Y(0),C.green);for(let a=1;a<=3;a++){const dep=depth*a/3,ratio=total>0?(gamma*Math.min(dep,dry)+sub*Math.max(0,dep-dry))/total:a/3,yy=upper+(Y(0)-upper)*a/3;line(edge+sign*(4+18*ratio),yy,edge+sign*4,yy,C.green,1,true);}text('Soil pressure '+side,side==='L'?34:290,Y(0)+30,90,7,C.green);shapes[shapes.length-1].center=true;}if(valid(gwl)&&gwl>base){const upper=Y(Math.min(top,gwl)-base);line(edge+sign*25,upper,edge+sign*37,Y(0),C.blue);line(edge+sign*25,upper,edge+sign*25,Y(0),C.blue);line(edge+sign*37,Y(0),edge+sign*25,Y(0),C.blue);for(let a=1;a<=3;a++){const yy=upper+(Y(0)-upper)*a/3;line(edge+sign*(25+12*a/3),yy,edge+sign*25,yy,C.blue,1,true);}text('Hydrostatic pressure '+side,side==='L'?0:290,Y(0)+44,125,7,C.blue);shapes[shapes.length-1].center=true;}}
    if(valid(input.height)&&Math.abs(input.height-top)>.1)lines.push({text:'Model roof and Overall roof differ; review levels before using this illustration.'});
   }else lines.push({text:'Overall levels not available: wind / soil / water diagram requires completed inputs.'});
  }
  if(kind==='horizontal'){text('Axial Push-Pull effect',145,350,135,7,C.green);shapes[shapes.length-1].center=true;text('under lateral load.',145,365,135,7,C.green);shapes[shapes.length-1].center=true;const cols=members.filter(m=>m[0]==='column'),xs=[...new Set(cols.map(c=>c[3]))].sort((a,b)=>a-b);if(xs.length>=2){line(X(xs[0])+5,Y(height*.32),X(xs[0])+5,Y(height*.65),C.green,1,true);line(X(xs.at(-1))-5,Y(height*.65),X(xs.at(-1))-5,Y(height*.32),C.green,1,true);}}
  if(opt.note)lines.push({text:opt.note});
  lines.push({text:'Schematic floor / support lines follow Framing and local heights. Member dimensions are not drawn to scale.'});
  return {shapes,lines,height:410,members,selection:opt};
 }
 function svg(d){return '<svg role="img" aria-label="Structural section" viewBox="0 0 540 '+d.height+'" style="width:100%;background:white">'+d.shapes.map(s=>{const c=s.color||C.black;if(s.type==='text')return '<text x="'+(s.x+(s.center?s.w/2:0))+'" y="'+(s.y+(s.center?s.h/2:s.size))+'" '+(s.center?'text-anchor="middle" dominant-baseline="central" ':'')+(s.rotate?'transform="rotate('+s.rotate+' '+(s.x+(s.center?s.w/2:0))+' '+(s.y+(s.center?s.h/2:s.size))+')" ':'')+'font-size="'+s.size+'" fill="'+c+'">'+esc(s.text)+'</text>';if(s.type==='ellipse')return '<ellipse cx="'+(s.x+s.w/2)+'" cy="'+(s.y+s.h/2)+'" rx="'+s.w/2+'" ry="'+s.h/2+'" fill="none" stroke="'+c+'"/>';if(s.type==='rect')return '<rect x="'+s.x+'" y="'+s.y+'" width="'+s.w+'" height="'+s.h+'" fill="none" stroke="'+c+'"/>';let a='<path d="M '+s.x+' '+s.y+' L '+s.x2+' '+s.y2+'" fill="none" stroke="'+c+'" stroke-width="'+s.width+'"'+(s.dash?' stroke-dasharray="'+s.dash+'"':'')+'/>';if(s.arrow){const l=Math.hypot(s.x2-s.x,s.y2-s.y),u=(s.x2-s.x)/l,v=(s.y2-s.y)/l;if(l)a+='<path d="M '+(s.x2-u*5-v*2.5)+' '+(s.y2-v*5+u*2.5)+' L '+s.x2+' '+s.y2+' L '+(s.x2-u*5+v*2.5)+' '+(s.y2-v*5-u*2.5)+'" fill="none" stroke="'+c+'"/>';}return a;}).join('')+'</svg>';}
 function reportDiagram(p,m,kind){const v=settings(p,m),keys=v.picks[kind]==='both'?['one','two']:[v.picks[kind]],ds=keys.map(k=>diagram(p,m,kind,k,true));if(ds.length===1)return ds[0];const shapes=[];ds.forEach((d,i)=>d.shapes.forEach(s=>{if(s.fixed){if(!i)shapes.push(s);return;}shapes.push({...s,y:s.y*.76+i*315,...(s.y2!==undefined?{y2:s.y2*.76+i*315}:{}),...(s.type==='rect'||s.type==='ellipse'?{h:s.h*.76}:{})});}));return {shapes,height:640,lines:[...ds[0].lines],members:ds.flatMap(d=>d.members)};}
 function plan(p,m){
  const v=settings(p,m),model=Engine.floorModel(m,v.lo),xs=Engine.axes(p,'x',model.key),ys=Engine.axes(p,'y',model.key),minX=xs[0].v,minY=ys[0].v,maxX=xs.at(-1).v,maxY=ys.at(-1).v,scale=Math.min(420/Math.max(1,maxX-minX),260/Math.max(1,maxY-minY)),X=x=>84+(x-minX)*scale,Y=y=>82+(y-minY)*scale,shapes=[];
  const line=(x,y,x2,y2,color,width=.6,dash)=>shapes.push({type:'line',x,y,x2,y2,color,width,...(dash?{dash}:{})});
  const label=(text,x,y,size=8,color=C.black,rotate=0)=>shapes.push({type:'text',text,x:x-25,y:y-6,w:50,h:12,size,color,center:true,...(rotate?{rotate}:{})});
  const axisCircle=(text,x,y)=>{shapes.push({type:'ellipse',x:x-8,y:y-8,w:16,h:16,color:C.black});label(text,x,y,8);};
  // Real building axes, independent of the secondary-beam spacing and column offsets.
  for(const t of xs){line(X(t.v),35,X(t.v),Y(maxY)+14,'#7b8790',.55,'3 3');axisCircle(t.id,X(t.v),25);}
  for(const t of ys){line(62,Y(t.v),X(maxX)+14,Y(t.v),'#7b8790',.55,'3 3');axisCircle(t.id,53,Y(t.v));}
  for(let i=1;i<xs.length;i++){const a=X(xs[i-1].v),b=X(xs[i].v),y=57;line(a,y,b,y,'#536779');for(const x of [a,b])line(x,y-3,x,y+3,'#536779');label((xs[i].v-xs[i-1].v).toFixed(2),(a+b)/2,47,Math.min(8,Math.max(5,(b-a)/4.2)));}
  for(let i=1;i<ys.length;i++){const a=Y(ys[i-1].v),b=Y(ys[i].v),x=29;line(x,a,x,b,'#536779');for(const y of [a,b])line(x-3,y,x+3,y,'#536779');label((ys[i].v-ys[i-1].v).toFixed(2),18,(a+b)/2,Math.min(8,Math.max(5,(b-a)/4.2)),C.black,-90);}
  shapes.push({type:'text',text:'轴距 · m',x:8,y:8,size:8,color:C.black});
  for(const b of [...model.beams,...model.walls])line(X(b.a[0]),Y(b.a[1]),X(b.z[0]),Y(b.z[1]),C.black,.7);
  for(const c of model.columns)shapes.push({type:'rect',x:X(c.x-c.b/2),y:Y(c.y-c.d/2),w:c.b*scale,h:c.d*scale,color:C.blue});
  for(const [i,k]of ['one','two'].entries()){const c=v.cuts[k],x=c.axis==='X'?X(c.at):X(minX),y=c.axis==='X'?Y(minY):Y(c.at);line(x,y,c.axis==='X'?x:X(maxX),c.axis==='X'?Y(maxY):y,i?C.green:C.red,2);shapes.push({type:'text',text:'Section '+(i+1)+'–'+(i+1),x:x+5,y:y+12,size:9,color:i?C.green:C.red});}
  return '<section class="wp-card"><h2>剖切位置 · '+esc(FloorLevels.name(p,v.lo))+'</h2>'+svg({shapes,height:370})+'</section>';
 }

 function preview(p,m){return '<div class="wp-head"><div><h1>双剖面 Section</h1><p>选择剖切位置与楼层，图形随 Framing / Overall 更新</p></div></div>'+controls(p,m)+plan(p,m)+'<div class="wp-cards">'+['vertical','horizontal'].map(k=>'<section class="wp-card"><h2>'+k[0].toUpperCase()+k.slice(1)+' Load Path</h2>'+svg(reportDiagram(p,m,k))+'</section>').join('')+'</div>';}
 return {settings,controls,readControls,diagram,reportDiagram,preview};
})();
