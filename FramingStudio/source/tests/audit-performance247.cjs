const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const app=path.resolve(__dirname,'../..');
function context(reference=false){
 const html=fs.readFileSync(path.join(app,'assets/index.html'),'utf8').replace(/\r\n/g,'\n'),seed=JSON.parse(html.match(/<script id="seed"[^>]*>([\s\S]*?)<\/script>/)[1]);
 const ctx=vm.createContext({console,structuredClone,performance,TextEncoder,TextDecoder,URL,Blob,setTimeout,clearTimeout,document:{addEventListener(){},getElementById(id){return id==='seed'?{textContent:JSON.stringify(seed)}:null},querySelector(){return null},querySelectorAll(){return []}},localStorage:{getItem(){return null},setItem(){}},navigator:{userAgent:'regression'},devicePixelRatio:1});ctx.window=ctx;ctx.addEventListener=()=>{};
 const excluded=new Set(['app.js','mobile.js','panel-layout.js','display-quality.js','column-alignment-ui.js','right-inputs.js','framing-fold91.js']);
 const modules=fs.readdirSync(path.join(app,'source')).filter(n=>n.endsWith('.js')&&!excluded.has(n)).map(n=>({n,s:fs.readFileSync(path.join(app,'source',n),'utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').trim()})).map(x=>({...x,pos:html.indexOf(x.s)})).filter(x=>x.pos>=0).sort((a,b)=>a.pos-b.pos);
 for(let {n,s}of modules){if(reference&&['loading.js','column-areas103.js'].includes(n))s=fs.readFileSync(path.join(process.env.FRAMING_PERFORMANCE_BASELINE,n),'utf8');vm.runInContext(s,ctx,{filename:n});}
 const run=(s,arg)=>{ctx.argument=arg;return vm.runInContext(s,ctx)};
 run(fs.readFileSync(path.join(app,'source/tests/loading115-browser.js'),'utf8'));
 return {ctx,run};
}
const fixture=`(()=>{const p=Engine.clone(loading115Tests().projects.slab),t=p.types.F1;
 p.total=3;p.groups=[{...p.groups[0],end:'顶层'}];
 t.beams[0].kind=argument;t.beams[0].b=250;t.beams[0].d=250;t.beams[0].depthOverride184=250;t.beams[0].widthMode='manual';
 for(let f=1;f<=p.total;f++)LoadData.setFloor(p,f,{usage:'Dormitory',dl:10,sdl:0,ll:2});
 const r=Engine.generate(p);for(const f of r.floors){const b=Engine.floorModel(r,f).beams.find(b=>b.id==='B1');p.explorer.members[f.n+'|'+Loading.token(b.kind,b)]={mode:'manual',beamSelfWeight:true,beamLoads:[{type:'line',a:0,b:Loading.beamSpan(b).value,dl:argument==='TB'?130:30,ll:10}]};}return p;})()`;
const audit=`(async()=>{const p=Engine.clone(argument),before=JSON.stringify(p),r=Engine.generate(p),counts={summary:0,check:0,generate:0},ms={summary:0,check:0,generate:0};
 const wrap=(obj,key,name)=>{const original=obj[key];obj[key]=function(...args){const t=performance.now();counts[name]++;try{return original.apply(this,args)}finally{ms[name]+=performance.now()-t}};return ()=>obj[key]=original};
 const restore=[wrap(BeamLoadUI,'summary211','summary'),wrap(BeamAdvice230,'check','check'),wrap(Engine,'generate','generate')];
 try{const t=performance.now(),result=await AuditRunner132.run(p,r,{beamSummary:BeamLoadUI.summary211,includePassedBeams:true,recommendSB:true,retainOutput226:true,capture228:true});const {cache228,stats228,...output}=result;return {output,counts,ms,elapsed:performance.now()-t,stats228,unchanged:before===JSON.stringify(p)}}finally{restore.forEach(f=>f())}})()`;
module.exports={context,fixture,audit,app};
if(require.main===module)(async()=>{
 const crypto=require('crypto'),hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
 const expected={SB:'1bddc569f0580576dfff5d008a7f4e8bed82e64da68ccae443d469728dc8ab3d',TB:'9bc087ff3b5720cb9c2bd78cc6b1dcdcbca1d12912e40ab59774893e6b03b69b'};
 for(const kind of ['SB','TB']){
  const c=context(),p=c.run(fixture,kind),a=await c.run(audit,p);assert(a.unchanged);assert.equal(hash(a.output),expected[kind]);
  if(process.env.FRAMING_PERFORMANCE_BASELINE){const old=context(true),b=await old.run(audit,old.run(fixture,kind));assert(b.unchanged);assert.equal(hash(a.output),hash(b.output));assert.equal(a.counts.generate,b.counts.generate);assert.equal(a.stats228.calls,b.stats228.calls);}
  console.log('PASS',kind,'complete output matches E2.246; unchanged input and solver/model counts');
 }
 // Reuse the same project object across edits, with prior audit cache and
 // cancellation between changes. A fresh full audit must remain identical.
 const sequence=`(async()=>{const p=Engine.clone(argument),options={beamSummary:BeamLoadUI.summary211,includePassedBeams:true,recommendSB:true,retainOutput226:true,capture228:true},clean=x=>{const {cache228,stats228,...out}=x;return JSON.stringify(out)},outputs=[];let previous=null;
 const run=()=>AuditRunner132.run(p,Engine.generate(p),{...options,reuse228:previous});
 const edits=[()=>{},()=>{p.types.F1.beams[0].b+=50},()=>{p.types.F1.beams[0].depthOverride184+=50;p.types.F1.beams[0].d+=50},()=>LoadData.setFloor(p,3,{usage:'Dormitory',dl:12,sdl:2,ll:4}),()=>{const m=Loading.members(p,Engine.generate(p),1).find(x=>x.kind==='TB');p.explorer.members['1|'+m.token].steel={C44:4,D44:32,E58:4,G58:12,H58:150,E76:2,G76:8,H76:250}},()=>{const c=Engine.floorModel(Engine.generate(p),2).columns[0];p.explorer.members['2|'+Loading.token('COL',c)]={sectionAAreaOverrides115:{3:27.5}}}];
 for(const edit of edits){edit();const before=JSON.stringify(p),result=await run(),full=await AuditRunner132.run(p,Engine.generate(p),options);if(clean(result)!==clean(full))throw Error('Sequential edit differs from full audit');if(before!==JSON.stringify(p))throw Error('Input changed');outputs.push(clean(result));previous=result.cache228;
 let started=0,released=0,calls=0;const original=ColumnAreas103.snapshot228;ColumnAreas103.snapshot228=(...args)=>{started++;const release=original(...args);return ()=>{released++;release()}};
 try{const aborted=await AuditRunner132.run(p,Engine.generate(p),{...options,cancelled:()=>++calls>2});if(aborted!==null||started===0||started!==released)throw Error('Cancellation scope leak')}finally{ColumnAreas103.snapshot228=original}}
 return outputs;})()`;
 const current=context(),outputs=await current.run(sequence,current.run(fixture,'TB'));
 if(process.env.FRAMING_PERFORMANCE_BASELINE){const old=context(true);assert.equal(JSON.stringify(outputs),JSON.stringify(await old.run(sequence,old.run(fixture,'TB'))));}
 console.log('PASS repeated same-object width, depth, loads, steel and area edits; full/incremental/reference parity and cancellation scope release');
})().catch(e=>{console.error(e);process.exitCode=1});
