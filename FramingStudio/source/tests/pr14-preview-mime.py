from pathlib import Path
import importlib.util,mimetypes,sys,urllib.request
root=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('preview251',root/'source/preview-server251.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
# Reproduce a Windows registry override, then check the actual handler's resolution.
mimetypes.add_type('text/plain','.mjs');mimetypes.add_type('text/plain','.js')
handler=module.PreviewHandler251.__new__(module.PreviewHandler251)
for name in ['pdf.min.mjs','pdf.worker.min.mjs','module.js','MODULE.MJS']:
    assert handler.guess_type(name)=='text/javascript',name
if '--live' in sys.argv:
    for name in ['pdf.min.mjs','pdf.worker.min.mjs']:
        with urllib.request.urlopen('http://127.0.0.1:8783/pdfjs/'+name) as r:
            assert r.status==200 and r.headers.get_content_type()=='text/javascript'
            assert 'no-store' in r.headers.get('Cache-Control','')
            assert r.read()==(root/'assets/pdfjs'/name).read_bytes()
print('PASS JavaScript module MIME resolution survives text/plain Windows overrides'+('; actual PDF.js/worker bytes, headers and no-store verified' if '--live' in sys.argv else ''))
