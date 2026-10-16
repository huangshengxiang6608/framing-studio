const assert=require('assert/strict'),{context}=require('./audit-performance247.cjs'),c=context();
if(process.env.LINK_BASELINE267)c.run(require('fs').readFileSync(process.env.LINK_BASELINE267,'utf8').replace('const SectionB=','const SectionB266='));
const result=c.run(`(()=>{
 const automatic=[],manual=[];
 for(const kind of ['MB','SB','TB','CB']){
  for(const V of [100,500,1000])for(const T of [0,80,150]){
   const input={acceptance261:'rc',kind,L:6,b:400,h:750,fcu:45,cover:40,M:400,V,T},r=SectionB.beam(input);
   automatic.push({kind,V,T,r});
  }
  const input={acceptance261:'rc',kind,L:6,b:400,h:750,fcu:45,cover:40,M:400,V:100,T:0},base=SectionB.beam(input);
  for(const f of [58,76])for(const [field,value]of [['G',8],['G',10],['H',99],['H',100],['H',150],['H',200],['H',250],['H',251],['H',300]]){
   const steel={...base.steel,[field+f]:value},snapshot=JSON.stringify(steel),r=SectionB.beam({...input,steel});
   manual.push({kind,f,field,value,r,baseline:typeof SectionB266==='undefined'?null:SectionB266.beam({...input,steel}),rc:Loading.auditChecks205({}, {kind,result:r}).b,unchanged:snapshot===JSON.stringify(steel)});
  }
 }
 return {automatic,manual};
})()`);
for(const {r,kind,V,T}of result.automatic){
 for(const f of [58,76]){assert(r.steel['G'+f]>=10,kind);assert(r.steel['H'+f]>=100&&r.steel['H'+f]<=250,`${kind} ${V}/${T}`);}
}
for(const {r,baseline,rc,field,value,unchanged}of result.manual){
 assert(unchanged,'Never rewrite existing manual reinforcement');
 if(baseline)assert.deepEqual(r.values,baseline.values,'Same inputs retain every original calculated value');
 const invalid=field==='G'?value<10:value<100||value>250;
 const policy=r.fail.filter(s=>s.includes('箍筋直徑')||s.includes('箍筋間距'));
 assert.equal(policy.length>0,invalid);
 if(invalid){assert.equal(r.status,'NOT OK');assert.equal(rc.status,'NOT OK');}
}
console.log('PASS 36 automatic cases and 72 manual cases: link diameter >=10, spacing 100–250, invalid legacy inputs preserved and fail Summary/Member RC checks');
