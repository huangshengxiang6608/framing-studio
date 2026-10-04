"""Only the requested layout-reset modules may change from E2.127."""
from pathlib import Path
import subprocess,re,hashlib,json

repo=Path.cwd();base='a7ce77c0b1cb5ca0039f9ed24ab8ac14731365ce'
def original(name):return subprocess.check_output(['git','show',base+':'+name],cwd=repo)
modules=['beam-layout116.js','beam-layout116.css','engine.js','drawing.js']
allowed={'FramingStudio/FramingStudio.exe','FramingStudio/assets/index.html','FramingStudio/source/FramingStudio.cs',*['FramingStudio/source/'+name for name in modules]}
verified={}
names=subprocess.check_output(['git','ls-tree','-r','--name-only',base,'FramingStudio'],cwd=repo).decode().splitlines()
for name in names:
    if name in allowed:continue
    data=(repo/name).read_bytes();assert data==original(name),'Protected file changed: '+name
    verified[name]=hashlib.sha256(data).hexdigest()
baseline=original('FramingStudio/assets/index.html');bundle=(repo/'FramingStudio/assets/index.html').read_bytes()
for name in modules:
    pattern=rb'/\* studio-source:'+re.escape(name.encode())+rb':start \*/\r?\n.*?\r?\n/\* studio-source:'+re.escape(name.encode())+rb':end \*/'
    old=re.search(pattern,baseline,re.S).group();bundle,count=re.subn(pattern,lambda _:old,bundle,flags=re.S);assert count==1
assert bundle.replace(b'E2.128',b'E2.127')==baseline,'Unexpected bundle changes'
desktop=(repo/'FramingStudio/source/FramingStudio.cs').read_bytes().replace(b'E2.128',b'E2.127').replace(b'2.128.0.0',b'2.127.0.0')
assert desktop==original('FramingStudio/source/FramingStudio.cs'),'Desktop changes beyond version'
drawing=(repo/'FramingStudio/source/drawing.js').read_bytes().replace(b'  if(m.columnsOnly)opt={...opt,membersOnly:true};\n',b'')
assert drawing==original('FramingStudio/source/drawing.js'),'Report drawing code changed'
out=repo/'tmp/e2128';out.mkdir(parents=True,exist_ok=True)
(out/'preservation.json').write_text(json.dumps({'baseline':base,'protectedFiles':verified,'reportTemplatesNativeAndRenderingUnchanged':True},indent=2),encoding='utf-8')
print(f'{len(verified)} protected files identical; A/B report templates, native programs and rendering preserved.')
