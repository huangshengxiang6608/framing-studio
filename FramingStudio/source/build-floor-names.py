from pathlib import Path
import re, shutil

work=Path('tmp/framing_floor_names')
old=Path('outputs/framing_01a093aa/desktop/FramingStudio_E2.68_Windows')
dest=old.with_name('FramingStudio_E2.69_Windows')
read=lambda p:p.read_text(encoding='utf-8-sig')
if not dest.exists():
    shutil.copytree(old,dest,ignore=shutil.ignore_patterns('FramingStudio_E2.*_Windows','文件校验.json'))
html=read(old/'assets/index.html')

def change(text,a,b):
    assert a in text,a[:160]
    return text.replace(a,b)

def save(name,text):
    global html
    before=read(old/'source'/name)
    assert html.count(before)==1,name
    html=html.replace(before,text)
    (dest/'source'/name).write_text(text,encoding='utf8')

helper=read(work/'floor-levels.js')
(dest/'source/floor-levels.js').write_text(helper,encoding='utf8')
engine=next(m.group(1) for m in re.finditer(r'<script>([\s\S]*?)</script>',html) if 'const Engine=' in m.group(1))
updated=change(engine,"a.push({n,h:g.h", "a.push({n,name:FloorLevels.name(p,n),basement:FloorLevels.isBasement(FloorLevels.name(p,n)),h:g.h")
updated=change(updated,"if(v.names!==undefined&&", "if(v.basementFromNames!==undefined&&typeof v.basementFromNames!=='boolean')fail('地下室识别设置无效');if(v.names!==undefined&&")
html=html.replace('<script>'+engine+'</script>','<script>'+helper+'</script>\n<script>'+updated+'</script>')
(dest/'source/engine.js').write_text(updated,encoding='utf8')

app=read(old/'source/app.js')
app=change(app,'try{fn();Engine.validate(p);','try{fn();FloorLevels.syncBasement(p);Engine.validate(p);')
start=app.index(' function levelsUI()')
end=app.index(' function geometryChange(',start)
app=app[:start]+read(work/'levels-ui.js')+'\n'+app[end:]
app=change(app,"if(k!=='height')return false;", "if(k==='basement'&&FloorLevels.managed(p)){toast('Basement 已按楼层名称自动识别，请在楼层设置修改');return true;}if(k!=='height')return false;")
app=change(app,"+input(groupTotal,'project',0,'total')", "+input(groupTotal,'project',0,'total')")
app=change(app,'<label class="field">总层数', '<label class="field">总层数（含地下室）')
app=change(app,"input(g.start,'group',i,'start'),input(g.end,'group',i,'end','text')", "groupBoundary(g.start,i,'start'),groupBoundary(g.end,i,'end')")
app=change(app,"if(f==='end'&&v!=='顶层')v=v.trim()===''?null:Number(v);", "if(['start','end'].includes(f)&&v!=='顶层')v=String(v).trim()===''?null:Number(v);")
app=change(app,'起始层、结束层由你填写；新增行不会拆分其他组。填写后点“应用楼层分组”，范围须完整覆盖 1/F 至顶层且不重叠。','起始层、结束层按你保存的楼层名称选择；新增行不会拆分其他组。点“应用楼层分组”后生效，范围须覆盖全部模型层且不重叠。')
app=change(app,"p.total=groupTotal;p.groups=", "p.total=groupTotal;if(p.elevationLevels?.names)for(const n of Object.keys(p.elevationLevels.names))if(+n>p.total)delete p.elevationLevels.names[n];p.groups=")
app=change(app,"const a=e.target,d=a.dataset,i=+d.i,f=d.f;if(overallChange(a)", "const a=e.target,d=a.dataset,i=+d.i,f=d.f;if(a.classList.contains('level-name-select')){const n=a.id.match(/^level-name-(\\d+)$/);if(n)document.querySelector('[data-level-kind=\"'+n[1]+'\"]').innerHTML=levelKind(a.value);return;}if(overallChange(a)")
app=change(app,"$('side').addEventListener('change',e=>{", "$('side').addEventListener('input',e=>{if(e.target.id==='level-z-0')levelPreview();});\n $('side').addEventListener('change',e=>{if(e.target.id==='level-z-0'){levelDatumChanged();return;}")
app=change(app,"$('floorlabel').textContent=floor+'/F'", "$('floorlabel').textContent=FloorLevels.name(p,floor)")
app=change(app,"'显示 '+(shown.lo===shown.hi?shown.lo:shown.lo+'–'+shown.hi)+'/F · 共 '", "'显示 '+FloorLevels.range(p,shown.lo,shown.hi)+' · 共 '")
app=change(app,"'两个立面 · '+range.lo+'–'+range.hi+'/F'", "'两个立面 · '+FloorLevels.range(p,range.lo,range.hi)")
# All Basement controls read the same naming rule once the user has saved names.
a='<div class="row"><span>是否有 Basement</span>'+"'+['Yes','No'].map(v=>'<button data-action=\"overall-basement\" data-i=\"'+v+'\" aria-pressed=\"'+(n.basement===v)+'\" class=\"'+(n.basement===v?'active':'')+'\">'+(v==='Yes'?'有 Basement':'无 Basement')+'</button>').join('')+'</div>"
app=change(app,a,"'+basementUI(n)+'")
start=app.index("else if(key==='basement')html=")
end=app.index('\n',start)
app=app[:start]+"else if(key==='basement')html=basementUI(n);"+app[end:]
a="+' 面 · Uplift 抗浮'"  # Uplift still uses the common Basement control.
start=app.index("function overallUpliftUI(n)")
pos=app.index("<div class=\"row\">'+['Yes','No']",start)
end=app.index("</div>';if(!active)",pos)
app=app[:pos]+"'+basementUI(n)+'"+app[end+len('</div>'):]
save('app.js',app)

