// Report-only data and vector drawing geometry. No design calculations are replaced.
window.ReportContent=(()=>{
 const n=(x,d=1)=>Number.isFinite(+x)?(+x).toFixed(d):'INPUT REQUIRED';
 const near=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<0.03;
 function on(p,b){b={...b,a:b.rawA||b.a,z:b.rawZ||b.z};const dx=b.z[0]-b.a[0],dy=b.z[1]-b.a[1],l=dx*dx+dy*dy;if(!l)return false;const t=((p[0]-b.a[0])*dx+(p[1]-b.a[1])*dy)/l;return t>=-1e-6&&t<=1+1e-6&&Math.hypot(p[0]-b.a[0]-t*dx,p[1]-b.a[1]-t*dy)<.03;}
 function framing(p,model){
  const pages=[],groups=new Map();
  for(const f of model.floors){const m=Engine.floorModel(model,f),upper=model.floors[f.n],um=upper&&Engine.floorModel(model,upper),lower=model.floors[f.n-2],lm=lower&&Engine.floorModel(model,lower);const beams=Loading.supportModel(p,m,f.n).beams.filter(b=>!TrussModel109.replacement(p,f.n,b)),lowerBeams=lm?Loading.supportModel(p,lm,lower.n).beams:[];
   const markers=TransferMarkers83.landing(p,model,f.n),landing=markers.map(x=>x.column);
   const transfer=m.columns.filter(c=>c.on!==false&&lm&&!lm.columns.some(x=>x.on!==false&&near([c.x,c.y],[x.x,x.y]))&&lowerBeams.filter(b=>b.kind==='TB'&&on([c.x,c.y],b)).length===1);
   const key=JSON.stringify([f.type,TrussModel109.visuals(p,model,f.n,f.n).map(v=>[v.t.id,v.t.bottomFloor,v.t.topFloor]),m.localHeight96?.rects,landing.map(c=>[c.id,c.x,c.y]),transfer.map(c=>c.id),ColumnPlan87.items(model,f.n).map(c=>[c.column.id,c.status]),FramingSymbols98.wallItems(model,f.n).map(w=>[w.r,w.status]),m.slabs.map(s=>Loading.slabDirection(p,f.n,Loading.token('SLAB',s),s,m))]);
   if(groups.has(key)){groups.get(key).floors.push(f.n);continue;}groups.set(key,{f,m,beams,landing,transfer,floors:[f.n]});
  }
  // One common fit scale for all Section A framing panels on A4 portrait.
  const extents=[...groups.values()].map(g=>{const xs=Engine.axes(p,'x',g.f.type),ys=Engine.axes(p,'y',g.f.type);return {x:xs.length?Math.max(...xs.map(a=>a.v))-Math.min(...xs.map(a=>a.v)):1,y:ys.length?Math.max(...ys.map(a=>a.v))-Math.min(...ys.map(a=>a.v)):1};});
  const commonScale=Math.min(270/Math.max(1,...extents.map(e=>e.x)),225/Math.max(1,...extents.map(e=>e.y)));
  for(const g of groups.values()){
   const {f,m,beams,landing,transfer}=g,shapes=[],legends=new Map(),counts={};
   const xs=Engine.axes(p,'x',f.type),ys=Engine.axes(p,'y',f.type);if(!xs.length||!ys.length)continue;
   const xmin=Math.min(...xs.map(v=>v.v)),xmax=Math.max(...xs.map(v=>v.v)),ymin=Math.min(...ys.map(v=>v.v)),ymax=Math.max(...ys.map(v=>v.v));const scale=commonScale;const X=x=>65+(x-xmin)*scale,Y=y=>75+(y-ymin)*scale;
   const line=(x,y,z,v,color='#0057b8',width=1)=>shapes.push({type:'line',x,y,x2:z,y2:v,color,width});
   const text=(t,x,y,w=110,size=9)=>shapes.push({type:'text',text:String(t),x,y,w,h:24,size});
   const legend=(kind,dim,id)=>{const key=kind+'|'+dim;if(!legends.has(key))legends.set(key,{id:kind+(counts[kind]=(counts[kind]||0)+1),dim,members:[]});const l=legends.get(key);l.members.push(id);return l.id;};
   const axisLine=(x,y,x2,y2)=>shapes.push({type:'line',x,y,x2,y2,color:'#000000',width:.65,dash:true});
   const bubble=(label,x,y)=>{const r=Math.max(7,String(label).length*3.1+2);shapes.push({type:'ellipse',x:x-r,y:y-r,w:2*r,h:2*r,color:'#000000',width:.9});shapes.push({type:'text',text:String(label),x:x-r,y:y-r,w:2*r,h:2*r,size:8,center:true});return r;};
   let lastX=-Infinity,lastY=-Infinity;
   for(const a of xs){const xx=X(a.v),stagger=xx-lastX<20,yy=Y(ymin)-(stagger?69:49),r=bubble(a.id,xx,yy);axisLine(xx,yy+r,xx,Y(ymax)+10);lastX=stagger?-Infinity:xx;}
   for(const a of ys){const yy=Y(a.v),stagger=yy-lastY<20,xx=X(xmin)-(stagger?42:57),r=bubble(a.id,xx,yy);axisLine(xx+r,yy,X(xmax)+10,yy);lastY=stagger?-Infinity:yy;}
   const dx=Y(ymin)-12,dy=X(xmin)-13;
   line(X(xmin),dx,X(xmax),dx,'#000000',.5);line(dy,Y(ymin),dy,Y(ymax),'#000000',.5);
   for(const a of xs)line(X(a.v),dx-2,X(a.v),dx+2,'#000000',.5);
   for(const a of ys)line(dy-2,Y(a.v),dy+2,Y(a.v),'#000000',.5);
   for(let i=1;i<xs.length;i++)shapes.push({type:'text',text:n(xs[i].v-xs[i-1].v)+' m',x:X((xs[i].v+xs[i-1].v)/2)-20,y:dx-16,w:40,h:12,size:7,center:true});
   for(let i=1;i<ys.length;i++)shapes.push({type:'text',text:n(ys[i].v-ys[i-1].v)+' m',x:dy-34,y:Y((ys[i].v+ys[i-1].v)/2)-6,w:32,h:12,size:7,center:true});
   for(const s of m.slabs){const id=legend('S',n(s.thickness,0)+' mm',s.id);
    for(const mark of SlabMarks83.layout(p,f.n,s,m,scale)){
     const {dir,part}=mark,pw=(part.x1-part.x0)*scale,ph=(part.y1-part.y0)*scale,small=Math.min(pw,ph)<22,size=small?6:7,labelWidth=Math.max(10,id.length*size*.58+2);
     let x=X(mark.x),y=Y(mark.y),lx=dir==='X'?x-labelWidth/2:x+4,ly=dir==='X'?y-15:y-size/2;
     const outside=pw<labelWidth+5||ph<10;
     if(!outside&&dir==='Y'&&pw<30){x=X(part.x0)+3;lx=x+4;}
     if(!outside&&dir==='X'&&ph<22){y=Y(part.y1)-3;ly=Y(part.y0)+1;}
     if(outside){lx=x<X((xmin+xmax)/2)?x+10:x-labelWidth-10;ly=y-14;}
     else{lx=Math.max(X(part.x0)+1,Math.min(X(part.x1)-labelWidth-1,lx));ly=Math.max(Y(part.y0)+1,Math.min(Y(part.y1)-9,ly));}
     lx=Math.max(X(xmin)+1,Math.min(X(xmax)-labelWidth-1,lx));ly=Math.max(Y(ymin)+1,Math.min(Y(ymax)-9,ly));
     shapes.push({type:'text',text:id,x:lx,y:ly,w:labelWidth,h:10,size});if(outside)line(x,y,lx+labelWidth/2,ly+6,'#000000',.45);
     if(!dir){text('?',x-3,y-3,12,7);continue;}
     const half=Math.max(1.5,Math.min(8,(dir==='X'?pw:ph)*.3)),dx=dir==='X'?half:0,dy=dir==='Y'?half:0;
     spanArrow107(shapes,x-dx,y-dy,x+dx,y+dy,small?.65:.85);
    }
   }
   for(const b of beams){const kind=b.kind||'MB',id=legend(kind,n(b.b*1000,0)+' x '+n(b.d*1000,0)+' mm',b.id);line(X(b.a[0]),Y(b.a[1]),X(b.z[0]),Y(b.z[1]),{MB:'#0057b8',SB:'#008000',CB:'#000000',TB:'#c00000'}[kind]||'#0057b8',kind==='TB'?4:2);if(kind==='TB')text(id+' / '+b.id,X((b.a[0]+b.z[0])/2)+5,Y((b.a[1]+b.z[1])/2)+3,Math.min(95,350-X((b.a[0]+b.z[0])/2)-5),8);}
   for(const {t,g:tg}of TrussModel109.visuals(p,model,f.n,f.n)){legend('TT','L '+n(tg.span)+' / h '+n(tg.depth)+' m',t.name);line(X(tg.a[0]),Y(tg.a[1]),X(tg.z[0]),Y(tg.z[1]),'#0057b8',2);text(t.name+' · TT',X((tg.a[0]+tg.z[0])/2)+5,Y((tg.a[1]+tg.z[1])/2)-12,90,8);}
   for(const wall of m.walls||[])if(wall.on!==false){line(X(wall.a[0]),Y(wall.a[1]),X(wall.z[0]),Y(wall.z[1]),'#000000',3);legend('W',n(wall.b*1000,0)+' mm',wall.id);}
   const col=(c,isTC,isUpper)=>{const id=legend(isTC?'TC':'C',n(c.b*1000,0)+' x '+n(c.d*1000,0)+' mm',c.id+(isUpper?' (above)':'')),r=Engine.columnRect(c),x=X(r.x),y=Y(r.y);line(x-3,y-3,x+3,y+3,'#0057b8',2);line(x-3,y+3,x+3,y-3,'#0057b8',2);if(isTC){shapes.push({type:'ellipse',x:x-7,y:y-7,w:14,h:14,color:'#0057b8',width:1.5});text(id+(isUpper?' (above) → '+(TransferMarkers83.landing(p,model,f.n).find(v=>v.column.id===c.id)?.beam.id||beams.find(b=>b.kind==='TB'&&TransferMarkers83.on(c,b))?.id||'TB'):''),x+9,y-8,Math.max(30,350-x-9),7);}else text(id,x+5,y-13,35,8);};
   m.columns.filter(c=>c.on!==false).forEach(c=>col(c,transfer.includes(c),false));landing.forEach(c=>col(c,true,true));
   const floorNames=g.floors.map(v=>FloorLevels.name(p,v));
   const runs=[];for(const v of g.floors){const last=runs[runs.length-1];if(last&&v===last[1]+1)last[1]=v;else runs.push([v,v]);}
   const floorCaption=runs.map(([a,b])=>FloorLevels.name(p,a)+(a===b?'':' - '+FloorLevels.name(p,b))).join(', ');
   pages.push({type:f.type,floorCaption,shapes,legends:[...legends.values()],scale:commonScale,classification:{floorNames,transfer:transfer.map(x=>x.id),landing:landing.map(x=>x.id)}});
  }return twoUpFraming107(pages);
 }
 function twoUpFraming107(panels){
  const pages=[],slot=330,ink={MB:'#0057b8',SB:'#008000',TB:'#c00000',CB:'#000000',W:'#000000',C:'#0057b8',TC:'#0057b8',S:'#008000'};
  const line=(shapes,x,y,x2,y2,color='#000000',width=.5,extra={})=>shapes.push({type:'line',x,y,x2,y2,color,width,...extra});
  const text=(shapes,t,x,y,w,h=14,size=8)=>shapes.push({type:'text',text:String(t),x,y,w,h,size});
  for(let i=0;i<panels.length;i+=2){
   const pair=panels.slice(i,i+2),shapes=[];
   pair.forEach((panel,j)=>{
    const offset=j*slot;
    text(shapes,'Framing '+panel.type+' | '+panel.floorCaption,8,offset+2,345,19,9);
    shapes.push(...panel.shapes.map(s=>({...s,y:s.y+offset,...(s.y2!==undefined?{y2:s.y2+offset}:{})})));
    line(shapes,362,offset+22,362,offset+316,'#b8c2ca');
    text(shapes,'LEGEND',374,offset+2,160,18,9);
    text(shapes,'Type / dimensions',374,offset+23,160,14,7.5);
    const columns=panel.legends.length<=15?1:Math.ceil(panel.legends.length/10),rows=Math.ceil(panel.legends.length/columns),cw=160/columns,pitch=columns===1?14.5:22;
    panel.legends.forEach((v,k)=>{
     const col=Math.floor(k/rows),row=k%rows,x=374+col*cw,y=offset+45+row*pitch,kind=v.id.replace(/[0-9]+$/,''),color=ink[kind]||'#000000';
     if(kind==='C'||kind==='TC'){
      line(shapes,x+2,y+4,x+10,y+12,color,1.4);line(shapes,x+2,y+12,x+10,y+4,color,1.4);
      if(kind==='TC')shapes.push({type:'ellipse',x:x-1,y:y+1,w:14,h:14,color,width:1});
     }else if(kind==='S')spanArrow107(shapes,x,y+8,x+14,y+8,1);
     else line(shapes,x,y+8,x+14,y+8,color,kind==='TB'?2.8:kind==='W'?2:1.4);
     const size=columns===1?7.8:6.5;
     text(shapes,v.id,x+19,y,cw-19,14,size);
     if(columns===1)text(shapes,v.dim,x+51,y,cw-51,14,size);
     else text(shapes,v.dim,x+1,y+12,cw-2,10,5.8);
    });

    if(j===0)line(shapes,8,slot-4,534,slot-4,'#b8c2ca');
   });
   pages.push({key:'framing',name:'Framing '+(pages.length+1),title:'',order:10,
    lines:[],shapes,shapeTop:0,shapeHeight:slot*2,after:[],
    framingPanels107:pair.map((q,j)=>({type:q.type,floorCaption:q.floorCaption,offset:j*slot,height:slot,scale:q.scale,legends:q.legends,classification:q.classification})),
    classification:{floorNames:pair.flatMap(q=>q.classification.floorNames),transfer:pair.flatMap(q=>q.classification.transfer),landing:pair.flatMap(q=>q.classification.landing)}});
  }return pages;
 }
 function spanArrow107(shapes,x,y,x2,y2,width){
  const length=Math.hypot(x2-x,y2-y);if(!length)return;
  const ux=(x2-x)/length,uy=(y2-y)/length,head=Math.min(3,length*.22),side=head*.55;
  const line=(a,b,c,d)=>shapes.push({type:'line',x:a,y:b,x2:c,y2:d,color:'#008000',width});
  line(x,y,x2,y2);
  for(const [a,b,sign]of [[x,y,-1],[x2,y2,1]]){line(a-sign*ux*head-uy*side,b-sign*uy*head+ux*side,a,b);line(a-sign*ux*head+uy*side,b-sign*uy*head-ux*side,a,b);}
 }

 function flow(labels){const shapes=[];labels.forEach((t,i)=>{shapes.push({type:'rect',x:70,y:12+i*57,w:390,h:39,color:'#000000',width:1});shapes.push({type:'text',text:t,x:80,y:20+i*57,w:370,h:22,size:12});if(i<labels.length-1)shapes.push({type:'line',x:265,y:51+i*57,x2:265,y2:65+i*57,color:'#0057b8',width:1.5,arrow:true});});return shapes;}
 function references(p,model){
  const notes=p.explorer?.reportANotes||{},blocks=SectionANotes.blocks;
  const get=id=>{const b=blocks.find(b=>b.id===id);return {b,text:notes[id]??notes.blocks?.[id]??b?.text??''};};
  const page=(id,title,order)=>({key:id,name:id,title,order,reference:true,lines:String(get(id).text).split('\n').filter(Boolean).map(text=>({text}))});
  const vertical=page('vertical','Vertical Load Path & Stability',20),horizontal=page('horizontal','Horizontal Load Path & Stability',21);
  for(const [q,file,h]of [[vertical,'vertical-load-path.png',350],[horizontal,'horizontal-load-path.png',305]]){q.after=q.lines;if(LoadPath84.settings(p,model).replace[q.key]){const section=LoadPath84.reportDiagram(p,model,q.key);q.shapes=section.shapes;q.shapeHeight=section.height;q.shapeTop=38;q.lines=[];}else{q.image=file;q.imageHeight=h;q.lines=[];}}

  const robust=page('robustness','Robustness & Progressive Collapse',22),other=page('other','Other Considerations',23);
  other.lines.push({text:'Movement joint alternatives - select one after project review:',level:1},...get('other').b.jointChoices.map((text,i)=>({text:'Option '+(i+1)+': '+text})));
  const comparison=page('recommendation','Scheme Comparison & Recommendation',60);
  comparison.after=[{text:'Recommendation.',level:1},...comparison.lines.filter(r=>!/^Recommendation\.?$/i.test(r.text.trim())).map((r,i)=>({...r,text:(i+1)+'. '+r.text.replace(/Scheme A/g,'Scheme 1').replace(/Scheme B/g,'Scheme 2')}))];
  comparison.lines=[{text:'Superstructure',level:1}];comparison.table=(notes.tables?.recommendation??get('recommendation').b.tables[0]).map(r=>r.map(t=>t.replace(/Scheme A/g,'Scheme 1').replace(/Scheme B/g,'Scheme 2')));
  const foundation=page('foundation','Foundation Recommendation',89);
  return [vertical,horizontal,robust,other,comparison,foundation];
 }
 function decorate(p,jobs,section){if(section!=='A')return jobs;const model=Engine.generate(p),rc=jobs.filter(j=>j.type==='RC'),extra=[...framing(p,model),...references(p,model)];
  // Native introduction/design appraisal precede Scheme 1 framing and selected checks.
  let chapter=rc.length?2:0;const next=()=>++chapter,scheme=next();
  rc.forEach((j,i)=>{j.reportNumber={chapter:scheme,part:i+1,title:'Scheme 1 - RC',first:i===0};j.reportFloors111=RCPlan.floorSummary(p,model,true);});
  let drawing=0;for(const q of extra.filter(x=>x.key==='framing')){q.chapter=scheme;q.order=10;}
  for(const [i,key]of ['vertical','horizontal','robustness','other'].entries()){const q=extra.find(x=>x.key===key);q.chapter=scheme;}
  const steel=jobs.filter(j=>j.type==='Steel');if(steel.length){const c=next();steel.forEach((j,i)=>j.reportNumber={chapter:c,part:i+1,title:'Scheme 2 - Steel',first:i===0});}
  const comparison=extra.find(x=>x.key==='recommendation');comparison.chapter=next();
  for(const type of ['Overall','Deflection']){const batch=jobs.filter(j=>j.type===type);if(batch.length){const c=next();batch.forEach((j,i)=>j.reportNumber={chapter:c,part:i+1,title:type==='Overall'?'Overall Check':'Deflection Check',first:i===0});}}
  const q=extra.find(x=>x.key==='foundation');q.chapter=next();
  for(const j of jobs.filter(j=>j.type==='Foundation'))j.reportNumber={chapter:q.chapter,part:1,title:'Foundation',first:true};
  const carrier=rc[0]||jobs[0];if(carrier)carrier.reportPages=[...(carrier.reportPages||[]),...extra];
  return jobs;
 }
 return {framing,references,decorate};
})();
