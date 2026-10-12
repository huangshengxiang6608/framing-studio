const path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs');
const c=context(path.resolve(__dirname,'../..'));
const results=c.run(`(()=>{
 const cases=[];
 for(const kind of ['MB','SB','TB','CB'])for(const fire of [1,2,4])for(const manual of [false,true]){
  const cover=manual?42:undefined,result=SectionB.beam({kind,L:6,b:400,h:750,fcu:45,fire,cover,M:400,V:100,T:80}),row={kind,result};
  cases.push({kind,fire,manual,cover:result.inputs.G16,html:BeamRebar116.metrics238(row,{fire,tb:kind==='TB',manualCover:manual})});
 }
 return {cases,missing:BeamRebar116.metrics238(null,{fire:4,tb:true}),invalid:BeamRebar116.metrics238({result:{inputs:{G16:NaN},values:{}}},{fire:2,manualCover:true})};
})()`);
for(const item of results.cases){
 assert.equal(item.cover,item.manual?42:{1:30,2:50,4:80}[item.fire]);
 assert(item.html.includes('data-rc-context240="FRR">'+item.fire+' h'));
 assert(item.html.includes('data-rc-context240="cover">'+item.cover.toFixed(3)+' mm'));
 assert(item.html.includes(item.manual?'手動指定':'按 FRR 採用'));
 assert(item.html.includes(item.kind==='TB'?'TB 獨立設定':'普通梁／CB 共用設定'));
 assert(item.html.indexOf('Effective depth')<item.html.indexOf('FRR ·'));
 assert(item.html.indexOf('FRR ·')<item.html.indexOf('實際 cover'));
 assert(item.html.indexOf('實際 cover')<item.html.indexOf('RC 彎矩係數'));
}
assert(results.missing.includes('data-rc-context240="FRR">4 h'));assert(results.missing.includes('data-rc-context240="cover">待計算'));
assert(results.invalid.includes('data-rc-context240="cover">待計算'));
console.log('PASS FRR/cover display: four beam types, three FRRs, actual calculation cover, manual override, adjacency and missing/invalid values');
