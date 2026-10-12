const path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs');
const c=context(path.resolve(__dirname,'../..'));
const results=c.run(`(()=>{
 const options={kind:'TB',L:30,b:1800,h:3200,fcu:60,cover:50,M:123940.851,V:31418.775,T:0},automatic=SectionB.beam(options),old=Engine.clone(automatic);delete old.steel.E58;
 const oldSnapshot=JSON.stringify(old),recovered=BeamRebar116.steel239(null,old),manual=BeamRebar116.steel239({...recovered,E58:2},old);
 const edits=[{}, {C113:10}, {D113:32}, {G76:10}].map(edit=>SectionB.beam({...options,steel:{...recovered,...edit}}));
 const kinds=['MB','SB','CB','TB'].map(kind=>{const r=SectionB.beam({kind,L:6,b:400,h:750,fcu:45,cover:40,M:400,V:100,T:80});return {kind,stored:r.steel.E58,actual:SectionB.machine(kind,r.inputs).get('E58')};});
 const saved=JSON.parse(JSON.stringify(recovered)),reloaded=SectionB.beam({...options,steel:saved});
 return {automatic,recovered,manual,edits,kinds,reloaded,oldUnchanged:oldSnapshot===JSON.stringify(old),manualCheck:SectionB.beam({...options,steel:manual})};
})()`);
assert.equal(results.automatic.steel.E58,18);assert.equal(results.automatic.steel.G58,16);assert.equal(results.automatic.steel.H58,175);
assert.equal(results.automatic.values.K56,20.437);assert.equal(results.automatic.values.K58,20.681);assert.equal(results.automatic.values.N59,'OKAY');
assert.equal(results.recovered.E58,18);assert(results.oldUnchanged,'Reading legacy cached results must not mutate the cache');
for(const r of results.edits)assert.equal(r.steel.E58,18,'Unrelated reinforcement edit preserves legs');
assert.equal(results.reloaded.steel.E58,18);assert.equal(results.reloaded.values.N59,'OKAY');
assert.equal(results.manual.E58,2,'Explicit manual two-leg input must remain two');assert.equal(results.manualCheck.values.K58,2.298);assert.equal(results.manualCheck.values.N59,'NOT OKAY');
for(const r of results.kinds)assert.equal(r.stored,r.actual,r.kind);
console.log('PASS computed link legs: TB 18T16@175, legacy cache recovery, unrelated edits, JSON save/reload, all four beam kinds, manual two-leg preservation');
