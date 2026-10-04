"""Only the user-approved Horizontal drawing changes; all other A/B content is identical."""
from pathlib import Path
import subprocess,re,hashlib,json
root=Path.cwd();base='5d7fb5aed8f713f4c11dd3b19a7d1dd279a15d1a'
def original(name):return subprocess.check_output(['git','show',base+':'+name],cwd=root)
allowed={'FramingStudio/FramingStudio.exe','FramingStudio/assets/index.html','FramingStudio/source/FramingStudio.cs','FramingStudio/source/sync-web.py'}
verified={}
for name in subprocess.check_output(['git','ls-tree','-r','--name-only',base,'FramingStudio'],cwd=root).decode().splitlines():
 if name in allowed:continue
 b=(root/name).read_bytes();assert b==original(name),'Protected file changed: '+name
 verified[name]=hashlib.sha256(b).hexdigest()
bundle=(root/'FramingStudio/assets/index.html').read_bytes()
bundle,n=re.subn(rb'\n/\* studio-source:horizontal-path133.js:start \*/\r?\n.*?\r?\n/\* studio-source:horizontal-path133.js:end \*/\n',b'',bundle,flags=re.S)
assert n==1
assert bundle.replace(b'E2.133',b'E2.132')==original('FramingStudio/assets/index.html'),'Unrelated bundle changed'
desktop=(root/'FramingStudio/source/FramingStudio.cs').read_bytes().replace(b'E2.133',b'E2.132').replace(b'2.133.0.0',b'2.132.0.0')
assert desktop==original('FramingStudio/source/FramingStudio.cs'),'Desktop change beyond version'
out=root/'tmp/e2133';out.mkdir(parents=True,exist_ok=True)
(out/'preservation.json').write_text(json.dumps({'baseline':base,'protectedFiles':verified,'exception':'Approved Horizontal Load Path drawing only','reportTemplatesNativeCalculationsAndOtherRenderingUnchanged':True},indent=2),encoding='utf-8')
print(f'{len(verified)} protected files identical; Vertical, other A/B content, templates, calculations and native rendering preserved.')
