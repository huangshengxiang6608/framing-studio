const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{pathToFileURL}=require('url'),{chromium}=require('playwright');
(async()=>{
 const input=process.argv[2];assert(input,'Provide a project copy/path for read-only browser verification');
 const bytes=fs.readFileSync(input),p=JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,'')),out='tmp/column-wall-area-local';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const page=await browser.newPage({viewport:{width:1650,height:1050}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  const load=async file=>{await page.goto(pathToFileURL(path.resolve(file)).href);await page.waitForFunction(()=>window.StudioHost);};
  let baseline=null;
  if(fs.existsSync(path.join(out,'index.before.html'))){
   await load(path.join(out,'index.before.html'));
   baseline=await page.evaluate(p=>{const r=Engine.generate(p),m=Engine.floorModel(r,1);return {area:ColumnAreas103.footprint(p,m,m.columns.find(x=>x.id==='AC6')).area,wall:ColumnAreas103.wallShapes(p,m).reduce((s,x)=>s+x.area,0)};},p);
   assert.equal(baseline.area,0);assert.equal(baseline.wall,1748);
  }
  await load('FramingStudio/assets/index.html');assert((await page.title()).includes(JSON.parse(fs.readFileSync('FramingStudio/version.json','utf8')).version));
  await page.locator('#file').setInputFiles({name:'2019.framing.json',mimeType:'application/json',buffer:bytes});await page.waitForFunction(()=>StudioHost.get().p.name==='2019');
  await page.evaluate(()=>{const draw=Drawing.plan;Drawing.plan=(...args)=>window.allocationPlot=draw(...args);StudioHost.navigate('beams');});
  const original=await page.evaluate(()=>JSON.stringify(StudioHost.get().p));const selected=[];
  for(const id of ['AC6','AC16']){
   await page.evaluate(id=>StudioHost.focusMember287({kind:'COL',id,f:1}),id);
   await page.waitForFunction(id=>ColumnLoads101.viewData(StudioHost.get().p,StudioHost.get().result,1)?.id===id,id);
   const data=await page.evaluate(()=>{const h=StudioHost.get();return ColumnLoads101.viewData(h.p,h.result,1);});
   assert.equal(data.area,id==='AC6'?46.125:63.421875);assert.equal(data.errors.length,0);assert(data.rects.length>0);
   await page.locator('#canvas').screenshot({path:path.join(out,id+'-area.png')});selected.push({id,area:data.area});
  }
  assert.equal(await page.evaluate(()=>JSON.stringify(StudioHost.get().p)),original,'Selecting area must not change saved inputs');
  // Exercise the actual canvas badge, including its compact form; invalid
  // allocations must be visibly pending even if the numeric candidate is 0.
  const badge=await page.evaluate(()=>{const ctx=document.createElement('canvas').getContext('2d'),text=[];ctx.canvas.width=800;ctx.canvas.height=500;const draw=ctx.fillText.bind(ctx);ctx.fillText=(s,...args)=>{text.push(s);return draw(s,...args);};const data={id:'C',floor:1,targetFloor:1,floorName:'G/F',targetName:'G/F',area:0,rects:[],polygons:[],auto:true,compact:true,errors:['本层所有柱受荷面积为零，墙柱分界待核对']};ColumnLoads101.badge(ctx,{hits:[],ox:0,oy:0,scale:1},800,500,data);return {text,caption:ColumnLoads101.issueCaption(data)};});
  assert(badge.text.includes('受荷面积待确认'));assert(!badge.text.some(s=>/受荷面积 0/.test(s)));assert(badge.caption.includes('面积分配待确认'));
  assert.deepEqual(errors,[]);assert(fs.readFileSync(input).equals(bytes));
  fs.writeFileSync(path.join(out,'ui-results.json'),JSON.stringify({baseline,selected,pendingBadge:badge,errors,originalFileUnchanged:true},null,2));
  console.log('PASS '+(baseline?'old 0 / 1748 bug reproduced; ':'')+'new AC6 / AC16 highlights and areas; compact pending badge; browser has no script errors and project inputs unchanged');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
