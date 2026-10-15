"""Read-only comparison: report/independent RC equations and values, layout,
and every PDF pixel. Native Excel may change PDF drawing-stream order while
leaving text positions and pixels identical, so textual comparison is unordered.
"""
import importlib.util,json,re,sys
from pathlib import Path
source=Path(__file__).with_name('report-equivalence253.py')
spec=importlib.util.spec_from_file_location('preservation253',source)
module=importlib.util.module_from_spec(spec)
code=source.read_text(encoding='utf-8').replace('assert pa.extract_text() == pb.extract_text(), name','assert sorted(pa.extract_text().splitlines()) == sorted(pb.extract_text().splitlines()), name')
exec(compile(code,str(source),'exec'),module.__dict__)
original=module.cells
def cells(path):
 result={key:value for key,value in original(path).items() if key[0] in ('Section A 抄','Section B 抄') or re.match(r'^\d+F (?:AC|SB|MB|TB|CB|SL-)',key[0])}
 # Native design status includes the verification clock time; retain all status text.
 return {key:tuple(re.sub(r'^Updated \d{2}:\d{2}:\d{2}', 'Updated <time>',v) if isinstance(v,str) else v for v in value) for key,value in result.items()}
module.cells=cells
if __name__=='__main__':
 paths=list(map(Path,sys.argv[1:3]))
 formulas=[{key:value[0] for key,value in original(p/'RC-filled.xlsm').items() if value[0] is not None} for p in paths]
 assert formulas[0]==formulas[1], 'Generated workbook formulas changed'
 result=module.compare(*paths);result['workbookFormulasPreserved']=len(formulas[0]);print(json.dumps(result))
