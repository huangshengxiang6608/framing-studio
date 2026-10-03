const RightInputPreview=(()=>{
 const folds=new Map(),manual=new Set(),wallPositions=new Map();let active='';
 const fieldKey=e=>e.id||[active,e.dataset.action,e.dataset.i,e.dataset.f,e.dataset.previewWall].join('|');
 function fold(side,title,nodes,key,open=false){nodes=nodes.filter(Boolean);if(!nodes.length)return;const d=document.createElement('details');d.className='preview-fold';d.dataset.previewFold=key;d.open=folds.get(key)??open;const s=document.createElement('summary');s.textContent=title;const b=document.createElement('div');b.className='preview-fold-body';nodes[0].before(d);d.append(s,b);nodes.forEach(n=>b.append(n));return d;}
 function legend(side){side.querySelectorAll('.input-colour-key').forEach(e=>e.remove());const d=document.createElement('div');d.className='input-colour-key';for(const [cls,text] of [['auto','灰蓝：自动／固定'],['default','浅绿：默认，可修改'],['required','黄色：手动输入']]){const s=document.createElement('span');s.className='input-key-'+cls;s.textContent=text;d.append(s)}side.prepend(d);}
 function decorate(tab,h){active=tab;const side=document.getElementById('side');
  if(tab==='walls'){
   const wrap=side.querySelector('.table-wrap'),table=wrap?.querySelector('table');
   if(table){const th=document.createElement('th');th.textContent='轴线位置';table.tHead.rows[0].insertBefore(th,table.tHead.rows[0].cells[3]);[...table.tBodies[0].rows].forEach((row,i)=>{const w=h.p.types[h.key].walls[i],a=Engine.resolve(h.p,w.a,h.key),z=Engine.resolve(h.p,w.z,h.key),horizontal=Math.abs(a[1]-z[1])<1e-6,cell=row.insertCell(3);cell.dataset.label='轴线位置';const select=document.createElement('select');select.className='preview-wall-position';select.dataset.previewWall=h.key+'|'+w.id;select.setAttribute('aria-label',w.id+' 轴线位置');[['auto','自动 · 朝 Opening'],...(horizontal?[['up','上'],['center','居中'],['down','下']]:[['left','左'],['center','居中'],['right','右']])].forEach(([value,text])=>select.add(new Option(text,value)));select.value=w.axisPosition||'auto';select.dataset.inputState=select.value==='auto'?'default':'manual';cell.append(select)});fold(side,'墙明细',[wrap],'wall-details',true)}
   side.querySelectorAll('.notice').forEach(n=>{if(n.textContent.startsWith('墙明细就在图旁边。'))n.remove()});
  }
  if(tab==='columns'){
   const children=[...side.children],intro=children.filter(e=>e.tagName==='H2'||e.classList.contains('muted')),settings=children.find(e=>e.querySelector('#colmode'));
   fold(side,'常用参数',[settings],'column-defaults',true);const legend=document.createElement('p');legend.className='preview-colour-pair';legend.innerHTML='<span>蓝色：Column above／上层柱</span><span style="color:#593696">紫色：Column below／下层柱</span>';side.append(legend);
   side.querySelectorAll(':scope > .table-wrap').forEach(e=>e.remove());


   const notes=[...side.children].filter(e=>e.classList.contains('notice')&&!e.querySelector('button'));
   notes.forEach(n=>n.remove());
  }
  if(tab==='beams'){
   side.querySelectorAll('.notice').forEach(n=>{if(n.textContent.startsWith('主梁深＝'))n.remove()});
   const mb=side.querySelector('input[data-action="default"][data-f="mb"]');if(mb){const out=document.createElement('output');out.className='preview-beam-auto';out.textContent='自动跟随相接柱宽';mb.replaceWith(out)}
   const rows=[...side.children].filter(e=>e.matches('.row')&&e.querySelector('[data-action="default"],[data-action="framing-depth"],.preview-beam-auto'));
   fold(side,'常用参数',rows,'beam-defaults',true);
   const areaTitle=[...side.children].find(e=>e.tagName==='H3'&&e.textContent.includes('次梁 Area'));
   if(areaTitle){const nodes=[];for(let n=areaTitle;n&&!n.matches('[data-preview-fold="beam-manual"]');n=n.nextElementSibling)nodes.push(n);fold(side,'次梁分区',nodes,'beam-areas',false);areaTitle.remove()}

  }
  if(tab==='loading'){
   const overview=side.querySelector('#lg-overview');fold(side,'本层荷载图例',[overview],'load-overview',false);
  }
  side.querySelectorAll('input,select,textarea').forEach(e=>{if(['checkbox','range','file','hidden'].includes(e.type)||e.readOnly||e.disabled)return;if(manual.has(fieldKey(e)))e.dataset.inputState='manual';else if(e.id==='lg-dl'&&e.value==='10'||e.dataset.action==='framing-depth')e.dataset.inputState='default';else if(!e.dataset.inputState)e.dataset.inputState=e.value===''?'required':'manual'});
  legend(side);
 }
 document.addEventListener('toggle',e=>{if(e.target.matches?.('#side details[data-preview-fold]'))folds.set(e.target.dataset.previewFold,e.target.open)},true);
 document.addEventListener('input',e=>{if(e.target.matches?.('#side input:not([readonly]),#side select,#side textarea')){manual.add(fieldKey(e.target));e.target.dataset.inputState='manual';queueMicrotask(()=>{if(e.target.isConnected)e.target.dataset.inputState='manual'})}},true);
 document.addEventListener('change',e=>{if(e.target.dataset.previewWall){const value=e.target.value,[key,id]=e.target.dataset.previewWall.split('|');StudioHost.transact(()=>{const w=StudioHost.get().p.types[key].walls.find(w=>w.id===id);if(!w)throw Error('墙已不存在');w.axisPosition=value;});}},true);
 document.addEventListener('DOMContentLoaded',()=>{for(const type of ['input','change'])document.addEventListener(type,e=>{if(e.target.closest?.('#side')&&manual.has(fieldKey(e.target)))e.target.dataset.inputState='manual'});});
 document.addEventListener('DOMContentLoaded',()=>{const nav=document.getElementById('nav'),beam=nav.querySelector('[data-tab="beams"]'),loading=nav.querySelector('[data-tab="loading"]');beam.before(loading);[...nav.querySelectorAll('button[data-tab]')].forEach((b,i)=>{const s=b.querySelector('span');if(s)s.textContent=String(i+1).padStart(2,'0')});});

 return {decorate};
})();
