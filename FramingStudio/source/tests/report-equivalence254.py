"""Compare A/B report cells, formatting and rendered PDF pages between native runs.

The native design caches intentionally record adopted App steel as Manual so VBA
checks it without selecting again. Those internal control cells are not report
content and are therefore excluded. Original formula values are checked by
ExcelBridge against the submitted independent App expectations on each run.
Usage: python report-equivalence254.py BASE_RUN NEW_RUN
"""
import importlib.util
import json
from pathlib import Path
import sys

spec = importlib.util.spec_from_file_location(
    "report_equivalence253", Path(__file__).with_name("report-equivalence253.py")
)
comparison = importlib.util.module_from_spec(spec)
spec.loader.exec_module(comparison)
all_cells = comparison.cells


def report_cells(path):
    return {key: value for key, value in all_cells(path).items()
            if key[0] in ("Section A 抄", "Section B 抄")}


comparison.cells = report_cells
if __name__ == "__main__":
    result = comparison.compare(Path(sys.argv[1]), Path(sys.argv[2]))
    result["reportFormulaValueCells"] = result.pop("formulaValueCells")
    print(json.dumps(result))
