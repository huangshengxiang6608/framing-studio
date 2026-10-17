const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),{context}=require('./audit-performance247.cjs');
const dir=path.resolve(__dirname,'..'),ctx=vm.createContext({module:{exports:{}},require:n=>require(path.resolve(dir,n))});vm.runInContext(fs.readFileSync(dir+'/engine.js','utf8').replace('return {columnReferenceAxes289,','return {bayBoundary300,followedBays300,columnReferenceAxes289,'),ctx);const E=ctx.module.exports;
const copy=x=>JSON.parse(JSON.stringify(x));
for(const vertical of [false,true]){
 const xy=([x,y])=>vertical?[y,x]:[x,y],bay=q=>vertical?[q[2],q[3],q[0],q[1]]:q;
 const edge=(id,a,z,kind='MB')=>({id,kind,rawA:xy(a),rawZ:xy(z),a:xy(a),z:xy(z),b:.3});
 const old=[edge('TOP',[0,0],[10,0]),edge('RIGHT',[10,0],[10,10]),edge('BOT',[0,10],[10,10]),edge('W1',[0,0],[0,4],'WALL'),edge('W2',[0,4],[0,10],'WALL')];
 const now=old.map(e=>{const move=q=>q.map((v,i)=>i===(vertical?1:0)&&v===10?11:v);return {...e,a:move(e.a),z:move(e.z),rawA:move(e.rawA),rawZ:move(e.rawZ)};});
 const saved=[{...edge('S',[0,5],[10,5],'SB'),source:'auto',bay171:bay([0,10,0,10]),depthOverride184:550}],live=saved.map(s=>({...s,z:xy([11,5])})),bays=[bay([0,11,0,10])];
 let mapped=E.followedBays300(saved,old,now,bays,live);assert.equal(mapped.size,1);assert.equal(JSON.stringify(mapped.get(saved[0]).bay),JSON.stringify(bays[0]));
 const cached=copy(saved);cached[0].bay171=bays[0];cached[0].bayBoundary300=mapped.get(saved[0]).signature;assert.equal(E.followedBays300(cached,old,now,bays,live).size,1);
 assert.equal(E.followedBays300(saved,old,now,[...bays,...bays],live).size,0,'ambiguous current bays');
 assert.equal(E.followedBays300(saved,old,now.filter(e=>e.id!=='RIGHT'),bays,live).size,0,'missing boundary');
 assert.equal(E.followedBays300(saved,old,now,bays,live.map(s=>({...s,z:xy([9,5])}))).size,0,'disconnected SB');
 const split=[...now,edge('DIV',[0,4],[11,4])];assert.equal(E.followedBays300(saved,old,split,[bay([0,11,0,4]),bay([0,11,4,10])],live).size,0,'real subdivision');
 const gap=old.filter(e=>e.id!=='W1');assert.equal(E.bayBoundary300(saved[0].bay171,gap),null,'partial boundary');
}
console.log('PASS both orientations: same boundary identities (including segmented walls), cached metadata, ambiguity, missing sides, disconnected SB and real subdivision');
if(process.argv[2]){
 const p=JSON.parse(fs.readFileSync(process.argv[2],'utf8')),c=context(),result=c.run(`(()=>{const p=Engine.clone(argument),before=JSON.stringify(p),r=Engine.generate(p),m=Engine.floorModel(r,2,'F02'),sb=m.beams.filter(b=>b.kind==='SB');if(JSON.stringify(p)!==before)throw Error('Generation mutated inputs');if(sb.length!==50||m.beams.length!==83)throw Error('Member count changed');if(sb.some(b=>!b.bayBoundary300||!m.panels.some(q=>JSON.stringify(q)===JSON.stringify(b.bay171))))throw Error('Unresolved current bay');if(m.issues.some(i=>/bay 已改變/.test(i.msg)))throw Error('Stale warning retained');if(sb.some(b=>b.b!==.25||b.d!==.55))throw Error('SB dimensions changed');const input=JSON.stringify(p.explorer),widths=JSON.stringify(p.types.F02.beamWidths83),depths=JSON.stringify(p.types.F02.beamDepths201);const identity=JSON.stringify(m.beams.map(b=>[b.id,b.kind,b.rawA,b.rawZ,b.a,b.z,b.b,b.d]));Engine.freezeAutoBeams(p,'F02',m);if(p.types.F02.autoBeamSnapshot.secondary.some(b=>!b.bayBoundary300))throw Error('Freeze lost boundary identities');const reload=Engine.floorModel(Engine.generate(JSON.parse(JSON.stringify(p))),2,'F02');if(JSON.stringify(reload.beams.map(b=>[b.id,b.kind,b.rawA,b.rawZ,b.a,b.z,b.b,b.d]))!==identity)throw Error('Freeze/reload changed geometry');if(reload.issues.some(i=>/bay 已改變/.test(i.msg)))throw Error('Freeze/reload warning');if(input!==JSON.stringify(p.explorer)||widths!==JSON.stringify(p.types.F02.beamWidths83)||depths!==JSON.stringify(p.types.F02.beamDepths201))throw Error('Member inputs changed');return {beams:m.beams.length,secondary:sb.length,bays:m.panels.length,issues:m.issues,geometry:m.beams.map(b=>[b.id,b.kind,b.rawA,b.rawZ,b.a,b.z,b.b,b.d])};})()`,p);
 console.log('PASS current model: 14 bays, 50 SBs at 250x550, all 83 beams retained; input immutability, freeze and reload; actual boundary warnings retained');console.log(JSON.stringify(result,null,2));
}
