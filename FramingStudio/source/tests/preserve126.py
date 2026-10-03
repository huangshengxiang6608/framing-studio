"""Verify E2.126 calculation-only changes against the E2.125 release."""
from pathlib import Path
import subprocess,re,hashlib,json
repo=Path.cwd();base='c027d23b7ae67837bb4028d21adc81828b3909a8'
def original(name):return subprocess.check_output(['git','show',base+':'+name],cwd=repo)
allowed={'loading.js','load-regions.js','load-data.js','slab-geometry120.js','column-alignment.js','explorer-ui.js','FramingStudio.cs','loading115-browser.js','boundary118-browser.js','geometry120-browser.js','slab121.cjs'}
names=subprocess.check_output(['git','ls-tree','-r','--name-only',base,'FramingStudio/source','FramingStudio/Excel','FramingStudio/desktop-bridge.js'],cwd=repo).decode().splitlines();verified={}
for name in names:
 if name.startswith('FramingStudio/source/') and Path(name).name in allowed:continue
 data=(repo/name).read_bytes();assert data==original(name),'Protected file changed: '+name;verified[name]=hashlib.sha256(data).hexdigest()
bundle=(repo/'FramingStudio/assets/index.html').read_bytes();baseline=original('FramingStudio/assets/index.html')
for name in ['loading.js','load-regions.js','slab-geometry120.js','explorer-ui.js']:
 pattern=rb'/\* studio-source:'+re.escape(name.encode())+rb':start \*/\r?\n.*?\r?\n/\* studio-source:'+re.escape(name.encode())+rb':end \*/'
 body=re.search(pattern,baseline,re.S).group();bundle,count=re.subn(pattern,lambda _:body,bundle,flags=re.S);assert count==1
for name in ['load-data.js','column-alignment.js']:
 def pattern(b):return rb'\r?\n'.join(re.escape(s) for s in b.strip(b'\r\n').replace(b'\r\n',b'\n').split(b'\n'))
 path='FramingStudio/source/'+name;old=original(path);new=(repo/path).read_bytes()
 replacement=re.search(pattern(old),baseline).group();bundle,count=re.subn(pattern(new),lambda _:replacement,bundle);assert count==1
assert bundle.replace(b'E2.126',b'E2.125')==baseline,'Unexpected bundled report, layout or other source changes'
desktop=(repo/'FramingStudio/source/FramingStudio.cs').read_bytes().replace(b'E2.126',b'E2.125').replace(b'2.126.0.0',b'2.125.0.0');assert desktop==original('FramingStudio/source/FramingStudio.cs')
ui=(repo/'FramingStudio/source/explorer-ui.js').read_bytes()
for new,old in [
 ("L=Loading.slabSpan(c,dir,Engine.floorModel(h.result,h.floor),cs?o.csFixedEdge:null).effective;}else", "L=dir==='X'?c.x1-c.x0:c.y1-c.y0;}else"),
 ("LD.validate(h.p,f,Engine.floorModel(h.result,h.floor,h.key).slabs.map(s=>Loading.token('SLAB',s)),Engine.floorModel(h.result,f,h.key))", "LD.validate(h.p,f,Engine.floorModel(h.result,h.floor,h.key).slabs.map(s=>Loading.token('SLAB',s)))")
]:
 assert ui.count(new.encode())==1;ui=ui.replace(new.encode(),old.encode())
assert ui==original('FramingStudio/source/explorer-ui.js'),'UI markup, report handlers or other interface changes'
out=repo/'tmp/e2126';out.mkdir(parents=True,exist_ok=True)
(out/'preservation.json').write_text(json.dumps({'baseline':base,'protectedFiles':verified,'reportsTemplatesNativeAndLayoutUnchanged':True,'calculationValuesMayChange':True},indent=2),encoding='utf-8')
print(f'{len(verified)} protected files identical; A/B report content, templates, native routines and UI layout unchanged.')
