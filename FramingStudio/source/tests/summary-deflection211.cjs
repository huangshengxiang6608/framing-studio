const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs');
require('./summary-sections205.cjs');
const c=context(path.resolve(__dirname,'../..'));c.run(fs.readFileSync(path.join(__dirname,'loading115-browser.js'),'utf8'));
const checks=c.run(`(()=>{
 const projects=loading115Tests().projects;let count=0,available=0,pending=0;
 for(const p of Object.values(projects)){
  const before=JSON.stringify(p),r=Engine.generate(p),base=Loading.audit(p,r),enriched=Loading.audit(p,r,BeamLoadUI.summary211);
  const stripped=JSON.parse(JSON.stringify(enriched));for(const row of stripped.items)delete row.deflection211;
  if(JSON.stringify(base)!==JSON.stringify(stripped))throw Error('A/B outcome or audit list changed');
  const q=Engine.clone(p);for(const f of r.floors)for(const m of Loading.members(q,r,f.n))q.explorer.selected[f.n+'|'+m.token]=true;
  for(const row of Loading.run(q,r,'B').rows){
   const s=BeamLoadUI.summary211(p,row);if(!['MB','SB','TB','CB'].includes(row.kind)){if(s!==null)throw Error('Non-beam summary');continue;}count++;
   if(!row.actions){if(s.state!=='pending'||s.max!==undefined)throw Error('Invalid loading should not display zero');pending++;continue;}
   if(s.state!=='available')throw Error(s.reason);available++;
   // Reconstruct the diagram's displayed raw-A schedule independently of the
   // solved root-based schedule consumed by summary211.
   const l=row.loading,o=Loading.input(p,row.floor,row.token),draft=BeamLoads.draft(o,l.L),manual=l.mode==='手动总荷载';let rows=[];
   if(!manual){rows=[...l.automaticLines,...l.automaticPoints];if(l.sw)rows.push({start:0,end:l.L,g:l.sw,q:0});}
   if(draft.mode!=='auto')rows.push(...draft.rows.map(v=>v.type==='point'?{x:v.a,g:v.dl,q:v.ll}:{start:v.a,end:v.b,g:v.dl,q:v.ll}));
   if(manual&&draft.self)rows.push(...Loading.beamSelfWeight(row.member,l.L));
   const orient=BeamLoadUI.orientation(row.member),v=BeamLoadUI.deflection210(l.L,rows,{B:row.member.b,D:row.member.d,E:s.E,reverse:orient.reverse,cb:l.support==='Cantilever',fixedEnd:l.fixedEnd});
   if(Math.abs(s.max-Math.abs(v.peak.delta))>1e-8*Math.max(1,s.max)||Math.abs(s.x-v.peak.x)>1e-8)throw Error('Summary differs from graph '+row.id);
  }
  if(JSON.stringify(p)!==before)throw Error('Project/report selections mutated');
 }
 return {count,available,pending};
})()`);
assert(checks.available>0&&checks.pending>0);console.log('PASS actual manual/auto/extra/self-weight/transfer fixtures, graph parity, unchanged A/B and list, immutability',checks);
const synthetic=c.run(`(()=>{
 const p={explorer:{settings:{fcu:45,tbFcu:60}}},L=6,B=.3,D=.6,w=10,EI=26.4e6*B*D**3/12;
 const row={kind:'MB',member:{kind:'MB',b:B,d:D,rawA:[0,0],rawZ:[L,0]},actions:{},loading:{L,udlDead:w,udlLive:0,lines:[],points:[],support:'Simply-supported'}};
 const base=JSON.stringify(row),simple=BeamLoadUI.summary211(p,row);if(JSON.stringify(row)!==base)throw Error('Row mutated');
 const tb=BeamLoadUI.summary211(p,{...row,kind:'TB',member:{...row.member,displayKind:'TB'}});
 const invalid=BeamLoadUI.summary211({explorer:{settings:{fcu:47}}},row),absent=BeamLoadUI.summary211(p,{...row,actions:null,loadErrors:['Missing support']});
 const cb=[];for(const end of ['a','z'])for(const reversed of [false,true]){
  const m={...row.member,displayKind:'CB',rawA:reversed?[0,L]:[0,0],rawZ:reversed?[0,0]:[0,L]},rr={...row,member:m,loading:{...row.loading,support:'Cantilever',fixedEnd:end,udlDead:0,points:[{x:L,g:12,q:8}]}};
  cb.push(BeamLoadUI.summary211(p,rr));
 }
 return {simple,tb,invalid,absent,cb,expectedSimple:5*w*L**4/(384*EI)*1000,expectedCB:20*L**3/(3*EI)*1000};
})()`);
const near=(x,y)=>assert(Math.abs(x-y)<1e-8*Math.max(1,Math.abs(y)),`${x} != ${y}`);
near(synthetic.simple.max,synthetic.expectedSimple);near(synthetic.simple.x,3);assert.equal(synthetic.tb.E,30);
assert.equal(synthetic.invalid.state,'pending');assert.equal(synthetic.absent.reason,'Missing support');
synthetic.cb.forEach((v,i)=>{near(v.max,synthetic.expectedCB);near(v.x,[6,0,0,6][i]);assert.equal(v.start,i%2?'B':'A');assert.equal(v.startSide,'上端');});
console.log('PASS independent UDL/CB closed forms, either root/reversed vertical station, TB E, missing material/support');
