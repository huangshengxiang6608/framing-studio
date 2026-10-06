// Isolated synthetic-project coverage. Never connects to the live preview.
const fs=require('fs'),path=require('path'),assert=require('assert'),{pathToFileURL}=require('url'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
const page=await browser.newPage({viewport:{width:1600,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.stack));page.on('dialog',d=>d.accept());
await page.goto(pathToFileURL(path.resolve('FramingStudio/assets/index.html')).href);await page.waitForFunction(()=>window.StudioHost);await page.addScriptTag({content:fs.readFileSync('FramingStudio/source/tests/loading115-browser.js','utf8')});
const base=await page.evaluate(()=>{const p=Engine.clone(loading115Tests().projects.slab);p.name='Member multi selection';p.total=2;p.types.F2=Engine.clone(p.types.F1);p.groups=[{...p.groups[0],type:'F1',end:1},{...p.groups[0],type:'F2',end:'顶层'}];p.types.F1.walls=[{id:'W1',a:{x:2,y:0},z:{x:2,y:4},b:200,on:true},{id:'W2',a:{x:4,y:0},z:{x:4,y:4},b:200,on:true}];return p;});
await page.evaluate(()=>{const old=Drawing.plan;Drawing.plan=(...a)=>window.multiPlot=old(...a);});
const load=async(p,tab='beamLayout')=>{await page.locator('#file').setInputFiles({name:'multi.framing.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});await page.evaluate(tab=>{StudioHost.viewFloor(1);StudioHost.navigate(tab);},tab);if(tab==='beamLayout')await page.locator('#bl116-tab-main').click();await page.locator('#selecttool').click();for(const kind of ['MB','SB','TB','CB','WALL'])await page.locator('[data-kind='+kind+']').check();await page.waitForFunction(()=>window.multiPlot?.scale);};
const state=()=>page.evaluate(()=>JSON.stringify(StudioHost.get().p));
const model=()=>page.evaluate(()=>{const h=StudioHost.get();return Engine.floorModel(h.result,h.floor,h.key);});
const pt=async(x,y)=>page.evaluate(([x,y])=>{const b=document.getElementById('canvas').getBoundingClientRect();return {x:b.x+multiPlot.ox+x*multiPlot.scale,y:b.y+multiPlot.oy+y*multiPlot.scale};},[x,y]);
const click=async(x,y)=>{const q=await pt(x,y);await page.mouse.click(q.x,q.y);};
const frame=async(a,z)=>{const p=await pt(...a),q=await pt(...z);await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(q.x,q.y,{steps:6});await page.mouse.up();};
const count=async n=>{const e=page.locator('#member-selection-count');if(n===0&&await e.count()===0)return;assert.match(await e.innerText(),new RegExp('已選取 '+n+' 個'));};
const selectAll=async()=>{const button=page.locator('[data-member-select-all]');if(await button.count())await button.click();else await frame([-.3,-.3],[6.3,4.3]);};
const hitClick=async(id,kind)=>{const m=await model(),b=[...m.beams,...m.walls].find(b=>b.id===id&&b.kind===kind);assert(b,'missing '+kind+id);await click(b.a[0]+(b.z[0]-b.a[0])*.37,b.a[1]+(b.z[1]-b.a[1])*.37);};

await load(base,'walls');let before=await state();await hitClick('W1','WALL');await count(1);await hitClick('W2','WALL');await count(2);await hitClick('W1','WALL');await click(3,1);await count(2);await page.locator('#selecttool').click();await count(2);
await page.locator('#canvas').press('Delete');assert.equal((await model()).walls.length,0);assert.equal((await model()).beams.length,4);await page.locator('#undo').click();assert.equal(await state(),before);
await frame([1.8,.5],[2.2,3.5]);await count(1);await frame([4.2,3.5],[3.8,.5]);await count(2);await page.locator('[data-member-delete], [data-bl116=delete]').click();assert.equal((await model()).walls.length,0);await page.locator('#undo').click();assert.equal(await state(),before);
// Editing inputs must not delete selected members.
await selectAll();await page.locator('input[data-action=default]').first().press('Delete');assert.equal((await model()).walls.length,2);await page.locator('#canvas').press('Escape');await count(0);

for(const kind of ['MB','SB','TB','CB']){
 const p=structuredClone(base);p.types.F1.walls=[];p.types.F1.beams[0].kind=kind;p.types.F1.beams[1].kind=kind;
 await load(p);await page.locator('#bl116-tab-'+({MB:'main',SB:'secondary',TB:'transfer',CB:'cantilever'}[kind])).click();assert.equal(await page.locator('.member-selection').count(),0,'no beam selection panel');assert.equal(await page.locator('#member-selection-filter').count(),0);before=await state();const m=await model();assert.equal(m.beams.length,4);
 for(const other of ['MB','SB','TB','CB'])await page.locator('[data-kind='+other+']').setChecked(other===kind);await hitClick('B1',kind);await count(1);await hitClick('B2',kind);await count(2);await hitClick('B1',kind);await click(3,2);await count(2);
 await page.locator('#canvas').press('Delete');assert.deepEqual((await model()).beams.map(b=>b.id).sort(),['B3','B4']);await page.locator('#undo').click();assert.equal(await state(),before,'single undo '+kind);
 // Forward/reverse boxes add; hidden members are excluded.
 await page.locator('[data-kind='+kind+']').uncheck();await frame([-.3,-.3],[6.3,4.3]);await count(0);await page.locator('[data-kind='+kind+']').check();
 await frame([-.3,-.3],[6.3,.5]);await count(kind==='MB'?3:1);await page.locator('#canvas').press('Escape');
 await frame([6.3,4.3],[-.3,3.5]);await count(kind==='MB'?3:1);await page.locator('#canvas').press('Escape');
 await selectAll();await count(kind==='MB'?4:2);await page.locator('[data-member-delete], [data-bl116=delete]').click();assert.equal((await model()).beams.length,kind==='MB'?0:2);await page.locator('#undo').click();assert.equal(await state(),before);
 await selectAll();await page.evaluate(()=>StudioHost.viewFloor(2));await count(0);assert.equal((await model()).beams.length,4,'other floor unchanged');
}
// Auto generated beam deletion resolves original IDs once and freezes the survivors.
const automatic=structuredClone(base);automatic.types.F1.walls=[];automatic.types.F1.beams=[];automatic.types.F1.autoBeams101=true;
await load(automatic);before=await state();let m=await model();assert(m.beams.length>=4);
const autoTargets=m.beams.slice(0,2);for(const b of autoTargets)await hitClick(b.id,b.kind);await count(2);await page.locator('#canvas').press('Delete');
let remaining=await model();assert.deepEqual(remaining.beams.map(b=>[b.id,b.kind,b.a,b.z]),m.beams.slice(2).map(b=>[b.id,b.kind,b.a,b.z]));await page.locator('#undo').click();assert.equal(await state(),before);
// Two slab panels, additive selection and direction edit remain available with hidden slab legend.
const slab=structuredClone(base);slab.types.F1.walls=[];slab.types.F1.beams.push({id:'S1',kind:'SB',a:{x:3,y:0},z:{x:3,y:4},b:250,d:350,on:true});
await load(slab);await page.locator('#bl116-tab-slab').click();before=await state();m=await model();assert.equal(m.slabs.length,2);
await click(1.5,2);await count(1);await click(4.5,2);await count(2);assert(await page.locator('[data-bl116=way-X]').isEnabled());
await page.locator('[data-bl116=way-X]').click();await count(2);const directions=await page.evaluate(()=>{const h=StudioHost.get(),m=Engine.floorModel(h.result,1);return m.slabs.map(s=>Loading.slabDirection(h.p,1,Loading.token('SLAB',s),s,m));});assert.deepEqual(directions,['X','X']);await page.locator('#undo').click();assert.equal(await state(),before);
await frame([.5,.5],[5.5,3.5]);await count(2);const beams=m.beams.map(b=>[b.id,b.kind,b.a,b.z]);await page.locator('[data-member-delete], [data-bl116=delete]').click();assert.equal((await model()).slabs.length,0);assert.deepEqual((await model()).beams.map(b=>[b.id,b.kind,b.a,b.z]),beams);await page.locator('#undo').click();assert.equal(await state(),before);
await selectAll();await page.locator('#canvas').press('Delete');assert.equal((await model()).slabs.length,0);await page.locator('#undo').click();
// Switching subtabs clears the previous kind; slab deletion cannot remove a previously selected MB.
await page.locator('#bl116-tab-main').click();await hitClick('B1','MB');await page.locator('#bl116-tab-slab').click();await click(1.5,2);await count(1);await page.locator('#canvas').press('Delete');assert((await model()).beams.some(b=>b.id==='B1'));await page.locator('#undo').click();assert.equal(await state(),before);
const domain=await page.evaluate(base=>{
 const check=(v,s)=>{if(!v)throw Error(s);};
 for(const bad of [{kind:'WALL',id:'W2',f:2},{kind:'WALL',id:'missing',f:1},{kind:'COL',id:'C1',f:1}]){const p=Engine.clone(base),before=JSON.stringify(p);let failed=false;try{Engine.removeMembers(p,'F1',[{kind:'WALL',id:'W1',f:1},bad],1);}catch{failed=true;}check(failed&&JSON.stringify(p)===before,'atomic bad batch');}
 const p=Engine.clone(base),other=JSON.stringify(p.types.F2);const hits=[{kind:'WALL',id:'W1',f:1},{kind:'WALL',id:'W2',f:1}];check(Engine.removeMembers(p,'F1',[...hits,hits[0]],1)===2,'dedupe');check(JSON.stringify(p.types.F2)===other,'other type');Engine.validate(p);check(Engine.floorModel(Engine.generate(JSON.parse(JSON.stringify(p))),1).walls.length===0,'reopen');
 return true;
},base);assert(domain);
await page.locator('#bl116-tab-main').click();await selectAll();fs.mkdirSync('tmp/member-multiselect',{recursive:true});await page.screenshot({path:'tmp/member-multiselect/verified.png'});
assert.deepEqual(errors,[]);console.log('PASS: walls, MB/SB/TB/CB, slabs, click and forward/reverse marquee accumulation, filtering, hidden members, blank/repeat, all/select/escape, keyboard/button batch delete, original-ID auto beam survivors, one-step undo, slab directions, subtab scope, floor scope, invalid batch rollback, deduplication and reopen.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
