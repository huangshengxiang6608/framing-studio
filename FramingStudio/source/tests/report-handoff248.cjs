// Offline DOM test. Requires linkedom via NODE_PATH.
const assert=require('assert/strict'),{parseHTML}=require('linkedom'),{context,fixture}=require('./audit-performance247.cjs');
const c=context(),{window,document}=parseHTML('<html><head></head><body><button id="save">Save</button><div class="layout"><div class="stage"></div></div></body></html>');
c.ctx.document=document;c.ctx.DeflectionFraming91={park(){}};let saved=0;document.getElementById('save').addEventListener('click',()=>saved++);
c.run(`globalThis.handoff248={p:argument,floor:1,key:'F1'};handoff248.result=Engine.generate(handoff248.p);globalThis.generated248=[];ExcelSync.generateReport=s=>generated248.push(s);WorkspacePages.init({get:()=>handoff248,toast(){}});`,c.run(fixture,'TB'));
const select=s=>document.querySelector(s),click=async s=>{assert(select(s),s);select(s).dispatchEvent(new window.Event('click',{bubbles:true}));await new Promise(resolve=>setImmediate(resolve))};
(async()=>{
 for(const section of ['A','B']){
  c.run('WorkspacePages.render(argument)','report'+section);
  assert(select('#wp-report-help248'));assert(select('#wp-report-help248').textContent.includes('Microsoft Excel'));
  assert(!select('[data-wp=report-help]').hasAttribute('disabled'));assert.equal(select('[data-wp=generate-report]'),null);
  assert.equal(select('[data-wp=generate-both]'),null);await click('[data-wp=report-help]');await click('[data-wp=save-report-project]');
  assert.equal(c.run('generated248.length'),0,'Browser handoff never claims to generate an Excel report');
 }
 assert.equal(saved,2,'Handoff uses the existing validated project-save flow');
 c.run('globalThis.chrome={webview:{postMessage(){}}}');
 for(const section of ['A','B']){
  c.run('WorkspacePages.render(argument)','report'+section);assert.equal(select('#wp-report-help248'),null);
  assert(!select('[data-wp=generate-report]').hasAttribute('disabled'));await click('[data-wp=generate-report]');
  assert.equal(c.run('generated248.at(-1)'),section);await click('[data-wp=generate-both]');assert.equal(c.run('generated248.at(-1)'),'AB');
 }
 c.run('globalThis.savedState248=ExcelSync.state;ExcelSync.state=()=>({...savedState248(),busy:true});WorkspacePages.render("reportA")');
 assert(select('[data-wp=generate-report]').hasAttribute('disabled'));assert(select('[data-wp=generate-both]').hasAttribute('disabled'));
 console.log('PASS browser report instructions/project-save handoff and unchanged native A/B/AB generation and busy guards');
})().catch(e=>{console.error(e);process.exitCode=1});
