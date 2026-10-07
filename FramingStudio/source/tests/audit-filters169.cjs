const path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1450,height:884}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('FramingStudio/assets/index.html')).href);
 await page.evaluate(()=>{StudioHost.navigate('beams');window.auditFixture169=[];window.auditRuns169=0;AuditRunner132.run=async()=>{auditRuns169++;return {items:structuredClone(auditFixture169),total:4483}};});
 await page.locator('.summary-issues131 > summary').click();
 const select=k=>page.locator('[data-audit-filter131="'+k+'"]'),rows=page.locator('.summary-issues131 tbody tr');
 const run=async(items)=>{const n=await page.evaluate(()=>auditRuns169);await page.evaluate(items=>{auditFixture169=items},items);await page.locator('[data-ex="audit-run131"]').click();await page.waitForFunction(n=>auditRuns169===n+1&&document.querySelector('[data-audit-progress132]')?.textContent==='检查完成',n);};
 const item=(id,kind,status,floor=1)=>({id,kind,status,floor,framing:'F01',path:status==='MODEL'?'模型':'Check',reasons:['Regression fixture']});
 await run([item('OLD_MB','MODEL','MODEL')]);await select('kind').selectOption('MODEL');await select('status').selectOption('MODEL');
 const current=Array.from({length:119},(_,i)=>item('MB'+(i+1),'MB','NOT OK'));
 await run(current);assert.equal(await rows.count(),119,'Removed MODEL filters must not invisibly hide 119 current rows');assert.equal(await select('kind').inputValue(),'all');assert.equal(await select('status').inputValue(),'all');
 await select('kind').selectOption('MB');await select('status').selectOption('NOT OK');await run([...current,item('SB1','SB','INPUT REQUIRED')]);assert.equal(await rows.count(),119,'Valid filters survive rerun');assert.equal(await select('kind').inputValue(),'MB');assert.equal(await select('status').inputValue(),'NOT OK');
 await select('kind').selectOption('SB');assert.equal(await rows.count(),0,'A valid combination with zero matches stays selected');assert((await page.locator('.summary-issues131').innerText()).includes('当前筛选没有待处理项目'));
 await run([item('MB1','MB','REVIEW REQUIRED')]);assert.equal(await rows.count(),1);await select('status').selectOption('REVIEW REQUIRED');assert.equal(await rows.count(),1,'Every returned status is representable');
 await run([]);assert.equal(await rows.count(),0);assert.equal(await select('status').inputValue(),'all');
 await run(current);await page.screenshot({path:path.resolve('tmp/audit-filters169.png')});assert.equal(await rows.count(),119);assert.deepEqual(errors,[]);
 console.log('Stale kind/status filters reset; 119 rows restored; valid filters and intentional empty intersections retained; new statuses selectable; empty audit handled; no browser errors');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
