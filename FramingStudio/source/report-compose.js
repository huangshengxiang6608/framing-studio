// Keep native vector glyphs and numbers. Body baselines follow the original answer-paper rules.
window.ReportCompose=(()=>{
 let pdfModule,paper;
 async function template(){return paper??=Promise.all([fetch('./answer-sheet108.pdf'),fetch('./answer-sheet108.json')]).then(async([pdf,json])=>{if(!pdf.ok||!json.ok)throw Error('线纸模板未能读取，请检查 App 文件是否完整');return {bytes:await pdf.arrayBuffer(),geometry:await json.json()};});}
 async function inspect(base64,eligible){
  pdfModule??=import('./pdfjs/pdf.min.mjs');const lib=await pdfModule;lib.GlobalWorkerOptions.workerSrc='./pdfjs/pdf.worker.min.mjs';
  const pdf=await lib.getDocument({data:Uint8Array.from(atob(base64),c=>c.charCodeAt(0)),isEvalSupported:false,standardFontDataUrl:'./pdfjs/standard_fonts/'}).promise,results=[];
  try{for(let n=1;n<=pdf.numPages;n++){
   const page=await pdf.getPage(n),content=await page.getTextContent(),viewport=page.getViewport({scale:1}),height=viewport.height,width=viewport.width,headers=content.items.filter(t=>t.str&&height-t.transform[5]<30);
   const trim=eligible&&/^(Scheme 1 - RC|Section B|A[.]\d+ Overall Check)$/.test(headers.map(t=>t.str).join(' ').replace(/\s+/g,' ').trim()),start=trim?Math.max(...headers.map(t=>height-t.transform[5]+t.height*.5+2)):0;
   const scale=1.25,v=page.getViewport({scale}),canvas=document.createElement('canvas');canvas.width=Math.ceil(v.width);canvas.height=Math.ceil(v.height);
   const ctx=canvas.getContext('2d',{willReadFrequently:true});await page.render({canvasContext:ctx,viewport:v,intent:'print',background:'rgb(255,255,255)'}).promise;
   const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;let x0=canvas.width,x1=-1,y0=canvas.height,y1=-1;
   for(let y=Math.ceil(start*scale);y<canvas.height;y++)for(let x=0;x<canvas.width;x++){const i=(y*canvas.width+x)*4;if(data[i]<250||data[i+1]<250||data[i+2]<250){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}}
   const crop=x1<0?{left:0,right:width,bottom:0,top:height}:{left:Math.max(0,x0/scale-3),right:Math.min(width,(x1+1)/scale+3),bottom:Math.max(0,height-(y1+1)/scale-3),top:Math.min(height,height-y0/scale+3)};
   results.push({crop,trim,data,bitmapWidth:canvas.width,bitmapHeight:canvas.height,scale,pageHeight:height,text:content.items.filter(t=>t.str.trim()).map(t=>({str:t.str,x:t.transform[4],y:t.transform[5],w:t.width,h:t.height||Math.hypot(t.transform[2],t.transform[3]),a:Number.isFinite(content.styles[t.fontName]?.ascent)?content.styles[t.fontName].ascent:.9,d:Number.isFinite(content.styles[t.fontName]?.descent)?content.styles[t.fontName].descent:-.22}))});canvas.width=canvas.height=1;
  }}finally{await pdf.destroy();}return results;
 }
 const multiply=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
 function contents(page){let streams=page.node.Contents();if(!streams)return '';streams=streams instanceof PDFLib.PDFArray?streams.asArray():[streams];return streams.map(ref=>{const bytes=PDFLib.decodePDFRawStream(page.doc.context.lookup(ref)).decode();let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return s;}).join('\n');}
 function operations(s){
  const tokens=[];let i=0;const space=c=>/[\s\0]/.test(c),delimiter=c=>/[\s\0()[\]<>/%]/.test(c);
  function token(){while(i<s.length){if(space(s[i])){i++;continue;}if(s[i]==='%'){while(i<s.length&&s[i]!=='\n'&&s[i]!=='\r')i++;continue;}break;}const start=i,c=s[i++];if(c==='('){let depth=1;while(i<s.length&&depth){if(s[i]==='\\'){i+=2;continue;}if(s[i]==='(')depth++;if(s[i]===')')depth--;i++;}}else if(c==='['){while(i<s.length){while(space(s[i]))i++;if(s[i]===']'){i++;break;}token();}}else if(c==='<'&&s[i]==='<'){i++;while(i<s.length){while(space(s[i]))i++;if(s[i]==='>'&&s[i+1]==='>'){i+=2;break;}token();}}else if(c==='<'){while(i<s.length&&s[i]!=='>')i++;i++;}else if(c==='/'){while(i<s.length&&!delimiter(s[i]))i++;}else while(i<s.length&&!delimiter(s[i]))i++;return {start,end:i,value:s.slice(start,i),operand:c==='('||c==='['||c==='<'||c==='/'||/^[+\-.\d]/.test(c)};}
  while(i<s.length){const t=token();if(t.value)tokens.push(t);}const ops=[];let operands=[];for(const t of tokens){if(t.operand||t.value==='true'||t.value==='false'||t.value==='null')operands.push(t);else{ops.push({op:t.value,args:operands,start:operands[0]?.start??t.start,end:t.end});operands=[];}}return ops;
 }
 function rules(out,geometry,placements){
  const height=geometry.height;
  for(const r of geometry.rules){const y=height-(r.top+r.bottom)/2,blocked=[];
   for(const p of placements){if(y<p.y-2||y>p.y+p.h+2)continue;const srcY=p.crop.bottom+(y-p.y)/p.scale;
    if(!p.aligned)for(const t of p.info.text)if(srcY>=t.y-2/p.scale&&srcY<=t.y+t.h+2/p.scale){const a=p.x+(t.x-p.crop.left)*p.scale-2,b=a+t.w*p.scale+4;blocked.push([a,b]);}
    let run=null;for(let x=p.x;x<=p.x+p.w;x+=.5){const sx=Math.round((p.crop.left+(x-p.x)/p.scale)*p.info.scale),sy=Math.round((p.info.pageHeight-srcY)*p.info.scale);let ink=false;
     const radius=p.aligned?0:1;for(let dy=-radius;dy<=radius&&!ink;dy++)for(let dx=-radius;dx<=radius;dx++){const xx=sx+dx,yy=sy+dy;if(xx<0||yy<0||xx>=p.info.bitmapWidth||yy>=p.info.bitmapHeight)continue;const i=(yy*p.info.bitmapWidth+xx)*4;if(p.info.data[i]<246||p.info.data[i+1]<246||p.info.data[i+2]<246){ink=true;break;}}
     if(ink&&run===null)run=x-.5;if(!ink&&run!==null){blocked.push([run,x+.5]);run=null;}
    }if(run!==null)blocked.push([run,p.x+p.w+.5]);
   }
   blocked.sort((a,b)=>a[0]-b[0]);let x=r.x0;const tone=typeof r.color==='number'?r.color:.65,draw=(a,b)=>{if(b>a+.1)out.drawLine({start:{x:a,y},end:{x:b,y},thickness:Math.max(.2,r.bottom-r.top),color:PDFLib.rgb(tone,tone,tone)});};for(const [a,b]of blocked){if(b<=x||a>=r.x1)continue;draw(x,Math.min(r.x1,a));x=Math.max(x,b);if(x>=r.x1)break;}draw(x,r.x1);
  }
 }
 function shapes(source,ops){
  let ctm=[1,0,0,1,0,0],stroke=[0,0,0],fill=[0,0,0],stack=[],path=[],pen=null,first=null;const out=[],point=(x,y)=>({x:ctm[0]*x+ctm[2]*y+ctm[4],y:ctm[1]*x+ctm[3]*y+ctm[5]}),white=c=>c.every(v=>v>.97);
  const finish=(paint,closed=false)=>{if(!path.length)return;const color=paint==='stroke'?stroke:fill;if(!white(color)){const pts=path.flatMap(s=>s.points),box={left:Math.min(...pts.map(p=>p.x)),right:Math.max(...pts.map(p=>p.x)),bottom:Math.min(...pts.map(p=>p.y)),top:Math.max(...pts.map(p=>p.y))};if(paint==='stroke'){for(const s of path){const p=s.points;if(p.length===2)out.push({left:Math.min(p[0].x,p[1].x),right:Math.max(p[0].x,p[1].x),bottom:Math.min(p[0].y,p[1].y),top:Math.max(p[0].y,p[1].y),color,filled:false});else out.push({...box,color,filled:false});}}else out.push({...box,color,filled:true});}path=[];pen=first=null;};
  for(const {op,args}of ops){const n=args.map(a=>+a.value);if(op==='q')stack.push({ctm:ctm.slice(),stroke:stroke.slice(),fill:fill.slice()});else if(op==='Q'){const v=stack.pop();if(v){ctm=v.ctm;stroke=v.stroke;fill=v.fill;}}else if(op==='cm')ctm=multiply(ctm,n);else if(op==='RG')stroke=n;else if(op==='rg')fill=n;else if(op==='G')stroke=[n[0],n[0],n[0]];else if(op==='g')fill=[n[0],n[0],n[0]];else if(op==='K'||op==='k'){const c=n.slice(0,3).map(v=>1-Math.min(1,v+n[3]));if(op==='K')stroke=c;else fill=c;}
   else if(op==='m'){pen=point(...n);first=pen;}else if(op==='l'){const p=point(...n);if(pen)path.push({points:[pen,p]});pen=p;}else if(op==='c'){const p=[point(n[0],n[1]),point(n[2],n[3]),point(n[4],n[5])];if(pen)path.push({points:[pen,...p]});pen=p[2];}else if(op==='v'||op==='y'){const p=[point(n[0],n[1]),point(n[2],n[3])];if(pen)path.push({points:[pen,...p]});pen=p[1];}else if(op==='h'){if(pen&&first)path.push({points:[pen,first]});pen=first;}else if(op==='re'){const p=[point(n[0],n[1]),point(n[0]+n[2],n[1]),point(n[0]+n[2],n[1]+n[3]),point(n[0],n[1]+n[3])];for(let j=0;j<4;j++)path.push({points:[p[j],p[(j+1)%4]]});pen=first=p[0];}
   else if(op==='S'||op==='s')finish('stroke',op==='s');else if(['f','f*','F'].includes(op))finish('fill');else if(['B','B*','b','b*'].includes(op))finish('stroke');else if(op==='n'){path=[];pen=first=null;}else if(op==='Do'){const a=point(0,0),b=point(1,1);if(Math.abs(a.x-b.x)>5&&Math.abs(a.y-b.y)>5)out.push({left:Math.min(a.x,b.x),right:Math.max(a.x,b.x),bottom:Math.min(a.y,b.y),top:Math.max(a.y,b.y),image:true,color:[0,0,0]});}
  }return out.filter(s=>s.right-s.left>.05||s.top-s.bottom>.05);
 }
 const intersects=(a,b,gap=0)=>a.left<=b.right+gap&&a.right>=b.left-gap&&a.bottom<=b.top+gap&&a.top>=b.bottom-gap;
 const inside=(t,b)=>t.x>=b.left-.5&&t.x<=b.right+.5&&t.y+t.h*.3>=b.bottom&&t.y+t.h*.3<=b.top;
 const bounds=list=>({left:Math.min(...list.map(s=>s.left)),right:Math.max(...list.map(s=>s.right)),bottom:Math.min(...list.map(s=>s.bottom)),top:Math.max(...list.map(s=>s.top))});
 const unique=list=>list.sort((a,b)=>a-b).reduce((a,x)=>{if(!a.length||x-a[a.length-1]>.8)a.push(x);return a;},[]);
 function textRows(items){const rows=[];for(const t of [...items].sort((a,b)=>b.y-a.y||a.x-b.x)){let r=rows.find(r=>Math.abs(r.base-t.y)<2.4);if(!r){r={base:t.y,items:[]};rows.push(r);}r.items.push(t);r.base=r.items.reduce((a,b)=>a.h>=b.h?a:b).y;}return rows.sort((a,b)=>b.base-a.base).map(r=>({...r,items:r.items.sort((a,b)=>a.x-b.x),crop:{left:Math.min(...r.items.map(t=>t.x))-.6,right:Math.max(...r.items.map(t=>t.x+t.w))+.6,top:Math.max(...r.items.map(t=>t.y+t.h*t.a))+.6,bottom:Math.min(...r.items.map(t=>t.y+t.h*t.d))-.6}}));}
 function tablePlans(info,all){
  const black=s=>!s.image&&Math.max(...s.color)-Math.min(...s.color)<.12&&Math.max(...s.color)<.8;
  const v=all.filter(s=>black(s)&&s.right-s.left<1.8&&s.top-s.bottom>4),h=all.filter(s=>black(s)&&s.top-s.bottom<1.8&&s.right-s.left>15),groups=[];
  for(const s of [...v].sort((a,b)=>b.top-a.top)){const g=groups.find(g=>s.top>=g.bottom-36&&s.bottom<=g.top+36);if(g){g.items.push(s);Object.assign(g,bounds(g.items));}else groups.push({...s,items:[s]});}
  const load=info.text.find(t=>/^Load Type$/i.test(t.str.trim())),wind=load&&info.text.find(t=>/^Wind\s+load/i.test(t.str.trim())&&t.y<load.y);
  if(load&&wind){const top=load.y+load.h+4,bottom=wind.y+wind.h+5,items=v.filter(s=>s.top<=top+4&&s.bottom>=bottom);if(items.length){for(let j=groups.length-1;j>=0;j--)if(groups[j].top<=top+4&&groups[j].bottom>=bottom)groups.splice(j,1);groups.push({...bounds(items),top,bottom,items,loadTable:true});}}
  const tables=[];for(const g of groups){const xs=unique(g.items.map(s=>(s.left+s.right)/2));if(xs.length<3||xs.at(-1)-xs[0]<80)continue;let hs=h.filter(s=>s.top<=g.top+3&&s.bottom>=g.bottom-3&&s.left>=xs[0]-3&&s.right<=xs.at(-1)+3);if(hs.length<3)continue;let ys=unique(hs.map(s=>(s.top+s.bottom)/2)).reverse();if(g.loadTable){ys=ys.filter(y=>y<=g.top&&y>=g.bottom);ys.push(g.bottom);}else{ys.push(Math.min(g.bottom,ys.at(-1)));ys.push(Math.max(g.top,ys[0]));}ys=unique(ys).reverse();if(ys.length<3)continue;
   const box={left:xs[0],right:xs.at(-1),top:ys[0],bottom:ys.at(-1)},items=info.text.filter(t=>inside(t,box));if(items.length<3)continue;
   const cells=[];for(let col=0;col<xs.length-1;col++){let start=0;for(let end=1;end<ys.length;end++){const mid=(xs[col]+xs[col+1])/2,separator=end===ys.length-1||hs.some(s=>Math.abs((s.top+s.bottom)/2-ys[end])<1.3&&s.left<=mid&&s.right>=mid);if(!separator)continue;const cell={col,r0:start,r1:end,items:[]};cells.push(cell);start=end;}}
   for(const t of items){const x=t.x+Math.min(2,t.w/2),col=Math.max(0,Math.min(xs.length-2,xs.findIndex((a,j)=>j<xs.length-1&&x>=a-1&&x<xs[j+1]+.1))),y=t.y+t.h*.3;let cell=cells.find(c=>c.col===col&&y<=ys[c.r0]+.1&&y>=ys[c.r1]-.1);if(!cell)cell=cells.filter(c=>c.col===col).sort((a,b)=>Math.abs(y-(ys[a.r0]+ys[a.r1])/2)-Math.abs(y-(ys[b.r0]+ys[b.r1])/2))[0];cell.items.push(t);}
   const slots=Array(ys.length-1).fill(1);for(const cell of cells){cell.rows=textRows(cell.items);const colorFill=all.find(s=>s.filled&&s.right-s.left>10&&s.top-s.bottom>5&&Math.max(...s.color)-Math.min(...s.color)>.2&&s.left<=xs[cell.col]+2&&s.right>=xs[cell.col+1]-2&&s.top>=ys[cell.r0]-2&&s.bottom<=ys[cell.r1]+2);cell.fill=colorFill?.color;const need=cell.rows.length+(cell.fill?1:0);let have=slots.slice(cell.r0,cell.r1).reduce((a,b)=>a+b,0);if(have<need)slots[cell.r1-1]+=need-have;}
   const cuts=[0];for(let r=1;r<ys.length;r++)if(!cells.some(c=>c.r0<r&&c.r1>r))cuts.push(r);const parts=cuts.slice(1).map((end,i)=>({start:cuts[i],end,cells:cells.filter(c=>c.r0>=cuts[i]&&c.r1<=end)}));tables.push({kind:'table',...box,xs,ys,cells,slots,parts,items});
  }return tables;
 }
 function plan(info,all,file){
  info.text.forEach((t,i)=>t.id=i);const valid=info.text.filter(t=>!t.omit111&&t.y>=info.crop.bottom&&t.y<=info.crop.top),framing=valid.some(t=>/^(?:(?:[AB]\.[\d.]+\s*)?Functional Framing\b|Framing .+\s\|)/i.test(t.str));if(framing)return [{kind:'framing',...info.crop,items:valid}];
  const loadPath=valid.find(t=>/Vertical Load Path|Horizontal Load Path/i.test(t.str));
  if(loadPath){
   const banner=all.find(s=>s.filled&&s.right-s.left>(info.crop.right-info.crop.left)*.75&&s.top>loadPath.y&&s.bottom<loadPath.y);
   const prose=valid.filter(t=>/^The vertical stability|^The main building|^Horizontal Stability[.]/i.test(t.str));
   if(banner&&prose.length){const split=Math.max(...prose.map(t=>t.y+t.h*t.a))+4,head={...banner,kind:'figure',header:true,items:valid.filter(t=>t.y>=banner.bottom)},drawing={left:info.crop.left,right:info.crop.right,top:banner.bottom-1,bottom:split,kind:'figure',header:false,items:valid.filter(t=>t.y<banner.bottom&&t.y>split)};return [{kind:'zone',top:head.top,bottom:head.bottom,figs:[head],rows:[]},{kind:'zone',top:drawing.top,bottom:drawing.bottom,figs:[drawing],rows:[]},...textRows(valid.filter(t=>t.y<=split)).map(row=>({kind:'text',top:row.crop.top,bottom:row.crop.bottom,row}))];}
   const firstSection=valid.filter(t=>/^Section 1[–—-]1/.test(t.str)).sort((a,b)=>b.y-a.y)[0];
   if(banner&&firstSection){const split=firstSection.y+firstSection.h*firstSection.a+3,head={...banner,kind:'figure',header:true,items:valid.filter(t=>t.y>=banner.bottom)},drawing={left:info.crop.left,right:info.crop.right,top:split,bottom:info.crop.bottom,kind:'figure',header:false,items:valid.filter(t=>t.y<split)};return [{kind:'zone',top:head.top,bottom:head.bottom,figs:[head],rows:[]},...textRows(valid.filter(t=>t.y<banner.bottom&&t.y>=split)).map(row=>({kind:'text',top:row.crop.top,bottom:row.crop.bottom,row})),{kind:'zone',top:drawing.top,bottom:drawing.bottom,figs:[drawing],rows:[]}];}
  }
  const tables=tablePlans({...info,text:valid},all),used=new Set(tables.flatMap(t=>t.items.map(t=>t.id)));
  let g=all.filter(s=>s.top<=info.crop.top+1&&s.bottom>=info.crop.bottom-1&&!tables.some(t=>s.left>=t.left-2&&s.right<=t.right+2&&s.top<=t.top+2&&s.bottom>=t.bottom-2));
  const groups=[];for(const s of g){let hits=groups.filter(a=>intersects(a,s,6));if(!hits.length)groups.push({...s,parts:[s]});else{const a=hits[0];a.parts.push(s);for(const b of hits.slice(1)){a.parts.push(...b.parts);groups.splice(groups.indexOf(b),1);}Object.assign(a,bounds(a.parts));}}
  const figs=groups.filter(a=>(a.right-a.left>18&&a.top-a.bottom>12)||(a.image&&a.right-a.left>5)).map(a=>({...a,kind:'figure'}));
  // Deflection has a plan and labels in the right column; the left calculations are independent text.
  for(const a of figs){const header=a.top-a.bottom<42&&a.right-a.left>(info.crop.right-info.crop.left)*.75;const rightPlan=/Deflection/i.test(file)&&a.left>info.crop.left+(info.crop.right-info.crop.left)*.5&&a.top-a.bottom>45;
   if(rightPlan){a.left-=22;a.right+=18;a.top+=23;a.bottom-=30;}else if(!header){a.left-=3;a.right+=3;a.top+=12;a.bottom-=14;}a.left=Math.max(info.crop.left,a.left);a.right=Math.min(info.crop.right,a.right);a.top=Math.min(info.crop.top,a.top);a.bottom=Math.max(info.crop.bottom,a.bottom);a.header=header;
   a.items=valid.filter(t=>!used.has(t.id)&&(inside(t,a)||(rightPlan&&/^Wind [XY]$/.test(t.str.trim()))));for(const t of a.items)used.add(t.id);if(a.items.length){const tb=bounds(textRows(a.items).map(r=>r.crop));Object.assign(a,bounds([a,tb]));}
  }
  // Merge intersecting figure boxes before aligning nearby paragraphs, so a figure is never cut into strips.
  for(let i=0;i<figs.length;i++)for(let j=i+1;j<figs.length;)if(intersects(figs[i],figs[j],2)){const a=figs[i],b=figs[j];a.parts.push(...b.parts);a.items.push(...b.items);Object.assign(a,bounds([a,b]));figs.splice(j,1);}else j++;
  const rows=textRows(valid.filter(t=>!used.has(t.id))),zones=[];for(const fig of figs){let zone=zones.find(z=>fig.top>=z.bottom&&fig.bottom<=z.top);if(zone){zone.figs.push(fig);zone.top=Math.max(zone.top,fig.top);zone.bottom=Math.min(zone.bottom,fig.bottom);}else zones.push({kind:'zone',top:fig.top,bottom:fig.bottom,figs:[fig],rows:[]});}
  const body=[];for(const r of rows){const zone=zones.find(z=>r.base<=z.top&&r.base>=z.bottom);if(zone)zone.rows.push(r);else body.push({kind:'text',top:r.crop.top,bottom:r.crop.bottom,row:r});}
  return [...tables,...zones,...body].sort((a,b)=>b.top-a.top);
 }
 // Native TJ origins can precede the first visible glyph because of leading spaces.
 // Match against the nearest visible text run on the same baseline before clipping.
 function filtered(source,ops,items,textOnly,allItems){
  let ctm=[1,0,0,1,0,0],tm=[1,0,0,1,0,0],line=tm.slice(),leading=0,rise=0,stack=[],cuts=[];
  for(const {op,args,start,end}of ops){const n=args.map(t=>Number(t.value));if(op==='q')stack.push({ctm:ctm.slice(),leading,rise});else if(op==='Q'){const v=stack.pop();if(v){ctm=v.ctm;leading=v.leading;rise=v.rise;}}else if(op==='cm')ctm=multiply(ctm,n);else if(op==='BT'){tm=[1,0,0,1,0,0];line=tm.slice();}else if(op==='Tm'){tm=n;line=tm.slice();}else if(op==='TL')leading=n[0];else if(op==='Ts')rise=n[0];else if(op==='Td'||op==='TD'){if(op==='TD')leading=-n[1];line=multiply(line,[1,0,0,1,n[0],n[1]]);tm=line.slice();}else if(op==='T*'||op==="'"||op==='"'){line=multiply(line,[1,0,0,1,0,-leading]);tm=line.slice();}
   if(['Tj','TJ',"'",'"'].includes(op)){const m=multiply(ctm,multiply(tm,[1,0,0,1,0,rise])),x=m[4],y=m[5],candidates=allItems.filter(t=>Math.abs(y-t.y)<.22),distance=t=>Math.max(t.x-x,0,x-t.x-t.w),nearest=Math.min(...candidates.map(distance)),keep=candidates.some(t=>distance(t)<=nearest+.8&&items.includes(t));if(!keep){const t=args.at(-1);if(t)cuts.push({start:t.start,end:t.end,value:op==='TJ'?'[]':'()'});}}
   if(textOnly&&['S','s','f','F','f*','B','B*','b','b*','Do','sh'].includes(op))cuts.push({start,end,value:op==='Do'||op==='sh'?'':'n'});
  }cuts.sort((a,b)=>a.start-b.start);let out='',at=0;for(const c of cuts){if(c.start<at)continue;out+=source.slice(at,c.start)+c.value;at=c.end;}return out+source.slice(at);
 }
 async function compose(files,section){
  const {bytes,geometry}=await template(),paperDoc=await PDFLib.PDFDocument.load(bytes),doc=await PDFLib.PDFDocument.create(),font=await doc.embedFont(PDFLib.StandardFonts.Helvetica),papers=await doc.embedPages(paperDoc.getPages()),W=geometry.width,H=geometry.height,frame=geometry.frame,left=frame.left+6,right=frame.right-6,top=H-frame.top-7,bottom=H-frame.bottom+7,availableW=right-left,availableH=top-bottom,grid=geometry.rules.map(r=>H-(r.top+r.bottom)/2).filter(y=>y<top&&y>bottom).sort((a,b)=>b-a);
  const layouts=[],stats={sourcePages:0,pages:0,alignedRows:0,centeredRows:0,tables:[],figures:[],placements:[],headers:[],fallbacks:0};let current=null,cursor=top,previousNotes='';
  const fresh=()=>{const page=doc.addPage([W,H]);page.drawPage(papers[layouts.length?Math.min(1,papers.length-1):0],{x:0,y:0,width:W,height:H});current={page,framing:[]};layouts.push(current);cursor=top;};
  const lineIndex=(at,above=0)=>grid.findIndex(y=>y+above<=at+.01);
  for(const file of files){const src=await PDFLib.PDFDocument.load(file.base64,{parseSpeed:PDFLib.ParseSpeeds.Fastest}),pages=src.getPages().slice(),eligible=(section==='A'&&/^Overall-[BD][.]pdf$/.test(file.file||''))||pages.length===1&&new RegExp('^Section-'+section+'-RC-\\d+\\.pdf$').test(file.file||''),inspected=await inspect(file.base64,eligible),pending=[];let introHeader111=null;stats.sourcePages+=pages.length;
   for(const [pageIndex,page]of pages.entries()){
    const info=inspected[pageIndex];if(section==='A'&&file.file==='Section-A-Intro.pdf')info.text.forEach(t=>{if(t.str.trim()==='Section A')t.omit111=true;});const source=contents(page),ops=operations(source),all=shapes(source,ops),blocks=plan(info,all,file.file||''),c=info.crop,scale=Math.min(1,availableW/(c.right-c.left)),foundation=/Foundation/i.test(file.file||''),noteTitle=section==='A'&&pages.length===1?info.text.map(t=>t.str).join(' '):'',notes=/Robustness\s*&\s*Progressive Collapse/i.test(noteTitle)?'robustness':/Other Considerations/i.test(noteTitle)?'other':'',continueNotes=notes==='other'&&previousNotes==='robustness',introFlow=section==='A'&&file.file==='Section-A-Intro.pdf';if(!eligible&&!continueNotes&&!(introFlow&&pageIndex>0))current=null;
    // Fit a native diagram page as a unit when a modest diagram reduction prevents an orphan caption.
    const figureScale=(block,factor)=>{const b=bounds(block.figs);return Math.min(scale,availableH/(b.top-b.bottom))*(block.figs.every(f=>f.header)?1:factor);};
    const fitsPage=(factor,start=top)=>{let at=start;const rowEnd=(row,at)=>{const i=lineIndex(at,(row.crop.top-row.base)*scale);return i<0?-Infinity:grid[i]-(row.base-row.crop.bottom)*scale-2;};for(const block of blocks){if(block.kind==='text')at=rowEnd(block.row,at);else if(block.kind==='zone'){const b=bounds(block.figs),start=at;for(const row of block.rows)at=rowEnd(row,at);at=Math.min(at,start-(b.top-b.bottom)*figureScale(block,factor)-3);}else if(block.kind==='table'){for(const part of block.parts){const count=block.slots.slice(part.start,part.end).reduce((a,b)=>a+b,0),i=lineIndex(at);if(i<0||i+count>=grid.length)return false;at=grid[i+count];}at-=2;}else return false;if(at<bottom)return false;}return true;};
    let figureFactor=1;if(!eligible&&!fitsPage(1)&&fitsPage(.75)){let lo=.75,hi=1;for(let n=0;n<14;n++){const mid=(lo+hi)/2;if(fitsPage(mid))lo=mid;else hi=mid;}figureFactor=lo;}
    if(eligible&&current&&!fitsPage(1,cursor)&&fitsPage(1,grid[0]-2))current=null;
    const begin=()=>{fresh();if(eligible&&info.trim){const text=/^Overall-[BD][.]pdf$/.test(file.file||'')?'Overall Check - face '+file.file.charAt(8):section==='A'?'Scheme 1 - RC':'Section B',baseline=grid[0];current.page.drawText(text,{x:left,y:baseline,font,size:9});stats.headers.push({outputPage:layouts.length,baseline,text});cursor=baseline-2;}};
    function place(items,crop,x,y,s,textOnly,repeated=false){if(![x,y,s].every(Number.isFinite))throw Error('Invalid placement '+JSON.stringify({file:file.file,page:pageIndex+1,x,y,s,items:items.map(t=>t.str)}));const p=src.addPage([page.getWidth(),page.getHeight()]);p.node.set(PDFLib.PDFName.of('Resources'),page.node.Resources());p.node.set(PDFLib.PDFName.of('Contents'),src.context.register(src.context.flateStream(Uint8Array.from(filtered(source,ops,items,textOnly,info.text),c=>c.charCodeAt(0)))));const record={file:file.file,sourcePage:pageIndex+1,outputPage:layouts.length,x,y,w:(crop.right-crop.left)*s,h:(crop.top-crop.bottom)*s,scale:s,crop,aligned:textOnly,repeated,items:items.map(t=>t.id),text:items.map(t=>t.str).join(' ')};pending.push({page:p,crop,out:current.page,record});stats.placements.push(record);return record;}
    function textRow(row,baseline,forceLeft=foundation,repeated=false){const crop=row.crop,x=forceLeft?left:left+(crop.left-c.left)*scale,y=baseline-(row.base-crop.bottom)*scale;const record=place(row.items,crop,x,y,scale,true,repeated);record.baseline=baseline;record.sourceBaseline=row.base;stats.alignedRows++;return record;}
    function normal(row){if(!current)begin();const above=(row.crop.top-row.base)*scale;let idx=lineIndex(cursor,above);if(idx<0||grid[idx]-(row.base-row.crop.bottom)*scale<bottom){begin();idx=lineIndex(cursor,above);}if(idx<0)throw Error('正文无法排入线纸');const record=textRow(row,grid[idx]);cursor=record.y-2;}
    for(const block of blocks){
     if(block.kind==='text'){normal(block.row);continue;}
     if(block.kind==='framing'){if(current)current=null;begin();const s=Math.min(scale,availableH/(block.top-block.bottom)),x=left+(availableW-(block.right-block.left)*s)/2,y=top-(block.top-block.bottom)*s;place(block.items,block,x,y,s,false);current.framing.push({x,y,w:(block.right-block.left)*s,h:(block.top-block.bottom)*s,scale:s,crop:block,info,aligned:false});stats.figures.push({file:file.file,page:layouts.length,kind:'framing'});current=null;continue;}
     if(block.kind==='zone'){
      if(!current)begin();const fbox=bounds(block.figs),s=figureScale(block,figureFactor),figureHeight=(fbox.top-fbox.bottom)*s;let start=cursor;
      const simulate=at=>{for(const row of block.rows){const i=lineIndex(at,(row.crop.top-row.base)*scale);if(i<0)return -Infinity;at=grid[i]-(row.base-row.crop.bottom)*scale-2;}return at;};let textEnd=simulate(start);if(Math.min(start-figureHeight,textEnd)<bottom){begin();start=cursor;textEnd=simulate(start);}if(textEnd<bottom)throw Error('图旁正文超出页面：'+file.file+'，第 '+(pageIndex+1)+' 页');
      for(const fig of block.figs){const x=left+(fbox.left-c.left)*scale+(fbox.right-fbox.left)*(scale-s)/2+(fig.left-fbox.left)*s,y=start-(fbox.top-fig.bottom)*s;place(fig.items,fig,x,y,s,false);stats.figures.push({file:file.file,page:layouts.length,x,y,w:(fig.right-fig.left)*s,h:(fig.top-fig.bottom)*s,kind:'figure'});}
      for(const row of block.rows){const i=lineIndex(cursor,(row.crop.top-row.base)*scale);const record=textRow(row,grid[i]);cursor=record.y-2;}cursor=Math.min(cursor,start-figureHeight-3);continue;
     }
     if(block.kind==='table'){
      const xs=block.xs.map(x=>left+(x-c.left)*scale),header=block.parts[0],hasFloorHeader111=introFlow&&header.cells.some(c=>c.items.some(t=>t.str.trim()==='Floor')),carry111=introFlow&&!hasFloorHeader111&&introHeader111?.columns===block.xs.length?introHeader111:null;let first=true;
      const slotsIn=part=>block.slots.slice(part.start,part.end).reduce((a,b)=>a+b,0);
      const drawPart=(part,repeated=false)=>{const needed=slotsIn(part);let idx=lineIndex(cursor);if(idx<0||idx+needed>=grid.length)return false;const offsets=[0];for(let r=part.start;r<part.end;r++)offsets.push(offsets.at(-1)+block.slots[r]);const ys=offsets.map(i=>grid[idx+i]);
       for(const cell of part.cells){const a=cell.r0-part.start,b=cell.r1-part.start,x=xs[cell.col],w=xs[cell.col+1]-x,yt=ys[a],yb=ys[b];
        // Keep paper rules out of cells so they cannot run through centered glyphs.
        current.page.drawRectangle({x,y:yb,width:w,height:yt-yb,color:PDFLib.rgb(...(cell.fill||[1,1,1])),borderColor:PDFLib.rgb(.15,.15,.15),borderWidth:.9});
        if(!cell.rows.length)continue;
        const pitch=grid[idx]-grid[idx+1],rows=cell.rows,s=Math.min(scale,(w-6)/Math.max(...rows.map(r=>r.crop.right-r.crop.left))),above=(rows[0].crop.top-rows[0].base)*s,below=(rows.at(-1).base-rows.at(-1).crop.bottom)*s,firstBase=(yt+yb+(rows.length-1)*pitch+below-above)/2;
        for(const [j,row]of rows.entries()){const crop=row.crop,baseline=firstBase-j*pitch,record=place(row.items,crop,x+(w-(crop.right-crop.left)*s)/2,baseline-(row.base-crop.bottom)*s,s,true,repeated);record.baseline=baseline;record.sourceBaseline=row.base;record.cell={left:x,right:x+w,top:yt,bottom:yb};stats.centeredRows++;}
       }stats.tables.push({file:file.file,sourcePage:pageIndex+1,outputPage:layouts.length,xs,ys,repeated,rows:part.end-part.start,borderWidth:.9});cursor=ys.at(-1);return true;};
      if(hasFloorHeader111)introHeader111={columns:block.xs.length,slots:slotsIn(header),repeat:()=>drawPart(header,true)};
      for(const [partIndex,part]of block.parts.entries()){
       if(!current){begin();if(carry111)carry111.repeat();}
       // Keep the heading row with at least the first data row when flowing an introduction.
       const idx=lineIndex(cursor),need=slotsIn(part)+(introFlow&&first&&!carry111&&block.parts[partIndex+1]?slotsIn(block.parts[partIndex+1]):0);
       if(idx<0||idx+need>=grid.length||!drawPart(part)){
        begin();const repeat=carry111||(!first&&header!==part?{slots:slotsIn(header),repeat:()=>drawPart(header,true)}:null);
        if(repeat&&repeat.slots+slotsIn(part)<grid.length-1)repeat.repeat();
        if(!drawPart(part))throw Error('表格单元格超过一页，请缩短该单元格内容');
       }first=false;
      }
      if(!(introFlow&&(hasFloorHeader111||carry111)&&pageIndex<pages.length-1&&block===blocks.at(-1)))cursor-=2;
     }
    }if(!eligible&&notes!=='robustness'&&!(introFlow&&pageIndex<pages.length-1))current=null;previousNotes=notes;
   }
   const embedded=await doc.embedPages(pending.map(p=>p.page),pending.map(p=>p.crop));for(const [i,p]of pending.entries())p.out.drawPage(embedded[i],{x:p.record.x,y:p.record.y,width:p.record.w,height:p.record.h});
  }
  stats.pages=layouts.length;for(const [i,l]of layouts.entries()){if(l.framing.length)rules(l.page,geometry,l.framing);const t='Section '+section+' - '+(i+1)+' / '+stats.pages;l.page.drawText(t,{x:(W-font.widthOfTextAtSize(t,9))/2,y:15,size:9,font});}
  return {bytes:await doc.save({objectsPerTick:Infinity}),stats};
 }
 return {compose};
})();
