// DOM-only integration test (no browser). Install linkedom 0.18.12 and set NODE_PATH.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{parseHTML}=require('linkedom'),{context}=require('../../verification/integration143.cjs'),fixture=require('./tributary187.cjs');
const root=path.resolve(__dirname,'../..'),c=context(root),{document,window}=parseHTML('<html><body><aside id="side"></aside></body></html>');
// linkedom does not reflect the HTMLDetailsElement open property.
Object.defineProperty(window.HTMLElement.prototype,'open',{configurable:true,get(){return this.hasAttribute('open')},set(v){if(v)this.setAttribute('open','');else this.removeAttribute('open')}});
// linkedom's select has a getter only; supply the browser-standard value setter.
const descriptor=Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value');
if(!descriptor.set)Object.defineProperty(window.HTMLSelectElement.prototype,'value',{...descriptor,set(value){const options=[...this.querySelectorAll('option')];for(const o of options)o.removeAttribute('selected');const selected=options.find(o=>o.value===String(value));if(selected)selected.setAttribute('selected','');}});
c.ctx.document=document;c.ctx.CustomEvent=window.CustomEvent;c.ctx.setTimeout=setTimeout;c.ctx.clearTimeout=clearTimeout;
// linkedom does not switch to HTMLInputElement inside SVG foreignObject.
Object.defineProperty(window.SVGElement.prototype,'value',{configurable:true,get(){return this.localName==='select'?this.querySelector('option[selected]')?.getAttribute('value')||'':this.getAttribute('value')||'';},set(v){if(this.localName==='select'){for(const o of this.querySelectorAll('option')){o.removeAttribute('selected');if(o.getAttribute('value')===String(v))o.setAttribute('selected','');}}else this.setAttribute('value',String(v));}});
let active234=null;Object.defineProperty(document,'activeElement',{get(){return active234?.isConnected?active234:document.body;}});
window.SVGElement.prototype.focus=function(){active234=this;};window.SVGElement.prototype.setSelectionRange=function(a,b){this.selectionStart=a;this.selectionEnd=b;};
const pending=[],listen=document.addEventListener.bind(document);document.addEventListener=(type,fn,...args)=>listen(type,e=>{const p=fn(e);if(p?.then)pending.push(p);},...args);
const $=s=>document.querySelector(s),input=(id,value)=>{const el=$('#'+id);el.value=value;el.dispatchEvent(new window.Event('input',{bubbles:true}));};
async function commit284(){const el=$('[data-inline-rebar234="bottom:0:count"]');const e=new window.Event('keydown',{bubbles:true});e.key='Enter';el.dispatchEvent(e);await new Promise(r=>setTimeout(r,0));await c.run('test227.ui.calculate()');}
async function click(s){$(s).dispatchEvent(new window.Event('click',{bubbles:true}));await Promise.all(pending.splice(0));}
(async()=>{
 c.run(`globalThis.test227={p:Engine.clone(argument),floor:1,key:'F1',messages:[],saves:0,refreshes:0,nativeCalls:0};
 const b=test227.p.types.F1.beams.find(b=>b.id==='B1');Object.assign(b,{b:1800,d:3200,widthMode:'manual',depthOverride184:3200});
 LoadData.setFloor(test227.p,1,{...LoadData.floor(test227.p,1),direction:'Y'});test227.result=Engine.generate(test227.p);for(const beam of Engine.floorModel(test227.result,1).beams){test227.p.explorer.members['1|'+Loading.token(beam.kind,beam)]={mode:'manual',beamSelfWeight:true,beamLoads:[{type:'line',a:0,b:Loading.beamSpan(beam).value,dl:100,ll:10}]};}test227.host={get:()=>test227,repaint(){},refresh(){test227.refreshes++;},toast:s=>test227.messages.push(s),transact(fn){fn();test227.saves++;test227.result=Engine.generate(test227.p);return true;},floor(f){test227.floor=f;},focusMember(){}};test227.ui=ExplorerUI(test227.host);test227.ui.selectPlanMember({kind:'MB',id:'B1'});`,fixture.p);
 const render=()=>c.run(`(()=>{const t=test227;document.getElementById('side').innerHTML=t.ui.render('checks');BeamRebar116.decorate({...t,selected:{kind:'MB',id:'B1'},memberResult:(f,k)=>t.ui.getMemberResult227(t.p,f,k)});})()`);


 await c.run('test227.ui.calculate()');render();
 c.run(`test227.token=Loading.members(test227.p,test227.result,1).find(x=>x.member.id==='B1'&&x.kind==='MB').token;
 test227.calls=[];window.ExcelSync.verifyCheck279=async()=>{test227.calls.push({steel:Engine.clone(Loading.input(test227.p,1,test227.token).steel),fresh:!!test227.ui.getReportOutput254(test227.p)});return true;};
 test227.release=null;test227.started=false;const original285=AuditRunner132.run;AuditRunner132.run=async(...args)=>{test227.started=true;await new Promise(r=>test227.release=r);AuditRunner132.run=original285;return original285(...args);};`);
 const field=$('[data-inline-rebar234="bottom:0:count"]');field.value='20';field.dispatchEvent(new window.Event('input',{bubbles:true}));const enter=new window.Event('keydown',{bubbles:true});enter.key='Enter';$('[data-inline-rebar234="bottom:0:count"]').dispatchEvent(enter);
 const deadline=Date.now()+10000;while(!c.run('test227.started')&&Date.now()<deadline)await new Promise(r=>setTimeout(r,5));assert(c.run('test227.started'));
 const local=c.run('test227.ui.getMemberResult227(test227.p,1,test227.token)');assert(local.localRebar285);
 assert(!$('[data-provided237=bottom]').textContent.includes('待計算'),'Current-member RC remains visible while whole-building audit is deliberately paused');
 assert($('.rebar-status116').textContent.includes('目前梁 App RC 已更新'));
 assert.equal(c.run('test227.calls.length'),0,'No Excel call during edit/save/background App checks');
 assert.equal(c.run('test227.ui.getReportOutput254(test227.p)'),null,'Global/report freshness is still pending');
 c.run('test227.release()');await c.run('test227.ui.calculate()');render();
 assert.equal(JSON.stringify(local.result),JSON.stringify(c.run('test227.ui.getMemberResult227(test227.p,1,test227.token).result')));
 const button=$('[data-native-check279] [data-ex=run]');assert.equal(button.textContent,'更新至EXCEL並核對');
 assert.equal($('[data-ex=auto-steel]').textContent,'恢復 App 自動選筋');
 await click('[data-native-check279] [data-ex=run]');
 const calls=c.run('test227.calls');assert.equal(calls.length,1);assert.equal(calls[0].steel.C44,20);assert(calls[0].fresh,'Explicit native verification receives current fully checked App result');
 console.log('PASS paused-audit RC display, no implicit Excel dispatch, exact final RC parity, renamed controls and explicit latest-manual-RC dispatch');
})().catch(e=>{console.error(e);process.exitCode=1});
