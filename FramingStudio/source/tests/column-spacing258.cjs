// E2.288: minimum physical centre spacing with retained supplemental column axes.
const path=require('node:path'),assert=require('node:assert/strict');
const {context}=require('../../verification/integration143.cjs');
const c=context(path.resolve(__dirname,'../..'));
console.log(c.run(`(()=>{
 const ok=(v,m)=>{if(!v)throw Error(m)},passed=[];
 const fixture=()=>({format:'framing-app',version:1,name:'Minimum Spacing',total:3,axes:{x:[{id:'1',gap:0},{id:'2',gap:2},{id:'3',gap:6},{id:'4',gap:8}],y:[{id:'A',gap:0},{id:'B',gap:2},{id:'C',gap:5},{id:'D',gap:7}]},defaults:{cb:500,cd:500,gap:3000,direction:'X',mb:300,sb:300,tb:600,tbd:1200,slab:200,wall:300},groups:[{end:2,h:4,type:'F1',sh:600,min:0},{end:'顶层',h:4,type:'F2',sh:600,min:0}],types:Object.fromEntries(['F1','F2'].map(k=>[k,{mode:'auto',autoBeams101:false,building:Object.fromEntries(Array.from({length:9},(_,i)=>[Math.floor(i/3)+','+i%3,true])),opening:{},columns:[],walls:[],beams:[],suppressed:[]}]))});
 const shape=m=>JSON.stringify(m.columns.map(c=>[c.id,Engine.columnPositionKey(c),Engine.columnRect(c)]));
 const verify=(p,m)=>{const t=p.types[m.key];for(const a of m.columns)for(const b of m.columns){if(a===b)continue;const ar=Engine.columnRect(a),br=Engine.columnRect(b);for(const [d,c,k]of [['x','y','anchorY'],['y','x','anchorX']])if(t.columnSpacing258?.[d]!=null&&(a[k]!==undefined&&a[k]===b[k]||Math.abs(ar[c]-br[c])<1e-6))ok(Math.abs(ar[d]-br[d])>=t.columnSpacing258[d]-1e-6,'Actual centre minimum '+a.id+'/'+b.id);}};
 {const p=fixture(),r=Engine.generate(p),before=shape(r.models.F1),other=shape(r.models.F2),raw=JSON.stringify(p.axes),records=r.models.F1.columns;
  ok(records.length===16,'blank follows all original intersections');p.types.F1.columnSpacing258={x:6,y:5};const next=Engine.generate(p);
  ok(next.models.F1.columns.length===9,'minimum filters dense grid candidates');ok(shape(next.models.F1)===shape(Engine.floorModel(next,2)),'shared floors');ok(shape(next.models.F2)===other,'other framing unchanged');verify(p,next.models.F1);
  ok(JSON.stringify(p.axes)===raw,'architectural grid unchanged');ok(Engine.columnAxes(p,'x','F1').length===4&&Engine.columnAxes(p,'y','F1').length===4,'no inserted or deleted gridlines');
  for(const a of next.models.F1.columns){const old=records.find(b=>Engine.columnPositionKey(a)===Engine.columnPositionKey(b));ok(old&&old.id===a.id&&old.b===a.b&&old.d===a.d,'retained ids/sections');ok(!a.spacingAdded258,'no supplemental spacing columns');}
  delete p.types.F1.columnSpacing258;ok(shape(Engine.generate(p).models.F1)===before,'clear restores gridline layout');
 }passed.push('Blank gridline placement; independent X/Y filtering; actual centres; unchanged axes, ids, sections, other Framing and shared floors');
 {const p=fixture();p.types.F1.columnSpacing258={x:6};let m=Engine.generate(p).models.F1;ok(m.columns.length===12,'unset Y does not filter');verify(p,m);p.types.F1.columnSpacing258={y:5};m=Engine.generate(p).models.F1;ok(m.columns.length===12,'unset X does not filter');verify(p,m);
  p.types.F1.columnGrid={targetX:4,targetY:5,x:[1,5,9],y:[1,6,11]};p.types.F1.columnSpacing258={x:4,y:5};m=Engine.generate(p).models.F1;ok(m.columns.length===9,'equality allowed');verify(p,m);
  p.types.F1.columnSpacing258.x=4.001;m=Engine.generate(p).models.F1;ok(m.columns.length===6,'below minimum excluded');verify(p,m);
  delete p.types.F1.columnSpacing258;ok(Engine.generate(p).models.F1.columns.length===9,'blank retains independent column grid');
 }passed.push('One direction, exact equality, independent grid, strict minimum');
 {const p=fixture(),t=p.types.F1;t.columnGrid={targetX:4,targetY:5,x:[1,5,9],y:[1,6,11]};t.columnSpacing258={x:3.5};t.columnAxisPositions=[{key:'axis:@cg:x:1|@cg:y:6',position:'right'}];
  const m=Engine.generate(p).models.F1;ok(m.columns.some(c=>c.anchorX==='@cg:x:5'&&c.anchorY==='@cg:y:6'),'3.75 m centre gap passes despite 3.25 m clear gap');verify(p,m);
  t.columnSpacing258.x=4;const m2=Engine.generate(p).models.F1;ok(!m2.columns.some(c=>c.anchorX==='@cg:x:5'&&c.anchorY==='@cg:y:6'),'3.75 m physical centres fail despite 4 m gridlines');verify(p,m2);
  t.columnAxisPositions.push({key:'axis:@cg:x:5|@cg:y:6',position:'center'});let rejected=false;try{Engine.generate(p);}catch(e){rejected=/小於最小/.test(e.message);}ok(rejected,'fixed manual position conflict blocks application');
 }passed.push('Centre-to-centre, not clear spacing or reference grid spacing; explicit position conflict rejected');
 {const p=fixture();p.types.F1.columns=[{id:'C1',x:2,y:7,b:500,d:500,on:true,autoAdded:true,status:'上下贯通'}];p.types.F1.columnSpacing258={x:6,y:5};const m=Engine.generate(p).models.F1;ok(m.columns.some(c=>c.id==='C1'),'manual addition preserved');verify(p,m);
  p.types.F1.mode='manual';const before=shape(Engine.generate(p).models.F1);p.types.F1.columnSpacing258={x:500,y:500};ok(shape(Engine.generate(p).models.F1)===before,'manual mode stores setting only');ok(shape(Engine.generate(JSON.parse(JSON.stringify(p))).models.F1)===before,'save/load');
 }passed.push('Manual additions protected; manual mode unchanged; persistence');
 {const p=fixture(),t=p.types.F1;t.columnSpacing258={x:6,y:5};t.noColumnZones=[{x0:7,x1:9,y0:6,y1:8}];t.opening={'1,1':true};t.suppressedColumns=[{ax:'1',ay:'A'}];t.columnSizes=[{ax:'3',ay:'D',b:700,d:600}];const records=JSON.stringify([t.opening,t.noColumnZones,t.suppressedColumns,t.columnSizes]);const m=Engine.generate(p).models.F1;verify(p,m);ok(!m.columns.some(c=>c.anchorX==='1'&&c.anchorY==='A'),'suppression retained');ok(!m.columns.some(c=>c.x>7&&c.x<9&&c.y>6&&c.y<8),'exclusion retained');ok(JSON.stringify([t.opening,t.noColumnZones,t.suppressedColumns,t.columnSizes])===records,'geometry records preserved');}
 passed.push('Opening, exclusions, deleted columns and individual sizes preserved');
 {const p=fixture(),before=shape(Engine.generate(p).models.F1);p.groups[0].min=10;p.types.F1.minColumnSpacing=10;ok(shape(Engine.generate(p).models.F1)===before,'blank ignores hidden legacy filters');p.types.F1.columnSpacing258={x:0.001,y:0.001};let rejected=false;try{Engine.generate(p);}catch(e){rejected=/40/.test(e.message);}ok(rejected,'excessive supplemental grid rejected');}
 passed.push('Blank uses gridlines even with legacy hidden limits; excessive supplemental grid rejected');
 {const p=fixture();p.axes.x=[{id:'1',gap:0},{id:'2',gap:8},{id:'3',gap:8}];p.axes.y=[{id:'A',gap:0},{id:'B',gap:7},{id:'C',gap:7}];for(const t of Object.values(p.types))t.building={'0,0':true,'1,0':true,'0,1':true,'1,1':true};const old=Engine.generate(p).models.F1.columns;
  p.types.F1.columnSpacing258={x:3,y:3};const m=Engine.generate(p).models.F1;ok(m.columns.length===25,'supplemental columns retained');ok(Engine.columnAxes(p,'x','F1').map(a=>a.v).join(',')==='0,4,8,12,16','8 m with 3 m minimum becomes 4+4');verify(p,m);
  for(const c of old){const next=m.columns.find(n=>n.anchorX===c.anchorX&&n.anchorY===c.anchorY);ok(next&&next.id===c.id,'original ids retained when adding axes');}
  const supplemental=m.columns.find(c=>c.spacingAdded258);p.types.F1.suppressedColumns=[{ax:supplemental.anchorX,ay:supplemental.anchorY}];ok(!Engine.generate(p).models.F1.columns.some(c=>c.anchorX===supplemental.anchorX&&c.anchorY===supplemental.anchorY),'deleted supplemental column retained');
 }passed.push('Supplemental axes/columns retained; floor subdivision respects minimum; original ids and deleted supplemental columns retained');
 for(const invalid of [0,-1,NaN,Infinity,501,'6']){const p=fixture();p.types.F1.columnSpacing258={x:invalid};let rejected=false;try{Engine.generate(p);}catch{rejected=true;}ok(rejected,'invalid minimum rejected');}passed.push('Invalid values rejected');
 return passed.join('\\n');})()`));