overall=read(old/'source/overall-report.js')
overall=change(overall,"base=finite(p.elevationLevels?.base)?p.elevationLevels.base:null", "base=FloorLevels.base(p)")
overall=change(overall,"if(p.elevationLevels)n.height=ls.at(-1).z;", "if(p.elevationLevels)n.height=ls.at(-1).z;const basement=FloorLevels.basement(p);if(basement!==null)n.basement=basement;")
overall=change(overall,"function applyLevels(p,rows){if(", "function applyLevels(p,rows){FloorLevels.validateNames(p,rows);if(")
overall=change(overall,"p.elevationLevels={base:rows[0].z,names};", "p.elevationLevels={...p.elevationLevels,base:rows[0].z,names,basementFromNames:true};FloorLevels.syncBasement(p);")
overall=change(overall,"String(f)+'/F'", "FloorLevels.name(p,f)")
overall=change(overall,"(i+1)+'/F 没有有效建筑范围'", "FloorLevels.name(p,i+1)+' 没有有效建筑范围'")
overall=change(overall,"meta.weight={...g,o,arm,D,B,q:n.swG29}", "meta.weight={...g,rows:g.rows.map(r=>({...r,name:FloorLevels.name(p,r.floor)})),o,arm,D,B,q:n.swG29}")
overall=change(overall,"r.floor+'/F</td>", "String(r.name).replace(/[<>&]/g,'')+'</td>")
overall=change(overall,"key==='basement'?(active?'有 Basement':'无 Basement')", "key==='basement'?(active?'有 Basement':'无 Basement')+(FloorLevels.managed(p)?' · 自动':'')")
save('overall-report.js',overall)

drawing=read(old/'source/drawing.js')
drawing=change(drawing,"`${lo===hi?hi:lo+'–'+hi}/F · ${meshCount}", "`${FloorLevels.range(p,lo,hi)} · ${meshCount}")
drawing=change(drawing,"assigned?f+'/F':'尚未分配到当前楼层'", "assigned?FloorLevels.name(p,f):'尚未分配到当前楼层'")
save('drawing.js',drawing)

ui=read(old/'source/explorer-ui.js')
# Floor labels in tabs, member lists, material inputs, and report selections.
for before,after in [
 ("x.lo+'/F · '","esc(FloorLevels.name(h.p,x.lo))+' · '"),
 ("h.floor+'/F", "esc(FloorLevels.name(h.p,h.floor))+'"),
 ("f.n+'/F <span", "esc(FloorLevels.name(h.p,f.n))+' <span"),
 ("label=f.to===f.n?f.n+'/F':f.n+'/F–'+f.to+'/F'", "label=esc(FloorLevels.range(h.p,f.n,f.to))"),
 ("g.lo===g.hi?g.lo+'/F':g.lo+'–'+g.hi+'/F'", "esc(FloorLevels.range(h.p,g.lo,g.hi))"),
 ("x.n+'/F", "esc(FloorLevels.name(h.p,x.n))+'"),
 ("f?f+'/F", "f?esc(FloorLevels.name(h.p,f))+'"),
 ("(g.lo===g.hi?g.lo:g.lo+'–'+g.hi)+'/F", "esc(FloorLevels.range(h.p,g.lo,g.hi))+'"),
 ("m.floor+'/F</td>", "esc(FloorLevels.name(h.p,m.floor))+'</td>"),
 ("f.n+'/F ·", "esc(FloorLevels.name(h.p,f.n))+' ·"),
 ("r.floor+'/F", "esc(FloorLevels.name(h.p,r.floor))+'"),
]:
    ui=change(ui,before,after)
