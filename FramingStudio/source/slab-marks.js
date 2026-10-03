// Rebuild annotation anchors from current slab geometry, never cached member IDs.
const SlabMarks83=(()=>{
 function layout(p,f,s,m,scale){const token=Loading.token('SLAB',s),settings=Loading.input(p,f,token),parts=[];
  for(const r of s.rects||[s]){const xx=[r.x0,r.x1],yy=[r.y0,r.y1];if(!s.netBoundary120&&!s.rectangular)for(const b of [...m.beams,...m.walls]){const a=b.rawA||b.a,z=b.rawZ||b.z;if(Math.abs(a[1]-z[1])<1e-6&&Math.max(a[0],z[0])>r.x0&&Math.min(a[0],z[0])<r.x1&&a[1]>r.y0&&a[1]<r.y1)yy.push(a[1]);if(Math.abs(a[0]-z[0])<1e-6&&Math.max(a[1],z[1])>r.y0&&Math.min(a[1],z[1])<r.y1&&a[0]>r.x0&&a[0]<r.x1)xx.push(a[0]);}
   const xs=[...new Set(xx)].sort((a,b)=>a-b),ys=[...new Set(yy)].sort((a,b)=>a-b);for(let i=1;i<xs.length;i++)for(let j=1;j<ys.length;j++)parts.push({x0:xs[i-1],x1:xs[i],y0:ys[j-1],y1:ys[j],rectangular:true});
  }
  const visible=parts.filter(r=>(r.x1-r.x0)*scale>=12&&(r.y1-r.y0)*scale>=12),largest=[...parts].sort((a,b)=>LoadRegions83.area(b)-LoadRegions83.area(a))[0];
  // A narrow or irregular physical slab must retain at least one label.
  return (visible.length?visible:largest?[largest]:[]).map(r=>{const preferred=Loading.slabDirection(p,f,token,s.netBoundary120?s:r,m),other=preferred==='X'?'Y':'X';let dir=null;
   if(settings.slabType==='CS'){if(['left','right','top','bottom'].includes(settings.csFixedEdge))dir=preferred;}
   else if(s.netBoundary120)dir=preferred;
   else dir=Loading.oppositeSupports(m,r,preferred)?preferred:Loading.oppositeSupports(m,r,other)?other:null;
   return {x:(r.x0+r.x1)/2,y:(r.y0+r.y1)/2,dir,part:r,narrow:(r.x1-r.x0)*scale<24||(r.y1-r.y0)*scale<24};
  });
 }
 return {layout};
})();
