"""Synchronize explicitly marked web modules without rewriting unrelated reports."""
from pathlib import Path
import re
root=Path(__file__).resolve().parent
target=root.parent/'assets/index.html'
source=target.read_bytes()
pattern=rb'/\* studio-source:([a-z0-9.-]+):start \*/(\r?\n).*?\r?\n/\* studio-source:\1:end \*/'
def replace(match):
    name=match[1].decode('ascii')
    body=(root/name).read_bytes().removeprefix(b'\xef\xbb\xbf').strip(b'\r\n')
    replacement=b'/* studio-source:'+match[1]+b':start */'+match[2]+body+match[2]+b'/* studio-source:'+match[1]+b':end */'
    return match[0] if replacement.replace(b'\r\n',b'\n')==match[0].replace(b'\r\n',b'\n') else replacement
updated,count=re.subn(pattern,replace,source,flags=re.S)
if count!=38:raise SystemExit(f'Expected 38 marked modules, found {count}; no file written')
target.write_bytes(updated)
print(f'Synchronized {count} UI and geometry modules')
