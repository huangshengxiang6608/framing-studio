const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),passed=[],errors=[];
(async()=>{
 for(const name of fs.readdirSync(path.join(root,'source')).filter(n=>n.endsWith('.js')))new vm.Script(fs.readFileSync(path.join(root,'source',name),'utf8'),{filename:name});
 passed.push('All application source scripts parse');
 const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1500,height:1000}});page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto('file:///'+path.join(root,'assets/index.html').replaceAll('\\','/'));
 await page.locator('#file').setInputFiles(path.join(__dirname,'fixture.framing.json'));
 const data=await page.evaluate(()=>{
  const {p,result}=StudioHost.get(),copy=()=>Engine.clone(p),run=q=>Loading.run(q,Engine.generate(q));
  const single=copy();single.transferTrusses[0].bottomFloor=2;single.transferTrusses[0].noHeadroom=false;single.transferTrusses[0].limits={total:100,live:100,differential:100};single.groups[2].h=4.2;const one=run(single);
  const local=copy();local.localHeights96=[{id:'H1',name:'Transfer zone',base:1,top:3,type:'F02',height:7,cells:[{x0:'A',x1:'B',y0:'1',y1:'2'}]}];Engine.validate(local);const loc=run(local);
  const invalid=copy();invalid.transferTrusses[0].topFloor='3';let rejectsTypedFloor=false;try{Engine.validate(invalid);}catch{rejectsTypedFloor=true;}
  const rcA=RCPlan.build(p,'A',['1|COL|1,3']),rcB=RCPlan.build(p,'B',['1|COL|1,3']);
  const trussJobs=ExcelSync.plan(p,'Truss',null).jobs,reportA=ExcelSync.plan(p,'Report','A').jobs,reportB=ExcelSync.plan(p,'Report','B').jobs;
  const deselect=copy();deselect.transferTrusses[0].reportA=false;const noA=ExcelSync.plan(deselect,'Report','A').jobs,yesB=ExcelSync.plan(deselect,'Report','B').jobs;
  const canvas=document.createElement('canvas');canvas.width=1500;canvas.height=1000;const ctx=canvas.getContext('2d'),m=Engine.floorModel(result,3);
  const plan=Drawing.plan(ctx,1500,1000,p,m,{floor:3,result,labels:true});const planPNG=canvas.toDataURL();
  const three=Drawing.three(ctx,1500,1000,p,result,{scope:'all',visible:{SLAB:false},labels:true});const threePNG=canvas.toDataURL();
  const elevation=Drawing.elevation(ctx,1500,1000,p,result,{cutY:3,labels:true});const elevationPNG=canvas.toDataURL();
  const svg=FramingSymbols98.svg(p,m,100,true,{}, {size:'A4',floor:3,grid:false});
  const lp=copy();lp.explorer.loadPath84={cuts:{one:{axis:'Y',at:3},two:{axis:'X',at:4}}};const loadpath=LoadPath84.diagram(lp,Engine.generate(lp),'vertical','one');
  const frames=ReportContent.framing(p,result),fake=ExplorerUI({get:()=>({p,result,floor:1,key:'F01'}),toast(){},floor(){}});fake.selectPlanMember({kind:'COL',id:'L',f:1});const columnHTML=fake.render('checks');
  const columnArea=ColumnLoads101.viewData(p,result,1);ColumnLoads101.clear();
  const native=copy();native.explorer.reportA={'1|COL|1,3':true};native.explorer.reportB={'1|COL|1,3':true};
  return {one:{status:one.trusses[0].status,fail:one.trusses[0].fail,depth:one.trusses[0].geometry.depth,bottom:one.rows.filter(r=>r.floor===2&&r.kind==='COL').map(r=>({id:r.id,g:r.loading.dead,q:r.loading.live,truss:r.truss109}))},local:{depth:loc.trusses[0].geometry.depth,status:loc.trusses[0].status},rejectsTypedFloor,rcA,rcB,
   jobs:{direct:trussJobs.filter(j=>j.type==='Truss').length,A:reportA.filter(j=>j.type==='Truss').length,B:reportB.filter(j=>j.type==='Truss').length,APages:reportA.filter(j=>j.type==='Truss').flatMap(j=>j.reportPages||[]).map(x=>x.title),noA:noA.filter(j=>j.type==='Truss').length,yesB:yesB.filter(j=>j.type==='Truss').length},
   planHits:plan.hits.map(h=>h.kind),threeHits:three.hits.map(h=>h.kind),elevationItems:elevation.views.flatMap(v=>v.items).map(h=>h.kind),svg,loadpathMembers:loadpath.members,framing:frames.map(f=>({title:f.title,tt:f.shapes.some(s=>String(s.text).includes('TT1'))})),columnHTML,columnArea,planPNG,threePNG,elevationPNG,native};
 });
 assert.equal(data.one.status,'OK',data.one.fail.join('; '));assert(Math.abs(data.one.depth-4.2)<1e-8);assert(data.one.bottom.every(c=>c.truss.includes('TT1')&&c.g>0));assert(Math.abs(data.local.depth-7)<1e-8);assert(data.rejectsTypedFloor);passed.push('One-storey transfer, actual floor height, local height and floor validation');
 assert.equal(data.jobs.direct,1);assert.equal(data.jobs.A,1);assert.equal(data.jobs.B,1);assert(data.jobs.APages.some(x=>x.includes('S460 transfer truss')));assert(data.jobs.APages.some(x=>x.includes('Governing members')));assert.equal(data.jobs.noA,0);assert.equal(data.jobs.yesB,1);passed.push('One TT export per object; Section A retains truss pages; independent A/B selection');
 for(const j of [data.rcA,data.rcB]){assert.equal(j.issues.length,0,JSON.stringify(j.issues));assert.equal(j.batches.length,1);}
 const ma=data.rcA.batches[0].members[0];assert(ma.truss109.dead>1000);assert.equal(ma.truss109.live,450);assert(ma.truss109.from.includes('TT1'));assert(data.rcB.batches[0].members[0].inputs);passed.push('Downstream column A/B jobs use physical reaction inputs');
 assert(!data.planHits.includes('TB'));assert(!data.threeHits.includes('TB'));assert(!data.elevationItems.includes('TB'));assert(data.svg.includes('TT1'));assert(!data.svg.includes('TB1'));assert(data.loadpathMembers.some(x=>x[0]==='TT'&&x[2]==='TT1'));assert(!data.loadpathMembers.some(x=>x[0]==='TB'));assert(data.framing.some(f=>f.tt));passed.push('Plan, 3D, elevation, SVG and report load path show TT and omit replaced TB');
 assert(data.columnHTML.includes('桁架反力 · 柱实际累计荷载'));assert(!data.columnHTML.includes('A / B 共用面积法'));assert.equal(data.columnArea,null);passed.push('Column UI shows physical G/Q without geometric area fallback');
 for(const name of ['plan','three','elevation']){fs.writeFileSync(path.join(__dirname,`truss-${name}.png`),Buffer.from(data[name+'PNG'].split(',')[1],'base64'));delete data[name+'PNG'];}
 fs.writeFileSync(path.join(__dirname,'truss-plan.svg'),data.svg);delete data.svg;delete data.columnHTML;
 const native=path.join(__dirname,'native-final');fs.mkdirSync(native,{recursive:true});fs.writeFileSync(path.join(native,'fixture.framing.json'),JSON.stringify(data.native,null,2));fs.writeFileSync(path.join(native,'truss-smoke.flag'),'1');delete data.native;
 for(const section of ['A','B']){const dir=path.join(__dirname,'rc-'+section);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'job.json'),JSON.stringify({...data['rc'+section].batches[0],preview:true,fingerprint:'truss-lower-column-final-'+section}));}
 await page.locator('[data-tab="truss"]').click();assert.equal(await page.locator('[data-tt="excel"]').count(),1);
 await page.locator('[data-tt="excel"]').click();assert.equal(await page.locator('#workspace-pages h1').innerText(),'Section A 抄');
 await page.evaluate(()=>ExcelSync.receive({record:{id:'tt-test',type:'Truss',label:'TT1 standalone check',ok:true,compared:451,differences:[],files:[]},done:true}));
 for(const section of ['A','B']){await page.locator('button[data-tab="report'+section+'"]').click();await page.locator('[data-report-workbooks]').waitFor();assert((await page.locator('[data-report-workbooks]').textContent()).includes('TT1 standalone check'));}
 passed.push('Single truss export opens Section A; standalone workbook results remain visible in A/B pages');
 assert.equal(errors.length,0,errors.join('\n'));fs.writeFileSync(path.join(__dirname,'integration-result.json'),JSON.stringify({ok:true,passed,errors,data},null,2));console.log(JSON.stringify({ok:true,passed,errors}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
