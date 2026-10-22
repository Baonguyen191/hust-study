import { useEffect, useRef, useState } from "react";
// bản legacy có polyfill (vd Math.sumPrecise) cho trình duyệt chưa hỗ trợ API mới
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.min.mjs";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";
import { Button, cls } from "./ui";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const asset = (p: string) => new URL(`${import.meta.env.BASE_URL}pdfjs/${p}/`, document.baseURI).href;

/** Mỗi file PDF chỉ mở một lần (IoT dùng chung 1 file cho nhiều chương). */
const docs = new Map<string, Promise<PDFDocumentProxy>>();

function openDoc(url: string): Promise<PDFDocumentProxy> {
  let p = docs.get(url);
  if (!p) {
    p = pdfjs.getDocument({
      url: new URL(url, document.baseURI).href,
      cMapUrl: asset("cmaps"),
      cMapPacked: true,
      standardFontDataUrl: asset("standard_fonts"),
      wasmUrl: asset("wasm"),
      iccUrl: asset("iccs"),
      disableAutoFetch: true,
    }).promise;
    p.catch(() => docs.delete(url));
    docs.set(url, p);
  }
  return p;
}

const ZOOMS = [0.75, 1, 1.25, 1.5, 2];

/**
 * Trình xem PDF gốc: hiển thị 1 trang, vừa khung theo chiều ngang.
 * minPage/maxPage giới hạn điều hướng trong phạm vi trang của bài (vd 1 chương IoT).
 */
export function PdfViewer({
  url,
  page,
  onPageChange,
  minPage = 1,
  maxPage,
  className,
}: {
  url: string;
  page: number;
  onPageChange: (p: number) => void;
  minPage?: number;
  maxPage?: number;
  className?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const [zoomIdx, setZoomIdx] = useState(1);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState(String(page));

  useEffect(() => setInput(String(page)), [page]);

  useEffect(() => {
    let alive = true;
    setDoc(null);
    setError(null);
    holderRef.current?.replaceChildren(); // không để lại trang của PDF trước
    openDoc(url).then(
      (d) => alive && setDoc(d),
      (e: Error) => alive && setError(e.message || String(e)),
    );
    return () => {
      alive = false;
    };
  }, [url]);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const last = Math.min(maxPage ?? Infinity, doc?.numPages ?? maxPage ?? page);
  const clamp = (p: number) => Math.max(minPage, Math.min(last, p));

  useEffect(() => {
    if (!doc || width < 50) return;
    let task: RenderTask | null = null;
    let cancelled = false;
    setBusy(true);
    (async () => {
      const p = await doc.getPage(Math.max(1, Math.min(doc.numPages, page)));
      if (cancelled) return;
      const base = p.getViewport({ scale: 1 });
      const scale = ((width - 2) / base.width) * ZOOMS[zoomIdx];
      const vp = p.getViewport({ scale });
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      // canvas mới cho mỗi lần render để tránh xung đột khi đổi trang nhanh
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(vp.width * dpr);
      canvas.height = Math.floor(vp.height * dpr);
      canvas.style.width = `${Math.floor(vp.width)}px`;
      canvas.style.height = `${Math.floor(vp.height)}px`;
      canvas.className = "mx-auto block rounded-md bg-white shadow";
      task = p.render({ canvas, viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined });
      await task.promise;
      if (!cancelled) holderRef.current?.replaceChildren(canvas);
    })()
      .catch((e: { name?: string; message?: string }) => {
        if (e?.name !== "RenderingCancelledException" && !cancelled) setError(e?.message ?? String(e));
      })
      .finally(() => !cancelled && setBusy(false));
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, page, width, zoomIdx]);

  const go = (p: number) => {
    const c = clamp(p);
    if (c !== page) onPageChange(c);
  };

  return (
    <div className={cls("flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900", className)}>
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950">
        <Button size="sm" variant="ghost" onClick={() => go(page - 1)} disabled={page <= minPage} aria-label="Trang trước">
          ←
        </Button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const n = Number(input);
            if (Number.isFinite(n)) go(n);
            else setInput(String(page));
          }}
          className="flex items-center gap-1 text-sm"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))}
            onBlur={() => setInput(String(page))}
            inputMode="numeric"
            aria-label="Số trang"
            className="w-12 rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-center dark:border-slate-700 dark:bg-slate-900"
          />
          <span className="text-slate-500">
            / {Number.isFinite(last) ? last : "…"}
            {minPage > 1 && <span className="hidden sm:inline"> (từ {minPage})</span>}
          </span>
        </form>
        <Button size="sm" variant="ghost" onClick={() => go(page + 1)} disabled={page >= last} aria-label="Trang sau">
          →
        </Button>
        <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-800" />
        <Button size="sm" variant="ghost" onClick={() => setZoomIdx((z) => Math.max(0, z - 1))} disabled={zoomIdx === 0} aria-label="Thu nhỏ">
          −
        </Button>
        <button type="button" onClick={() => setZoomIdx(1)} className="w-12 text-center text-xs text-slate-600 dark:text-slate-400" title="Vừa khung">
          {Math.round(ZOOMS[zoomIdx] * 100)}%
        </button>
        <Button size="sm" variant="ghost" onClick={() => setZoomIdx((z) => Math.min(ZOOMS.length - 1, z + 1))} disabled={zoomIdx === ZOOMS.length - 1} aria-label="Phóng to">
          +
        </Button>
        {busy && <span className="ml-1 h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />}
        <a
          href={`${url}#page=${page}`}
          target="_blank"
          rel="noreferrer"
          className="ml-auto rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
        >
          Mở PDF ↗
        </a>
      </div>
      <div ref={boxRef} className="relative min-h-0 flex-1 overflow-auto p-2">
        {error ? (
          <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            <p className="font-semibold">Không mở được PDF.</p>
            <p className="mt-1 break-all opacity-80">{error}</p>
            <p className="mt-2">
              Kiểm tra <code className="inline-code">pdfRoot</code> trong <code className="inline-code">hust.config.json</code> rồi chạy lại{" "}
              <code className="inline-code">npm run dev</code>.
            </p>
          </div>
        ) : !doc ? (
          <div className="grid h-full min-h-60 place-items-center text-sm text-slate-500">Đang mở PDF…</div>
        ) : null}
        <div ref={holderRef} className={cls(error && "hidden")} />
      </div>
    </div>
  );
}
