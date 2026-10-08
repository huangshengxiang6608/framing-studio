// Synthetic offset-column cases. No private project or live browser state.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {context}=require('../../verification/integration143.cjs');
const c=context(path.resolve(__dirname,'../..'));
c.run(fs.readFileSync(path.join(__dirname,'loading115-browser.js'),'utf8'));
const result=c.run(`(()=>{
 const passed=[],check=(v,s)=>{if(!v)throw Error(s);passed.push(s);},near=(a,b,s)=>check(Math.abs(a-b)<1e-7,s+' ('+a+', '+b+')');
 const base=loading115Tests().projects.tc;
 function fixture(reference,reverse=false,vertical=false){
  const p=Engine.clone(base);p.total=2;p.name='Offset column centre regression';delete p.types.F3;p.groups=p.groups.slice(0,2);p.groups[1].end='顶层';p.explorer={};
  p.axes={x:[{id:'1',gap:0},{id:'2',gap:52}],y:[{id:'A',gap:0},{id:'B',gap:52}]};
  const xy=(x,y)=>vertical?{x:y,y:x}:{x,y};
  p.types.F1.columns=[{id:'L',...xy(20.25,13),b:500,d:500,on:true,status:'上下贯通'},{id:'R',...xy(50.25,13),b:500,d:500,on:true,status:'上下贯通'}];
  p.types.F1.beams=[{id:'TB1',kind:'MB',a:xy(reverse?50.25:20.25,13),z:xy(reverse?20.25:50.25,13),b:600,d:350,on:true}];
  p.types.F1.slabVoids=[{x0:0,x1:52,y0:0,y1:52}];
  p.types.F2.columns=[{id:'TC',...xy(reference,13),b:1500,d:1500,on:true,status:'上下贯通'}];
  p.types.F2.columnPlacements=[{key:'id:TC',...xy(24.25,13)}];
  Engine.validate(p);Loading.init(p);for(let f=1;f<=2;f++)LoadData.setFloor(p,f,{usage:'Dormitory',dl:10,sdl:0,ll:2});let r=Engine.generate(p),up=Engine.floorModel(r,2).columns[0],token=Loading.token('COL',up);
  p.explorer.members['2|'+token]={sectionAAreaOverrides115:{2:20}};
  return p;
 }
 const projects=[];
 for(const reference of [25,24.5])for(const reverse of [false,true])for(const vertical of [false,true]){
  const p=fixture(reference,reverse,vertical),r=Engine.generate(p),m=Engine.floorModel(r,1),up=Engine.floorModel(r,2),col=up.columns[0],b=m.beams[0],point=Loading.columnLoadPoint(p,up,col);
  near(Engine.columnReference(p,up.key,col)[vertical?1:0],reference,'grid reference preserved');
  near(point[vertical?1:0],24.25,'load uses physical centre');
  check(b.kind==='TB'&&b.autoTransfer,'automatic TB promotion uses same centre');
  check(TransferMarkers83.landing(p,r,1)[0]?.beam.id===b.id,'landing marker matches target');
  near(Loading.contact(point,b).x,reverse?26:4,'station measured from actual beam start');
  const rr=Loading.run(p,r,'B').rows.find(x=>x.floor===1&&x.member.id==='TB1'),land=rr.loading.points.find(x=>x.label.endsWith(' TC'));
  near(land.x,reverse?26:4,'actual solver point station');near(land.g,200,'tributary area dead load 20 x 10');near(land.q,40,'tributary area live load 20 x 2');
  const area=Reports.columnA(p,{floor:2,token:Loading.token('COL',col),id:'TC'},r);
  near(area.rows.reduce((v,x)=>v+x.area,0),20,'column area method preserved');
  const expected=40*(reverse?26:4)/30;
  near(rr.actions.live.right,expected,'receiver reaction uses corrected lever arm');
  const reopened=JSON.parse(JSON.stringify(p)),again=Loading.run(reopened,Engine.generate(reopened),'B').rows.find(x=>x.floor===1&&x.member.id==='TB1');
  near(again.loading.points.find(x=>x.label.endsWith(' TC')).x,land.x,'save/reopen preserves centre');
  if(!reverse&&!vertical)projects.push(p);
 }
 return {passed,projects};
})()`);
assert.equal(result.projects.length,2);
if(require.main===module)console.log(result.passed.length+' column-centre assertions passed');
module.exports=result;
