import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { QuizQuestion } from "../schema/content";
import { shuffle } from "../data";
import { actions, type QuizRecord } from "../store";
import { CodeBlock } from "./CodeBlock";
import { Markdown } from "./Markdown";
import { Button, Card, cls, isTyping, Kbd, LevelBadge, lessonPageTo, PageLinks, ProgressBar, SourceBadge } from "./ui";

export interface QItem {
  subject: string;
  lesson: string;
  lessonTitle: string;
  q: QuizQuestion;
  /** order[i] = chỉ số đáp án gốc được hiển thị ở vị trí i */
  order: number[];
}

export function makeItems(
  list: { subject: string; lesson: string; lessonTitle: string; q: QuizQuestion }[],
  shuffleOptions = true,
): QItem[] {
  return list.map((x) => ({ ...x, order: shuffleOptions ? shuffle([0, 1, 2, 3]) : [0, 1, 2, 3] }));
}

const LETTERS = ["A", "B", "C", "D"];

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * Chạy một lượt làm bài trắc nghiệm.
 *  - practice: chọn đáp án là hiện đúng/sai + giải thích ngay;
 *  - exam: làm tự do, có đồng hồ đếm ngược, chấm khi nộp hoặc hết giờ.
 */
export function QuizRunner({
  items,
  mode,
  durationSec,
  record,
  onRestart,
  onRetryWrong,
}: {
  items: QItem[];
  mode: "practice" | "exam";
  durationSec?: number;
  record: Omit<QuizRecord, "at" | "score" | "total" | "seconds">;
  onRestart: () => void;
  onRetryWrong?: (items: QItem[]) => void;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => items.map(() => null));
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState<{ seconds: number } | null>(null);
  const startedAt = useRef(Date.now());
  const [now, setNow] = useState(Date.now());

  const isCorrect = useCallback((i: number, a = answers[i]) => a != null && items[i].order[a] === items[i].q.answer, [answers, items]);
  const answered = answers.filter((a) => a != null).length;

  const finish = useCallback(() => {
    if (done) return;
    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    const score = items.filter((_, i) => isCorrect(i)).length;
    actions.markAnswers(
      items
        .map((it, i) => ({ subject: it.subject, lesson: it.lesson, qid: it.q.id, correct: isCorrect(i), answered: answers[i] != null }))
        .filter((r) => mode === "exam" || r.answered),
    );
    actions.recordQuiz({ ...record, at: Date.now(), score, total: items.length, seconds });
    setDone({ seconds });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [done, items, isCorrect, answers, mode, record]);

  // đồng hồ thi thử
  const remaining = durationSec ? Math.max(0, durationSec - (now - startedAt.current) / 1000) : null;
  useEffect(() => {
    if (!durationSec || done) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [durationSec, done]);
  useEffect(() => {
    if (remaining !== null && remaining <= 0 && !done) finish();
  }, [remaining, done, finish]);

  const choose = useCallback(
    (opt: number) => {
      if (done) return;
      if (mode === "practice" && answers[idx] != null) return;
      setAnswers((a) => a.map((x, i) => (i === idx ? opt : x)));
    },
    [done, mode, answers, idx],
  );

  const next = useCallback(() => setIdx((i) => Math.min(items.length - 1, i + 1)), [items.length]);
  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    if (done) return;
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (["1", "2", "3", "4"].includes(e.key)) choose(Number(e.key) - 1);
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Enter" && mode === "practice" && answers[idx] != null) {
        if (idx < items.length - 1) next();
        else if (answered === items.length) finish();
      } else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, choose, next, prev, mode, answers, idx, items.length, answered, finish]);

  const wrongItems = useMemo(() => (done ? items.filter((_, i) => !isCorrect(i)) : []), [done, items, isCorrect]);

  if (done) {
    const score = items.length - wrongItems.length;
    const pct = items.length ? score / items.length : 0;
    return (
      <div className="space-y-6">
        <Card className="text-center">
          <p className="text-sm font-medium text-slate-500">Kết quả</p>
          <p className="mt-1 text-5xl font-bold text-slate-900 dark:text-white">
            {score}
            <span className="text-2xl text-slate-400">/{items.length}</span>
          </p>
          <p className={cls("mt-1 text-lg font-semibold", pct >= 0.8 ? "text-emerald-600" : pct >= 0.5 ? "text-amber-600" : "text-rose-600")}>
            {Math.round(pct * 100)}% · {fmtTime(done.seconds)}
          </p>
          <ProgressBar value={pct} className="mx-auto mt-4 max-w-sm" />
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {wrongItems.length > 0 && onRetryWrong && (
              <Button variant="primary" onClick={() => onRetryWrong(makeItems(wrongItems))}>
                Làm lại {wrongItems.length} câu sai
              </Button>
            )}
            <Button onClick={onRestart}>Làm bài mới</Button>
            <Link to="/review" className="inline-flex items-center rounded-lg px-3.5 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10">
              Danh sách câu sai →
            </Link>
          </div>
        </Card>
        <div className="space-y-4">
          {items.map((it, i) => (
            <QuestionView key={i} item={it} index={i} total={items.length} chosen={answers[i]} reveal />
          ))}
        </div>
      </div>
    );
  }

  const item = items[idx];
  const reveal = mode === "practice" && answers[idx] != null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_16rem]">
      <div className="min-w-0 space-y-4">
        <QuestionView item={item} index={idx} total={items.length} chosen={answers[idx]} reveal={reveal} onChoose={choose} />
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={prev} disabled={idx === 0}>
            ← Câu trước
          </Button>
          {idx < items.length - 1 ? (
            <Button variant={reveal ? "primary" : "secondary"} onClick={next}>
              Câu sau →
            </Button>
          ) : (
            mode === "practice" && (
              <Button variant="primary" onClick={finish} disabled={answered < items.length}>
                Xem kết quả
              </Button>
            )
          )}
          <span className="ml-auto hidden text-xs text-slate-500 sm:inline">
            <Kbd>1</Kbd>–<Kbd>4</Kbd> chọn · <Kbd>←</Kbd> <Kbd>→</Kbd> chuyển câu{mode === "practice" && <> · <Kbd>Enter</Kbd> tiếp</>}
          </span>
        </div>
      </div>
      <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
        <Card className="p-4">
          {remaining !== null && (
            <div className={cls("mb-3 text-center font-mono text-3xl font-bold", remaining < 60 ? "text-rose-600" : "text-slate-800 dark:text-slate-100")}>
              {fmtTime(remaining)}
            </div>
          )}
          <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
            Đã làm {answered}/{items.length}
          </p>
          <ProgressBar value={answered / items.length} />
          <div className="mt-3 grid grid-cols-8 gap-1 lg:grid-cols-6">
            {items.map((_, i) => {
              const a = answers[i];
              const state = a == null ? "todo" : mode === "practice" ? (isCorrect(i) ? "ok" : "bad") : "done";
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  className={cls(
                    "aspect-square rounded-md text-xs font-semibold",
                    i === idx && "ring-2 ring-indigo-500",
                    state === "todo" && "bg-slate-100 text-slate-500 dark:bg-slate-800",
                    state === "done" && "bg-indigo-500 text-white",
                    state === "ok" && "bg-emerald-500 text-white",
                    state === "bad" && "bg-rose-500 text-white",
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          {mode === "exam" && (
            <Button
              variant="primary"
              className="mt-4 w-full"
              onClick={() => {
                if (answered < items.length && !window.confirm(`Còn ${items.length - answered} câu chưa làm. Nộp bài?`)) return;
                finish();
              }}
            >
              Nộp bài
            </Button>
          )}
          {mode === "practice" && answered > 0 && answered < items.length && (
            <button type="button" onClick={finish} className="mt-3 w-full text-center text-xs text-slate-500 hover:underline">
              Kết thúc sớm
            </button>
          )}
        </Card>
      </aside>
    </div>
  );
}

export function QuestionView({
  item,
  index,
  total,
  chosen,
  reveal,
  onChoose,
}: {
  item: QItem;
  index: number;
  total: number;
  chosen: number | null;
  reveal: boolean;
  onChoose?: (i: number) => void;
}) {
  const { q } = item;
  const correctPos = item.order.indexOf(q.answer);
  const pageTo = lessonPageTo(item.subject, item.lesson);
  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Câu {index + 1}/{total}
        </span>
        <LevelBadge level={q.level} />
        <SourceBadge source={q.source} />
        <Link to={`/l/${item.subject}/${item.lesson}`} className="truncate hover:underline">
          {item.lessonTitle}
        </Link>
        {reveal && chosen == null && <span className="font-semibold text-amber-600">chưa trả lời</span>}
      </div>
      <Markdown text={q.question} className="text-[15px] font-medium text-slate-900 dark:text-slate-100" />
      {q.code && <CodeBlock code={q.code.code} language={q.code.language} className="mt-3" />}
      <div className="mt-4 grid gap-2">
        {item.order.map((orig, pos) => {
          const isChosen = chosen === pos;
          const isRight = pos === correctPos;
          return (
            <button
              key={pos}
              type="button"
              disabled={!onChoose || (reveal && !!onChoose)}
              onClick={() => onChoose?.(pos)}
              className={cls(
                "flex items-start gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-default",
                !reveal && isChosen && "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10",
                !reveal && !isChosen && "border-slate-200 hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60",
                reveal && isRight && "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
                reveal && isChosen && !isRight && "border-rose-500 bg-rose-50 dark:bg-rose-500/10",
                reveal && !isChosen && !isRight && "border-slate-200 opacity-70 dark:border-slate-800",
              )}
            >
              <span
                className={cls(
                  "grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs font-bold",
                  reveal && isRight
                    ? "bg-emerald-500 text-white"
                    : reveal && isChosen
                      ? "bg-rose-500 text-white"
                      : isChosen
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                )}
              >
                {LETTERS[pos]}
              </span>
              <Markdown inline text={q.options[orig]} className="min-w-0 flex-1 leading-6" />
            </button>
          );
        })}
      </div>
      {reveal && (
        <div
          className={cls(
            "mt-4 rounded-xl p-3 text-sm",
            chosen === correctPos ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-rose-50 dark:bg-rose-500/10",
          )}
        >
          <p className={cls("font-semibold", chosen === correctPos ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300")}>
            {chosen === correctPos ? "Chính xác!" : `Đáp án đúng: ${LETTERS[correctPos]}`}
          </p>
          <Markdown inline text={q.explanation} pageTo={pageTo} className="mt-1" />
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            Xem slide: <PageLinks pages={q.pages} to={pageTo} />
          </div>
        </div>
      )}
    </Card>
  );
}
