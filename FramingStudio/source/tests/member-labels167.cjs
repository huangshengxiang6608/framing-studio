const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{pathToFileURL}=require('url'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1450,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.resolve('FramingStudio/assets/index.html')).href);
 await page.evaluate(()=>{
 const p={format:'framing-app',version:1,name:'Member label regression',total:1,axes:{x:[{id:'1',gap:0},{id:'2',gap:6}],y:[{id:'A',gap:0},{id:'B',gap:4}]},defaults:{cb:500,cd:500,gap:3000,direction:'自动',mb:250,sb:250,tb:600,tbd:1200,slab:200,wall:300},groups:[{end:'顶层',h:3.5,type:'F01',sh:350,min:0}],types:{F01:{mode:'manual',autoBeams101:false,building:{'0,0':true},opening:{},columns:[[0,0],[6,0],[0,4],[6,4]].map(([x,y],i)=>({id:'C'+(i+1),x,y,b:500,d:500,on:true,status:'上下贯通'})),walls:[],beams:[[[0,0],[6,0]],[[0,4],[6,4]],[[0,0],[0,4]],[[6,0],[6,4]]].map(([a,z],i)=>({id:'MB'+(i+1),kind:'MB',a:{x:a[0],y:a[1]},z:{x:z[0],y:z[1]},b:250,d:500,on:true})),suppressed:[]}}};
 const h=StudioHost.get();Object.keys(h.p).forEach(k=>delete h.p[k]);Object.assign(h.p,p);if(!StudioHost.transact(()=>{}))throw Error('Fixture failed');
 const draw=Drawing.markSizes;Drawing.markSizes=(...args)=>{window.markSizeOutput167=draw(...args);return markSizeOutput167;};StudioHost.navigate('columns');});
 assert.equal(await page.locator('[data-mark-size167]').count(),7);const before=await page.evaluate(()=>JSON.stringify(StudioHost.get().p));
 for(const kind of ['COL','MB','SB','TB','CB','WALL','SLAB']){
  await page.locator('[data-mark-size167="'+kind+'"]').check();await page.waitForTimeout(70);
  const labels=await page.evaluate(()=>markSizeOutput167);assert(labels.every(x=>x.kind===kind));
  if(['COL','MB'].includes(kind))assert(labels.length>0,'Expected '+kind+' labels');
  await page.locator('[data-mark-size167="'+kind+'"]').uncheck();
 }
 await page.locator('[data-mark-size167="COL"]').check();await page.locator('[data-mark-size167="MB"]').check();await page.waitForTimeout(70);
 await page.screenshot({path:path.resolve('tmp/member-labels167.png')});
 assert.equal(await page.evaluate(()=>JSON.stringify(StudioHost.get().p)),before,'View toggles must not alter project/calculations');
 const checks=await page.evaluate(()=>{
  const calls=[],ctx={save(){},restore(){},translate(){},rotate(){},fillRect(){},strokeRect(){},measureText(s){return {width:s.length*6}},fillText(text,x,y){calls.push({text,y})}},beam=(id,kind,a,z)=>({id,kind,a,z,b:.3,d:.6});
  const m={columns:[{id:'C1',x:1,y:1,b:1.5,d:1}],beams:[beam('MB1','MB',[1,2],[5,2]),{...beam('MB2','TB',[6,1],[6,5]),displayId:'TB2'},beam('SB1','SB',[1,3],[5,3]),beam('CB1','CB',[1,4],[5,4])],walls:[{...beam('W1','WALL',[8,1],[8,5]),b:.25}],slabs:[{id:'SL-01',thickness:200,rects:[{x0:1,x1:5,y0:5,y1:7}]}]},on=Object.fromEntries(['COL','MB','SB','TB','CB','WALL','SLAB'].map(k=>[k,true])),plot={ox:20,oy:20,scale:50};
  const out=Drawing.markSizes(ctx,800,800,m,plot,on,on);if(out.length!==7)throw Error('Missing member type');for(let i=0;i<calls.length;i+=2)if(calls[i].y>=calls[i+1].y)throw Error('Mark must precede size vertically');
  if(out.find(x=>x.kind==='COL').size!=='1500 × 1000'||out.find(x=>x.kind==='TB').mark!=='TB2'||out.find(x=>x.kind==='MB').size!=='300 × 600'||out.find(x=>x.kind==='WALL').size!=='t 250'||out.find(x=>x.kind==='SLAB').size!=='200')throw Error('Wrong mark or units');
  if(out.find(x=>x.kind==='TB').angle!==-Math.PI/2)throw Error('Vertical beam rotation');if(Drawing.markSizes(ctx,800,800,m,plot,on,Object.fromEntries(Object.keys(on).map(k=>[k,false]))).length)throw Error('Hidden member labels');return out.map(x=>x.kind);
 });assert.equal(checks.length,7);await page.evaluate(()=>StudioHost.navigate('loading'));assert(!(await page.locator('#mark-size-controls167').isVisible()));assert.deepEqual(errors,[]);
 console.log('Seven independent switches; correct display marks and mm sizes; mark above size; vertical beam rotation; visibility filtering; view-only controls leave project unchanged; Loading controls hidden');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
