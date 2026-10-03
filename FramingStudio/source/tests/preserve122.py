"""The reaction-display correction must not alter solvers or report copies."""
from pathlib import Path
import subprocess,re,hashlib,json
repo=Path(__file__).resolve().parents[3];base='2ae11891428cf074e72b6fa8ff9d2c29394097d2'
def original(name):return subprocess.check_output(['git','show',base+':'+name],cwd=repo)
names=subprocess.check_output(['git','ls-tree','-r','--name-only',base,'FramingStudio/source','FramingStudio/Excel','FramingStudio/desktop-bridge.js'],cwd=repo).decode().splitlines();verified={}
for name in names:
 if name.startswith('FramingStudio/source/') and Path(name).name in ['beam-load-ui.js','sync-web.py','FramingStudio.cs']:continue
 data=(repo/name).read_bytes();assert data==original(name),'Protected file changed: '+name;verified[name]=hashlib.sha256(data).hexdigest()
bundle=(repo/'FramingStudio/assets/index.html').read_bytes()
pattern=rb'/\* studio-source:beam-load-ui.js:start \*/\r?\n.*?\r?\n/\* studio-source:beam-load-ui.js:end \*/'
body=original('FramingStudio/source/beam-load-ui.js').strip(b'\r\n').replace(b'\r\n',b'\n')
bundle,count=re.subn(pattern,lambda _:body,bundle,flags=re.S);assert count==1
assert bundle.replace(b'E2.122',b'E2.121')==original('FramingStudio/assets/index.html'),'Bundled solver, report or unrelated UI changed'
desktop=(repo/'FramingStudio/source/FramingStudio.cs').read_bytes().replace(b'E2.122',b'E2.121').replace(b'2.122.0.0',b'2.121.0.0')
assert desktop==original('FramingStudio/source/FramingStudio.cs'),'Desktop changed beyond version'
out=repo/'tmp/e2122';out.mkdir(parents=True,exist_ok=True);(out/'preservation.json').write_text(json.dumps({'baseline':base,'protectedFiles':verified,'allSolversAndReportsUnchanged':True},indent=2),encoding='utf-8')
print(f'{len(verified)} protected files identical; all solvers, report copies, templates and unrelated UI unchanged.')
