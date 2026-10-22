import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Fuse from "fuse.js";
import { loadLessons, manifest, normalizeVi, useAsync, type LoadedLesson } from "../data";
import { accent, Card, cls, ErrorBox, Loading } from "../components/ui";

interface Doc {
  kind: "Khái niệm" | "Tóm tắt";
  subject: string;
  lesson: string;
  lessonTitle: string;
  title: string;
  text: string;
  page: number;
  nTitle: string;
  nText: string;
}

/** Bỏ cú pháp Markdown, giữ chữ. */
function plain(md: string): string {
  return md
    .replace(/^\s*\|?[\s:|-]+\|?\s*$/gm, "") // dòng kẻ của bảng
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s*(#{1,6}|>)\s+/gm, "")
    .replace(/\*\*|`/g, "")
    .replace(/\s*\|\s*/g, " · ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Bỏ dấu theo từng ký tự để vị trí trong chuỗi gốc và chuỗi chuẩn hoá trùng nhau (phục vụ tô sáng). */
const normKeepLength = (s: string) =>
  Array.from(s)
    .map((ch) => normalizeVi(ch).slice(0, 1) || ch)
    .join("");

function buildDocs(loaded: LoadedLesson[]): Doc[] {
  const docs: Doc[] = [];
  for (const { subject, meta, content } of loaded) {
    const base = { subject: subject.id, lesson: meta.id, lessonTitle: meta.title };
    for (const c of content.keyConcepts) {
      const text = plain(c.definition);
      docs.push({ ...base, kind: "Khái niệm", title: c.term, text, page: c.pages[0], nTitle: normKeepLength(c.term), nText: normKeepLength(text) });
    }
    // tách tóm tắt theo tiêu đề ## / ###
    for (const sec of content.summary.split(/\n(?=#{2,3} )/)) {
      const [head, ...rest] = sec.split("\n");
      const title = plain(head).replace(/tr\. \d+/g, "").replace(/[–-]\s*$/, "").trim();
      const text = plain(rest.join("\n"));
      if (!text) continue;
      const pm = /#p(\d+)/.exec(sec);
      docs.push({
        ...base,
        kind: "Tóm tắt",
        title: title || meta.title,
        text,
        page: pm ? Number(pm[1]) : meta.pageStart,
        nTitle: normKeepLength(title),
        nText: normKeepLength(text),
      });
    }
  }
  return docs;
}

let indexCache: { docs: Doc[]; fuse: Fuse<Doc> } | null = null;

function snippet(doc: Doc, q: string): { pre: string; hit: string; post: string } {
  const nq = normKeepLength(q.trim());
  const i = nq ? doc.nText.indexOf(nq) : -1;
  if (i < 0) return { pre: doc.text.slice(0, 220) + (doc.text.length > 220 ? "…" : ""), hit: "", post: "" };
  const from = Math.max(0, i - 90);
  return {
    pre: (from > 0 ? "…" : "") + doc.text.slice(from, i),
    hit: doc.text.slice(i, i + nq.length),
    post: doc.text.slice(i + nq.length, i + nq.length + 140) + (i + nq.length + 140 < doc.text.length ? "…" : ""),
  };
}

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [input, setInput] = useState(q);
  const [subject, setSubject] = useState("all");
  useEffect(() => setInput(q), [q]);

  const { data, error, loading } = useAsync(async () => {
    if (!indexCache) {
      const docs = buildDocs(await loadLessons());
      indexCache = {
        docs,
        fuse: new Fuse(docs, {
          keys: [
            { name: "nTitle", weight: 2 },
            { name: "nText", weight: 1 },
          ],
          threshold: 0.32,
          ignoreLocation: true,
          minMatchCharLength: 2,
        }),
      };
    }
    return indexCache;
  }, []);

  const results = useMemo(() => {
    if (!data || q.trim().length < 2) return [];
    return data.fuse
      .search(normalizeVi(q.trim()), { limit: 120 })
      .map((r) => r.item)
      .filter((d) => subject === "all" || d.subject === subject)
      .slice(0, 60);
  }, [data, q, subject]);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tìm kiếm</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setParams(input.trim() ? { q: input.trim() } : {}, { replace: true });
        }}
      >
        <input
          autoFocus
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setParams(e.target.value.trim() ? { q: e.target.value } : {}, { replace: true });
          }}
          placeholder="Nhập khái niệm, vd: closure, đồng bộ hoá, MQTT, đệ quy… (gõ không dấu cũng được)"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
        />
      </form>
      <div className="flex flex-wrap gap-1.5">
        {[{ id: "all", name: "Tất cả" }, ...manifest.subjects].map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSubject(s.id)}
            className={cls(
              "rounded-full px-3 py-1 text-xs font-medium ring-1",
              subject === s.id
                ? "bg-indigo-600 text-white ring-indigo-600"
                : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800",
            )}
          >
            {s.name}
          </button>
        ))}
      </div>

      {loading && <Loading label="Đang tạo chỉ mục tìm kiếm…" />}
      {error && <ErrorBox>{error.message}</ErrorBox>}
      {data && q.trim().length >= 2 && (
        <p className="text-sm text-slate-500">
          {results.length} kết quả cho “{q}”
        </p>
      )}
      <div className="space-y-2">
        {results.map((d, i) => {
          const sn = snippet(d, q);
          const a = accent(d.subject);
          return (
            <Link key={i} to={`/l/${d.subject}/${d.lesson}?p=${d.page}`} className="block">
              <Card className="p-4 transition-colors hover:border-indigo-300 dark:hover:border-indigo-500/50">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className={cls("rounded-full px-2 py-0.5 font-semibold", a.soft, a.text)}>{d.subject}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium dark:bg-slate-800">{d.kind}</span>
                  <span className="truncate">{d.lessonTitle}</span>
                  <span className="page-link ml-auto">tr. {d.page}</span>
                </div>
                <p className="mt-1.5 font-semibold text-slate-900 dark:text-white">{d.title}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {sn.pre}
                  {sn.hit && <mark className="rounded bg-amber-200 px-0.5 text-slate-900 dark:bg-amber-400/40 dark:text-white">{sn.hit}</mark>}
                  {sn.post}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
