const assert=require('assert/strict'),fs=require('fs'),path=require('path'),{context,app}=require('./audit-performance247.cjs');
const c=context();
c.run(`(()=>{
 const row=(id,M,floor=1,kind='SLAB',extra={})=>({kind:'SLAB',displayType:kind,id,token:'SLAB|'+id,floor,framing:'F'+floor,member:{thickness:200},result:{values:{D22:M}},...extra});
 const check=(v,s)=>{if(!v)throw Error(s)},rows=[row('SL-1',10),row('SL-10',30,2),row('SL-2',-30,2),row('SL-3',20,28),row('CS-1',50,1,'CS'),row('CS-2',60,28,'CS')],groups=BeamRepresentatives250.select(rows);
 check(groups.length===2,'Separate native slab types, global rather than per framing');
 check(groups.find(g=>g.kind==='SLAB').winner.id==='SL-2','Absolute maximum with numeric deterministic tie');
 check(groups.find(g=>g.kind==='CS').winner.floor===28,'Highest floor included');
 const ex={};BeamRepresentatives250.sync(ex,groups);for(const g of groups)for(const n of ['selected','reportA','reportB'])check(ex[n][BeamRepresentatives250.key(g.winner)],'Three default flags');
 BeamRepresentatives250.manual(ex,'2|SLAB|SL-2','reportA',false);BeamRepresentatives250.sync(ex,groups);check(ex.reportA['2|SLAB|SL-2']===false,'Manual deselection retained');
 const next=BeamRepresentatives250.select([...rows,row('SL-4',40,3)]);BeamRepresentatives250.sync(ex,next);check(!ex.selected['2|SLAB|SL-2']&&ex.selected['3|SLAB|SL-4'],'Old automatic winner replaced');
 for(const bad of [row('missing',undefined,4),row('missing',999,4,'SLAB',{loadErrors:['load missing']})]){const incomplete=BeamRepresentatives250.select([...rows,bad]),state={};BeamRepresentatives250.sync(state,incomplete);check(incomplete.find(g=>g.kind==='SLAB').missing===1,'Missing data blocks confirmed maximum');check(Object.keys(state.selected).length===1,'Only complete CS selected');}
 const failed=row('failed',100,3,'SLAB',{result:{values:{D22:100},autoFailed:true,status:'NOT OK'}});check(BeamRepresentatives250.select([...rows,failed]).find(g=>g.kind==='SLAB').winner.id==='failed','Never replace failing maximum by a smaller passing slab');
 check(BeamRepresentatives250.select([]).length===0,'Empty project');
})();`);
const ui=fs.readFileSync(path.join(app,'source/explorer-ui.js'),'utf8').replace(/\r\n/g,'\n').trim(),html=fs.readFileSync(path.join(app,'assets/index.html'),'utf8').replace(/\r\n/g,'\n');assert.equal(html.split(ui).length,2);
console.log('PASS slab global maxima, independent SLAB/CS, absolute moment, ties, missing data, manual overrides, changed winners, failing maximum and served source parity');
if(process.argv[2])(async()=>{
 const model=JSON.parse(fs.readFileSync(process.argv[2],'utf8').replace(/^\uFEFF/,''));
 const result=await c.run(`(async()=>{const p=argument,before=JSON.stringify(p),r=Engine.generate(p),audit=await AuditRunner132.run(p,r,{retainOutput226:true}),groups=BeamRepresentatives250.select(audit.output226.rows);if(JSON.stringify(p)!==before)throw Error('Audit mutated model');BeamRepresentatives250.sync(p.explorer,groups);return {p,groups,rows:audit.output226.rows,plans:['A','B'].map(s=>ExcelSync.plan(p,'Report',s))}})()`,model);
 const slabs=result.groups.filter(g=>['SLAB','CS'].includes(g.kind));assert(slabs.length);assert(slabs.every(g=>g.winner&&!g.missing));
 const out=path.dirname(process.argv[2]);fs.writeFileSync(path.join(out,'selected-model.json'),JSON.stringify(result.p));
 fs.writeFileSync(path.join(out,'audit-after.json'),JSON.stringify({rows:result.rows}));
 const jobs=result.plans.flatMap(p=>p.jobs.filter(j=>j.type==='RC').map(j=>({...j,preview:true,_reportSection:j.section,fingerprint:require('crypto').createHash('sha256').update(JSON.stringify(result.p)).digest('hex')})));
 assert.equal(jobs.length,2);assert(jobs.every(j=>j.members.some(m=>m.kind==='SLAB')&&j.members.filter(m=>m.kind==='COL').length===2));
 fs.mkdirSync(path.join(out,'host'),{recursive:true});fs.writeFileSync(path.join(out,'host/request.json'),JSON.stringify({kind:'excel-run',parallelReports:true,openWhenReady:false,jobs}));
 const evidence={slabs:slabs.map(g=>({count:g.count,kind:g.kind,id:g.winner.id,floor:g.winner.floor,M:g.winner.result.values.D22,status:g.winner.result.status})),issues:result.plans.map(p=>p.issues),jobs:jobs.map(j=>({section:j.section,members:j.members.length}))};
 fs.writeFileSync(path.join(out,'selection.json'),JSON.stringify(evidence,null,2));console.log(JSON.stringify(evidence));
})().catch(e=>{console.error(e);process.exitCode=1});
