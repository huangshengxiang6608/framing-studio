const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'../explorer-ui.js'),'utf8'),start=source.indexOf(' function memberPass251('),end=source.indexOf(' function floorStrip(',start);
const box={Loading:{auditChecks205:(p,row)=>row.checks},BeamLoadUI:{summary211:(p,row)=>row.deflection,deflectionResult214:d=>d?.state==='available'?{pass:d.max<d.L*1000/250}:null},fresh:()=>true,output:{rows:[]}};vm.createContext(box);vm.runInContext(source.slice(start,end),box);
for(const rc of [true,false])for(const span of [true,false])for(const deflection of [true,false]){
 const row={kind:'TB',floor:3,token:'TB|x',checked:true,result:{status:'NOT OK',fail:['挠度']},checks:{a:{status:span?'OK':'NOT OK'},b:{status:rc?'OK':'NOT OK'}},deflection:{state:'available',L:30,max:deflection?50:130}};
 assert.equal(box.memberPass251({},row),rc&&(span||deflection));box.output.rows=[row];assert.equal(box.floorCheckState({p:{explorer:{selected:{'3|TB|x':true}}}},3).mark,rc&&(span||deflection)?'✓':'✕');
}
const unknown={kind:'MB',checks:{a:{status:'INPUT REQUIRED'},b:{status:'OK'}},deflection:{state:'unavailable'}};assert(!box.memberPass251({},unknown));unknown.checks.a.status='OK';assert(box.memberPass251({},unknown));unknown.loadErrors=['missing'];assert(!box.memberPass251({},unknown));
for(const kind of ['COL','SLAB']){assert(box.memberPass251({},{kind,result:{status:'OK'}}));assert(!box.memberPass251({},{kind,result:{status:'NOT OK',fail:['RC']}}));}
box.output.rows=[];assert.equal(box.floorCheckState({p:{explorer:{selected:{'3|MB|gone':true}}}},3).mark,'✕');box.fresh=()=>false;assert.equal(box.floorCheckState({p:{explorer:{selected:{'3|MB|x':true}}}},3).mark,'待算');
console.log('PASS floor RC AND (Span/Depth OR actual deflection), all 8 combinations, unknown/stale/missing inputs and unchanged non-beam checks');
