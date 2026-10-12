// Offline DOM integration: exercise the actual Summary Check button handlers.
// Requires linkedom via NODE_PATH; does not access browser storage or projects.
const assert=require('assert/strict'),{parseHTML}=require('linkedom'),{context,fixture}=require('./audit-performance247.cjs');
const c=context(),{document,window}=parseHTML('<html><body><aside id="side"></aside></body></html>');
c.ctx.document=document;
const pending=[],listen=document.addEventListener.bind(document);
document.addEventListener=(type,fn,...args)=>listen(type,e=>{const promise=fn(e);if(promise?.then)pending.push(promise)},...args);
const button=action=>document.querySelector('[data-ex="'+action+'"]');
const click=action=>{const el=button(action);assert(el,action);el.dispatchEvent(new window.Event('click',{bubbles:true}))};
const settle=async()=>{while(pending.length)await Promise.all(pending.splice(0))};
(async()=>{
 const p=c.run(fixture,'TB');
 c.run(`globalThis.ui247={p:argument,floor:1,key:'F1',messages:[]};ui247.result=Engine.generate(ui247.p);
 const host247={get:()=>ui247,repaint(){},refresh(){document.getElementById('side').innerHTML=ui247.ui.beamInputs(null)},toast:s=>ui247.messages.push(s),transact(fn){fn();return true}};
 ui247.ui=ExplorerUI(host247);host247.refresh();`,p);
 const before=JSON.stringify(p);
 click('audit-run131');await new Promise(resolve=>setImmediate(resolve));assert(button('audit-run131').hasAttribute('disabled'),JSON.stringify(c.run('ui247.messages')));assert(button('audit-cancel132'));
 await settle();assert(!button('audit-run131').hasAttribute('disabled'));assert(!button('audit-incremental228').hasAttribute('disabled'));assert(document.querySelector('[data-audit-progress132]').textContent.includes('检查完成'));assert.equal(JSON.stringify(p),before);
 c.run(`ui247.p.types.F1.beams[0].b+=50;ui247.p.types.F1.beams[0].d+=50;ui247.p.types.F1.beams[0].depthOverride184+=50;ui247.result=Engine.generate(ui247.p);host247.refresh()`);
 click('audit-incremental228');await settle();assert(document.querySelector('[data-audit-progress132]').textContent.includes('更新完成'));
 const incremental=c.run('JSON.stringify(ui247.ui.getOutput())');
 click('audit-run131');await settle();assert.equal(c.run('JSON.stringify(ui247.ui.getOutput())'),incremental);
 click('audit-run131');await new Promise(resolve=>setImmediate(resolve));click('audit-cancel132');await settle();assert(!button('audit-run131').hasAttribute('disabled'));
 click('audit-run131');await settle();assert.equal(c.run('JSON.stringify(ui247.ui.getOutput())'),incremental);
 assert(!c.run('ui247.messages').some(s=>s.includes('未完成')));
 console.log('PASS actual Summary Check DOM buttons: full run, B/D edit, incremental/full parity, cancel and restart; project unchanged by checks');
})().catch(e=>{console.error(e);process.exitCode=1});


