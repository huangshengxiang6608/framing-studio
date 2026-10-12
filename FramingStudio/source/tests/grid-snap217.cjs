// Execute the shipped snapping functions and beam-creation branch with the real engine.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs');
const c=context(path.resolve(__dirname,'../..')),app=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');
c.run(fs.readFileSync(path.join(__dirname,'loading115-browser.js'),'utf8'));
const functions=app.slice(app.indexOf(' function gridPoint(q)'),app.indexOf(' function tileAt(q)'));
const creation=app.slice(app.indexOf("  if(['walls','beams','beamLayout'].includes(tab)&&g){"),app.indexOf("  if(['beams','beamLayout'].includes(tab)&&start&&!g)"));
const result=c.run(`(()=>{
 const base=loading115Tests().projects.slab;let p=Engine.clone(base),key='F1',floor=1,tab='beamLayout',beamKind='CB',start=[2,1.5],showColumnGrid=true,mode='plan',selectOnly=false,sbAreaDrawing=false,visible={};
 let plot={scale:50,ox:0,oy:0},result;
 const reset=()=>{p=Engine.clone(base);p.types.F1.beams=[];p.types.F1.walls=[];p.types.F1.columns=[{id:'ROOT',x:2,y:1.5,b:250,d:250,on:true,status:'上下贯通'}];start=[2,1.5];result=Engine.generate(p);};reset();
 ${functions}
 const snap=q=>{const a=beamPoint(q);return a?{x:a.x,y:a.y}:null;};
 const horizontal=snap([6.1,1.55]),vertical=snap([2.08,4.1]),diagonal=snap([4,2.5]),outside=snap([6.4,1.5]);
 const unique=beamGridPoints217().length;let arcs=0;const drawing={save(){},restore(){},setLineDash(){},beginPath(){},arc(){arcs++;},fill(){},stroke(){}};
 drawBeamGrid217(drawing);const shown=arcs;selectOnly=true;drawBeamGrid217(drawing);const hidden=arcs===shown;selectOnly=false;
 const newBeam=(kind,end,opening=false)=>{reset();beamKind=kind;let g=beamPoint(end),t=p.types[key],error=null;if(opening)t.opening={'0,0':true};const refresh=()=>{},toast=()=>{},nextId=(_,prefix)=>prefix+'1',transact=fn=>{try{fn();result=Engine.generate(p);return true;}catch(e){error=e.message;return false;}};
  (()=>{${creation}})();
  const m=Engine.floorModel(result,1),raw=t.beams[0],supports=m.beams.length?Loading.supportSummary(p,result,1,m.beams[0]):[];
  return {kind,error,raw,beams:m.beams.map(b=>({kind:b.kind,a:b.rawA,z:b.rawZ})),columns:m.columns.length,supports};};
 const created=['MB','SB','TB','CB'].map(k=>newBeam(k,[6,1.5])),verticalCreated=['MB','SB','TB','CB'].map(k=>newBeam(k,[2,4])),blocked=newBeam('CB',[6,1.5],true);
 reset();showColumnGrid=false;p.types.F1.columnGrid={targetX:3,targetY:2,x:[0,3,6],y:[0,2,4]};result=Engine.generate(p);const hiddenColumn=snap([3,1.5]);showColumnGrid=true;const visibleColumn=snap([3,1.5]);
 reset();p.types.F1.columns.push(...[0,4].map((y,i)=>({id:'C'+i,x:5.8,y,b:250,d:250,on:true,status:'上下贯通'})));p.types.F1.beams=[{id:'PRIOR',kind:'MB',a:{x:5.8,y:0},z:{x:5.8,y:4},b:250,d:350,on:true}];result=Engine.generate(p);const memberPriority=snap([6,1.5]);
 reset();start=null;const noStart=snap([6,1.5]),noTargets=beamGridPoints217().length;
 reset();plot.scale=100;const zoomOutside=snap([6.2,1.5]);
 return {horizontal,vertical,diagonal,outside,unique,shown,hidden,created,verticalCreated,blocked,hiddenColumn,visibleColumn,memberPriority,noStart,noTargets,zoomOutside};
})()`);
const plain=JSON.parse(JSON.stringify(result));
assert.deepEqual(plain.horizontal,{x:6,y:1.5});assert.deepEqual(plain.vertical,{x:2,y:4});
for(const k of ['diagonal','outside','noStart','zoomOutside','hiddenColumn'])assert.equal(plain[k],null,k);
assert.equal(plain.noTargets,0);assert.equal(plain.unique,4);assert.equal(plain.shown,4);assert(plain.hidden);
assert.deepEqual(plain.visibleColumn,{x:3,y:1.5});assert.deepEqual(plain.memberPriority,{x:5.8,y:1.5});
for(const item of plain.created){assert.equal(item.error,null,item.kind);assert.equal(item.raw.kind,item.kind);assert.deepEqual(item.raw.z,{x:6,y:1.5});assert.equal(item.columns,1,'grid must not create a support');assert(item.beams.length,item.kind);}
for(const item of plain.verticalCreated){assert.equal(item.error,null,item.kind);assert.equal(item.raw.kind,item.kind);assert.deepEqual(item.raw.z,{x:2,y:4});assert.equal(item.columns,1);}
assert(plain.blocked.error);assert.equal(plain.blocked.raw,undefined,'Opening must block creation');
for(const item of plain.created){assert.match(item.supports[0].text,/ROOT/);assert.match(item.supports[1].text,/自由端|未找到支承/);}
console.log('PASS horizontal/vertical grid projections; all four beam types created through shipped handler; no fake columns; existing member priority; zoom threshold; visible column grids; deduplication and draw-mode markers');
