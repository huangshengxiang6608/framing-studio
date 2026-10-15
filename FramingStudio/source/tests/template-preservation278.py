"""Read-only audit: template-preservation278.py BASE_TEMPLATE [CURRENT_TEMPLATE].

All workbook parts other than VBA must remain byte-identical. This covers
formula XML, styles, drawings, dimensions, print settings and cached values.
The release's VBA source audit separately checks the three recalculation calls.
"""
from pathlib import Path
import json
import sys
import zipfile

base = Path(sys.argv[1])
current = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).resolve().parents[2] / "Excel/Section A RC - Section B v109 Compact Copy.xlsm"
with zipfile.ZipFile(base) as old, zipfile.ZipFile(current) as new:
    assert old.namelist() == new.namelist(), "Workbook package structure changed"
    changed = [n for n in old.namelist() if old.read(n) != new.read(n)]
    assert changed == ["xl/vbaProject.bin"], changed
    print(json.dumps({"unchangedParts": len(old.namelist()) - 1, "changedParts": changed}))
