const assert=require('assert/strict'),{parseHTML}=require('linkedom'),{context,fixture}=require('./audit-performance247.cjs');
const pause=()=>new Promise(r=>setTimeout(r,10));
async function until(test){const start=Date.now();while(!test()){if(Date.now()-start>30000)throw Error('Timed out');await pause()}}
function setup(){const c=context(),{document,window}=parseHTML('<html><body><aside id="side"></aside><div id="ex-report-content"></div><dialog id="ex-report-dialog"></dialog></body></html>');c.ctx.document=document;Object.defineProperty(window.HTMLElement.prototype,'open',{configurable:true,get(){return this.hasAttribute('open')},set(v){if(v)this.setAttribute('open','');else this.removeAttribute('open')}});return {...c,document,window};}
(async()=>{
 const c=setup();
 c.run(`globalThis.test250=(()=>{
 const row=(kind,depth,M,floor=1,framing='F1',id='B1',extra={})=>({kind,id,framing,floor,token:kind+'|'+id,member:{d:depth/1000},actions:{M},...extra});
 const rows=[row('MB',600,10),row('MB',600,-40,2,'F1','B2'),row('MB',700,20),row('SB',600,30),row('CB',600,70),row('TB',600,100),row('MB',600,90,1,'F2'),row('MB',600,40,1,'F1','B3')];
 const groups=BeamRepresentatives250.select(rows);if(groups.length!==6)throw Error('Framing/kind/depth grouping');
 const mb=groups.find(g=>g.framing==='F1'&&g.kind==='MB'&&g.depth===600);if(mb.winner.id!=='B3')throw Error('Absolute peak/tie ordering');
 if(JSON.stringify(BeamRepresentatives250.select([...rows].reverse()))!==JSON.stringify(groups))throw Error('Unstable tie');
 const ex={selected:{'manual':true},reportA:{},reportB:{}};BeamRepresentatives250.sync(ex,groups);
 for(const g of groups)for(const n of ['selected','reportA','reportB'])if(!ex[n][BeamRepresentatives250.key(g.winner)])throw Error('Default checkbox');
 const k=BeamRepresentatives250.key(mb.winner);BeamRepresentatives250.manual(ex,k,'reportA',false);
 const saved=JSON.parse(JSON.stringify(ex));if(BeamRepresentatives250.sync(saved,groups)||saved.reportA[k]!==false)throw Error('Reopen/manual override');
 const newGroups=BeamRepresentatives250.select([row('MB',600,500,3,'F1','B9')]);BeamRepresentatives250.manual(saved,k,'selected',true);BeamRepresentatives250.sync(saved,newGroups);
 if(!saved.selected[k]||!saved.selected.manual||saved.reportB[k]!==undefined||saved.reportA[k]!==false)throw Error('Preserve manual / remove old automatic');
 const pending=BeamRepresentatives250.select([row('TB',600,2),row('TB',600,null,2),row('SB',800,0),row('MB',900,10,1,'F1','B5',{loadErrors:['missing']})]);
 const empty={};BeamRepresentatives250.sync(empty,pending);if(empty.selected['1|TB|B1']||empty.selected['1|MB|B5']||!empty.selected['1|SB|B1'])throw Error('Incomplete or zero moment handling');
 return true;})();`);
 console.log('PASS all four beam kinds, each depth/Framing, signed absolute M, stable ties, missing loads, zero moment, auto checkbox ownership and saved overrides');
 const p=c.run(fixture,'TB');
 c.run(`globalThis.nav250={p:argument,floor:1,key:'F1'};nav250.result=Engine.generate(nav250.p);globalThis.history250=[];globalThis.calls250=0;
 const original250=AuditRunner132.run;AuditRunner132.run=async(...args)=>{calls250++;return original250(...args)};
 globalThis.host250={get:()=>nav250,refresh(){document.getElementById('side').innerHTML=nav250.ui.render('checks')},repaint(){},toast(){},transact(fn){history250.push(Engine.clone(nav250.p));fn();nav250.result=Engine.generate(nav250.p);LoadData.reconcile(nav250.p,nav250.result,Loading.token);this.refresh();return true},focusMember(token,f){nav250.floor=f;nav250.key=nav250.result.floors[f-1].type;this.refresh()}};
 nav250.ui=ExplorerUI(host250);host250.refresh();`,p);
 await until(()=>c.document.querySelector('[data-representative250="maximum"]')&&c.run('history250.length')>0);
 assert.equal(c.run('calls250'),1);
 assert.equal(c.document.querySelector('#side').firstElementChild.id,'ex-selected-members');
 const rendered=[...c.document.querySelectorAll('[data-representative250="maximum"]')];assert(rendered.length);
 for(const row of rendered)assert([...row.querySelectorAll('input')].every(x=>x.hasAttribute('checked')));
 const real=c.run(`(()=>{const q=Engine.clone(nav250.p);q.explorer.selected={};for(const f of nav250.result.floors)for(const m of Loading.members(q,nav250.result,f.n))q.explorer.selected[f.n+'|'+m.token]=true;const out=Loading.run(q,nav250.result,'B');return BeamRepresentatives250.select(out.rows).filter(g=>g.winner&&!g.missing).map(g=>g.winner.floor+'|'+g.winner.token).sort()})()`);
 assert.deepEqual(rendered.map(r=>{const a=r.querySelector('[data-ex=choose]');return a.dataset.floor+'|'+a.dataset.token}).sort(),Array.from(real));
 const chosen=rendered[0].querySelector('[data-ex=choose]'),floor=+chosen.dataset.floor,token=chosen.dataset.token;
 c.document.querySelector('#side').scrollTop=900;chosen.dispatchEvent(new c.window.Event('click',{bubbles:true}));await pause();assert.equal(c.document.querySelector('#side').scrollTop,0);
 const manual=c.document.querySelector(`[data-report=A][data-floor="${floor}"][data-token='${token}']`);manual.checked=false;manual.dispatchEvent(new c.window.Event('change',{bubbles:true}));await pause();assert.equal(c.run(`nav250.p.explorer.reportA[${JSON.stringify(floor+'|'+token)}]`),false);assert.equal(c.run('calls250'),1);
 c.run('host250.refresh()');await pause();assert.equal(c.run('calls250'),1);
 // A real changed loading must invalidate demand and update winners automatically.
 c.run(`LoadData.setFloor(nav250.p,2,{usage:'Dormitory',dl:18,sdl:0,ll:7});nav250.result=Engine.generate(nav250.p);host250.refresh()`);
 assert(c.document.querySelector('[data-representatives-status250]').textContent.includes('比較彎矩'));
 await until(()=>c.run('calls250')===2&&!c.document.querySelector('[data-representatives-status250]'));
 assert.equal(c.run(`nav250.p.explorer.reportA[${JSON.stringify(floor+'|'+token)}]`),false);
 console.log('PASS automatic real-solver extraction, all flags, cross-floor navigation, unchanged-input reuse and changed-load refresh');
 // Full Check output is reused; opening the Member Check does not start a second solver.
 await c.run('nav250.ui.calculate()');const count=c.run('calls250');await pause();assert.equal(c.run('calls250'),count);
 assert(c.document.querySelector('[data-representative250="maximum"]'));
 // An in-flight old solve is never allowed to apply a stale winner after edits.
 c.run(`globalThis.releases250=[];AuditRunner132.run=async(p,r,options)=>{calls250++;await new Promise(resolve=>releases250.push(resolve));return original250(p,r,options)};nav250.p.name='first change';host250.refresh()`);
 await until(()=>c.run('releases250.length')===1);
 const before=c.run('JSON.stringify(nav250.p.explorer.selected)');
 c.run(`nav250.p.name='second change';host250.refresh();releases250.shift()()`);
 await until(()=>c.run('releases250.length')===1);assert.equal(c.run('JSON.stringify(nav250.p.explorer.selected)'),before);
 c.run('releases250.shift()()');await until(()=>!c.document.querySelector('[data-representatives-status250]'));
 console.log('PASS shared full-audit reuse and stale in-flight result rejection');
})().catch(e=>{console.error(e);process.exitCode=1});
