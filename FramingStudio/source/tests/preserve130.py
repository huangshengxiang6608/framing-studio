"""Keep native reports byte-identical while allowing saved span calculation inputs."""
from pathlib import Path
import subprocess,re,hashlib,json
repo=Path.cwd();base='d2877c6a43110faa893e7d7bf7054154dfbd91e5'
def original(name):return subprocess.check_output(['git','show',base+':'+name],cwd=repo)
modules=['loading.js','explorer-ui.js','beam-load-ui.js']
allowed={'FramingStudio/FramingStudio.exe','FramingStudio/assets/index.html','FramingStudio/source/FramingStudio.cs',*['FramingStudio/source/'+name for name in modules]}
verified={}
for name in subprocess.check_output(['git','ls-tree','-r','--name-only',base,'FramingStudio'],cwd=repo).decode().splitlines():
 if name in allowed:continue
 b=(repo/name).read_bytes();assert b==original(name),'Protected file changed: '+name;verified[name]=hashlib.sha256(b).hexdigest()
baseline=original('FramingStudio/assets/index.html');bundle=(repo/'FramingStudio/assets/index.html').read_bytes()
for name in modules:
 pattern=rb'/\* studio-source:'+re.escape(name.encode())+rb':start \*/\r?\n.*?\r?\n/\* studio-source:'+re.escape(name.encode())+rb':end \*/'
 old=re.search(pattern,baseline,re.S).group();bundle,n=re.subn(pattern,lambda _:old,bundle,flags=re.S);assert n==1
assert bundle.replace(b'E2.130',b'E2.129')==baseline,'Unexpected report/CSS/other bundle changes'
desktop=(repo/'FramingStudio/source/FramingStudio.cs').read_bytes().replace(b'E2.130',b'E2.129').replace(b'2.130.0.0',b'2.129.0.0')
assert desktop==original('FramingStudio/source/FramingStudio.cs'),'Desktop change beyond version'
before=original('FramingStudio/source/explorer-ui.js');now=(repo/'FramingStudio/source/explorer-ui.js').read_bytes()
for start,end in [(b' function renderLegacy(',b' function cbEndNames('),(b' function report(section,lo,hi)',b" document.addEventListener('change',e=>{if(e.target.id==='ex-member')"),(b"  if(action==='report-a'",b' return {clearSelection')]:
 assert now[now.index(start):now.index(end)]==before[before.index(start):before.index(end)],'Protected report UI routine changed'
out=repo/'tmp/e2130';out.mkdir(parents=True,exist_ok=True);(out/'preservation.json').write_text(json.dumps({'baseline':base,'protectedFiles':verified,'reportTemplatesNativeAndRenderingUnchanged':True},indent=2),encoding='utf-8')
print(f'{len(verified)} protected files identical; native A/B templates, reports and UI rendering preserved.')
