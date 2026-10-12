import io,sys,struct,zipfile,re,json,hashlib
from pathlib import Path
import olefile
from oletools.olevba import VBA_Project,decompress_stream

def compress(data):
 out=bytearray(b'\x01')
 for base in range(0,len(data),4096):
  chunk=data[base:base+4096]; body=bytearray(); pos=0
  while pos<len(chunk):
   flagpos=len(body);body.append(0)
   for bit in range(8):
    if pos>=len(chunk):break
    bits=max(4,(pos-1).bit_length());maxlen=min(len(chunk)-pos,(1<<(16-bits))+2)
    best=0;offset=0
    if maxlen>=3:
     at=chunk.rfind(chunk[pos:pos+3],0,pos)
     while at>=0:
      length=3
      while length<maxlen and chunk[at+length]==chunk[pos+length]:length+=1
      if length>best:best=length;offset=pos-at
      if best==maxlen:break
      at=chunk.rfind(chunk[pos:pos+3],0,at)
    if best>=3:
     body[flagpos]|=1<<bit;body+=struct.pack('<H',((offset-1)<<(16-bits))|(best-3));pos+=best
    else:body.append(chunk[pos]);pos+=1
  if len(body)>4096:
   assert len(chunk)==4096;out+=b'\xff\x3f'+chunk
  else:out+=struct.pack('<H',0xb000|(len(body)-1))+body
 assert decompress_stream(bytes(out))==data
 return bytes(out)

import argparse
parser=argparse.ArgumentParser(description='Repair the E2.250 RC template worksheet reference without saving sheets in Excel. Requires olefile and oletools.')
parser.add_argument('template',type=Path);parser.add_argument('output',type=Path);args=parser.parse_args();src=args.template
assert hashlib.sha256(src.read_bytes()).hexdigest()=='71c8e2e36e5b3510447aa1dfc29f0e44a2ca1504705cfb241a5c8294f1709988','Unexpected template baseline'
assert src.resolve()!=args.output.resolve() and not args.output.exists(),'Use a new output file' 
with zipfile.ZipFile(src) as z: original=z.read('xl/vbaProject.bin')
bio=io.BytesIO(original);ole=olefile.OleFileIO(bio,write_mode=True)
p=VBA_Project(ole,'','PROJECT','VBA/dir');p.parse_project_stream();list(p.parse_modules())
mods=[m for m in p.modules if 'Sub GenerateCopy()' in m.code_str];assert len(mods)==1;m=mods[0]
old='Set ws = ThisWorkbook.Worksheets("Section A 抄")';new='Set ws = ThisWorkbook.Worksheets("Section A " & ChrW(&H6284))'
assert m.code_str.count(old)==1
patched=m.code_str.replace(old,new).encode(p.codec);packed=compress(patched)
raw=ole.openstream(m.code_path).read();replacement=raw[:m.textoffset]+packed
assert len(replacement)<=len(raw),(len(replacement),len(raw))

def replace_stream(path,data):
 olddata=ole.openstream(path).read();assert len(data)<=len(olddata)
 sid=ole._find(path);ole.write_stream(path,data.ljust(len(olddata),b'\0'))
 offset=sid*128+120;sector=ole.first_dir_sector
 for _ in range(offset//ole.sectorsize):sector=ole.fat[sector]
 bio.seek((sector+1)*ole.sectorsize+offset%ole.sectorsize);bio.write(struct.pack('<Q',len(data)))
replace_stream(m.code_path,replacement)
# Invalidate the implementation-specific compiled cache after editing source.
# Preserve CFB allocation size: crossing the 4096-byte mini-stream boundary
# by changing only a directory length would corrupt the container.
# MS-OVBA 2.3.4.1: https://learn.microsoft.com/en-us/openspecs/office_file_formats/ms-ovba/ef7087ac-3974-4452-aab2-7dba2214d239
cache=ole.openstream('VBA/_VBA_PROJECT').read();replace_stream('VBA/_VBA_PROJECT',cache[:2]+b'\xff\xff'+cache[4:7]+bytes(len(cache)-7))
result=bio.getvalue();ole.close()
check=olefile.OleFileIO(result);p2=VBA_Project(check,'','PROJECT','VBA/dir');p2.parse_project_stream();list(p2.parse_modules())
assert len(p.modules)==len(p2.modules)
for a,b in zip(p.modules,p2.modules):assert b.code_str==a.code_str.replace(old,new) if a is m else b.code_str==a.code_str
baseline=olefile.OleFileIO(original)
changed=['/'.join(n) for n in baseline.listdir() if baseline.openstream(n).read()!=check.openstream(n).read()]
assert set(changed)=={m.code_path,'VBA/_VBA_PROJECT'},changed
dest=args.output
with zipfile.ZipFile(src) as z,zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED) as out:
 for info in z.infolist():out.writestr(info,result if info.filename=='xl/vbaProject.bin' else z.read(info.filename))
print(json.dumps({'codec':p.codec,'modules':len(p.modules),'changedStreams':changed,'moduleOffset':m.textoffset,'compressedSize':len(packed),'originalSize':len(raw),'candidate':str(dest)},ensure_ascii=True))