ui=change(ui,"g.lo+'–'+g.hi+'/F，可撤销", "esc(FloorLevels.range(h.p,g.lo,g.hi))+'，可撤销")
ui=change(ui,"host.toast(f+'/F 此项荷载已删除'", "host.toast(FloorLevels.name(h.p,f)+' 此项荷载已删除'")
ui=change(ui,"'已应用 '+range.lo+'-'+range.hi+'/F 默认荷载", "'已应用 '+FloorLevels.range(h.p,range.lo,range.hi)+' 默认荷载")
ui=change(ui,"'当前楼层范围 '+lo+'–'+hi+'/F 不包含已选构件", "'当前楼层范围 '+FloorLevels.range(h.p,lo,hi)+' 不包含已选构件")
# Numeric option values preserve all model/load/member identities.
point=ui.index(' const assumption=')
ui=ui[:point]+''' function floorField(label,id,value,extra=''){const p=host.get().p;return '<label class="field">'+label+'<select id="'+id+'" '+extra+'>'+Array.from({length:p.total},(_,i)=>'<option value="'+(i+1)+'" '+(+value===i+1?'selected':'')+'>'+esc(FloorLevels.name(p,i+1))+'</option>').join('')+'</select></label>';}
'''+ui[point:]
for label,id in [('起始楼层','ex-a-area-lo'),('结束楼层','ex-a-area-hi'),('从楼层','ex-lo'),('至楼层','ex-hi'),('从楼层','ex-report-lo'),('至楼层','ex-report-hi'),('起始层','lg-lo'),('结束层','lg-hi')]:
    ui=ui.replace("field('"+label+"','"+id+"'", "floorField('"+label+"','"+id+"'")
save('explorer-ui.js',ui)

reports=read(old/'source/reports.js')
reports=change(reports,"rows.push([f.n+'/F',", "rows.push([FloorLevels.name(p,f.n),")
reports=change(reports,"w.add(floor+'/F · '", "w.add(FloorLevels.name(p,floor)+' · '")
save('reports.js',reports)

sync=read(old/'source/excel-sync.js')
sync=change(sync,"scopeFilter.lo+'–'+scopeFilter.hi+'/F'", "esc(FloorLevels.range(window.ExcelProject().project,scopeFilter.lo,scopeFilter.hi))")
sync=change(sync,"x.floor+'/F · '", "esc(FloorLevels.name(window.ExcelProject().project,x.floor))+' · '")
save('excel-sync.js',sync)

css='''
.layout[data-tab="floors"] #side > .table-wrap table{min-width:700px}.layout[data-tab="floors"] #side > .table-wrap th:nth-child(2),.layout[data-tab="floors"] #side > .table-wrap th:nth-child(3){width:90px}
#side .level-input .table-wrap{max-height:430px;overflow:auto}#side .level-input .table-wrap table{min-width:0;width:100%;table-layout:fixed}#side .level-input th:nth-child(1){width:14%}#side .level-input th:nth-child(2){width:36%}#side .level-input th:nth-child(3){width:20%}#side .level-input th:nth-child(4){width:30%}#side .level-input td input,#side .level-input td select{width:100%;min-width:0;box-sizing:border-box}#side .level-input td{padding:7px 5px}#side .level-input output{font-variant-numeric:tabular-nums;display:inline-block;padding:6px 0}.level-kind{display:block;font-size:11px;color:#6c8390;margin-top:4px}.level-name-tools,.level-name-actions{display:flex;align-items:end;gap:12px;flex-wrap:wrap;margin:16px 0}.level-name-actions{align-items:center}.level-name-tools .field{min-width:190px;max-width:260px}.level-basement{display:inline-block;padding:3px 6px;border-radius:6px;background:#e4f1f4;color:#176278;font-size:11px;white-space:nowrap}.level-basement-status{display:flex;gap:10px;flex-wrap:wrap;align-items:center;padding:12px 14px;background:#eef5f7;border-radius:8px;margin:12px 0}.level-basement-status small{color:#667d88}.level-input .table-wrap thead{position:sticky;top:0;z-index:1}.level-roof-summary{padding:10px 12px;background:#f1f6f8;border-radius:7px;font-size:13px}
'''
html=html.replace('</style>',css+'</style>',1).replace('E2.68','E2.69')
(dest/'assets/index.html').write_text(html,encoding='utf8')
(dest.parent/'Framing_Studio_E2.69.html').write_text(html,encoding='utf8')
cs=read(old/'source/FramingStudio.cs').replace('2.68.0.0','2.69.0.0').replace('E2.68','E2.69')
(dest/'source/FramingStudio.cs').write_text(cs,encoding='utf8')
shutil.copy2(work/'build.py',dest/'source/build-floor-names.py')
print(dest)
