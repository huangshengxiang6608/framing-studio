// Reset is one undoable Framing operation; synthetic models only.
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert'),{execFileSync}=require('child_process'),{chromium}=require('playwright');
const root=path.resolve('FramingStudio/assets'),out=path.resolve('tmp/e2128');fs.mkdirSync(out,{recursive:true});
const baseline=execFileSync('git',['show','a7ce77c0b1cb5ca0039f9ed24ab8ac14731365ce:FramingStudio/assets/index.html'],{maxBuffer:30*1024*1024});
const server=http.createServer((req,res)=>{try{const url=new URL(req.url,'http://localhost').pathname;if(url==='/baseline/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(baseline);return;}const file=path.join(root,url==='/'?'index.html':url.slice(1));res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':'text/javascript');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
 const page=await browser.newPage({viewport:{width:1600,height:1100}}),errors=[],passed=[];page.on('pageerror',e=>errors.push(e.stack));page.on('dialog',d=>d.dismiss());const url='http://127.0.0.1:'+server.address().port;
 await page.goto(url);await page.waitForFunction(()=>window.StudioHost);await page.addScriptTag({content:fs.readFileSync('FramingStudio/source/tests/loading115-browser.js','utf8')});
 const fixtures=await page.evaluate(()=>loading115Tests().projects);
 const old=await browser.newPage();await old.goto(url+'/baseline/');await old.waitForFunction(()=>window.StudioHost);
 const result=async(pj,p)=>pj.evaluate(p=>{const r=Engine.generate(p);return JSON.stringify({project:p,geometry:r,loads:Loading.run(p,r,'B')});},p);
 for(const p of Object.values(fixtures))assert.equal(await result(page,p),await result(old,p));await old.close();passed.push('Unreset slab, CB and transfer-column geometry / loading identical to E2.127');
 const cases=await page.evaluate(fixtures=>{
  const passed=[],copy=Engine.clone,physical=m=>m.columns.map(c=>({id:c.id,...Engine.columnRect(c),status:c.status}));
  for(const kind of ['manual','auto','manual-wall','auto-wall','position','placement','empty']){
   const p=copy(fixtures.slab),t=p.types.F1;t.walls=[{id:'W',a:{x:3,y:0},z:{x:3,y:4},b:300,on:true}];
   if(kind.endsWith('-wall'))t.walls[0].a.x=t.walls[0].z.x=0;
   if(['auto','auto-wall','position','placement'].includes(kind)){t.mode='auto';t.columns=[];p.axes.x.push({id:'3',gap:6});t.building['1,0']=true;if(kind==='position')t.columnAxisPositions=[{key:'axis:2|A',position:'down-left'}];if(kind==='placement')t.columnPlacements=[{key:'axis:2|A',x:6.15,y:.4}];}
   if(kind==='empty')t.columns=[];
   let r=Engine.generate(p),before=physical(r.models.F1);const beforeColumns=r.models.F1.columns;
   for(const c of beforeColumns)p.explorer.members['1|'+Loading.token('COL',c)]={sectionAAreas:'1, 1, A=7'};
   const foundationColumn=beforeColumns.find(c=>c.anchorX==='2')||beforeColumns[0];if(foundationColumn)p.foundation={column:'1|'+Loading.token('COL',foundationColumn)};
   const values={mainDirection:'Y',secondaryDirection:'X',gap:2500,scope:'all'};BeamLayout116.clear(p,'F1',values);Engine.validate(p);r=Engine.generate(p);const m=r.models.F1;
   if(JSON.stringify(physical(m))!==JSON.stringify(before))throw Error(kind+' columns moved: '+JSON.stringify({before,after:physical(m)}));
   if(m.beams.length||m.walls.length||m.slabs.length)throw Error(kind+' did not clear members');
   for(const c of m.columns)if(Loading.input(p,1,Loading.token('COL',c)).sectionAAreas!=='1, 1, A=7')throw Error(kind+' column input lost');
   if(foundationColumn&&p.foundation.column!=='1|'+Loading.token('COL',m.columns.find(c=>c.id===foundationColumn.id)))throw Error(kind+' Foundation column reference lost');
   const reopened=Engine.generate(JSON.parse(JSON.stringify(p)));if(JSON.stringify(physical(reopened.models.F1))!==JSON.stringify(before)||reopened.models.F1.slabs.length)throw Error(kind+' reopen changed reset');
   passed.push(kind+' reset retains physical columns, column inputs and saved state');
  }
  return passed;
 },fixtures);passed.push(...cases);
 const fixture=await page.evaluate(p=>{p=Engine.clone(p);p.name='Reset Framing layout';p.total=3;p.groups=[{...p.groups[0],end:2},{...p.groups[0],end:'顶层',type:'F2'}];p.types.F2=Engine.clone(p.types.F1);const t=p.types.F1;t.beams.push({id:'S1',kind:'SB',a:{x:0,y:2},z:{x:6,y:2},b:250,d:350,on:true},{id:'T1',kind:'TB',a:{x:2,y:0},z:{x:2,y:4},b:300,d:600,on:true},{id:'CB1',kind:'CB',a:{x:6,y:1},z:{x:5,y:1},b:250,d:350,on:true});t.walls.push({id:'W1',a:{x:3,y:1},z:{x:3,y:3},b:300,on:true});t.secondaryAreas=[{id:'SBA1',name:'Old zone',direction:'X',gap:2000,rects:[{x0:0,x1:6,y0:0,y1:4}]}];t.beamLayout116={main:false,secondary:false,mainDirection:'XY',secondaryDirection:'X',gap:2000,scope:'all'};for(const f of [2,3])LoadData.setFloor(p,f,{usage:'Office',dl:12,sdl:1,ll:3});const r=Engine.generate(p);for(const f of r.floors)for(const row of Loading.members(p,r,f.n)){const id=f.n+'|'+row.token;p.explorer.members[id]=row.kind==='COL'?{sectionAAreas:'1, 3, A=9'}:{fixedEnd:'a'};for(const map of ['selected','reportA','reportB'])p.explorer[map][id]=true;}return p;},fixtures.slab);
 async function load(p){await page.locator('#file').setInputFiles({name:'layout-reset.framing.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});await page.evaluate(()=>StudioHost.navigate('beamLayout'));}
 const snapshot=()=>page.evaluate(()=>JSON.stringify(StudioHost.get().p));await load(fixture);const before=await snapshot();
 assert.equal(await page.locator('[data-bl116=reset]').count(),1);assert.equal(await page.locator('[data-bl116^=rebuild-]').count(),0);
 assert.equal(await page.locator('[data-bl116=reset]').evaluate(el=>!!el.closest('details')),false);
 for(const name of ['main','secondary','slab'])await page.locator('[data-bl-fold='+name+']>summary').click();assert(await page.locator('[data-bl116=reset]').isVisible());for(const name of ['main','secondary','slab'])await page.locator('[data-bl-fold='+name+']>summary').click();
 await page.locator('#bl116-gap').fill('1.5');await page.locator('[data-bl116=main]').click();assert(await page.locator('[data-bl116=apply]').isVisible());assert.equal(await snapshot(),before);
 await page.locator('[data-bl116=reset]').click();await page.waitForFunction(()=>StudioHost.get().result.models.F1.columnsOnly===true);assert.equal(await page.locator('[data-bl116=apply]').count(),0);
 const cleared=await page.evaluate(()=>{const h=StudioHost.get();return {p:h.p,models:[1,2,3].map(f=>{const m=Engine.floorModel(h.result,f);return {columns:m.columns,beams:m.beams.length,walls:m.walls.length,slabs:m.slabs.length};})};});
 for(const m of cleared.models.slice(0,2)){assert.equal(m.beams,0);assert.equal(m.walls,0);assert.equal(m.slabs,0);assert.equal(m.columns.length,4);}
 assert.deepEqual(cleared.p.types.F2,JSON.parse(before).types.F2);assert.deepEqual(cleared.p.explorer.floors,JSON.parse(before).explorer.floors);assert.deepEqual(cleared.p.axes,JSON.parse(before).axes);assert.deepEqual(cleared.p.groups,JSON.parse(before).groups);
 for(const kind of ['members','selected','reportA','reportB'])for(const k of Object.keys(cleared.p.explorer[kind]))if(!k.startsWith('3|'))assert(k.includes('|COL|'));
 assert.equal(await page.locator('#bl116-gap').inputValue(),'1.5');assert.equal(await page.locator('.beam-layout-fold116').count(),3);
 await page.screenshot({path:path.join(out,'columns-only.png'),fullPage:true});
 await page.locator('#undo').click();assert.equal(await snapshot(),before);passed.push('Single top button clears manual beams, walls, slabs and stale member records for both F1 floors; F2 and floor settings retained; undo restores exact project');
 await page.locator('[data-bl116=reset]').click();const saved=JSON.parse(await snapshot());await load(saved);assert.equal(await snapshot(),JSON.stringify(saved));
 await page.locator('[data-bl116=main]').click();await page.locator('[data-bl116=apply]').click();assert.equal(await page.evaluate(()=>StudioHost.get().result.models.F1.beams.filter(b=>b.kind==='MB').length),4);
 await page.locator('[data-bl116=secondary]').click();await page.locator('[data-bl116=apply]').click();assert(await page.evaluate(()=>StudioHost.get().result.models.F1.beams.some(b=>b.kind==='SB')));assert(await page.evaluate(()=>StudioHost.get().result.models.F1.slabs.length>0));passed.push('Reset survives reopen; main and secondary layout resume separately and regenerate slab directions');
 await page.locator('[data-bl116=reset]').click();await page.locator('[data-bl-fold=manual]>summary').click();await page.evaluate(()=>{const draw=Drawing.plan;Drawing.plan=(...a)=>window.resetPlot128=draw(...a);StudioHost.repaint();});await page.waitForFunction(()=>window.resetPlot128);await page.locator('[data-action=layout-draw116]').click();
 for(const pt of [[.125,.125],[5.875,.125]]){const q=await page.evaluate(pt=>({x:resetPlot128.ox+pt[0]*resetPlot128.scale,y:resetPlot128.oy+pt[1]*resetPlot128.scale}),pt);await page.locator('#canvas').click({position:q});}
 await page.locator('[data-action=endline]').click();assert.equal(await page.evaluate(()=>StudioHost.get().p.types.F1.beams.length),1);passed.push('Manual drawing works from columns-only state');
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'layout128.json'),JSON.stringify({passed,errors},null,2));console.log(JSON.stringify({passed,errors}));
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
