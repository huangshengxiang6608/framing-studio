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
 c.run("window.ExcelSync.verifyCheck279=async()=>{test227.nativeCalls++;};");
 assert.equal($('[data-ex=steel]'),null,'Save button replaced by automatic saving');
 c.run('test227.token=Loading.members(test227.p,test227.result,1).find(x=>x.member.id==="B1"&&x.kind==="MB").token');
 const saved=()=>c.run('JSON.stringify(test227.p.explorer.members["1|"+test227.token].steel||null)');
 const settle=async()=>{await new Promise(r=>setTimeout(r,5));await c.run('test227.ui.calculate()');await new Promise(r=>setTimeout(r,5));await c.run('test227.ui.calculate()');};
 const fire=(key,type,value)=>{const el=$('[data-inline-rebar234="'+key+'"]');assert(el,key);if(value!==undefined)el.value=value;const e=new window.Event(type,{bubbles:true});if(type==='keydown')e.key='Enter';el.dispatchEvent(e);};
 const before=saved();
 fire('bottom:0:count','input','');assert.equal(saved(),before,'Empty intermediate input is not saved');
 fire('bottom:0:count','focusout');assert.equal(saved(),before);assert($('.rebar-status116').textContent.includes('未保存'));
 fire('bottom:0:count','input','2');assert.equal(saved(),before,'Intermediate 2 is not saved');
 fire('bottom:0:count','input','20');assert.equal(saved(),before,'Valid draft still waits for commit');
 fire('bottom:0:count','focusout');assert.equal(JSON.parse(saved()).C44,20,'Blur saves the completed count synchronously');
 const saves=c.run('test227.saves');fire('bottom:0:count','focusout');assert.equal(c.run('test227.saves'),saves,'Repeated blur is a no-op');
 await settle();assert(c.run('test227.ui.getMemberResult227(test227.p,1,test227.token)'));
 fire('bottom:0:dia','change','40');assert.equal(JSON.parse(saved()).D44,40,'Selecting diameter commits without another button');
 fire('bottom:0:count','input','22');fire('bottom:0:count','keydown');assert.equal(JSON.parse(saved()).C44,20,'Invalid horizontal gap rejected');
 assert($('.rebar-status116').textContent.includes('小於 40 mm'));
 fire('bottom:0:count','input','21');fire('bottom:0:count','keydown');assert.equal(JSON.parse(saved()).C44,21,'Enter commits corrected value');
 // Save another field before the previous audit ends. Only fresh results may be adopted.
 fire('bottom:0:count','input','20');fire('bottom:0:count','keydown');
 fire('shear:space','input','150');fire('shear:space','focusout');
 await settle();const result=c.run('test227.ui.getMemberResult227(test227.p,1,test227.token)');assert(result);
 assert.equal(result.result.steel.C44,20);assert.equal(result.result.steel.H58,150);
 assert.equal(c.run('test227.nativeCalls'),0,'Autosave never launches native Excel');
 const stable=saved();fire('shear:space','input','2');fire('shear:space','focusout');assert.equal(saved(),stable,'Incomplete link spacing cannot overwrite stored reinforcement');
 fire('shear:space','input','150');fire('shear:space','keydown');await settle();
 // A detached old card cannot save its draft into another selected member.
 fire('bottom:0:count','input','21');const old=$('#beam-rebar116');
 c.run('test227.ui.clearSelection()');old.dispatchEvent(new window.CustomEvent('framing-rebar-save284',{bubbles:true,detail:{project:c.run('test227.p'),floor:1,token:c.run('test227.token'),steel:{C44:99}}}));
 assert.equal(saved(),stable);render();old.dispatchEvent(new window.Event('focusout',{bubbles:true}));assert.equal(saved(),stable);
 console.log('PASS auto-save: draft/blank safety, blur, Enter, diameter, invalid gap/link rejection, duplicate no-op, rapid edits/fresh results, no Excel, stale member protection');
})().catch(e=>{console.error(e);process.exitCode=1});
