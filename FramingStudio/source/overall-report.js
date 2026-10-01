const OverallReport=(()=>{
 const O=Overall,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"\'":'&#39;'}[c]));
 function sectionA(){return '<section class="overall-copy"><h2>Overall Check · 原 Excel 抄</h2><p>由原 Excel 比较 B、D 两面并生成控制面的抄。</p><button type="button" data-excel-open="Overall">填写并打开原 Excel</button></section>';}
 function assessment(p){const states={},inputs={};for(const f of ['B','D']){try{inputs[f]=OverallGeometry.input(p,f);states[f]=OverallGeometry.calculate(inputs[f],f);}catch(e){states[f]={state:'INPUT REQUIRED: '+e.message};}}const cmp=O.compareFaces(states.B,states.D),v=cmp[23],faces=['B','D'].includes(v)?[v]:['Equal','Both: no resistance'].includes(v)?['B','D']:[];return {states,inputs,cmp,faces};}
 function comparison(p,a=assessment(p)){const {states,cmp}=a,b=states.B,d=states.D,complete=b.state==='CALCULATED'&&d.state==='CALCULATED';
  const display=(v,row)=>v===undefined||v===null?'—':O.num(v)?O.format(v,[12,13].includes(row)?'#,##0.00':'0.000'):String(v),items=[[8,'Basement'],[9,'Wind mode'],[10,'Wind review'],[12,'Wind shear V (kN)'],[13,'Wind moment at O (kN·m)'],[14,'Sliding FOS'],[15,'Overturning FOS'],[16,'Uplift FOS'],[20,'Sliding utilisation'],[21,'Overturning utilisation'],[22,'Uplift utilisation'],[23,'Maximum assessed utilisation'],[24,'Governing check'],[25,'Comparison scope']];
  let h='<section class="ov-comparison"><h3 class="ov-copy-heading">B / D 比较 · 控制面</h3><p class="ov-comparison-note">采用原 Excel 比较规则：利用率 = 所需 FOS ÷ 实际 FOS；利用率越大越不利。</p>';
  for(const f of ['B','D'])if(states[f].state!=='CALCULATED')h+='<p class="ov-copy-warning">'+f+' 面：'+esc(states[f].state)+'</p>';
  h+='<div class="ov-scroll"><table class="ov-compare-table"><thead><tr>'+['比较项目','B 面结果','B 要求','D 面结果','D 要求','控制面 / 说明'].map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>';
  for(const [r,label] of items){const note=cmp[r]??'',vals=[label,b.state==='CALCULATED'?display(b.results[r],r):'待补',display(b.criteria?.[r],r),d.state==='CALCULATED'?display(d.results[r],r):'待补',display(d.criteria?.[r],r),display(note,r)];h+='<tr data-comparison-row="'+r+'"'+([23,24].includes(r)?' class="ov-compare-summary"':'')+'>'+vals.map((x,i)=>'<'+(i===0?'th scope="row"':'td')+(i===5&&['B','D'].includes(note)?' class="ov-governing"':'')+'>'+esc(x)+'</'+(i===0?'th':'td')+'>').join('')+'</tr>';}
  h+='</tbody></table></div>';const verdict=complete?cmp[23]:null;h+='<p class="ov-comparison-verdict">'+(verdict==='B'||verdict==='D'?'控制面：<strong>'+verdict+' 面</strong>。下方自动采用该面的完整计算。':verdict==='Equal'?'两面最大利用率相同；下方保留 B、D 两面的完整计算。':verdict==='Both: no resistance'?'两面均无抗力；下方保留两面计算，不表示通过。':'<strong>控制面待定</strong>：'+esc(cmp[25]||'待两面资料完整后比较。'))+'</p><p class="ov-comparison-note">'+esc(cmp[25]||'')+' 比较表保留各项目结果；控制面按最大利用率确定，不代表该面在每个项目均较危险。</p></section>';return h;
 }
