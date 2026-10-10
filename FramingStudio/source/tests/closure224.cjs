const path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs'),c=context(path.resolve(__dirname,'../..'));
for(const transpose of [false,true])for(const reverse of [false,true]){
 const result=c.run(`(()=>{const turn=q=>argument.transpose?[q[1],q[0]]:q,make=(id,a,z,kind='MB')=>({id,kind,a:turn(argument.reverse?z:a),z:turn(argument.reverse?a:z),b:1.5,d:.7}),parent=make('MB14',[16,13],[24.25,13]),child=make('MB_1',[20.25,13],[20.25,25]),upper=make('MB19-1',[20.25,.75],[20.25,13]),m={key:'F04',beams:[parent,child,upper],walls:[],columns:[],slabs:[]},p={},r={floors:[{type:'other'}]},before=JSON.stringify(m);
 ReviewLayout191.move(p,m,['MB:MB14'],argument.transpose?.75:0,argument.transpose?0:.75);
 const map=ReviewLayout191.offsets(p,'F04'),shapes=FramingSymbols98.members(p,m,1,r,x=>x,y=>y,1,{drawingOffsets191:map,labels:false}).shapes;
 const edge=(s,a,z)=>s.type==='line'&&Math.hypot(s.x-a[0],s.y-a[1])<1e-8&&Math.hypot(s.x2-z[0],s.y2-z[1])<1e-8||s.type==='line'&&Math.hypot(s.x-z[0],s.y-z[1])<1e-8&&Math.hypot(s.x2-a[0],s.y2-a[1])<1e-8;
 const closed=shapes.some(s=>s.reviewBeamEdge197==='MB14'&&edge(s,turn([16,14.5]),turn([24.25,14.5]))),childEdges=shapes.filter(s=>s.reviewBeamEdge197==='MB_1'),clear=childEdges.every(s=>{const a=turn([s.x,s.y]),z=turn([s.x2,s.y2]);return Math.min(a[1],z[1])>=14.5-1e-8||Math.abs(a[1]-13)<1e-8&&Math.abs(z[1]-13)<1e-8;});
 const crossing=make('cross',[20.25,10],[20.25,25]),parallel=make('parallel',[18,13],[22,13]),corner=make('corner',[16,13],[16,25]);
 return {closed,clear,unchanged:JSON.stringify(m)===before,svg:FramingSymbols98.svgShapes(shapes),excluded:[crossing,parallel,corner].map(q=>ReviewLayout191.supportsEnd224(parent,q)),noOffset:ReviewLayout191.supportsEnd224(parent,child)};})()`,{transpose,reverse});
 assert(result.closed,'Supporting beam must have a continuous 1500 mm junction closure after a 750 mm display move');assert(result.clear,'Attached beam sides must still trim to the support face');assert(result.unchanged);assert.deepEqual(Array.from(result.excluded),[false,false,false]);assert(result.noOffset);assert(result.svg.includes('<path'));
}
console.log('PASS: moved T-junction closure both axes/end orders; child sides trimmed, crossing/corner/parallel excluded, model immutable and SVG generated');
