// Executes production floor-group handlers and transaction with the real engine.
// Drawing/persistence adapters are isolated; no user project or browser storage.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs'),fixture=require('./tributary187.cjs');
const root=path.resolve(__dirname,'../..'),c=context(root),src=fs.readFileSync(path.join(root,'source/app.js'),'utf8').replace(/\r\n/g,'\n');c.ctx.assert=assert;
const line=marker=>{const start=src.indexOf(marker);assert(start>=0,marker);return src.slice(start,src.indexOf('\n',start));};
const begin=src.indexOf(' let groupDraft='),end=src.indexOf(' let elevationFrom=',begin);
const transaction=line(' function transact('),change=line("  if(action==='group'||"),add=line("  if(a==='addgroup')"),remove=line("  if(a==='delgroup')"),cancel=line("  if(a==='cancelgroups')");
const undo=line(" $('undo').onclick=").split('=>')[1];
c.run(`globalThis.initial249=Engine.clone(argument);let p,result,key='F1',floor=1,history=[],dirty=false,start=null,selected=null,persistCount249=0,refreshCount249=0,messages249=[];
 function persist(){persistCount249++}function toast(x){messages249.push(x)}function refresh(){floor=Math.max(1,Math.min(floor,p.total));refreshCount249++}
 ${transaction}
 ${src.slice(begin,end)}
 function change249(action,f,v,i=0){${change}}
 function button249(a,i=0){${add}${remove}${cancel}}
 function undo249()${undo.replace(/;$/,'')}
 function reset249(){p=Engine.clone(initial249);p.total=3;p.groups=[{...p.groups[0],end:'顶层',h:4,headroom:3,em:.3,sh:700,fire241:2}];p.types.F2=Engine.clone(p.types.F1);Engine.validate(p);result=Engine.generate(p);history=[];groupDirty=false;groupDraft=null;groupError249='';persistCount249=0;messages249=[];floor=1;key='F1'}
 reset249();`,fixture.p);
const checks=c.run(`(()=>{
 const passed=[];
 for(const [field,value]of [['h',4.5],['headroom',2.8],['em',.2],['fire241',4],['type','F2']]){
  reset249();const before=JSON.stringify(p);change249('group',field,value);
  assert.equal(p.groups[0][field],value);assert.equal(groupDirty,false);assert.equal(history.length,1);assert.equal(persistCount249,1);
  assert.equal(result.floors.length,3);assert.equal(result.floors[0].sh,Engine.structuralHeight(p.groups[0]));
  undo249();assert.equal(JSON.stringify(p),before);passed.push(field+' auto applies once and undoes');
 }
 reset249();change249('project','total',5);assert.equal(p.total,5);assert.equal(result.floors.length,5);assert(!groupDirty);passed.push('total floors automatically follows top-floor group');
 reset249();const before=JSON.stringify(p);change249('group','headroom',10);assert.equal(JSON.stringify(p),before);assert(groupDirty&&groupError249);assert.equal(history.length,0);assert.equal(persistCount249,0);
 change249('group','headroom',3.1);assert(!groupDirty);assert.equal(p.groups[0].sh,600);assert.equal(history.length,1);passed.push('invalid height preserves model and corrected draft applies');
 reset249();const old=JSON.stringify(p);change249('project','total',0);assert.equal(JSON.stringify(p),old);assert(groupDirty);button249('cancelgroups');assert(!groupDirty);draftGroups();assert.equal(groupTotal,3);assert.equal(groupError249,'');passed.push('invalid total is pending and cancellable');
 reset249();button249('addgroup');assert(groupDirty);assert.equal(p.groups.length,1);assert.equal(groupDraft[1].fire241,2);
 change249('group','end',1,0);assert(groupDirty);assert.equal(p.groups.length,1);assert.equal(history.length,0);
 change249('group','start',2,1);assert(!groupDirty);assert.equal(p.groups.length,2);assert.equal(history.length,1);assert.equal(result.floors.length,3);passed.push('new incomplete group applies only after complete contiguous ranges');
 const two=JSON.stringify(p);change249('group','start',1,1);assert(groupDirty);assert.equal(JSON.stringify(p),two);assert(groupError249.includes('重叠'));
 change249('group','start',3,1);assert(groupDirty);assert.equal(JSON.stringify(p),two);assert(groupError249.includes('漏填'));
 change249('group','end',2,0);assert(!groupDirty);assert.equal(p.groups[0].end,2);assert.equal(history.length,2);passed.push('overlap and gap drafts never change last valid model');
 const grouped=JSON.stringify(p);button249('delgroup',1);assert(groupDirty);assert.equal(JSON.stringify(p),grouped);
 change249('group','end','顶层',0);assert(!groupDirty);assert.equal(p.groups.length,1);passed.push('group deletion waits for complete floor coverage');
 reset249();change249('group','fire241',3);assert(groupDirty);assert.equal(p.groups[0].fire241,2);assert.equal(history.length,0);assert(groupError249.includes('FRR'));change249('group','fire241',1);assert(!groupDirty);assert.equal(p.groups[0].fire241,1);passed.push('transaction validation rolls back invalid FRR and allows correction');
 reset249();const maps=JSON.stringify(p.explorer);change249('group','h',4.2);assert.equal(JSON.stringify(p.explorer),maps);const saved=JSON.stringify(p),opened=JSON.parse(saved);Engine.validate(opened);assert.equal(Engine.generate(opened).floors[0].h,4.2);passed.push('save/reopen keeps committed height and member/report inputs');
 return passed;
})()`);
for(const item of checks)console.log('PASS',item);
assert(src.includes("if(!applyGroups())return false;download("),'Project save continues to block invalid floor drafts');
console.log('PASS production change/delete/add handlers retain validation, rollback, undo and save guards');
