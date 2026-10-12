"""Compare native report outputs from two runs of the same job.

Usage: python report-equivalence253.py BASE_RUN NEW_RUN
Checks all workbook formula/value cells and both report sheets' formatting,
plus PDF page text, page boxes and rasterized pixels (requires pdftoppm).
Diagnostic workbooks and rendered pages stay outside the repository.
"""
import copy
import json
import math
import re
from pathlib import Path
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
import zipfile

import openpyxl
from PIL import Image, ImageChops
from pypdf import PdfReader

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def cells(path):
    result = {}
    with zipfile.ZipFile(path) as z:
        rels = {r.get("Id"): r.get("Target").lstrip("/") for r in ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))}
        sheet_names = {}
        for sheet in ET.fromstring(z.read("xl/workbook.xml")).find("m:sheets", NS):
            target = rels[sheet.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")]
            sheet_names[target if target.startswith("xl/") else "xl/" + target] = sheet.get("name")
        strings = []
        if "xl/sharedStrings.xml" in z.namelist():
            for si in ET.fromstring(z.read("xl/sharedStrings.xml")):
                strings.append("".join(si.itertext()))
        for name in z.namelist():
            if not name.startswith("xl/worksheets/sheet") or not name.endswith(".xml"):
                continue
            for c in ET.fromstring(z.read(name)).findall(".//m:c", NS):
                value = c.findtext("m:v", default="", namespaces=NS)
                if c.get("t") == "s":
                    value = strings[int(value)]
                elif c.get("t") == "inlineStr":
                    value = "".join(c.find("m:is", NS).itertext())
                formula = c.find("m:f", NS)
                if formula is not None or value != "":
                    result[(sheet_names[name], c.get("r"))] = (
                        None if formula is None else (formula.text, sorted(formula.attrib.items())), value
                    )
    return result


def equivalent(a, b):
    if a == b:
        return True
    try:
        return math.isclose(float(a), float(b), rel_tol=1e-12, abs_tol=1e-12)
    except (TypeError, ValueError):
        return False


def timestamp(key, value):
    """Only native Now/Format(Now) audit fields; never calculation results."""
    sheet, cell = key
    numeric = (sheet == "_Input Engine" and (cell in ("AS2", "AV2") or re.fullmatch(r"BA[1-9][0-9]+", cell))) or (sheet == "_TB Analysis" and cell == "DG2")
    if numeric and value is not None and value[0] is None:
        assert 40000 < float(value[1]) < 100000, (key, value)
        return (None, "native run timestamp")
    text = {
        "Input": {"H3"}, "_Input Engine": {"G4"},
        "Section B Slab Check": {"K1"},
        "Section B Secondary Beam Design": {"B5", "BR36"},
        "Section B Main Beam Design": {"B5", "BR36"},
        "Section B Transfer Beam Check": {"B5"},
        "Section A 抄": {"J5"}, "Section B 抄": {"J2", "J5"},
    }
    if cell in text.get(sheet, set()) and value is not None:
        return (value[0], re.sub(r"(?<=Updated )\d{2}:\d{2}:\d{2}|(?<=Generated )\d{4}-\d{2}-\d{2} \d{2}:\d{2}|(?<=Generated: )\d{4}-\d{2}-\d{2} \d{2}:\d{2}|(?<=Updated: )\d{4}-\d{2}-\d{2} \d{2}:\d{2}", "<run time>", value[1]))
    return value


def compare(base, new):
    old_book = next(base.glob("*-filled.xlsm"))
    new_book = next(new.glob("*-filled.xlsm"))
    a, b = cells(old_book), cells(new_book)
    differences = []
    for key in a.keys() | b.keys():
        av, bv = timestamp(key, a.get(key)), timestamp(key, b.get(key))
        if av != bv and (av is None or bv is None or av[0] != bv[0] or not equivalent(av[1], bv[1])):
            differences.append((key, av, bv))
    assert not differences, json.dumps(differences[:30], ensure_ascii=True)
    books = [openpyxl.load_workbook(p, data_only=False) for p in (old_book, new_book)]
    reports = 0
    for name in ("Section A 抄", "Section B 抄"):
        sa, sb = [book[name] for book in books]
        for attr in ("merged_cells", "print_area", "print_title_rows", "print_title_cols", "page_setup", "page_margins", "row_breaks", "col_breaks"):
            assert getattr(sa, attr) == getattr(sb, attr), (name, attr)
        assert ET.tostring(sa.HeaderFooter.to_tree()) == ET.tostring(sb.HeaderFooter.to_tree()), (name, "HeaderFooter")
        for attr in ("row_dimensions", "column_dimensions"):
            da, db = getattr(sa, attr), getattr(sb, attr)
            assert set(da) == set(db), (name, attr, "keys")
            for key in da:
                assert dict(da[key]) == dict(db[key]), (name, attr, key)
        for row in sa:
            for ca in row:
                cb = sb[ca.coordinate]
                for attr in ("font", "fill", "border", "alignment", "number_format", "protection"):
                    assert copy.copy(getattr(ca, attr)) == copy.copy(getattr(cb, attr)), (name, ca.coordinate, attr)
        reports += 1
    names = sorted(p.name for p in base.glob("*.pdf"))
    assert names == sorted(p.name for p in new.glob("*.pdf"))
    pages = 0
    with tempfile.TemporaryDirectory(prefix="report-equivalence253-") as temp:
        temp = Path(temp)
        for index, name in enumerate(names):
            readers = [PdfReader(p / name) for p in (base, new)]
            assert len(readers[0].pages) == len(readers[1].pages), name
            for pa, pb in zip(readers[0].pages, readers[1].pages):
                assert pa.mediabox == pb.mediabox and pa.cropbox == pb.cropbox, name
                assert pa.extract_text() == pb.extract_text(), name
                pages += 1
            for label, directory in (("old", base), ("new", new)):
                subprocess.run(["pdftoppm", "-r", "120", "-png", str(directory / name), str(temp / label)], check=True, capture_output=True)
            old_images = sorted(temp.glob("old-*.png"))
            new_images = sorted(temp.glob("new-*.png"))
            assert len(old_images) == len(new_images)
            for old, updated in zip(old_images, new_images):
                with Image.open(old) as ia, Image.open(updated) as ib:
                    assert ia.size == ib.size and ImageChops.difference(ia.convert("RGB"), ib.convert("RGB")).getbbox() is None, (name, old.name, "pixels")
            for image in old_images + new_images:
                image.unlink()
    return {"formulaValueCells": len(a), "reportSheets": reports, "pdfFiles": len(names), "pdfPages": pages, "pixelDifferences": 0}


if __name__ == "__main__":
    print(json.dumps(compare(Path(sys.argv[1]), Path(sys.argv[2]))))
