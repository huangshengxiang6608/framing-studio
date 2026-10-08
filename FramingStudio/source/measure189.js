/* Plan-only, transient dimensions. Never writes project or calculation data. */
const Measure189=(()=>{
 const fmt=n=>Number(n.toFixed(3)).toString();
 function geometry(a,b,at,mode){
  const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
  if(length<1e-8)return null;
  if(mode==='X')return Math.abs(dx)<1e-8?null:{a:[a[0],at[1]],b:[b[0],at[1]],value:Math.abs(dx),dx,dy};
  if(mode==='Y')return Math.abs(dy)<1e-8?null:{a:[at[0],a[1]],b:[at[0],b[1]],value:Math.abs(dy),dx,dy};
  const n=[-dy/length,dx/length],offset=(at[0]-a[0])*n[0]+(at[1]-a[1])*n[1];
  return {a:[a[0]+n[0]*offset,a[1]+n[1]*offset],b:[b[0]+n[0]*offset,b[1]+n[1]*offset],value:length,dx,dy};
 }
 function create({canvas,get,redraw,enter,leave}){
  let active=false,project,scope='',view='',items=new Map(),pending=[],hover=null,pan=false,candidates=[],modelRef;
  const button=document.createElement('button');button.id='measure189';button.textContent='量距';button.title='選兩點，再點一下放置尺寸線';button.setAttribute('aria-pressed','false');
  const controls=document.createElement('span');controls.id='measure-controls189';controls.hidden=true;
  controls.innerHTML='<select id="measure-mode189" aria-label="量距方向"><option value="aligned">斜向／實距</option><option value="X">水平 X</option><option value="Y">垂直 Y</option></select> <button id="measure-undo189" title="刪除本層最後一條量距">撤回量距</button> <button id="measure-clear189">清除量距</button>';
  document.getElementById('drawtool').after(button,controls);
  const mode=controls.querySelector('select'),undo=controls.querySelector('#measure-undo189'),clear=controls.querySelector('#measure-clear189');
  const allowed=s=>s.mode==='plan'&&!['elevation','foundation','sections','steel','truss','excel','reportA','reportB'].includes(s.tab);
  function list(){if(!items.has(scope))items.set(scope,[]);return items.get(scope);}
  function ui(){button.setAttribute('aria-pressed',String(active));controls.hidden=!active;undo.disabled=!pending.length&&!list().length;clear.disabled=!list().length;canvas.style.cursor=pan?'grabbing':active?'crosshair':'';
   if(active){document.getElementById('selecttool').setAttribute('aria-pressed','false');document.getElementById('drawtool').setAttribute('aria-pressed','false');document.getElementById('hint').textContent='量距：選兩點 → 放置尺寸線 · Alt 取消捕捉 · Delete 撤回量距 · Esc 取消／退出 · 中鍵／空格拖動平移';}
  }
  function sync(){const s=get(),next=s.floor+'|'+s.key;
   if(project!==s.p){project=s.p;items.clear();pending=[];hover=null;modelRef=null;}
   if(scope!==next||view!==s.tab){scope=next;view=s.tab;pending=[];hover=null;modelRef=null;}
   if(!allowed(s)){active=false;pending=[];hover=null;}
   button.disabled=!allowed(s);ui();return s;
  }
  function stop(){active=false;pending=[];hover=null;pan=false;ui();leave();redraw();}
  button.onclick=()=>{sync();if(active){stop();return;}enter();active=true;pending=[];hover=null;ui();redraw();};
  mode.onchange=()=>{pending=[];hover=null;ui();redraw();};
  function remove(){if(pending.length){pending=[];hover=null;}else list().pop();ui();redraw();}
  undo.onclick=remove;clear.onclick=()=>{list().length=0;pending=[];hover=null;ui();redraw();};
  function snaps(s){const m=s.model;if(modelRef===m)return candidates;modelRef=m;candidates=[];const seen=new Set();
   const add=(p,label)=>{if(!p?.every(Number.isFinite))return;const k=p.join(',');if(!seen.has(k)){seen.add(k);candidates.push({p,label});}};
   for(const c of m.columns||[]){const r=Engine.columnRect(c);add([r.x,r.y],'柱中心');}
   for(const b of [...m.beams||[],...m.walls||[]]){add(b.a,'端點');add(b.z,'端點');add([(b.a[0]+b.z[0])/2,(b.a[1]+b.z[1])/2],'中點');}
   for(const slab of m.slabs||[])for(const x of [slab.x0,slab.x1])for(const y of [slab.y0,slab.y1])add([x,y],'板角點');
   for(const x of Engine.axes(s.p,'x',s.key))for(const y of Engine.axes(s.p,'y',s.key))add([x.v,y.v],'軸線交點');
   return candidates;
  }
  function pick(e,s){const r=canvas.getBoundingClientRect(),p=s.plot.world(e.clientX-r.left,e.clientY-r.top);let best={p,label:''},distance=10/s.plot.scale;
   if(!e.altKey&&pending.length<2)for(const c of snaps(s)){const d=Math.hypot(c.p[0]-p[0],c.p[1]-p[1]);if(d<distance){best=c;distance=d;}}return best;
  }
  function block(e){e.preventDefault();e.stopImmediatePropagation();}
  canvas.addEventListener('pointerdown',e=>{const s=sync();if(!active||!s.plot)return;
   if(e.button===1||(e.button===0&&s.spaceHeld)){pan=true;return;}
   if(e.button!==0)return;block(e);canvas.focus({preventScroll:true});hover=pick(e,s);
   if(pending.length<2){if(pending.length===1&&!geometry(pending[0],hover.p,hover.p,mode.value))return;pending.push([...hover.p]);}
   else{list().push({a:pending[0],b:pending[1],at:[...hover.p],mode:mode.value});pending=[];}
   ui();redraw();
  },true);
  canvas.addEventListener('pointermove',e=>{if(!active||pan)return;const s=get();if(!s.plot)return;block(e);hover=pick(e,s);redraw();},true);
  canvas.addEventListener('pointerup',e=>{if(!active)return;if(pan){pan=false;return;}if(e.button===0)block(e);},true);
  canvas.addEventListener('pointercancel',()=>{pan=false;});
  canvas.addEventListener('contextmenu',e=>{if(active){block(e);pending=[];hover=null;ui();redraw();}},true);
  canvas.addEventListener('pointerleave',()=>{if(!pan){hover=null;redraw();}});
  window.addEventListener('blur',()=>{pan=false;hover=null;});
  window.addEventListener('keydown',e=>{if(!active||e.isComposing||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)||e.target.isContentEditable)return;
   if(e.key==='Escape'){block(e);if(pending.length){pending=[];hover=null;ui();redraw();}else stop();}
   else if(['Delete','Backspace'].includes(e.key)||(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){block(e);remove();}
  },true);
  function draw(ctx,plot,w,h){const s=sync();if(!allowed(s)||!plot)return;const screen=p=>[plot.ox+p[0]*plot.scale,plot.oy+p[1]*plot.scale];
   ctx.save();ctx.lineWidth=1.5;ctx.font='600 12px Segoe UI, sans-serif';ctx.strokeStyle='#b33822';ctx.fillStyle='#b33822';
   const line=(a,b)=>{ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();};
   const label=(text,x,y)=>{const width=ctx.measureText(text).width+12;x=Math.max(width/2+4,Math.min(w-width/2-4,x));y=Math.max(18,Math.min(h-10,y));ctx.fillStyle='#fff';ctx.fillRect(x-width/2,y-14,width,20);ctx.fillStyle='#a82d1b';ctx.textAlign='center';ctx.fillText(text,x,y);};
   const dimension=(d,preview)=>{const g=geometry(d.a,d.b,d.at,d.mode);if(!g)return;const a=screen(g.a),b=screen(g.b),pa=screen(d.a),pb=screen(d.b);ctx.setLineDash(preview?[5,3]:[]);ctx.lineWidth=4;ctx.strokeStyle='#fff';line(pa,a);line(pb,b);line(a,b);ctx.lineWidth=1.5;ctx.strokeStyle='#b33822';line(pa,a);line(pb,b);line(a,b);ctx.setLineDash([]);
    const len=Math.hypot(b[0]-a[0],b[1]-a[1]),u=[(b[0]-a[0])/len,(b[1]-a[1])/len];
    for(const [q,sign]of [[a,1],[b,-1]]){line(q,[q[0]+sign*u[0]*7-u[1]*3,q[1]+sign*u[1]*7+u[0]*3]);line(q,[q[0]+sign*u[0]*7+u[1]*3,q[1]+sign*u[1]*7-u[0]*3]);}
    label((d.mode==='aligned'?'L':d.mode)+' = '+fmt(g.value)+' m',(a[0]+b[0])/2,(a[1]+b[1])/2-8);
   };
   for(const d of list())dimension(d,false);
   if(active){
    if(pending.length&&hover)dimension({a:pending[0],b:pending[1]||hover.p,at:hover.p,mode:mode.value},true);
    for(const q of pending){const a=screen(q);ctx.fillStyle='#b33822';ctx.beginPath();ctx.arc(...a,3,0,Math.PI*2);ctx.fill();}
    if(hover){const [x,y]=screen(hover.p);ctx.strokeStyle='#007f9b';ctx.strokeRect(x-5,y-5,10,10);if(hover.label)label(hover.label,x,y-14);}
    const status=pending.length===0?'點選第一點':pending.length===1?'點選第二點':'點選尺寸線位置';
    const text='量距 · '+status;ctx.font='12px Segoe UI, sans-serif';label(text,90,h-16);
   }
   plot.measurements189=list().map(d=>({...d,...geometry(d.a,d.b,d.at,d.mode)}));ctx.restore();
  }
  return {sync,draw,stop,get active(){return active;}};
 }
 return {create,geometry};
})();
