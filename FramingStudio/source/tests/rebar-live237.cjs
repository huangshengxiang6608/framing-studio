const path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs');
const c=context(path.resolve(__dirname,'../..'));
const result=c.run(`(()=>{
 const cases=[];
 for(const kind of ['MB','SB','TB','CB']){
  const options={kind,L:6,b:400,h:750,fcu:45,cover:40,M:400,V:100,T:80},original=SectionB.beam(options),row={kind,result:original},snapshot=JSON.stringify(row);
  const good=BeamRebar116.preview237(row,original.steel),weakSteel={...original.steel,G58:8,H58:250,G76:8,H76:250},weak=BeamRebar116.preview237(row,weakSteel);
  const mixed={...original.steel,C110:1,D110:20},mixedResult=BeamRebar116.preview237(row,mixed);
  cases.push({kind,original,good,weak,mixedResult,providedTorsion:SectionB.machine(kind,good.result.inputs).get("K76"),direct:SectionB.beam({...options,steel:mixed}),measures:BeamRebar116.measures237(good,original.steel),metrics:BeamRebar116.metrics238(good),unchanged:snapshot===JSON.stringify(row),goodRC:Loading.auditChecks205({},good).b,weakRC:Loading.auditChecks205({},weak).b});
 }
 return {cases,missing:BeamRebar116.preview237(null,{}),invalid:BeamRebar116.preview237(cases[0].good,{...cases[0].original.steel,C40:9999})};
})()`);
for(const entry of result.cases){
 for(const cell of ['G29','K30','K51'])assert(entry.metrics.includes('data-rc-metric238="'+cell+'">'+c.run('BeamLoads.display208(argument)',entry.good.result.values[cell])));
 assert(entry.unchanged,'Draft evaluation must not mutate cached results');
 assert.deepEqual(entry.mixedResult.result,entry.direct,'Preview must use existing engine exactly');
 for(const [part,required,provided,check]of [['top','K36','G40','N40'],['bottom','K38','G44','N44'],['shear','K56','K58','N59'],['torsion','K72','K76','N77']]){
  const measure=entry.measures[part],v={...entry.good.result.values,K76:entry.providedTorsion};
  assert.equal(measure.req,v[required]);assert.equal(measure.status,v[check]);assert(Number.isFinite(measure.provided));assert(Math.abs(measure.provided-v[provided])<1.001,JSON.stringify({kind:entry.kind,part,provided:measure.provided,engine:v[provided]}));
 }
 assert(entry.mixedResult.result.fail.includes('每面单一直径及两级直径差'),'Keep original design policy; independent editing must not silently drop checks');
 if(entry.kind!=='CB'){assert.equal(entry.goodRC.status,'OK');assert.equal(entry.weakRC.status,'NOT OK');}
}
assert.equal(result.missing,null);assert.equal(result.invalid.result.status,'INPUT REQUIRED');assert(result.invalid.result.fail.length);
console.log('PASS live RC: four beam kinds, complete engine parity, required/provided mapping, pass/fail changes, mixed-layer validation, missing/invalid inputs and cached-result preservation');
