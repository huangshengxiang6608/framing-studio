"""Loopback preview with an authenticated, same-origin native Excel report worker.
The worker uses the shipped desktop Excel/PDF routines unchanged. No uploaded
file paths or commands are accepted. All job files remain local to this host.
"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit
import argparse, functools, json, os, re, secrets, subprocess, threading, time

class ReportService251:
    def __init__(self, root, data):
        self.root, self.data = Path(root).resolve(), Path(data).resolve()
        self.token = secrets.token_urlsafe(32)
        self.jobs, self.lock = {}, threading.Lock()
    def available(self):
        if os.name != 'nt' or not (self.root/'FramingStudio.exe').is_file(): return False
        try:
            import winreg
            with winreg.OpenKey(winreg.HKEY_CLASSES_ROOT, r'Excel.Application\CLSID'): return True
        except OSError: return False
    def start(self, message):
        jobs = message.get('jobs')
        if message.get('kind') != 'excel-run' or not isinstance(jobs,list) or not 1 <= len(jobs) <= 1000:
            raise ValueError('Invalid Excel jobs')
        for job in jobs:
            if not isinstance(job,dict) or job.get('type') not in ('RC','Overall','Deflection','Steel','Foundation','Truss'):
                raise ValueError('Invalid Excel job type')
            if job.get('_reportSection') not in (None,'A','B'): raise ValueError('Report section must be A or B')
        if not self.available(): raise ValueError('本機 Microsoft Excel 或 Framing Studio 不可用')
        with self.lock:
            if any(j['process'].poll() is None for j in self.jobs.values()): raise RuntimeError('已有報表正在生成，請稍候')
            ident=secrets.token_hex(16);folder=self.data/ident;folder.mkdir(parents=True)
            message={**message,'openWhenReady':False};request=folder/'request.json'
            request.write_text(json.dumps(message,ensure_ascii=False),encoding='utf-8')
            process=subprocess.Popen([str(self.root/'FramingStudio.exe'),'--local-report251',str(request)],cwd=self.root,
                creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0),stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            self.jobs[ident]={'folder':folder,'process':process,'started':time.monotonic()}
            return ident
    def job(self, ident):
        if not re.fullmatch(r'[0-9a-f]{32}',ident) or ident not in self.jobs: raise ValueError('Unknown report job')
        return self.jobs[ident]
    def poll(self,ident,cursor):
        job=self.job(ident);files=sorted((job['folder']/'events').glob('*.json'))
        if cursor < 0 or cursor > len(files): raise ValueError('Invalid event cursor')
        if cursor < len(files): return {'cursor':cursor+1,'event':json.loads(files[cursor].read_text(encoding='utf-8'))}
        if job['process'].poll() is not None: return {'cursor':cursor,'event':{'done':True,'error':'本機報表程序已結束，未收到完成結果'}}
        if not files and time.monotonic()-job['started']>120:
            job['process'].kill()
            return {'cursor':cursor,'event':{'done':True,'error':'本機報表程序未能啟動，請重試'}}
        return {'cursor':cursor}
    def workbook(self,ident,run_id,filename):
        job=self.job(ident)
        if not re.fullmatch(r'[0-9]{8}-[0-9]{6}-[0-9a-f]{8}',run_id) or Path(filename).name!=filename:
            raise ValueError('Invalid workbook path')
        folder=job['folder']/'worker-data'/'ExcelRuns'/run_id
        record=json.loads((folder/'result.json').read_text(encoding='utf-8-sig'))
        if filename != record.get('workbook') or Path(filename).suffix not in ('.xlsx','.xlsm'): raise ValueError('Unregistered workbook')
        target=(folder/filename).resolve()
        if not target.is_relative_to(job['folder']) or not target.is_file(): raise ValueError('Workbook not found')
        return target

class PreviewHandler251(SimpleHTTPRequestHandler):
    # Windows MIME registry entries can map .mjs to text/plain; module loading requires JavaScript.
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.js':'text/javascript', '.mjs':'text/javascript'}
    def __init__(self,*args,service,**kwargs): self.service=service;super().__init__(*args,**kwargs)
    def allowed(self):
        port=self.server.server_port;hosts={f'127.0.0.1:{port}',f'localhost:{port}'}
        if self.headers.get('Host') not in hosts: return False
        origin=self.headers.get('Origin')
        return (not origin or origin in {'http://'+h for h in hosts}) and self.headers.get('Sec-Fetch-Site') not in ('cross-site','same-site')
    def json_response(self,value,status=200):
        data=json.dumps(value,ensure_ascii=False).encode('utf-8');self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
    def authenticated(self): return self.allowed() and secrets.compare_digest(self.headers.get('X-Framing-Key',''),self.service.token)
    def do_GET(self):
        if not self.allowed(): return self.json_response({'error':'Origin rejected'},403)
        path=urlsplit(self.path).path
        if path=='/api/excel/capabilities': return self.json_response({'available':self.service.available(),'token':self.service.token})
        if path.startswith('/api/excel/'):
            if not self.authenticated(): return self.json_response({'error':'Authentication required'},403)
            try:
                parts=path.split('/')
                if len(parts)==6 and parts[3]=='events': return self.json_response(self.service.poll(parts[4],int(parts[5])))
                if len(parts)==7 and parts[3]=='workbook':
                    from urllib.parse import unquote
                    target=self.service.workbook(parts[4],parts[5],unquote(parts[6]));data=target.read_bytes()
                    self.send_response(200);self.send_header('Content-Type','application/octet-stream');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data);return
                return self.json_response({'error':'Unknown endpoint'},404)
            except (ValueError,OSError,KeyError): return self.json_response({'error':'Invalid report request'},400)
        if 'If-Modified-Since' in self.headers: del self.headers['If-Modified-Since']
        super().do_GET()
    def do_POST(self):
        if not self.authenticated(): return self.json_response({'error':'Authentication required'},403)
        if self.path!='/api/excel/run': return self.json_response({'error':'Unknown endpoint'},404)
        try:
            if self.headers.get_content_type()!='application/json': raise ValueError('Expected JSON')
            length=int(self.headers.get('Content-Length','0'))
            if not 0<length<=50*1024*1024: raise ValueError('Report request too large')
            message=json.loads(self.rfile.read(length));ident=self.service.start(message)
            return self.json_response({'id':ident},202)
        except RuntimeError as error: return self.json_response({'error':str(error)},409)
        except (ValueError,AttributeError,OSError) as error: return self.json_response({'error':str(error)},400)
    def end_headers(self):
        self.send_header('Cache-Control','no-store');self.send_header('X-Content-Type-Options','nosniff');super().end_headers()

def serve(root,port=8783,data=None):
    root=Path(root).resolve();service=ReportService251(root,data or root/'LocalReports')
    handler=functools.partial(PreviewHandler251,directory=str(root/'assets'),service=service)
    ThreadingHTTPServer(('127.0.0.1',port),handler).serve_forever()
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--root',default=str(Path(__file__).resolve().parents[1]));parser.add_argument('--port',type=int,default=8783);parser.add_argument('--data');args=parser.parse_args();serve(args.root,args.port,args.data)
