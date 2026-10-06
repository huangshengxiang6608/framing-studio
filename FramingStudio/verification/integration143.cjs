// Headless computation regression. No browser automation or user project mutation.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function context(dir){
 const html=fs.readFileSync(path.join(dir,'assets/index.html'),'utf8').replace(/\r\n/g,'\n'),seed=JSON.parse(html.match(/<script id="seed"[^>]*>([\s\S]*?)<\/script>/)[1]);
 const doc={addEventListener(){},getElementById(id){return id==='seed'?{textContent:JSON.stringify(seed)}:null;},querySelector(){return null;},querySelectorAll(){return [];}};
 const ctx=vm.createContext({console,document:doc,structuredClone,performance,TextEncoder,TextDecoder,URL,Blob,setTimeout(){},clearTimeout(){},localStorage:{getItem(){return null;},setItem(){}},navigator:{userAgent:'regression'},devicePixelRatio:1});
 ctx.window=ctx;ctx.addEventListener=()=>{};
 const excluded=new Set(['app.js','mobile.js','panel-layout.js','display-quality.js','column-alignment-ui.js','right-inputs.js','framing-fold91.js']);
 const modules=fs.readdirSync(path.join(dir,'source')).filter(n=>n.endsWith('.js')&&!excluded.has(n)).map(n=>({n,s:fs.readFileSync(path.join(dir,'source',n),'utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').trim()})).map(x=>({...x,pos:html.indexOf(x.s)})).filter(x=>x.pos>=0).sort((a,b)=>a.pos-b.pos);
 for(const {n,s} of modules){try{vm.runInContext(s,ctx,{filename:n});}catch(e){throw Error(n+': '+e.stack);}}
 return {ctx,seed,run:(s,arg)=>{ctx.argument=arg;return vm.runInContext(s,ctx);}};
}
module.exports={context};
if(require.main===module){
 const a=context(root);console.log('Calculation modules loaded');
 a.run(fs.readFileSync(path.join(root,'source/tests/loading115-browser.js'),'utf8'));
 const result=a.run('loading115Tests()');console.log(result.passed.length+' existing load assertions passed');
 const demo=fs.readdirSync(path.join(root,'示例模型/RC_同层2m_StructuralZone_Demo')).find(n=>n.endsWith('.framing.json'));
 const p=JSON.parse(fs.readFileSync(path.join(root,'示例模型/RC_同层2m_StructuralZone_Demo',demo),'utf8'));
 const out=a.run("(()=>{Engine.validate(argument);return Loading.run(argument,Engine.generate(argument),'B')})()",p);
 assert.equal(out.trusses[0].status,'OK',out.trusses[0].fail.join('; '));
 console.log('Same-floor demo:',out.trusses[0].status,out.trusses[0].calculation.reactions);
 const passed=[];
 const near=(x,y)=>assert(Math.abs(x-y)<1e-6*Math.max(1,Math.abs(y)),`${x} != ${y}`);
 const run=q=>a.run("Loading.run(argument,Engine.generate(argument),'B')",q);
 const calc=out.trusses[0].calculation;
 for(const [i,id]of ['L','R'].entries())for(const floor of [1,2,3]){
  const c=out.rows.find(x=>x.floor===floor&&x.id===id&&x.kind==='COL');
  near(c.loading.dead,calc.reactions.dead[i]);near(c.loading.live,calc.reactions.live[i]);assert(c.truss109.includes('TT1'));
 }
 passed.push('Same-floor physical G/Q reaches all lower columns exactly once');
 assert(!out.rows.some(x=>x.kind==='TB'&&x.floor===3));
 passed.push('Replaced TB is excluded from loading and checks');
 for(const [name,mutate]of Object.entries({
  tooDeep:q=>q.transferTrusses[0].structuralDepth=2001,
  tooShallow:q=>q.transferTrusses[0].structuralDepth=100,
  missingSupport:q=>q.transferTrusses[0].supportA='missing',
  duplicate:q=>q.transferTrusses.push({...structuredClone(q.transferTrusses[0]),id:'TT2',name:'TT2'}),
  opening:q=>q.types.F03.opening['0,0']=true,
  directTBLoad:q=>q.explorer.members['3|TB|1,3|13,3']={extraDead:10}
 })){
  const q=structuredClone(p);mutate(q);const o=run(q);assert(o.trusses.some(t=>t.status==='INPUT REQUIRED'),name);
  const jobs=a.run("TrussReports109.jobs(argument,Engine.generate(argument),'B',false)",q);assert(jobs.issues.length,name+' export blocks incomplete design');passed.push(name+' is blocked');
 }
 const two=JSON.parse(fs.readFileSync(path.join(root,'示例模型/S460_两层转换桁架.framing.json'),'utf8'));
 const twoOut=run(two);assert.equal(twoOut.trusses[0].status,'OK');
 for(const c of twoOut.rows.filter(x=>x.kind==='COL'&&x.floor===2)){near(c.loading.dead,0);near(c.loading.live,0);}
 passed.push('Two-storey truss bypasses intermediate columns');
 const jobs=a.run("TrussReports109.jobs(argument,Engine.generate(argument),'B',false)",p);assert.equal(jobs.batches.length,1);assert.equal(jobs.issues.length,0);
 const job=jobs.batches[0];assert(Object.values(job.expected).reduce((n,s)=>n+Object.keys(s).length,0)>400);assert(job.reportPages.length);passed.push('Standalone workbook contains formula comparisons and solution pages');
 const dir=path.join(__dirname,'excel143');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'job.json'),JSON.stringify({...job,fingerprint:'E2.143-integration',preview:true}));
 const disabled=structuredClone(p);disabled.transferTrusses[0].enabled=false;const disabledOut=run(disabled);assert.equal(disabledOut.trusses.length,0);assert(disabledOut.rows.some(x=>x.kind==='TB'));passed.push('Disabled truss restores original TB computation');
 const roundtrip=a.run('Engine.validate(JSON.parse(JSON.stringify(argument)))',p);assert.deepEqual(JSON.parse(JSON.stringify(roundtrip.transferTrusses)),p.transferTrusses);passed.push('Project serialization retains complete truss inputs');
 fs.writeFileSync(path.join(__dirname,'integration143-result.json'),JSON.stringify({passed},null,2));console.log(passed);
 const baseline=process.env.FRAMING_BASELINE_DIR;
 if(baseline){
  const b=context(path.resolve(baseline));
  const snapshot=`(()=>{const p=argument,r=Engine.generate(p);return {geometry:r,A:Loading.run(p,r,'A').rows,B:Loading.run(p,r,'B').rows,issues:Loading.run(p,r,'B').issues,reports:[...ReportContent.framing(p,r),...ReportContent.references(p,r)]};})()`;
  for(const [name,project] of Object.entries({seed:b.seed,...result.projects})){
   const before=JSON.parse(JSON.stringify(b.run(snapshot,structuredClone(project)))),after=JSON.parse(JSON.stringify(a.run(snapshot,structuredClone(project))));
   assert.deepEqual(after,before,name+' must preserve E2.142 geometry, loads and reports');console.log('E2.142 unchanged:',name);
  }
 }
}
