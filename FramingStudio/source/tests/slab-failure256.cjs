const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const {context,app}=require('./audit-performance247.cjs'),c=context(),solver=require('../checks.js');
const render=r=>c.run('SlabPanel121.autoFailure256({result:argument})',r);
const input={kind:'CS',L:5.625,h:200,fire:2,fcu:45,dl:0,sdl:0,ll:2};
const failed=solver.slab(input),before=JSON.stringify(failed),html=render(failed);
for(const text of ['截面彎矩系數超限','0.159304','0.156','撓度驗算未通過','37.751678','6.343189','分布筋尚未自動選取','最後一次試算'])assert(html.includes(text),text);
assert.equal(JSON.stringify(failed),before);assert(!html.includes('分布筋候選範圍內無解'));
const transverse=render(solver.slab({...input,L:1.5,h:4000}));assert(transverse.includes('分布筋候選範圍內無解'));assert(!transverse.includes('分布筋尚未自動選取'));
assert.equal(render(solver.slab({...input,L:1.5})), '');
assert.equal(render(solver.slab({...input,steel:{F35:12,H35:200,C57:10,D57:250}})), '');
for(const [fail,text]of [['主筋不足','主筋面積不足'],['剪力','剪力驗算未通過'],['裂缝间距','主筋間距限制未通過'],['主筋间距','主筋間距限制未通過'],['间距须为 100/150/200/250','其他未通過項目']]){
 const r={...failed,fail:[fail]};assert(render(r).includes(text));
}
const missing=render({...failed,values:{...failed.values,C45:''}});assert(missing.includes('容許 L/d 未能計算'));assert(!missing.includes('容許 L/d = 0'));
const unsafe=render({...failed,fail:['<img onerror="bad">']});assert(unsafe.includes('&lt;img'));assert(!unsafe.includes('<img'));
for(const name of ['explorer-ui.js','slab-panel121.js']){const source=fs.readFileSync(path.join(app,'source',name),'utf8').replace(/\r\n/g,'\n').trim(),served=fs.readFileSync(path.join(app,'assets/index.html'),'utf8').replace(/\r\n/g,'\n');assert.equal(served.split(source).length,2);}
console.log('PASS diagnostic reasons, numeric evidence, unattempted distribution stage, manual/success exclusions, escaping, immutability and source parity');
