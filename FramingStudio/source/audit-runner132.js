// Cooperative batches preserve the synchronous solver's order and yield to the UI.
const AuditRunner132=(()=>{
 // With unchanged global/load inputs, a Framing edit cannot affect floors
 // above the highest changed Framing/model. Truss jobs conservatively rebuild.
 function scope228(p,r,previous){
  const q=Engine.clone(p);delete q.types;if(q.explorer)for(const k of ['selected','reportA','reportB'])delete q.explorer[k];
  const scope=JSON.stringify(q),types=new Map(Object.entries(p.types).map(([k,v])=>[k,JSON.stringify(v)])),floors=new Map(r.floors.map(f=>[f.n,JSON.stringify([f,Engine.floorModel(r,f.n)])]));
  let ceiling=p.total;
  if(previous?.scope===scope&&!p.transferTrusses?.length)ceiling=Math.max(0,...r.floors.filter(f=>previous.types.get(f.type)!==types.get(f.type)||previous.floorKeys.get(f.n)!==floors.get(f.n)).map(f=>f.n));
  return {scope,types,floorKeys:floors,ceiling,previousFloors:previous?.floors||new Map(),previousAreas:previous?.areas||new Map(),floors:new Map(),areas:new Map(),reusedFloors:0};
 }
 async function run(p,r,{cancelled=()=>false,progress=()=>{},beamSummary=null,includePassedBeams=false,recommendSB=false,retainOutput226=false,reuse228=null,capture228=false}={}){
  const cache228=capture228?{...scope228(p,r,reuse228),design:new Map(reuse228?.design||[]),deflection:new Map(reuse228?.deflection||[]),previous:reuse228?.members||new Map(),members:new Map(),calls:0,hits:0,changed:0,unchanged:0,removed:0}:null;
  if(cache228)cache228.trial228=(p,r)=>({...scope228(p,r,cache228),design:cache228.design,primaryProject:p,calls:0,hits:0});
  const steps=Loading.auditSteps(p,r,beamSummary,includePassedBeams,recommendSB,retainOutput226,cache228);let processed=0,lastPaint=0;
  try{while(true){if(cancelled())return null;const start=performance.now();let step;
   do{step=steps.next();if(step.done){if(cancelled())return null;if(!cache228)return step.value;for(const map of [cache228.design,cache228.deflection])while(map.size>20000)map.delete(map.keys().next().value);delete cache228.previous;delete cache228.previousFloors;delete cache228.previousAreas;delete cache228.primaryProject;delete cache228.trial228;return {...step.value,cache228,stats228:{changed:cache228.changed,unchanged:cache228.unchanged,removed:cache228.removed,calls:cache228.calls,hits:cache228.hits,reusedFloors:cache228.reusedFloors}};}processed++;}while(performance.now()-start<12&&!cancelled());
   const now=performance.now();if(now-lastPaint>=80){progress({...step.value,processed});lastPaint=now;}
   await new Promise(resolve=>setTimeout(resolve,0));
  }}finally{steps.return();}
 }
 return {run};
})();
