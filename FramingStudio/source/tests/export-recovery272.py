from pathlib import Path
import subprocess,json,tempfile,os
source=Path(__file__).resolve().parents[1]/'ExcelBridge.cs'
base=source.read_text(encoding='utf-8-sig')
stub=r'''
 static int Stub272(string[] args){
  string dir=Path.GetDirectoryName(args[1]);var job=Obj(J.DeserializeObject(File.ReadAllText(args[1])));
  string scenario=Convert.ToString(job["scenario"]);bool recovered=AppDomain.CurrentDomain.FriendlyName.StartsWith("ExcelRecovery272-");
  bool ok=scenario=="recover"&&recovered;
  string phase=scenario=="later"?"计算与核对：Check99":"恢复原 Excel 转换梁计算";
  Write(Path.Combine(dir,"progress.json"),new{message=phase,seconds=1});
  string error=scenario=="validation"?"App 与 Excel 结果有差异":"RPC (0x800706BA)";
  string workbook=ok||scenario=="partial"?"RC-filled.xlsm":null;
  if(workbook!=null)File.WriteAllText(Path.Combine(dir,workbook),"verified-test-artifact");
  Write(Path.Combine(dir,"result.json"),new{ok=ok,error=ok?null:error,workbook=workbook,compared=scenario=="compared"?1:0,differences=scenario=="validation"?new[]{"mismatch"}:new string[0]});
  File.WriteAllText(Path.Combine(dir,"error-details.txt"),error);
  return ok?0:1;
 }
'''
# The production recovery wrapper is unchanged; substitute only the Excel worker.
base=base.replace('return RunJob272(new[]{args[1],args[2]});','return Stub272(new[]{args[1],args[2]});').replace('int code=RunJob272(args);','int code=Stub272(args);').replace(' static int RunJob272(string[] args){',stub+'\n static int RunJob272(string[] args){')
with tempfile.TemporaryDirectory(prefix='framing-recovery272-',dir=Path.cwd()) as tmp:
 assert Path(tmp).resolve().is_relative_to(Path.cwd().resolve())
 d=Path(tmp);cs=d/'Recovery.cs';cs.write_text(base,encoding='utf8');exe=d/'Recovery.exe'
 compiler=Path(os.environ['WINDIR'])/'Microsoft.NET/Framework64/v4.0.30319/csc.exe'
 subprocess.run([str(compiler),'/nologo','/target:exe','/platform:x64','/out:'+str(exe),'/reference:System.Web.Extensions.dll','/reference:Microsoft.CSharp.dll','/reference:'+str(compiler.parent/'WPF/WindowsBase.dll'),str(cs)],check=True)
 for scenario,count in [('recover',2),('permanent',3),('validation',1),('later',1),('partial',1),('compared',1),('other-kind',1)]:
  run=d/scenario;run.mkdir();job=run/'job.json';payload=json.dumps({'type':'Steel' if scenario=='other-kind' else 'RC','scenario':scenario,'unchangedInput':[1,2,3]});job.write_text(payload)
  completed=subprocess.run([str(exe),str(d),str(job)],timeout=30)
  result=json.loads((run/'result.json').read_text(encoding='utf-8-sig'))
  assert result['ok']==(scenario=='recover'),(scenario,result)
  assert completed.returncode==(0 if scenario=='recover' else 1)
  assert result.get('recoveryAttempts',1)==count,(scenario,result)
  archives=list(run.glob('recovery-*/attempt-*'));assert len(archives)==(count if count>1 else 0)
  for attempt in archives:assert (attempt/'job.json').read_text()==payload
  if scenario=='recover':assert (run/result['workbook']).read_text()=='verified-test-artifact'
  if count>1:assert len(json.loads((run/'recovery272.json').read_text(encoding='utf-8-sig'))['attempts'])==count
  print(scenario+': passed ('+str(count)+' attempts)')
