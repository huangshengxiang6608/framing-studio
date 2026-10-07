const fs=require('fs'),path=require('path'),assert=require('assert'),{pathToFileURL}=require('url'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('FramingStudio/assets/index.html')).href);await page.waitForFunction(()=>window.StudioHost);
 await page.addScriptTag({content:fs.readFileSync('tmp/slab-bay161/loading.js','utf8').replace('const Loading=','window.LegacyLoading161=')});
 const result=await page.evaluate(()=>{
  const passed=[],ok=(v,msg)=>{if(!v)throw Error(msg)},slab=(id,x0,x1,y0,y1,way)=>({id,x0,x1,y0,y1,rects:[{x0,x1,y0,y1}],netBoundary120:true,direction116:way}),p0={},square=slab('square',1,4,4,7),top=slab('top',1,4,1,3),other=slab('other',6,9,1,4,'X'),m={panels:[[0,5,0,12],[5,10,0,12]],slabs:[square,top,other]},dir=(s,model=m)=>Loading.slabDirection(p0,1,Loading.token('SLAB',s),s,model);
  ok(dir(square)==='Y','Same bay short-span sibling supplies Y, adjacent bay X excluded');
  ok(dir(square,{...m,slabs:[square,other]})===null,'No evidence remains pending');
  const unknown=slab('unknown',1,4,8,11);ok(dir(square,{...m,slabs:[square,unknown]})===null,'Unknown peers cannot infer each other');
  const conflict=slab('conflict',1,4,8,11,'X');ok(dir(square,{...m,slabs:[square,top,conflict]})===null,'Conflicting same-bay directions remain pending');
  square.direction116='X';ok(dir(square)==='X','Explicit direction preserved');delete square.direction116;
  ok(dir(square,{...m,panels:[]})===null,'No enclosing primary bay stays pending');
  ok(dir(square,{...m,slabs:[...m.slabs].reverse()})==='Y','Order-independent inference');
  p0.explorer={members:{['1|'+Loading.token('SLAB',square)]:{slabType:'CS'}}};ok(dir(square)===null,'CS missing fixed edge not inferred');p0.explorer={};
  passed.push('Same-bay isolation; no evidence; equal peers; conflicts; explicit override; CS; order independence');
  const pt=(x,y)=>({x,y}),beam=(id,kind,a,z)=>({id,kind,a:pt(...a),z:pt(...z),b:500,d:500,on:true}),col=(id,x,y)=>({id,x,y,b:500,d:500,on:true,status:'上下贯通'});
  const p={format:'framing-app',version:1,name:'Bay direction regression',total:1,axes:{x:[{id:'1',gap:0},{id:'2',gap:4}],y:[{id:'A',gap:0},{id:'B',gap:13}]},defaults:{cb:500,cd:500,gap:3000,direction:'自动',mb:500,sb:500,tb:600,tbd:1200,slab:200,wall:300},groups:[{end:'顶层',h:3.5,type:'F1',sh:500,min:0,headroom:2.5,em:.5}],types:{F1:{mode:'manual',autoBeams101:false,building:{'0,0':true},opening:{},columns:[col('C1',0,0),col('C2',4,0),col('C3',0,13),col('C4',4,13)],walls:[],beams:[beam('MB1','MB',[0,0],[4,0]),beam('MB2','MB',[0,13],[4,13]),beam('MB3','MB',[0,0],[0,13]),beam('MB4','MB',[4,0],[4,13]),...[3,6.5,10].map((y,i)=>beam('SB'+(i+1),'SB',[0,y],[4,y]))],suppressed:[],beamDepth:500}}};
  LoadData.setFloor(p,1,{usage:'Office',dl:10,sdl:0,ll:3});const r=Engine.generate(p),model=Engine.floorModel(r,1),sq=model.slabs.filter(s=>Math.abs(s.x1-s.x0-s.y1+s.y0)<1e-6);ok(sq.length===2,'Two square slabs generated: '+JSON.stringify(model.slabs.map(s=>[s.x1-s.x0,s.y1-s.y0])));
  const old=sq.map(s=>LegacyLoading161.slabDirection(p,1,Loading.token('SLAB',s),s,model));ok(old.every(d=>d===null),'Reproduces prior pending square slabs');
  const geometry=JSON.stringify(r),out=Loading.run(p,r,'B'),slabs=out.rows.filter(s=>s.kind==='SLAB');ok(slabs.every(s=>s.loading.direction==='Y'),'All bay slabs inherit Y');ok(slabs.every(s=>!s.transferErrors?.length),'Slab transfer completed: '+JSON.stringify(slabs.map(s=>s.transferErrors)));
  ok(out.rows.filter(s=>['MB','SB'].includes(s.kind)).every(s=>s.actions),'Receiving beams now have actions');ok(JSON.stringify(r)===geometry,'Direction inference does not alter geometry');
  const canvas=document.createElement('canvas');canvas.width=700;canvas.height=800;const ctx=canvas.getContext('2d'),plot=Drawing.plan(ctx,700,800,p,model,{floor:1,visible:{COL:true,MB:true,SB:true},zoom:1});const arrows=BeamLayout116.drawDirections(p,model,1,ctx,plot);ok(arrows.length===4&&arrows.every(a=>a.dir==='Y'),'Drawing arrows agree with solver');
  const reference=Engine.clone(p);BeamLayout116.setDirections(reference,'F1',sq,'Y');const explicit=Loading.run(reference,Engine.generate(reference),'B');for(const row of out.rows){const match=explicit.rows.find(s=>s.token===row.token);if(row.actions)ok(JSON.stringify(row.actions)===JSON.stringify(match.actions),'Inherited and explicit Y actions match '+row.id);}
  passed.push('Generated bay: 2 formerly unresolved square slabs follow end panels Y; four arrows match; slab transfer and beam actions match explicit Y; geometry unchanged');
  return {passed,project:p,image:canvas.toDataURL(),slabs:slabs.map(s=>({id:s.id,direction:s.loading.direction,errors:s.transferErrors}))};
 });fs.writeFileSync('tmp/slab-bay161/verified.png',Buffer.from(result.image.split(',')[1],'base64'));delete result.image;fs.writeFileSync('tmp/slab-bay161/results.json',JSON.stringify(result,null,2));assert.deepEqual(errors,[]);console.log(result.passed.join('\n'));
 }finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
