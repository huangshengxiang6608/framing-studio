const BeamSizing83=(()=>{
 const signature=b=>Engine.sig(b.rawA,b.rawZ),step=50;
 function limit(p,m,b){
  if(b.kind==='SB')return m.sh*1000;
  const horizontal=Math.abs(b.rawA[1]-b.rawZ[1])<1e-6;
  const cols=m.columns.filter(c=>c.status!=="上层柱"&&[b.rawA,b.rawZ].some(q=>Math.abs(Engine.columnRect(c).x-q[0])<=c.b/2+1e-6&&Math.abs(Engine.columnRect(c).y-q[1])<=c.d/2+1e-6));
  return cols.length?Math.min(...cols.map(c=>(horizontal?c.d:c.b)*1000)):(horizontal?p.defaults.cd:p.defaults.cb);
 }
 async function prepare(project,requested){
  const p=Engine.clone(project),chosen=new Set(requested||['selected','reportA','reportB'].flatMap(k=>Object.entries(p.explorer?.[k]||{}).filter(([,v])=>v).map(([id])=>id)));
  let r=Engine.generate(p);const targets=new Set();for(const f of r.floors)for(const b of Engine.floorModel(r,f).beams)if(['MB','SB'].includes(b.kind)&&b.displayKind!=='CB'&&chosen.has(f.n+'|'+Loading.token(b.kind,b)))targets.add(f.type+'|'+signature(b));
  const changes=[],stopped=[];let out;
  for(let iteration=0;iteration<=400;iteration++){
   r=Engine.generate(p);const test=Engine.clone(p);Loading.init(test);test.explorer.selected={};
   for(const f of r.floors)for(const b of Engine.floorModel(r,f).beams)if(targets.has(f.type+'|'+signature(b)))test.explorer.selected[f.n+'|'+Loading.token(b.kind,b)]=true;
   out=Loading.run(test,r,'B');const groups=new Map();
   for(const row of out.rows)if(row.checked&&targets.has(row.framing+'|'+signature(row.member))){const k=row.framing+'|'+signature(row.member);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(row);}
   let changed=false;stopped.length=0;
   for(const [k,rows]of groups){const row=rows[0],b=row.member,m=Engine.floorModel(r,row.floor,row.framing),max=limit(p,m,b),width=Math.round(b.b*1000*1e6)/1e6;
    const invalid=rows.find(x=>x.result.status==='INPUT REQUIRED');
    const failure=rows.some(x=>x.result.status!=='OK');
    if(width>max+1e-6){stopped.push({id:row.id,framing:row.framing,reason:'当前梁宽已超过'+(b.kind==='SB'?'Structural Depth':'柱宽')+'上限 '+max+' mm'});continue;}
    if(!failure)continue;
    if(invalid){stopped.push({id:row.id,framing:row.framing,reason:'输入或传荷待补：'+invalid.result.fail.join('；')});continue;}
    if(width+step>max+1e-6){stopped.push({id:row.id,framing:row.framing,reason:'达到梁宽上限 '+max+' mm，仍未通过；下一步 +50 mm 将超限'});continue;}
    const map=p.types[row.framing].beamWidths83??={},sig=signature(b),previous=map[sig];map[sig]=width+step;const candidate=Engine.floorModel(Engine.generate(p),row.floor,row.framing);if(!candidate.beams.some(x=>signature(x)===sig)){if(previous===undefined)delete map[sig];else map[sig]=previous;stopped.push({id:row.id,framing:row.framing,reason:'加宽后截面超出可布置范围，保留原宽并标记未通过'});continue;}changes.push({framing:row.framing,id:row.id,from:width,to:width+step});changed=true;
   }
   if(!changed)break;if(iteration===400)throw Error('梁宽调整未收敛，未应用本次修改');
   await new Promise(resolve=>setTimeout(resolve,0));
  }
  return {project:p,changes,stopped};
 }
 async function apply(host,requested){const original=JSON.stringify(host.get().p),v=await prepare(host.get().p,requested);if(JSON.stringify(host.get().p)!==original)throw Error('计算期间输入已改变，请重新计算');
  if(v.changes.length&&host.transact(()=>{for(const [key,t]of Object.entries(v.project.types))host.get().p.types[key].beamWidths83=t.beamWidths83;})===false)throw Error('梁宽调整未能保存，已撤销');
  return v;
 }
 return {prepare,apply,limit};
})();
