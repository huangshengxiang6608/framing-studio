"""Read-only native export regression: python export-stability266.py RUN_DIR ..."""
from pathlib import Path
import json,sys,math,warnings
warnings.filterwarnings('ignore', category=UserWarning)
import openpyxl

for argument in sys.argv[1:]:
    run=Path(argument)
    job=json.loads((run/'job.json').read_text(encoding='utf-8-sig'))
    result=json.loads((run/'result.json').read_text(encoding='utf-8-sig'))
    assert result['ok'] and not result['differences'],result
    assert not result.get('cached'), 'Regression must perform a fresh native calculation'
    book=openpyxl.load_workbook(run/result['workbook'],data_only=False)
    values=openpyxl.load_workbook(run/result['workbook'],data_only=True)
    sheet=book['RC Load Results'];data=values[sheet.title]
    members={m['id']:m for m in job['members']}
    for row,beam in enumerate(job.get('fullLoads',[]),5):
        cb=beam['kind']=='CB'
        assert sheet[f'B{row}'].value==f'=INDIRECT("\'"&K{row}&"\'!'+('C' if cb else 'B')+f'"&L{row})'
        assert math.isclose(data[f'B{row}'].value,beam['L'],rel_tol=1e-9)
        for column,code in zip('CDEFGHIJ',['M','V','RA','RB','G','Q','X','VALID']):
            expected=f'=FullAction73(A{row},B{row},RCLoads73[#Data],"{code}"'+(',TRUE)' if cb else ')')
            assert sheet[f'{column}{row}'].value==expected,(beam['id'],column,sheet[f'{column}{row}'].value)
        assert data[f'J{row}'].value=='OK'
        for column,key in zip('CDEFGH',['M','V','RA','RB','dead','live']):
            assert math.isclose(data[f'{column}{row}'].value,beam['expected'][key],rel_tol=1e-7,abs_tol=1e-7),(beam['id'],key)
    print(json.dumps({'run':str(run),'members':len(job['members']),'compared':result['compared'],'differences':0,'mixedBeamFormulasPreserved':True,'freshNativeCalculation':True}))
