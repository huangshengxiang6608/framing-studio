from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import threading,subprocess,sys,json,shutil

repo=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else Path(__file__).resolve().parents[2]
fixture=repo/'tmp/release287-launcher'
(fixture/'FramingStudio/assets').mkdir(parents=True,exist_ok=True)
(fixture/'FramingStudio/assets/index.html').write_bytes(b'<title>E2.287 launcher test</title>')
shutil.copyfile(repo/'start-webui.ps1',fixture/'start-webui.ps1')
body=b'<title>E2.287 launcher test</title>'
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Length',str(len(body)))
        self.send_header('Cache-Control','no-store')
        self.end_headers();self.wfile.write(body)
    def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
command=['powershell.exe','-NoProfile','-ExecutionPolicy','Bypass','-File',str(fixture/'start-webui.ps1'),'-Port',str(server.server_port),'-NoSync','-NoBrowser','-PythonExe',sys.executable]
results=[]
try:
    for expected in [0,1]:
        if expected:body=b'<title>Older preview</title>'
        result=subprocess.run(command,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=20)
        assert result.returncode==expected,(result.returncode,result.stdout,result.stderr)
        assert thread.is_alive(),'Existing server must not be terminated'
        results.append({'sameContent':not expected,'exit':result.returncode,'existingServerPreserved':True})
finally:server.shutdown();server.server_close();thread.join(2)
(fixture/'verification.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results))
