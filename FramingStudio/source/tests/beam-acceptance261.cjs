const assert=require('assert/strict'),fs=require('fs'),path=require('path'),{context}=require('./audit-performance247.cjs');
const c=context(),plain=x=>JSON.parse(JSON.stringify(x));
const fixture=`(()=>{const kind=argument,p=Engine.clone(loading115Tests().projects[kind==='CB'?'cb':'slab']);p.total=1;p.groups[0].end='顶层';
 if(kind!=='CB'){const b=p.types.F1.beams[0];b.kind=kind;b.b=250;b.d=300;b.depthOverride184=300;b.widthMode='manual';}
 const model=Engine.generate(p),m=Loading.members(p,model,1).find(m=>kind==='CB'?m.member.displayKind==='CB':m.kind===kind),L=kind==='CB'?4:6,key='1|'+m.token;
 p.explorer.members[key]={mode:'manual',beamSelfWeight:false,beamSpan:L,beamLoads:[{type:'line',a:0,b:L,dl:kind==='CB'?15:6,ll:kind==='CB'?5:2}],...(kind==='CB'?{fixedEnd:'a'}:{})};
 for(const n of ['selected','reportA','reportB'])p.explorer[n]={[key]:true};return p;})()`;
const inspect=`(()=>{const p=Engine.clone(argument),key=Object.keys(p.explorer.reportB)[0],model=Engine.generate(p),row=Loading.run(p,model,'B').rows.find(r=>r.floor+'|'+r.token===key),gate=Loading.beamAcceptance261(p,row);return {row,gate,A:RCPlan.build(p,'A'),B:RCPlan.build(p,'B')};})()`;
for(const kind of ['MB','SB','TB','CB']){
 const p=c.run(fixture,kind),v=c.run(inspect,p);assert(v.gate.pass,kind);assert.equal(v.row.result.autoFailed,false);assert.equal(v.row.result.values.N87,'NOT OKAY');assert.equal(v.row.result.acceptance261,'rc');assert.equal(v.B.issues.length,0);assert(v.B.batches.length);
 const manual=c.run(`(()=>{const r=argument,v=r.inputs;return SectionB.beam({kind:r.kind,L:v.G12,b:v.G14,h:v.G15,cover:v.G16,fcu:v.G17,M:v.G23,V:v.G24,T:v.K25,steel:r.steel});})()`,v.row.result);
 assert.deepEqual(plain(v.row.result.values),plain(manual.values),'same steel, identical original formula values');
 if(process.env.BEAM261_OUTPUT){const d=path.join(process.env.BEAM261_OUTPUT,kind);fs.mkdirSync(d,{recursive:true});fs.writeFileSync(path.join(d,'project.json'),JSON.stringify(p));fs.writeFileSync(path.join(d,'job.json'),JSON.stringify({...v.B.batches[0],preview:true,fingerprint:'beam261-'+kind}));}
}
const base=c.run(fixture,'SB');
for(const [L,dl,span,actual,pass]of [[6,6,true,true,true],[7,6,false,true,true],[7,15,false,false,false]]){
 const p=plain(base),o=p.explorer.members[Object.keys(p.explorer.reportB)[0]];o.beamSpan=L;o.beamLoads[0].b=L;o.beamLoads[0].dl=dl;
 const v=c.run(inspect,p);assert.equal(v.gate.spanDepth,span);assert.equal(v.gate.actualDeflection,actual);assert.equal(v.gate.pass,pass);assert.equal(v.row.result.values.N87,'NOT OKAY');
 for(const sec of ['A','B'])assert.equal(v[sec].batches.length>0,pass,'report '+sec+' follows OR rule');
 if(!pass)assert(v.B.issues[0].reason.includes('Span/Depth 與 Actual Deflection'));
}
// Every Summary combination follows the same RC AND (A OR actual) truth table.
for(const a of ['P','F','U'])for(const d of ['P','F','U'])for(const b of ['P','F','U']){
 const status=c.run(`(()=>{const [a,d,b]=argument,s=x=>x==='P'?'OK':x==='F'?'NOT OK':'INPUT REQUIRED';return BeamLoadUI.auditStatus214({kind:'SB',status:'NOT OK',checks205:{a:{status:s(a)},b:{status:s(b)}},deflection211:d==='U'?{state:'pending'}:{state:'available',L:10,max:d==='P'?39:40}});})()`,[a,d,b]);
 assert.equal(/^OK/.test(status),b==='P'&&(a==='P'||d==='P'));if(b==='F'||a==='F'&&d==='F')assert.equal(status,'NOT OK');
}
// Complete RC is still compulsory, including true failed selection and missing data.
const accepted=c.run(inspect,base).row;
for(const cell of ['N40','N44','N52','N59','N69','N77','N78']){
 const row=plain(accepted);row.result.values[cell]='NOT OKAY';assert.equal(c.run('Loading.beamAcceptance261(argument.p,argument.row).pass',{p:base,row}),false,cell);
}
for(const mutate of [r=>r.result.autoFailed=true,r=>r.result.values.N40=undefined,r=>r.loadErrors=['missing loads'],r=>{r.result.autoFailed=true;r.result.fail=['RC 選筋限制內未找到通過的單一直徑組合'];r.result.status='NOT OK'}]){
 const row=plain(accepted);mutate(row);assert.equal(c.run('Loading.beamAcceptance261(argument.p,argument.row).pass',{p:base,row}),false);
}
const manualBad=plain(base),key=Object.keys(manualBad.explorer.reportB)[0];manualBad.explorer.members[key].steel={C40:2,D40:10,C44:2,D44:10,E58:2,G58:8,H58:250,E76:2,G76:8,H76:250};assert.equal(c.run(inspect,manualBad).B.batches.length,0,'manual RC failure blocks reports');
console.log('PASS four beam kinds with N87 NOT OKAY; unchanged formula values; A/B gates; 27 status combinations; seven RC failures; missing/failed/manual cases');
(async()=>{
 const p=plain(base);let cache;
 for(const dl of [6,15,4]){
  p.explorer.members[Object.keys(p.explorer.reportB)[0]].beamLoads[0].dl=dl;
  const out=await c.run(`(async()=>{const p=argument.p,r=Engine.generate(p),opts={beamSummary:BeamLoadUI.summary211,includePassedBeams:true,retainOutput226:true,capture228:true},a=await AuditRunner132.run(p,r,{...opts,reuse228:argument.cache}),b=await AuditRunner132.run(p,r,opts);return {same:JSON.stringify(a.output226)===JSON.stringify(b.output226),cache:a.cache228};})()`,{p,cache});assert(out.same);cache=out.cache;
 }
 console.log('PASS full/incremental audit parity through repeated load edits');
})().catch(e=>{console.error(e);process.exitCode=1});
module.exports={fixture,inspect};
