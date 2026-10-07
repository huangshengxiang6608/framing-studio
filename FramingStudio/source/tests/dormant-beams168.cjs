const path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('FramingStudio/assets/index.html')).href);
 const result=await page.evaluate(()=>{
 const p={format:'framing-app',version:1,name:'Member label regression',total:1,axes:{x:[{id:'1',gap:0},{id:'2',gap:6}],y:[{id:'A',gap:0},{id:'B',gap:4}]},defaults:{cb:500,cd:500,gap:3000,direction:'自动',mb:250,sb:250,tb:600,tbd:1200,slab:200,wall:300},groups:[{end:'顶层',h:3.5,type:'F01',sh:350,min:0}],types:{F01:{mode:'manual',autoBeams101:false,building:{'0,0':true},opening:{},columns:[[0,0],[6,0],[0,4],[6,4]].map(([x,y],i)=>({id:'C'+(i+1),x,y,b:500,d:500,on:true,status:'上下贯通'})),walls:[],beams:[[[0,0],[6,0]],[[0,4],[6,4]],[[0,0],[0,4]],[[6,0],[6,4]]].map(([a,z],i)=>({id:'MB'+(i+1),kind:'MB',a:{x:a[0],y:a[1]},z:{x:z[0],y:z[1]},b:250,d:500,on:true})),suppressed:[]}}};
 const t=p.types.F01,ok=(v,msg)=>{if(!v)throw Error(msg)},snapshot=(id,kind,a,z)=>({id,kind,a,z,rawA:[...a],rawZ:[...z],b:.25,d:.35,source:'auto'});
 t.autoBeamSnapshot={main:[],secondary:[]};
 const baseline=Engine.generate(p),base=JSON.stringify(Engine.floorModel(baseline,1).beams);
 t.autoBeamSnapshot.main=[snapshot('OLD_MB','MB',[7,1],[9,1])];
 t.autoBeamSnapshot.secondary=[snapshot('OLD_SB','SB',[7,2],[9,2]),{...snapshot('OLD_DUP','SB',[.25,.125],[5.75,.125]),rawA:[.25,.13],rawZ:[5.75,.13]}];
 const records=JSON.stringify(t.autoBeamSnapshot),r=Engine.generate(p),m=Engine.floorModel(r,1);
 ok(JSON.stringify(m.beams)===base,'Dormant snapshots must not change generated members');
 ok(JSON.stringify(t.autoBeamSnapshot)===records,'Stored snapshots remain available');
 ok(!r.issues.some(i=>i.id.startsWith('OLD_')),'Dormant snapshots should not report model warnings');
 t.beams.push({id:'MANUAL_INVALID',kind:'MB',a:{x:8,y:0},z:{x:9,y:1},b:250,d:500,on:true});
 const invalid=Engine.generate(p);ok(invalid.issues.some(i=>i.id==='MANUAL_INVALID'),'Explicit manual geometry errors stay visible');
 const audit=Loading.audit(p,invalid);ok(!audit.items.some(i=>i.id.startsWith('OLD_')),'No dormant beam rows in Summary Check');
 ok(audit.items.some(i=>i.id==='MANUAL_INVALID'&&i.status==='MODEL'),'Manual model warning remains in Summary Check');
 ok(audit.items.some(i=>i.id==='MB1'&&i.path==='Check'),'Existing beam Check failures remain visible');
 return {members:m.beams.length,manualIssue:true,existingBeamCheck:true,snapshotRecordsRetained:true};
 });assert.deepEqual(errors,[]);console.log(JSON.stringify(result));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
