// Reuse the real Summary Check UI flow, including all original A/B assertions.
const fs=require('fs'),path=require('path'),Module=require('module');
const file=path.join(__dirname,'summary-sections205-ui.cjs');let source=fs.readFileSync(file,'utf8');
source=source.replace("await run('OK / NOT OK');await page.locator",`await run('NOT OK / OK');
const companion=row().locator('[data-audit-deflection211]');await companion.waitFor();
const label=await companion.innerText();assert(label.includes('最大 |δ|'));assert(label.includes('僅供參考，不作通過判定'));
assert((await row().locator('[data-audit-section205="A"]').innerText()).includes('未通過'));
assert(!(await row().locator('[data-audit-section205="B"]').innerText()).includes('未通過'));
await companion.locator('summary').click();assert((await companion.innerText()).includes('Table 3.2 · For general use'));assert((await companion.innerText()).includes('不覆蓋 Section A／B 判定'));
const before211=await page.evaluate(()=>JSON.stringify(StudioHost.get().p));
const parity211=await page.evaluate(async()=>{const p=StudioHost.get().p,r=Engine.generate(p),a=Loading.audit(p,r,BeamLoadUI.summary211),b=await AuditRunner132.run(p,r,{beamSummary:BeamLoadUI.summary211});return JSON.stringify(a)===JSON.stringify(b);});assert(parity211);
await page.setViewportSize({width:852,height:1000});await row().scrollIntoViewIfNeeded();await page.screenshot({path:path.resolve(__dirname,'../../../tmp/summary211.png')});
assert(!(await companion.evaluate(e=>e.scrollWidth>e.clientWidth+1)));assert.equal(await page.evaluate(()=>JSON.stringify(StudioHost.get().p)),before211);
// A pending beam displays no stale or zero deflection; changing inputs invalidates the list.
await page.evaluate(()=>{const old=BeamLoadUI.summary211;window.originalSummary211=old;BeamLoadUI.summary211=(p,r)=>['MB','SB','TB','CB'].includes(r.kind)?{state:'pending',reason:'測試：支承待確認'}:null;});
await page.locator('[data-ex="audit-run131"]').click();await page.waitForFunction(()=>document.querySelector('[data-audit-progress132]').textContent==='检查完成');assert((await companion.innerText()).includes('支承待確認'));assert(!(await companion.innerText()).includes('最大 |δ|'));
await page.evaluate(()=>{BeamLoadUI.summary211=originalSummary211;StudioHost.get().p.name+=' changed';StudioHost.navigate('beams');});assert.equal(await page.locator('[data-audit-deflection211]').count(),0);assert((await page.locator('.summary-issues131').innerText()).includes('输入已改变'));
console.log('PASS Summary companion, sync/async parity, A/B preserved, expandable assumptions, pending/stale suppression, narrow viewport and no mutation');
await run('OK / NOT OK');await page.locator`);
const m=new Module(file,module);m.filename=file;m.paths=module.paths;m._compile(source,file);
