import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getLessonMeta, getSubject, loadLesson, loadLessons, manifest, shuffle, type LoadedLesson } from "../data";
import { useProgress } from "../store";
import { makeItems, QuizRunner, type QItem } from "../components/QuizRunner";
import { Button, Card, cls, ErrorBox, formatDate, Select } from "../components/ui";

export default function QuizPage() {
  const [params] = useSearchParams();
  const initialSubject = getSubject(params.get("s") ?? "")?.id ?? manifest.subjects[0].id;
  const [subject, setSubject] = useState(initialSubject);
  const [lesson, setLesson] = useState(getLessonMeta(initialSubject, params.get("l") ?? "") ? params.get("l")! : "");
  const [count, setCount] = useState("10");
  const [level, setLevel] = useState("all");
  const [run, setRun] = useState<{ items: QItem[]; key: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const st = useProgress();

  const sub = getSubject(subject)!;
  const lessons = sub.lessons.filter((l) => l.hasContent);
  const available = lesson
    ? (lessons.find((l) => l.id === lesson)?.counts?.quiz ?? 0)
    : lessons.reduce((a, l) => a + (l.counts?.quiz ?? 0), 0);

  const start = async () => {
    setBusy(true);
    setErr(null);
    try {
      let loaded: LoadedLesson[];
      if (lesson) {
        const m = getLessonMeta(subject, lesson)!;
        loaded = [{ subject: m.subject, meta: m.lesson, content: await loadLesson(subject, lesson) }];
      } else loaded = await loadLessons(subject);
      let qs = loaded.flatMap((x) => x.content.quiz.map((q) => ({ subject: x.subject.id, lesson: x.meta.id, lessonTitle: x.meta.title, q })));
      if (level !== "all") qs = qs.filter((x) => x.q.level === level);
      if (qs.length === 0) throw new Error("Không có câu hỏi phù hợp bộ lọc.");
      const n = count === "all" ? qs.length : Number(count);
      setRun({ items: makeItems(shuffle(qs).slice(0, n)), key: Date.now() });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (run) {
    const title = lesson ? getLessonMeta(subject, lesson)?.lesson.title : `Cả môn ${sub.name}`;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="min-w-0 flex-1 truncate text-lg font-bold text-slate-900 dark:text-white">Quiz · {title}</h1>
          <Button variant="ghost" onClick={() => setRun(null)}>
            Thoát
          </Button>
        </div>
        <QuizRunner
          key={run.key}
          items={run.items}
          mode="practice"
          record={{ mode: "quiz", subject, lesson: lesson || undefined }}
          onRestart={() => setRun(null)}
          onRetryWrong={(items) => setRun({ items, key: Date.now() })}
        />
      </div>
    );
  }

  const history = st.history.filter((r) => r.subject === subject && r.mode === "quiz").slice(-10).reverse();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quiz trắc nghiệm</h1>
      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Môn"
            value={subject}
            onChange={(v) => {
              setSubject(v);
              setLesson("");
            }}
            options={manifest.subjects.map((s) => ({ value: s.id, label: s.name }))}
          />
          <Select
            label="Phạm vi"
            value={lesson}
            onChange={setLesson}
            options={[{ value: "", label: "Cả môn (trộn các bài)" }, ...lessons.map((l) => ({ value: l.id, label: l.title }))]}
          />
          <Select
            label="Số câu"
            value={count}
            onChange={setCount}
            options={[
              ...[5, 10, 15, 20, 30].filter((n) => n < available).map((n) => ({ value: String(n), label: `${n} câu` })),
              { value: "all", label: `Tất cả (${available})` },
            ]}
          />
          <Select
            label="Mức độ"
            value={level}
            onChange={setLevel}
            options={[
              { value: "all", label: "Mọi mức" },
              { value: "nhớ", label: "Nhớ" },
              { value: "hiểu", label: "Hiểu" },
              { value: "vận dụng", label: "Vận dụng" },
            ]}
          />
        </div>
        <p className="text-sm text-slate-500">Câu hỏi và thứ tự đáp án được trộn ngẫu nhiên mỗi lượt. Chọn đáp án sẽ hiện giải thích kèm trang slide.</p>
        {err && <ErrorBox>{err}</ErrorBox>}
        <Button variant="primary" size="lg" onClick={start} disabled={busy}>
          {busy ? "Đang tải…" : "Bắt đầu"}
        </Button>
      </Card>

      {history.length > 0 && (
        <Card className="p-0">
          <p className="border-b border-slate-100 px-5 py-3 font-semibold dark:border-slate-800">Lịch sử điểm · {sub.name}</p>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.map((r, i) => {
              const pct = r.score / r.total;
              return (
                <div key={i} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                  <span className="min-w-0 flex-1 truncate">{r.lesson ? (getLessonMeta(r.subject, r.lesson)?.lesson.title ?? r.lesson) : "Cả môn"}</span>
                  <span className="text-xs text-slate-500">{formatDate(r.at)}</span>
                  <span className={cls("w-14 text-right font-semibold", pct >= 0.8 ? "text-emerald-600" : pct >= 0.5 ? "text-amber-600" : "text-rose-600")}>
                    {r.score}/{r.total}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
