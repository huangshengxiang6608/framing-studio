// Verify edge-connected cantilever supports and the Support -> Loading edit flow.
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../../assets'),out=path.resolve('tmp/e2117');fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{try{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));if(!file.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')||file.endsWith('.mjs')?'text/javascript':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:1100}}),errors=[],passed=[];page.on('pageerror',e=>errors.push(e.stack));page.on('dialog',d=>d.dismiss());
  await page.goto('http://127.0.0.1:'+server.address().port+'/');await page.waitForFunction(()=>window.StudioHost);await page.addScriptTag({content:fs.readFileSync(__dirname+'/loading115-browser.js','utf8')});
  const fixture=await page.evaluate(()=>{
   const p=Engine.clone(loading115Tests().projects.slab),t=p.types.F1,point=(x,y)=>({x,y}),beam=(id,kind,a,z)=>({id,kind,a:point(...a),z:point(...z),b:300,d:600,on:true});
   p.name='Edge CB support verification';p.total=2;p.groups[0].end='顶层';p.axes.y=[{id:'C',gap:0},{id:'D',gap:2}];t.beamDepth=600;t.columns=t.columns.slice(0,2);t.beams=[beam('MB_TOP','MB',[0,0],[6,0]),beam('CB_LEFT','CB',[0,0],[0,2]),beam('CB_RIGHT','CB',[6,0],[6,2]),beam('MB_TIP','MB',[0,2],[6,2])];LoadData.setFloor(p,2,{usage:'Dormitory',dl:10,sdl:0,ll:2});return p;
  });
  fs.writeFileSync(path.join(out,'fixture.framing.json'),JSON.stringify(fixture));
  const geometry=await page.evaluate(p=>{
   const r=Engine.generate(p),m=Engine.floorModel(r,1),c=m.beams.find(b=>b.id==='CB_LEFT'),col=m.columns.find(c=>c.id==='C1'),root=Loading.cbRoot(p,r,1,c),rows=Loading.run(p,r,'B').rows,row=rows.find(x=>x.member.id===c.id&&x.floor===1),tip=rows.find(x=>x.member.id==='MB_TIP'&&x.floor===1);
   const reverse=Engine.clone(p);const reverseBeam=reverse.types.F1.beams.find(b=>b.id==='CB_LEFT');[reverseBeam.a,reverseBeam.z]=[reverseBeam.z,reverseBeam.a];const rr=Engine.generate(reverse),rc=Engine.floorModel(rr,1).beams.find(b=>b.id==='CB_LEFT');
   const disconnected=Engine.clone(p);disconnected.types.F1.columns=disconnected.types.F1.columns.filter(c=>c.id!=='C1');const dr=Engine.generate(disconnected),dc=Engine.floorModel(dr,1).beams.find(b=>b.id==='CB_LEFT');
   return {root,summary:Loading.supportSummary(p,r,1,c),options:Loading.supportOptions(m,c,'a').map(x=>x.label),raw:c.rawA,actual:c.a,column:Engine.columnRect(col),support:Loading.supportModel(p,m,1).beams.find(x=>x.id===c.id).supportStatus,hasActions:!!row.actions,tipLoad:row.loading.automaticPoints.some(x=>x.label.includes('MB_TIP')),tipActions:!!tip.actions,reverseRoot:Loading.cbRoot(reverse,rr,1,rc).fixedEnd,disconnected:Loading.cbRoot(disconnected,dr,1,dc).fixedEnd};
  },fixture);
  assert.equal(geometry.root.fixedEnd,'a');assert(geometry.root.connections.a.includes('柱 C1'));assert.equal(geometry.summary[1].text,'自由端');assert.equal(geometry.support,'connected');assert(geometry.hasActions&&geometry.tipActions&&geometry.tipLoad);assert.equal(geometry.reverseRoot,'z');assert.equal(geometry.disconnected,null);assert(geometry.actual[0]!==geometry.raw[0]);passed.push('Edge-offset CB finds column C1, free tip receives beam reaction, reversed input finds same root, missing column remains unconfirmed');
  await page.locator('#file').setInputFiles({name:'edge.framing.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});await page.waitForFunction(()=>StudioHost.get().p.name==='Edge CB support verification');
  await page.evaluate(()=>{const old=Drawing.plan;Drawing.plan=(...args)=>window.plot117=old(...args);StudioHost.navigate('beams');});
  // The existing toolbar uses select mode; locate its accessible text if it has no id.
  await page.getByRole('button',{name:'选择 / 删除',exact:true}).click();
  const spot=await page.evaluate(()=>{const b=Engine.floorModel(StudioHost.get().result,1).beams.find(b=>b.id==='CB_LEFT');return {x:plot117.ox+(b.a[0]+b.z[0])/2*plot117.scale,y:plot117.oy+(b.a[1]+b.z[1])/2*plot117.scale};});await page.locator('#canvas').click({position:spot});
  await page.locator('.beam-support-step117').waitFor();assert(await page.locator('[data-support-summary117]').innerText().then(s=>s.includes('C1')&&s.includes('自由端')));assert(await page.locator('.beam-support-step117').evaluate(el=>!!(el.compareDocumentPosition(document.querySelector('.beam-loading-step117'))&Node.DOCUMENT_POSITION_FOLLOWING)));
  const supportToken=await page.locator('#ex-supportA option').evaluateAll(nodes=>nodes.find(n=>n.textContent.includes('C1'))?.value);assert(supportToken);
  await page.locator('[data-bl-mode=manual]').click();await page.locator('[data-bl-add]').click();await page.locator('[data-bl-field=dl]').fill('12.345');await page.locator('[data-bl-field=ll]').fill('3.456');await page.locator('[data-bl-field=b]').fill('9');
  await page.locator('#ex-supportA').selectOption(supportToken);await page.locator('[data-ex=beam-support-save117]').click();
  const savedSupport=await page.evaluate(()=>{const h=StudioHost.get(),m=Engine.floorModel(h.result,1).beams.find(b=>b.id==='CB_LEFT'),t=Loading.token(m.kind,m);return [1,2].map(f=>Loading.input(h.p,f,t));});assert(savedSupport.every(o=>o.supportA===supportToken));assert(savedSupport.every(o=>!o.beamLoadMode&&!o.beamLoads));assert.equal(await page.locator('[data-bl-field=b]').inputValue(),'9.00');passed.push('Support saves across shared floors independently of incomplete load drafts, which remain editable');
  await page.locator('[data-bl-field=b]').fill('2');await page.locator('[data-ex=beam-loading-save117]').click();
  const saved=await page.evaluate(()=>{const h=StudioHost.get(),c=Engine.floorModel(h.result,1).beams.find(b=>b.id==='CB_LEFT'),t=Loading.token(c.kind,c);return {p:h.p,rows:[1,2].map(f=>Loading.input(h.p,f,t)),r:Loading.run(h.p,h.result,'B').rows.find(x=>x.floor===1&&x.token===t)};});assert.equal(saved.rows[0].beamLoadMode,'manual');assert.equal(saved.rows[0].beamLoads[0].dl,12.345);assert.equal(saved.rows[0].beamLoads[0].ll,3.456);assert(saved.r.loading.lines.some(l=>l.g===12.35&&l.q===3.46));assert(saved.rows.every(o=>o.supportA===supportToken));assert(!saved.rows[1].beamLoadMode);assert(saved.r.actions);passed.push('Loading saves rounded values on current floor without changing shared supports');
  await page.locator('.beam-support-step117').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'support-first.png')});
  await page.locator('#file').setInputFiles({name:'saved.framing.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(saved.p))});assert.deepEqual(await page.evaluate(()=>StudioHost.get().p),saved.p);assert.deepEqual(errors,[]);passed.push('Save and reopen retains support and loading settings');
  fs.writeFileSync(path.join(out,'support-results.json'),JSON.stringify({geometry,passed,errors},null,2));console.log(JSON.stringify({passed,errors}));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
