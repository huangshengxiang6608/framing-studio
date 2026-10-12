const assert=require('assert/strict'),{context,fixture}=require('./audit-performance247.cjs');
const scenarios={
 override:`const c=Engine.floorModel(Engine.generate(p),2).columns[0];p.explorer.members['2|'+Loading.token('COL',c)]={sectionAAreaOverrides115:{3:17.5}};`,
 manual:`const c=Engine.floorModel(Engine.generate(p),2).columns[0];p.explorer.members['2|'+Loading.token('COL',c)]={sectionAAreaMode:'manual',sectionAAreas:'2, 3, A=15'};`,
 transfer:`p.types.F2=Engine.clone(p.types.F1);p.groups=[{...p.groups[0],end:1},{...p.groups[0],end:'顶层',type:'F2'}];p.types.F2.columns.push({id:'TC',x:3,y:0,b:250,d:250,on:true,status:'上下贯通'});`,
 missing:`p.types.F2=Engine.clone(p.types.F1);p.groups=[{...p.groups[0],end:1},{...p.groups[0],end:'顶层',type:'F2'}];p.types.F2.columns.push({id:'Floating',x:3,y:2,b:250,d:250,on:true,status:'上下贯通'});`
};
for(const [name,edit]of Object.entries(scenarios)){
 const values=[false,true].map(opt=>{const c=context(opt&&!!process.env.FRAMING_PERFORMANCE_BASELINE),p=c.run(fixture,'TB');return c.run(`(()=>{const p=Engine.clone(argument);${edit}
 const r=Engine.generate(p),rows=Loading.members(p,r,1).filter(x=>x.kind==='COL'),read=()=>{const release=ColumnAreas103.snapshot228(p,r);try{return rows.map(row=>Reports.columnA(p,row,r))}finally{release()}};
 const before=JSON.stringify(p),first=read();if(before!==JSON.stringify(p))throw Error('Project mutated');
 const column=Engine.floorModel(r,2).columns[0],key='2|'+Loading.token('COL',column);p.explorer.members[key]={sectionAAreaOverrides115:{3:27.5}};
 return {first,changed:read(),outside:rows.map(row=>Reports.columnA(p,row,r))};})()`,p)});
 assert.equal(JSON.stringify(values[0]),JSON.stringify(values[1]),name+' complete column schedules');
 assert.equal(JSON.stringify(values[1].changed),JSON.stringify(values[1].outside),'outside scope and post-edit same');console.log('PASS',name,'scoped/unscoped/mutated-input column schedule parity');
}
