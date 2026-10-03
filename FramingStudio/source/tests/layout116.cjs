// Run from the repository root. NODE_PATH may point to the bundled Playwright runtime.
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert'),{execFileSync}=require('child_process');
const {chromium}=require('playwright');
const out=path.resolve('tmp/e2116');fs.mkdirSync(out,{recursive:true});
const asset=path.resolve('FramingStudio/assets');
// A source checkout provides the released baseline; a packaged source copy may supply BASELINE_HTML.
const baselineHtml=process.env.BASELINE_HTML?fs.readFileSync(process.env.BASELINE_HTML):execFileSync('git',['show','0595c233780a2728b2e3eba1ab05498a7177b1a5:FramingStudio/assets/index.html'],{maxBuffer:30*1024*1024});
const server=http.createServer((req,res)=>{try{const url=new URL(req.url,'http://localhost').pathname;if(url==='/baseline/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(baselineHtml);return;}const file=path.resolve(asset,'.'+(url==='/'?'/index.html':url));res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')||file.endsWith('.mjs')?'text/javascript':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:1050}}),errors=[],passed=[];
  page.on('pageerror',e=>errors.push(e.stack));page.on('dialog',d=>d.dismiss());
  const url='http://127.0.0.1:'+server.address().port;
  await page.goto(url+'/');await page.waitForFunction(()=>window.StudioHost);
  await page.addScriptTag({content:fs.readFileSync('FramingStudio/source/tests/loading115-browser.js','utf8')});
  const oldFixture=await page.evaluate(()=>{const p=Engine.clone(loading115Tests().projects.slab);p.types.F1.autoBeams101=true;p.types.F1.beams=[];return p;});
  const compare=async(pj,p)=>pj.evaluate(p=>{const model=Engine.generate(p),r=Loading.run(p,model,'B');return JSON.stringify({members:Object.fromEntries(Object.entries(model.models).map(([k,m])=>[k,{beams:m.beams,walls:m.walls,columns:m.columns}])),floors:model.floors});},p);
  const baseline=await browser.newPage();baseline.on('dialog',d=>d.dismiss());await baseline.goto(url+'/baseline/');await baseline.waitForFunction(()=>window.StudioHost);
  assert.equal(await compare(page,oldFixture),await compare(baseline,oldFixture));passed.push('Existing beam, wall, column geometry and floor definitions exactly match E2.115');await baseline.close();
  const directionCheck=await page.evaluate(()=>{
   const p=Engine.clone(loading115Tests().projects.slab),read=()=>Loading.run(p,Engine.generate(p),'B').rows;
   const before=read(),slabs=Engine.floorModel(Engine.generate(p),1).slabs;
   BeamLayout116.setDirections(p,'F1',slabs,'X');const after=read();
   const q=rows=>rows.filter(r=>r.member.id==='B3'||r.member.id==='B4').reduce((n,r)=>n+r.actions.totalLive,0);
   const cfg=BeamLayout116.settings(p,'F1'),main=BeamLayout116.candidate(p,'F1','main',{...cfg,mainDirection:'Y'});
   let invalid=false;try{BeamLayout116.candidate(p,'F1','secondary',{...cfg,gap:0});}catch{invalid=true;}
   let missingRegion=false;try{BeamLayout116.candidate(p,'F1','secondary',{...cfg,scope:'selected'});}catch{missingRegion=true;}
   return {before:before.find(r=>r.kind==='SLAB').loading.direction,after:after.find(r=>r.kind==='SLAB').loading.direction,beforeQ:q(before),afterQ:q(after),total:after.filter(r=>r.actions).reduce((n,r)=>n+r.actions.totalLive,0),manual:JSON.stringify(main.project.types.F1.beams)===JSON.stringify(p.types.F1.beams),secondary:main.project.types.F1.beamLayout116.secondary,invalid,missingRegion};
  });
  assert.deepEqual(directionCheck,{before:'Y',after:'X',beforeQ:0,afterQ:38.5,total:38.5,manual:true,secondary:false,invalid:true,missingRegion:true});passed.push('Slab direction redirects actual DL/LL load path; invalid layout inputs rejected and manual beams retained');
  const fixture=await page.evaluate(()=>{const p=Engine.clone(loading115Tests().projects.slab);p.name='Layout 116 verification';p.total=3;p.groups=[{...p.groups[0],end:2},{...p.groups[0],end:'顶层',type:'F2'}];p.types.F2=Engine.clone(p.types.F1);p.types.F1.beams=[];p.types.F1.beamDepth=650;LoadData.setFloor(p,2,{usage:'Office',dl:12,sdl:1,ll:3});LoadData.setFloor(p,3,{usage:'Roof',dl:8,sdl:1,ll:1});return p;});
  fs.writeFileSync(path.join(out,'fixture.framing.json'),JSON.stringify(fixture));
  async function load(p){await page.locator('#file').setInputFiles({name:'layout-test.framing.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});await page.waitForFunction(name=>StudioHost.get().p.name===name,p.name);}
  await load(fixture);await page.evaluate(()=>{const old=Drawing.plan;Drawing.plan=(...args)=>window.plot116=old(...args);});
  const snapshot=()=>page.evaluate(()=>JSON.stringify(StudioHost.get().p));
  const before=await snapshot();await page.locator('#nav [data-tab=beamLayout]').click();await page.waitForFunction(()=>window.plot116);
  assert.equal(await snapshot(),before);assert.equal(await page.locator('.beam-layout-fold116').count(),3);
  assert.deepEqual(await page.locator('#nav button[data-tab]').evaluateAll(els=>els.map(el=>el.dataset.tab).slice(5,9)),['beamLayout','loading','beams','checks']);
  assert.equal(await page.locator('#scope').isVisible(),false);
  await page.locator('[data-bl-fold=main]>summary').click();assert.equal(await page.locator('[data-bl116=main]').isVisible(),false);assert.equal(await page.locator('[data-bl116=secondary]').isVisible(),true);await page.locator('[data-bl-fold=main]>summary').click();
  await page.locator('[data-bl116=main]').click();assert.equal(await snapshot(),before);await page.locator('[data-bl116=apply]').click();
  let state=await page.evaluate(()=>{const {p,result}=StudioHost.get();return {p,first:Engine.floorModel(result,1),second:Engine.floorModel(result,2)};});
  assert.equal(state.first.beams.filter(b=>b.kind==='MB').length,4);assert.equal(state.first.beams.filter(b=>b.kind==='SB').length,0);assert.deepEqual(state.p.types.F2,fixture.types.F2);assert.deepEqual(state.p.defaults,fixture.defaults);assert.deepEqual(state.p.explorer,fixture.explorer);
  assert.deepEqual(state.first.beams.map(b=>[b.rawA,b.rawZ]),state.second.beams.map(b=>[b.rawA,b.rawZ]));passed.push('Layout applies to all floors of current Framing only, preserving defaults and loads');
  await page.locator('#bl116-secondary-direction').selectOption('X');await page.locator('#bl116-gap').fill('2');await page.locator('[data-bl116=secondary]').click();await page.locator('[data-bl116=apply]').click();
  assert.equal(await page.evaluate(()=>Engine.floorModel(StudioHost.get().result,1).beams.filter(b=>b.kind==='SB').length),1);
  async function world(x,y,button='left'){const q=await page.evaluate(([x,y])=>({x:plot116.ox+x*plot116.scale,y:plot116.oy+y*plot116.scale}),[x,y]);await page.locator('#canvas').click({position:q,button});}
  async function pointMember(kind,id,button='left'){const p=await page.evaluate(({kind,id})=>{const h=plot116.hits.find(x=>x.kind===kind&&x.id===id);return [h.r.x,h.r.y];},{kind,id});await world(...p,button);}
  await world(2,1);assert.equal(await page.locator('[data-bl116=way-X]').isEnabled(),true);await page.locator('[data-bl116=way-X]').click();
  state=await page.evaluate(()=>{const {p,result}=StudioHost.get();return [1,2].map(f=>Engine.floorModel(result,f).slabs.map(s=>({id:s.id,dir:Loading.slabDirection(p,f,Loading.token('SLAB',s),s,Engine.floorModel(result,f)),manual:s.direction116})));});assert.equal(state[0].filter(s=>s.manual==='X').length,1);assert.deepEqual(state[0],state[1]);
  const cv=await page.locator('#canvas').boundingBox(),ends=await page.evaluate(()=>[[1,.8],[5,3.2]].map(([x,y])=>[plot116.ox+x*plot116.scale,plot116.oy+y*plot116.scale]));await page.mouse.move(cv.x+ends[0][0],cv.y+ends[0][1]);await page.mouse.down();await page.mouse.move(cv.x+ends[1][0],cv.y+ends[1][1],{steps:8});await page.mouse.up();assert((await page.locator('#bl116-selection').innerText()).includes('2'));await page.locator('[data-bl116=way-Y]').click();
  assert.equal(await page.evaluate(()=>Object.values(StudioHost.get().p.types.F1.slabDirections116).filter(x=>x==='Y').length),2);passed.push('Click and drag selection saves slab X/Y directions to all shared floors');
  await page.screenshot({path:path.join(out,'layout.png')});
  const sid=await page.evaluate(()=>Engine.floorModel(StudioHost.get().result,1).beams.find(b=>b.kind==='SB').id);await pointMember('SB',sid);await page.locator('[data-bl116=delete]').click();
  assert.equal(await page.evaluate(()=>Engine.floorModel(StudioHost.get().result,1).beams.filter(b=>b.kind==='SB').length),0);
  await page.locator('[data-bl116=rebuild-main]').click();await page.locator('[data-bl116=apply]').click();assert.equal(await page.evaluate(()=>Engine.floorModel(StudioHost.get().result,1).beams.filter(b=>b.kind==='SB').length),0);
  await page.locator('[data-bl116=rebuild-secondary]').click();await page.locator('[data-bl116=apply]').click();assert.equal(await page.evaluate(()=>Engine.floorModel(StudioHost.get().result,1).beams.filter(b=>b.kind==='SB').length),1);passed.push('Individual beam deletion and independent rebuild preserve other deletions');
  await page.locator('[data-bl-fold=manual]>summary').click();await page.locator('#beamkind').selectOption('SB');await page.locator('[data-action=layout-draw116]').click();
  const snapEnds=await page.evaluate(()=>{const m=Engine.floorModel(StudioHost.get().result,1),a=m.beams.find(b=>b.kind==='MB'&&b.rawA[1]===0&&b.rawZ[1]===0),z=m.beams.find(b=>b.kind==='SB');return [a,z].map(b=>[(b.a[0]+b.z[0])/2,(b.a[1]+b.z[1])/2]);});
  await world(...snapEnds[0]);await world(...snapEnds[1]);
  assert.equal(await page.evaluate(()=>StudioHost.get().p.types.F1.beams.filter(b=>b.kind==='SB').length),1);await page.locator('[data-action=endline]').click();passed.push('Actual beam centerline midpoints create a connected manual beam');
  await page.locator('[data-action=layout-draw116]').click();
  const addedEnds=await page.evaluate(()=>{const m=Engine.floorModel(StudioHost.get().result,1),b=m.beams.find(b=>b.source==='manual'),a=[(b.a[0]+b.z[0])/2,(b.a[1]+b.z[1])/2],edge=m.beams.find(b=>b.kind==='MB'&&b.rawA[0]===0&&b.rawZ[0]===0);return [a,[edge.a[0],a[1]]];});
  await world(...addedEnds[0]);await world(...addedEnds[1]);await page.locator('[data-action=endline]').click();assert.equal(await page.evaluate(()=>StudioHost.get().p.types.F1.beams.length),2);passed.push('Newly drawn beam midpoint remains available for subsequent beam connections');
  const saved=JSON.parse(await snapshot());await load(saved);await page.locator('#nav [data-tab=beamLayout]').click();assert.equal(await snapshot(),JSON.stringify(saved));passed.push('Save and reopen retains layout and manual direction settings');
  await page.locator('#nav [data-tab=checks]').click();const rebarId=await page.evaluate(()=>Engine.floorModel(StudioHost.get().result,1).beams.find(b=>b.kind==='MB'&&b.rawA[1]===0&&b.rawZ[1]===0).id);await pointMember('MB',rebarId);await page.locator('#beam-rebar116').waitFor();
  assert.equal(await page.locator('.beam-load-editor').count(),0);assert.equal(await page.locator('#ex-supportA').count(),0);
  await page.locator('[data-rebar-edit=bottom]').click();await page.locator('#ex-bottom-counts').fill('3, 2');await page.locator('#ex-bottom-dia').selectOption('25');assert.equal(await page.locator('#ex-steel-mode').inputValue(),'MANUAL');assert((await page.locator('[data-rebar-edit=bottom]').innerText()).includes('3T25'));
  await page.locator('[data-rebar-edit=shear]').click();await page.locator('#ex-link-space').fill('150');await page.locator('[data-ex=steel]').click();
  await page.waitForFunction(()=>Object.values(StudioHost.get().p.explorer.members).some(o=>o.steel?.C44===3&&o.steel?.C45===2));
  const steel=await page.evaluate(()=>Object.values(StudioHost.get().p.explorer.members).find(o=>o.steel?.C44===3).steel);assert.equal(steel.D44,25);assert.equal(steel.D45,25);assert.equal(steel.H58,150);
  await page.screenshot({path:path.join(out,'reinforcement.png')});passed.push('Diagram edit saves existing Section B reinforcement cells, using unchanged check flow');
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'ui-results.json'),JSON.stringify({passed,errors},null,2));console.log(JSON.stringify({passed,errors}));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
