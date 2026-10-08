// Split regression uses beam widths equal to boundary columns; narrower centred beams create real free-edge slab strips.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('FramingStudio/assets/index.html')).href);
 const result=await page.evaluate(()=>{
 const fixture=()=>({format:'framing-app',version:1,name:'Member label regression',total:1,axes:{x:[{id:'1',gap:0},{id:'2',gap:6}],y:[{id:'A',gap:0},{id:'B',gap:4}]},defaults:{cb:500,cd:500,gap:3000,direction:'自动',mb:250,sb:250,tb:600,tbd:1200,slab:200,wall:300},groups:[{end:'顶层',h:3.5,type:'F01',sh:350,min:0}],types:{F01:{mode:'manual',autoBeams101:false,building:{'0,0':true},opening:{},columns:[[0,0],[6,0],[0,4],[6,4]].map(([x,y],i)=>({id:'C'+(i+1),x,y,b:500,d:500,on:true,status:'上下贯通'})),walls:[],beams:[[[0,0],[6,0]],[[0,4],[6,4]],[[0,0],[0,4]],[[6,0],[6,4]]].map(([a,z],i)=>({id:'MB'+(i+1),kind:'MB',a:{x:a[0],y:a[1]},z:{x:z[0],y:z[1]},b:500,d:500,on:true})),suppressed:[]}}});
 const ok=(v,msg)=>{if(!v)throw Error(msg)},near=(a,b,msg)=>ok(Math.abs(a-b)<1e-6,msg+': '+a+' != '+b),passed=[];
 for(const source of ['auto','manual'])for(const axis of ['X','Y']){
  const p=fixture(),t=p.types.F01,id=axis==='X'?'MB1':'MB3';p.total=2;
  if(source==='auto'){const m=Engine.model(p,'F01');m.beams.forEach(b=>b.source='auto');Engine.freezeAutoBeams(p,'F01',m);t.beams=[];}
  const before=Engine.generate(p),orig=Engine.floorModel(before,1).beams.find(b=>b.id===id),oldSpan=Loading.beamSpan(orig).value;
  const added=Engine.addColumn(p,'F01',axis==='X'?3:0,axis==='X'?0:2);
  const r=Engine.generate(p),m=Engine.floorModel(r,1),parts=m.beams.filter(b=>b.splitColumnParent170===id);
  ok(parts.length===2,source+axis+' split in two');ok(!m.beams.some(b=>b.id===id),'Original full span gone');
  near(parts.reduce((n,b)=>n+Loading.beamSpan(b).value,0),oldSpan,'Reference spans conserve length');near(Loading.beamSpan(parts[0]).value,oldSpan/2,'Half span');
  ok(parts.every(b=>b.b===orig.b&&b.d===orig.d),'Sections preserved');ok(parts.every(b=>b.supportStatus==='connected'),'Split spans have supports');
  ok(Engine.floorModel(r,2).beams.filter(b=>b.splitColumnParent170===id).length===2,'Shared framing split');
  const stable=JSON.stringify(m.beams);ok(JSON.stringify(Engine.floorModel(Engine.generate(JSON.parse(JSON.stringify(p))),1).beams)===stable,'Reload and regenerate stable');
  for(const f of [1,2])LoadData.setFloor(p,f,{usage:'Office',dl:10,sdl:0,ll:2});
  const out=Loading.run(p,Engine.generate(p),'B'),rows=out.rows.filter(row=>row.floor===1&&parts.some(b=>b.id===row.member.id));
  ok(rows.length===2&&rows.every(row=>row.actions),'Both child spans analysed');
  const c=out.rows.find(row=>row.floor===1&&row.kind==='COL'&&row.member.id===added.id);ok(c?.loading.dead>0&&c.loading.live>0,'New column receives nonzero load');near(rows.reduce((n,row)=>n+row.loading.selfWeight,0),BeamLoads.up(24.5*orig.b*orig.d)*oldSpan,'Beam self-weight counted once');
  const edit=Engine.clone(p);Engine.editSize(edit,'F01',{kind:'MB',id:parts[0].id,f:1},{b:300,d:null});ok(Engine.floorModel(Engine.generate(edit),1).beams.some(b=>Math.abs(b.b-.3)<1e-7),'Child section editable');
  const del=Engine.clone(p);Engine.removeBeam(del,'F01',parts[0].id,'MB',1);const dm=Engine.floorModel(Engine.generate(del),1);ok(!dm.beams.some(b=>Engine.sig(b.rawA,b.rawZ)===Engine.sig(parts[0].rawA,parts[0].rawZ)),'Child deleted');ok(dm.beams.some(b=>Engine.sig(b.rawA,b.rawZ)===Engine.sig(parts[1].rawA,parts[1].rawZ)),'Sibling retained');
  const batch=Engine.clone(p);Engine.removeMembers(batch,'F01',[{kind:'MB',id:parts[0].id,f:1}],1);const bm=Engine.floorModel(Engine.generate(batch),1);ok(bm.beams.some(b=>Engine.sig(b.rawA,b.rawZ)===Engine.sig(parts[1].rawA,parts[1].rawZ))&&!bm.beams.some(b=>Engine.sig(b.rawA,b.rawZ)===Engine.sig(parts[0].rawA,parts[0].rawZ)),'Batch deletion retains sibling');
  passed.push(source+' '+axis+': add column, split, shared floors, stable reload, analysis, edit/delete/batch delete');
 }
 const p=fixture(),t=p.types.F01;t.columns.push({id:'MID1',x:2,y:0,b:500,d:500,on:true,status:'上下贯通'},{id:'MID2',x:4,y:0,b:500,d:500,on:true,status:'上下贯通'});let m=Engine.model(p,'F01');ok(m.beams.filter(b=>b.splitColumnParent170==='MB1').length===3,'Multiple columns produce three spans');
 t.columns.slice(-2).forEach(c=>c.status='上层柱');m=Engine.model(p,'F01');ok(m.beams.some(b=>b.id==='MB1'),'Upper-only columns do not split lower beam');
 t.columns.slice(-2).forEach(c=>{c.status='上下贯通';c.y=1});m=Engine.model(p,'F01');ok(m.beams.some(b=>b.id==='MB1'),'Off-line columns do not split');
 const reversed=fixture();[reversed.types.F01.beams[0].a,reversed.types.F01.beams[0].z]=[reversed.types.F01.beams[0].z,reversed.types.F01.beams[0].a];Engine.addColumn(reversed,'F01',3,0);const rev=Engine.model(reversed,'F01').beams.filter(b=>b.splitColumnParent170==='MB1');ok(rev.length===2&&rev.every(b=>b.rawA[0]>b.rawZ[0]),'Reversed beam orientation retained');
 const customized=fixture(),b=Engine.model(customized,'F01').beams.find(b=>b.id==='MB1');Loading.init(customized);customized.explorer.members['1|'+Loading.token('MB',b)]={beamSpan:8};Engine.addColumn(customized,'F01',3,0);m=Engine.model(customized,'F01');ok(m.beams.some(b=>b.id==='MB1')&&m.issues.some(i=>i.id==='MB1'&&i.msg.includes('構件輸入')),'Custom span input cannot be silently dropped');
 passed.push('Multiple support columns, off-line/upper-only exclusions and custom-input guard');return passed;
 });assert.deepEqual(errors,[]);console.log(result.join('\n'));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
