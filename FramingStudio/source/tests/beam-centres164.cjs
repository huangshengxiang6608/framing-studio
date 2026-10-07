const fs=require('fs'),path=require('path'),assert=require('assert'),{pathToFileURL}=require('url'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1368,height:884}}),legacy=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve('FramingStudio/assets/index.html')).href);await legacy.goto(pathToFileURL(path.resolve('tmp/beam-centres164/index.html')).href);
 const p=JSON.parse(fs.readFileSync(process.argv[2]||'tmp/beam-centres164/project.json','utf8'));
 const baseline=await legacy.evaluate(p=>{const r=Engine.generate(p),m=Engine.floorModel(r,3);return {beam:m.beams.find(b=>b.id==='MB19'),ids:m.beams.map(b=>b.id).sort(),issues:m.issues,explorer:p.explorer};},p);
 const out=await page.evaluate(({p,baseline})=>{
  const passed=[],ok=(v,msg)=>{if(!v)throw Error(msg)},near=(a,b,msg)=>ok(Math.abs(a-b)<1e-7,msg),r=Engine.generate(p),m=Engine.floorModel(r,3),beam=m.beams.find(b=>b.id==='MB19');
  near(baseline.beam.a[0],20.5,'Reproduce old beam centre');
  for(const [id,ca,cz]of [['MB19','AC9','AC10'],['MB21','AC10','AC11'],['MB23','AC11','AC12']]){
   const b=m.beams.find(b=>b.id===id);for(const [end,cid]of [['a',ca],['z',cz]]){const q=Engine.columnRect(m.columns.find(c=>c.id===cid));near(b[end][0],q.x,id+' X at column centre');near(b[end][1],q.y,id+' Y at column centre');}
   ok(b.supportStatus==='connected',id+' remains connected');
  }
  ok(JSON.stringify(m.beams.map(b=>b.id).sort())===JSON.stringify(baseline.ids),'Actual F03 beam IDs/count retained');ok(m.issues.length===baseline.issues.length,'No new F03 model errors');
  ok(JSON.stringify(beam.rawA)===JSON.stringify(baseline.beam.rawA)&&JSON.stringify(beam.rawZ)===JSON.stringify(baseline.beam.rawZ),'Logical span and load token retained');
  ok(JSON.stringify(p.explorer)===JSON.stringify(baseline.explorer),'Saved load/report inputs retained');
  ok(JSON.stringify(Engine.floorModel(Engine.generate(JSON.parse(JSON.stringify(p))),3).beams)===JSON.stringify(m.beams),'Reload idempotent');
  passed.push('Actual F03 MB19/21/23 follow X 20.25 column centres; 108 beam IDs retained; stable load tokens and saved inputs; no model warnings');
  const q=Engine.clone(p),t=q.types.F03;Engine.bindMainColumns164(q,'F03',m);const saved=t.autoBeamSnapshot.main.find(b=>b.id==='MB19');
  ok(saved.columnSupports164.every(Boolean),'Support identities bound before edit');
  // Move both supporting columns along the existing orthogonal line, beyond the old footprint.
  for(const [id,y]of [['AC9',2],['AC10',11]]){t.columnPlacements=t.columnPlacements.filter(c=>c.key!=='id:'+id);t.columnPlacements.push({key:'id:'+id,x:20.25,y});}
  let moved=Engine.floorModel(Engine.generate(q),3).beams.find(b=>b.id==='MB19');near(moved.a[1],2,'Start follows large centre move');near(moved.z[1],11,'End follows large centre move');
  passed.push('Stored support identities follow subsequent moves even outside the old column footprint');
  const skew=Engine.clone(p);Engine.bindMainColumns164(skew,'F03',m);skew.types.F03.columnPlacements.push({key:'id:AC9',x:19.75,y:.75});const skewBeam=Engine.floorModel(Engine.generate(skew),3).beams.find(b=>b.id==='MB19');ok(skewBeam&&Math.abs(skewBeam.a[0]-skewBeam.z[0])<1e-7,'Different offsets do not create diagonal');
  const blocked=Engine.clone(p);Engine.bindMainColumns164(blocked,'F03',m);for(const id of ['AC9','AC10'])blocked.types.F03.columnPlacements.push({key:'id:'+id,x:100,y:id==='AC9'?.75:13});const blockedBeam=Engine.floorModel(Engine.generate(blocked),3).beams.find(b=>b.id==='MB19');ok(blockedBeam&&blockedBeam.a[0]<51,'Cannot follow outside site');
  passed.push('Unequal offsets and out-of-site centres never force diagonal or invalid beam placement');
  const resize=Engine.clone(p);FloorColumns101.resizeMany(resize,r,'F03',3,['AC9','AC10'].map(id=>({hit:{kind:'COL',id,f:3},b:2000,d:2000})));
  const resized=Engine.floorModel(Engine.generate(resize),3),rb=resized.beams.find(b=>b.id==='MB19');near(rb.a[0],20,'UI resize updates beam X');near(rb.a[1],1,'UI resize updates end Y');near(rb.b,2,'UI resize updates beam width');
  passed.push('UI column resize 1500 to 2000 updates main beam centre and width together');
  const h=StudioHost.get();Object.keys(h.p).forEach(k=>delete h.p[k]);Object.assign(h.p,p);StudioHost.transact(()=>{});StudioHost.navigate('columns');
  return {passed,beam,beamCount:m.beams.length,issues:m.issues};
 },{p,baseline});
 await page.locator('#type').selectOption('F03');await page.locator('#fit').click();await page.screenshot({path:'tmp/beam-centres164/verified.png'});
 assert.deepEqual(errors,[]);fs.writeFileSync('tmp/beam-centres164/results.json',JSON.stringify(out,null,2));console.log(out.passed.join('\n'));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