return {sectionA,comparison,body:sectionA,copy:sectionA,nativeCopy:sectionA,document:sectionA};})();
// Geometry and datum adapter only. Overall's original workbook formulas are unchanged.
const OverallGeometry=(()=>{
 const finite=v=>typeof v==='number'&&Number.isFinite(v);
 function levels(p){const floors=Engine.floors(p),base=FloorLevels.base(p);let z=base;return [{f:0,name:p.elevationLevels?.names?.[0]||'模型底',z:base},...floors.map((f,i)=>{if(z!==null)z=+(z+f.h).toFixed(9);return {f:i+1,name:p.elevationLevels?.names?.[i+1]||((i+1)+'/F'),z,h:f.h,type:f.type};})];}
 function bounds(p,types){const tiles=[...new Set(types)].flatMap(k=>Engine.tiles(p,p.types[k])).filter(t=>t.state!==0);if(!tiles.length)return null;return {x:Math.max(...tiles.map(t=>t.x1))-Math.min(...tiles.map(t=>t.x0)),y:Math.max(...tiles.map(t=>t.y1))-Math.min(...tiles.map(t=>t.y0))};}
 function input(p,face){const n=Overall.normalize(p.overall?.faces?.[face]?.input,face),ls=levels(p),fs=ls.slice(1),grounds=[n.leftEL,n.rightEL].filter(finite),low=grounds.length===2?Math.min(...grounds):null,exposed=fs.filter(f=>f.z===null||low===null||f.z>low),box=bounds(p,exposed.map(f=>f.type)),base=bounds(p,fs.length?[fs[0].type]:[]);if(p.elevationLevels)n.height=ls.at(-1).z;const basement=FloorLevels.basement(p);if(basement!==null)n.basement=basement;
  n.breadth=box?(face==='B'?box.y:box.x):null;n.depth=box?(face==='B'?box.x:box.y):null;
  // Lowest actual framing is the plan source for basement dimensions.
  n.baseBreadth=base?(face==='B'?base.y:base.x):null;n.baseDepth=base?(face==='B'?base.x:base.y):null;return OverallModel.apply(p,face,n);
 }
 function setRoof(p,value){if(value!==null&&!finite(value))throw Error('楼顶 mPD 须为有效数字');const total=Engine.floors(p).reduce((s,f)=>s+f.h,0);p.elevationLevels={...p.elevationLevels,base:value===null?null:+(value-total).toFixed(9),names:{...p.elevationLevels?.names}};}
 function applyLevels(p,rows){FloorLevels.validateNames(p,rows);if(rows.length!==p.total+1||rows.some(r=>!finite(r.z)))throw Error('请填写模型底及每层的 mPD');const names={};for(let i=0;i<rows.length;i++){names[i]=String(rows[i].name|| (i?i+'/F':'模型底')).trim();if(names[i].length>40)throw Error('楼层名称最多 40 字');if(i&&rows[i].z<=rows[i-1].z)throw Error('标高须由下往上递增；请检查 '+names[i]);}const values=Object.fromEntries(rows.slice(1).map((r,i)=>[i+1,{h:+(r.z-rows[i].z).toFixed(9)}]));Engine.applyClearances(p,values);p.elevationLevels={...p.elevationLevels,base:rows[0].z,names,basementFromNames:true};FloorLevels.syncBasement(p);}
 function validate(n,face){return n._autoErrors?.length?n._autoErrors.join('；'):Overall.validate(n,face);}
 function calculate(n,face){const error=validate(n,face);return error?{state:'INPUT REQUIRED: '+error,face}:Overall.calculate(n,face);}
 return {levels,input,bounds,setRoof,applyLevels,validate,calculate};
})();

