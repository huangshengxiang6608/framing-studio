const TransferMarkers83=(()=>{
 const same=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<1e-6;
 function on(c,b){const a=b.rawA||b.a,z=b.rawZ||b.z,dx=z[0]-a[0],dy=z[1]-a[1],l=dx*dx+dy*dy,t=((c.x-a[0])*dx+(c.y-a[1])*dy)/l;return l>0&&t>=-1e-6&&t<=1+1e-6&&Math.hypot(c.x-a[0]-t*dx,c.y-a[1]-t*dy)<1e-6;}
 function landing(p,result,f){const tt=typeof TrussModel109==='undefined'?[]:TrussModel109.visuals(p,result,f,f).filter(v=>v.t.topFloor===f).flatMap(v=>v.g.sources.map(s=>({column:s.c,beam:{id:v.t.name,kind:'TT'},floor:f+1})));const here=result.floors[f-1],above=result.floors[f];if(!here||!above)return [];const m=Engine.floorModel(result,here),up=Engine.floorModel(result,above);return [...tt,...up.columns.filter(c=>!tt.some(v=>v.column.id===c.id)&&!m.columns.some(x=>same(c,x))).flatMap(c=>{const bs=m.beams.filter(b=>b.kind==='TB'&&on(c,b));return bs.length===1?[{column:c,beam:bs[0],floor:above.n}]:[];})];}
 return {landing,on};
})();
