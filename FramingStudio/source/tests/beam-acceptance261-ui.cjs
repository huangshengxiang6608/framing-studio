const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{pathToFileURL}=require('url'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1543,height:884}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(pathToFileURL(path.resolve(__dirname,'../../assets/index.html')).href);
 const {context}=require('./audit-performance247.cjs'),{fixture}=require('./beam-acceptance261.cjs'),c=context(),base=c.run(fixture,'SB');
 for(const [dl,pass] of [[6,true],[15,false]]){
  const p=JSON.parse(JSON.stringify(base)),key=Object.keys(p.explorer.reportB)[0],o=p.explorer.members[key];o.beamSpan=7;o.beamLoads[0].b=7;o.beamLoads[0].dl=dl;
  await page.locator('#file').setInputFiles({name:'test261.framing.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});await page.waitForFunction(()=>document.querySelector('#file').value==='');
  await page.evaluate(()=>StudioHost.navigate('beams'));
  if(!await page.locator('.summary-issues131').evaluate(e=>e.open))await page.locator('.summary-issues131 > summary').click();
  await page.locator('[data-ex="audit-run131"]').click();await page.waitForFunction(()=>document.querySelector('[data-audit-progress132]')?.textContent==='检查完成');
  await page.evaluate(key=>{const p=StudioHost.get().p;for(const n of ['selected','reportA','reportB'])p.explorer[n]={[key]:true}},key);
  await page.evaluate(()=>StudioHost.navigate('checks'));
  const mark=await page.locator('.ex-floors [data-floor="1"]').getAttribute('data-check-status');assert.equal(mark,pass?'✓':'✕');
  const actual=await page.evaluate(()=>{const p=StudioHost.get().p,out=Loading.run(p,StudioHost.get().result,'B'),key=Object.keys(p.explorer.reportB)[0],row=out.rows.find(r=>r.floor+'|'+r.token===key);return {gate:Loading.beamAcceptance261(p,row),n87:row.result.values.N87,autoFailed:row.result.autoFailed,A:RCPlan.build(p,'A',[key]).batches.length,B:RCPlan.build(p,'B',[key]).batches.length}});
  assert.equal(actual.gate.pass,pass);assert.equal(actual.gate.spanDepth,false);assert.equal(actual.gate.rc,true);assert.equal(actual.n87,'NOT OKAY');assert.equal(actual.autoFailed,false);assert.equal(actual.A>0,pass);assert.equal(actual.B>0,pass);
  if(process.env.BEAM261_OUTPUT){fs.mkdirSync(process.env.BEAM261_OUTPUT,{recursive:true});await page.screenshot({path:path.join(process.env.BEAM261_OUTPUT,`browser-${pass?'pass':'fail'}.png`)});}
 }
 assert.deepEqual(errors,[]);console.log('PASS real browser import/full audit/Member floor badge/A+B gate: RC pass + span fail + actual pass accepted; both serviceability failures rejected; N87 retained NOT OKAY; no page errors');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
