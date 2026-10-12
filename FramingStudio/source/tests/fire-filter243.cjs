const path=require('path'),assert=require('assert/strict'),{context}=require('../../verification/integration143.cjs'),fixture=require('./tributary187.cjs');
const c=context(path.resolve(__dirname,'../..'));c.ctx.assert=assert;
c.run(`(()=>{
 const p=Engine.clone(argument);delete p.sbDefault243;p.defaults.sb=250;p.types.F1.sbWidth=250;
 const t=p.types.F1,b=t.beams.find(b=>b.id==='B1');b.b=250;b.widthMode='manual';
 p.groups[0].fire241=4;Engine.validate(p);
 assert.equal(p.defaults.sb,300);assert.equal(t.sbWidth,300);assert.equal(b.b,250);
 const restored=JSON.parse(JSON.stringify(p));restored.defaults.sb=280;restored.types.F1.sbWidth=280;Engine.validate(restored);
 assert.equal(restored.defaults.sb,280);assert.equal(restored.types.F1.sbWidth,280);
 const custom=Engine.clone(p);delete custom.sbDefault243;custom.defaults.sb=350;custom.types.F1.sbWidth=400;Engine.validate(custom);
 assert.equal(custom.defaults.sb,350);assert.equal(custom.types.F1.sbWidth,400);
 const r=Engine.generate(p),out=Loading.audit(p,r,BeamLoadUI.summary211,true),bad=out.items.filter(i=>i.id==='B1'&&i.fireWidth243?.pass===false);
 assert.equal(bad.length,1,'one FRR failure per beam, not a duplicate model issue');
 assert.equal(bad[0].fireWidth243.fire,4);assert.equal(bad[0].fireWidth243.minimum,280);assert.equal(bad[0].fireWidth243.width,250);
 assert.equal(BeamLoadUI.combinationKey214(bad[0]),'fire-width');assert.equal(BeamLoadUI.auditStatus214(bad[0]),'NOT OK');
 assert(BeamLoadUI.defaultCombinations214().includes('fire-width'));assert(BeamLoadUI.combinations214.includes('fire-width'));
 assert.equal(out.items.filter(i=>BeamLoadUI.combinationKey214(i)==='fire-width').length,1);
 const fixed=Engine.clone(p);fixed.types.F1.beams.find(b=>b.id==='B1').b=300;
 const updated=Loading.audit(fixed,Engine.generate(fixed),BeamLoadUI.summary211,true);
 assert(!updated.items.some(i=>i.id==='B1'&&BeamLoadUI.combinationKey214(i)==='fire-width'));
 assert.equal(BeamLoadUI.combinationKey214({kind:'COL',status:'NOT OK'}),'other');
 // The default migration leaves every member-level override record intact.
 const overrides=Engine.clone(argument);delete overrides.sbDefault243;overrides.defaults.sb=250;
 overrides.types.F1.beamWidths83={'1,2|9,2':250};const before=JSON.stringify(overrides.types.F1.beamWidths83);Engine.validate(overrides);
 assert.equal(JSON.stringify(overrides.types.F1.beamWidths83),before);
})()`,fixture.p);
console.log('PASS FRR audit filter, counts, default preset, no duplicate model issue, repaired member removal; SB 250→300 default migration, explicit widths and later edits preserved');
