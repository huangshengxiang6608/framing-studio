import importlib.util, pathlib, tempfile, threading, functools, urllib.request, urllib.error, json, unittest
from unittest.mock import Mock, patch
from http.server import ThreadingHTTPServer
spec=importlib.util.spec_from_file_location('preview251',pathlib.Path(__file__).resolve().parents[1]/'preview-server251.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class TestPreview(unittest.TestCase):
 def test_routes(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=pathlib.Path(tmp);(root/'assets').mkdir();(root/'assets/index.html').write_text('E2.251');service=m.ReportService251(root,root/'jobs')
   server=ThreadingHTTPServer(('127.0.0.1',0),functools.partial(m.PreviewHandler251,directory=str(root/'assets'),service=service));threading.Thread(target=server.serve_forever,daemon=True).start();url='http://127.0.0.1:'+str(server.server_port)
   def request(path,body=None,headers={}):
    req=urllib.request.Request(url+path,data=json.dumps(body).encode() if body else None,headers=headers)
    try:
     with urllib.request.urlopen(req) as response:return response.status,response.read(),response.headers
    except urllib.error.HTTPError as error:return error.code,error.read(),error.headers
   try:
    status,data,headers=request('/');self.assertEqual(status,200);self.assertIn('no-store',headers['Cache-Control'])
    self.assertEqual(request('/api/excel/capabilities',headers={'Origin':'https://evil.example'})[0],403)
    self.assertEqual(request('/api/excel/capabilities',headers={'Host':'evil.example'})[0],403)
    payload={'kind':'excel-run','jobs':[{'type':'RC','_reportSection':'B'}]};auth={'Content-Type':'application/json','X-Framing-Key':service.token}
    self.assertEqual(request('/api/excel/run',payload)[0],403)
    self.assertEqual(request('/api/excel/run',payload,{**auth,'Origin':'http://evil.example'})[0],403)
    process=Mock();process.poll.return_value=None
    with patch.object(service,'available',return_value=True),patch.object(m.subprocess,'Popen',return_value=process):
     status,data,_=request('/api/excel/run',payload,auth);self.assertEqual(status,202);job=json.loads(data)['id']
     self.assertEqual(request('/api/excel/run',payload,auth)[0],409)
     folder=service.jobs[job]['folder'];(folder/'events').mkdir();(folder/'events/000001.json').write_text(json.dumps({'progress':'working'}))
     event=json.loads(request('/api/excel/events/'+job+'/0',headers=auth)[1]);self.assertEqual(event['event']['progress'],'working');self.assertEqual(event['cursor'],1)
     self.assertEqual(request('/api/excel/events/'+job+'/0')[0],403)
     self.assertEqual(request('/api/excel/events/'+'0'*32+'/0',headers=auth)[0],400)
     self.assertEqual(request('/api/excel/workbook/'+job+'/invalid/anything.xlsm',headers=auth)[0],400)
     process.poll.return_value=0;self.assertTrue(json.loads(request('/api/excel/events/'+job+'/1',headers=auth)[1])['event']['done'])
   finally:server.shutdown();server.server_close()
if __name__=='__main__':unittest.main()
