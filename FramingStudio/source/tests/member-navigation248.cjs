// Offline DOM regression: top member list is the sole Check/A/B selector.
const assert=require('assert/strict'),{parseHTML}=require('linkedom'),{context,fixture}=require('./audit-performance247.cjs');
const c=context(),{document,window}=parseHTML('<html><body><aside id="side"></aside></body></html>');
c.ctx.document=document;
Object.defineProperty(window.HTMLElement.prototype,'open',{configurable:true,get(){return this.hasAttribute('open')},set(v){if(v)this.setAttribute('open','');else this.removeAttribute('open')}});
const pending=[],listen=document.addEventListener.bind(document);document.addEventListener=(type,fn,...args)=>listen(type,e=>{const x=fn(e);if(x?.then)pending.push(x)},...args);
const $=s=>document.querySelector(s),flush=async()=>{while(pending.length)await Promise.all(pending.splice(0))};
(async()=>{
 c.run(`globalThis.nav248={p:argument,floor:1,key:'F1'};nav248.result=Engine.generate(nav248.p);
 const tokens=Loading.members(nav248.p,nav248.result,1).filter(m=>m.kind==='TB'||m.kind==='MB');globalThis.token248=tokens[0].token;
 Loading.init(nav248.p);for(const f of [1,2])for(const map of ['selected','reportA','reportB'])nav248.p.explorer[map][f+'|'+token248]=true;
 const host248={get:()=>nav248,refresh(){document.getElementById('side').innerHTML=nav248.ui.render('checks')},repaint(){},toast(){},transact(fn){fn();return true},focusMember(token,f){nav248.floor=f;nav248.key=nav248.result.floors[f-1].type;this.refresh()}};
 nav248.ui=ExplorerUI(host248);nav248.ui.selectPlanMember({kind:tokens[0].kind,id:tokens[0].member.id});host248.refresh();`,c.run(fixture,'TB'));
 const before=c.run('JSON.stringify([nav248.p.types,nav248.p.explorer.selected,nav248.p.explorer.reportA,nav248.p.explorer.reportB])');
 assert.equal($('#side').firstElementChild.id,'ex-selected-members');assert($('#ex-selected-members').open);
 $('#side').scrollTop=900;
 $('[data-ex=choose][data-floor="2"]').dispatchEvent(new window.Event('click',{bubbles:true}));await flush();
 assert.equal(c.run('nav248.floor'),2);assert.equal($('#side').scrollTop,0);assert.equal($('#ex-include').dataset.floor,'2');
 assert.equal(c.run('JSON.stringify([nav248.p.types,nav248.p.explorer.selected,nav248.p.explorer.reportA,nav248.p.explorer.reportB])'),before);
 const control=$('[data-report=A][data-floor="1"]');control.checked=false;control.dispatchEvent(new window.Event('change',{bubbles:true}));await flush();
 assert.equal(c.run('nav248.p.explorer.reportA["1|"+token248]'),false);assert.equal(c.run('nav248.p.explorer.reportA["2|"+token248]'),true);
 $('[data-ex=remove-member233][data-floor="1"]').dispatchEvent(new window.Event('click',{bubbles:true}));await flush();
 assert(c.run("['selected','reportA','reportB'].every(k=>!nav248.p.explorer[k]['1|'+token248])"));
 assert(c.run("['selected','reportA','reportB'].every(k=>nav248.p.explorer[k]['2|'+token248])"));
 $('#ex-selected-members').open=false;c.run('host248.refresh()');assert(!$('#ex-selected-members').open);
 console.log('PASS top member table, cross-floor navigation/scroll reset, independent Check/A/B selection, removal and collapse retention');
})().catch(e=>{console.error(e);process.exitCode=1});
