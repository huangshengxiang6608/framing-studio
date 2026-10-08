const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{pathToFileURL}=require('url'),{chromium}=require('playwright');
const {projects}=require('./column-load-centres186.cjs');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const page=await browser.newPage({viewport:{width:1311,height:884}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve(__dirname,'../../assets/index.html')).href);
 for(const p of projects){
  await page.locator('#file').setInputFiles({name:'centre.framing.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(p))});
  const value=await page.evaluate(()=>{
   const h=StudioHost.get(),m=Engine.floorModel(h.result,1),b=m.beams.find(b=>b.id==='TB1'),row=Loading.run(h.p,h.result,'B').rows.find(r=>r.floor===1&&r.member.id===b.id);
   BeamLoadUI.clear();document.querySelector('#side').innerHTML=BeamLoadUI.render({...h,floor:1,data:row.input,selected:{token:row.token,member:b}},row);
   return row.actions.right;
  });
  await page.waitForFunction(()=>document.querySelector('.bl-plot')?.textContent.includes('4.00 m'));
  const txt=await page.locator('.bl-plot').textContent();assert(!txt.includes('4.75 m')&&!txt.includes('4.25 m'));
  assert.equal(Number(await page.locator('.bl-reaction180[data-end="B"]').getAttribute('data-value')),value);
 }
 await page.evaluate(()=>{
  BeamLoadUI.clear();const base=StudioHost.get(),selected=Loading.members(base.p,base.result,2).find(x=>x.kind==='COL'),h={...base,floor:2,key:'F2',selected,data:Loading.input(base.p,2,selected.token)};
  const host={refresh(){document.querySelector('#side').innerHTML=ColumnPanel123.render(h,host);}};host.refresh();
 });
 await page.waitForFunction(()=>document.querySelector('.cp-current strong')?.textContent==='200.00');
 const txt=await page.locator('.column-panel123').textContent();
 assert(txt.includes('恒载 DL · kN')&&txt.includes('活载 LL · kN'));assert(txt.includes('1.4DL + 1.6LL'));
 assert(!/\b[ GQ]\s*\/\s*[GQ]\b|\bG\b|\bQ\b/.test(txt));
 assert.deepEqual(await page.locator('.cp-current strong').allTextContents(),['200.00','40.00']);
 const boxes=await page.locator('.cp-plot').evaluate(svg=>[...svg.querySelectorAll('text')].map(e=>{const b=e.getBBox();return {x:b.x,right:b.x+b.width,w:svg.viewBox.baseVal.width};}));
 assert(boxes.every(b=>b.x>=0&&b.right<=b.w),'DL/LL labels fit SVG');
 if(process.env.UI_SCREENSHOT)await page.locator('.column-panel123').screenshot({path:process.env.UI_SCREENSHOT});
 const demo=path.resolve(__dirname,'../../示例模型/RC_同层2m_StructuralZone_Demo'),file=fs.readdirSync(demo).find(n=>n.endsWith('.framing.json'));
 await page.evaluate(p=>{ColumnPanel123.clear();Engine.validate(p);document.querySelector('#side').innerHTML=TrussUI109.render(p,Engine.generate(p));},JSON.parse(fs.readFileSync(path.join(demo,file),'utf8')));
 const cases=page.locator('[data-tt-case]');assert.equal(await cases.locator('option[value="G"]').textContent(),'DL · 全部恒载');
 assert.equal(await cases.locator('option[value="Q"]').textContent(),'LL · 全部活载');
 assert.equal(await cases.locator('option[value="ULS"]').textContent(),'1.4DL + 1.6LL · 全加载 ULS');
 assert.deepEqual(errors,[]);console.log('PASS: both offsets render 4.00 m, reaction agrees with solver; column DL/LL labels and unchanged area loads render without clipping');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
