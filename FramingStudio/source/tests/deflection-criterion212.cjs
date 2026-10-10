require('./summary-deflection211.cjs');
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const ctx=vm.createContext({document:{addEventListener(){}},window:{}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../beam-loads.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../beam-load-ui.js'),'utf8'),ctx);
const ui=vm.runInContext('BeamLoadUI',ctx),base={kind:'MB',status:'NOT OK',checks205:{a:{status:'NOT OK'},b:{status:'OK'}},deflection211:{state:'available',L:12.25,max:28.51012345}};
const before=JSON.stringify(base),v=ui.criterion212(base);assert.equal(v.limit,49);assert(v.pass);assert.equal(ui.auditStatus212(base),'OK (SHORT-TERM)');assert.equal(JSON.stringify(base),before);
for(const [max,pass] of [[48.999999999,true],[49,false],[49.000000001,false],[0,true]]){const i={...base,deflection211:{...base.deflection211,max}},v=ui.criterion212(i);assert.equal(v.pass,pass);assert.equal(ui.auditStatus212(i),pass?'OK (SHORT-TERM)':'NOT OK');}
for(const status of ['NOT OK','INPUT REQUIRED','ERROR']){const i={...base,status,checks205:{...base.checks205,b:{status}}};assert(ui.criterion212(i).pass);assert.equal(ui.auditStatus212(i),status,'RC failures must not be masked');}
for(const status of ['INPUT REQUIRED','ERROR','OK','N/A'])assert.equal(ui.criterion212({...base,checks205:{...base.checks205,a:{status}}}),null);
assert(ui.criterion212({...base,checks205:{...base.checks205,a:{status:'CALC. REQUIRED'}}}).pass);
for(const d of [{state:'pending'},{state:'available',L:12.25,max:NaN},{state:'available',L:0,max:0},{state:'available',L:12.25,max:-1}])assert.equal(ui.criterion212({...base,deflection211:d}),null);
for(const kind of ['COL','SLAB','MODEL'])assert.equal(ui.criterion212({...base,kind}),null);
console.log('PASS strict unrounded L/250 threshold including equality, independent RC failures, missing/stale calculation guards, no slab extension or input mutation');
