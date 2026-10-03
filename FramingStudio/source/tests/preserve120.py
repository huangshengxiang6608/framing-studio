"""Require exact report/UI styles and native workbook preservation against E2.119."""
from pathlib import Path
import re,subprocess,json,hashlib
repo=Path(__file__).resolve().parents[3];baseline='afa70fa37fe94e14cbe3262baf6aea04cdc07a13'
def original(name):return subprocess.check_output(['git','show',baseline+':'+name],cwd=repo)
modules=['engine.js','loading.js','load-regions.js','slab-marks.js','beam-layout116.js']
allowed=set(modules+['FramingStudio.cs','sync-web.py'])
changed_tests={'loading115-browser.js','boundary118-browser.js','layout116.cjs'}
names=subprocess.check_output(['git','ls-tree','-r','--name-only',baseline,'FramingStudio/source','FramingStudio/Excel','FramingStudio/desktop-bridge.js'],cwd=repo).decode().splitlines();verified={}
for name in names:
 if name.startswith('FramingStudio/source/') and Path(name).name in allowed:continue
 if name.startswith('FramingStudio/source/tests/') and Path(name).name in changed_tests:continue
 b=(repo/name).read_bytes();assert b==original(name),'Protected file changed: '+name;verified[name]=hashlib.sha256(b).hexdigest()
bundle=(repo/'FramingStudio/assets/index.html').read_bytes();old=original('FramingStudio/assets/index.html')
for name in modules:
 pattern=rb'/\* studio-source:'+re.escape(name.encode())+rb':start \*/\r?\n.*?\r?\n/\* studio-source:'+re.escape(name.encode())+rb':end \*/'
 match=re.search(pattern,old,re.S);replacement=match[0] if match else original('FramingStudio/source/'+name).removeprefix(b'\xef\xbb\xbf').strip(b'\r\n')
 bundle,count=re.subn(pattern,lambda _:replacement,bundle,flags=re.S);assert count==1,name
bundle,count=re.subn(rb'/\* studio-source:slab-geometry120.js:start \*/\r?\n.*?\r?\n/\* studio-source:slab-geometry120.js:end \*/\r?\n',b'',bundle,flags=re.S);assert count==1
assert bundle.replace(b'E2.120',b'E2.119')==old,'Unexpected bundled report or style changes'
cs=(repo/'FramingStudio/source/FramingStudio.cs').read_bytes().replace(b'E2.120',b'E2.119').replace(b'2.120.0.0',b'2.119.0.0')
assert cs==original('FramingStudio/source/FramingStudio.cs'),'Desktop changes beyond version'
out=repo/'tmp/e2120';out.mkdir(parents=True,exist_ok=True);(out/'preservation.json').write_text(json.dumps({'baseline':baseline,'protectedFiles':verified,'reportHandlersAndStylesUnchanged':True,'nativeTemplatesAndDrawingCodeUnchanged':True},indent=2),encoding='utf-8')
print(f'{len(verified)} protected files identical; report handlers, paper styles, templates and drawing code unchanged.')
