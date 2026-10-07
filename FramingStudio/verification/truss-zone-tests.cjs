const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const T=require('../source/transfer-truss.js'),A=require('../source/truss-analysis.js'),passed=[];
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'zone122');fs.mkdirSync(out,{recursive:true});
const demo=path.join(root,'示例模型/RC_同层2m_StructuralZone_Demo/RC_同层2m_StructuralZone_Demo.framing.json');
const near=(a,b,tol=1e-7)=>assert(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${a} != ${b}`);
function test(name,fn){fn();passed.push(name);}
const chosen=Object.fromEntries(T.groups.map(g=>[g,'UC 305x305x283']));
const input={span:12,depth:2,structuralDepth:2,panels:2,loads:[{id:'C',x:6,g:1000,q:300}],sections:chosen,restraints:{top:6,bottom:6},limits:{total:100,live:100,differential:100},bracingConfirmed:true};
test('Outside depth is converted to chord axis spacing; independent hand solution uses the smaller lever arm',()=>{
 const r=T.analyse(input,chosen),h=2-T.section(chosen.top).D/1000,a=r.cases.find(x=>x.id==='C G');near(r.input.depth,h);
 const force=id=>a.N[r.members.findIndex(m=>m.id===id)];near(force('TC1'),-1000*12/(4*h));near(force('TC2'),-1000*12/(4*h));near(force('D1'),500*Math.hypot(6,h)/h);near(force('V2'),-1000);near(force('BC1'),0);near(a.R[1],500);near(a.R[2],500);
 const trace=A.build(r);assert(trace.maxDifference<1e-7);assert(trace.cases[3].audit.steps.length>0);
});
test('Diagonal section projection is included when it exceeds chord half-depth',()=>{
 const sections={...chosen,top:'UB 203x133x25',bottom:'UB 203x133x25',diagonal:'UC 305x305x283'};
 const r=T.analyse({...input,panels:4,restraints:{top:3,bottom:3}},sections),g=r.input.structuralEnvelope;assert(g.topInset>T.section(sections.top).D/2000);near(g.topInset,T.section(sections.diagonal).D/2000*3/Math.hypot(3,r.input.depth));near(g.topInset+r.input.depth+g.bottomInset,2);
 assert.throws(()=>T.analyse({...input,structuralDepth:.1},chosen),/无法放入/);
});
test('Method-of-joints verification covers asymmetric and irregular node loads independently of stiffness',()=>{
 for(const panels of [2,3,4,5,8]){const r=T.analyse({...input,panels,loads:[{id:'L',x:2.2,g:710,q:180},{id:'R',x:8.3,g:320,q:830}],restraints:{top:12,bottom:12}},chosen),a=A.build(r);assert(a.maxDifference<1e-6);assert(a.maxResidual<1e-6);}
 const r=T.analyse(input,chosen),wrong={...r.dead,N:[...r.dead.N]};wrong.N[0]+=1;assert.throws(()=>A.joints(r,wrong),/不一致/);
});
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1550,height:1050}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto('file:///'+path.join(root,'assets/index.html').replaceAll('\\','/'));await page.locator('#file').setInputFiles(demo);await page.locator('#nav button[data-tab="truss"]').click();
 const data=await page.evaluate(()=>{
  const {p,result:r}=StudioHost.get(),clone=()=>Engine.clone(p),out=Loading.run(p,r,'B'),entry=out.trusses[0],c=entry.calculation;
  if(!c)return {failure:entry.fail};
  const trace=TrussAnalysis122.build(c),test=change=>{const q=clone();for(const x of [1,13])q.explorer.selected['2|COL|'+x+',3']=true;change(q);const rr=Engine.generate(q),o=Loading.run(q,rr,'B'),plan=TrussReports109.jobs(q,rr,'B',true);return {status:o.trusses[0].status,fail:o.trusses[0].fail,columns:o.rows.filter(x=>x.floor<=3&&x.kind==='COL').map(x=>x.result.status),jobs:plan.batches.length,issues:plan.issues.length};};
  const invalid={
   exceedsZone:test(q=>q.transferTrusses[0].structuralDepth=2001),
   changedClearance:test(q=>q.groups[2].headroom=3),
   opening:test(q=>q.types.F03.opening['0,0']=true),
   localNarrow:test(q=>q.localHeights96=[{id:'LHZ',name:'Shallower zone',base:2,top:3,type:'F03',cells:[{x0:'A',x1:'B',y0:'1',y1:'2'}],height:5,headroom:3,em:.5,clearance119:true}]),
   staleSupport:test(q=>q.transferTrusses[0].supportA='deleted')
  };
  const partial=clone();partial.axes.x=[{id:'A',gap:0},{id:'M',gap:7},{id:'B',gap:7}];for(const t of Object.values(partial.types))t.building={'0,0':true,'1,0':true};partial.localHeights96=[{id:'PART',name:'Right half',base:2,top:3,type:'F03',cells:[{x0:'M',x1:'B',y0:'1',y1:'2'}],height:5,headroom:3,em:.5,clearance119:true}];const pr=Engine.generate(partial),po=Loading.run(partial,pr);invalid.partialSpan={status:po.trusses[0].status,fail:po.trusses[0].fail};
  const validation=[];for(const change of [q=>delete q.transferTrusses[0].layout,q=>q.transferTrusses[0].bottomFloor=2,q=>q.transferTrusses[0].structuralDepth=-1]){const q=clone();change(q);try{Engine.validate(q);validation.push(false);}catch{validation.push(true);}}
  const pages={},rc={};for(const section of ['A','B']){pages[section]=TrussReports109.jobs(p,r,section,true).batches[0].reportPages;rc[section]=RCPlan.build(p,section);}
  const v=TrussModel109.visuals(p,r,3,3)[0],saved=JSON.parse(JSON.stringify(p));Engine.validate(saved);
  const native=clone();native.explorer.reportA={};native.explorer.reportB={};
  return {p,status:entry.status,fail:entry.fail,g:entry.geometry,c,trace,columns:out.rows.filter(x=>x.kind==='COL').map(x=>({floor:x.floor,id:x.id,g:x.loading.dead,q:x.loading.live,tt:x.truss109,status:x.result.status})),tb:out.rows.some(x=>x.kind==='TB'),invalid,validation,pages,rc,visual:{nodes:v.nodes,depth:v.g.depth},roundtrip:saved.transferTrusses[0],native};
 });
 assert(!data.failure,JSON.stringify(data.failure));assert.equal(data.status,'OK',data.fail.join('; '));const {g,c}=data;
 near(g.zoneDepth,2);near(g.zoneAvailable,2);near(g.zoneTop,12);near(g.zoneBottom,10);assert(g.depth<2);near(g.zTop-g.zBottom,g.depth);assert.equal(data.roundtrip.layout,'floor-zone');assert.equal(data.roundtrip.bottomFloor,data.roundtrip.topFloor);
 for(const m of c.members){const projected=m.section.D/2000*Math.abs(m.c),lo=g.zBottom+Math.min(c.nodes[m.i].y,c.nodes[m.j].y)-projected,hi=g.zBottom+Math.max(c.nodes[m.i].y,c.nodes[m.j].y)+projected;assert(lo>=10-1e-7&&hi<=12+1e-7);}
 passed.push('Same-floor 2 m demo accounts for chord sections, diagonal projections and fixed floor elevations');
 for(const f of [3,2,1])for(const [i,id]of ['L','R'].entries()){const row=data.columns.find(x=>x.floor===f&&x.id===id);near(row.g,c.reactions.dead[i]);near(row.q,c.reactions.live[i]);assert(row.tt.includes('TT1'));assert(!row.status.includes('INPUT REQUIRED'));}
 assert(!data.tb);near(c.reactions.dead[0]+c.reactions.dead[1],1800+c.steelWeight+c.concreteWeight);near(c.reactions.live[0],450);near(c.reactions.live[1],750);passed.push('Reactions enter same-floor RC columns before continuing downward once; replaced TB omitted');
 for(const [name,bad]of Object.entries(data.invalid)){assert.equal(bad.status,'INPUT REQUIRED',name+' '+bad.fail.join('; '));if(bad.columns){assert(bad.columns.every(s=>s==='INPUT REQUIRED'),name);assert.equal(bad.jobs,0);assert(bad.issues);}}
 assert(data.validation.every(Boolean));passed.push('Over-depth, changed headroom, openings, partial-span/local shallow zones and stale supports block downstream checks and export');
 for(const section of ['A','B']){assert.equal(data.rc[section].issues.length,0);assert.equal(data.rc[section].batches.flatMap(x=>x.members).length,2);for(const term of ['Nodes','Reactions & stiffness','Axial forces','Joint equilibrium','Governing envelope'])assert(data.pages[section].some(p=>p.title.includes(term)),section+' '+term);}
 assert(data.trace.maxDifference<1e-6);near(data.visual.depth,g.depth);near(Math.min(...data.visual.nodes.map(n=>n[2])),g.zBottom);near(Math.max(...data.visual.nodes.map(n=>n[2])),g.zTop);passed.push('A/B reports include full force solution and joint audit; 3D mesh uses calculated axis elevations');
 assert((await page.locator('[data-tt-zone]').innerText()).includes('2,000'));assert.equal(await page.locator('[data-tt-field="bottomFloor"]').count(),0);assert.equal(await page.locator('[data-tt-field="layout"]').inputValue(),'floor-zone');assert.equal(await page.locator('[data-tt-analysis]').count(),1);
 const original=await page.evaluate(()=>JSON.stringify(StudioHost.get().p));await page.locator('[data-tt-case="TT1"]').selectOption('G');assert.equal(await page.evaluate(()=>JSON.stringify(StudioHost.get().p)),original);assert((await page.locator('[data-tt-analysis]').innerText()).includes('G · 全部恒载'));
 await page.locator('[data-tt-field="structuralDepth"]').fill('2100');await page.locator('[data-tt-field="structuralDepth"]').press('Tab');assert((await page.locator('[data-tt-id="TT1"] h2').innerText()).includes('INPUT REQUIRED'));await page.locator('#undo').click();assert((await page.locator('[data-tt-id="TT1"] h2').innerText()).includes('TT1 · OK'));
 await page.locator('[data-tt-field="reportA"]').uncheck();const selection=await page.evaluate(()=>{const {p,result:r}=StudioHost.get();return ['A','B'].map(s=>TrussReports109.jobs(p,r,s,true).batches.length);});assert.deepEqual(selection,[0,1]);await page.locator('#undo').click();
 passed.push('UI supports same-floor depth, non-mutating case selection, over-depth feedback, undo and independent A/B selection');
 await page.locator('[aria-label="桁架立面及上层柱荷载"]').screenshot({path:path.join(out,'zone-truss.png')});await page.locator('[data-tt-analysis]').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'force-analysis.png')});
 const native=path.join(out,'native');fs.mkdirSync(native,{recursive:true});fs.writeFileSync(path.join(native,'fixture.framing.json'),JSON.stringify(data.native,null,2));fs.writeFileSync(path.join(native,'truss-smoke.flag'),'1');
 for(const section of ['A','B'])for(let i=0;i<data.pages[section].length;i++){const html=await page.evaluate(p=>ReportExtras82.html(p),data.pages[section][i]);const report=await browser.newPage();await report.setContent(html);await report.pdf({path:path.join(out,`report-${section}-${String(i+1).padStart(2,'0')}.pdf`),format:'A4',printBackground:true,preferCSSPageSize:true});await report.close();}
 delete data.native;fs.writeFileSync(path.join(out,'detail.json'),JSON.stringify(data,null,2));assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({ok:true,checks:passed.length,passed,errors},null,2));console.log(JSON.stringify({ok:true,checks:passed.length,passed,errors}));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
