// E2.291: insertion is a split of an existing span, never a translation.
const assert=require('node:assert/strict'),path=require('node:path');
const {context}=require('../../verification/integration143.cjs');
const c=context(path.resolve(__dirname,'../..'));
const fixture=()=>({format:'framing-app',version:1,name:'Axis insertion 291',total:3,
 axes:{origin:{x:11.25,y:3.5},x:[{id:'1',gap:0},{id:'3',gap:8},{id:'9',gap:6},{id:'Z',gap:5}],y:[{id:'A',gap:0},{id:'D',gap:7},{id:'B',gap:6}]},
 defaults:{cb:500,cd:500,gap:3000,direction:'X',mb:300,sb:300,tb:600,tbd:1200,slab:200,wall:300},
 groups:[{end:2,h:4,type:'F1',sh:600,min:0},{end:'顶层',h:4,type:'F2',sh:600,min:0}],
 types:Object.fromEntries(['F1','F2'].map(k=>[k,{mode:'manual',autoBeams101:false,building:{'0,0':true,'1,0':true,'1,1':true,'2,0':false,'2,1':true},opening:{'1,1':true},
 columns:[{id:'C1',ax:'3',ay:'D',dx:0,dy:0,b:500,d:500,on:true,status:'上下贯通'}],
 walls:[{id:'W1',a:{ax:'1',ay:'A'},z:{ax:'9',ay:'A'},b:300,on:true}],
 beams:[{id:'MB1',kind:'MB',a:{ax:'1',ay:'D'},z:{ax:'9',ay:'D'},b:300,d:600,on:true}],suppressed:[],
 noColumnZones:[{x0:12,x1:14,y0:4,y1:5}],slabVoids:[{x0:15,x1:16,y0:4,y1:5}]}]))});
