"""Verify E2.117 changed only the beam input UI and desktop version."""
from pathlib import Path
import re,subprocess,json,hashlib
repo=Path(__file__).resolve().parents[3];baseline='22a0a4956543e6a7cb2886471cdd6acfb7d6b80d'
def original(name):return subprocess.check_output(['git','show',baseline+':'+name],cwd=repo)
allowed={'explorer-ui.js','FramingStudio.cs','sync-web.py'}
names=subprocess.check_output(['git','ls-tree','-r','--name-only',baseline,'FramingStudio/source','FramingStudio/Excel','FramingStudio/desktop-bridge.js'],cwd=repo).decode().splitlines()
verified={}
for name in names:
    if name.startswith('FramingStudio/source/') and Path(name).name in allowed:continue
    b=(repo/name).read_bytes();assert b==original(name),'Protected file changed: '+name;verified[name]=hashlib.sha256(b).hexdigest()
ui=(repo/'FramingStudio/source/explorer-ui.js').read_text(encoding='utf-8-sig')
restored,count=re.subn(r' function beamSupportInput117\(h\)\{.*?(?= function memberInputs\(h\)\{)','',ui,flags=re.S);assert count==1
restored,count=re.subn(r"^  if\(action==='beam-(?:support|loading)-save117'\).*?\n",'',restored,flags=re.M);assert count==2
restored=restored.replace('+beamInputs117(h):"<p class=muted>在左侧选择一根梁后输入。</p>";','+memberInputs(h):"<p class=muted>在左侧选择一根梁后输入。</p>";')
oldUI=original('FramingStudio/source/explorer-ui.js').decode('utf-8-sig').replace('\r\n','\n')
assert restored==oldUI,'Unexpected UI or report handler changes'
bundle=(repo/'FramingStudio/assets/index.html').read_text(encoding='utf-8-sig')
bundle,count=re.subn(r'/\* studio-source:explorer-ui.js:start \*/\n.*?\n/\* studio-source:explorer-ui.js:end \*/',lambda _:oldUI.strip(),bundle,flags=re.S);assert count==1
assert bundle.replace('E2.117','E2.116')==original('FramingStudio/assets/index.html').decode('utf-8-sig').replace('\r\n','\n'),'Unexpected bundle changes'
cs=(repo/'FramingStudio/source/FramingStudio.cs').read_bytes().replace(b'E2.117',b'E2.116').replace(b'2.117.0.0',b'2.116.0.0')
assert cs==original('FramingStudio/source/FramingStudio.cs'),'Desktop changes beyond version'
out=repo/'tmp/e2117';out.mkdir(parents=True,exist_ok=True);(out/'preservation.json').write_text(json.dumps({'baseline':baseline,'protectedFiles':verified,'reportHandlersAndStylesUnchanged':True},indent=2),encoding='utf-8')
print(f'{len(verified)} protected files identical; report handlers and bundled styles unchanged.')
