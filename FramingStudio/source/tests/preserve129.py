"""Verify the E2.129 UI update preserves Section A/B and native report assets."""
from pathlib import Path
import subprocess,re,hashlib,json
repo=Path.cwd();base='22684118dfaf41696f5cef14528f06082f8f565d'
def original(name):return subprocess.check_output(['git','show',base+':'+name],cwd=repo)
modules=['load-regions.js','load-data.js','drawing.js','explorer-ui.js','app.js','beam-load-ui.js']
allowed={'FramingStudio/FramingStudio.exe','FramingStudio/assets/index.html','FramingStudio/source/FramingStudio.cs','FramingStudio/source/sync-web.py',*['FramingStudio/source/'+name for name in modules]}
verified={}
for name in subprocess.check_output(['git','ls-tree','-r','--name-only',base,'FramingStudio'],cwd=repo).decode().splitlines():
 if name in allowed:continue
 data=(repo/name).read_bytes();assert data==original(name),'Protected file changed: '+name;verified[name]=hashlib.sha256(data).hexdigest()
baseline=original('FramingStudio/assets/index.html');bundle=(repo/'FramingStudio/assets/index.html').read_bytes()
for name in modules:
 pattern=rb'/\* studio-source:'+re.escape(name.encode())+rb':start \*/\r?\n.*?\r?\n/\* studio-source:'+re.escape(name.encode())+rb':end \*/'
 old=original('FramingStudio/source/'+name).strip(b'\r\n') if name=='load-data.js' else re.search(pattern,baseline,re.S).group()
 bundle,count=re.subn(pattern,lambda _:old,bundle,flags=re.S);assert count==1
assert bundle.replace(b'E2.129',b'E2.128')==baseline,'Unexpected bundled report, CSS or other source changes'
desktop=(repo/'FramingStudio/source/FramingStudio.cs').read_bytes().replace(b'E2.129',b'E2.128').replace(b'2.129.0.0',b'2.128.0.0')
assert desktop==original('FramingStudio/source/FramingStudio.cs'),'Desktop changes beyond version'
def section(data,start,end=None):return data[data.index(start):data.index(end) if end else len(data)]
name='FramingStudio/source/explorer-ui.js';before=original(name);now=(repo/name).read_bytes()
assert section(now,b' function columnSummary(',b' return {clearSelection')==section(before,b' function columnSummary(',b' return {clearSelection'),'Report handlers changed'
assert now[:now.index(b' let groupContext')]==before[:before.index(b' let groupContext')],'Existing member/report input routines changed'
name='FramingStudio/source/drawing.js';assert section((repo/name).read_bytes(),b' function elevationData(')==section(original(name),b' function elevationData('),'Report SVG or other drawing code changed'
out=repo/'tmp/e2129';out.mkdir(parents=True,exist_ok=True)
(out/'preservation.json').write_text(json.dumps({'baseline':base,'protectedFiles':verified,'reportTemplatesNativeAndRenderingUnchanged':True},indent=2),encoding='utf-8')
print(f'{len(verified)} protected files identical; A/B content, rendering, Excel templates and native routines preserved.')
