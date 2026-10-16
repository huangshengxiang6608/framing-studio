const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright'),{fixture}=require('./beam-type294.cjs');
(async()=>{
 const out=path.resolve('tmp/release294');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const page=await browser.newPage({viewport:{width:1650,height:1050},acceptDownloads:true}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.goto(pathToFileURL(path.resolve('FramingStudio/assets/index.html')).href);await page.waitForFunction(()=>window.StudioHost);
  await page.evaluate(()=>{const draw=Drawing.plan;Drawing.plan=(...args)=>window.beamPlot294=draw(...args);});
  const load=async p=>{await page.locator('#file').setInputFiles({name:'beam294.framing.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});await page.evaluate(()=>StudioHost.navigate('checks'));};
  const state=()=>page.evaluate(()=>JSON.stringify(StudioHost.get().p));
  const beam=()=>page.evaluate(()=>{const h=StudioHost.get();return Engine.floorModel(h.result,h.floor).beams.find(b=>b.id==='EDGE');});
  const open=async()=>{
   await page.evaluate(()=>{delete window.beamPlot294;StudioHost.repaint();});await page.waitForFunction(()=>window.beamPlot294);
   const pos=await page.evaluate(()=>{const h=StudioHost.get(),b=Engine.floorModel(h.result,h.floor).beams.find(b=>b.id==='EDGE'),v=beamPlot294;return {x:v.ox+(b.a[0]+.43*(b.z[0]-b.a[0]))*v.scale,y:v.oy+(b.a[1]+.43*(b.z[1]-b.a[1]))*v.scale};});
   await page.locator('#canvas').click({button:'right',position:pos});await page.locator('#memberinfo').waitFor({state:'visible'});
  };
  const p=fixture();p.types.F01.beams=p.types.F01.beams.filter(b=>b.id!=='TOP_CB');
  await load(p);assert.equal((await beam()).kind,'CB');await open();const before=await state();
  await page.locator('#memberkind').selectOption('MB');await page.locator('#sizeapply').click();
  assert.equal((await beam()).kind,'MB');assert.equal((await beam()).manualKind294,'MB');
  await open();assert.match(await page.locator('#memberinfo').innerText(),/未建立两端有效支承路径|未找到支承/);
  const changed=await state();await page.locator('#memberclose').click();await page.locator('#undo').click();assert.equal(await state(),before,'One Undo restores input and auto type');assert.equal((await beam()).kind,'CB');
  await load(JSON.parse(changed));await open();assert.equal(await page.locator('#memberkind').inputValue(),'MB');
  await page.locator('#memberb').fill('350');await page.locator('#sizeapply').click();assert.equal((await beam()).kind,'MB');assert.equal((await beam()).b,.35);
  await open();await page.locator('#memberd').fill('901');const valid=await state();await page.locator('#sizeapply').click();assert.equal(await state(),valid,'Invalid dimension leaves stored project unchanged');assert.equal(await page.locator('#memberd').inputValue(),'901');assert.match(await page.locator('#memberinfo').innerText(),/未应用/);
  await page.locator('#memberd').fill('900');await page.locator('#sizeapply').click();await open();await page.locator('#memberreset199').click();assert.equal((await beam()).kind,'MB');assert.equal((await beam()).manualKind294,'MB','Reset dimensions does not reset chosen type');
  await open();await page.locator('#memberclose').click();
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#save').click()]);await download.saveAs(path.join(out,'beam294.saved.framing.json'));
  await page.locator('#file').setInputFiles(path.join(out,'beam294.saved.framing.json'));assert.equal((await beam()).kind,'MB');assert.equal((await beam()).manualKind294,'MB');
  await load(fixture());await open();assert.equal((await beam()).kind,'MB');assert.match(await page.locator('#memberbody').innerText(),/TOP_CB/);assert.match(await page.locator('#memberbody').innerText(),/BOTTOM_CB/);
  await page.screenshot({path:path.join(out,'beam294-connected.png')});
  assert.deepEqual(errors,[]);console.log('PASS real card type apply, size-only edit, invalid draft, reset, Undo, Save Project/reopen and physical support labels; zero page errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
