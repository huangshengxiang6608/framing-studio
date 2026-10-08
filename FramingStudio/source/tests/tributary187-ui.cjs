const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{pathToFileURL}=require('url'),{chromium}=require('playwright'),fixture=require('./tributary187.cjs');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1311,height:884}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve(__dirname,'../../assets/index.html')).href);
 await page.locator('#file').setInputFiles({name:'two-panels.framing.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture.p))});
 await page.evaluate(()=>{const old=Drawing.plan;Drawing.plan=(...args)=>{window.opt187=args[5];return window.plot187=old(...args);};StudioHost.navigate('beams');});
 await page.getByRole('button',{name:'选择 / 删除',exact:true}).click();
 const slab=page.locator('#components input[data-kind="SLAB"]');await slab.check();await page.waitForFunction(()=>window.opt187?.visible.SLAB===true);
 const before=await page.locator('#canvas').screenshot();await slab.uncheck();await page.waitForTimeout(100);const after=await page.locator('#canvas').screenshot();assert(!before.equals(after),'plan fill responds to SLAB checkbox');
 assert.equal(await page.evaluate(()=>window.opt187.points),false,'summary selection hides grid dots');
 await slab.check();
 const pos=await page.evaluate(()=>{const h=StudioHost.get(),col=Engine.floorModel(h.result,1).columns[0],r=Engine.columnRect(col);return {x:plot187.ox+r.x*plot187.scale,y:plot187.oy+r.y*plot187.scale};});
 await page.locator('#canvas').click({position:pos});await page.waitForFunction(()=>document.querySelector('.cp-current strong')?.textContent!=='—'&&window.opt187?.columnLoadArea);
 const dims=await page.evaluate(()=>{const h=StudioHost.get(),data=ColumnPanel123.planArea(h.p,h.result,1),ctx=document.querySelector('#canvas').getContext('2d'),r=document.querySelector('#canvas').getBoundingClientRect();return ColumnLoads101.badge(ctx,plot187,r.width,r.height,data,null).dimensions;});assert(dims&&dims.x>0&&dims.y>0);
 if(process.env.UI_SCREENSHOT)await page.locator('#canvas').screenshot({path:process.env.UI_SCREENSHOT});
 await page.evaluate(()=>{ColumnPanel123.clear();const h=StudioHost.get(),b=Engine.floorModel(h.result,1).beams.find(b=>b.id==='B1'),row=Loading.run(h.p,h.result,'B').rows.find(r=>r.member.id==='B1');BeamLoadUI.clear();document.querySelector('#side').innerHTML=BeamLoadUI.render({...h,data:row.input,selected:{token:row.token,member:b}},row);});
 await page.waitForFunction(()=>document.querySelector('.bl-plot')?.textContent.includes('4.00–8.00 m'));const labels=await page.locator('.bl-load129').allTextContents();assert(labels.some(t=>t.includes('0.00–4.00 m')));assert(labels.some(t=>t.includes('4.00–8.00 m')));
 assert.deepEqual(errors,[]);console.log('PASS: plan slab fill toggle, hidden grid dots in inspection, tributary X/Y badge and real segmented beam-load SVG');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
