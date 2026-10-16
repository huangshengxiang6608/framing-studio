const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const source=path.resolve(__dirname,'../engine.js'),ctx=vm.createContext({module:{exports:{}},require:n=>require(path.resolve(path.dirname(source),n))});
vm.runInContext(fs.readFileSync(source,'utf8').replace('return {columnReferenceAxes289,','return {followBeamNetwork165,columnReferenceAxes289,'),ctx);const E=ctx.module.exports;
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`),copy=x=>JSON.parse(JSON.stringify(x));
for(const vertical of [false,true])for(const reverse of [false,true])for(const mode of ['manual','auto']){
 const xy=([x,y])=>vertical?[y,x]:[x,y],col=(id,q)=>({id,x:xy(q)[0],y:xy(q)[1],cx:xy(q)[0],cy:xy(q)[1],b:1,d:1});
 const columns=[col('C1',[.5,9.5]),col('C2',[19.5,9.5])];
 const make=(id,a,z,b,kind='MB')=>({id,a:xy(a),z:xy(z),rawA:xy(a),rawZ:xy(z),b,d:1,kind,source:mode,widthMode:'manual'});
 const beams=[make('L',[.75,9.25],[5,9.25],1),make('MID',[5,9.25],[15,9.25],1.5),make('R',[15,9.25],[19.25,9.25],1),make('JOIN1',[5,1],[5,9.25],.3),make('JOIN2',[15,1],[15,9.25],.3),make('SB',[10,1],[10,9.25],.25,'SB')];
 beams[0].columnSupports164=[{key:'id:C1',reference:xy([.75,9.25])},null];beams[2].columnSupports164=[null,{key:'id:C2',reference:xy([19.25,9.25])}];
 const p={types:{F:{mode:'manual'}}},ts=[{x0:0,x1:vertical?10:20,y0:0,y1:vertical?20:10,state:1}],walls=[make('W',[0,1],[20,1],.3,'WALL')];
 if(reverse)for(const b of beams){[b.a,b.z]=[b.z,b.a];[b.rawA,b.rawZ]=[b.rawZ,b.rawA];if(b.columnSupports164)b.columnSupports164.reverse();}
 const original=copy(beams),cross=vertical?0:1;
 E.followBeamNetwork165(p,'F',beams,columns,walls,ts);
 for(const b of beams.slice(0,3)){near(b.a[cross],9.5);near(b.z[cross],9.5);}
 for(const b of beams.slice(3))near(b[reverse?'a':'z'][cross],9.5);
 near(beams[1].b,1.5);assert.ok(!E.rectAllowed(ts,...Object.values(E.rect(beams[1]))));
 assert.deepEqual(beams.map(b=>[b.id,b.rawA,b.rawZ,b.b]),original.map(b=>[b.id,b.rawA,b.rawZ,b.b]));
 const once=JSON.stringify(beams);E.followBeamNetwork165(p,'F',beams,columns,walls,ts);assert.equal(JSON.stringify(beams),once);
 const fixed=copy(original);fixed.forEach(b=>b.positionMode175='fixed');const before=JSON.stringify(fixed);E.followBeamNetwork165(p,'F',fixed,columns,walls,ts);assert.equal(JSON.stringify(fixed),before);
}
console.log('PASS 8 boundary-conflicting chains: both orientations/end orders and manual/auto records; synchronized main/SB joins, retained widths/IDs/references, fixed positions and idempotence');
if(process.argv[2]){
 const {context}=require('./audit-performance247.cjs'),c=context(),p=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
 const rows=JSON.parse(JSON.stringify(c.run(`(()=>{const p=Engine.clone(argument),rows=[];for(const size of [1000,750,500,1500,2000,1000]){let r=Engine.generate(p);const cols=Engine.floorModel(r,2,'F02').columns;FloorColumns101.resizeMany(p,r,'F02',2,cols.map(c=>({hit:{kind:'COL',id:c.id,f:2},b:size,d:size})));r=Engine.generate(p);const m=Engine.floorModel(r,2,'F02'),ids=['MB_4','MB_1','MB_2','MB_5'],beams=ids.map(id=>m.beams.find(b=>b.id===id));if(beams.some(b=>!b))throw Error('Missing MB '+size);const top=Engine.columnRect(m.columns.find(c=>c.id==='AC13')),bottom=Engine.columnRect(m.columns.find(c=>c.id==='AC14'));const reloaded=Engine.floorModel(Engine.generate(JSON.parse(JSON.stringify(p))),2,'F02');if(JSON.stringify(m.beams)!==JSON.stringify(reloaded.beams))throw Error('Reload changed beams');rows.push({size,count:m.beams.length,beams:beams.map(b=>({id:b.id,displayId:b.displayId,a:b.a,z:b.z,b:b.b,rawA:b.rawA,rawZ:b.rawZ})),top:[top.x,top.y],bottom:[bottom.x,bottom.y],issues:m.issues.filter(i=>/梁端已跟隨/.test(i.msg)),cb:!!m.beams.find(b=>b.id==='CB_3')});}return rows;})()`,p)));
 for(const r of rows){const [a,b,c,d]=r.beams;assert.equal(r.count,83);assert(r.cb);assert.deepEqual(a.a,r.top);assert.deepEqual(d.a,r.bottom);assert.deepEqual(a.z,b.a);assert.deepEqual(b.z,c.a);assert.deepEqual(c.z,d.z);near(a.b,r.size/1000);near(d.b,r.size/1000);near(b.b,1.5);near(c.b,1.5);if(r.size<1500)assert.deepEqual(r.issues.map(i=>i.id).sort(),[b.displayId||b.id,c.displayId||c.id].sort());else assert.equal(r.issues.length,0);}
 console.log('PASS current model all-column resize 1000/750/500/1500/2000/1000: 83 beams, common MB joints and column centres, CB retained, manual widths, exact warnings and reload');console.log(JSON.stringify(rows,null,2));
}
