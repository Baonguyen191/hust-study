"""Render thumbnail cho các trang sơ đồ/hình quan trọng.

Danh sách trang lấy từ trường `figures` trong data/content/<môn>/<bài>.json
(do Claude chọn khi đọc bài). Ảnh lưu ở public/slides/<môn>/<bài>/p<số>.png.

Chạy:  python scripts/render_slides.py [--force]
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import pymupdf

from extract import PDF_ROOT

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
OUT = ROOT / "public" / "slides"
WIDTH = 960  # px


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    manifest = json.loads((DATA / "manifest.json").read_text(encoding="utf-8"))
    count = 0
    for subject in manifest["subjects"]:
        for lesson in subject["lessons"]:
            content_path = ROOT / lesson["content"]
            if not content_path.exists():
                continue
            figures = json.loads(content_path.read_text(encoding="utf-8")).get("figures", [])
            if not figures:
                continue
            doc = pymupdf.open(PDF_ROOT / lesson["pdf"])
            for fig in figures:
                out = OUT / subject["id"] / lesson["id"] / f"p{fig['page']}.png"
                if out.exists() and not args.force:
                    continue
                page = doc[fig["page"] - 1]
                zoom = WIDTH / page.rect.width
                out.parent.mkdir(parents=True, exist_ok=True)
                page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom)).save(out)
                count += 1
            doc.close()
    print(f"-> render {count} ảnh mới vào public/slides/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
