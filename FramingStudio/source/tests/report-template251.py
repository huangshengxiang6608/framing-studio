"""Compare the report template to E2.250. Requires olefile and oletools."""
import io, subprocess, zipfile, hashlib, json
from pathlib import Path
import olefile
from oletools.olevba import VBA_Project
app=Path(__file__).resolve().parents[2];repo=app.parent
name='FramingStudio/Excel/Section A RC - Section B v109 Compact Copy.xlsm'
old=subprocess.check_output(['git','show','30c6be791765b5077900fb32b85946a65cd8772e:'+name],cwd=repo)
new=(repo/name).read_bytes()
with zipfile.ZipFile(io.BytesIO(old)) as a,zipfile.ZipFile(io.BytesIO(new)) as b:
 assert a.namelist()==b.namelist()
 changes=[n for n in a.namelist() if a.read(n)!=b.read(n)]
 assert changes==['xl/vbaProject.bin'],changes
 projects=[]
 for z in (a,b):
  ole=olefile.OleFileIO(z.read('xl/vbaProject.bin'));p=VBA_Project(ole,'','PROJECT','VBA/dir');p.parse_project_stream();list(p.parse_modules());projects.append({m.code_path:m.code_str for m in p.modules})
 assert projects[0].keys()==projects[1].keys();changed=0
 before='Set ws = ThisWorkbook.Worksheets("Section A 抄")';after='Set ws = ThisWorkbook.Worksheets("Section A " & ChrW(&H6284))'
 for name,source in projects[0].items():
  if source==projects[1][name]:continue
  assert source.count(before)==1 and projects[1][name]==source.replace(before,after);changed+=1
 assert changed==1
 config=json.loads((app/'Excel/templates.json').read_text(encoding='utf8'))
 assert config['RC']['sha256']==hashlib.sha256(new).hexdigest()
 print(f'PASS {len(a.namelist())-1} unchanged OOXML parts; {len(projects[0])} VBA modules, exactly one Unicode-safe worksheet reference change; manifest hash matches')
