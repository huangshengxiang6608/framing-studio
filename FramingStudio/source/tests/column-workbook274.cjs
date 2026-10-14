// Column batching changes only delivery; native job payloads stay independent.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../excel-sync.js'),'utf8');
const helper=source.slice(source.indexOf('function combineColumnJobs274'),source.indexOf('window.ExcelSync='));
const ctx=vm.createContext({});vm.runInContext(helper,ctx);
const job=(section,ids)=>({type:'RC',section,label:'RC '+section+' · 第 1 份',members:ids.map(([kind,id])=>({kind,id})),cells:{C3:45},reportPages:[{name:'Framing'}]});
const run=jobs=>{const before=JSON.stringify(jobs);ctx.jobs=jobs;const output=vm.runInContext('combineColumnJobs274(jobs)',ctx);assert.equal(JSON.stringify(jobs),before);return output};
const a=job('A',[['SB','SB19'],['COL','AC2']]),a2=job('A',[['COL','AC10']]);
const b=job('B',[['TB','TB26'],['COL','AC2']]),b2=job('B',[['COL','AC10']]);
let output=run([a,a2,b,b2]);assert.equal(output.length,2);
for(const [i,parts]of [[0,[a,a2]],[1,[b,b2]]]){
 assert.equal(output[i].columnParts274.length,2);assert.equal(output[i].members.length,3);
 assert.equal(output[i].reportPages,parts[0].reportPages);
 for(let j=0;j<2;j++){
  const {reportPages,...expected}=parts[j];assert.equal(JSON.stringify(output[i].columnParts274[j]),JSON.stringify(expected));
 }
}
assert.equal(run([a]).length,1);assert.equal(run([a])[0],a);
assert.equal(run([job('Check',[['COL','AC2']]),job('Check',[['COL','AC10']])]).length,2);
const other=job('B',[['TB','TB27'],['COL','AC12']]);output=run([b,other,b2]);assert.equal(output.length,2);assert.equal(output[1],other);
const noColumn=job('B',[['TB','TB26']]);output=run([noColumn,b2]);assert.equal(output[0],noColumn);assert.equal(output.length,2);
const a3=job('A',[['COL','AC12']]);assert.equal(run([a,a2,a3])[0].columnParts274.length,3);
console.log('PASS A/B grouping, single-column/Check unchanged, mixed beam capacity retained, original inputs immutable, reference pages rendered once');
