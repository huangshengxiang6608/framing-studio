const fs=require('fs'),path=require('path');
const output=path.resolve(process.argv[2]);fs.mkdirSync(output,{recursive:true});
const app=path.resolve(__dirname,'../..'),S=require(app+'/source/checks.js'),F=require(app+'/source/excel-formulas.js');
const cases=[],errors=[];
function add(id,o,method){
 try{
  const out=S[method](o),m=S.machine(out.kind||'COL',out.inputs),kind=out.kind||'COL',expected={};
  for(const [r,c]of Object.entries(F[kind].cells))if(c.formula&&!Object.hasOwn(out.inputs,r)){
   try{expected[r]=m.get(r)}catch(e){expected[r]={error:e.message}}
  }
  cases.push({id,kind,sheet:F[kind].sheet,request:o,inputs:out.inputs,expected,status:out.status,fail:out.fail,autoFailed:out.autoFailed||false});
 }catch(e){errors.push({id,request:o,error:e.message})}
}
for(const kind of ['MB','SB','TB','CB']){
 for(const [n,b,h,L,M,V,T]of [
  ['light',300,700,6,120,80,0],['medium',500,900,9,800,500,0],
  ['heavy',1800,3200,30,70000,22000,0],['torsion',600,1000,8,1200,600,50],
  ['failure',250,400,13,1200,500,0],['zero',400,800,5,0,0,0]])
  for(const fire of [1,2,4])add(`${kind}-${n}-f${fire}`,{kind,b,h,L,M,V,T,fire,fcu:45,acceptance261:'rc'},'beam');
 const base={kind,b:800,h:1400,L:10,M:1800,V:500,T:0,fire:2,fcu:60,acceptance261:'rc'};
 for(const [n,steel]of Object.entries({unequal:{C40:4,D40:20,C41:2,D41:16,C44:6,D44:32,C45:3,D45:25},eight:{C40:4,D40:16,C44:4,D44:25,C45:4,D45:25,C46:4,D46:25,C47:4,D47:25,C114:4,D114:25,C115:4,D115:25,C116:4,D116:25,C117:4,D117:25}}))
  add(`${kind}-manual-${n}`,{...base,steel:{...steel,E58:6,G58:10,H58:150,E76:2,G76:10,H76:250}},'beam');
}
for(const kind of ['SLAB','CS'])for(const [n,L,h,dl,sdl,ll]of [['light',kind==='CS'?1:3,200,0,1,3],['medium',kind==='CS'?2:5,300,3,2,5],['failure',kind==='CS'?5:10,150,5,3,8],['deep',kind==='CS'?3:8,600,2,2,10]])
 for(const fire of [1,2,4])for(const fcu of [45,60])add(`${kind}-${n}-f${fire}-c${fcu}`,{kind,L,h,dl,sdl,ll,fire,fcu},'slab');
for(const system of ['Braced','Unbraced'])for(const [n,b,h,height,dead,live]of [['light',500,600,3,1500,500],['heavy',1500,1500,4.5,23000,7000],['slender',500,500,10,1000,500],['overload',500,500,3,10000,5000]])
 for(const fcu of [45,60])add(`COL-${system}-${n}-${fcu}`,{id:'AC',b,h,height,dead,live,factor:1,ratio:2,projectFactor:1,fcu,system},'column');
fs.writeFileSync(path.join(output,'cases.json'),JSON.stringify({cases,errors},null,2));
console.log(JSON.stringify({cases:cases.length,byKind:Object.fromEntries(Object.keys(F).map(k=>[k,cases.filter(c=>c.kind===k).length])),errors}));

fs.writeFileSync(path.join(output,'formulas.json'),JSON.stringify(F));
