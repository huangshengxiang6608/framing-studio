"""Verify E2.121 retains all report renderers, paper rules and native templates."""
from pathlib import Path
import subprocess,re,hashlib,json
repo=Path(__file__).resolve().parents[3];base='a9a7aab2f5793a9f48748abecaddcbc8ea1047e8'
def original(name):return subprocess.check_output(['git','show',base+':'+name],cwd=repo)
modules=['engine.js','loading.js','slab-geometry120.js','app.js','explorer-ui.js','checks.js','right-inputs.js']
allowed=set(modules+['FramingStudio.cs','sync-web.py'])
names=subprocess.check_output(['git','ls-tree','-r','--name-only',base,'FramingStudio/source','FramingStudio/Excel','FramingStudio/desktop-bridge.js'],cwd=repo).decode().splitlines();verified={}
for name in names:
 if name.startswith('FramingStudio/source/') and Path(name).name in allowed:continue
 data=(repo/name).read_bytes()
 if name.endswith('/tests/layout116.cjs'):data=data.replace(b"assert.deepEqual(await page.locator('#nav button[data-tab]').evaluateAll(els=>els.map(el=>el.dataset.tab).slice(5,9)),['beamLayout','loading','beams','checks']);",b"assert.equal(await page.locator('#nav [data-tab=beamLayout]').evaluate(el=>el.nextElementSibling.dataset.tab),'beams');")
 assert data==original(name),'Protected file changed: '+name;verified[name]=hashlib.sha256(data).hexdigest()
bundle=(repo/'FramingStudio/assets/index.html').read_bytes();old=original('FramingStudio/assets/index.html')
for name in modules:
 pattern=rb'/\* studio-source:'+re.escape(name.encode())+rb':start \*/\r?\n.*?\r?\n/\* studio-source:'+re.escape(name.encode())+rb':end \*/'
 match=re.search(pattern,old,re.S);replacement=match[0] if match else original('FramingStudio/source/'+name).strip(b'\r\n').replace(b'\r\n',b'\n')
 bundle,count=re.subn(pattern,lambda _:replacement,bundle,flags=re.S);assert count==1,name
bundle,count=re.subn(rb'/\* studio-source:slab-panel121.js:start \*/\r?\n.*?\r?\n/\* studio-source:slab-panel121.js:end \*/\r?\n',b'',bundle,flags=re.S);assert count==1
assert bundle.replace(b'E2.121',b'E2.120')==old,'Unexpected bundled report or style changes'
desktop=(repo/'FramingStudio/source/FramingStudio.cs').read_bytes().replace(b'E2.121',b'E2.120').replace(b'2.121.0.0',b'2.120.0.0');desktop=desktop.replace(b"document.querySelector('#nav [data-tab=beamLayout]').nextElementSibling.dataset.tab==='loading' && document.querySelector('#nav [data-tab=loading]').nextElementSibling.dataset.tab==='beams'",b"document.querySelector('#nav [data-tab=beamLayout]').nextElementSibling.dataset.tab==='beams'");assert desktop==original('FramingStudio/source/FramingStudio.cs')
# Report-producing code embedded in the editor is untouched as well.
before=original('FramingStudio/source/explorer-ui.js');after=(repo/'FramingStudio/source/explorer-ui.js').read_bytes()
for a,z in [(b' function report(section,lo,hi)',b" document.addEventListener('change'"),(b"  if(action==='report-a'||action==='report-b')",b' return {clearSelection')]:
 assert before[before.index(a):before.index(z,before.index(a))]==after[after.index(a):after.index(z,after.index(a))],'Report handler changed'
out=repo/'tmp/e2121';out.mkdir(parents=True,exist_ok=True);(out/'preservation.json').write_text(json.dumps({'baseline':base,'protectedFiles':verified,'reportHandlersAndStylesUnchanged':True,'nativeTemplatesAndDrawingCodeUnchanged':True},indent=2),encoding='utf-8')
print(f'{len(verified)} protected files identical; report handlers, paper styles, templates and drawing code unchanged.')
