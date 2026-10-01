// Floor names are labels; stable model indices continue to own geometry and loads.
const FloorLevels=(()=>{
 const presets=Object.freeze([...Array.from({length:10},(_,i)=>'B'+(10-i)+'/F'),'G/F',...Array.from({length:100},(_,i)=>(i+1)+'/F')]);
 const name=(p,f)=>p.elevationLevels?.names?.[f]||(f===0?'模型底':f+'/F');
 const rank=s=>{s=String(s).trim().toUpperCase();const b=s.match(/^B([1-9]\d*)(?:\/?F)?$/);if(b)return -Number(b[1]);if(s==='G/F')return 0;const a=s.match(/^([1-9]\d*)\/F$/);return a?Number(a[1]):null;};
 const isBasement=s=>{const r=rank(s);return r!==null&&r<0;};
 const basementNames=p=>Array.from({length:p.total+1},(_,f)=>name(p,f)).filter(isBasement);
 const managed=p=>p.elevationLevels?.basementFromNames===true||basementNames(p).length>0;
 const basement=p=>managed(p)?(basementNames(p).length?'Yes':'No'):null;
 const range=(p,lo,hi=lo)=>name(p,lo)+(lo===hi?'':'–'+name(p,hi));
 function base(p){
  if(p.elevationLevels)return p.elevationLevels.base??null;
  const roof=['B','D'].map(f=>p.overall?.faces?.[f]?.input?.height).find(v=>typeof v==='number'&&Number.isFinite(v));
  return roof===undefined?null:+(roof-Engine.floors(p).reduce((s,f)=>s+f.h,0)).toFixed(9);
 }
 function setBase(p,value){
  if(value!==null&&(!Number.isFinite(value)||Math.abs(value)>10000))throw Error('模型底 mPD 须为 −10000 至 10000 的有效数字');
  p.elevationLevels={...p.elevationLevels,base:value,names:{...p.elevationLevels?.names}};
 }
 function validateNames(p,rows){
  if(rows.length!==p.total+1)throw Error('楼层名称须对应全部模型层');
  const seen=new Set();let previous=null;
  return Object.fromEntries(rows.map((row,f)=>{
   const value=String(typeof row==='string'?row:row.name??'').trim();
   if(!value||value.length>40)throw Error('请为'+(f?'模型第 '+f+' 层':'模型底')+'选择名称');
   const key=value.toUpperCase();if(seen.has(key))throw Error('楼层名称重复：'+value);seen.add(key);
   const current=rank(value);if(current!==null){if(previous!==null&&current<=previous)throw Error('楼层须从下往上排列：B10/F … B1/F、G/F、1/F … 100/F');previous=current;}
   return [f,value];
  }));
 }
 function syncBasement(p){
  const value=basement(p);if(value===null)return;
  p.overall??={version:1,faces:{}};p.overall.faces??={};
  for(const face of ['B','D']){
   const q=p.overall.faces[face]??={input:Object.assign(Overall.normalize(null,face),{leftQ:null,rightQ:null})};
   q.input??=Object.assign(Overall.normalize(null,face),{leftQ:null,rightQ:null});
   if(q.input.basement!==value){q.input.basement=value;delete q.committed;delete q.attempt;delete q.error;}
  }
 }
 function applyNames(p,rows){
  const names=validateNames(p,rows);
  p.elevationLevels={base:base(p),...p.elevationLevels,names,basementFromNames:true};
  syncBasement(p);
 }
 function sequence(first,count){const start=rank(first);if(start===null||start< -10||!Number.isInteger(count)||count<1||count>501)throw Error('请选择 B10/F 或以上的有效起始层');return Array.from({length:count},(_,i)=>{const n=start+i;return n<0?'B'+(-n)+'/F':n===0?'G/F':n+'/F';});}
 function sequenceStart(p){if(p.elevationLevels?.sequenceStart)return p.elevationLevels.sequenceStart;const baseName=p.elevationLevels?.names?.[0];return rank(baseName)!==null?baseName:'';}
 function setSequence(p,first){const rows=sequence(first,p.total+1);applyNames(p,rows);p.elevationLevels.sequenceStart=first;}
 return {sequenceStart,setSequence,presets,name,rank,isBasement,basementNames,managed,basement,range,validateNames,applyNames,syncBasement,sequence,base,setBase};
})();
