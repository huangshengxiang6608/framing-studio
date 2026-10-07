// Portable geometry regression: no private model or browser required.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=path.resolve(__dirname,'../engine.js'),context=vm.createContext({module:{exports:{}},require:n=>require(path.resolve(path.dirname(source),n))});
vm.runInContext(fs.readFileSync(source,'utf8').replace('return {transferBeamAt,','return {followBeamNetwork165,transferBeamAt,'),context);
const E=context.module.exports,copy=x=>JSON.parse(JSON.stringify(x)),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function fixture(){
 const p={types:{F01:{mode:'manual'}}},columns=[{id:'C1',x:10,y:0,cx:9.75,cy:.75,b:1.5,d:1.5},{id:'C2',x:10,y:20,cx:9.75,cy:19.25,b:1.5,d:1.5}];
 const beam=(id,a,z,kind='MB')=>({id,a:[...a],z:[...z],rawA:[...a],rawZ:[...z],b:kind==='SB'?.25:1,d:1,kind,source:'auto',widthMode:'column'});
 const beams=[beam('M1',[10,0],[10,10]),beam('M2',[10,10],[10,20]),beam('TB',[0,10],[20,10]),beam('S1',[5,5],[10,5],'SB'),beam('S2',[5,15],[10,15],'SB')];
 beams[0].columnSupports164=[{key:'id:C1',reference:[10,0]},null];beams[1].columnSupports164=[null,{key:'id:C2',reference:[10,20]}];
 const walls=[{...beam('W',[4.85,0],[4.85,20],'WALL'),rawA:[5,0],rawZ:[5,20],b:.3}];
 // Opening on the wall's far side: existing SB wall-face connections must stay put.
 const ts=[{x0:5,x1:21,y0:0,y1:20,state:1},{x0:0,x1:5,y0:9,y1:11,state:1}];
 return {p,beams,columns,walls,ts};
}
function run(f){E.followBeamNetwork165(f.p,'F01',f.beams,f.columns,f.walls,f.ts);return f;}
const f=fixture(),before=copy(f.beams);run(f);
for(const b of f.beams.slice(0,2)){near(b.a[0],9.75);near(b.z[0],9.75);}near(f.beams[0].a[1],.75);near(f.beams[1].z[1],19.25);
for(const b of f.beams.slice(3)){near(b.z[0],9.75);near(b.a[0],5);assert.ok(E.rectAllowed(f.ts,...Object.values(E.rect(b))));}
assert.equal(JSON.stringify(f.beams.map(b=>[b.id,b.rawA,b.rawZ])),JSON.stringify(before.map(b=>[b.id,b.rawA,b.rawZ])));
const once=JSON.stringify(f.beams);run(f);assert.equal(JSON.stringify(f.beams),once);
console.log('Column-to-transfer-beam main chain and SB endpoints follow together; opening-side wall faces, IDs and load references retained; repeat is stable');
const outside=fixture();for(const c of outside.columns)c.cx=30;run(outside);for(const b of outside.beams.slice(0,2))near(b.a[0],10);near(outside.beams[3].z[0],10);
const collision=fixture();collision.beams.push({...copy(collision.beams[0]),id:'manual',source:'manual',a:[9.75,1],z:[9.75,8],rawA:[9.75,1],rawZ:[9.75,8]});run(collision);for(const b of collision.beams.slice(0,2))near(b.a[0],10);near(collision.beams[3].z[0],10);
console.log('Invalid or colliding main chains remain in place, and SBs never follow rejected targets');
const disconnected=fixture();for(const c of disconnected.columns)c.cx=19.75;disconnected.beams[2].z[0]=18;disconnected.beams[2].rawZ[0]=18;run(disconnected);for(const b of disconnected.beams.slice(0,2))near(b.a[0],10);near(disconnected.beams[3].z[0],10);
console.log('A main chain cannot move beyond its receiving transfer beam even while inside the floor');
const manual=fixture();for(const b of manual.beams)b.source='manual';const unchanged=JSON.stringify(manual.beams);run(manual);assert.equal(JSON.stringify(manual.beams),unchanged);
const skew=fixture();skew.columns[1].cx=9.25;run(skew);for(const b of skew.beams.slice(0,2))near(b.a[0],10);
console.log('Manual beams and conflicting column centre lines are preserved');
