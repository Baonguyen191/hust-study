import { defineConfig, type Plugin, type ResolvedConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";

const PDFJS_DIR = path.resolve(__dirname, "node_modules/pdfjs-dist");
const PDFJS_ASSETS = ["cmaps", "standard_fonts", "wasm", "iccs"];

/** Thư mục chứa PDF gốc: biến môi trường HUST_PDF_ROOT hoặc hust.config.json. */
function resolvePdfRoot(): string | null {
  if (process.env.HUST_PDF_ROOT) return path.resolve(process.env.HUST_PDF_ROOT);
  try {
    const cfg = JSON.parse(fs.readFileSync(path.resolve(__dirname, "hust.config.json"), "utf8"));
    return cfg.pdfRoot ? path.resolve(cfg.pdfRoot) : null;
  } catch {
    return null;
  }
}

/**
 * PDF gốc không nằm trong project (và không được sửa/di chuyển), nên:
 *  - khi dev: phục vụ /pdf/<đường dẫn tương đối> trực tiếp từ pdfRoot (hỗ trợ Range cho PDF.js);
 *  - khi build: sao chép các PDF được manifest tham chiếu vào dist/pdf/.
 */
function hustPdf(): Plugin {
  const root = resolvePdfRoot();
  let config: ResolvedConfig;

  return {
    name: "hust-pdf",
    configResolved(c) {
      config = c;
    },
    configureServer(server) {
      // tài nguyên phụ của PDF.js (font chuẩn, cmap, bộ giải mã wasm)
      server.middlewares.use("/pdfjs/", (req, res, next) => {
        const rel = decodeURIComponent((req.url ?? "").split("?")[0]).replace(/^\/+/, "");
        const file = path.resolve(PDFJS_DIR, rel);
        const top = rel.split("/")[0];
        if (!PDFJS_ASSETS.includes(top) || !file.startsWith(PDFJS_DIR + path.sep) || !fs.existsSync(file)) return next();
        fs.createReadStream(file).pipe(res);
      });
      server.middlewares.use("/pdf/", (req, res, next) => {
        if (!root) return next();
        let rel: string;
        try {
          rel = decodeURIComponent((req.url ?? "").split("?")[0]).replace(/^\/+/, "");
        } catch {
          res.statusCode = 400;
          return res.end();
        }
        const file = path.resolve(root, rel);
        if (!file.startsWith(root + path.sep) || !file.toLowerCase().endsWith(".pdf") || !fs.existsSync(file)) {
          res.statusCode = 404;
          return res.end("PDF not found");
        }
        const size = fs.statSync(file).size;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Accept-Ranges", "bytes");
        const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
        if (range) {
          const start = range[1] ? Number(range[1]) : size - Number(range[2]);
          const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
          if (start < 0 || start > end) {
            res.statusCode = 416;
            res.setHeader("Content-Range", `bytes */${size}`);
            return res.end();
          }
          res.statusCode = 206;
          res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);
          res.setHeader("Content-Length", String(end - start + 1));
          fs.createReadStream(file, { start, end }).pipe(res);
        } else {
          res.setHeader("Content-Length", String(size));
          fs.createReadStream(file).pipe(res);
        }
      });
    },
    closeBundle() {
      if (config.command !== "build") return;
      for (const dir of PDFJS_ASSETS) {
        fs.cpSync(path.join(PDFJS_DIR, dir), path.resolve(config.root, config.build.outDir, "pdfjs", dir), { recursive: true });
      }
      if (!root) {
        config.logger.warn("[hust-pdf] Không tìm thấy pdfRoot – bỏ qua bước sao chép PDF.");
        return;
      }
      const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, "data/manifest.json"), "utf8"));
      const pdfs = new Set<string>();
      for (const s of manifest.subjects) for (const l of s.lessons) pdfs.add(l.pdf);
      const outDir = path.resolve(config.root, config.build.outDir, "pdf");
      let copied = 0;
      for (const rel of pdfs) {
        const src = path.resolve(root, rel);
        if (!fs.existsSync(src)) {
          config.logger.warn(`[hust-pdf] Thiếu ${src}`);
          continue;
        }
        const dst = path.resolve(outDir, rel);
        fs.mkdirSync(path.dirname(dst), { recursive: true });
        fs.copyFileSync(src, dst);
        copied++;
      }
      config.logger.info(`[hust-pdf] Đã sao chép ${copied} PDF vào ${outDir}`);
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), hustPdf()],
});
