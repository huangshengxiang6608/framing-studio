// Run without a model for portable geometry checks; optionally pass a saved model.
const fs=require('fs'),assert=require('assert/strict'),{context}=require('./audit-performance247.cjs');
const c=context(),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const results=c.run(`(()=>{
 const out=[];
 for(const vertical of [false,true])for(const reversed of [false,true])for(const manual of [false,true])for(const snapshot of [false,true]){
  const xy=([x,y])=>vertical?[y,x]:[x,y],point=q=>({x:xy(q)[0],y:xy(q)[1]});
  const root=xy([4,5]),tip=xy([8,5]),ends=reversed?[tip,root]:[root,tip],links=reversed?[null,{key:'id:C',reference:root}]:[{key:'id:C',reference:root},null];
  const beam={id:'CB',kind:'CB',a:{x:ends[0][0],y:ends[0][1]},z:{x:ends[1][0],y:ends[1][1]},on:true,b:600,d:700,widthMode:manual?'manual':'column',columnSupports164:links};
  const p={format:'framing-app',version:1,name:'CB follow regression',total:1,axes:{x:[{id:'1',gap:0},{id:'2',gap:10}],y:[{id:'A',gap:0},{id:'B',gap:10}]},defaults:{cb:1000,cd:1000,gap:3000,direction:'X',mb:300,sb:250,tb:600,tbd:1200,slab:200,wall:300},groups:[{end:'顶层',h:4,type:'F01',sh:700,min:0}],types:{F01:{mode:'manual',autoBeams101:false,cbColumnWidth171:true,building:{'0,0':true},opening:{},columns:[{id:'C',...point([4,5]),b:1000,d:1000,on:true,status:'上下贯通'}],columnPlacements:[{key:'id:C',...point([4.5,5])}],walls:[{id:'W',a:point([1,1]),z:point([1,9]),b:300,on:true}],beams:[{id:'BACK',kind:'MB',a:point([1,5]),z:point([4,5]),on:true,b:600,d:700,widthMode:'manual',columnSupports164:[null,{key:'id:C',reference:root}]},...snapshot?[]:[beam]],suppressed:[]}}};
  if(snapshot)p.types.F01.autoBeamSnapshot={primary:[{...beam,a:ends[0],z:ends[1],rawA:ends[0],rawZ:ends[1],b:manual?.6:1,d:.7}]};
  const m=Engine.floorModel(Engine.generate(p),1),b=m.beams.find(b=>b.id==='CB'),back=m.beams.find(b=>b.id==='BACK');
  if(!b||!back)throw Error('Missing connected beam '+JSON.stringify(m.issues));
  const end=reversed?'z':'a';if(JSON.stringify(b[end])!==JSON.stringify(xy([4.5,5]))||JSON.stringify(back.z)!==JSON.stringify(b[end]))throw Error('Root not synchronized');
  if(Math.abs(b.b-(manual?.6:1))>1e-7)throw Error('Width rule changed');
  if(JSON.stringify(b.rawA)!==JSON.stringify(ends[0])||JSON.stringify(b.rawZ)!==JSON.stringify(ends[1]))throw Error('Logical load reference changed');
  const fixed=Engine.clone(p),ft=fixed.types.F01;ft.beams=ft.beams.filter(b=>b.id!=='BACK');const fb=snapshot?ft.autoBeamSnapshot.primary[0]:ft.beams[0];fb.positionMode175='fixed';fb.fixedA175=ends[0];fb.fixedZ175=ends[1];const fm=Engine.floorModel(Engine.generate(fixed),1).beams.find(b=>b.id==='CB');if(!fm||JSON.stringify(fm[end])!==JSON.stringify(root))throw Error('Explicit fixed root moved');
  out.push({vertical,reversed,manual,snapshot});
 }
 // Actual overlap remains rejected.
 const overlap={a:[2,5],z:[8,5],b:1},other={id:'other',a:[1,5],z:[4,5],b:1};
 if(!Engine.beamSpaceConflict(overlap,[other]))throw Error('Real overlap accepted');
 return out;
})()`);
assert.equal(results.length,16);
console.log('PASS 16 horizontal/vertical, either-root, manual-width and saved-snapshot CB combinations; stable logical load references; real overlap still rejected');
if(process.argv[2]){
 const p=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
 const rows=c.run(`(()=>{const p=Engine.clone(argument),rows=[];for(const size of [1000,750,500,1500,2000,1000]){
  let r=Engine.generate(p);FloorColumns101.resizeMany(p,r,'F02',2,[{hit:{kind:'COL',id:'C2',f:2},b:size,d:size}]);
  r=Engine.generate(p);const m=Engine.floorModel(r,2,'F02'),b=m.beams.find(b=>b.id==='CB_3'),back=m.beams.find(b=>b.id==='EDIT_1'),col=Engine.columnRect(m.columns.find(c=>c.id==='C2'));
  if(!b||!back)throw Error('Beam missing after resize '+size);
  const reload=Engine.floorModel(Engine.generate(JSON.parse(JSON.stringify(p))),2,'F02').beams.find(b=>b.id==='CB_3');
  if(JSON.stringify(b)!==JSON.stringify(reload))throw Error('Reload changed CB');
  if(m.issues.some(i=>i.id==='CB_3'&&/重疊|未生成/.test(i.msg)))throw Error('CB collision after resize');
  rows.push({size,root:b.a,adjacentEnd:back.z,column:[col.x,col.y],width:b.b,rawA:b.rawA,rawZ:b.rawZ});
 }return rows;})()`,p);
 for(const row of rows){row.root.forEach((v,i)=>{near(v,row.column[i]);near(v,row.adjacentEnd[i]);});near(row.width,row.size/1000);assert.equal(JSON.stringify(row.rawA),'[20.25,25]');assert.equal(JSON.stringify(row.rawZ),'[25,25]');}
 console.log('PASS current model resize 1000 → 750 → 500 → 1500 → 2000 → 1000 mm, common endpoints, column-dependent CB width, reload and input-reference preservation');
 console.log(JSON.stringify(rows,null,2));
}
