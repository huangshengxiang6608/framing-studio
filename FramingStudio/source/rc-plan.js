const RCPlan=(()=>{
 const eq=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<1e-6;
 function build(project,section='Check',selection=null){
  const p=Engine.clone(project),e=Loading.init(p),settings=Loading.settings(p),map=section==='Check'?e.selected:e['report'+section]||{};
  const wanted=selection||Object.keys(map).filter(k=>map[k]);for(const k of wanted)e.selected[k]=true;
  const model=Engine.generate(p);for(let f=1;f<=p.total;f++)for(const m of Loading.members(p,model,f))e.selected[f+'|'+m.token]=m.kind!=='COL'||wanted.includes(f+'|'+m.token);
  const out=Loading.run(p,model,section==='A'?'A':'B'),roots=out.rows.filter(r=>wanted.includes(r.floor+'|'+r.token)),issues=[],batches=[];
  const lookup=(r,id)=>out.rows.find(x=>x.floor===r.floor&&x.id===id),kind=r=>r.result.kind||r.displayType||r.kind;
  function dependencies(r,seen=new Map()){
   if(r.result.widthViolation)throw Error(r.result.fail.join('；'));if(seen.has(r.token))return seen;const k=kind(r),l=r.loading||{};
   if(section==='A'&&!['COL','SB','MB','TB'].includes(k)){if(!(l.L>0)||!['SLAB','CS','SB','MB','CB'].includes(k))throw Error('构件尺寸或支承资料未完整');seen.set(r.token,r);return seen;}
   if(k==='COL'){const a=r.columnA||Reports.columnA(p,r);if(a.errors.length)throw Error(a.errors.join('；'));if(section!=='A'&&!r.result.inputs)throw Error((r.result.fail||['柱验算输入未完整']).join('；'));r.columnA=a;seen.set(r.token,r);return seen;}
   if(section!=='A'&&r.result.autoFailed)throw Error(r.id+' 自动选筋失败：'+r.result.fail.join('；')+'；请调整截面或配筋限制');
   if(!r.result.inputs)throw Error((r.result.fail||['输入未完整']).join('；'));
   if(!['SLAB','CS','SB','MB','CB','TB'].includes(k))throw Error('原表没有对应构件类型');
   if((r.input?.torsion||0)!==0)throw Error('手动扭矩不能对应原表的偏心传荷输入，未核对');
   if(k==='CB'&&r.input?.cover!=null&&r.input.cover!==SectionB.cover('CB',settings.fire))throw Error('悬臂梁手动保护层不同于原 Excel FRR 保护层，未核对');
   if(['SB','MB','TB','CB'].includes(k)){if(!r.actions||r.loadErrors?.length)throw Error((r.loadErrors||['荷载未完整']).join('；'));seen.set(r.token,r);return seen;}
   seen.set(r.token,r);return seen;
  }
  function fits(rs){const count=k=>rs.filter(r=>kind(r)===k).length;return rs.filter(r=>kind(r)==='COL').length<=1&&new Set(rs.map(r=>r.floor)).size<=20&&count('SLAB')<=10&&count('SB')<=20&&count('MB')<=20&&count('TB')<=(section==='A'?20:1)&&count('CS')+count('CB')<=20;}
  // Only selected roots create batches. Necessary upstream members accompany their loads.
  const key=r=>r.floor+'|'+r.token;
  for(const r of roots){try{const deps=[...dependencies(r).values()];if(!fits(deps))throw Error('单个构件的完整传荷链已超出原表范围，未核对');let b=batches.find(b=>fits([...new Map([...b.rows,...deps].map(x=>[key(x),x])).values()]));if(!b){b={rows:[],roots:[]};batches.push(b);}b.rows=[...new Map([...b.rows,...deps].map(x=>[key(x),x])).values()];b.roots.push(r);}catch(error){issues.push({floor:r.floor,id:r.id,reason:error.message});}}
  return {issues,selected:roots.length,batches:batches.map((b,i)=>{
   const cells={C3:settings.fcu,F3:settings.fire,C4:settings.columnFcu,F4:settings.columnFire,C5:settings.tbFcu,F5:settings.tbFire},members=[],fullLoads=[],sheetCells={'Section A Transfer Beam':{},'Section A Transfer Column':{},'Section A Column Loading':{},'Section B Column Check':{},'RC Column Inputs':{}};let sl=34,sb=49,mb=74,manual=124,link=99,tb=6,tc=5;
   const floors=[...new Set(b.rows.map(r=>r.floor))],floorName=f=>p.elevationLevels?.names?.[f]||f+'/F',id=r=>(floors.length>1?floorName(r.floor)+' ['+r.floor+'] ':'')+r.id,depId=(r,name)=>id(lookup(r,name));
   const add=(row,values)=>values.forEach((v,c)=>cells[String.fromCharCode(65+c)+row]=v??null);
   floors.forEach((floor,i)=>{const f=Engine.floors(p)[floor-1],load=Loading.floorload(p,floor);add(9+i,[floorName(floor),load.usage||null,load.dl,load.sdl,load.ll,f.h,f.headroom,f.em]);});
   for(const r of b.rows){const k=kind(r),l=r.loading,v=r.result.inputs,c=r.member;let row;
    const support=r.input?.sectionASupport||'Simply-supported';
    const slabDL=section==='A'?(Number.isFinite(l.dl)&&l.dl>=c.thickness*.0245?l.dl-c.thickness*.0245:null):l.dl;
    if(k==='SLAB'){row=sl++;add(row,[id(r),l.L,c.thickness,slabDL,l.sdl,l.ll,support,l.usage||null]);}
    else if(k==='CS'){row=manual++;add(row,[id(r),'Cantilever Slab',l.L,c.thickness,'Cantilever',null,slabDL,l.sdl,l.ll,0,0,0,0]);}
    else if(k==='SB'){row=sb++;add(row,[id(r),l.L,c.b*1000,c.d*1000,...[0,1].map(i=>'None'),support]);}
    else if(k==='MB'){row=mb++;add(row,[id(r),l.L,c.b*1000,c.d*1000,support]);}
    else if(k==='CB'){row=manual++;add(row,[id(r),'Cantilever Beam',l.L,c.d*1000,'Cantilever',c.b*1000,0,0,0,0,0,0,0]);}
    else if(k==='TB'){row=tb++;const a=sheetCells['Section A Transfer Beam'];for(const [col,value]of Object.entries({A:id(r),B:l.L,C:c.d*1000,T:c.b,U:support}))a[col+row]=value;const u=row+23;for(const [col,value]of Object.entries({C:l.L,D:1,E:0,F:0,G:0}))a[col+u]=value;}
    if(['SB','MB','TB'].includes(k)||k==='CB'&&section!=='A'){
     fullLoads.push({id:id(r),kind:k,L:l.L,loads:[{type:'LINE',start:0,end:l.L,g:l.udlDead,q:l.udlLive,label:'Full-span DL / LL (incl. assigned self-weight)'},...(l.lines||[]).map(x=>({...x,type:'LINE'})),...(l.points||[]).map(x=>({type:'POINT',start:x.x,end:x.x,g:x.g,q:x.q,label:x.label||'集中荷载'}))],expected:{M:r.actions.M,V:r.actions.V,RA:r.actions.left,RB:r.actions.right,dead:r.actions.totalDead,live:r.actions.totalLive}});
    }
    if(k==='COL'){
     const a=r.columnA,sc=sheetCells['Section A Column Loading'];for(const key of ['B4','B9','B10'])sc[key]=key==='B4'?id(r):a.cells[key];
     // The original column table shares Input floor rows. Project-wide summary is separate.
     for(let j=9;j<=28;j++)for(const col of ['A','B','C','D','E','F','G','H','J','K','M'])cells[col+j]=null;
     a.rows.forEach((x,i)=>{const row=9+i;add(row,[(x.lo===x.hi?floorName(x.lo):floorName(x.lo)+'–'+floorName(x.hi)),x.usage,x.dl,x.sdl,x.ll,null,null,null]);cells['J'+row]=x.b??x.area;cells['K'+row]=x.d??1;cells['M'+row]=x.count;});
     if(section==='A')members.push({id:id(r),kind:'COL',sectionA:true,sheet:'Section A Column Loading',expected:{...a.cells,B4:id(r)},inputs:{},selected:true});
     else {const inputs={...r.result.inputs,C13:id(r)},expected={...r.result.values,C13:id(r)};
      sheetCells['RC Column Inputs']={B4:c.b*1000,B5:c.d*1000};
      sheetCells['Section B Column Check']={C3:inputs.C3,C4:inputs.C4,C6:inputs.C6};
      members.push({id:id(r),kind:'COL',sheet:r.result.source,inputs,expected,steel:r.input?.steel?{...r.result.steel,...r.input.steel}:null,selected:true});
     }continue;
    }
    const inputs={...r.result.inputs},expected={...r.result.values};if(['SLAB','CS'].includes(k)){inputs.C1=id(r);if(Object.hasOwn(expected,'C1'))expected.C1=id(r);}
    if(section==='A'){
     const sup=['CS','CB'].includes(k)?'Cantilever':support,h=['CS','SLAB'].includes(k)?c.thickness:c.d*1000,ratio=l.L*1000/h*(sup!=='Cantilever'&&l.L>10.001?l.L/10:1),limit={'Cantilever':7,'Simply-supported':20,'Continuous':26,'End span':23}[sup],status=sup==='Cantilever'&&l.L>10.001?'CALC. REQUIRED':ratio<=limit?'OK':'NOT OK',cols={SLAB:['J','K','L'],SB:['H','I','J'],MB:['F','G','H'],CB:['N','O','P'],CS:['N','O','P'],TB:['V','W','X']}[k],sheet=k==='TB'?'Section A Transfer Beam':'Input';
     members.push({id:id(r),kind:k,row,sectionA:true,sheet,expected:Object.fromEntries(cols.map((c,i)=>[c+row,[ratio,limit,k==='TB'?status.replace('NOT OK','NOT OKAY').replace(/^OK$/,'OKAY'):status][i]])),inputs:{},actions:k==='TB'?{G23:r.actions.M,G24:r.actions.V}:null,selected:true});
    }else members.push({id:id(r),kind:k,row,sheet:r.result.source,expected,inputs,steel:r.input?.steel?{...r.result.steel,...r.input.steel}:null,cover:k==='CB'?null:r.input?.cover??null,selected:b.roots.includes(r)});
   }
   const notes=p.explorer?.reportANotes||{},copyNotes={};for(const[k,a]of Object.entries({introduction:'A5',location:'A6',steelGrade:'A34',steelDL:'A36'}))if(Object.hasOwn(notes,k))copyNotes[a]=String(notes[k]);notes.constraints?.slice(0,8).forEach((r,i)=>{copyNotes['A'+(10+i)]=String(r[0]??'');copyNotes['E'+(10+i)]=String(r[1]??'')});
   return {type:'RC',section,fullLoads,projectFloors:floorSummary(p,model),label:'RC '+(section==='Check'?'Check':'Section '+section)+' · '+floors.map(floorName).join(', ')+' · 第 '+(i+1)+' 份',cells,sheetCells,members,copyNotes,dependencies:b.rows.filter(r=>!b.roots.includes(r)).map(id)};
  })};
 }
 function floorSummary(p,model,report111=false){
  const rows=[];
  for(const f of model.floors){
   const panels=Engine.floorModel(model,f).slabs,tokens=new Set(panels.map(c=>Loading.token('SLAB',c))),areas=LoadData.areas(p,f.n).filter(a=>a.rects?.length||a.panels.some(x=>tokens.has(x))),covered=new Set(areas.flatMap(a=>a.panels));
   const loads=[...([...tokens].some(t=>!covered.has(t))||!areas.length?[{...Loading.floorload(p,f.n),name:''}]:[]),...areas];
   for(const load of loads){const val=x=>Number.isFinite(x)?x:'INPUT REQUIRED',v=[load.usage||'INPUT REQUIRED',val(load.dl),val(LoadData.live(load)),f.h,val(f.headroom),val(f.em),Number.isFinite(f.sh)?f.sh/1000:'INPUT REQUIRED'];
    if(report111)v.splice(0,v.length,load.usage||'INPUT REQUIRED',val(load.dl),val(load.sdl),val(LoadData.live(load)),Number.isFinite(f.sh)?f.sh/1000:'INPUT REQUIRED');
    const name=load.name||'',last=rows.at(-1),label=FloorLevels.name(p,f.n)+(name?' · '+name:'');
    if(loads.length===1&&last&&last.single&&last.hi===f.n-1&&last.area===name&&JSON.stringify(last.values)===JSON.stringify(v)){last.hi=f.n;last.label=FloorLevels.name(p,last.lo)+'–'+FloorLevels.name(p,f.n)+(name?' · '+name:'');}else rows.push({lo:f.n,hi:f.n,label,area:name,single:loads.length===1,values:v});
   }
  }
  return rows.map(x=>[x.label,...x.values]);
 }
 return {build,floorSummary};
})();
