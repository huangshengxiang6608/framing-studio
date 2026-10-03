const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),passed=[],errors=[];
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file:///'+path.resolve(process.env.FRAMING_TEST_HTML||path.join(root,'assets/index.html')).replaceAll('\\','/'));
  const fixture=JSON.parse(fs.readFileSync(path.join(__dirname,'fixture.framing.json'),'utf8'));
  const data=await page.evaluate(fixture=>{
   const clone=p=>JSON.parse(JSON.stringify(p));
   function setup(chain=false){
    const p=clone(fixture);p.transferTrusses[0].bottomFloor=2;p.transferTrusses[0].limits={total:100,live:100,differential:100};
    const col=(id,x,y)=>({id,x,y,b:400,d:400,on:true,status:'上下贯通'});
    p.types.F01.columns=chain?[col('BASE-L0',0,0),col('BASE-L6',0,6),col('BASE-R0',14,0),col('BASE-R6',14,6)]:[col('BASE-L',0,3),col('BASE-R',14,3)];
    p.types.F01.beams=[{id:'TB-LOW',kind:'TB',a:{x:0,y:3},z:{x:14,y:3},b:1000,d:1600,on:true}];
    if(chain)p.types.F01.beams.push(...[0,14].map((x,i)=>({id:'MB-'+i,kind:'MB',a:{x,y:0},z:{x,y:6},b:400,d:600,on:true})));
    p.explorer.selected={};p.explorer.reportA={};p.explorer.reportB={};
    for(const c of p.types.F01.columns){const k='1|COL|'+c.x+','+c.y;p.explorer.selected[k]=true;p.explorer.reportA[k]=true;p.explorer.reportB[k]=true;p.explorer.members[k]={sectionAAreas:'1,1,A=1',sectionAAreaMode:'manual'};}
    p.explorer.floors['1']={dl:10,sdl:0,ll:2,basis:'total'};
    return p;
   }
   function inspect(p,section){
    const result=Engine.generate(p),out=Loading.run(p,result,section),keys=Object.keys(p.explorer.selected).filter(k=>p.explorer.selected[k]);
    const plan=RCPlan.build(p,section,keys);
    return {truss:out.trusses.map(t=>({status:t.status,fail:t.fail,reactions:t.calculation?.reactions})),
     columns:out.rows.filter(r=>r.floor===1&&r.kind==='COL').map(r=>({id:r.id,truss:r.truss109,loading:r.loading,status:r.result.status,fail:r.result.fail,inputs:r.result.inputs})),
     beams:out.rows.filter(r=>r.floor===1&&r.kind!=='COL').map(r=>({id:r.id,truss:r.truss109,actions:r.actions,status:r.result.status,errors:r.loadErrors})),plan};
   }
   const cases={};
   for(const chain of [false,true])for(const section of ['A','B'])cases[(chain?'chain':'direct')+section]=inspect(setup(chain),section);
   for(const section of ['A','B']){
    const cb=setup(true);cb.types.F01.columns=cb.types.F01.columns.filter(c=>c.y===0);
    cb.types.F01.beams.slice(1).forEach(b=>{b.kind='CB';b.z.y=3;});
    for(const field of ['selected','reportA','reportB'])for(const k of Object.keys(cb.explorer[field]))if(k.endsWith(',6'))delete cb.explorer[field][k];
    cases['cantilever'+section]=inspect(cb,section);
    // A transferred wall may continue vertically, but landing it on a column
    // is unsupported. Even a column beneath its interior must stay blocked.
    const wall=setup(false),oldTypes=clone(wall.types);
    wall.total+=2;wall.groups=wall.groups.map(g=>({...g,end:g.end+2,type:'F0'+(g.end+2)}));
    wall.types=Object.fromEntries(Object.entries(oldTypes).map(([k,v])=>['F0'+(+k.slice(2)+2),v]));
    wall.groups.unshift({end:1,h:3,type:'F01',sh:600,min:0},{end:2,h:3,type:'F02',sh:600,min:0});
    wall.transferTrusses[0].topFloor+=2;wall.transferTrusses[0].bottomFloor+=2;wall.transferTrusses[0].replaces.floor+=2;
    wall.explorer.members=Object.fromEntries(Object.entries(wall.explorer.members).map(([k,v])=>[(+k.split('|')[0]+2)+k.slice(k.indexOf('|')),v]));
    wall.explorer.floors={'1':{dl:10,sdl:0,ll:2,basis:'total'}};
    wall.types.F01=clone(oldTypes.F01);wall.types.F01.beams=[];
    wall.types.F02=clone(oldTypes.F01);wall.types.F02.columns=[];wall.types.F02.beams=[];
    const walls=[0,14].map((x,i)=>({id:'W'+i,a:{x,y:0},z:{x,y:6},b:400,on:true}));
    wall.types.F03.columns=[];wall.types.F03.walls=clone(walls);wall.types.F02.walls=clone(walls);
    for(const k of Object.keys(wall.explorer.selected))wall.explorer.members[k]={mode:'manual',dead:10,live:2,sectionAAreas:'1,1,A=1',sectionAAreaMode:'manual'};
    cases['unsupportedWall'+section]=inspect(wall,section);
   }
   const mutations={
    columnManual:p=>{for(const k of Object.keys(p.explorer.selected))Object.assign(p.explorer.members[k],{mode:'manual',dead:10,live:2});},
    columnArea:p=>{for(const k of Object.keys(p.explorer.selected))Object.assign(p.explorer.members[k],{mode:'area',areaSlabSW:10,areaExtraDead:0});},
    collectorManual:p=>{p.explorer.members['1|TB|0,3|14,3']={mode:'manual',udlDead:0,udlLive:0};},
    receiverManual:p=>{p.explorer.members['1|MB|0,0|0,6']={mode:'manual',udlDead:0,udlLive:0};},
    incompleteTruss:p=>{p.transferTrusses[0].bracingConfirmed=false;},
    incompleteTrussManualReceiver:p=>{p.transferTrusses[0].bracingConfirmed=false;p.explorer.members['1|MB|0,0|0,6']={mode:'manual',udlDead:0,udlLive:0};},
    missingCollectorSupportManualReceiver:p=>{p.explorer.members['1|TB|0,3|14,3']={supportA:'BEAM|deleted'};p.explorer.members['1|MB|0,0|0,6']={mode:'manual',udlDead:0,udlLive:0};}
   };
   for(const [name,mutate]of Object.entries(mutations))for(const section of ['A','B']){const p=setup(true);mutate(p);cases[name+section]=inspect(p,section);}
   return cases;
  },fixture);
  fs.writeFileSync(path.join(__dirname,'downstream-detail.json'),JSON.stringify(data,null,2));
  const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6*Math.max(1,Math.abs(b)),`${a} != ${b}`);
  // E2.115 rounds each beam input upward to 0.01 kN before analysis.
  const up=n=>Math.ceil((n-1e-10)*100)/100;
  for(const chain of [false,true])for(const section of ['A','B']){
   const c=data[(chain?'chain':'direct')+section],r=c.truss[0].reactions;assert.equal(c.truss[0].status,'OK');
   const sw=section==='B'?24.5*1*1.6*14:0,sideSW=chain&&section==='B'?24.5*.4*.6*6:0;
   const g=[(up(r.dead[0])*13+up(r.dead[1]))/14+sw/2,(up(r.dead[0])+up(r.dead[1])*13)/14+sw/2];
   const q=[(up(r.live[0])*13+up(r.live[1]))/14,(up(r.live[0])+up(r.live[1])*13)/14];
   for(const col of c.columns){
    assert.deepEqual(col.truss,['TT1'],`${chain?'chain':'direct'} ${section} ${col.id} must retain TT source`);
    const i=col.id.includes('-L')?0:1;near(col.loading.dead,((chain?up(g[i]):g[i])+sideSW)/(chain?2:1));near(col.loading.live,(chain?up(q[i]):q[i])/(chain?2:1));
    near(col.loading.transferDead,col.loading.dead);near(col.loading.transferLive,col.loading.live);assert(!col.status.includes('INPUT REQUIRED'));
   }
   for(const beam of c.beams)assert.deepEqual(beam.truss,['TT1'],'Beam receivers retain TT source');
   assert.equal(c.plan.issues.length,0,JSON.stringify(c.plan.issues));
   const members=c.plan.batches.flatMap(b=>b.members||[]).filter(m=>m.kind==='COL');assert.equal(members.length,c.columns.length);
   for(const m of members){const col=c.columns.find(c=>m.id.includes(c.id));assert(col,m.id);
    if(section==='B'){near(m.inputs.C26,col.loading.dead);near(m.inputs.C27,col.loading.live);}
    else{near(m.truss109.dead,col.loading.dead);near(m.truss109.live,col.loading.live);}
   }
   passed.push(`${chain?'TT -> column -> TB -> MB -> column':'TT -> column -> TB -> column'} ${section}: equilibrium, provenance and physical RC export inputs`);
  }
  for(const section of ['A','B']){
   const c=data['cantilever'+section],r=c.truss[0].reactions;assert.equal(c.truss[0].status,'OK');
   for(const col of c.columns){const i=col.id.includes('-L')?0:1;assert.deepEqual(col.truss,['TT1']);
    near(col.loading.dead,up((up(r.dead[i])*13+up(r.dead[1-i]))/14+(section==='B'?24.5*1*1.6*14/2:0))+(section==='B'?24.5*.4*.6*3:0));
    near(col.loading.live,up((up(r.live[i])*13+up(r.live[1-i]))/14));assert.notEqual(col.status,'INPUT REQUIRED');
   }
   assert.equal(c.plan.issues.length,0,JSON.stringify(c.plan.issues));passed.push(`TB -> CB -> column ${section}: fixed-end reaction retains TT provenance and physical loads`);
   const bad=data['unsupportedWall'+section];for(const col of bad.columns){assert.deepEqual(col.truss,['TT1']);assert.equal(col.status,'INPUT REQUIRED');}
   assert(bad.plan.issues.length);assert.equal(bad.plan.batches.length,0);passed.push(`TB -> continuous wall -> unsupported column landing ${section}: provenance and errors survive manual overrides`);
  }
  for(const name of ['columnManual','columnArea','collectorManual','receiverManual','incompleteTruss','incompleteTrussManualReceiver','missingCollectorSupportManualReceiver']){
   for(const section of ['A','B']){
    const c=data[name+section],affected=name==='receiverManual'?c.columns.filter(c=>c.id.includes('-L')):c.columns;
    for(const col of affected){assert.deepEqual(col.truss,['TT1'],name+' '+col.id);assert.equal(col.status,'INPUT REQUIRED',name+' '+section+' '+col.id);assert(col.fail.length);}
    assert(c.plan.issues.length,name+' '+section+' export must report missing inputs');
    const exported=c.plan.batches.flatMap(b=>b.members||[]).filter(m=>m.kind==='COL');
    for(const col of affected)assert(!exported.some(m=>m.id.includes(col.id)),name+' must not export '+col.id);
    if(name==='receiverManual')for(const col of c.columns.filter(c=>c.id.includes('-R'))){assert.notEqual(col.status,'INPUT REQUIRED');assert(exported.some(m=>m.id.includes(col.id)),'Unrelated right-hand path remains exportable');}
   }
   passed.push(`${name}: TT provenance and incomplete status survive downstream paths; A/B export blocked for affected columns`);
  }
  assert.deepEqual(errors,[]);const result={ok:true,checks:passed.length,passed};fs.writeFileSync(path.join(__dirname,'downstream-result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
