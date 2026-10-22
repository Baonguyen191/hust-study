import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getLessonMeta, lessonKey, loadLesson, pdfUrl, slideImageUrl, useAsync } from "../data";
import { actions, getState, useProgress } from "../store";
import { CodeBlock } from "../components/CodeBlock";
import { Markdown } from "../components/Markdown";
import { PdfViewer } from "../components/PdfViewer";
import { Button, Card, cls, ErrorBox, isTyping, Kbd, LinkButton, Loading, PageLinks, SourceBadge } from "../components/ui";

const SECTIONS = [
  { id: "tom-tat", label: "Tóm tắt" },
  { id: "khai-niem", label: "Khái niệm" },
  { id: "code", label: "Code" },
  { id: "hinh", label: "Hình" },
  { id: "tu-luan", label: "Tự luận" },
  { id: "ghi-chu", label: "Ghi chú" },
];

export default function LessonPage() {
  const { subject = "", lesson = "" } = useParams();
  const meta = getLessonMeta(subject, lesson);
  const [params, setParams] = useSearchParams();
  const st = useProgress();
  const { data, error, loading } = useAsync(() => loadLesson(subject, lesson), [subject, lesson]);
  const [tab, setTab] = useState<"content" | "pdf">("content");

  const start = meta?.lesson.pageStart ?? 1;
  const end = meta?.lesson.pageEnd ?? start;
  const pRaw = Number(params.get("p"));
  const page = Number.isInteger(pRaw) && pRaw >= start && pRaw <= end ? pRaw : start;

  const setPage = useCallback(
    (p: number, showPdf = true) => {
      setParams(
        (prev) => {
          const n = new URLSearchParams(prev);
          n.set("p", String(Math.max(start, Math.min(end, p))));
          return n;
        },
        { replace: true },
      );
      if (showPdf) setTab("pdf");
    },
    [setParams, start, end],
  );

  // mở trang bài với ?p=N (từ quiz/tìm kiếm) thì hiện luôn tab slide trên mobile
  const initialP = useRef(params.has("p"));
  useEffect(() => {
    if (initialP.current) setTab("pdf");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "ArrowRight") setPage(page + 1, false);
      else if (e.key === "ArrowLeft") setPage(page - 1, false);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page, setPage]);

  if (!meta) return <p className="py-16 text-center">Không tìm thấy bài học.</p>;
  const key = lessonKey(subject, lesson);
  const learned = !!st.learned[key];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start gap-3">
        <div className="w-full min-w-0 sm:w-auto sm:flex-1">
          <Link to={`/s/${subject}`} className="text-sm text-slate-500 hover:underline">
            ← {meta.subject.name}
          </Link>
          <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">{meta.lesson.title}</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Slide tr. {start}–{end} · <Kbd>←</Kbd> <Kbd>→</Kbd> lật trang slide
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={learned ? "success" : "secondary"} onClick={() => actions.setLearned(key, !learned)}>
            {learned ? "✓ Đã học" : "Đánh dấu đã học"}
          </Button>
          <LinkButton to={`/flashcards?mode=lesson&s=${subject}&l=${lesson}`}>Flashcard ({meta.lesson.counts?.flashcards ?? 0})</LinkButton>
          <LinkButton to={`/quiz?s=${subject}&l=${lesson}`} variant="primary">
            Quiz ({meta.lesson.counts?.quiz ?? 0})
          </LinkButton>
        </div>
      </div>

      <div className="sticky top-[6.5rem] z-20 mb-4 grid grid-cols-2 rounded-xl bg-slate-200/80 p-1 backdrop-blur lg:hidden dark:bg-slate-800/80">
        {(["content", "pdf"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cls(
              "rounded-lg py-1.5 text-sm font-semibold",
              tab === t ? "bg-white text-slate-900 shadow dark:bg-slate-950 dark:text-white" : "text-slate-600 dark:text-slate-400",
            )}
          >
            {t === "content" ? "Nội dung" : `Slide · tr. ${page}`}
          </button>
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:gap-6">
        <div className={cls("min-w-0 space-y-6", tab !== "content" && "hidden lg:block")}>
          {loading && <Loading />}
          {error && <ErrorBox>Không tải được nội dung: {error.message}</ErrorBox>}
          {data && (
            <>
              <nav className="flex flex-wrap gap-1.5">
                {SECTIONS.map((s) => {
                  const n =
                    s.id === "khai-niem"
                      ? data.keyConcepts.length
                      : s.id === "code"
                        ? data.codeExamples.length
                        : s.id === "hinh"
                          ? data.figures.length
                          : s.id === "tu-luan"
                            ? data.examQuestions.length
                            : null;
                  if (n === 0) return null;
                  return (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:bg-slate-800"
                    >
                      {s.label}
                      {n !== null && <span className="ml-1 text-slate-400">{n}</span>}
                    </a>
                  );
                })}
              </nav>

              <Section id="tom-tat" title="Tóm tắt">
                <Card>
                  <Markdown text={data.summary} onPage={setPage} />
                </Card>
              </Section>

              <Section id="khai-niem" title="Khái niệm chính">
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.keyConcepts.map((c, i) => (
                    <Card key={i} className="flex flex-col gap-2 p-4">
                      <div className="flex items-start gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{c.term}</h3>
                        <SourceBadge source={c.source} />
                      </div>
                      <Markdown inline text={c.definition} className="text-sm text-slate-600 dark:text-slate-300" />
                      <PageLinks pages={c.pages} onPage={setPage} className="mt-auto" />
                    </Card>
                  ))}
                </div>
              </Section>

              {data.codeExamples.length > 0 && (
                <Section id="code" title="Ví dụ code">
                  <div className="space-y-5">
                    {data.codeExamples.map((c, i) => (
                      <Card key={i} className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{c.title}</h3>
                          <SourceBadge source={c.source} />
                          <PageLinks pages={c.pages} onPage={setPage} className="ml-auto" />
                        </div>
                        <Markdown text={c.explanation} onPage={setPage} className="text-sm" />
                        <CodeBlock code={c.code} language={c.language} parts={c.parts} />
                      </Card>
                    ))}
                  </div>
                </Section>
              )}

              {data.figures.length > 0 && (
                <Section id="hinh" title="Hình minh hoạ">
                  <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                    {data.figures.map((f) => (
                      <button
                        key={f.page}
                        type="button"
                        onClick={() => setPage(f.page)}
                        className="group overflow-hidden rounded-xl border border-slate-200 bg-white text-left hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-900"
                      >
                        <img
                          src={slideImageUrl(subject, lesson, f.page)}
                          alt={f.caption}
                          loading="lazy"
                          className="aspect-[4/3] w-full bg-slate-100 object-contain dark:bg-slate-800"
                        />
                        <span className="block p-2 text-xs">
                          <span className="page-link mr-1">tr. {f.page}</span>
                          {f.caption}
                        </span>
                      </button>
                    ))}
                  </div>
                </Section>
              )}

              <Section id="tu-luan" title="Câu hỏi tự luận">
                <div className="space-y-3">
                  {data.examQuestions.map((q, i) => (
                    <Card key={q.id} className="p-4">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{i + 1}.</span>
                        <Markdown text={q.question} onPage={setPage} className="flex-1 font-medium" />
                        <SourceBadge source={q.source} />
                      </div>
                      <details className="mt-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/50">
                        <summary className="cursor-pointer font-medium text-slate-600 dark:text-slate-300">Gợi ý trả lời</summary>
                        <Markdown text={q.hints} onPage={setPage} className="mt-2" />
                      </details>
                    </Card>
                  ))}
                </div>
              </Section>

              <Section id="ghi-chu" title="Ghi chú của tôi">
                <Notes noteKey={key} />
              </Section>
            </>
          )}
        </div>

        <div className={cls(tab !== "pdf" && "hidden lg:block")}>
          <div className="lg:sticky lg:top-[4.5rem]">
            <PdfViewer
              url={pdfUrl(meta.lesson)}
              page={page}
              onPageChange={(p) => setPage(p, false)}
              minPage={start}
              maxPage={end}
              className="h-[78vh] lg:h-[calc(100vh-5.5rem)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 lg:scroll-mt-20">
      <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
      {children}
    </section>
  );
}

