const fs=require('fs'),path=require('path'),assert=require('assert'),{pathToFileURL}=require('url'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.goto(pathToFileURL(path.resolve('FramingStudio/assets/index.html')).href);await page.waitForFunction(()=>window.StudioHost);await page.addScriptTag({content:fs.readFileSync('FramingStudio/source/tests/loading115-browser.js','utf8')});
const result=await page.evaluate(()=>{
 const equal=(a,b,label)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw Error(label+': '+JSON.stringify(a)+' != '+JSON.stringify(b));};
 const fixture=()=>{const p=Engine.clone(loading115Tests().projects.slab);p.total=3;const base=Engine.clone(p.types.F1);for(let f=1;f<=3;f++)p.types['F'+f]={...Engine.clone(base),mode:'manual',columns:[],walls:[],beams:[],autoBeams101:false,columnAxisPositions:[],columnPlacements:[]};p.groups=[1,2,3].map(f=>({...p.groups[0],end:f,type:'F'+f}));return p;};
 const get=(p,f,id)=>Engine.floorModel(Engine.generate(p),f).columns.find(c=>c.id===id);
 const copy=(p,f,id,step)=>FloorColumns101.copyAdjacent(p,Engine.generate(p),'F'+f,f,{kind:'COL',id,f},step);
 const snap=(p,f,c)=>({rect:Engine.columnRect(c),ref:Engine.columnReference(p,'F'+f,c),position:c.axisPosition||''});
 // Corner auto-placement uses (6,0) as reference, not its inset physical centre.
 const p=fixture();p.types.F1.mode='auto';let c=Engine.model(p,'F1').columns.find(c=>c.anchorX==='2'&&c.anchorY==='A');const id=c.id,original=snap(p,1,c);equal(original.ref,[6,0],'auto corner reference');
 let up=copy(p,1,id,1);equal(snap(p,2,get(p,2,up.id)),original,'auto copy retains exact centre AND reference');
 Engine.setColumnPosition(p,'F2','id:'+up.id,'down-left');equal(Engine.columnRect(get(p,2,up.id)),{x:6-c.b/2,y:c.d/2,w:c.b,d:c.d},'direction after copy offsets once');
 const selected=snap(p,2,get(p,2,up.id));let next=copy(p,2,up.id,1);equal(snap(p,3,get(p,3,next.id)),selected,'second copy retains direction and reference');
 const reopened=JSON.parse(JSON.stringify(p));Engine.validate(reopened);equal(snap(reopened,3,get(reopened,3,next.id)),selected,'save/reopen retains reference');
 // Converting untouched and explicitly positioned auto columns to manual preserves both geometry and reference.
 for(const explicit of [false,true]){const q=fixture();q.types.F1.mode='auto';if(explicit)Engine.setColumnPosition(q,'F1','axis:2|A','down-left');const before=Engine.model(q,'F1').columns.map(c=>({id:c.id,...snap(q,1,c)}));FloorColumns101.mode(q,'F1',1,'manual');equal(Engine.model(q,'F1').columns.map(c=>({id:c.id,...snap(q,1,c)})),before,'auto/manual snapshot');const a=Engine.model(q,'F1').columns.find(c=>c.id===id);Engine.setColumnPosition(q,'F1','id:'+id,'down-left');equal(Engine.columnRect(Engine.model(q,'F1').columns.find(c=>c.id===id)),{x:6-a.b/2,y:a.d/2,w:a.b,d:a.d},'manual corner no doubled offset');}
 // All nine directions, copied down and then up to an automatic target with different axes.
 for(const position of Object.keys(Engine.columnDirections)){const q=fixture();q.types.F2.columns=[{id:'SOURCE',x:3,y:2,b:600,d:800,status:'上下贯通',on:true}];Engine.setColumnPosition(q,'F2','id:SOURCE',position);const before=snap(q,2,get(q,2,'SOURCE'));const down=copy(q,2,'SOURCE',-1);equal(snap(q,1,get(q,1,down.id)),before,'down '+position);q.types.F3.mode='auto';q.types.F3.axes={x:[{id:'a',gap:0},{id:'b',gap:8}],y:[{id:'a',gap:0},{id:'b',gap:6}]};const up=copy(q,2,'SOURCE',1);equal(snap(q,3,get(q,3,up.id)),before,'auto target '+position);for(const dir of Object.keys(Engine.columnDirections)){Engine.setColumnPosition(q,'F1','id:'+down.id,dir);Engine.setColumnPosition(q,'F2','id:SOURCE',dir);equal(snap(q,1,get(q,1,down.id)),snap(q,2,get(q,2,'SOURCE')),'reselect '+position+' / '+dir);}}
 return 'PASS: corner reference and exact centre, repeated up/down copy, all 9 directions, changed target axes, auto/manual conversion and JSON reopen';
});assert.deepEqual(errors,[]);console.log(result);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
