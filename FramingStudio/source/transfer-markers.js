const TransferMarkers83=(()=>{
 const same=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)<1e-6;
 function on(c,b){const a=b.rawA||b.a,z=b.rawZ||b.z,dx=z[0]-a[0],dy=z[1]-a[1],l=dx*dx+dy*dy,t=((c.x-a[0])*dx+(c.y-a[1])*dy)/l;return l>0&&t>=-1e-6&&t<=1+1e-6&&Math.hypot(c.x-a[0]-t*dx,c.y-a[1]-t*dy)<1e-6;}
 function landing(p,result,f){const here=result.floors[f-1],above=result.floors[f];if(!here||!above)return [];const m=Engine.floorModel(result,here),up=Engine.floorModel(result,above);return up.columns.filter(c=>c.status!=='上层柱'&&!m.columns.some(x=>x.status!=='上层柱'&&Engine.overlap(Engine.columnRect(c),Engine.columnRect(x)))).flatMap(c=>{const point=Engine.columnReference(p,up.key,c);if(m.walls.some(w=>Engine.on(point,w)))return [];const beam=Engine.transferBeamAt(p,m,f,point);return beam?.kind==='TB'?[{column:c,beam,floor:above.n}]:[];});}
 return {landing,on};
})();
