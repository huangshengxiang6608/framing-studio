const assert=require('assert'),fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const B=require('../checks.js');
const base={id:'C1',b:1000,h:1000,height:4.5,factor:1,fcu:60,ratio:2.5,projectFactor:1.25,dead:0,live:0,system:'Braced'};
const result=(N,extra={})=>B.column({...base,dead:N/1.4/1.25,...extra});
const passed=[];
let r=result(54883),before=JSON.stringify(r),a=B.columnAdvice(r);
assert.deepEqual([a.recommendation.b,a.recommendation.h],[1500,1500]);assert(a.recommendation.providedRatio<3);assert.equal(JSON.stringify(r),before);assert(r.fail.includes('NO BAR OPTION'));assert(!a.reasons.join().includes('NO BAR OPTION'));passed.push('AC10 demand recommends 1500 x 1500 near 2.5% without changing raw checks');
assert.equal(B.columnAdvice(result(70000)).recommendation.b,2000);passed.push('Continues beyond 1500 when target capacity is insufficient');
assert.equal(B.columnAdvice(result(60000,{ratio:1})).recommendation.b,2000);assert.equal(B.columnAdvice(result(60000)).recommendation.b,1500);passed.push('Uses configured Member Check target rather than maximizing 4%');
a=B.columnAdvice(result(60000,{b:1000,h:1500}));assert.deepEqual([a.recommendation.b,a.recommendation.h],[1500,2000]);passed.push('Rectangular columns retain orientation and 500 mm increments');
assert(!B.columnAdvice(result(20000)).recommendation);assert(!B.columnAdvice(result(50000,{ratio:4.1})).recommendation);assert(!B.columnAdvice(result(50000,{system:'Unbraced'})).recommendation);assert.deepEqual(B.columnAdvice({status:'INPUT REQUIRED',fail:['missing load']}).reasons,['missing load']);passed.push('Passing, missing-input, invalid-ratio and unbraced cases do not receive misleading advice');
a=B.columnAdvice(result(20000,{steel:{C5:40,C32:40}}));assert(a.recommendation.providedRatio<=4);passed.push('Manual over-limit reinforcement can receive an automatic redesign suggestion');
(async()=>{const {chromium}=require('playwright');const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
const page=await browser.newPage({viewport:{width:1201,height:884}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.goto(pathToFileURL(path.resolve('FramingStudio/assets/index.html')).href);await page.waitForFunction(()=>window.StudioHost);
await page.evaluate(()=>{
const p={format:'framing-app',version:1,name:'Column advice test',total:1,axes:{x:[{id:'1',gap:0},{id:'2',gap:6}],y:[{id:'A',gap:0},{id:'B',gap:4}]},defaults:{cb:500,cd:500,gap:3000,direction:'自动',mb:250,sb:250,tb:600,tbd:1200,slab:200,wall:300},groups:[{end:'顶层',h:3.5,type:'F01',sh:350,min:0,headroom:2.5,em:.5}],types:{F01:{mode:'manual',autoBeams101:false,building:{'0,0':true},opening:{},columns:[[0,0],[6,0],[0,4],[6,4]].map(([x,y],i)=>({id:'C'+(i+1),x,y,b:250,d:250,on:true,status:"上下贯通"})),walls:[],beams:[],suppressed:[],beamDepth:350}}};
LoadData.setFloor(p,1,{usage:'Office',dl:3000,sdl:0,ll:2});Loading.init(p);const h=StudioHost.get();Object.keys(h.p).forEach(k=>delete h.p[k]);Object.assign(h.p,p);if(!StudioHost.transact(()=>{}))throw Error('Fixture transaction failed');StudioHost.navigate('beams');window.adviceSnapshot=JSON.stringify(StudioHost.get().p);
});
await page.locator('details.summary-issues131 > summary').click();await page.locator('[data-ex="audit-run131"]').click();await page.waitForFunction(()=>document.querySelector('[data-audit-progress132]')?.textContent==='检查完成',{timeout:60000});
const content=await page.locator('.summary-issues131').innerText();assert(content.includes('建議柱尺寸'));assert(content.includes('目標鋼筋率 2.5%'));assert(!content.includes('NO BAR OPTION'));assert(!content.includes('STEEL / MATERIAL REVIEW'));assert(await page.evaluate(()=>JSON.stringify(StudioHost.get().p)===adviceSnapshot));assert.deepEqual(errors,[]);passed.push('Real Summary Check shows size advice, preserves project and has no browser errors');
fs.mkdirSync('tmp/column-size-advice',{recursive:true});await page.screenshot({path:'tmp/column-size-advice/summary.png'});fs.writeFileSync('tmp/column-size-advice/results.json',JSON.stringify({passed},null,2));console.log(passed.join('\n'));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
