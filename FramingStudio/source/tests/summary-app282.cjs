const assert=require('assert/strict'),{webcrypto}=require('crypto'),{parseHTML}=require('linkedom'),{context}=require('./audit-performance247.cjs');
const c=context(),{document,window}=parseHTML('<html><head></head><body><aside id="side"></aside></body></html>');
c.ctx.document=document;c.ctx.crypto=webcrypto;
c.run(`globalThis.h282={p:Engine.clone(loading115Tests().projects.slab),floor:1,key:'F1'};
 h282.result=Engine.generate(h282.p);globalThis.calls282=0;globalThis.messages282=[];
 globalThis.ui282=ExplorerUI({get:()=>h282,refresh(){},toast(x){messages282.push(x)},transact(fn){fn();return true;}});
 window.ExcelProject=()=>({project:Engine.clone(h282.p)});
 ExcelSync.verifyCheck279=async()=>{calls282++;throw Error('Summary unexpectedly invoked Excel')};
 ExcelSync.state=()=>({busy:true});
 ExcelSync.nativeState279=()=>({status:'Excel RC 已核對',records:[],issues:[],stale:false});`);
const render=()=>{document.getElementById('side').innerHTML=c.run('ui282.beamInputs(null)');assert.equal(document.querySelector('[data-native-check279]'),null)};
async function click(action){
 render();const button=document.querySelector(`[data-ex="${action}"]`);assert(button&&!button.disabled);
 const start=c.run('messages282.length');button.dispatchEvent(new window.Event('click',{bubbles:true}));
 const deadline=Date.now()+45000;
 while(c.run('messages282.length')===start&&Date.now()<deadline)await new Promise(r=>setTimeout(r,20));
 await new Promise(r=>setTimeout(r,30));
 assert(c.run('messages282[messages282.length-1]').includes('全樓 Check、Member Check'),JSON.stringify(c.run('messages282')));
 assert.equal(c.run('calls282'),0,'Summary stays App-only even while Excel is busy');
 render();assert(document.querySelector('[data-audit-progress132]').textContent.includes('完成'));
}
(async()=>{
 await click('audit-run131');const full=JSON.stringify(c.run('ui282.getOutput().rows'));
 await click('audit-incremental228');assert.equal(JSON.stringify(c.run('ui282.getOutput().rows')),full,'Incremental and full App results agree');
 c.run('ExplorerUI.refreshNative279()');assert.equal(document.querySelector('[data-native-check279]'),null);
 c.run('ExcelSync.nativeState279=()=>({status:"Excel RC 已核對",records:[],issues:[],stale:true})');render();
 document.getElementById('side').innerHTML=c.run("ui282.render('checks')");assert(document.querySelector('[data-native-check279]'),'Member Check keeps native verification');
 assert(document.querySelector('[data-native-check279]').textContent.includes('已失效'));
 console.log('PASS Summary full/incremental App-only with Excel busy; identical App rows; no completed/stale/native-refresh panel; Member native panel retained');
})().catch(e=>{console.error(e);process.exitCode=1});
