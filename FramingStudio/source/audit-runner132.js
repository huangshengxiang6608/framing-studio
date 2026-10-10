// Cooperative batches preserve the synchronous solver's order and yield to the UI.
const AuditRunner132=(()=>{
 async function run(p,r,{cancelled=()=>false,progress=()=>{},beamSummary=null,includePassedBeams=false,recommendSB=false,retainOutput226=false}={}){
  const steps=Loading.auditSteps(p,r,beamSummary,includePassedBeams,recommendSB,retainOutput226);let processed=0,lastPaint=0;
  try{while(true){if(cancelled())return null;const start=performance.now();let step;
   do{step=steps.next();if(step.done){if(cancelled())return null;return step.value;}processed++;}while(performance.now()-start<12&&!cancelled());
   const now=performance.now();if(now-lastPaint>=80){progress({...step.value,processed});lastPaint=now;}
   await new Promise(resolve=>setTimeout(resolve,0));
  }}finally{steps.return();}
 }
 return {run};
})();
