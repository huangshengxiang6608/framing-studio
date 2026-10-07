const fs=require('fs'),path=require('path'),assert=require('assert'),{pathToFileURL}=require('url'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try {
  const page=await browser.newPage(),legacy=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve('FramingStudio/assets/index.html')).href);
  await legacy.goto(pathToFileURL(path.resolve('tmp/beam-merge163/index.html')).href);
  await Promise.all([page.waitForFunction(()=>window.StudioHost),legacy.waitForFunction(()=>window.StudioHost)]);
  const p=JSON.parse(fs.readFileSync(process.argv[2]||'C:/Users/rzxa1/Downloads/新项目.framing (12).json','utf8'));
  const baseline=await legacy.evaluate(p=>{const r=Engine.generate(p);return {issues:r.issues,models:r.floors.map(f=>{const m=Engine.floorModel(r,f.n);return {columns:m.columns,beams:m.beams,slabs:m.slabs};})};},p);
  const out=await page.evaluate(({p,baseline})=>{
   const passed=[],ok=(v,msg)=>{if(!v)throw Error(msg)},original=Engine.clone(p),r=Engine.generate(p),m=Engine.floorModel(r,2);
   const models=r.floors.map(f=>{const m=Engine.floorModel(r,f.n);return {columns:m.columns,beams:m.beams,slabs:m.slabs};});
   ok(JSON.stringify(models[1])===JSON.stringify(baseline.models[1]),'Duplicate merge leaves F02 geometry unchanged');
   for(const [old,live]of [['MB_1','MB_4'],['MB_3','MB_5']]){
    ok(baseline.issues.some(i=>i.floor===2&&i.id===old&&i.msg.includes(live)),'Reproduce duplicate '+old);
    ok(!r.issues.some(i=>i.type==='F02'&&i.id===old),'Duplicate diagnostic resolved '+old);
    const archive=p.types.F02.mergedBeams163.find(v=>v.from===old&&v.to===live);
    ok(archive&&JSON.stringify(archive.record)===JSON.stringify(original.types.F02.beams.find(v=>v.id===old)),'Original row archived '+old);
    ok(m.beams.some(b=>b.id===live)&&!m.beams.some(b=>b.id===old),'Existing physical beam retained '+live);
   }
   for(const id of ['MB_2','MB_4','MB_5','CB_1','CB_2'])ok(p.types.F02.beams.some(b=>b.id===id)&&m.beams.some(b=>b.id===id),'Valid underscore ID retained '+id);
   passed.push('Actual project: F02 columns, beams and slabs unchanged; two duplicate rows archived; valid underscore IDs retained');
   const saved=JSON.stringify(p),reload=JSON.parse(saved);Engine.generate(reload);ok(JSON.stringify(reload)===saved,'Save/reload and repeated generation idempotent');
   passed.push('Archive is persisted and repeated generation does not merge again');
   const old=original.types.F02.beams.find(v=>v.id==='MB_1'),keep=original.types.F02.beams.find(v=>v.id==='MB_4');
   const token=b=>Loading.token('MB',{rawA:Engine.resolve(original,b.a,'F02'),rawZ:Engine.resolve(original,b.z,'F02')}),oldKey='2|'+token(old),newKey='2|'+token(keep);
   function scenario(name,change,merged){const q=Engine.clone(original);change(q);const rr=Engine.generate(q);ok(!q.types.F02.beams.some(b=>b.id==='MB_1')===merged,name);if(!merged)ok(rr.issues.some(i=>i.floor===2&&i.id==='MB_1'),name+' stays visible');passed.push(name);return q;}
   scenario('Separate load/design record prevents merge',q=>{q.explorer??={};q.explorer.members??={};q.explorer.members[oldKey]={totalDead:123};},false);
   scenario('Dependent manual support prevents merge',q=>{q.explorer??={};q.explorer.members??={};q.explorer.members['2|other']={support:token(old)};},false);
   scenario('Conflicting report choices prevent merge',q=>{q.explorer??={};q.explorer.reportA??={};q.explorer.reportA[oldKey]=true;q.explorer.reportA[newKey]=false;},false);
   scenario('Explicit manual width is not merged',q=>{const row=q.types.F02.beams.find(b=>b.id==='MB_1');row.widthMode='manual';row.b=1500;},false);
   scenario('Different depth is not merged',q=>{q.types.F02.beams.find(b=>b.id==='MB_1').d=1234;},false);
   scenario('Different end outside the support column is not merged',q=>{q.types.F02.beams.find(b=>b.id==='MB_1').a.y=3;},false);
   const selected=scenario('Compatible selection/report choices transfer to retained beam',q=>{q.explorer??={};for(const name of ['selected','reportA','reportB']){q.explorer[name]??={};q.explorer[name][oldKey]=true;delete q.explorer[name][newKey];}},true);
   for(const name of ['selected','reportA','reportB'])ok(selected.explorer[name][newKey]===true&&!Object.hasOwn(selected.explorer[name],oldKey),'Selection migrated '+name);
   return {passed,beamCount:m.beams.length,archives:p.types.F02.mergedBeams163,issues:r.issues.filter(i=>i.type==='F02')};
  },{p,baseline});
  assert.deepEqual(errors,[]);fs.writeFileSync('tmp/beam-merge163/results.json',JSON.stringify(out,null,2));console.log(out.passed.join('\n'));console.log('F02 beam count: '+out.beamCount);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
