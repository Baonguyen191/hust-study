import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getSubject, loadLessons, manifest, shuffle } from "../data";
import type { ExamQuestion, QuizQuestion } from "../schema/content";
import { useProgress } from "../store";
import { makeItems, QuizRunner, type QItem } from "../components/QuizRunner";
import { Markdown } from "../components/Markdown";
import { Button, Card, cls, ErrorBox, formatDate, lessonPageTo, Select } from "../components/ui";

type Pool = { subject: string; lesson: string; lessonTitle: string; q: QuizQuestion }[];

/** Lấy lần lượt từ từng bài (đã trộn) để đề phủ đều các bài. */
function roundRobin(groups: Pool[], n: number): Pool {
  const gs = shuffle(groups.map((g) => shuffle(g)));
  const out: Pool = [];
  while (out.length < n && gs.some((g) => g.length)) {
    for (const g of gs) {
      const x = g.shift();
      if (x) out.push(x);
      if (out.length >= n) break;
    }
  }
  return shuffle(out);
}

interface Essay {
  subject: string;
  lesson: string;
  lessonTitle: string;
  q: ExamQuestion;
}

export default function ExamPage() {
  const [params] = useSearchParams();
  const [subject, setSubject] = useState(getSubject(params.get("s") ?? "")?.id ?? manifest.subjects[0].id);
  const [count, setCount] = useState(20);
  const [minutes, setMinutes] = useState(30);
  const [withEssay, setWithEssay] = useState(true);
  const [run, setRun] = useState<{ items: QItem[]; essays: Essay[]; key: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const st = useProgress();

  const sub = getSubject(subject)!;
  const available = sub.lessons.reduce((a, l) => a + (l.counts?.quiz ?? 0), 0);
  const countOptions = [10, 20, 30, 40, 50].filter((n) => n <= available);
  const n = Math.min(count, available);

  const start = async () => {
    setBusy(true);
    setErr(null);
    try {
      const loaded = await loadLessons(subject);
      const groups = loaded.map((x) => x.content.quiz.map((q) => ({ subject, lesson: x.meta.id, lessonTitle: x.meta.title, q })));
      const essays = withEssay
        ? shuffle(loaded.flatMap((x) => x.content.examQuestions.map((q) => ({ subject, lesson: x.meta.id, lessonTitle: x.meta.title, q })))).slice(0, 2)
        : [];
      setRun({ items: makeItems(roundRobin(groups, n)), essays, key: Date.now() });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (run) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="flex-1 text-lg font-bold text-slate-900 dark:text-white">
            Thi thử · {sub.name} · {run.items.length} câu / {minutes} phút
          </h1>
          <Button variant="ghost" onClick={() => window.confirm("Thoát bài thi? Bài làm dở sẽ không được chấm.") && setRun(null)}>
            Thoát
          </Button>
        </div>
        <QuizRunner
          key={run.key}
          items={run.items}
          mode="exam"
          durationSec={minutes * 60}
          record={{ mode: "exam", subject }}
          onRestart={() => setRun(null)}
          onRetryWrong={(items) => setRun({ items, essays: [], key: Date.now() })}
        />
        {run.essays.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Phần tự luận (tự làm ra giấy)</h2>
            {run.essays.map((e, i) => (
              <Card key={i}>
                <p className="mb-1 text-xs text-slate-500">{e.lessonTitle}</p>
                <Markdown text={`**Câu ${i + 1}.** ${e.q.question}`} pageTo={lessonPageTo(e.subject, e.lesson)} />
                <details className="mt-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/50">
                  <summary className="cursor-pointer font-medium text-slate-600 dark:text-slate-300">Gợi ý (mở sau khi làm xong)</summary>
                  <Markdown text={e.q.hints} pageTo={lessonPageTo(e.subject, e.lesson)} className="mt-2" />
                </details>
              </Card>
            ))}
          </section>
        )}
      </div>
    );
  }

  const history = st.history.filter((r) => r.mode === "exam" && r.subject === subject).slice(-10).reverse();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thi thử</h1>
      <Card className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Select label="Môn" value={subject} onChange={setSubject} options={manifest.subjects.map((s) => ({ value: s.id, label: s.name }))} />
          <Select
            label="Số câu"
            value={String(n)}
            onChange={(v) => {
              setCount(Number(v));
              setMinutes(Math.round(Number(v) * 1.5));
            }}
            options={[...new Set([...countOptions, n])].sort((a, b) => a - b).map((x) => ({ value: String(x), label: `${x} câu` }))}
          />
          <Select
            label="Thời gian"
            value={String(minutes)}
            onChange={(v) => setMinutes(Number(v))}
            options={[...new Set([10, 15, 20, 30, 45, 60, 75, 90, minutes])].sort((a, b) => a - b).map((m) => ({ value: String(m), label: `${m} phút` }))}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={withEssay} onChange={(e) => setWithEssay(e.target.checked)} className="h-4 w-4 accent-indigo-600" />
          Kèm 2 câu tự luận ngẫu nhiên
        </label>
        <p className="text-sm text-slate-500">
          Đề trộn ngẫu nhiên từ mọi bài của môn, rải đều theo bài. Đáp án chỉ hiện khi nộp bài hoặc hết giờ.
        </p>
        {err && <ErrorBox>{err}</ErrorBox>}
        <Button variant="primary" size="lg" onClick={start} disabled={busy}>
          {busy ? "Đang tạo đề…" : "Bắt đầu thi"}
        </Button>
      </Card>

      {history.length > 0 && (
        <Card className="p-0">
          <p className="border-b border-slate-100 px-5 py-3 font-semibold dark:border-slate-800">Các lần thi · {sub.name}</p>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.map((r, i) => {
              const pct = r.score / r.total;
              return (
                <div key={i} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                  <span className="flex-1 text-slate-500">{formatDate(r.at)}</span>
                  <span className="text-xs text-slate-500">{r.seconds ? `${Math.round(r.seconds / 60)} phút` : ""}</span>
                  <span className={cls("w-24 text-right font-semibold", pct >= 0.8 ? "text-emerald-600" : pct >= 0.5 ? "text-amber-600" : "text-rose-600")}>
                    {r.score}/{r.total} ({Math.round(pct * 100)}%)
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
