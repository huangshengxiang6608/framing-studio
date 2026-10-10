// DOM-only integration test (no browser). Install linkedom 0.18.12 and set NODE_PATH.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{parseHTML}=require('linkedom'),{context}=require('../../verification/integration143.cjs'),fixture=require('./tributary187.cjs');
const root=path.resolve(__dirname,'../..'),c=context(root),{document,window}=parseHTML('<html><body><aside id="side"></aside></body></html>');
// linkedom's select has a getter only; supply the browser-standard value setter.
const descriptor=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value');
if(!descriptor.set)Object.defineProperty(window.HTMLSelectElement.prototype,'value',{...descriptor,set(value){const options=[...this.querySelectorAll('option')];for(const o of options)o.removeAttribute('selected');const selected=options.find(o=>o.value===String(value));if(selected)selected.setAttribute('selected','');}});
c.ctx.document=document;c.ctx.setTimeout=setTimeout;c.ctx.clearTimeout=clearTimeout;
const pending=[],listen=document.addEventListener.bind(document);document.addEventListener=(type,fn,...args)=>listen(type,e=>{const p=fn(e);if(p?.then)pending.push(p);},...args);
const $=s=>document.querySelector(s),input=(id,value)=>{const el=$('#'+id);el.value=value;el.dispatchEvent(new window.Event('input',{bubbles:true}));};
async function click(s){$(s).dispatchEvent(new window.Event('click',{bubbles:true}));await Promise.all(pending.splice(0));}
(async()=>{
 c.run(`globalThis.test227={p:Engine.clone(argument),floor:1,key:'F1',messages:[]};test227.result=Engine.generate(test227.p);test227.host={get:()=>test227,repaint(){},refresh(){},toast:s=>test227.messages.push(s),transact(fn){fn();return true;},floor(f){test227.floor=f;},focusMember(){}};test227.ui=ExplorerUI(test227.host);test227.ui.selectPlanMember({kind:'MB',id:'B1'});`,fixture.p);
 const render=()=>c.run(`(()=>{const t=test227;document.getElementById('side').innerHTML=t.ui.render('checks');BeamRebar116.decorate({...t,selected:{kind:'MB',id:'B1'},memberResult:(f,k)=>t.ui.getMemberResult227(t.p,f,k)});})()`);
 render();assert.equal($('.rebar-rc227').textContent,'RC 待計算');assert.equal($('#beam-rebar116 svg circle'),null);assert($('.rebar-summary227').textContent.includes('待自動選筋'));
 await c.run('test227.ui.calculate()');render();assert(!$('.rebar-rc227').textContent.includes('待計算'));
 assert.equal(document.querySelectorAll('#beam-rebar116 .rebar-editor116').length,4);assert.equal(document.querySelectorAll('#beam-rebar116 [hidden]').length,0);assert($('#beam-rebar116 [data-ex=steel]'));assert.equal(document.querySelectorAll('[data-rebar-edit]').length,0);
 const ids=Array.from(document.querySelectorAll('[id]'),x=>x.id);assert.equal(ids.length,new Set(ids).size);
 const before=c.run('JSON.stringify(test227.p)'),maps=c.run('JSON.stringify([test227.p.explorer.selected,test227.p.explorer.reportA,test227.p.explorer.reportB])');
 input('ex-top-counts','2, 0, 0, 0, 1');input('ex-top-dia','20');input('ex-bottom-counts','4, 3');input('ex-bottom-dia','25');input('ex-link-space','150');
 assert.equal($('#ex-steel-mode').value,'MANUAL');assert.equal($('.rebar-rc227').textContent,'RC 待重新檢查');assert.equal($('.rebar-rc227').dataset.tone,'pending');assert($('[data-rebar-upper]').textContent.includes('第 5 層 1T20'));assert($('[data-rebar-lower]').textContent.includes('4T25'));assert.equal(c.run('JSON.stringify(test227.p)'),before,'Draft does not mutate saved project');
 await click('#beam-rebar116 [data-ex=steel]');
 const result=c.run(`(()=>{const t=test227,m=Loading.members(t.p,t.result,1).find(x=>x.id==='B1');return {steel:Loading.input(t.p,1,m.token).steel,row:t.ui.getMemberResult227(t.p,1,m.token),maps:JSON.stringify([t.p.explorer.selected,t.p.explorer.reportA,t.p.explorer.reportB])};})()`);
 assert.equal(result.steel.C40,2);assert.equal(result.steel.C110,1);assert.equal(result.steel.D110,20);assert.equal(result.steel.C44,4);assert.equal(result.steel.C45,3);assert.equal(result.steel.D44,25);assert.equal(result.steel.H58,150);assert(result.row);assert.equal(result.maps,maps);render();assert(!$('.rebar-rc227').textContent.includes('重新'));
 const saved=c.run('JSON.stringify(test227.p)');input('ex-bottom-counts','-1');await click('[data-ex=steel]');assert.equal(c.run('JSON.stringify(test227.p)'),saved);assert(c.run("test227.messages.at(-1).includes('非负整数')"));
 render();c.run("Engine.floorModel(test227.result,1).beams.find(b=>b.id==='B1').displayKind='CB'");render();assert.equal($('#rebar-editor116-bottom h4').textContent,'上筋 · 受拉面');assert.equal($('.rebar-fields227').firstElementChild.id,'rebar-editor116-bottom');assert($('[data-rebar-upper]').textContent.includes('4T25'));
 input('ex-bottom-counts','6');assert($('[data-rebar-upper]').textContent.includes('6T25'));assert.equal(document.querySelectorAll('circle[fill="#9c3d10"]').length,6);
 c.run("delete Engine.floorModel(test227.result,1).beams.find(b=>b.id==='B1').displayKind");await click('[data-ex=auto-steel]');assert.equal(c.run(`(()=>{const t=test227,m=Loading.members(t.p,t.result,1).find(x=>x.id==='B1');return Loading.input(t.p,1,m.token).steel;})()`),null);
 render();c.run("test227.p.name+=' changed'");render();assert.equal($('.rebar-rc227').textContent,'RC 待計算');
 // RC status must use the same L/d-excluding criterion as Summary Check.
 const statuses=c.run(`(()=>{const values=Object.fromEntries(['N40','N44','N52','N59','N69','N77','N78'].map(k=>[k,'OKAY']));values.N87='NOT OKAY';const row={kind:'MB',result:{status:'NOT OK',fail:['挠度'],values}};return {ok:BeamRebar116.status227({},row,false),dirty:BeamRebar116.status227({},row,true),pending:BeamRebar116.status227({},null,false)};})()`);
 assert.equal(statuses.ok.tone,'pass');assert.equal(statuses.dirty.tone,'pending');assert.equal(statuses.pending.tone,'pending');
 const fail=c.run(`BeamRebar116.status227({}, {kind:'MB',result:{status:'NOT OK',fail:['最大剪应力']}},false)`);assert.equal(fail.tone,'fail');assert.equal(fail.text,'RC 未通過');
 console.log('PASS actual Member Check DOM: visible editors, AUTO/pending/fresh/dirty states, unique input IDs, 8-layer save mapping, validation, CB upper tension mapping, restore AUTO, stale rejection and unchanged report selections');
})().catch(e=>{console.error(e);process.exitCode=1;});
