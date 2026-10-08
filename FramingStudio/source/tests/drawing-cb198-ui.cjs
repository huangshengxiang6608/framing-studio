const path=require('path'),assert=require('assert/strict'),{pathToFileURL}=require('url'),{chromium}=require('playwright'),fixture=require('./drawing-cb198.cjs');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1117,height:884}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve(__dirname,'../../assets/index.html')).href);await page.locator('#file').setInputFiles({name:'drawing-cb.framing.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture.p))});
 await page.evaluate(()=>{const draw=Drawing.plan;Drawing.plan=(...a)=>window.plot198=draw(...a);StudioHost.navigate('review');});await page.waitForTimeout(150);
 const canvas=page.locator('#canvas'),click=async(x,y)=>{const q=await page.evaluate(({x,y})=>({x:plot198.ox+x*plot198.scale,y:plot198.oy+y*plot198.scale}),{x,y});await canvas.click({position:q});await page.waitForTimeout(80);};
 const before=await page.evaluate(()=>JSON.stringify(StudioHost.get().result));await page.locator('#review-filter191').selectOption('CB');await click(2,7);assert.equal(await page.locator('[data-review-select191="CB:M2"]').count(),1);await page.locator('#review-distance191').fill('.75');await page.locator('[data-review191="down"]').click();await page.waitForTimeout(120);
 const end=()=>page.evaluate(()=>{const r=plot198.hits.find(h=>h.id==='M1').r;return r.y+r.d/2;});assert.equal(await end(),7.75);
 await page.locator('[data-review191="none"]').click();await page.locator('#review-filter191').selectOption('MB');await click(.5,7.35);assert.equal(await page.locator('[data-review-select191="MB:M1"]').count(),1,'extended MB selectable after CB move');
 assert.equal(await page.evaluate(()=>JSON.stringify(StudioHost.get().result)),before);await page.screenshot({path:path.resolve('tmp/drawing-cb198.png')});
 await page.locator('[data-review191="restore"]').click();await page.waitForTimeout(100);assert.equal(await end(),7);await page.locator('#undo').click();await page.waitForTimeout(100);assert.equal(await end(),7.75);assert.deepEqual(errors,[]);
 console.log('PASS: UI CB move carries supported MBs, extended segment selection, restore/undo, no model changes or browser errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
