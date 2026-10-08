const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs'),fixture=require('./tributary187.cjs'),c=context(path.resolve(__dirname,'../..'));
const out=c.run(`(()=>{const p=Engine.clone(argument),r=Engine.generate(p),m=Engine.floorModel(r,1),b=m.beams.find(b=>b.id==='B1'),v=m.beams.find(b=>b.id==='V2'),base=JSON.stringify(r),paper={size:'A3',floor:1},svg=Drawing.svg(p,m,100,true,{},paper),reviewSVG=Drawing.svg(p,m,100,true,{}, {...paper,drawingOffsets191:{}}),loads=JSON.stringify(Loading.run(p,r,'B').rows);
 ReviewLayout191.move(p,m,['MB:B1','MB:V2'],.25,-.4);const saved=JSON.parse(JSON.stringify(p)),map=ReviewLayout191.offsets(saved,m.key),moved=ReviewLayout191.model(m,map),changed=Drawing.svg(p,m,100,true,{}, {...paper,drawingOffsets191:map});
 const result={a:moved.beams.find(x=>x.id==='B1').a,z:moved.beams.find(x=>x.id==='V2').z,original:[b.a,v.z],sameModel:JSON.stringify(r)===base,sameLoads:JSON.stringify(Loading.run(p,r,'B').rows)===loads,sameDefaultSVG:Drawing.svg(p,m,100,true,{},paper)===svg,changedSVG:changed!==svg,saved:ReviewLayout191.offset(b,map),stale:ReviewLayout191.offset({...b,b:b.b+.1},map)};
 ReviewLayout191.move(p,m,['MB:B1','MB:V2'],-.25,.4);result.reverse=ReviewLayout191.offset(b,ReviewLayout191.offsets(p,m.key));ReviewLayout191.restore(saved,m.key);result.restored=!saved.drawingOffsets191;result.restoreSVG=Drawing.svg(saved,m,100,true,{}, {...paper,drawingOffsets191:ReviewLayout191.offsets(saved,m.key)})===reviewSVG;
 try{ReviewLayout191.move(p,m,['MB:B1'],Infinity,0);result.invalid=false;}catch{result.invalid=true;}
 return result;})()`,fixture.p);
assert.equal(out.a[0],out.original[0][0]+.25);assert.equal(out.a[1],out.original[0][1]-.4);assert.equal(out.z[0],out.original[1][0]+.25);
for(const key of ['sameModel','sameLoads','sameDefaultSVG','changedSVG','restored','restoreSVG','invalid'])assert(out[key],key);
assert.equal(out.saved.dx,.25);assert.equal(out.saved.dy,-.4);assert.equal(out.stale.dx,0);assert.equal(out.reverse.dx,0);assert.equal(out.reverse.dy,0);
console.log('PASS: display-only batch translation, SVG opt-in, unchanged model/load rows/default report symbols, save/reload, stale guard and restore');
module.exports=fixture;
