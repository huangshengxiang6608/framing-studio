"""Protect the two report copies, workbook templates and unrelated app modules."""
from pathlib import Path
import re,subprocess,json,hashlib
repo=Path(__file__).resolve().parents[3];baseline='f02552739030b234ddc666a7b7f110e85bc8fa11'
def original(name):return subprocess.check_output(['git','show',baseline+':'+name],cwd=repo)
allowed={'loading.js','drawing.js','app.js','FramingStudio.cs'}
names=subprocess.check_output(['git','ls-tree','-r','--name-only',baseline,'FramingStudio/source','FramingStudio/Excel','FramingStudio/desktop-bridge.js'],cwd=repo).decode().splitlines()
verified={}
for name in names:
 if name.startswith('FramingStudio/source/') and Path(name).name in allowed:continue
 b=(repo/name).read_bytes();assert b==original(name),'Protected file changed: '+name;verified[name]=hashlib.sha256(b).hexdigest()
bundle=(repo/'FramingStudio/assets/index.html').read_bytes()
old=original('FramingStudio/assets/index.html')
for name in ['loading.js','drawing.js','app.js']:
 pattern=rb'/\* studio-source:'+name.encode().replace(b'.',rb'\.')+rb':start \*/\r?\n.*?\r?\n/\* studio-source:'+name.encode().replace(b'.',rb'\.')+rb':end \*/'
 replacement=re.search(pattern,old,re.S);assert replacement
 bundle,count=re.subn(pattern,lambda _:replacement[0],bundle,flags=re.S);assert count==1
assert bundle.replace(b'E2.118',b'E2.117')==old,'Unexpected bundled report/style changes'
cs=(repo/'FramingStudio/source/FramingStudio.cs').read_bytes().replace(b'E2.118',b'E2.117').replace(b'2.118.0.0',b'2.117.0.0')
assert cs==original('FramingStudio/source/FramingStudio.cs'),'Desktop changes beyond version'
# The shared drawing module must leave export and report rendering byte-identical.
drawing=(repo/'FramingStudio/source/drawing.js').read_bytes();oldDrawing=original('FramingStudio/source/drawing.js')
assert drawing[drawing.index(b' function elevationData('):]==oldDrawing[oldDrawing.index(b' function elevationData('):]
out=repo/'tmp/e2118';out.mkdir(parents=True,exist_ok=True);(out/'preservation.json').write_text(json.dumps({'baseline':baseline,'protectedFiles':verified,'reportHandlersAndStylesUnchanged':True,'exportDrawingUnchanged':True},indent=2),encoding='utf-8')
print(f'{len(verified)} protected files identical; reports, templates, styles and export drawing unchanged.')
