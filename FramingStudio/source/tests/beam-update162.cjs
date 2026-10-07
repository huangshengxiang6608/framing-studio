const fs=require('fs'),path=require('path'),assert=require('assert'),{pathToFileURL}=require('url'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage(),legacy=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('FramingStudio/assets/index.html')).href);await legacy.goto(pathToFileURL(path.resolve('tmp/beam-update162/index.html')).href);await Promise.all([page.waitForFunction(()=>window.StudioHost),legacy.waitForFunction(()=>window.StudioHost)]);
 const p=JSON.parse(fs.readFileSync('C:/Users/rzxa1/Downloads/新项目.framing (11).json','utf8'));
 const baseline=await legacy.evaluate(p=>{const r=Engine.generate(p);return {issues:r.issues,models:r.floors.map(f=>{const m=Engine.floorModel(r,f.n);return {columns:m.columns,beams:m.beams,slabs:m.slabs};})};},p);
 const out=await page.evaluate(({p,baseline})=>{
 const passed=[],ok=(v,msg)=>{if(!v)throw Error(msg)},originalProject=Engine.clone(p),r=Engine.generate(p),m=Engine.floorModel(r,2);
 const models=r.floors.map(f=>{const m=Engine.floorModel(r,f.n);return {columns:m.columns,beams:m.beams,slabs:m.slabs};});ok(JSON.stringify(models[1])===JSON.stringify(baseline.models[1]),'Final F02 geometry unchanged on actual saved project');
 ok(baseline.issues.some(i=>i.type==='F02'&&i.id==='MB_4'&&i.msg.includes('未生成')),'Reproduces stale base-model warning');
 ok(!r.issues.some(i=>i.type==='F02'&&['MB_4','MB_5'].includes(i.id)),'Final generated replacements no longer falsely reported');
 for(const [old,live]of [['MB_1','MB_4'],['MB_3','MB_5']]){ok(m.beams.some(b=>b.id===live)&&!m.beams.some(b=>b.id===old),'Keep valid existing beam '+live);ok(p.types.F02.mergedBeams163?.some(v=>v.from===old&&v.to===live),'Duplicate archived without changing physical beam '+old);}
 passed.push('Real project: final F02 geometry unchanged; stale base-model errors removed; two old records archived against their existing replacements');
 const single=Engine.clone(originalProject);single.types.F02.beams=single.types.F02.beams.filter(b=>!['MB_4','MB_5'].includes(b.id));const original=JSON.stringify(single.types.F02.beams),rr=Engine.generate(single),mm=Engine.floorModel(rr,2);
 for(const id of ['MB_1','MB_3']){const b=mm.beams.find(b=>b.id===id);ok(b&&b.sectionAdjusted162,'Auto-width record recovered '+id);const box=Engine.rect(b);ok(Math.abs(box.x-24.25)<1e-8&&Math.abs(box.x+box.w/2-25)<1e-8,'Inset exactly 250 mm '+id);ok(Engine.rectAllowed(mm.ts,box.x,box.y,box.w,box.d),'Full section valid '+id);ok(b.rawA[0]===24.5&&b.rawZ[0]===24.5,'Stable support/reference token '+id);ok(b.supportStatus==='connected','Support remains connected '+id);}
 ok(JSON.stringify(single.types.F02.beams)===original,'Regeneration does not rewrite or delete saved records');ok(JSON.stringify(Engine.floorModel(Engine.generate(single),2).beams)===JSON.stringify(mm.beams),'Repeat generation stable');
 const fixed=Engine.clone(single);const row=fixed.types.F02.beams.find(b=>b.id==='MB_1');row.widthMode='manual';row.b=1500;const fr=Engine.generate(fixed);ok(!Engine.floorModel(fr,2).beams.some(b=>b.id==='MB_1')&&fr.issues.some(i=>i.id==='MB_1'&&i.msg.includes('越界')),'Explicit fixed-width placement not silently moved');
 passed.push('Legacy automatic-width beams inset 250 mm with same IDs/reference tokens and valid support; fixed/manual placement remains explicit; regeneration idempotent');
 const beforeGrow=Engine.clone(single),t=beforeGrow.types.F02;
 // Freeze actual automatic members, then enlarge one corner column through the same UI operation.
 const bgr=Engine.generate(beforeGrow),bgm=Engine.floorModel(bgr,2),c=bgm.columns.find(c=>c.id==='AC1');Engine.freezeAutoBeams(beforeGrow,'F02',bgm);const ids=beforeGrow.types.F02.autoBeamSnapshot.main.map(b=>b.id);
 FloorColumns101.resizeMany(beforeGrow,bgr,'F02',2,[{hit:{kind:'COL',id:c.id,f:2},b:2000,d:2000}]);const grown=Engine.floorModel(Engine.generate(beforeGrow),2);
 for(const id of ids){const b=grown.beams.find(b=>b.id===id);ok(b,'Frozen automatic member retains identity '+id);const q=Engine.rect(b);ok(Engine.rectAllowed(grown.ts,q.x,q.y,q.w,q.d),'Frozen member stays in floor '+id);}
 passed.push('Column resize 1500 to 2000 through UI logic: frozen automatic main beam IDs retained and sections remain inside floor');
 return {passed,issues:r.issues.filter(i=>i.type==='F02'),recovered:mm.beams.filter(b=>['MB_1','MB_3'].includes(b.id)).map(b=>({id:b.id,a:b.a,z:b.z,width:b.b,support:b.supportStatus}))};
 },{p,baseline});assert.deepEqual(errors,[]);fs.writeFileSync('tmp/beam-update162/results.json',JSON.stringify(out,null,2));console.log(out.passed.join('\n'));
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
