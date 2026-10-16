const assert=require('assert/strict'),fs=require('fs'),{context}=require('./audit-performance247.cjs');
const c=context();
c.run(`(()=>{
 const row=(id,N,transfer,floor=1,extra={})=>({kind:'COL',id,token:'COL|'+id,floor,framing:'F'+floor,columnA:{transfer271:{known:true,sources:transfer?[{floor:3,id:'UP',token:'COL|UP'}]:[]}},result:{inputs:{C28:N}},...extra});
 const rows=[row('C1',20,true),row('C2',30,true),row('C3',40,false),row('C4',10,false),row('C5',999,true,2),row('C6',999,false,3)];
 const groups=BeamRepresentatives250.select(rows),assert=(v,s)=>{if(!v)throw Error(s)};
 assert(groups.length===2&&groups.every(g=>g.floor===1),'Global bottom only');assert(groups.find(g=>g.transfer).winner.id==='C2','Maximum transfer N');assert(groups.find(g=>!g.transfer).winner.id==='C3','Maximum normal N');
 const ex={};BeamRepresentatives250.sync(ex,groups);for(const g of groups)for(const n of ['selected','reportA','reportB'])assert(ex[n]['1|'+g.winner.token],'All default flags');
 assert(BeamRepresentatives250.select([row('C1',10,false)]).length===1,'Absent category not invented');
 const tied=BeamRepresentatives250.select([row('C10',10,true),row('C2',10,true)]);assert(tied[0].winner.id==='C2','Deterministic numeric tie');
 const pending=BeamRepresentatives250.select([...rows,row('unknown',50,false,1,{columnA:{transfer271:{known:false,sources:[]}}})]);assert(pending.every(g=>g.missing),'Unknown route blocks both category maxima');const empty={};BeamRepresentatives250.sync(empty,pending);assert(Object.keys(empty.selected).length===0,'Unconfirmed maxima not selected');
 const bad=BeamRepresentatives250.select([...rows,row('bad',100,true,1,{loadErrors:['missing']})]);assert(bad.find(g=>g.transfer).missing===1&&!bad.find(g=>!g.transfer).missing,'Known missing load affects its own category');
 const change=BeamRepresentatives250.select([row('C7',100,true),row('C3',40,false)]);BeamRepresentatives250.manual(ex,'1|COL|C2','reportA',false);BeamRepresentatives250.sync(ex,change);assert(!ex.selected['1|COL|C2']&&ex.reportA['1|COL|C2']===false&&ex.selected['1|COL|C7'],'Changed winner and manual override retained');
})();`);
console.log('PASS global minimum floor; two ULS maxima; absent categories; deterministic ties; missing ownership/loads; all flags; winner changes and manual overrides');
const existing=fs.readFileSync(require.resolve('./column-tributary263.cjs'),'utf8');
const setup=existing.slice(existing.indexOf(' const fixture='),existing.indexOf(' const get='));
const result=c.run(`(()=>{const clone=Engine.clone;${setup}
 const p=fixture(),r=Engine.generate(p),get=(f,id)=>{const m=Engine.floorModel(r,f).columns.find(x=>x.id===id);return Loading.columnAreaGroups(p,r,f,Loading.token('COL',m))};
 const a=get(1,'L'),b=get(1,'R');if(!a.transfer271.known||a.transfer271.sources.length!==2||b.transfer271.sources.length)throw Error('Multi-stage source propagation');
 const token=Loading.token('COL',Engine.floorModel(r,1).columns.find(x=>x.id==='L'));p.explorer.members['1|'+token]={sectionAAreaOverrides115:{2:0,3:0}};if(get(1,'L').transfer271.sources.length)throw Error('Zero area removes transferred contribution');
 p.explorer.members['1|'+token]={sectionAAreaMode:'manual',sectionAAreas:'1, 3, A=25'};if(get(1,'L').transfer271.known)throw Error('Unproven manual ownership');
 const q=fixture();for(const t of ['F2','F3']){q.types[t].columns[0].x=0;q.types[t].columns[0].y=0;}const qr=Engine.generate(q),mid=Engine.floorModel(qr,2).columns.find(x=>x.id==='MID'),base=Engine.floorModel(qr,1).columns.find(x=>x.id==='L');q.explorer.members['2|'+Loading.token('COL',mid)]={sectionAAreaMode:'manual',sectionAAreas:'2, 3, A=15'};if(Loading.columnAreaGroups(q,qr,1,Loading.token('COL',base)).transfer271.known)throw Error('Unknown upstream manual ownership must propagate');
 return true;})()`);
console.log('PASS multi-stage transfer provenance, non-owner 0%, zero overrides, manual ownership unresolved');
if(process.argv[2]) (async()=>{
 const p=JSON.parse(fs.readFileSync(process.argv[2],'utf8').replace(/^\uFEFF/,''));
 const script=`(async()=>{const p=argument,r=Engine.generate(p),a=await AuditRunner132.run(p,r,{retainOutput226:true});return {rows:a.output226.rows,groups:BeamRepresentatives250.select(a.output226.rows).filter(g=>g.kind==='COL')}})()`;
 const a=await c.run(script,p);assert.equal(a.groups.length,2);assert(a.groups.every(g=>g.winner&&g.winner.floor===1&&!g.missing));
 if(process.env.FRAMING_PERFORMANCE_BASELINE){const old=context(true),b=await old.run(script,p);const clean=x=>JSON.parse(JSON.stringify(x,(k,v)=>['transfer271','transferSources271','transferUnknown271'].includes(k)?undefined:v));assert.deepEqual(clean(a.rows),clean(b.rows));console.log('PASS current model complete Check rows unchanged from E2.270, excluding added provenance metadata');}
 console.log(a.groups.map(g=>({id:g.winner.id,N:g.winner.result.inputs.C28,transfer:g.transfer})));
})().catch(e=>{console.error(e);process.exitCode=1});
