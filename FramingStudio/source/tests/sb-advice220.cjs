const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs');
const c=context(path.resolve(__dirname,'../..'));c.run(fs.readFileSync(path.join(__dirname,'loading115-browser.js'),'utf8'));
const result=c.run(`(()=>{
 const p=Engine.clone(loading115Tests().projects.slab),t=p.types.F1;p.groups[0].sh=900;t.beamDepth=250;
 t.beams[0].kind='SB';t.beams[0].d=250;t.beams[0].b=250;
 let r=Engine.generate(p),b=Engine.floorModel(r,1).beams.find(b=>b.id==='B1'),token=Loading.token('SB',b);
 p.explorer.members['1|'+token]={mode:'manual',beamLoads:[{name:'Load',type:'line',a:0,b:6,dl:25,ll:15}],beamSelfWeight:true};
 const before=JSON.stringify(p),steps=Loading.auditSteps(p,r,BeamLoadUI.summary211,true,true);let n;do{n=steps.next();}while(!n.done);
 const item=n.value.items.find(i=>i.token===token&&i.checks205),baseline=JSON.stringify(p)===before;
 const q=Engine.clone(p),outcome=SBAdvice220.apply(q,r,'F1',item.sbFraming220),qr=Engine.generate(q);Loading.init(q).selected={['1|'+token]:true};const row=Loading.run(q,qr,'B').rows.find(i=>i.token===token);
 return {p,q,item,outcome,row,rc:Loading.auditChecks205(q,row).b,baseline,before};
})()`);
assert(result.baseline);assert.equal(result.item.checks205.b.status,'NOT OK');assert(!result.item.sbAdvice220.reason,JSON.stringify(result.item.sbAdvice220));assert(!result.item.sbFraming220.reason,JSON.stringify(result.item.sbFraming220));
assert.equal(result.item.sbAdvice220.b,250);assert(result.item.sbAdvice220.d>250);assert(result.item.sbAdvice220.d<=900);assert.equal(result.rc.status,'OK');assert.equal(result.row.member.b*1000,result.item.sbFraming220.b);assert.equal(result.row.member.d*1000,result.item.sbFraming220.d);
assert(result.row.loading.sw>250/1000*250/1000*24.5);assert.equal(result.q.types.F1.sbWidth,result.item.sbFraming220.b);assert.equal(result.q.types.F1.beamDepth,result.item.sbFraming220.d);
assert.deepEqual(result.q.explorer.members,result.p.explorer.members);assert.deepEqual(result.q.explorer.reportA,result.p.explorer.reportA);assert.deepEqual(result.q.explorer.reportB,result.p.explorer.reportB);assert.deepEqual(result.q.types.F1.beams.slice(1),result.p.types.F1.beams.slice(1));
const rejected=c.run(`(()=>{const p=Engine.clone(argument),before=JSON.stringify(p);try{SBAdvice220.apply(p,Engine.generate(p),'F1',{b:250,d:901});return false;}catch(e){return before===JSON.stringify(p);}})()`,result.p);assert(rejected);
const ui=fs.readFileSync(path.join(__dirname,'../explorer-ui.js'),'utf8'),render=ui.slice(ui.indexOf(' function sbAdviceHTML220'),ui.indexOf(' function beamFilterHTML214')),helpers=ui.split('\n').find(l=>l.startsWith(' const $=id=>'));
const html=c.run(`(()=>{let auditBusy131=false;const btn=(label,action,extra)=>'<button data-ex="'+action+'" '+extra+'>'+label+'</button>';${helpers}\n${render};return [sbAdviceHTML220(argument,false),sbAdviceHTML220(argument,true)];})()`,result.item);
assert.match(html[0],/此 SB 建議/);assert.match(html[0],/F1 SB 最大建議/);assert.match(html[0],/audit-sb-apply220/);assert.match(html[1],/待更新/);assert(!html[1].includes('<button'));
console.log('PASS real Section B depth-first suggestion, common size, self weight recalculation, apply, immutable analysis, over-zone atomic rejection, report inputs/other beams preserved, UI and stale guard',JSON.stringify(result.item.sbAdvice220),JSON.stringify(result.item.sbFraming220));
for(const [name,dl,expected] of [['width-after-depth',30,{b:300,d:350}],['no-feasible-size',60,null]]){
 const item=c.run(`(()=>{const p=Engine.clone(argument.p);p.groups[0].h=3.35;const t=p.types.F1,r=Engine.generate(p),token=Loading.token('SB',Engine.floorModel(r,1).beams.find(b=>b.id==='B1'));p.explorer.members['1|'+token].beamLoads[0].dl=argument.dl;p.explorer.members['1|'+token].beamLoads[0].ll=5;const it=Loading.auditSteps(p,r,BeamLoadUI.summary211,true,true);let n;do{n=it.next();}while(!n.done);return n.value.items.find(i=>i.token===token&&i.checks205);})()`,{p:result.p,dl});
 if(expected){assert.equal(item.sbAdvice220.b,expected.b);assert.equal(item.sbAdvice220.d,expected.d);assert.equal(item.sbFraming220.limit,350);}else{assert(item.sbAdvice220.reason);assert(item.sbFraming220.reason);}
 console.log('PASS',name);
}
const shared=c.run(`(()=>{
 const p=Engine.clone(argument);p.total=2;p.groups=[{...p.groups[0],end:1,h:3.5},{...p.groups[0],end:'顶层',h:3.35}];p.types.F1.beams[1].kind='SB';p.types.F1.beams[1].d=300;p.types.F1.beams[1].b=300;
 LoadData.setFloor(p,2,{usage:'Dormitory',dl:10,sdl:0,ll:2});const r=Engine.generate(p),bs=Engine.floorModel(r,1).beams.filter(b=>b.kind==='SB');
 for(const f of [1,2])for(const b of bs)p.explorer.members[f+'|'+Loading.token('SB',b)]={mode:'manual',beamSelfWeight:true,beamLoads:[{name:'Load',type:'line',a:0,b:6,dl:b.id==='B1'?f===1?10:30:4,ll:5}]};
 const before=JSON.stringify(p),it=Loading.auditSteps(p,r,BeamLoadUI.summary211,true,true);let n;do{n=it.next();}while(!n.done);const item=n.value.items.find(i=>i.id==='B1'&&i.sbFraming220);const q=Engine.clone(p);SBAdvice220.apply(q,r,'F1',item.sbFraming220);
 return {item,unchanged:before===JSON.stringify(p),beams:Engine.generate(q).floors.flatMap(f=>Engine.floorModel(Engine.generate(q),f).beams.filter(b=>b.kind==='SB').map(b=>[b.b*1000,b.d*1000])),p,r};
})()`,result.p);
assert(shared.unchanged);assert.equal(shared.item.sbFraming220.limit,350);assert.equal(shared.item.sbFraming220.floors,2);assert.equal(shared.item.sbFraming220.count,2);assert(shared.beams.every(([b,d])=>b===shared.item.sbFraming220.b&&d===shared.item.sbFraming220.d));
console.log('PASS shared floors use most restrictive zone, stronger upper-floor load controls, common max preserves larger existing SB, all manual SB overrides replaced');
const pending=c.run(`(()=>{const p=Engine.clone(argument);delete p.explorer.members[Object.keys(p.explorer.members).find(k=>k.startsWith('2|'))].beamLoads;const it=Loading.auditSteps(p,Engine.generate(p),BeamLoadUI.summary211,true,true);let n;do{n=it.next();}while(!n.done);return n.value.items.filter(i=>i.sbFraming220).map(i=>i.sbFraming220);})()`,shared.p);
assert(pending.length);assert(pending.every(a=>a.reason));console.log('PASS incomplete shared-floor input blocks one-click recommendation');
for(const frozen of [false,true]){
 const auto=c.run(`(()=>{const p=Engine.clone(loading115Tests().projects.slab),t=p.types.F1;t.beams=[];t.beamDepth=250;t.autoBeams101=true;t.beamLayout116={main:true,secondary:true,mainDirection:'XY',secondaryDirection:'X',gap:2000,scope:'all'};
 let r=Engine.generate(p);if(argument){Engine.freezeAutoBeams(p,'F1',Engine.floorModel(r,1));r=Engine.generate(p);}const bs=Engine.floorModel(r,1).beams.filter(b=>b.kind==='SB');
 for(const b of bs)p.explorer.members['1|'+Loading.token('SB',b)]={mode:'manual',beamSelfWeight:true,beamLoads:[{name:'Load',type:'line',a:0,b:Loading.beamSpan(b).value,dl:25,ll:15}]};
 const it=Loading.auditSteps(p,r,BeamLoadUI.summary211,true,true);let n;do{n=it.next();}while(!n.done);const item=n.value.items.find(i=>i.sbFraming220);if(!item)return {error:'No SB failure',count:bs.length};if(item.sbFraming220.reason)return {error:item.sbFraming220.reason};
 const before=JSON.stringify(p),outcome=SBAdvice220.apply(p,r,'F1',item.sbFraming220),saved=JSON.parse(JSON.stringify(p)),model=Engine.generate(saved);return {before,p:saved,advice:item.sbFraming220,outcome,beams:Engine.floorModel(model,1).beams.filter(b=>b.kind==='SB').map(b=>[b.b*1000,b.d*1000])};})()`,frozen);
 assert(!auto.error,auto.error);assert(auto.beams.length);assert(auto.beams.every(([b,d])=>b===auto.advice.b&&d===auto.advice.d));
 const restored=c.run('Engine.floorModel(Engine.generate(JSON.parse(argument)),1).beams.filter(b=>b.kind===\'SB\').map(b=>b.d*1000)',auto.before);assert(restored.every(d=>d===250));console.log('PASS generated SB'+(frozen?' frozen':' unfrozen')+', save/reopen and undo snapshot');
}
const local=c.run(`(()=>{const p=Engine.clone(argument);p.localHeights96=[{id:'L1',name:'Low local zone',type:'F1',base:0,top:1,cells:[{x0:'1',x1:'2',y0:'A',y1:'B'}],headroom:2.7,em:.5}];const r=Engine.generate(p),limit=[...SBAdvice220.groups(p,r,'F1').values()][0].limit,before=JSON.stringify(p);try{SBAdvice220.apply(p,r,'F1',{b:250,d:350});return {accepted:true};}catch(e){return {limit,unchanged:before===JSON.stringify(p)};}})()`,result.p);assert.equal(local.limit,300);assert(local.unchanged);console.log('PASS local Structural Zone blocks over-depth application atomically');
const scaled=c.run(`(()=>{const p=Engine.clone(argument);p.total=28;p.groups[0].end='顶层';const r=Engine.generate(p),token=Loading.token('SB',Engine.floorModel(r,1).beams.find(b=>b.id==='B1'));for(let f=2;f<=28;f++){LoadData.setFloor(p,f,{usage:'Dormitory',dl:10,sdl:0,ll:2});p.explorer.members[f+'|'+token]=Engine.clone(p.explorer.members['1|'+token]);}const it=Loading.auditSteps(p,r,BeamLoadUI.summary211,true,true);let n,count=0;do{n=it.next();count++;}while(!n.done);return {count,items:n.value.items.filter(i=>i.sbFraming220).map(i=>i.sbFraming220)};})()`,result.p);
assert.equal(scaled.items.length,28);assert(scaled.items.every(a=>!a.reason&&a.floors===28));assert(scaled.count>28);console.log('PASS 28 shared floors and cooperative progress yields');
