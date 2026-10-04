// Saved analysis span: independent force/moment balance and real downstream consumers.
function span130Tests(){
 const fixtures=loading115Tests().projects,passed=[],copy=Engine.clone;
 const ok=(v,m)=>{if(!v)throw Error(m);},near=(a,b,m)=>ok(Number.isFinite(a)&&Math.abs(a-b)<1e-7,`${m}: ${a} / ${b}`);
 const row=(out,id,f=1)=>out.rows.find(r=>r.floor===f&&r.member.id===id);
 const model=p=>Engine.generate(p),run=p=>Loading.run(p,model(p),'B');
 const set=(p,id,L,f=1)=>{const b=Engine.floorModel(model(p),f).beams.find(b=>b.id===id),t=Loading.token(b.kind,b);Loading.saveFramingSupports(p,f,t,{beamSpan:L},['beamSpan']);return t;};
 const sums=lines=>lines.reduce((s,l)=>({g:s.g+l.g*(l.end-l.start),q:s.q+l.q*(l.end-l.start)}),{g:0,q:0});
 const moment=(r,k)=>(k==='g'?r.loading.udlDead:r.loading.udlLive)*r.loading.L**2/2+r.loading.points.reduce((n,p)=>n+p[k]*p.x,0)+r.loading.lines.reduce((n,l)=>n+l[k]*(l.end-l.start)*(l.start+l.end)/2,0);
 const p=copy(fixtures.slab);const region=LoadData.addArea(p,1);Object.assign(region,{name:'Partial patch',dl:12,sdl:1.37,ll:4.13,rects:LoadRegions83.clipSurface([{x0:0,x1:2,y0:0,y1:4}],Engine.floorModel(model(p),1))});
 const physical=JSON.stringify(model(p)),base=row(run(p),'B1'),baseSum=sums(base.loading.automaticLines);
 for(const L of [3.731,7.319,base.loading.L]){
  const q=copy(p),t=set(q,'B1',L),r=row(run(q),'B1'),k=L/base.loading.L;
  ok(r.actions,'Partial-region beam resolves: '+JSON.stringify(r.loadErrors));ok(JSON.stringify(model(q))===physical,'Plan geometry unchanged');near(r.loading.L,L,'Manual analysis span');
  const total=sums(r.loading.automaticLines);near(total.g,baseSum.g,'Automatic G conserved');near(total.q,baseSum.q,'Automatic Q conserved');
  near(r.actions.totalDead,base.actions.totalDead+base.loading.sw*(L-base.loading.L),'Only own self-weight changes with span');near(r.actions.totalLive,base.actions.totalLive,'Live total preserved');
  ok(r.loading.automaticLines.length===base.loading.automaticLines.length,'Piecewise source patches retained');
  r.loading.automaticLines.forEach((line,i)=>{const old=base.loading.automaticLines[i];near(line.start,old.start*k,'Patch start');near(line.end,old.end*k,'Patch end');near(line.g*(line.end-line.start),old.g*(old.end-old.start),'Individual G resultant');near(line.q*(line.end-line.start),old.q*(old.end-old.start),'Individual Q resultant');});
  near(r.actions.dead.right,moment(r,'g')/L,'Independent G equilibrium');near(r.actions.live.right,moment(r,'q')/L,'Independent Q equilibrium');
  set(q,'B1',null);const restored=row(run(q),'B1');ok(JSON.stringify(restored.actions)===JSON.stringify(base.actions),'Restore automatic exact actions');ok(JSON.stringify(restored.loading)===JSON.stringify(base.loading),'Restore automatic exact load schedule');
 }
 passed.push('Shorter/longer non-round spans preserve every partial floor-load resultant and geometry; own weight, force/moment equilibrium and exact restore verified');

 // An SB transfers to two MBs; altering both coordinate scales must not double-map the connection.
 const chain=copy(fixtures.slab);chain.types.F1.beams.push({id:'SB_MID',kind:'SB',a:{x:2,y:0},z:{x:2,y:4},b:250,d:350,on:true});
 const old=run(chain),oldSB=row(old,'SB_MID'),oldMB=row(old,'B1');set(chain,'SB_MID',5.731);set(chain,'B1',7.319);const next=run(chain),sb=row(next,'SB_MID'),mb=row(next,'B1');
 ok(sb.actions&&mb.actions,'SB and receiving MB both resolve');near(sb.actions.totalLive,oldSB.actions.totalLive,'SB floor Q unchanged');
 const oldPoint=oldMB.loading.automaticPoints.find(x=>x.label==='SB_MID'),point=mb.loading.automaticPoints.find(x=>x.label==='SB_MID');
 near(point.x,oldPoint.x*mb.loading.L/oldMB.loading.L,'Child reaction location maps once');near(point.g,BeamLoads.up(sb.actions.dead.left),'Updated SB G reaches MB');near(point.q,BeamLoads.up(sb.actions.live.left),'Updated SB Q reaches MB');
 for(const r of next.rows.filter(r=>r.kind==='COL')){ok(!r.loadErrors.length,'Downstream column load path valid');const oldColumn=old.rows.find(x=>x.token===r.token);near(r.loading.live,oldColumn.loading.live,'Column Q conserved after two span mappings');}
 passed.push('SB → MB → column propagation, connection station mapping and floor Q conservation');

 const transfer=copy(fixtures.tc);for(const type of Object.values(transfer.types))type.slabVoids=[{x0:0,x1:6,y0:0,y1:4}];const transferBase=copy(transfer),before=run(transfer),beforeTB=row(before,'TB1');set(transfer,'TB1',7.319);const after=run(transfer),tb=row(after,'TB1');
 ok(tb.actions,'Transfer beam resolves: '+JSON.stringify(tb.loadErrors));near(tb.loading.points[0].x,beforeTB.loading.points[0].x*tb.loading.L/beforeTB.loading.L,'Transferred column position maps');near(tb.loading.points[0].g,beforeTB.loading.points[0].g,'Transferred column G conserved');near(tb.actions.totalLive,beforeTB.actions.totalLive,'Transferred Q conserved');
 const tm=model(transfer);for(const c of Engine.floorModel(tm,1).columns){const t=Loading.token('COL',c),a=Reports.columnA(transfer,{floor:1,token:t,id:c.id},tm),b=Reports.columnA(transferBase,{floor:1,token:t,id:c.id},model(transferBase));near(a.rows.reduce((s,r)=>s+r.area*r.count,0),b.rows.reduce((s,r)=>s+r.area*r.count,0),'Area tracing independent of analysis span');}
 passed.push('Upper column → TB → lower columns; automatic area tracing remains geometric');

 // Closed-form manual uniform load, with explicit self-weight and a known point.
 const manual=copy(fixtures.slab),token=set(manual,'B1',5.375),o=manual.explorer.members['1|'+token];
 Object.assign(o,{mode:'manual',beamLoadMode:'manual',beamSelfWeight:false,beamLoads:[{name:'Known UDL',type:'line',a:0,b:5.375,dl:4,ll:2}]});manual.explorer.selected['1|'+token]=true;manual.explorer.reportA['1|'+token]=true;manual.explorer.reportB['1|'+token]=true;
 let rr=row(run(manual),'B1');const w=1.4*4+1.6*2;near(rr.actions.M,w*5.375**2/8,'Manual UDL bending');near(rr.actions.left,w*5.375/2,'Manual UDL reaction');
 for(const section of ['A','B']){const native=RCPlan.build(manual,section);ok(!native.issues.length,'Native '+section+' inputs complete: '+JSON.stringify(native.issues));const batch=native.batches[0],load=batch.fullLoads.find(l=>l.kind==='MB');near(load.L,5.375,'Native '+section+' uses new L');near(load.expected.M,rr.actions.M,'Native '+section+' expected moment');near(batch.cells['B'+batch.members.find(m=>m.kind==='MB').row],5.375,'Original report span cell');}
 set(manual,'B1',4);rr=row(run(manual),'B1');ok(!rr.actions&&rr.loadErrors.some(x=>x.includes('位置须在')),'Shortened span rejects saved out-of-range manual load');ok(manual.explorer.members['1|'+token].beamLoads[0].b===5.375,'Invalid manual load was not clipped');
 set(manual,'B1',5.375);o.beamLoads=[{name:'At 1 m',type:'point',a:1,dl:10,ll:3}];rr=row(run(manual),'B1');near(rr.loading.points[0].x,1,'Manual metre positions not stretched');near(rr.actions.dead.right,10/5.375,'Manual point equilibrium');
 passed.push('Closed-form manual M/V/reactions; native A/B original span cells and full-load payload; out-of-range inputs reject without clipping');

 for(const reverse of [false,true])for(const vertical of [false,true]){
  const cb=copy(fixtures.cb),b=cb.types.F1.beams[0];b.a=reverse?(vertical?{x:0,y:4}:{x:4,y:0}):{x:0,y:0};b.z=reverse?{x:0,y:0}:(vertical?{x:0,y:4}:{x:4,y:0});cb.explorer.members={};cb.explorer.selected={};cb.explorer.reportB={};const t=set(cb,'CB1',5.25);cb.explorer.members['1|'+t]={beamSpan:5.25,mode:'manual',beamLoadMode:'manual',beamSelfWeight:true,beamLoads:[{type:'point',name:'Known force',a:reverse?1.25:4,dl:10,ll:3}],fixedEnd:reverse?'z':'a'};cb.explorer.selected['1|'+t]=true;cb.explorer.reportB['1|'+t]=true;const r=row(run(cb),'CB1');ok(r.actions,'CB manual span resolves');near(r.actions.dead.M,4.41*5.25**2/2+10*4,'CB root G moment');near(r.actions.live.M,3*4,'CB root Q moment');near(r.actions.totalDead,4.41*5.25+10,'CB G reaction');const native=RCPlan.build(cb,'B');ok(!native.issues.length,'CB native inputs complete');near(native.batches[0].fullLoads[0].L,5.25,'CB native span');
  cb.types.F1.columns=[];const missing=row(run(cb),'CB1');ok(!missing.actions,'Manual span does not invent missing supports');
 }
 passed.push('Horizontal/vertical and A/B-root cantilevers: closed-form root moments, reactions, native payload and missing-support safeguards');

 for(const invalid of [0,-1,.0000001,'bad',NaN,Infinity]){const q=copy(fixtures.slab);set(q,'B1',invalid);const r=row(run(q),'B1');ok(!r.actions&&r.loading.L===null&&r.loadErrors.some(x=>x.includes('Span')),'Invalid saved span rejected: '+invalid);}
 const invalidCB=copy(fixtures.cb);set(invalidCB,'CB1',-1);invalidCB.explorer.reportA=copy(invalidCB.explorer.reportB);ok(RCPlan.build(invalidCB,'A').batches.length===0,'Invalid span cannot become an automatic fallback in native Section A');
 const shared=copy(fixtures.slab);shared.total=2;shared.groups[0].end='顶层';LoadData.setFloor(shared,2,LoadData.floor(shared,1));const t=set(shared,'B1',5.731);for(const f of [1,2])near(row(run(shared),'B1',f).loading.L,5.731,'Shared framing span '+f);
 shared.explorer.members['2|'+t].beamSpan=7;const conflicted=run(shared);for(const f of [1,2])ok(!row(conflicted,'B1',f).actions&&row(conflicted,'B1',f).loadErrors.some(x=>x.includes('Span 设置冲突')),'Conflicting shared spans block calculation');
 set(shared,'B1',null);for(const f of [1,2])ok(row(run(shared),'B1',f).actions,'Shared restore removes conflict');
 passed.push('Invalid/imported values and shared-framing conflicts block results; restoring automatic resolves both floors');
 return {passed,fixtures,uiProject:shared,manualProject:manual};
}
