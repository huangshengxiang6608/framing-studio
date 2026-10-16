const assert=require('assert/strict'),{webcrypto}=require('crypto'),{parseHTML}=require('linkedom'),{context}=require('./audit-performance247.cjs');
const c=context(),{document,window}=parseHTML('<html><head></head><body><aside id="side"></aside></body></html>');c.ctx.document=document;c.ctx.crypto=webcrypto;c.ctx.sent279=[];
c.run(`globalThis.h279={p:Engine.clone(loading115Tests().projects.slab),floor:1,key:'F1'};h279.result=Engine.generate(h279.p);globalThis.ui279=ExplorerUI({get:()=>h279,refresh(){},toast(){},transact(fn){fn();h279.result=Engine.generate(h279.p);return true;}});window.ExcelProject=()=>({project:Engine.clone(h279.p)});WorkspacePages.refresh=()=>{};WorkspacePages.clearPDF=()=>{};window.chrome={webview:{postMessage:x=>sent279.push(x)}};`);
(async()=>{
 document.getElementById('side').innerHTML=c.run("ui279.render('checks')");
 const button=document.querySelector('[data-native-check279] button');assert(button);assert(button.textContent.includes('更新至EXCEL並核對'));
 button.dispatchEvent(new window.Event('click',{bubbles:true}));
 const deadline=Date.now()+45000;while(!c.ctx.sent279.length&&Date.now()<deadline)await new Promise(r=>setTimeout(r,20));
 assert.equal(c.ctx.sent279.length,1,'Member Check button invokes native verification after the App audit');
 assert(document.querySelector('[data-native-check279] button').disabled);
 const msg=c.ctx.sent279[0];for(const job of msg.jobs)await c.run('ExcelSync.receive({record:argument})',{ok:true,preparedRC279:true,compared:10,fingerprint:job.fingerprint,differences:[]});await c.run('ExcelSync.receive({done:true})');
 assert(document.querySelector('[data-native-check279]').textContent.includes('Excel RC 已核對'));
 c.run("h279.p.name='changed';ExplorerUI.refreshNative279()");assert(document.querySelector('[data-native-check279]').textContent.includes('已失效'));
 console.log('PASS actual Member Check button -> App audit -> native dispatch; busy/result/stale panel');
})().catch(e=>{console.error(e);process.exitCode=1});
