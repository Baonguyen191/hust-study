# HUST Study

Website tĩnh để học và ôn tập từ slide bài giảng PDF trong thư mục `HUST/`. Gồm tóm tắt, khái niệm, code có chú thích, flashcard (SM-2), quiz, thi thử, tìm kiếm. Bên cạnh nội dung luôn có PDF gốc, nhảy đúng trang khi bấm số trang.

- **Môn hiện có**: Công nghệ Web (13 bài), Hệ phân tán (7 chương), IoT và ứng dụng (7 chương, cắt từ 1 PDF), Kỹ thuật lập trình (9 bài).
- **Nội dung** được viết tay từ slide (không gọi API ngoài). Mục gắn nhãn `bổ sung` là kiến thức ngoài slide.
- **Tiến độ** (đã học, lịch ôn, điểm, câu sai, ghi chú) lưu trong `localStorage` của trình duyệt. Xuất/nhập JSON ở trang *Cài đặt*.

## Cài đặt

Yêu cầu: Node.js ≥ 20, Python ≥ 3.10 với PyMuPDF (chỉ cần khi trích xuất lại PDF).

```bash
npm install
pip install pymupdf
```

PDF gốc **không** nằm trong project và không bao giờ bị sửa. Chỉ đường dẫn tới thư mục trong `hust.config.json`:

```json
{ "pdfRoot": "C:/Users/baoba/OneDrive/Máy tính/HUST" }
```

Hoặc đặt biến môi trường `HUST_PDF_ROOT` (ưu tiên hơn file cấu hình).

## Chạy

```bash
npm run dev       # http://localhost:5173 – PDF được phục vụ trực tiếp từ pdfRoot
npm run build     # kiểm tra kiểu + build ra dist/ (sao chép kèm PDF, ảnh slide, tài nguyên PDF.js)
npm run preview   # xem thử bản build
```

`dist/` là site tĩnh hoàn chỉnh, dùng đường dẫn tương đối và hash router. Có thể mở bằng bất kỳ static server nào (vd `npx serve dist`). Lưu ý `dist/` chứa bản sao PDF (~130 MB).

## Deploy (GitHub Pages)

Site: https://baonguyen191.github.io/hust-study/

```bash
npm run deploy    # build ở máy (cần pdfRoot) rồi đẩy dist/ lên nhánh gh-pages
```

GitHub Pages phục vụ từ nhánh `gh-pages`, thường cập nhật sau 1–2 phút. Phải build ở máy vì PDF gốc không nằm trong repo. `data/raw/` cũng không đưa lên repo vì là text thô của slide; tái tạo bằng `npm run extract`. Sau khi sửa nội dung, nhớ commit + push `main` rồi chạy `npm run deploy`.

## Cấu trúc

```
hust.config.json          đường dẫn thư mục PDF gốc
scripts/
  extract.py              Giai đoạn 1: quét pdfRoot → data/raw, data/manifest.json
  overrides.json          tên môn, tiêu đề bài, cách cắt PDF nhiều chương (IoT)
  render_slides.py        render các trang "figures" → public/slides/<môn>/<bài>/p<n>.png
  validate-content.ts     kiểm tra data/content theo schema Zod + đối chiếu manifest
data/
  manifest.json           danh sách môn/bài, khoảng trang, số thẻ/câu hỏi
  raw/<môn>/<bài>.json    text từng trang (đầu vào để viết nội dung)
  content/<môn>/<bài>.json  nội dung học (tóm tắt, khái niệm, code, flashcard, quiz, tự luận)
src/schema/content.ts     schema Zod của nội dung và manifest
src/                      ứng dụng React (Vite + TypeScript + Tailwind)
```

## Thêm PDF mới

1. Chép PDF vào thư mục môn trong `HUST/`. Môn mới thì tạo thư mục mới; mỗi thư mục con là một môn.
2. (Tuỳ chọn) Thêm tên môn, tiêu đề đẹp cho bài, hoặc cách cắt chương vào `scripts/overrides.json`.
3. Trích xuất lại:
   ```bash
   npm run extract
   ```
   Trang ít chữ (slide dạng ảnh/scan) được render vào `data/page-images/` để đọc thủ công.
4. Nhờ Claude Code sinh nội dung, ví dụ:
   > Đọc `data/raw/<môn>/<bài>.json` (và ảnh trong `data/page-images/<môn>/<bài>/` nếu có), viết `data/content/<môn>/<bài>.json` theo schema `src/schema/content.ts`: tóm tắt Markdown, khái niệm, code có giải thích từng phần, 15–30 flashcard, 10–20 câu quiz (nhớ/hiểu/vận dụng), 3–5 câu tự luận. Mọi mục ghi số trang slide, kiến thức ngoài slide đánh dấu `"source": "bổ sung"`. Chạy `npm run validate` cho tới khi hết lỗi.
5. Hoàn tất:
   ```bash
   npm run validate   # tất cả file phải ✓
   npm run extract    # cập nhật hasContent và số thẻ/câu trong manifest
   npm run slides     # render ảnh các trang "figures"
   ```

## Định dạng nội dung (tóm tắt)

- Số trang luôn là số trang tuyệt đối trong file PDF gốc. Với IoT là trang của file PDF chung, trong khoảng `pageStart–pageEnd` của chương.
- Trong Markdown, link `[tr. 12](#p12)` thành nút mở slide trang 12.
- `quiz[].answer` là chỉ số 0–3. Website tự trộn thứ tự đáp án mỗi lượt.
- `codeExamples[].parts[].lines` dạng `"3"` hoặc `"3-7"`. Rê chuột lên chú thích để tô sáng các dòng.

## Phím tắt

| Ở đâu | Phím |
|---|---|
| Mọi trang | `/` tìm kiếm |
| Flashcard | `Space` lật thẻ · `1` Quên · `2` Khó · `3` Nhớ |
| Quiz / thi thử | `1`–`4` chọn đáp án · `←` `→` chuyển câu · `Enter` câu tiếp |
| Trang bài học | `←` `→` lật trang slide |

## Lịch ôn flashcard

SM-2 rút gọn với 3 mức:

- **Quên**: gặp lại sau 10 phút và cuối phiên, hệ số dễ giảm.
- **Khó**: khoảng cách tăng ×1.2.
- **Nhớ**: 2 ngày, 5 ngày, rồi nhân hệ số dễ (khởi đầu 2.5).

“Cần ôn hôm nay” gồm thẻ đến hạn cộng thẻ mới của các bài đã đánh dấu *đã học*.
