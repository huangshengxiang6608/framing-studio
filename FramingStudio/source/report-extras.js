// App-authored diagrams and reference chapters only. Native Excel design reports are untouched.
window.ReportExtras82=(()=>{
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const num=(v,f=0)=>Number.isFinite(+v)?+v:f;
 function html(page,images={}){
  const width=524.4,scale=width/540,rows=[],overlays=[];let row=1;
  const top=r=>{let t=0;for(let i=1;i<r;i++)t+=rows[i]?.height??21;return t;};
  const write=(text,level=0,editable=false)=>{text=String(text??'');const lines=text.split('\n').reduce((n,p)=>n+Math.max(1,Math.ceil(p.length/88)),0),height=Math.max(level===2?32:22,lines*16+8);rows[row++]={height,markup:`<div class="line level${level}${editable?' reference':''}">${esc(text).replace(/\n/g,'<br>')}</div>`};};
  write(page.title,2);for(const l of page.lines||[])write(l.text,num(l.level),!!page.reference);
  if(page.image&&!page.referenceImageAfter){const vertical=page.image==='vertical-load-path.png';if(!["vertical-load-path.png","horizontal-load-path.png"].includes(page.image)||!images[page.image])throw Error('Missing report reference image');
   const [iw,ih,left,y,cw,ch]=vertical?[660,622,65,101,549,363]:[687,607,66,130,535,312],h=ch*width/cw,pt=top(row)+8;
   overlays.push(`<svg class="drawing" style="top:${pt}pt;width:${width}pt;height:${h}pt;overflow:hidden" viewBox="${left} ${y} ${cw} ${ch}" xmlns="http://www.w3.org/2000/svg"><image width="${iw}" height="${ih}" href="data:image/png;base64,${images[page.image]}"/></svg>`);
   while(top(row)<pt+h+12)row++;
  }
  if(page.table)for(const [i,cells]of page.table.entries()){
   const lines=Math.max(...cells.map((c,j)=>String(c).split('\n').reduce((n,t)=>n+Math.max(1,Math.ceil(t.length/(j===0?18:33))),0)));
   rows[row++]={height:lines*16+12,markup:`<div class="table-row ${i===0?'table-head':i%2===0?'shade':''}">${cells.map(c=>`<div>${esc(c).replace(/\n/g,'<br>')}</div>`).join('')}</div>`};
  }
  if(page.shapes){const pt=Math.max(num(page.shapeTop),top(row)+8),h=num(page.shapeHeight,450),shapes=page.shapes.map(s=>{
   const stroke=esc(s.color||'#0057b8'),weight=num(s.width,1),common=`stroke="${stroke}" stroke-width="${weight}" fill="${esc(s.fill||'none')}"${s.dash?' stroke-dasharray="7 3 1.5 3"':''}`;
   if(s.type==='line'){
    let out=`<path d="M ${num(s.x)} ${num(s.y)} L ${num(s.x2)} ${num(s.y2)}" ${common}/>`;
    const dx=s.x2-s.x,dy=s.y2-s.y,length=Math.hypot(dx,dy);if(length&&s.arrow){const ux=dx/length,uy=dy/length,head=(x,y,sign)=>`<path d="M ${x-sign*ux*5-uy*2.5} ${y-sign*uy*5+ux*2.5} L ${x} ${y} L ${x-sign*ux*5+uy*2.5} ${y-sign*uy*5-ux*2.5}" ${common}/>`;out+=head(s.x2,s.y2,1);if(s.both)out+=head(s.x,s.y,-1);}return out;
   }
   if(s.type==='text'){const size=num(s.size,10),x=num(s.x)+(s.center?num(s.w,120)/2:0),y=num(s.y)+(s.center?num(s.h,30)/2:size*.82);return `<text x="${x}" y="${y}" fill="${esc(s.color||'#000000')}" font-family="Arial,Microsoft YaHei,sans-serif" font-size="${size}"${s.center?' text-anchor="middle" dominant-baseline="central"':''}>${esc(s.text)}</text>`;}
   if(s.type==='ellipse')return `<ellipse cx="${num(s.x)+num(s.w)/2}" cy="${num(s.y)+num(s.h)/2}" rx="${num(s.w)/2}" ry="${num(s.h)/2}" ${common}/>`;
   return `<rect x="${num(s.x)}" y="${num(s.y)}" width="${num(s.w)}" height="${num(s.h)}" ${common}/>`;
  }).join('');overlays.push(`<svg class="drawing" style="top:${pt}pt;width:${width}pt;height:${h*scale}pt" viewBox="0 0 540 ${h}" xmlns="http://www.w3.org/2000/svg">${shapes}</svg>`);
   while(top(row)<pt+h*scale+10)row++;
  }
  if(page.image&&page.referenceImageAfter){const photo={...page,shapes:null,lines:[],after:[],referenceImageAfter:false,title:'Reference photograph'};const fragment=html(photo,images);const body=fragment.match(/<body>([\s\S]*)<\/body>/)?.[1]||'';overlays.push(`<div style="position:relative;margin-top:12pt;break-before:page">${body}</div>`);}
  for(const l of page.after||[])write(l.text,num(l.level),!!page.reference);
  let body='';for(let i=1;i<row;i++){const r=rows[i]||{height:21,markup:''};body+=`<div class="row" style="min-height:${r.height}pt">${r.markup}</div>`;}
  return `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4 portrait;margin:28pt}*{box-sizing:border-box}html,body{margin:0;padding:0;background:white;color:#000000;font:11pt Arial,"Microsoft YaHei",sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}.sheet{position:relative;width:${width}pt}.row{break-inside:avoid;position:relative}.line{min-height:inherit;border-bottom:0;padding:1pt 1pt;line-height:16pt;white-space:normal;overflow-wrap:anywhere}.level2{background:#0057b8;color:white;font-size:14pt;font-weight:bold}.level1{background:#ffffff;font-weight:bold}.reference.level0{background:#ffffff}.drawing{position:absolute;left:0;overflow:visible}.table-row{display:grid;grid-template-columns:23.1% 36.5% 40.4%;min-height:inherit;color:#000000}.table-row>div{border:.5pt solid #000000;padding:2pt 2pt;line-height:16pt;overflow-wrap:anywhere}.table-head{background:#0057b8;color:white;font-weight:bold}.shade{background:#ffffff}</style></head><body><div class="sheet">${body}${overlays.join('')}</div></body></html>`;
 }
 return {html};
})();
