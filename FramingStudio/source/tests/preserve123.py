"""Summary Check adds a view without changing calculations or report copies."""
from pathlib import Path
import subprocess,re,hashlib,json
repo=Path(__file__).resolve().parents[3];base='3ca778ab41a786cf85327d06419d21d4c19f97af'
def original(name):return subprocess.check_output(['git','show',base+':'+name],cwd=repo)
names=subprocess.check_output(['git','ls-tree','-r','--name-only',base,'FramingStudio/source','FramingStudio/Excel','FramingStudio/desktop-bridge.js'],cwd=repo).decode().splitlines();verified={}
for name in names:
 if name.startswith('FramingStudio/source/') and Path(name).name in ['app.js','explorer-ui.js','sync-web.py','FramingStudio.cs']:continue
 data=(repo/name).read_bytes();assert data==original(name),'Protected file changed: '+name;verified[name]=hashlib.sha256(data).hexdigest()
# Verify the exact expected UI edits; all other handlers, including both reports, stay identical.
expected=original('FramingStudio/source/app.js')
for old,new in [
 ('梁 / 板 · 荷载与计算','Summary Check · 梁 / 板 / 柱'),
 ('点选梁编辑支承与荷载；点选板查看跨度、荷载、反力与验算。','点选梁、板或柱，查看荷载、受力与验算。'),
 ("columnLoadArea:tab==='checks'?ColumnLoads101.viewData(p,result,floor):null","columnLoadArea:tab==='checks'||tab==='beams'&&ColumnPanel123.showArea()?ColumnLoads101.viewData(p,result,floor):null"),
 ("beamNav.before(layoutNav);","beamNav.before(layoutNav);beamNav.innerHTML='<span>08</span> Summary Check';")]:
 assert expected.count(old.encode())==1;expected=expected.replace(old.encode(),new.encode())
assert (repo/'FramingStudio/source/app.js').read_bytes()==expected
expected=original('FramingStudio/source/explorer-ui.js')
for old,new in [
 ("beamInputs(hit){selectPlanMember(hit);const h=state();if(h.selected?.kind==='SLAB')","beamInputs(hit){selectPlanMember(hit);const h=state();if(h.selected?.kind==='COL'){SlabPanel121.clear();return ColumnPanel123.render(h,host);}ColumnPanel123.clear();if(h.selected?.kind==='SLAB')"),
 ('在左侧选择梁或板，查看支承、荷载和计算。','在左侧选择梁、板或柱，查看荷载、受力和计算。'),
 ("clearSelection(){chosen='';chosenFloor=0;ColumnLoads101.clear();BeamLoadUI.clear();}","clearSelection(){chosen='';chosenFloor=0;ColumnLoads101.clear();BeamLoadUI.clear();ColumnPanel123.clear();}"),
 ("resetProject(){ColumnLoads101.clear();BeamLoadUI.clear();","resetProject(){ColumnLoads101.clear();BeamLoadUI.clear();ColumnPanel123.clear();")]:
 assert expected.count(old.encode())==1;expected=expected.replace(old.encode(),new.encode())
assert (repo/'FramingStudio/source/explorer-ui.js').read_bytes()==expected
bundle=(repo/'FramingStudio/assets/index.html').read_bytes()
bundle,count=re.subn(rb'/\* studio-source:column-panel123.js:start \*/\r?\n.*?\r?\n/\* studio-source:column-panel123.js:end \*/\n',b'',bundle,flags=re.S);assert count==1
baseline=original('FramingStudio/assets/index.html')
for name in [b'app.js',b'explorer-ui.js']:
 pattern=rb'/\* studio-source:'+re.escape(name)+rb':start \*/\r?\n.*?\r?\n/\* studio-source:'+re.escape(name)+rb':end \*/'
 body=re.search(pattern,baseline,re.S).group();bundle,count=re.subn(pattern,lambda _:body,bundle,flags=re.S);assert count==1
assert bundle.replace(b'E2.123',b'E2.122')==baseline,'Bundled calculation, report or unrelated UI changed'
desktop=(repo/'FramingStudio/source/FramingStudio.cs').read_bytes().replace(b'E2.123',b'E2.122').replace(b'2.123.0.0',b'2.122.0.0')
assert desktop==original('FramingStudio/source/FramingStudio.cs'),'Desktop changed beyond version'
out=repo/'tmp/e2123';out.mkdir(parents=True,exist_ok=True);(out/'preservation.json').write_text(json.dumps({'baseline':base,'protectedFiles':verified,'allSolversAndReportsUnchanged':True},indent=2),encoding='utf-8')
print(f'{len(verified)} protected files identical; all calculations, report rendering, templates and native routines unchanged.')
