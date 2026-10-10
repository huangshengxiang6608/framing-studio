// DOM-only batch application regression; linkedom 0.18.12 required via NODE_PATH.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{parseHTML}=require('linkedom'),{context}=require('../../verification/integration143.cjs');
const c=context(path.resolve(__dirname,'../..')),{document,window}=parseHTML('<html><body><aside id="side"></aside></body></html>'),pending=[];
c.ctx.document=document;c.ctx.setTimeout=setTimeout;c.ctx.clearTimeout=clearTimeout;
const listen=document.addEventListener.bind(document);document.addEventListener=(type,fn,...rest)=>listen(type,e=>{const result=fn(e);if(result?.then)pending.push(result);},...rest);
c.run(fs.readFileSync(path.join(__dirname,'loading115-browser.js'),'utf8'));
const $=s=>document.querySelector(s),buttons=()=>[...document.querySelectorAll('[data-ex=audit-tb-apply222]')],click=async el=>{el.dispatchEvent(new window.Event('click',{bubbles:true}));await Promise.all(pending.splice(0));};
(async()=>{
 c.run(`globalThis.batch228={p:Engine.clone(loading115Tests().projects.slab),floor:1,key:'F1',messages:[],undo:[],runs:0};const t=batch228;for(const b of t.p.types.F1.beams.slice(0,2)){b.kind='TB';b.widthMode='manual';b.b=250;b.d=null;b.depthOverride184=250;}t.result=Engine.generate(t.p);for(const b of Engine.floorModel(t.result,1).beams.filter(b=>b.kind==='TB'))t.p.explorer.members['1|'+Loading.token('TB',b)]={mode:'manual',beamSelfWeight:true,beamLoads:[{type:'line',a:0,b:Loading.beamSpan(b).value,dl:130,ll:10}]};const original=AuditRunner132.run;AuditRunner132.run=(...args)=>{t.runs++;return original(...args);};t.render=()=>{document.getElementById('side').innerHTML=t.ui.beamInputs(null);};t.host={get:()=>t,refresh:()=>t.render(),toast:s=>t.messages.push(s),transact(fn){t.undo.push(Engine.clone(t.p));fn();t.result=Engine.generate(t.p);t.render();return true;}};t.ui=ExplorerUI(t.host);t.render();`);
 assert($('[data-ex=audit-incremental228]').hasAttribute('disabled'));
 await c.run('batch228.ui.calculate()');assert(!$('[data-ex=audit-incremental228]').hasAttribute('disabled'));assert.equal(buttons().length,2);
 const before=c.run('JSON.stringify(batch228.p)'),selection=$('[data-audit-filter131=floor]').value;
 $('.summary-issues131 .table-wrap').scrollTop=125;$('#side').scrollTop=300;
 await click(buttons()[0]);assert.equal(c.run('batch228.runs'),1,'Apply must not start a check');assert.equal(buttons().length,2);assert(buttons()[0].hasAttribute('disabled'));assert(!buttons()[1].hasAttribute('disabled'));assert($('.summary-issues131').textContent.includes('以下為上次檢查結果'));assert.equal($('.summary-issues131 .table-wrap').scrollTop,125);assert.equal($('#side').scrollTop,300);assert.equal($('[data-audit-filter131=floor]').value,selection);
 await click(buttons()[1]);assert.equal(c.run('batch228.runs'),1);assert(buttons().every(b=>b.hasAttribute('disabled')));
 c.run('batch228.p=batch228.undo.pop();batch228.result=Engine.generate(batch228.p);batch228.render();');assert(buttons()[0].hasAttribute('disabled'));assert(!buttons()[1].hasAttribute('disabled'),'Undo restores remaining recommendation');
 await click(buttons()[1]);await click($('[data-ex=audit-incremental228]'));assert.equal(c.run('batch228.runs'),2);assert($('.summary-issues131').textContent.includes('更新完成：變更／受影響'));assert(!$('.summary-issues131').textContent.includes('以下為上次檢查結果'));assert(!buttons().some(b=>!b.hasAttribute('disabled')));
 assert.notEqual(c.run('JSON.stringify(batch228.p)'),before);
 c.run(`(()=>{const t=batch228,p=Engine.clone(loading115Tests().projects.slab);p.groups[0].sh=900;p.types.F1.beamDepth=250;Object.assign(p.types.F1.beams[0],{kind:'SB',d:250,b:250});t.p=p;t.result=Engine.generate(p);const b=Engine.floorModel(t.result,1).beams.find(b=>b.id==='B1');p.explorer.members['1|'+Loading.token('SB',b)]={mode:'manual',beamLoads:[{type:'line',a:0,b:6,dl:25,ll:15}],beamSelfWeight:true};t.render();})()`);
 await c.run('batch228.ui.calculate()');const sb=$('[data-ex=audit-sb-apply220]');assert(sb);const runs=c.run('batch228.runs');await click(sb);assert.equal(c.run('batch228.runs'),runs);assert($('[data-ex=audit-sb-apply220]').hasAttribute('disabled'));assert($('.summary-issues131').textContent.includes('以下為上次檢查結果'));
 console.log('PASS real Summary DOM: two sequential TB applications without checks, preserved list/filter/scroll, duplicate guard, undo state and explicit incremental update');
})().catch(e=>{console.error(e);process.exitCode=1;});

