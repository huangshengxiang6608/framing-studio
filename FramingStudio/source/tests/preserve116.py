"""Verify report and native template preservation against the E2.115 release."""
from pathlib import Path
import hashlib,json,re,subprocess

repo=Path(__file__).resolve().parents[3]
baseline='0595c233780a2728b2e3eba1ab05498a7177b1a5'
def original(name):
    return subprocess.check_output(['git','show',baseline+':'+name],cwd=repo)
def digest(data):return hashlib.sha256(data).hexdigest()
allowed={'app.js','engine.js','loading.js','drawing.js','FramingStudio.cs'}
names=subprocess.check_output(['git','ls-tree','-r','--name-only',baseline,'FramingStudio/source','FramingStudio/Excel','FramingStudio/desktop-bridge.js'],cwd=repo).decode().splitlines()
verified={}
for name in names:
    if name.startswith('FramingStudio/source/') and Path(name).name in allowed:continue
    before=original(name);after=(repo/name).read_bytes()
    assert after==before,'Protected file changed: '+name
    verified[name]=digest(after)

bundle=(repo/'FramingStudio/assets/index.html').read_text(encoding='utf-8-sig')
for name in ['engine.js','loading.js','drawing.js','app.js']:
    pattern=r'/\* studio-source:'+re.escape(name)+r':start \*/\n.*?\n/\* studio-source:'+re.escape(name)+r':end \*/'
    body=original('FramingStudio/source/'+name).decode('utf-8-sig').replace('\r\n','\n').strip()
    bundle,count=re.subn(pattern,lambda _:body,bundle,flags=re.S)
    assert count==1,(name,count)
for name in ['beam-layout116.js','beam-rebar116.js']:
    bundle,count=re.subn(r'/\* studio-source:'+re.escape(name)+r':start \*/\n.*?\n/\* studio-source:'+re.escape(name)+r':end \*/\n','',bundle,flags=re.S)
    assert count==1,(name,count)
bundle,count=re.subn(r'<style>/\* studio-source:beam-layout116.css:start \*/\n.*?\n/\* studio-source:beam-layout116.css:end \*/</style>\n','',bundle,flags=re.S)
assert count==1
before=original('FramingStudio/assets/index.html').decode('utf-8-sig').replace('\r\n','\n')
assert bundle.replace('E2.116','E2.115')==before,'Unexpected edits outside the seven explicit web modules'
out=repo/'tmp/e2116';out.mkdir(parents=True,exist_ok=True)
(out/'preservation.json').write_text(json.dumps({'baseline':baseline,'protectedFiles':verified,'outsideWebModulesUnchanged':True},indent=2),encoding='utf-8')
print(f'{len(verified)} protected source/template files identical; bundled report modules and existing CSS unchanged.')