/** Ô ghi chú tự lưu (debounce 500ms, lưu nốt khi rời trang). */
function Notes({ noteKey }: { noteKey: string }) {
  const [text, setText] = useState(() => getState().notes[noteKey] ?? "");
  const [saved, setSaved] = useState(true);
  const latest = useRef({ text, noteKey, dirty: false });

  useEffect(() => {
    const t = getState().notes[noteKey] ?? "";
    setText(t);
    latest.current = { text: t, noteKey, dirty: false };
  }, [noteKey]);

  useEffect(() => {
    if (!latest.current.dirty) return;
    setSaved(false);
    const t = setTimeout(() => {
      actions.setNote(noteKey, text);
      latest.current.dirty = false;
      setSaved(true);
    }, 500);
    return () => clearTimeout(t);
  }, [text, noteKey]);

  useEffect(
    () => () => {
      if (latest.current.dirty) actions.setNote(latest.current.noteKey, latest.current.text);
    },
    [],
  );

  return (
    <Card className="p-3">
      <textarea
        value={text}
        onChange={(e) => {
          latest.current = { text: e.target.value, noteKey, dirty: true };
          setText(e.target.value);
        }}
        rows={6}
        placeholder="Ghi chú riêng cho bài này (tự động lưu trong trình duyệt)…"
        className="w-full resize-y rounded-lg border-0 bg-transparent p-2 text-sm leading-6 focus:ring-0 focus:outline-none"
      />
      <p className="px-2 text-right text-xs text-slate-400">{saved ? "Đã lưu" : "Đang lưu…"}</p>
    </Card>
  );
}
