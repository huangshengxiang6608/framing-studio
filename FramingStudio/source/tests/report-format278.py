"""Compare report formatting for identical member inputs.

Use an unchanged renderer control with corrected inputs when auditing an input
routing fix: different occupied reinforcement layers legitimately move rows.

Usage: python report-format278.py BASE_RUN NEW_RUN
"""
import copy
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET
import openpyxl
from pypdf import PdfReader

base, new = map(Path, sys.argv[1:3])
books = [openpyxl.load_workbook(p / "RC-filled.xlsm", data_only=False) for p in (base, new)]
for name in ("Section A 抄", "Section B 抄"):
    a, b = [w[name] for w in books]
    for attr in ("merged_cells", "print_area", "print_title_rows", "print_title_cols", "page_setup", "page_margins", "row_breaks", "col_breaks"):
        assert getattr(a, attr) == getattr(b, attr), (name, attr)
    assert ET.tostring(a.HeaderFooter.to_tree()) == ET.tostring(b.HeaderFooter.to_tree())
    for attr in ("row_dimensions", "column_dimensions"):
        left, right = getattr(a, attr), getattr(b, attr)
        assert set(left) == set(right), (name, attr)
        for key in left:
            assert dict(left[key]) == dict(right[key]), (name, attr, key)
    for row in a:
        for cell in row:
            for attr in ("font", "fill", "border", "alignment", "number_format", "protection"):
                assert copy.copy(getattr(cell, attr)) == copy.copy(getattr(b[cell.coordinate], attr)), (name, cell.coordinate, attr)
old_files = sorted(p.name for p in base.glob("*.pdf"))
new_files = sorted(p.name for p in new.glob("*.pdf"))
assert old_files == new_files
pages = 0
for name in old_files:
    a, b = [PdfReader(p / name) for p in (base, new)]
    assert len(a.pages) == len(b.pages), name
    for pa, pb in zip(a.pages, b.pages):
        assert pa.mediabox == pb.mediabox and pa.cropbox == pb.cropbox, name
        pages += 1
print(json.dumps({"reportFormatsPreserved": 2, "pdfPageBoxesPreserved": pages}))
