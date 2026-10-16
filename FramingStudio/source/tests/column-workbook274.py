"""Read-only preservation audit: python column-workbook274.py COMBINED_RUN."""
import copy,json,re,sys,warnings,importlib.util
from pathlib import Path
warnings.filterwarnings('ignore',category=UserWarning)
import openpyxl
spec=importlib.util.spec_from_file_location('eq',Path(__file__).with_name('report-equivalence253.py'))
eq=importlib.util.module_from_spec(spec);spec.loader.exec_module(eq)
root=Path(sys.argv[1]);result=json.loads((root/'result.json').read_text(encoding='utf-8-sig'))
assert result['ok'] and not result['differences']
job=json.loads((root/'job.json').read_text(encoding='utf-8-sig'));parts=job['columnParts274'];output=root/result['workbook']
new=eq.cells(output);merged=openpyxl.load_workbook(output,data_only=False)
assert not merged._external_links and not (merged.security and merged.security.lockStructure)
total=0;report_count=0
def effective_style(sheet,cell):
 # Excel can compact blank explicit cells into the identical column style on save.
 if cell.has_style or cell.value is not None:return cell
 row=sheet.row_dimensions.get(cell.row)
 if row and row.has_style:return row
 for col in sheet.column_dimensions.values():
  if col.min<=cell.column<=col.max and col.has_style:return col
 return cell
for i,part in enumerate(parts):
 folder=root/f'column-part-{i+1}';base=folder/'RC-filled.xlsm';old=eq.cells(base)
 original=openpyxl.load_workbook(base,data_only=False)
 mapping={n:n for n in original.sheetnames} if i==0 else {n:'_M'+str(i+1).zfill(3)+n for n in original.sheetnames if n.startswith('_D')}
 report='Section '+job['section']+' 抄'
 if i:
  record=result['mergedColumns274'][i-1];mapping[record['design']]=record['design'];mapping[report]=record['report']
 def rename_formula(formula):
  if formula is None:return formula
  text,attrs=formula
  for a,b in mapping.items():
   if a!=b:
    text=text.replace("'"+a+"'!","'"+b+"'!")
    text=re.sub(r'(?<![A-Za-z0-9_])'+re.escape(a)+r'!',b+'!',text)
  return text,attrs
 for key,value in old.items():
  if key[0] not in mapping:continue
  target=(mapping[key[0]],key[1]);expected=(rename_formula((original[key[0]][key[1]].value,[]) if value[0] is not None else None),value[1]);actual=new.get(target)
  assert actual is not None,(target,'missing')
  actual=((merged[target[0]][target[1]].value,[]) if actual[0] is not None else None,actual[1])
  assert expected[0]==actual[0] and eq.equivalent(expected[1],actual[1]),(target,expected,actual)
  total+=1
 for name in [report]+([m['designName265'].replace('/','') for m in part['members']] if job['section']=='B' else []):
  if name not in mapping:continue
  a,b=original[name],merged[mapping[name]]
  for prop in ('merged_cells','print_title_rows','print_title_cols','page_setup','page_margins','row_breaks','col_breaks'):
   assert getattr(a,prop)==getattr(b,prop),(name,prop)
  # PrintArea serialization includes the sheet name, which changes for extra reports.
  assert str(a.print_area).split('!')[-1]==str(b.print_area).split('!')[-1]
  for prop in ('row_dimensions','column_dimensions'):
   left,right=getattr(a,prop),getattr(b,prop);assert set(left)==set(right),(name,prop)
   for key in left:
    aa,bb=dict(left[key]),dict(right[key]);aa.pop('s',None);bb.pop('s',None);aa.pop('style',None);bb.pop('style',None)
    assert aa==bb,(name,prop,key)
  for row in a:
   for cell in row:
    left,right=effective_style(a,cell),effective_style(b,b[cell.coordinate])
    for prop in ('font','fill','border','alignment','number_format','protection'):
     assert copy.copy(getattr(left,prop))==copy.copy(getattr(right,prop)),(name,cell.coordinate,prop)
  report_count+=name==report
 for raw in json.loads((folder/'result.json').read_text(encoding='utf-8-sig'))['files']:
  assert (folder/raw['file']).read_bytes()==(root/(f'Part{i+1}-'+raw['file'])).read_bytes()
for name in ['1F AC2','1F AC10']:
 assert name in merged.sheetnames and not merged[name].protection.sheet
 assert '_RCDesign265' in merged[name].defined_names
 assert any(c.data_type=='f' for row in merged[name] for c in row)
for sheet in merged:
 assert not sheet.protection.sheet
data={'nativeComparisons':result['compared'],'preservedFormulaValueCells':total,'columnSheets':['1F AC2','1F AC10'],'reportFormatsPreserved':report_count,'externalLinks':0}
(root/'preservation274.json').write_text(json.dumps(data));print(json.dumps(data))
