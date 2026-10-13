const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{pathToFileURL}=require('url'),{chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const a=await browser.newPage(),b=await browser.newPage();await a.goto(pathToFileURL(path.resolve('FramingStudio/assets/index.html')).href);await b.goto(pathToFileURL(path.resolve(process.argv[2],'FramingStudio/assets/index.html')).href);await a.waitForFunction(()=>window.StudioHost);await b.waitForFunction(()=>window.StudioHost);
 const seed=await b.evaluate(()=>JSON.parse(document.getElementById('seed').textContent));
 const cases=[seed,JSON.parse(JSON.stringify(seed))];for(const t of Object.values(cases[1].types)){t.mode='auto';t.columnGrid={targetX:8,targetY:7,x:[0,8,16],y:[0,7,14]};}
 for(const [i,p]of cases.entries()){const read=async page=>page.evaluate(p=>JSON.stringify(Engine.generate(p)),p);assert.equal(await read(a),await read(b),'Unconfigured project case '+i);}
 console.log('PASS complete generated-model parity against E2.257 for seed and independent-column-grid projects without new limits');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
