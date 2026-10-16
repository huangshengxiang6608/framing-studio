const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{pathToFileURL}=require('url'),{chromium}=require('playwright');
const repo=process.argv[2]||path.resolve(__dirname,'../..'),out=path.join(repo,'tmp/release287-browser'),app=path.join(repo,'FramingStudio/assets/index.html');
fs.mkdirSync(out,{recursive:true});
const baselineCommit='b55f288097eaf5aab683899b631fc27e6d6e63c8';
const baselineHtml=require('child_process').execFileSync('git',['show',baselineCommit+':FramingStudio/assets/index.html'],{cwd:repo,encoding:'utf8',maxBuffer:40e6});
fs.writeFileSync(path.join(out,'baseline286.html'),baselineHtml.replace(/<head>/i,'<head><base href="'+pathToFileURL(path.dirname(app)+path.sep).href+'">'));

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe'}),results=[],errors=[];
 try{
  const context=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:2.25,screen:{width:1280,height:800}}),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());
  await page.goto(pathToFileURL(app).href);await page.waitForFunction(()=>window.StudioHost&&document.querySelector('.nav-search-input'));
  const original=await page.evaluate(()=>JSON.stringify(StudioHost.get().p));
  assert.equal(await page.locator('#nav button[data-tab]').count(),20);
  await page.locator('.nav-search-input').fill('柱 SPACING');
  assert.equal(await page.locator('#nav button[data-tab]:visible').count(),1);
  await page.locator('.nav-search-input').press('Enter');
  await page.waitForFunction(()=>document.querySelector('.layout').dataset.tab==='columnSpacing');
  await page.locator('.nav-search-input').press('Escape');
  assert.equal(await page.locator('#nav button[data-tab]:visible').count(),20);
  results.push('All 20 workflows, filter, Enter and Escape');
  await page.locator('.ui-cmd-btn').click();await page.locator('.cmd-input').fill('Summary');
  await page.locator('.cmd-input').press('Enter');
  await page.waitForFunction(()=>document.querySelector('.layout').dataset.tab==='beams');
  const beam=await page.evaluate(()=>{const h=StudioHost.get();return Engine.floorModel(h.result,h.floor,h.key).beams[0]});
  if(beam){
   await page.locator('.ui-cmd-btn').click();await page.locator('.cmd-input').fill('beam '+beam.kind+' '+beam.id);
   await page.locator('.cmd-item').first().click();
   await page.waitForFunction(id=>document.querySelector('#side').textContent.includes(id),beam.displayId||beam.id);
   results.push('Command palette selects the actual beam');
  }
  assert.equal(await page.evaluate(()=>JSON.stringify(StudioHost.get().p)),original,'UI actions preserve project');
  await page.locator('#side-divider').focus();await page.locator('#side-divider').press('ArrowLeft');
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('framing-studio-layout-v1')));
  await page.reload();await page.waitForFunction(()=>window.StudioHost&&document.querySelector('.ui-scale-select'));
  assert.equal(await page.evaluate(()=>parseFloat(document.querySelector('.layout').style.getPropertyValue('--side-width'))),saved.side);
  results.push('Keyboard panel resize persists after reload');
  const reportFixture='<article class="check-report answer-ruled"><div class="answer-paper-content"><h1>Section A 抄</h1><h3>Original heading</h3><p class="copy-line">Original calculation 123.45 kN</p><table class="copy-table"><thead><tr><th>Member</th><th>Value</th></tr></thead><tbody><tr><td>MB1</td><td>123.45</td></tr></tbody></table></div></article>';
  const reportStyle=async(p,tab)=>{
   await p.evaluate(({fixture,tab})=>{document.querySelector('.layout').dataset.tab=tab;const host=document.getElementById('workspace-pages');host.hidden=false;host.innerHTML=fixture;}, {fixture:reportFixture,tab});
   await p.waitForTimeout(120);
   return p.evaluate(()=>[...document.querySelectorAll('.check-report,.check-report *')].map(el=>{const s=getComputedStyle(el);return {tag:el.tagName,text:el.textContent,style:Object.fromEntries(['fontSize','fontFamily','fontWeight','color','lineHeight','padding','margin','border','borderCollapse','borderSpacing','width','height','zoom'].map(k=>[k,s[k]]))}}));
  };
  const baseline=await context.newPage();await baseline.goto(pathToFileURL(path.join(out,'baseline286.html')).href);await baseline.waitForFunction(()=>window.StudioHost);
  for(const medium of ['screen','print']){
   await page.emulateMedia({media:medium});await baseline.emulateMedia({media:medium});
   for(const tab of ['reportA','reportB']){
    const a=await reportStyle(baseline,tab),b=await reportStyle(page,tab);
    fs.writeFileSync(path.join(out,`${tab}-${medium}-styles.json`),JSON.stringify({baseline:a,current:b},null,2));
    assert.deepEqual(b,a,tab+' '+medium+' styles equal E2.286');
   }
  }
  results.push('Section A/B sample computed styles identical to E2.286 in screen and print media');
  await baseline.close();await page.emulateMedia({media:'screen'});
  await page.reload();await page.waitForFunction(()=>window.StudioHost&&document.querySelector('.ui-scale-select'));
  for(const [width,height,profile]of [[1280,800,'p-133'],[1560,1040,'p-146'],[1707,1067,'p-160']]){
   await page.setViewportSize({width,height});await page.locator('.ui-scale-select').selectOption(profile);
   for(const tab of ['parameters','floors','columnSpacing','walls','columns','beamLayout','loading','beams','checks']){
    await page.locator(`#nav button[data-tab="${tab}"]`).click();
    await page.waitForTimeout(80);
    const sizes=await page.evaluate(()=>{const c=document.querySelector('#canvas').getBoundingClientRect();const side=document.querySelector('#side');return {canvas:[c.width,c.height],pageOverflow:document.documentElement.scrollWidth-innerWidth,sideOverflow:side.scrollWidth-side.clientWidth}});
    assert(sizes.canvas[0]>250&&sizes.canvas[1]>250,`${width} ${tab} usable canvas ${JSON.stringify(sizes)}`);
    assert(sizes.pageOverflow<3,`${width} ${tab} page overflow ${sizes.pageOverflow}`);
    if(tab==='checks')await page.screenshot({path:path.join(out,`E2.287-${width}x${height}.png`)});
   }
  }
  results.push('Nine main pages at all three laptop profiles; usable canvas and no page horizontal overflow');
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
