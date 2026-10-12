const assert=require('assert/strict'),{parseHTML}=require('linkedom'),{context,fixture}=require('./audit-performance247.cjs');
const c=context(),{document,window}=parseHTML('<html><head></head><body><button id="save"></button><div class="layout"><div class="stage"></div></div></body></html>');c.ctx.document=document;c.ctx.DeflectionFraming91={park(){}};c.ctx.location={hostname:'127.0.0.1'};
const requests=[],events=[{progress:'Excel started'},{record:{ok:true,runId:'20261012-123456-abcdef12',workbook:'RC-filled.xlsm',reportSection:'A',files:[]}},{sectionDone:'A'},{done:true}],received=[];
c.ctx.fetch=async(url,options={})=>{requests.push({url,options});if(url.endsWith('/capabilities'))return{ok:true,json:async()=>({available:true,token:'test-token'})};assert.equal(options.headers['X-Framing-Key'],'test-token');if(url.endsWith('/run'))return {ok:true,json:async()=>({id:'a'.repeat(32)})};const cursor=+url.split('/').at(-1);return {ok:true,json:async()=>({cursor:cursor+1,event:events[cursor]})};};
c.run(`globalThis.local251={p:argument,floor:1,key:'F1'};local251.result=Engine.generate(local251.p);WorkspacePages.init({get:()=>local251,toast(){}});`,c.run(fixture,'TB'));
const $=s=>document.querySelector(s),click=async s=>{$(s).dispatchEvent(new window.Event('click',{bubbles:true}));await new Promise(r=>setImmediate(r))};
(async()=>{
 await c.run('LocalExcel251.probe()');assert(c.run('ExcelSync.available()'));
 c.run('globalThis.generated251=[];ExcelSync.generateReport=s=>generated251.push(s)');
 for(const section of ['A','B']){c.run('WorkspacePages.render(argument)','report'+section);assert(!$('[data-wp=generate-report]').disabled);assert.equal($('#wp-report-help248'),null);await click('[data-wp=generate-report]');assert.equal(c.run('generated251.at(-1)'),section);await click('[data-wp=generate-both]');assert.equal(c.run('generated251.at(-1)'),'AB');}
 c.ctx.capture251=e=>received.push(e);c.run('ExcelSync.receive=async e=>capture251(e)');await c.run("LocalExcel251.send({kind:'excel-run',jobs:[{type:'RC',_reportSection:'A'}]})");assert.deepEqual(received,events);assert.equal(requests.filter(x=>x.url.endsWith('/run')).length,1);
 c.ctx.fetch=async()=>({ok:false,status:503,json:async()=>({error:'Disconnected'})});await c.run("LocalExcel251.send({kind:'excel-run',jobs:[]})");assert(received.at(-1).done);assert.equal(received.at(-1).error,'Disconnected');
 console.log('PASS browser local-Excel capability, A/B/AB generation dispatch, authenticated job/event transport, record delivery and connection-error completion');
})().catch(e=>{console.error(e);process.exitCode=1});

