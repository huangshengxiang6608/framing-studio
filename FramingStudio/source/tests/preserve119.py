"""Protect report code, paper styles, native workbooks and unrelated modules."""
from pathlib import Path
import re,subprocess,json,hashlib
repo=Path(__file__).resolve().parents[3];baseline='224d0e03fd5161f09ab64f4d23f89efc719e51b9'
def original(name):return subprocess.check_output(['git','show',baseline+':'+name],cwd=repo)
modules=['engine.js','drawing.js','app.js','beam-layout116.js','local-heights96.js']
allowed=set(modules+['FramingStudio.cs','sync-web.py'])
names=subprocess.check_output(['git','ls-tree','-r','--name-only',baseline,'FramingStudio/source','FramingStudio/Excel','FramingStudio/desktop-bridge.js'],cwd=repo).decode().splitlines()
verified={}
for name in names:
    if name.startswith('FramingStudio/source/') and Path(name).name in allowed:continue
    b=(repo/name).read_bytes();assert b==original(name),'Protected file changed: '+name
    verified[name]=hashlib.sha256(b).hexdigest()
bundle=(repo/'FramingStudio/assets/index.html').read_bytes();old=original('FramingStudio/assets/index.html')
for name in modules:
    pattern=rb'/\* studio-source:'+re.escape(name.encode())+rb':start \*/\r?\n.*?\r?\n/\* studio-source:'+re.escape(name.encode())+rb':end \*/'
    if name=='local-heights96.js':replacement=original('FramingStudio/source/'+name).removeprefix(b'\xef\xbb\xbf').strip(b'\r\n')
    else:replacement=re.search(pattern,old,re.S)[0]
    bundle,count=re.subn(pattern,lambda _:replacement,bundle,flags=re.S);assert count==1
bundle,count=re.subn(rb'<style id="local-clearance119">.*?</style>\r?\n',b'',bundle,flags=re.S);assert count==1
assert bundle.replace(b'E2.119',b'E2.118')==old,'Unexpected bundled report/style changes'
cs=(repo/'FramingStudio/source/FramingStudio.cs').read_bytes().replace(b'E2.119',b'E2.118').replace(b'2.119.0.0',b'2.118.0.0')
assert cs==original('FramingStudio/source/FramingStudio.cs'),'Desktop changes beyond version'
drawing=(repo/'FramingStudio/source/drawing.js').read_bytes();oldDrawing=original('FramingStudio/source/drawing.js')
assert drawing[drawing.index(b' function elevationData('):]==oldDrawing[oldDrawing.index(b' function elevationData('):]
out=repo/'tmp/e2119';out.mkdir(parents=True,exist_ok=True)
(out/'preservation.json').write_text(json.dumps({'baseline':baseline,'protectedFiles':verified,'reportHandlersAndStylesUnchanged':True,'exportDrawingUnchanged':True},indent=2),encoding='utf-8')
print(f'{len(verified)} protected files identical; report modules, paper styles, templates and export drawing unchanged.')
