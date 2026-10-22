"""Giai đoạn 1 – trích xuất nội dung từ slide PDF.

Quét mọi thư mục môn học (thư mục con chứa PDF) trong thư mục PDF gốc
(`pdfRoot` trong hust.config.json, hoặc biến môi trường HUST_PDF_ROOT),
trích text theo trang, render trang ít chữ ra PNG để đọc thủ công, và sinh
data/manifest.json. File PDF gốc chỉ được đọc, không bao giờ bị sửa.

Chạy:  python scripts/extract.py [--force]
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
RAW = DATA / "raw"
PAGE_IMAGES = DATA / "page-images"
CONTENT = DATA / "content"
OVERRIDES = Path(__file__).with_name("overrides.json")
CONFIG = ROOT / "hust.config.json"


def content_counts(path: Path) -> dict | None:
    """Số mục trong file nội dung, để web đếm thẻ/câu hỏi mà không phải tải hết các bài."""
    if not path.exists():
        return None
    c = json.loads(path.read_text(encoding="utf-8"))
    return {k: len(c.get(k, [])) for k in ("keyConcepts", "codeExamples", "flashcards", "quiz", "examQuestions")}


def load_pdf_root() -> Path:
    env = os.environ.get("HUST_PDF_ROOT")
    if env:
        return Path(env)
    cfg = json.loads(CONFIG.read_text(encoding="utf-8"))
    return (ROOT / cfg["pdfRoot"]).resolve()


PDF_ROOT = load_pdf_root()

# Thư mục không phải môn học (phòng khi pdfRoot trùng thư mục dự án).
SKIP_DIRS = {"node_modules", "data", "public", "dist", "scripts", "src", ".git", ".vscode"}

LOW_TEXT_CHARS = 40  # dưới ngưỡng này coi là trang toàn hình / bản scan
READ_DPI = 110       # ảnh để Claude đọc
FIGURE_IMAGE_RATIO = 0.25  # ảnh chiếm >= 25% diện tích trang
FIGURE_DRAWINGS = 40       # hoặc nhiều nét vẽ vector (sơ đồ)


def slugify(text: str) -> str:
    text = text.replace("đ", "d").replace("Đ", "D")
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text or "lesson"


def clean_title(stem: str) -> str:
    """'Lec 5.1-PHP.pptx' -> 'Bài 5.1 – PHP'; '03-dinhdanh_2.7m' -> 'Chương 3 – dinhdanh'."""
    stem = strip_stem(stem)
    m = re.match(r"^\s*lec(?:ture)?\s*(\d+(?:\.\d+)*)\.?\s*[-_.\s]+(.*)$", stem, flags=re.I)
    if m:
        num = ".".join(str(int(p)) for p in m.group(1).split("."))
        rest = re.sub(r"[_]+", " ", m.group(2)).strip(" -.")
        return f"Bài {num} – {rest}" if rest else f"Bài {num}"
    m = re.match(r"^(\d+)[-_\s]+(.*)$", stem)
    if m:
        rest = re.sub(r"[-_]+", " ", m.group(2)).strip()
        return f"Chương {int(m.group(1))} – {rest}"
    return re.sub(r"[_]+", " ", stem).strip()


def strip_stem(stem: str) -> str:
    stem = re.sub(r"\.pptx?$", "", stem, flags=re.I)
    return re.sub(r"_\d+(\.\d+)?m$", "", stem)  # hậu tố dung lượng kiểu _4.5m


def order_key(lesson: dict, group_order: list[str]) -> tuple:
    group = lesson.get("group") or ""
    g = group_order.index(group) if group in group_order else len(group_order)
    m = re.search(r"(\d+(?:\.\d+)?)", lesson["title"])
    nums = [int(x) for x in m.group(1).split(".")] if m else [999]
    return (g, group) + tuple((nums + [0, 0])[:3]) + (lesson["id"],)


def page_has_figure(page: pymupdf.Page) -> bool:
    area = abs(page.rect)
    img_area = 0.0
    for info in page.get_image_info():
        r = pymupdf.Rect(info["bbox"]) & page.rect
        if area and abs(r) / area < 0.85:  # bỏ qua ảnh nền/template phủ cả trang
            img_area += abs(r)
    if area and img_area / area >= FIGURE_IMAGE_RATIO:
        return True
    try:
        return len(page.get_drawings()) >= FIGURE_DRAWINGS
    except Exception:
        return False


def render(page: pymupdf.Page, out: Path, dpi: int, force: bool) -> None:
    if out.exists() and not force:
        return
    out.parent.mkdir(parents=True, exist_ok=True)
    page.get_pixmap(dpi=dpi).save(out)


def discover_pdfs() -> list[Path]:
    pdfs = []
    for sub in sorted(PDF_ROOT.iterdir()):
        if sub.is_dir() and sub.name not in SKIP_DIRS and not sub.name.startswith("."):
            pdfs += sorted(sub.rglob("*.pdf"))
    return pdfs


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="render lại ảnh đã có")
    args = ap.parse_args()

    overrides = json.loads(OVERRIDES.read_text(encoding="utf-8")) if OVERRIDES.exists() else {}
    subjects: dict[str, dict] = {}
    report = []

    for pdf in discover_pdfs():
        rel = pdf.relative_to(PDF_ROOT).as_posix()  # đường dẫn tương đối với pdfRoot
        subject_id = rel.split("/")[0]
        doc = pymupdf.open(pdf)
        stem = pdf.stem

        parts = overrides.get("splits", {}).get(rel)
        if not parts:
            parts = [{
                "id": slugify(strip_stem(stem)),
                "title": overrides.get("titles", {}).get(rel, clean_title(stem)),
                "start": 1,
                "end": doc.page_count,
            }]

        for part in parts:
            lesson_id = part["id"]
            pages = []
            for pno in range(part["start"], part["end"] + 1):
                page = doc[pno - 1]
                text = page.get_text("text").strip()
                low = len(text) < LOW_TEXT_CHARS
                figure = page_has_figure(page)
                image = None
                if low:
                    img = PAGE_IMAGES / subject_id / lesson_id / f"p{pno}.png"
                    render(page, img, READ_DPI, args.force)
                    image = img.relative_to(ROOT).as_posix()
                pages.append({
                    "page": pno,  # số trang tuyệt đối trong PDF gốc
                    "text": text,
                    "chars": len(text),
                    "lowText": low,
                    "hasFigure": figure,
                    "image": image,
                })

            raw_path = RAW / subject_id / f"{lesson_id}.json"
            raw_path.parent.mkdir(parents=True, exist_ok=True)
            raw_path.write_text(json.dumps({
                "subject": subject_id,
                "lesson": lesson_id,
                "title": part["title"],
                "pdf": rel,
                "pageStart": part["start"],
                "pageEnd": part["end"],
                "pages": pages,
            }, ensure_ascii=False, indent=1), encoding="utf-8")

            content_path = CONTENT / subject_id / f"{lesson_id}.json"
            meta = overrides.get("subjects", {}).get(subject_id, {})
            subj = subjects.setdefault(subject_id, {
                "id": subject_id,
                "name": meta.get("name", subject_id),
                "short": meta.get("short", subject_id),
                "lessons": [],
            })
            subj["lessons"].append({
                "id": lesson_id,
                "title": part["title"],
                "group": part.get("group"),
                "pdf": rel,
                "pageStart": part["start"],
                "pageEnd": part["end"],
                "pageCount": part["end"] - part["start"] + 1,
                "pdfPageCount": doc.page_count,
                "raw": raw_path.relative_to(ROOT).as_posix(),
                "content": content_path.relative_to(ROOT).as_posix(),
                "hasContent": content_path.exists(),
                "counts": content_counts(content_path),
                "lowTextPages": sum(p["lowText"] for p in pages),
            })
            report.append(f"{subject_id}/{lesson_id}: {len(pages)} trang, "
                          f"{sum(p['lowText'] for p in pages)} trang ít chữ")
        doc.close()

    for subj in subjects.values():
        group_order = overrides.get("groupOrder", [])
        subj["lessons"].sort(key=lambda l: order_key(l, group_order))
        for i, lesson in enumerate(subj["lessons"]):
            lesson["order"] = i + 1

    DATA.mkdir(exist_ok=True)
    (DATA / "manifest.json").write_text(json.dumps({
        "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "subjects": sorted(subjects.values(), key=lambda s: s["id"].lower()),
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    print("\n".join(report))
    print(f"-> {len(report)} bài, manifest: data/manifest.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
