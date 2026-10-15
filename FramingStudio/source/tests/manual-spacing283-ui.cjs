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
 c.run(`globalThis.test227={p:Engine.clone(argument),floor:1,key:'F1',messages:[]};
 const b=test227.p.types.F1.beams.find(b=>b.id==='B1');Object.assign(b,{b:1800,d:3200,widthMode:'manual',depthOverride184:3200});
 LoadData.setFloor(test227.p,1,{...LoadData.floor(test227.p,1),direction:'Y'});test227.result=Engine.generate(test227.p);for(const beam of Engine.floorModel(test227.result,1).beams){test227.p.explorer.members['1|'+Loading.token(beam.kind,beam)]={mode:'manual',beamSelfWeight:true,beamLoads:[{type:'line',a:0,b:Loading.beamSpan(beam).value,dl:100,ll:10}]};}test227.host={get:()=>test227,repaint(){},refresh(){},toast:s=>test227.messages.push(s),transact(fn){fn();return true;},floor(f){test227.floor=f;},focusMember(){}};test227.ui=ExplorerUI(test227.host);test227.ui.selectPlanMember({kind:'MB',id:'B1'});`,fixture.p);
 const render=()=>c.run(`(()=>{const t=test227;document.getElementById('side').innerHTML=t.ui.render('checks');BeamRebar116.decorate({...t,selected:{kind:'MB',id:'B1'},memberResult:(f,k)=>t.ui.getMemberResult227(t.p,f,k)});})()`);
 await c.run('test227.ui.calculate()');render();
 const edit=(key,value)=>{const e=$('[data-inline-rebar234="'+key+'"]');e.value=value;e.dispatchEvent(new window.Event(e.localName==='select'?'change':'input',{bubbles:true}));};
 edit('bottom:0:dia','40');edit('bottom:0:count','20');
 assert(!$('.rebar-reasons227').textContent.includes('水平淨距'),$('.rebar-reasons227').textContent);
 assert(!$('[data-provided237=bottom]').textContent.includes('待計算'));
 await commit284();assert(!c.run('test227.messages.at(-1)').includes('水平淨距'));render();
 assert.equal($('[data-inline-rebar234="bottom:0:count"]').value,'20','20 bars saved and reloaded');
 const before=c.run('JSON.stringify(test227.p)');edit('bottom:0:count','22');
 assert($('.rebar-reasons227').textContent.includes('下筋第 1 層 22T40'),$('.rebar-reasons227').textContent);
 assert($('.rebar-reasons227').textContent.includes('小於 40 mm'));
 assert.equal($('.rebar-rc227').textContent,'RC 輸入待修正');
 await commit284();assert.equal(c.run('JSON.stringify(test227.p)'),before,'Invalid spacing cannot be saved');
 assert($('.rebar-status116').textContent.includes('未保存：'));assert($('.rebar-status116').textContent.includes('小於 40 mm'));
 edit('bottom:0:count','20');assert(!$('.rebar-reasons227').textContent.includes('水平淨距'));
 console.log('PASS live Member edit above width/100, save/reload, immediate layer-specific spacing error, invalid-save blocked and recovery');
})().catch(e=>{console.error(e);process.exitCode=1});