// Prepare original workbook inputs from actual generated geometry; workbook formulas remain unchanged.
const OverallModel=(()=>{
 const finite=Number.isFinite,eps=1e-8,areaLoad=10;let cacheKey='',cached;
 function planBounds(p,type){const ts=Engine.tiles(p,p.types[type]).filter(t=>t.state!==0);if(!ts.length)return null;const x0=Math.min(...ts.map(t=>t.x0)),x1=Math.max(...ts.map(t=>t.x1)),y0=Math.min(...ts.map(t=>t.y0)),y1=Math.max(...ts.map(t=>t.y1));return {x0,x1,y0,y1,x:x1-x0,y:y1-y0};}
 function union2D(rs){let area=0,mx=0,my=0;const xs=[...new Set(rs.flatMap(r=>[r.x0,r.x1]))].sort((a,b)=>a-b);for(let i=1;i<xs.length;i++){const a=xs[i-1],b=xs[i],intervals=rs.filter(r=>r.x0<b-eps&&r.x1>a+eps).map(r=>[r.y0,r.y1]).sort((u,v)=>u[0]-v[0]);let lo=null,hi=null;const add=()=>{if(lo===null)return;const ar=(b-a)*(hi-lo);area+=ar;mx+=ar*(a+b)/2;my+=ar*(lo+hi)/2;};for(const [y0,y1]of intervals){if(lo===null){lo=y0;hi=y1;}else if(y0<=hi+eps)hi=Math.max(hi,y1);else{add();lo=y0;hi=y1;}}add();}return {area,mx,my};}
 function union3D(boxes,lo,hi){const rs=boxes.filter(b=>b.z1>lo+eps&&b.z0<hi-eps),zs=[...new Set([lo,hi,...rs.flatMap(b=>[Math.max(lo,b.z0),Math.min(hi,b.z1)])])].sort((a,b)=>a-b);let volume=0,mx=0,my=0;for(let i=1;i<zs.length;i++){const a=zs[i-1],b=zs[i],u=union2D(rs.filter(r=>r.z0<b-eps&&r.z1>a+eps));volume+=u.area*(b-a);mx+=u.mx*(b-a);my+=u.my*(b-a);}return {volume,mx,my};}
 // Overall self-weight is floor area times 10 kPa; member checks retain their own loads.
 function geometry(p){
  const key=JSON.stringify({axes:p.axes,defaults:p.defaults,types:p.types,groups:p.groups,total:p.total,alignColumns:p.alignColumns,localHeights96:p.localHeights96});
  if(key===cacheKey&&cached)return cached;
  const r=Engine.generate(p),rects=[];
  const rows=r.floors.map((f,i)=>{
   const m=Engine.floorModel(r,f);
   if(m.issues.some(x=>x.id==='SLAB'&&x.msg.includes('分隔过于复杂')))throw Error('楼板面积无法完整读取，请简化板块分段');
   const rs=m.slabs.flatMap(s=>s.rects);
   if(rs.some(q=>![q.x0,q.x1,q.y0,q.y1].every(finite)||q.x1<=q.x0||q.y1<=q.y0))throw Error('楼板范围无效，无法统计面积');
   for(const q of rs)rects.push(q);
   const u=union2D(rs);
   return {...u,floor:i+1,type:f.type,weight:u.area*areaLoad};
  });
  const area=rows.reduce((s,x)=>s+x.area,0),mx=rows.reduce((s,x)=>s+x.mx,0),my=rows.reduce((s,x)=>s+x.my,0),foot=planBounds(p,r.floors[0]?.type);
  if(!(area>eps)||!foot)throw Error('模型没有可统计的楼板面积');
  const x0=rects.reduce((s,q)=>Math.min(s,q.x0),Infinity),x1=rects.reduce((s,q)=>Math.max(s,q.x1),-Infinity),y0=rects.reduce((s,q)=>Math.min(s,q.y0),Infinity),y1=rects.reduce((s,q)=>Math.max(s,q.y1),-Infinity);
  cached={rows,area,areaLoad,weight:area*areaLoad,cx:mx/area,cy:my/area,bounds:{x0,x1,y0,y1,x:x1-x0,y:y1-y0},foot,storeys:r.floors.length};
  cacheKey=key;return cached;
 }
 function wind(p,face,n){const levels=OverallGeometry.levels(p),fs=Engine.floors(p),roof=n.height,base=levels[0].z??(finite(roof)?roof-fs.reduce((s,f)=>s+f.h,0):null);if(!finite(base)||!finite(n.leftEL)||!finite(roof))throw Error('逐层风：请先填写楼层／楼顶 mPD 及左地面标高');if(n.leftEL<base-eps)throw Error('逐层风：左地面低于模型底，请补齐模型楼层或切换手动逐层输入');if(n.leftEL>=roof)throw Error('逐层风：楼顶必须高于左地面');let bot=base;const rows=[];for(let i=0;i<fs.length;i++){const top=bot+fs[i].h,lo=Math.max(bot,n.leftEL),box=planBounds(p,fs[i].type);if(top>lo+eps){if(!box)throw Error(FloorLevels.name(p,i+1)+' 没有有效建筑范围');rows.push({floor:i+1,name:levels[i+1].name,lo,top,height:top-lo,breadth:face==='B'?box.y:box.x});}bot=top;}if(rows.length>100)throw Error('原 Excel 最多 100 层风输入；请切换手动分段');if(Math.abs(rows.reduce((s,r)=>s+r.height,0)-(roof-n.leftEL))>.001)throw Error('逐层风高度与楼顶减左地面不一致');return rows;}
 function apply(p,face,n){const settings=p.overall?.automation||{},weightAuto=settings.weight!==false,windAuto=settings.wind!==false,errors=[],meta={weightAuto,windAuto};const saved=p.overall?.faces?.[face],raw=saved?.input;meta.legacySurcharges={};for(const k of ['leftQ','rightQ']){const m=Overall.inputs.find(m=>m.key===k),example=face==='D'?m.defaultD:m.default;if(!raw||!Object.prototype.hasOwnProperty.call(raw,k))n[k]=null;else if(finite(example)&&raw[k]===example&&!saved.surchargeConfirmed?.[k]){meta.legacySurcharges[k]=raw[k];n[k]=null;}}
  if(weightAuto){for(const c of ['G','H','I','J'])for(const r of [26,27,28,29,31])n['sw'+c+r]=0;try{const g=geometry(p),o=finite(settings['o'+face])?settings['o'+face]:face==='B'?g.foot.x1:g.foot.y1,cg=face==='B'?g.cx:g.cy,arm=o-cg,D=face==='B'?g.bounds.x:g.bounds.y,B=face==='B'?g.bounds.y:g.bounds.x;if(arm<0)throw Error('模型重心在 O 点外侧，请核对 O 的水平位置');n.swG26=D;n.swG27=B;n.swG28=g.storeys;n.swG29=g.weight/(D*B*g.storeys);n.swG31=arm;meta.weight={...g,rows:g.rows.map(r=>({...r,name:FloorLevels.name(p,r.floor)})),o,arm,D,B,q:n.swG29};}catch(e){errors.push('结构自重：'+e.message);}}
  if(windAuto&&n.mode==='LAYERED'){for(let i=0;i<100;i++)n['layerH'+i]=n['layerB'+i]=null;try{meta.layers=wind(p,face,n);meta.layers.forEach((r,i)=>{n['layerH'+i]=r.height;n['layerB'+i]=r.breadth;});}catch(e){meta.windError=e.message;errors.push(e.message);}}
  n._auto=meta;n._autoErrors=errors;return n;
 }
 function evidence(n){const a=n._auto;if(!a)return '';const fmt=x=>Overall.format(x,'#,##0.000');let s='';if(a.weight){const w=a.weight;s+='<details class="ov-model-evidence"><summary>面积法自重 · '+fmt(w.weight)+' kN</summary><p>各层楼板面积合计 × '+w.areaLoad+' kPa；扣除 Opening 和无楼板区域。梁、柱、墙自重及 Loading 荷载不另行叠加；重心按楼板面积加权。</p><table><thead><tr><th>楼层</th><th>Framing</th><th>楼板面积 m²</th><th>自重 kN</th></tr></thead><tbody>'+w.rows.map(r=>'<tr><td>'+String(r.name).replace(/[<>&]/g,'')+'</td><td>'+String(r.type).replace(/[<>&]/g,'')+'</td><td>'+fmt(r.area)+'</td><td>'+fmt(r.weight)+'</td></tr>').join('')+'</tbody></table><p>自动汇总写入原 Excel T1 槽位（全楼等效输入，不表示模型只有一座 Tower）；其余槽位为 0。D × B × 层数 × 等效 kPa/层 = '+fmt(w.D)+' × '+fmt(w.B)+' × '+w.storeys+' × '+fmt(w.q)+' = '+fmt(w.weight)+' kN。</p><p>O 水平坐标 = '+fmt(w.o)+' m；重心至 O 力臂 = '+fmt(w.arm)+' m；W × arm = '+fmt(w.weight*w.arm)+' kN·m。原 Excel 后续公式不变。</p></details>';}return s;}
 return {apply,geometry,wind,union2D,union3D,evidence};
})();

