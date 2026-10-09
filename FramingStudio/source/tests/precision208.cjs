const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs'),c=context(path.resolve(__dirname,'../..'));
const near=(a,b,m='')=>assert(Number.isFinite(a)&&Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${m}: ${a} != ${b}`);
for(const [n,text] of [[3949.411875,'3949.411…'],[492.225,'492.225'],[1,'1.000'],[0,'0.000'],[-0,'0.000'],[.1+.2,'0.300'],[.0000001,'0.000…'],[-1.2349,'-1.234…'],[999.99999,'999.999…'],[1e21,'1000000000000000000000.000'],[NaN,'—']])assert.equal(c.run('BeamLoads.display208(argument)',n),text);
const raw=c.run(`(()=>{const r={g:6.121234567,q:2.221234567,ug183:999,uq183:888,reaction207:true},f=BeamLoads.factored(r),n=BeamLoads.normalized(r),sw=BeamLoads.selfWeight(24.5*1.5*.7),d=Loading.actions(4.5,0,0,[],true,[{...sw,start:0,end:4.5}],{});return {r,f,n,sw,d};})()`);
near(raw.f.g,1.4*raw.r.g);near(raw.f.q,1.6*raw.r.q);near(raw.n.g,raw.r.g);near(raw.n.ug183,raw.f.g);near(raw.sw.g,25.725);near(raw.sw.ug183,36.015);near(raw.d.left,162.0675);near(raw.d.M,364.651875);
// Old saved rounded records must factor their actual exported G/Q, never stale ULS caches.
const cb=c.run(`(()=>{const lines=[{start:0,end:4.5,g:25.73,q:0,ug183:36.02,uq183:0},{start:0,end:3.75,g:7.35,q:11.25,ug183:10.29,uq183:18},{start:0,end:3.75,g:6.01,q:9.19,ug183:8.41,uq183:14.7}],points=[{x:3.75,g:437.42,q:157.5,ug183:612.35,uq183:252},{x:3.75,g:220.4,q:73.52,ug183:308.51,uq183:117.6}];return {a:Loading.actions(4.5,0,0,points,true,lines,{}),d:BeamLoadUI.diagram207(4.5,[...lines,...points],{cb:true,fixedEnd:'a'})};})()`);
near(cb.a.left,1645.459);near(cb.a.M,5565.86025);near(cb.d.RA,cb.a.left);near(-cb.d.M.min.value,cb.a.M);
const seed=fs.readFileSync(path.join(__dirname,'slab-bay178.cjs'),'utf8').split('const result=c.run(`')[1].split('`);')[0],p=c.run(seed).p;
const output=c.run(`(()=>{const p=Engine.clone(argument);p.defaults.slab=201;for(const f of [1,2])LoadData.setFloor(p,f,{dl:10.123456,sdl:.3333333,ll:5.0033333});const r=Engine.generate(p),out=Loading.run(p,r,'B');for(const row of out.rows)if(row.actions){p.explorer.selected[row.floor+'|'+row.token]=true;p.explorer.reportB[row.floor+'|'+row.token]=true;}const checked=Loading.run(p,r,'B');return {p,r,out:checked,plan:RCPlan.build(p,'B')};})()`,p);
let transfers=0,beams=0,slabs=0,rc=0;
for(const row of output.out.rows){
 if(row.slabReactions){near(row.loading.sw,4.9245);near(row.loading.factored183.sw,6.8943);near(row.loading.factored183.sdl,1.4*.3333333);near(row.loading.factored183.ll,1.6*5.0033333);for(const s of row.slabReactions){near(s.ug183,1.4*s.g);near(s.uq183,1.6*s.q);near(s.g,(4.9245+.3333333)*2.45/2);near(s.q,5.0033333*2.45/2);}slabs++;}
 if(!row.actions)continue;beams++;const a=row.actions;
 near(a.factoredDead.left,1.4*a.dead.left);near(a.factoredLive.left,1.6*a.live.left);near(a.left,a.factoredDead.left+a.factoredLive.left);near(a.right,a.factoredDead.right+a.factoredLive.right);
 if(row.result.inputs){near(row.result.inputs.G23,a.M);near(row.result.inputs.G24,a.V);rc++;}
 for(const pt of row.loading.automaticPoints||[]){const child=output.out.rows.find(x=>x.floor===row.floor&&x.id===pt.label);if(!child?.actions)continue;const end=pt.sourceEnd==='B'?'right':'left';near(pt.g,child.actions.dead[end]);near(pt.q,child.actions.live[end]);near(pt.ug183,1.4*pt.g);near(pt.uq183,1.6*pt.q);transfers++;}
}
assert(beams>0&&slabs>0&&transfers>0&&rc>0);assert(!output.plan.issues.length,JSON.stringify(output.plan.issues));
// Separate G/Q moment peaks must not be added. Manual-span scaling retains force.
const special=c.run(`(()=>{const a=Loading.actions(6,0,0,[{x:1,g:10.12345,q:0},{x:5,g:0,q:10.67891}],false,[],{}),d=BeamLoadUI.diagram207(6,[{x:1,g:10.12345,q:0},{x:5,g:0,q:10.67891}]),s=Loading.beamSpanLoads({ratio:2,automatic:4,value:8},[{start:0,end:4,g:6.01234567,q:7.01234567,ug183:999,uq183:999}],[]).lines[0];return {a,M:d.M.max.value,s,f:BeamLoads.factored(s)};})()`);
near(special.a.M,special.M);assert(special.a.M<special.a.factoredDead.M+special.a.factoredLive.M);near(special.s.g*8,6.01234567*4);near(special.f.g,1.4*6.01234567/2);
// Export exactly the records and expectations consumed by ExcelBridge.FullLoadsJob.
c.run(fs.readFileSync(path.join(__dirname,'loading115-browser.js'),'utf8'));const legacy=c.run('loading115Tests()');
const jobs=[...output.plan.batches,...legacy.cbPlan.batches];
if(process.env.PRECISION208_JOBS)fs.writeFileSync(process.env.PRECISION208_JOBS,JSON.stringify(jobs));
console.log('PASS precision, legacy-cache rejection, raw self-weight, slab/SB/MB transfers, RC inputs, manual-span scaling, 3dp display and export fixtures:',{beams,slabs,transfers,rc,jobs:jobs.length});
