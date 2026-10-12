// Extend the established isolated-browser harness with deflection-specific checks.
const fs=require('fs'),path=require('path'),Module=require('module');
const file=path.join(__dirname,'diagrams207-ui.cjs');let source=fs.readFileSync(file,'utf8');
const checks=`
await page.locator('[data-plot207="D"]').waitFor();
const before210=await page.evaluate(()=>JSON.stringify(StudioHost.get().p));
const labels=await page.locator('[data-kind="D"]').innerText();assert(labels.includes('Table 3.2 · For general use'));assert(labels.includes('26.4 kN/mm²'));assert(labels.includes('不取代 Section B'));
const expected210=await page.evaluate(()=>{const c=member207,L=4.5,w=10.123456789+2.987654321;return 5*w*L**4/(384*26.4e6*c.b*c.d**3/12)*1000;});
await page.locator('[data-station-number209]').fill('2.25');
const result210=await page.locator('.bl-readout207').textContent();assert(result210.includes('δ = '));assert(result210.includes(await page.evaluate(n=>BeamLoads.display208(n),expected210)));
await page.locator('[data-station-number209]').fill('5');assert.equal(await page.locator('[data-station-number209]').getAttribute('aria-invalid'),'true');assert.equal(await page.locator('.bl-readout207').textContent(),result210);
await page.locator('[data-station207]').focus();await page.locator('[data-station207]').press('Home');assert.equal(await page.locator('[data-station-number209]').inputValue(),'0');assert((await page.locator('.bl-readout207').textContent()).includes('δ = 0.000 mm'));
const dp=page.locator('[data-plot207="D"]');await dp.scrollIntoViewIfNeeded();const box210=await dp.boundingBox();await page.mouse.move(box210.x+box210.width/2,box210.y+box210.height/2);assert(Math.abs(Number(await page.locator('[data-station207]').inputValue())-2.25)<.02);
await page.setViewportSize({width:852,height:1500});await page.locator('[data-kind="D"]').screenshot({path:path.resolve('tmp/deflection210.png')});assert(!(await page.locator('.bl-diagrams207').evaluate(e=>e.scrollWidth>e.clientWidth+1)));
assert.equal(await page.evaluate(()=>JSON.stringify(StudioHost.get().p)),before210);
// Material routing and missing-grade feedback; use an isolated fixture only.
await page.evaluate(()=>{window.renderMaterial210=(kind,grade)=>{BeamLoadUI.clear();const h=StudioHost.get(),p=Engine.clone(h.p);p.explorer.settings.fcu=45;p.explorer.settings.tbFcu=grade;const member={...member207,displayKind:kind};document.querySelector('#side').innerHTML=BeamLoadUI.render({...h,p,data:{beamSpan:4.5,beamLoadMode:'manual',beamLoads:[{type:'line',dl:10,ll:0,a:0,b:4.5}]},selected:{member,token:'test210'}});};renderMaterial210('TB',60);});await page.locator('[data-plot207="D"]').waitFor();assert((await page.locator('[data-kind="D"]').innerText()).includes('30.0 kN/mm²'));
await page.evaluate(()=>renderMaterial210('TB',null));await page.locator('[data-deflection-error210]').waitFor();assert.equal(await page.locator('[data-plot207="D"]').count(),0);assert.equal(await page.locator('[data-plot207="M"]').count(),1);
assert.equal(await page.evaluate(()=>JSON.stringify(StudioHost.get().p)),before210);assert.deepEqual(errors,[]);
console.log('PASS deflection UI values, numeric/slider/pointer synchronization, invalid recovery, material routing/missing grade, narrow layout and immutability');
`;
source=source.replace("assert.deepEqual(errors,[]);console.log(",checks+"assert.deepEqual(errors,[]);console.log(");
const m=new Module(file,module);m.filename=file;m.paths=module.paths;m._compile(source,file);
