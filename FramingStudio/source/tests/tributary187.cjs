const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs'),c=context(path.resolve(__dirname,'../..'));
c.run(fs.readFileSync(path.join(__dirname,'loading115-browser.js'),'utf8'));
const result=c.run(`(()=>{
 const p=Engine.clone(loading115Tests().projects.slab),t=p.types.F1;p.axes={x:[{id:'1',gap:0},{id:'2',gap:10}],y:[{id:'A',gap:0},{id:'B',gap:8}]};p.explorer={};Loading.init(p);LoadData.setFloor(p,1,{usage:'Dormitory',dl:10,sdl:0,ll:2});
 t.columns=[[1,2],[9,2],[1,6],[9,6]].map(([x,y],i)=>({id:'C'+i,x,y,b:500,d:500,on:true,status:'上下贯通'}));
 t.beams=[['B1',[1,2],[9,2]],['B2',[1,6],[9,6]],['V1',[1,2],[1,6]],['V2',[5,2],[5,6]],['V3',[9,2],[9,6]]].map(([id,a,z])=>({id,kind:'MB',a:{x:a[0],y:a[1]},z:{x:z[0],y:z[1]},b:500,d:350,on:true}));
 t.slabVoids=[{x0:0,x1:1,y0:0,y1:8},{x0:9,x1:10,y0:0,y1:8},{x0:1,x1:9,y0:0,y1:2},{x0:1,x1:9,y0:6,y1:8}];
 Engine.validate(p);let r=Engine.generate(p),m=Engine.floorModel(r,1);const panels=m.slabs.filter(s=>s.x0>1&&s.x1<9&&s.y0>2&&s.y1<6);if(panels.length!==2)throw Error('two panels required');
 for(const s of panels)p.explorer.members['1|'+Loading.token('SLAB',s)]={direction:'Y'};
 // Explicit floor direction avoids an ambiguous square-panel default.
 p.types.F1.slabDirections=Object.fromEntries(panels.map(s=>[Loading.token('SLAB',s),'Y']));
 for(const s of panels)Loading.input(p,1,Loading.token('SLAB',s)).direction='Y';
 const out=Loading.run(p,r,'B'),row=out.rows.find(x=>x.member.id==='B1');if(!row.actions)throw Error(JSON.stringify(row.loadErrors));const lines=row.loading.automaticLines.filter(x=>panels.some(s=>s.id===x.label));
 return {p,panels:panels.map(s=>({id:s.id,x0:s.x0,x1:s.x1})),lines,area:ColumnLoads101.dimensions({auto:true,area:59.109375,rects:[{x0:20.125,x1:25,y0:6.875,y1:19}]}),cut:ColumnLoads101.dimensions({auto:true,area:8,rects:[{x0:0,x1:2,y0:0,y1:2},{x0:2,x1:4,y0:0,y1:2}]})};
})()`);
assert.equal(result.area.x,4.875);assert.equal(result.area.y,12.125);assert(result.area.rectangle);
for(const [i,panel]of result.panels.sort((a,b)=>a.x0-b.x0).entries()){
 const lines=result.lines.filter(l=>l.label===panel.id);assert(lines.length,'receiving beam gets slab '+panel.id);
 assert.equal(Math.min(...lines.map(l=>l.start)),i*4);assert.equal(Math.max(...lines.map(l=>l.end)),(i+1)*4);
}
const variants=c.run(`(()=>{const model={slabs:[]},b={kind:'MB',a:[0,0],z:[8,0],b:.5,d:.35};return {unknown:Loading.fullSpanSlabLoads179([{label:'unknown',slabLoad179:true,start:1,end:3,g:2,q:1}],8,b,model),cut:ColumnLoads101.dimensions({auto:true,area:7,rects:[{x0:0,x1:4,y0:0,y1:2}]})};})()`);
assert.equal(variants.unknown[0].start,1);assert.equal(variants.unknown[0].end,3);assert(!variants.cut.rectangle);
const mapped=c.run(`(()=>{const p=argument,m=Engine.floorModel(Engine.generate(p),1),slab=m.slabs.find(s=>s.x0>1&&s.x1<5&&s.y0>2&&s.y1<6),b=m.beams.find(b=>b.id==='B1'),reverse={...b,a:b.z,z:b.a,rawA:b.rawZ,rawZ:b.rawA},lines=[{label:slab.id,slabLoad179:true,start:.25,end:2,g:1,q:2},{label:slab.id,slabLoad179:true,start:2,end:3.75,g:3,q:4}];return {pieces:Loading.fullSpanSlabLoads179(lines,8,b,m),reverse:Loading.fullSpanSlabLoads179([{...lines[0],start:4.25,end:7.75}],8,reverse,m),manual:Loading.beamSpanLoads(Loading.beamSpan(b,{beamSpan:4}),Loading.fullSpanSlabLoads179(lines,8,b,m),[]).lines};})()`,result.p);
assert.deepEqual(Array.from(mapped.pieces,l=>[l.start,l.end]),[[0,2],[2,4]]);assert.equal(mapped.reverse[0].start,4);assert.equal(mapped.reverse[0].end,8);assert.equal(mapped.manual.at(-1).end,2);assert.equal(mapped.manual[0].g,1);
if(require.main===module)console.log('PASS: two adjacent slabs load 0–4 / 4–8 m on same beam, centreline intervals meet without overlap; 59.109375 area dimensions and nonrectangular label guards');
module.exports=result;
