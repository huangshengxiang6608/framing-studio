const assert=require('assert/strict'),path=require('path'),{pathToFileURL}=require('url'),{chromium}=require('playwright');
const {context,fixture}=require('./audit-performance247.cjs');
(async()=>{
 const c=context(),p=JSON.parse(JSON.stringify(c.run(fixture,'TB')));p.name='Member list 290';
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  const root=path.resolve(process.argv[2]||'FramingStudio');await page.goto(pathToFileURL(path.join(root,'assets/index.html')).href);await page.waitForFunction(()=>window.StudioHost);
  await page.evaluate(()=>{window.auditCalls290=0;const run=AuditRunner132.run;AuditRunner132.run=(...args)=>{auditCalls290++;return run(...args);};});
  const load=async project=>{await page.locator('#file').setInputFiles({name:'members.framing.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(project))});await page.waitForFunction(()=>StudioHost.get().p.name.startsWith('Member list 290'));await page.evaluate(()=>StudioHost.navigate('checks'));await page.waitForFunction(()=>!document.querySelector('[data-representatives-status250]')&&document.querySelector('#ex-selected-members tbody'));};
  await load(p);
  const rows=()=>page.locator('#ex-selected-members tbody tr');
  const control=(action,m)=>page.locator('#ex-selected-members [data-ex="'+action+'"][data-floor="'+m.floor+'"][data-token='+JSON.stringify(m.token)+']');
  const project=()=>page.evaluate(()=>JSON.parse(JSON.stringify(StudioHost.get().p)));
  const geometry=()=>page.evaluate(()=>JSON.stringify({types:StudioHost.get().p.types,models:StudioHost.get().result.floorModels}));
  const present=m=>control('choose',m).count();
  const shape=await geometry(),targets=await rows().evaluateAll(rs=>rs.map(r=>{const b=r.querySelector('[data-ex=choose]');return {floor:+b.dataset.floor,token:b.dataset.token,id:b.textContent};}));
  assert(targets.length>1,'real automatic representatives');
  // Exercise every rendered representative, including the currently focused item.
  for(const m of targets){
   await control('choose',m).click();const before=await project(),n=await rows().count(),calls=await page.evaluate(()=>auditCalls290);
   await control('remove-member233',m).click();assert.equal(await present(m),0,'removed representative must disappear immediately: '+m.id);assert.equal(await rows().count(),n-1);
   const after=await project(),k=m.floor+'|'+m.token;for(const map of ['selected','reportA','reportB']){assert.equal(after.explorer[map][k],false);const rest={...after.explorer[map]},prior={...before.explorer[map]};delete rest[k];delete prior[k];assert.deepEqual(rest,prior,'other selections preserved');}
   assert.equal(await geometry(),shape,'no physical member deletion or solver geometry edit');
   await page.evaluate(()=>StudioHost.navigate('checks'));assert.equal(await present(m),0,'refresh does not restore deleted row');assert.equal(await page.evaluate(()=>auditCalls290),calls,'selection-only removal must reuse calculations');
   await page.locator('#undo').click();assert(await present(m));assert.deepEqual(await project(),before,'one Undo restores selection and row');
  }
  const m=targets[0];await control('choose',m).click();await control('remove-member233',m).click();const saved=await project();
  await load(saved);assert.equal(await present(m),0,'saved/reopened project must remember removal');
  await page.evaluate(()=>StudioHost.transact(()=>{StudioHost.get().p.name+=' recalculated';}));await page.waitForFunction(()=>!document.querySelector('[data-representatives-status250]'));assert.equal(await present(m),0,'new automatic extraction must not restore removed member');
  // Explicit re-selection displays the member without silently selecting Check/A/B.
  const focus=async member=>page.evaluate(({floor,token})=>{const h=StudioHost.get(),m=Loading.members(h.p,h.result,floor).find(x=>x.token===token);StudioHost.focusMember287({kind:m.kind,id:m.member.id,f:floor});StudioHost.navigate('checks');},{floor:member.floor,token:member.token});
  await focus(m);assert(await present(m));const key=m.floor+'|'+m.token;assert.equal((await project()).explorer.selected[key],false);
  const check=page.locator('#ex-selected-members [data-ex=include-row][data-floor="'+m.floor+'"][data-token='+JSON.stringify(m.token)+']');await check.check();assert.equal((await project()).explorer.selected[key],true);assert.equal((await project()).explorer.representatives250.hidden290[key],undefined);
  const visible=await rows().evaluateAll(rs=>rs.map(r=>{const b=r.querySelector('[data-ex=choose]');return b.dataset.floor+'|'+b.dataset.token;}));
  const other=await page.evaluate(keys=>{const h=StudioHost.get();for(const f of h.result.floors)for(const m of Loading.members(h.p,h.result,f.n))if(m.kind!=='WALL'&&!keys.includes(f.n+'|'+m.token))return {floor:f.n,token:m.token,id:m.id};},visible);assert(other,'another existing member outside the representative list');
  await focus(other);assert(await present(other),'selecting another member adds its row');assert(await present(m),'checked member remains when focus changes');
  const add=page.locator('#ex-selected-members [data-ex=include-row][data-floor="'+other.floor+'"][data-token='+JSON.stringify(other.token)+']');await add.check();await focus(m);assert(await present(other),'newly checked member stays');await control('remove-member233',other).click();assert.equal(await present(other),0,'manually selected row also removed');assert(await present(m));
  assert.equal(await geometry(),shape);assert.deepEqual(errors,[]);
  await page.screenshot({path:'tmp/member-list290-ui.png'});
  // Same saved removal behavior for all representative categories, pending groups and native slab re-sync.
  assert(await page.evaluate(()=>{for(const kind of ['MB','SB','TB','CB','COL','SLAB','CS']){const row={floor:1,token:(kind==='CS'?'SLAB':kind)+'|T',kind:kind==='CS'?'SLAB':kind},k=BeamRepresentatives250.key(row),g={kind,winner:row,missing:0},e={};BeamRepresentatives250.sync(e,[g]);BeamRepresentatives250.remove290(e,k);const saved=JSON.parse(JSON.stringify(e));BeamRepresentatives250.sync(saved,[g]);BeamRepresentatives250.syncSlabs(saved,[g]);if(['selected','reportA','reportB'].some(n=>saved[n][k]!==false)||!saved.representatives250.hidden290[k])return false;BeamRepresentatives250.manual(saved,k,'reportB',true);if(saved.representatives250.hidden290[k]||saved.reportB[k]!==true)return false;}return true;}));
  console.log('PASS representative/manual row removal, immediate count, deselection, geometry preservation, all categories, Undo, no recalculation on removal, save/reopen, recompute suppression, explicit reselect and adding other members; no page errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
