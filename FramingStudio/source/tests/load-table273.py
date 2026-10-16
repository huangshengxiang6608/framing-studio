"""No Excel required: prepare input-table bounds without changing workbook content."""
from pathlib import Path
import hashlib,json,os,shutil,subprocess,tempfile,zipfile,xml.etree.ElementTree as E

source=Path(__file__).resolve().parents[1]/'ExcelBridge.cs'
template=source.parent.parent/'Excel/Section A RC - Section B v109 Compact Copy.xlsm'
ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(template) as z:original={n:z.read(n) for n in z.namelist()}
table=next(n for n,v in original.items() if n.startswith('xl/tables/') and n.endswith('.xml') and E.fromstring(v).get('name')=='RCLoads73')
base=source.read_text(encoding='utf-8-sig').replace(' [STAThread] static int Main(string[] args){',' [STAThread] static int OriginalMain273(string[] args){')
entry='''
 static int Main(string[] args){try{PrepareLoadTable273(args[0],Obj(J.DeserializeObject(File.ReadAllText(args[1]))));return 0;}catch(Exception e){Console.WriteLine(e.Message);return 1;}}
'''
base=base.replace('static class ExcelBridge {','static class ExcelBridge {'+entry)
with tempfile.TemporaryDirectory(prefix='load-table273-',dir=Path.cwd()) as temporary:
 d=Path(temporary);assert d.resolve().is_relative_to(Path.cwd().resolve())
 cs=d/'Test.cs';cs.write_text(base,encoding='utf8');exe=d/'Test.exe'
 compiler=Path(os.environ['WINDIR'])/'Microsoft.NET/Framework64/v4.0.30319/csc.exe'
 subprocess.run([str(compiler),'/nologo','/target:exe','/platform:x64','/out:'+str(exe),'/reference:System.Web.Extensions.dll','/reference:Microsoft.CSharp.dll','/reference:'+str(compiler.parent/'WPF/WindowsBase.dll'),str(cs)],check=True)
 for count in [None,0,1,75,126]:
  book=d/(str(count)+'.xlsm');shutil.copyfile(template,book);job=d/'job.json'
  job.write_text(json.dumps({} if count is None else {'fullLoads':[{'loads':[{}]*count}]}))
  subprocess.run([str(exe),str(book),str(job)],check=True)
  if count is None:assert book.read_bytes()==template.read_bytes();continue
  with zipfile.ZipFile(book) as z:after={n:z.read(n) for n in z.namelist()}
  assert set(after)==set(original)
  for name,data in original.items():
   if name==table:continue
   if name=='[Content_Types].xml':
    assert sorted((n.tag,sorted(n.attrib.items())) for n in E.fromstring(data))==sorted((n.tag,sorted(n.attrib.items())) for n in E.fromstring(after[name]))
   else:assert after[name]==data,('Unrelated workbook part changed',name)
  before_xml=E.fromstring(original[table]);after_xml=E.fromstring(after[table]);expected='A4:G'+str(4+max(1,count))
  assert after_xml.get('ref')==expected and after_xml.find('m:autoFilter',ns).get('ref')==expected
  after_xml.set('ref',before_xml.get('ref'));after_xml.find('m:autoFilter',ns).set('ref',before_xml.find('m:autoFilter',ns).get('ref'))
  assert E.tostring(before_xml)==E.tostring(after_xml)
  assert hashlib.sha256(after['xl/vbaProject.bin']).digest()==hashlib.sha256(original['xl/vbaProject.bin']).digest()
  print('rows',count,': only table/filter bounds changed; all formulas, VBA, report parts preserved')
 for fault in ['missing','columns']:
  book=d/(fault+'.xlsm');xml=E.fromstring(original[table])
  if fault=='missing':xml.set('name','UnexpectedTable')
  else:xml.find('m:tableColumns/m:tableColumn',ns).set('name','UnexpectedColumn')
  with zipfile.ZipFile(book,'w',zipfile.ZIP_DEFLATED) as z:
   for name,data in original.items():z.writestr(name,E.tostring(xml) if name==table else data)
  job.write_text(json.dumps({'fullLoads':[{'loads':[{}]}]}))
  assert subprocess.run([str(exe),str(book),str(job)]).returncode==1,fault
  print(fault,': rejected')
