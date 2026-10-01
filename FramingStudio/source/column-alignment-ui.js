const ColumnAlignmentUI=(()=>{
 let host,options,plan;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const number=v=>(Math.abs(v)<1e-8?0:v).toFixed(3);
 function choices(list,value){return list.map(([v,s])=>'<option value="'+esc(v)+'" '+(String(v)===String(value)?'selected':'')+'>'+esc(s)+'</option>').join('');}
 function select(label,key,list){return '<label class="field">'+label+'<select data-ca-option="'+key+'">'+choices(list,options[key])+'</select></label>';}
 function render(h){
  const {p,result,floor}=h;if(!options||options.floor>p.total||options.hi>p.total)options={floor,lo:1,hi:p.total,basis:'floor',edge:'center',column:'all'};
  if(plan&&plan.stamp!==JSON.stringify(p))plan=null;
  const floors=result.floors.map(f=>[f.n,FloorLevels.name(p,f.n)+' · '+f.type]),ref=result.floors[options.floor-1],cols=result.models[ref.type].columns;
  if(options.column!=='all'&&!cols.some(c=>c.id===options.column))options.column='all';
  const required=result.floors.filter(f=>f.n>=options.lo&&f.n<=options.hi).map(f=>({name:FloorLevels.name(p,f.n),min:ColumnAlignment.minimum(p,f)}));
  let html='<section class="column-alignment"><h3>上下层柱对齐</h3><p>先选基准与范围，再预览。可以让下层退入，也可以移动上层；未应用时保留当前自动／手动柱位。</p><div class="row">'+select('定位方式','basis',[['floor','按基准楼层'],['axes','按基准楼层柱轴线'],['keep','保持当前位置']])+select('基准楼层（上层／下层均可）','floor',floors)+'</div><div class="row">'+select('对齐位置','edge',[['center','柱中心'],['left','左边 · X−'],['right','右边 · X＋'],['top','上边 · Y−'],['bottom','下边 · Y＋']])+select('基准柱','column',[['all','全部同定位柱'],...cols.map(c=>[c.id,c.id+(c.isTransferColumn?' · 转换柱保留':'')])])+'</div><div class="row">'+select('应用起始层','lo',floors)+select('应用结束层','hi',floors)+'</div><p class="muted">各层已有要求：'+required.map(r=>esc(r.name)+' '+(r.min?number(r.min)+' m':'未设数值下限')).join('；')+'。自动沿用前面各层设置，同时检查截面不重叠、边界、洞口及墙。边齐时另一方向按中心对齐。</p><div class="row"><button data-ca="preview">预览对齐</button><button data-ca="cancel">取消预览</button></div>';
  if(plan){html+='<div class="ca-preview" role="status"><b>'+(plan.errors.length?'无法应用 · 请处理以下项目':plan.moves.length?'预览 · '+plan.moves.length+' 根楼层柱，'+plan.beams.length+' 根 Framing 梁同步更新':'无需移动 · 当前位置保持不变')+'</b>';
   if(plan.errors.length)html+='<ul class="issue">'+plan.errors.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul>';
   if(plan.moves.length)html+='<p>图中灰色虚线为原位，'+(plan.ok?'青色':'红色')+'为拟定位置，尚未修改项目。</p><div class="table-wrap ca-moves"><table><thead><tr><th>楼层／柱</th><th>ΔX m</th><th>ΔY m</th><th>最小距 m</th></tr></thead><tbody>'+plan.moves.map(m=>'<tr><td>'+esc(FloorLevels.name(p,m.floor)+' · '+m.id)+'</td><td>'+number(m.dx)+'</td><td>'+number(m.dy)+'</td><td>'+number(m.minimum)+'</td></tr>').join('')+'</tbody></table></div>';
   if(plan.clones.length)html+='<p>'+plan.clones.map(c=>esc(c.from+' → '+c.to)+'：'+c.floors.map(f=>esc(FloorLevels.name(p,f))).join('、')).join('；')+'。范围外楼层仍使用原 Framing。</p>';
   if(plan.beams.length)html+='<details><summary>同步更新的梁</summary><p>'+plan.beams.map(b=>esc(b.type+' · '+b.id)).join('、')+'</p></details>';
   if(plan.skipped.length)html+='<details><summary>保留原位的转换柱</summary><p>'+plan.skipped.map(esc).join('<br>')+'</p></details>';
   html+='<p class="muted">应用后更新梁、板及所选构件对应关系；荷载与 Check 需按新几何重算。转换柱不参与移动。</p><button data-ca="apply" '+(!plan.ok?'disabled':'')+'>应用对齐</button></div>';
  }
  return html+'</section>';
 }
 function init(h){host=h;document.addEventListener('change',e=>{const field=e.target.dataset.caOption;if(!field)return;options[field]=['floor','lo','hi'].includes(field)?Number(e.target.value):e.target.value;if(field==='floor')options.column='all';plan=null;host.refresh();});document.addEventListener('click',e=>{const a=e.target.closest('[data-ca]')?.dataset.ca;if(!a)return;try{if(a==='cancel'){plan=null;host.refresh();return;}if(a==='preview'){const {p}=host.get();plan=ColumnAlignment.preview(p,options);host.previewFloor(options.lo);host.refresh();return;}if(a==='apply'){const saved=plan;const ok=host.transact(()=>ColumnAlignment.apply(host.get().p,saved));if(ok){plan=null;host.applied();host.toast('柱对齐已应用，梁板已同步更新 · 可撤销；请更新 Check');}}}catch(e){host.toast(e.message);}});}
 function overlay(ctx,plot,h){if(!plan||plan.stamp!==JSON.stringify(h.p)||!plot)return;ctx.save();for(const m of plan.moves.filter(m=>m.floor===h.floor)){const x=v=>plot.ox+v*plot.scale,y=v=>plot.oy+v*plot.scale;ctx.lineWidth=2;ctx.strokeStyle='#758692';ctx.setLineDash([4,3]);ctx.strokeRect(x(m.from[0]-m.b/2),y(m.from[1]-m.d/2),m.b*plot.scale,m.d*plot.scale);ctx.setLineDash([]);ctx.strokeStyle=plan.ok?'#008896':'#c03d44';ctx.fillStyle=plan.ok?'rgba(0,136,150,.16)':'rgba(192,61,68,.15)';ctx.fillRect(x(m.to[0]-m.b/2),y(m.to[1]-m.d/2),m.b*plot.scale,m.d*plot.scale);ctx.strokeRect(x(m.to[0]-m.b/2),y(m.to[1]-m.d/2),m.b*plot.scale,m.d*plot.scale);ctx.beginPath();ctx.moveTo(x(m.from[0]),y(m.from[1]));ctx.lineTo(x(m.to[0]),y(m.to[1]));ctx.stroke();}ctx.restore();}
 return {init,render,overlay};
})();
