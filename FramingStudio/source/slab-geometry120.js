// One physical footprint for slab topology, net concrete, direction and face contact.
const SlabGeometry120=(()=>{
 const engine=()=>typeof Engine!=='undefined'?Engine:require('./engine.js'),regions=()=>typeof LoadRegions83!=='undefined'?LoadRegions83:require('./load-regions.js');
 const eps=1e-6,clone=x=>JSON.parse(JSON.stringify(x)),nice=n=>Math.round(n*1e6)/1e6;
 const token=s=>'SLAB|'+JSON.stringify(s.rects.map(r=>[r.x0,r.x1,r.y0,r.y1].map(nice)));
 const signature=s=>s.rects.map(r=>[r.x0,r.x1,r.y0,r.y1].map(v=>v.toFixed(6)).join(',')).sort().join('|');
 const box=r=>({x0:r.x-r.w/2,x1:r.x+r.w/2,y0:r.y-r.d/2,y1:r.y+r.d/2});
 const intersect=(a,b)=>Math.max(0,Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0))*Math.max(0,Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0));
 function concrete(beams,walls,columns){return [...beams,...walls].map(m=>box(engine().rect(m))).concat(columns.filter(c=>c.status!=='上层柱').map(c=>box(engine().columnRect(c))));}
 // Keep the physical net polygon and its identity. Only boundary column cut-outs
 // may be treated as a rectangular design panel; real voids and internal islands cannot.
 const designCache=new WeakMap();
 function designRectangle(c,model){
  if(c.rectangular)return true;if(!model||!c.netBoundary120)return false;
  let cache=designCache.get(model);if(!cache)designCache.set(model,cache=new WeakMap());if(cache.has(c))return cache.get(c);
  const R=regions(),bounds={x0:c.x0,x1:c.x1,y0:c.y0,y1:c.y1},missing=R.difference([bounds],c.rects),columns=model.columns.filter(v=>v.status!=='上层柱').map(v=>box(engine().columnRect(v)));
  const floor=R.union((model.ts||[]).filter(t=>t.state===1).map(t=>({x0:t.x0,x1:t.x1,y0:t.y0,y1:t.y1})));
  const good=missing.length>0&&R.difference([bounds],floor).reduce((n,r)=>n+R.area(r),0)<eps&&!(model.slabVoids||[]).some(v=>intersect(v,bounds)>eps)&&missing.every(r=>Math.abs(r.x0-c.x0)<eps||Math.abs(r.x1-c.x1)<eps||Math.abs(r.y0-c.y0)<eps||Math.abs(r.y1-c.y1)<eps)&&R.difference(missing,columns).reduce((n,r)=>n+R.area(r),0)<eps;
  cache.set(c,good);return good;
 }
 function decorate(slabs,legacy){for(const s of slabs){const matches=legacy.filter(old=>Math.abs(s.area-s.rects.reduce((n,r)=>n+old.rects.reduce((v,q)=>v+intersect(r,q),0),0))<1e-6);s.netBoundary120=true;s.legacyTokens120=matches.map(token);s.legacySignatures120=matches.map(signature);}return slabs;}
 // The candidate must touch this very face. Never bridge a gap to a nearby member.
 function face(member,cross,coordinate){const column=!member.a;if(column&&member.status==='上层柱')return null;if(!column&&Math.abs(member.a[cross]-member.z[cross])>eps)return null;const r=box(column?engine().columnRect(member):engine().rect(member)),dim=cross===0?'x':'y',other=cross===0?'y':'x';if(Math.abs(r[dim+'0']-coordinate)>eps&&Math.abs(r[dim+'1']-coordinate)>eps)return null;return [r[other+'0'],r[other+'1']];}
 function record(table,s){if(!table)return;const own=table[token(s)];if(own!==undefined)return own;const values=s.legacyTokens120.map(t=>table[t]).filter(v=>v!==undefined);return values.length===1?values[0]:undefined;}
 // Migrate stored references once. Archive replaced keys, rather than losing user inputs.
 function migrate(p,result){if(p.slabBoundary120===1)return;const archive={members:{},selected:{},reportA:{},reportB:{},areas:{},directions:{},sizes:{}};let count=0;
  for(const [key,t]of Object.entries(p.types)){if(!result.models[key])continue;const variants=[result.models[key],...Object.values(result.floorModels||{}).filter(m=>m.key===key)],m={slabs:[...new Map(variants.flatMap(m=>m.slabs).map(s=>[token(s),s])).values()]};
   if(t.slabDirections116){archive.directions[key]=clone(t.slabDirections116);for(const s of m.slabs){const value=record(t.slabDirections116,s);if(value!==undefined)t.slabDirections116[token(s)]=value;}const current=new Set(m.slabs.map(token));for(const old of Object.keys(t.slabDirections116))if(!current.has(old))delete t.slabDirections116[old];}
   if(t.slabSizes){archive.sizes[key]=clone(t.slabSizes);for(const s of m.slabs){const sig=signature(s),old=t.slabSizes.filter(o=>s.legacySignatures120.includes(o.signature));if(!t.slabSizes.some(o=>o.signature===sig)&&old.length===1)t.slabSizes.push({signature:sig,value:old[0].value});}const current=new Set(m.slabs.map(signature));t.slabSizes=t.slabSizes.filter(o=>current.has(o.signature));}
  }
  for(const f of result.floors){const m=engine().floorModel(result,f.n),current=new Set(m.slabs.map(token)),mapped=new Map();for(const s of m.slabs)for(const t of s.legacyTokens120)mapped.set(t,[...(mapped.get(t)||[]),token(s)]);
   for(const kind of ['members','selected','reportA','reportB']){const table=p.explorer?.[kind];if(!table)continue;for(const [key,value]of Object.entries({...table})){const prefix=f.n+'|';if(!key.startsWith(prefix+'SLAB|'))continue;const old=key.slice(prefix.length);if(current.has(old))continue;const targets=mapped.get(old)||[];archive[kind][key]=clone(value);for(const next of targets)if(!Object.hasOwn(table,prefix+next))table[prefix+next]=clone(value);delete table[key];count++;if(!targets.length)result.issues.push({floor:f.n,type:f.type,id:'SLAB',msg:'旧板块设置已保留在项目备份字段；对应净板区已不存在，请重新选择构件'});}}
   for(const a of p.explorer?.areas?.[f.n]||[]){archive.areas[f.n+'|'+a.id]=clone(a);if(a.rects)a.rects=regions().clipSurface(a.rects,m);else a.panels=[...new Set((a.panels||[]).flatMap(t=>current.has(t)?[t]:mapped.get(t)||[t]))];}
  }
  p.slabBoundary120=1;if(count||Object.keys(archive.areas).length||Object.keys(archive.directions).length||Object.keys(archive.sizes).length)p.slabMigration120=archive;
 }
 return {designRectangle,concrete,decorate,face,record,migrate,box,token,signature};
})();
if(typeof module!=='undefined')module.exports=SlabGeometry120;
