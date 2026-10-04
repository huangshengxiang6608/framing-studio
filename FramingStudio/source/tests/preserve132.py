"""E2.132 may change calculations and support UI, never original A/B report rendering."""
from pathlib import Path
import subprocess,re,hashlib,json
repo=Path.cwd();base='dde9064fddcb1327c0fba4fe0fb8610bf233b0f6'
def original(name):return subprocess.check_output(['git','show',base+':'+name],cwd=repo)
modules=['loading.js','explorer-ui.js','slab-geometry120.js','slab-panel121.js']
allowed={'FramingStudio/FramingStudio.exe','FramingStudio/assets/index.html','FramingStudio/source/FramingStudio.cs','FramingStudio/source/column-areas103.js','FramingStudio/source/sync-web.py',*['FramingStudio/source/'+n for n in modules],*['FramingStudio/source/tests/'+n for n in ['boundary118-browser.js','geometry120-browser.js','slab121.cjs']]}
verified={}
for name in subprocess.check_output(['git','ls-tree','-r','--name-only',base,'FramingStudio'],cwd=repo).decode().splitlines():
 if name in allowed:continue
 b=(repo/name).read_bytes();assert b==original(name),'Protected file changed: '+name;verified[name]=hashlib.sha256(b).hexdigest()
baseline=original('FramingStudio/assets/index.html');bundle=(repo/'FramingStudio/assets/index.html').read_bytes()
def pattern(name):return rb'/\* studio-source:'+re.escape(name.encode())+rb':start \*/\r?\n.*?\r?\n/\* studio-source:'+re.escape(name.encode())+rb':end \*/'
for name in modules:
 old=re.search(pattern(name),baseline,re.S).group();bundle,n=re.subn(pattern(name),lambda _:old,bundle,flags=re.S);assert n==1
for name in ['slab-support132.js','slab-support-ui132.js','audit-runner132.js']:
 bundle,n=re.subn(pattern(name)+rb'\n',b'',bundle,flags=re.S);assert n==1
old=original('FramingStudio/source/column-areas103.js').strip(b'\r\n');bundle,n=re.subn(pattern('column-areas103.js'),lambda _:old,bundle,flags=re.S);assert n==1
assert bundle.replace(b'E2.132',b'E2.131')==baseline,'Unexpected report/CSS/other bundle changes'
desktop=(repo/'FramingStudio/source/FramingStudio.cs').read_bytes().replace(b'E2.132',b'E2.131').replace(b'2.132.0.0',b'2.131.0.0')
assert desktop==original('FramingStudio/source/FramingStudio.cs'),'Desktop change beyond version'
before=original('FramingStudio/source/explorer-ui.js');now=(repo/'FramingStudio/source/explorer-ui.js').read_bytes()
for start,end in [(b' function reportAInputs(',b' function calculate()'),(b' function report(section,lo,hi)',b" document.addEventListener('change',e=>{if(e.target.id==='ex-member')"),(b"  if(action==='report-a'",b' return {clearSelection')]:
 assert now[now.index(start):now.index(end)]==before[before.index(start):before.index(end)],'Protected report UI routine changed'
out=repo/'tmp/e2132';out.mkdir(parents=True,exist_ok=True);(out/'preservation.json').write_text(json.dumps({'baseline':base,'protectedFiles':verified,'reportTemplatesNativeAndRenderingUnchanged':True},indent=2),encoding='utf-8')
print(f'{len(verified)} protected files identical; original A/B templates, report code and rendering unchanged.')
