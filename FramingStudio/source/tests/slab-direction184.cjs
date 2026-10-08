const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs');
const c=context(path.resolve(__dirname,'../..')),seed=fs.readFileSync(path.join(__dirname,'slab-bay178.cjs'),'utf8').split('const result=c.run(`')[1].split(' let r=')[0];
const p=c.run(seed.replaceAll('13.75','16.5')+'return p;})()');
const result=c.run(`(()=>{const p=argument,r=Engine.generate(p),m=Engine.floorModel(r,1),items=m.slabs.map(s=>({id:s.id,net:[s.x1-s.x0,s.y1-s.y0],centre:['X','Y'].map(d=>Loading.slabSpan(s,d,m).effective),direction:Loading.slabDirection(p,1,Loading.token('SLAB',s),s,m)}));const s=m.slabs[1],t=Loading.token('SLAB',s);s.direction116='X';const framing=Loading.slabDirection(p,1,t,s,m);delete s.direction116;Loading.init(p).members['1|'+t]={direction:'X'};return {items,framing,manual:Loading.slabDirection(p,1,t,s,m)};})()`,p);
assert(result.items.length===5);assert(result.items.some(s=>s.net[0]<s.net[1]));assert(result.items.some(s=>s.net[0]>s.net[1]));for(const s of result.items){assert.equal(JSON.stringify(s.centre),'[4,3]');assert.equal(s.direction,'Y');}assert.equal(result.framing,'X');assert.equal(result.manual,'X');console.log('PASS: equal 4 x 3 m centre panels choose Y despite different net dimensions; framing and member manual X preserved');


c.run(`(()=>{  const passed=[],ok=(v,msg)=>{if(!v)throw Error(msg)},slab=(id,x0,x1,y0,y1,way)=>({id,x0,x1,y0,y1,rects:[{x0,x1,y0,y1}],netBoundary120:true,direction116:way}),p0={},square=slab('square',1,4,4,7),top=slab('top',1,4,1,3),other=slab('other',6,9,1,4,'X'),m={panels:[[0,5,0,12],[5,10,0,12]],slabs:[square,top,other]},dir=(s,model=m)=>Loading.slabDirection(p0,1,Loading.token('SLAB',s),s,model);
  ok(dir(square)==='Y','Same bay short-span sibling supplies Y, adjacent bay X excluded');
  ok(dir(square,{...m,slabs:[square,other]})===null,'No evidence remains pending');
  const unknown=slab('unknown',1,4,8,11);ok(dir(square,{...m,slabs:[square,unknown]})===null,'Unknown peers cannot infer each other');
  const conflict=slab('conflict',1,4,8,11,'X');ok(dir(square,{...m,slabs:[square,top,conflict]})===null,'Conflicting same-bay directions remain pending');
  square.direction116='X';ok(dir(square)==='X','Explicit direction preserved');delete square.direction116;
  ok(dir(square,{...m,panels:[]})===null,'No enclosing primary bay stays pending');
  ok(dir(square,{...m,slabs:[...m.slabs].reverse()})==='Y','Order-independent inference');
  p0.explorer={members:{['1|'+Loading.token('SLAB',square)]:{slabType:'CS'}}};ok(dir(square)===null,'CS missing fixed edge not inferred');p0.explorer={};
  passed.push('Same-bay isolation; no evidence; equal peers; conflicts; explicit override; CS; order independence');
return passed;})()`);