// Parameter-linked schematic port of the supplied workbook's DynamicStability.bas.
const OverallDiagram=(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),num=Number.isFinite,fmt=v=>num(v)?Overall.format(v,'#,##0.00'):'待补',blue='#245f88',red='#bd4945',green='#438267',purple='#8060a8';
 function render(p,face,opt={}){const n=OverallGeometry.input(p,face),m=Overall.machine(n,face),w=Overall.roles[1],u=Overall.roles[2],s=Overall.roles[3],get=(sheet,a)=>m.safe(sheet,a),V=get(w,'K5'),He=get(w,'B9'),offset=get(u,'B38'),basement=n.basement==='Yes';let parts=[];
  const line=(x1,y1,x2,y2,color,arrow=false,dash=false)=>{parts.push('<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+color+'" stroke-width="1.3"'+(dash?' stroke-dasharray="4 3"':'')+'/>');if(arrow){const len=Math.hypot(x2-x1,y2-y1);if(len>.1){const ux=(x2-x1)/len,uy=(y2-y1)/len,a=Math.min(5,len*.45),bx=x2-a*ux,by=y2-a*uy;parts.push('<polygon points="'+x2+','+y2+' '+(bx-uy*a*.45)+','+(by+ux*a*.45)+' '+(bx+uy*a*.45)+','+(by-ux*a*.45)+'" fill="'+color+'"/>');}}};
  const translate=label=>String(label).replaceAll('逐层风压','Layered wind').replaceAll('统一风压','Uniform wind').replaceAll('风压图待补资料','Wind inputs required').replaceAll('请检查标高及风输入','Review levels and wind data').replaceAll('风力或 O 点标高','wind / O level').replaceAll('左右线性变化','linear L to R').replaceAll('浮托力','Uplift').replaceAll('左侧地面','Left EL').replaceAll('右侧地面','Right EL').replaceAll('左侧','Left').replaceAll('右侧','Right').replaceAll('底部摩擦力','Base friction').replaceAll('无地下室：不画土、水压力及浮托力','No basement: no soil / water / uplift').replaceAll('无地下室：不画土、水压力及Uplift','No basement: no soil / water / uplift').replaceAll('风箭头长度表示压力，不表示楼层总风力。','Wind arrows show pressure, not storey force.').replaceAll('土重度待补：土压力轮廓仅作示意。','Soil weights missing: indicative soil outline.').replaceAll('风箭头按压力缩放；土、水、q 轮廓各自归一化。','Wind = pressure; soil / water / q separately normalized.').replaceAll('左右水头','Base heads L/R').replaceAll('力臂','e').replaceAll('待补','pending').replaceAll('；','; ').replaceAll('：',': ').replace(/^土$/,'Soil').replace(/^水$/,'Water');
  const text=(x,y,label,color=blue,size=11)=>{if(y>430)return;parts.push('<text x="'+x+'" y="'+y+'" fill="'+color+'" font-size="'+size+'">'+esc(translate(label))+'</text>');};
  const force=(id,x,y,label,value,color,size=8.5,unit='kN')=>{const v=num(value)?fmt(value):'pending';parts.push('<g data-force="'+id+'" data-value="'+(num(value)?value:'')+'" fill="'+color+'" text-anchor="middle"><rect x="'+(x-32)+'" y="'+(y-10)+'" width="64" height="25" rx="2" fill="white" fill-opacity=".92"/><text x="'+x+'" y="'+y+'" font-size="'+size+'">'+esc(label)+' ('+unit+')</text><text x="'+x+'" y="'+(y+12)+'" font-size="'+size+'"'+(v.length>12?' textLength="62" lengthAdjust="spacingAndGlyphs"':'')+'>'+esc(v)+'</text></g>');};
  const levelTag=(id,x,y,label,color)=>{const water=id.endsWith('-water'),split=label.indexOf(' GWL '),width=water?61:Math.min(176,label.length*4.55+8);parts.push('<g data-level="'+id+'" aria-label="'+esc(label)+'"><rect x="'+(x-3)+'" y="'+(y-(water?23:10))+'" width="'+width+'" height="'+(water?28:14)+'" rx="2" fill="white" fill-opacity=".94"/><text x="'+x+'" y="'+y+'" fill="'+color+'" font-size="8.5">'+(water?'<tspan x="'+x+'" dy="-12">'+esc(label.slice(0,split+4))+'</tspan><tspan x="'+x+'" dy="12">'+esc(label.slice(split+5))+'</tspan>':esc(label))+'</text></g>');};
  const triangle=(x,top,bottom,dir,color)=>{if(bottom-top<.1)return;line(x,top,x,bottom,color);line(x,top,x-dir*28,bottom,color);line(x-dir*28,bottom,x,bottom,color);for(let i=1;i<=4;i++){const y=top+(bottom-top)*i/4;line(x-dir*28*i/4,y,x,y,color,true);}};
  let baseY=360,datumY=248,roofY=50,scale=1;
  const basePressures=ready=>{if(ready){const hl=Math.max(n.leftGWL-n.baseRL,0),hr=Math.max(n.rightGWL-n.baseRL,0),max=Math.max(hl,hr);for(const [id,x,h] of [['left',225,hl],['right',350,hr]]){const endY=baseY+3+(max>0?30*h/max:0);parts.push('<g data-uplift-leader="'+id+'">');line(x,endY,x,baseY+52,purple);parts.push('<circle cx="'+x+'" cy="'+endY+'" r="1.8" fill="'+purple+'"/></g>');}}
   force('left-base-pressure',225,baseY+67,'pL',ready?get(u,'B49'):null,purple,9,'kPa');force('right-base-pressure',350,baseY+67,'pR',ready?get(u,'B50'):null,purple,9,'kPa');};
  const validGeometry=[n.leftEL,n.rightEL,n.leftGWL,n.rightGWL,n.baseRL].every(num)&&n.leftEL>=n.baseRL&&n.rightEL>=n.baseRL&&n.leftGWL<=n.leftEL&&n.rightGWL<=n.rightEL;

  if(basement&&validGeometry){scale=110/Math.max(n.leftEL-n.baseRL,n.rightEL-n.baseRL,.1);datumY=baseY-(n.leftEL-n.baseRL)*scale;roofY=Math.max(50,datumY-200);}else{baseY=basement?360:260;datumY=baseY;roofY=50;if(!basement&&num(offset)&&num(He)&&He+offset>0)datumY=baseY-210*offset/(He+offset);line(18,baseY,596,baseY,'#7c8b95');}
  const left=225,right=350,mid=(roofY+datumY)/2;
  // Deliberately schematic: floor spacing is compressed; exact levels remain in the shared model.
  parts.push('<rect x="225" y="'+roofY+'" width="125" height="'+(baseY-roofY)+'" fill="#f2f6f8"/>');
  const count=Math.max(1,p.total||1),step=Math.max(1,Math.ceil(count/10)),levels=OverallGeometry.levels(p);
  if(opt.building!==false){
   for(const x of [225,266,307,350])line(x,roofY,x,baseY,'#c5d5df');
   let priorY=-Infinity;for(let f=count;f>=1;f--){if(f!==count&&f%step!==0)continue;const z=levels[f]?.z;let y=baseY-(baseY-roofY)*f/count;
    if(num(z)&&num(n.height)&&num(n.leftEL)&&num(n.baseRL)&&n.height>n.leftEL&&n.leftEL>=n.baseRL){if(z<n.baseRL)continue;y=z>=n.leftEL?datumY-(z-n.leftEL)/(n.height-n.leftEL)*(datumY-roofY):baseY-(z-n.baseRL)/Math.max(n.leftEL-n.baseRL,.0001)*(baseY-datumY);}
    if(y<roofY-.1||y>baseY||y-priorY<14)continue;priorY=y;line(left,y,right,y,'#9bb6c6');if(opt.labels!==false)text(left+3,y+12,FloorLevels.name(p,f),'#6f8798',8);}
  }
  const W=get(u,'K30');if(num(W)&&W>0){line(290,roofY+22,290,roofY+60,'#5f7480',true);force('weight',287,roofY+84,'W',W,'#5f7480',9);}

  for(const [x1,y1,x2,y2]of [[left,roofY,right,roofY],[left,roofY,left,baseY],[right,roofY,right,baseY],[left,baseY,right,baseY]])line(x1,y1,x2,y2,blue);
  text(left,roofY-17,'D = '+fmt(n.depth)+' m');parts.push('<circle cx="'+right+'" cy="'+baseY+'" r="2" fill="'+blue+'"/>');text(right+7,baseY-7,'O');text(138,mid,'He '+fmt(He)+' m',blue,10);line(199,roofY,199,datumY,blue);
  const windOK=num(V)&&num(He)&&He>0&&num(n.leftEL)&&!n._auto?.windError;
  text(365,22,n.mode==='LAYERED'?'逐层风压':'统一风压',red,13);
  if(windOK&&n.mode==='UNIFORM'){line(35,roofY,35,datumY,red);line(123,roofY,123,datumY,red);for(let i=0;i<6;i++){const y=roofY+(datumY-roofY)*(i+.5)/6;line(35,y,123,y,red,true);}}
  else if(windOK&&n.mode==='LAYERED'){const rows=Array.from({length:100},(_,i)=>i+24).filter(r=>get(w,'BO'+r)==='OK').map(r=>({lo:get(w,'BG'+r),hi:get(w,'BH'+r),q:get(w,'BK'+r)})).filter(r=>[r.lo,r.hi,r.q].every(num)),max=Math.max(0,...rows.map(r=>r.q));let prev=null;for(const r of rows){if(max<=0)continue;const y1=datumY-r.hi/He*(datumY-roofY),y2=datumY-r.lo/He*(datumY-roofY),width=88*r.q/max;if(prev!==null)line(123-prev,y2,123-width,y2,red);line(123-width,y1,123-width,y2,red);line(123-width,(y1+y2)/2,123,(y1+y2)/2,red,true);prev=width;}line(123,roofY,123,datumY,red);}
  else{text(18,80,'风压图待补资料',red);text(18,99,'请检查标高及风输入',red,10);}
  if(n.mode==='UNIFORM')force('uniform-pressure',76,(roofY+datumY)/2-6,'p',windOK?get(w,'B36'):null,red,10,'kPa');
  force('wind',76,30,'V',windOK?V:null,red,10);
  text(18,445,'V = '+(windOK?fmt(V)+' kN':'待补'),red,12);
  if(windOK&&num(offset)){const arm=get(Overall.roles[4],'C22'),forceY=baseY-(arm-offset)/He*(datumY-roofY)-(baseY-datumY);line(right-13,forceY,right-13,baseY,blue);line(left,forceY,right,forceY,blue,false,true);text(365,43,'M(O) = '+fmt(V*arm),red,10);text(365,57,'kN·m (unfactored)',red,9);}else text(365,43,'M(O): pending',red,10);
  if(basement&&validGeometry){let missingSoil=false;
   for(const [col,dir,xs,xw,xq,labelX,name]of [['left',1,57,113,176,20,'左侧'],['right',-1,492,564,420,420,'右侧']]){const h=n[col+'EL']-n.baseRL,hw=Math.max(n[col+'GWL']-n.baseRL,0),a=h-hw,gy=baseY-h*scale,wy=baseY-hw*scale,gamma=n[col==='left'?'gammaLeft':'gammaRight'],sub=n[col==='left'?'submergedLeft':'submergedRight'],ready=num(sub)&&sub>0&&(a<=1e-6||num(gamma)&&gamma>0),q=n[col+'Q'];line(col==='left'?18:right,gy,col==='left'?left:596,gy,'#7c8b95');line(xw-25,wy,xw+25,wy,purple,false,true);const sideName=col==='left'?'Left':'Right';levelTag(col+'-ground',col==='left'?18:420,gy-9,sideName+' Existing Ground '+fmt(n[col+'EL'])+' mPD','#647581');const waterLabelY=Math.abs(wy-gy)<40?Math.min(wy,gy)-29:wy-10;line(xw,wy,xw,waterLabelY+4,purple,false,true);levelTag(col+'-water',col==='left'?95:538,waterLabelY,sideName+' GWL '+fmt(n[col+'GWL'])+' mPD',purple);
    if(h>1e-6){if(!ready){missingSoil=true;triangle(xs,gy,baseY,dir,green);}else{const total=(a>0?gamma*a:0)+sub*(h-a),breakP=a>0?gamma*a:0,split=gy+(baseY-gy)*a/h;if(total>0){line(xs,gy,xs,baseY,green);if(a>0)line(xs,gy,xs-dir*28*breakP/total,split,green);if(a<h)line(xs-dir*28*breakP/total,split,xs-dir*28,baseY,green);line(xs-dir*28,baseY,xs,baseY,green);for(let i=1;i<=4;i++){const dep=h*i/4,pp=dep<=a?gamma*dep:(a>0?gamma*a:0)+sub*(dep-a),y=gy+(baseY-gy)*i/4;line(xs-dir*28*pp/total,y,xs,y,green,true);}}}}
    triangle(xw,wy,baseY,dir,purple);if(num(q)&&q>0&&baseY-gy>.1){line(xq,gy,xq,baseY,green);line(xq-dir*16,gy,xq-dir*16,baseY,green);for(let i=0;i<=3;i++){const y=gy+(baseY-gy)*i/3;line(xq-dir*16,y,xq,y,green,true);}}const colRef=col==='left'?'B':'G';force(col+'-soil',xs,baseY+19,'Soil',get(s,colRef+'48'),green,8.5,'kPa');force(col+'-water',xw,baseY+19,'Water',get(s,colRef+'47'),purple,8.5,'kPa');force(col+'-surcharge',xq,baseY+19,'p(q)',get(s,colRef+'49'),green,8.5,'kPa');
   }
   const hl=Math.max(n.leftGWL-n.baseRL,0),hr=Math.max(n.rightGWL-n.baseRL,0),max=Math.max(hl,hr);if(max>0){line(left,baseY+3+30*hl/max,right,baseY+3+30*hr/max,purple);for(let i=0;i<=5;i++){const h=hl+(hr-hl)*i/5,x=left+(right-left)*i/5;if(h>0)line(x,baseY+3+30*h/max,x,baseY+2,purple,true);}basePressures(true);}else basePressures(true);
   text(18,493,'左右水头 '+fmt(hl)+' / '+fmt(hr)+' m；O = '+fmt(n.baseRL)+' mPD',purple,11);text(18,520,missingSoil?'土重度待补：土压力轮廓仅作示意。':'风箭头按压力缩放；土、水、q 轮廓各自归一化。','#7b8790',10);
  }else if(!basement){if(num(n.leftEL)){line(18,datumY,left,datumY,'#7c8b95');levelTag('left-ground',18,datumY-9,'Left Existing Ground '+fmt(n.leftEL)+' mPD','#647581');}if(num(n.rightEL)){const ry=num(n.height)&&num(n.baseRL)&&n.height>n.baseRL?baseY-(n.rightEL-n.baseRL)/(n.height-n.baseRL)*(baseY-roofY):baseY;line(right,ry,596,ry,'#7c8b95');levelTag('right-ground',420,ry-9,'Right Existing Ground '+fmt(n.rightEL)+' mPD','#647581');}line(343,baseY+29,233,baseY+29,green,true);text(194,baseY+56,'底部摩擦力 Fr = '+fmt(get(s,'B58'))+' kN',green,11);text(194,baseY+81,'无地下室：不画土、水压力及浮托力','#7b8790',10);text(18,520,'风箭头长度表示压力，不表示楼层总风力。','#7b8790',10);}
  if(basement&&!validGeometry){basePressures(false);text(18,baseY+20,'Soil / water / q: pending','#7b8790',10);}
  const defs=[blue,red,green,purple,'#7c8b95'].map(c=>'<marker id="ov-arrow-'+face+'-'+c.slice(1)+'" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="'+c+'"/></marker>').join('');
  return '<svg viewBox="0 0 600 460" preserveAspectRatio="xMidYMid meet" role="img" aria-label="'+face+' 面参数联动受力示意图" xmlns="http://www.w3.org/2000/svg"><defs>'+defs+'</defs><rect width="600" height="460" rx="8" fill="white"/><g font-family="Arial,sans-serif">'+parts.join('')+'</g></svg><p class="ov-diagram-note">红：风压；绿：土压力／surcharge；紫：水压／浮托力。沿用原 Excel DynamicStability 图示。示意不按几何比例；M(O) 采用原表公式：统一风压用中点力臂；逐层风压用 Σ(Fi × ei)。</p>';
 }
 function panel(p,opt={}){return '<div class="ov-integrated-intro">立面与整体受力 · 示意图 <span>图形完整适配窗口；标高及荷载可点击修改。</span></div><div class="ov-diagram-grid">'+['B','D'].map(face=>{
  const n=OverallGeometry.input(p,face),m=Overall.machine(n,face),u=Overall.roles[2],w=Overall.roles[1],get=(s,a)=>m.safe(s,a),active=n.basement==='Yes';
  const button=(key,label,unit='mPD')=>{const inactive=!active&&['leftGWL','rightGWL','leftQ','rightQ','uplift'].includes(key),v=key==='basement'?(active?'有 Basement':'无 Basement')+(FloorLevels.managed(p)?' · 自动':''):key==='all'?'查看 / 修改':key==='uplift'?'输入 / 结果':num(n[key])?fmt(n[key]):'点击填写';return '<button class="ov-map-input'+(!num(n[key])&&!['basement','all','uplift'].includes(key)&&!inactive?' pending':'')+'" data-elevation-key="'+key+'" data-face="'+face+'"'+(inactive?' disabled':'')+'><span>'+label+(unit?' <small>'+unit+'</small>':'')+'</span><b>'+esc(inactive?'不适用':v)+'</b></button>';};
  const geometryReady=[n.leftEL,n.rightEL,n.leftGWL,n.rightGWL,n.baseRL].every(num)&&n.leftEL>=n.baseRL&&n.rightEL>=n.baseRL&&n.leftGWL<=n.leftEL&&n.rightGWL<=n.rightEL;
  const windReady=num(get(w,'K5'))&&num(get(w,'B9'))&&get(w,'B9')>0&&!n._auto?.windError&&num(n.leftEL),arm=windReady&&num(get(u,'B38'))?get(Overall.roles[4],'C22'):null;
  let content='<section class="ov-diagram-card"><header><h3>'+face+' 面 · '+(face==='B'?'X–Z':'Y–Z')+'</h3><span>B '+fmt(n.breadth)+' m · D '+fmt(n.depth)+' m · '+p.total+' 层</span></header><div class="ov-map-top">'+button('height','楼顶')+button('basement','地下室','')+button('baseRL','O 点')+'</div>';
  content+='<div class="ov-map-figure">'+render(p,face,opt)+'</div>';
  content+='<div class="ov-map-sides">'+['left','right'].map(side=>'<div class="ov-map-side" aria-label="'+(side==='left'?'左侧':'右侧')+'输入">'+button(side+'EL',side==='left'?'左地面':'右地面')+button(side+'GWL',side==='left'?'左水位':'右水位')+button(side+'Q',side==='left'?'左 Surcharge':'右 Surcharge','kPa')+'</div>').join('')+'</div>';
  if(active&&!geometryReady)content+='<p class="ov-map-warning">土／水压力待补：请填写地面、水位和 O 点。地面须 ≥ O，水位须 ≤ 同侧地面。</p>';
  if(n._auto?.windError)content+='<p class="ov-map-warning">'+esc(n._auto.windError)+'</p>';
  const hp=[n.height,n.leftEL,n.rightEL].every(num)?n.height-Math.min(n.leftEL,n.rightEL):null;
  content+='<div class="ov-map-footer"><span>Hp '+fmt(hp)+' m · He '+fmt(windReady?get(w,'B9'):null)+' m · e '+fmt(arm)+' m</span>'+button('all','其他参数','')+'</div><details class="ov-map-note"><summary>图例与计算说明</summary><p>Soil、Water 标注底部压力（kPa）；p(q) 为 Surcharge 引起的侧压力（左 Ka×q、右 Kp×q），并非地面输入 q。底部 pL、pR 为两端水压（kPa）。V、W 单位 kN；M(O) 单位 kN·m。红：风；绿：土／Surcharge；紫：水／浮托力；灰蓝：自重。右侧 Surcharge 侧压力只展示，沿用原表不计入抗力。楼层线为压缩示意，高楼间隔标注，不改变实际层高或计算。</p><p>各压力轮廓分别缩放。M(O) 统一风压采用中点力臂；逐层风压采用 Σ(Fi × ei)；完整抗浮、抗滑和抗倾覆结果仍在 Section A。</p></details></section>';
  return content;
 }).join('')+'</div>';}
 return {render,panel};
})();
