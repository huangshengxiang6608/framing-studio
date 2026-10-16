const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/excel/capabilities',r=>r.fulfill({json:{available:false}}));
  await page.goto(process.env.STUDIO_TEST_URL||'http://127.0.0.1:8783/');await page.waitForFunction(()=>window.StudioHost&&window.PDFLib);
  await page.evaluate(async()=>{
   const status=()=>({busy:false,progress:'',records:[],issues:[],stale:false,generatedAt:'2026-10-16T10:00:00Z'});
   window.scrollTest296={global:{...status(),busy:true,progress:'Background B 0'},A:status(),B:{...status(),busy:true}};
   ExcelSync.available=()=>true;ExcelSync.state=()=>scrollTest296.global;ExcelSync.reportState=s=>scrollTest296[s];
   const doc=await PDFLib.PDFDocument.create();for(let i=1;i<=16;i++)doc.addPage([595,842]).drawText('Report page '+i,{x:50,y:770,size:18});
   scrollTest296.bytes=await doc.save();StudioHost.navigate('reportA');await WorkspacePages.setPDF('A',scrollTest296.bytes);
  });
  await page.waitForFunction(()=>document.querySelectorAll('#workspace-pages [data-page]').length===16&&document.querySelector('[data-page="1"]').dataset.rendered==='true');
  await page.evaluate(()=>{
   const s=scrollTest296;s.root=document.getElementById('workspace-pages');s.box=s.root.querySelector('[data-pdf]');s.first=s.box.firstElementChild;s.height=s.root.scrollHeight;s.counter=0;
   s.timer=setInterval(()=>{s.global.progress='Background B '+ ++s.counter;WorkspacePages.refresh();},60);
  });
  const r=await page.locator('#workspace-pages').boundingBox();await page.mouse.move(r.x+r.width*.65,r.y+r.height*.6);
  let last=0;for(let i=0;i<14;i++){
   await page.mouse.wheel(0,430);await page.waitForTimeout(130);
   const v=await page.evaluate(()=>{const s=scrollTest296;return {top:s.root.scrollTop,height:s.root.scrollHeight,same:s.box===s.root.querySelector('[data-pdf]')&&s.first===s.box.firstElementChild,count:s.counter};});
   assert(v.top>last+100,`Continued downward scroll must not jump back: ${last} -> ${v.top}`);assert(v.same,'PDF and canvas stay attached');assert(Math.abs(v.height-await page.evaluate(()=>scrollTest296.height))<=16,'PDF height remains stable as page aspect ratios resolve');last=v.top;
  }
  await page.evaluate(()=>clearInterval(scrollTest296.timer));
  assert.match(await page.locator('[data-report-workbooks]').textContent(),/Background B/);
  await page.evaluate(()=>{const s=scrollTest296;s.root.querySelector('[data-report-workbooks]').open=true;s.anchor=s.box.getBoundingClientRect().top;s.global.progress='Long status '.repeat(180);WorkspacePages.refresh();});
  const anchored=await page.evaluate(()=>({delta:scrollTest296.box.getBoundingClientRect().top-scrollTest296.anchor,open:document.querySelector('[data-report-workbooks]').open}));
  assert(Math.abs(anchored.delta)<=1,'Wrapped progress retains the same PDF position');assert(anchored.open,'Workbook disclosure choice retained');
  await page.evaluate(()=>{const s=scrollTest296;s.anchor=s.box.getBoundingClientRect().top;s.global.busy=false;s.global.progress='';s.A.stale=true;WorkspacePages.refresh();});
  assert(Math.abs(await page.evaluate(()=>scrollTest296.box.getBoundingClientRect().top-scrollTest296.anchor))<=1,'Completion/stale notice retains PDF position');
  assert(await page.locator('[data-wp="print"]').isDisabled(),'Stale PDF remains blocked for printing');
  await page.evaluate(async()=>{scrollTest296.B.busy=false;await WorkspacePages.setPDF('B',scrollTest296.bytes);StudioHost.navigate('reportB');});
  await page.waitForFunction(()=>document.querySelectorAll('#workspace-pages [data-page]').length===16&&document.querySelector('[data-page="1"]').dataset.rendered==='true');
  assert.equal(await page.locator('#workspace-pages').evaluate(e=>e.scrollTop),0,'Switching report starts its own PDF');
  await page.evaluate(()=>{const s=scrollTest296;s.box=s.root.querySelector('[data-pdf]');s.root.scrollTop=2600;s.top=s.root.scrollTop;s.global.busy=true;s.B.busy=true;s.B.progress='Section B running';WorkspacePages.refresh();});
  assert(await page.evaluate(()=>scrollTest296.box===scrollTest296.root.querySelector('[data-pdf]')&&scrollTest296.root.scrollTop>=scrollTest296.top-1),'Section B progress preserves its PDF');
  await page.evaluate(async()=>{const doc=await PDFLib.PDFDocument.create();doc.addPage([595,842]).drawText('Replacement PDF',{x:50,y:770});await WorkspacePages.setPDF('B',await doc.save());});
  await page.waitForFunction(()=>document.querySelectorAll('#workspace-pages [data-page]').length===1&&document.querySelector('[data-page="1"]').dataset.rendered==='true');
  assert(await page.evaluate(()=>scrollTest296.box!==scrollTest296.root.querySelector('[data-pdf]')),'New PDF replaces old document');
  assert.equal(await page.locator('#workspace-pages').evaluate(e=>e.scrollTop),0);
  await page.evaluate(()=>StudioHost.navigate('loading'));await page.evaluate(()=>StudioHost.navigate('reportA'));
  await page.waitForFunction(()=>document.querySelectorAll('#workspace-pages [data-page]').length===16&&document.querySelector('[data-page="1"]').dataset.rendered==='true');
  assert.deepEqual(errors,[]);console.log('PASS continuous wheel scrolling with live progress, PDF/canvas identity, height, disclosure/visual anchor, stale print, A/B switching, new PDF and navigation; zero page errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
