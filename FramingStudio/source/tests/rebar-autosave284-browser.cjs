// Requires Playwright and installed Edge. Uses an isolated ephemeral local test server.
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require('playwright');
const app=path.resolve(__dirname,'../..'),{context}=require('../../verification/integration143.cjs'),c=context(app),fixture=require('./tributary187.cjs');
const p=c.run(`(()=>{const p=Engine.clone(argument);p.name='Isolated auto-save regression';const b=p.types.F1.beams.find(b=>b.id==='B1');Object.assign(b,{b:1800,d:3200,widthMode:'manual',depthOverride184:3200});LoadData.setFloor(p,1,{...LoadData.floor(p,1),direction:'Y'});const result=Engine.generate(p);for(const beam of Engine.floorModel(result,1).beams){const token=Loading.token(beam.kind,beam);p.explorer.members['1|'+token]={mode:'manual',beamSelfWeight:true,beamLoads:[{type:'line',a:0,b:Loading.beamSpan(beam).value,dl:100,ll:10}]};if(beam.id==='B1')p.explorer.selected['1|'+token]=true;}return p;})()`,fixture.p);
const html=fs.readFileSync(path.join(app,'assets/index.html'),'utf8').replace(/(<script id="seed"[^>]*>)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(p)+b);
(async()=>{
 const server=http.createServer((req,res)=>{if(req.url==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html)}else{res.statusCode=404;res.end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{
 browser=await chromium.launch({headless:true,channel:'msedge'});const page=await browser.newPage({viewport:{width:1357,height:884}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/');await page.waitForFunction(()=>window.StudioHost);await page.locator('#nav [data-tab="beamInputs"]').count().then(async n=>{if(n)await page.locator('#nav [data-tab="beamInputs"]').click();else await page.getByRole('button',{name:'09 Summary Check',exact:true}).click()});
 await page.locator('.summary-issues131 > summary').click();await page.locator('[data-ex="audit-run131"]').click();await page.waitForFunction(()=>document.querySelector('[data-audit-progress132]')?.textContent.includes('检查完成'));
 await page.getByRole('button',{name:'10 Member Check',exact:true}).click();await page.locator('[data-ex="choose"]').filter({hasText:/^B1$/}).first().click();
 const field=k=>page.locator('[data-inline-rebar234="'+k+'"]'),value=()=>page.evaluate(()=>{const h=StudioHost.get(),b=Engine.floorModel(h.result,1).beams.find(x=>x.id==='B1'),token=Loading.token(b.kind,b);return Loading.input(h.p,1,token).steel||null;});

 const before=await value();await field('bottom:0:count').fill('20');assert.deepEqual(await value(),before);await field('bottom:1:count').click();assert.equal((await value()).C44,20);await page.waitForFunction(()=>document.activeElement?.dataset.inlineRebar234==='bottom:1:count');
 assert.equal(await page.locator('#undo').isDisabled(),false);assert(await page.evaluate(()=>!!JSON.parse(localStorage.getItem('framing-studio-explorer-e2')).explorer.members));
 await page.waitForFunction(()=>document.querySelector('.rebar-status116')?.textContent.includes('App Check 已更新'));
 await page.locator('#undo').click();assert.deepEqual(await value(),before,'Actual app undo restores the pre-commit steel');
 await page.locator('[data-ex="choose"]').filter({hasText:/^B1$/}).first().click();await field('bottom:0:count').fill('20');await field('bottom:0:count').press('Enter');
 await page.locator('[data-ex="auto-steel"]').click();assert.equal(await value(),null,'Restore automatic remains available');
 assert.deepEqual(errors,[]);console.log('PASS full packaged App: draft, blur, focus, local backup, fresh check, undo and restore automatic');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