module.exports={fixture};
const run=(p,fn)=>JSON.parse(JSON.stringify(c.run('('+fn.toString()+')(argument)',p)));
const near=(a,b)=>assert(Math.abs(a-b)<1e-10,`${a} != ${b}`);
if(require.main===module){
 for(const dim of ['x','y'])for(let index=1;index<fixture().axes[dim].length;index++){
  const result=run({p:fixture(),dim,index},({p,dim,index})=>{
   Engine.generate(p);const before=Engine.clone(p),positions=Engine.axes(p,dim,'F1'),previous=Engine.tiles(p,p.types.F1),other=Engine.clone(p.types.F2),base=Engine.clone(p.axes);
   const members=t=>[...t.columns,...t.walls.flatMap(w=>[w.a,w.z]),...t.beams.flatMap(b=>[b.a,b.z])].map(v=>Engine.resolve(p,v,'F1'));
   const physical=members(p.types.F1),v=positions[index-1].v+(positions[index].v-positions[index-1].v)*.37;
   Engine.insertAxis291(p,'F1',dim,index,'Extra',v);Engine.generate(p);
   const next=Engine.tiles(p,p.types.F1);const point=(ts,x,y)=>ts.find(t=>x>t.x0&&x<t.x1&&y>t.y0&&y<t.y1)?.state;
   const equalRegions=next.every(t=>point(previous,(t.x0+t.x1)/2,(t.y0+t.y1)/2)===t.state);
   return {before,after:p,positions,now:Engine.axes(p,dim,'F1'),physical,afterPhysical:members(p.types.F1),equalRegions,other,base};
  });
  for(const a of result.positions)near(a.v,result.now.find(b=>b.id===a.id).v);
  assert.equal(result.now[index].id,'Extra');assert.equal(result.equalRegions,true,'building and Opening keep physical footprints');
  assert.deepEqual(result.physical,result.afterPhysical,'axis-bound columns, walls and beam endpoints remain fixed');
  assert.deepEqual(result.after.types.F2,result.other,'other Framing remains identical');assert.deepEqual(result.after.axes,result.base,'inherited shared grid untouched');
  for(const name of ['columns','walls','beams','noColumnZones','slabVoids'])assert.deepEqual(result.after.types.F1[name],result.before.types.F1[name],name);
 }
 console.log('PASS every X/Y interval, unordered names, nonzero origins, original coordinates, member references, physical building/Opening footprints and other-Framing isolation');
 const sequence=run(fixture(),p=>{Engine.generate(p);const old={x:Engine.axes(p,'x','F1'),y:Engine.axes(p,'y','F1')};Engine.insertAxis291(p,'F1','x',2,'8',21);Engine.insertAxis291(p,'F1','x',1,'2',15);Engine.insertAxis291(p,'F1','y',2,'C',14);const saved=JSON.parse(JSON.stringify(p));Engine.generate(saved);return {old,now:{x:Engine.axes(saved,'x','F1'),y:Engine.axes(saved,'y','F1')}};});
 for(const d of ['x','y'])for(const a of sequence.old[d])near(a.v,sequence.now[d].find(b=>b.id===a.id).v);
 console.log('PASS insert in arbitrary order repeatedly; JSON save/reopen retains coordinates');
 for(const [dim,index,id,v]of [['x',1,'1',15],['x',1,'',15],['x',1,'a'.repeat(21),15],['x',1,'N',null],['x',1,'N',11.25],['x',1,'N',19.25],['x',1,'N',11.2501],['x',1,'N',20],['x',0,'N',12],['x',4,'N',12],['z',1,'N',12]]){
  const res=run({p:fixture(),dim,index,id,v},q=>{const before=JSON.stringify(q.p);try{Engine.insertAxis291(q.p,'F1',q.dim,q.index,q.id,q.v);return {rejected:false};}catch(e){return {rejected:true,unchanged:JSON.stringify(q.p)===before};}});
  assert(res.rejected&&res.unchanged,JSON.stringify([dim,index,id,v]));
 }
 const limit=run(fixture(),p=>{p.axes.x=Array.from({length:20},(_,i)=>({id:String(i),gap:i?2:0}));const before=JSON.stringify(p);try{Engine.insertAxis291(p,'F1','x',1,'New',12);return false;}catch{return before===JSON.stringify(p);}});assert(limit);
 console.log('PASS duplicates, blank/long names, blank/outside/boundary/too-close coordinates, invalid intervals/directions and 20-axis limit rejected without mutation');
 for(const side of ['left','right']){const precision=run({p:fixture(),side},({p,side})=>{p.axes.origin.x=10000;p.axes.x=Array.from({length:16},(_,i)=>({id:String(i),gap:i?499.99001:0}));for(const t of Object.values(p.types)){t.columns=[];t.walls=[];t.beams=[];}Engine.validate(p);const before=Engine.axes(p,'x','F1'),v=side==='left'?before[14].v+.001:17499.84915;Engine.insertAxis291(p,'F1','x',15,'Extra',v);Engine.validate(p);return {before,after:Engine.axes(p,'x','F1'),gaps:p.types.F1.axes.x.slice(15).map(a=>a.gap)};});assert(precision.gaps.every(g=>g>=.001));near(precision.gaps[0]+precision.gaps[1],499.99001);for(const a of precision.before)near(a.v,precision.after.find(b=>b.id===a.id).v);}
 console.log('PASS exact 1 mm left/right boundaries with high origins and fractional accumulated spans; original span and axes retained');
 const local=run(fixture(),p=>{p.localHeights96=[{id:'LH1',name:'Local',base:1,top:2,type:'F1',cells:[{x0:'1',x1:'3',y0:'A',y1:'D'}]}];Engine.generate(p);Engine.insertAxis291(p,'F1','x',1,'New',15);Engine.insertAxis291(p,'F1','y',1,'Mid',7);Engine.generate(p);const area=LocalHeights96.rectangles(p,p.localHeights96[0]).reduce((s,r)=>s+(r.x1-r.x0)*(r.y1-r.y0),0);return {count:p.localHeights96[0].cells.length,area};});
 assert.equal(local.count,4);near(local.area,56);console.log('PASS local-height Area split in both directions preserves 56 m² and remains valid');
 const cross=run(fixture(),p=>{p.localHeights96=[{id:'LH2',name:'Cross Framing',base:0,top:3,type:'F2',groupStart119:3,cells:[{x0:'1',x1:'3',y0:'A',y1:'D'}]}];Engine.generate(p);const other=JSON.stringify(p.types.F1);Engine.insertAxis291(p,'F2','x',1,'Split',15);Engine.generate(p);let rejected=false;const invalid=Engine.clone(p);invalid.localHeights96[0].cells.pop();try{Engine.validate(invalid);}catch(e){rejected=/完整轴线格/.test(e.message);}return {count:p.localHeights96[0].cells.length,otherPreserved:JSON.stringify(p.types.F1)===other,rejected};});
 assert.equal(cross.count,2);assert(cross.otherPreserved&&cross.rejected);console.log('PASS cross-Framing local-height union remains valid without editing intermediate floors; incomplete intermediate-cell boundary still rejected');
}
