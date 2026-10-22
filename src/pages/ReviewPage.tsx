import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getLessonMeta, getSubject, lessonKey, loadLesson, manifest, useAsync } from "../data";
import type { LessonContent } from "../schema/content";
import { actions, useProgress } from "../store";
import { makeItems, QuizRunner, type QItem } from "../components/QuizRunner";
import { Markdown } from "../components/Markdown";
import { accent, Button, Card, cls, ErrorBox, formatDate, Loading, Select } from "../components/ui";

export default function ReviewPage() {
  const st = useProgress();
  const [filter, setFilter] = useState("all");
  const [run, setRun] = useState<{ items: QItem[]; key: number } | null>(null);

  const entries = useMemo(() => Object.entries(st.wrong).sort((a, b) => b[1].at - a[1].at), [st.wrong]);
  const lessonKeys = [...new Set(entries.map(([, w]) => lessonKey(w.subject, w.lesson)))].sort();
  const { data, error, loading } = useAsync(
    async () =>
      new Map<string, LessonContent>(
        await Promise.all(
          lessonKeys.map(async (k) => {
            const [s, l] = k.split("/");
            return [k, await loadLesson(s, l)] as const;
          }),
        ),
      ),
    [lessonKeys.join("|")],
  );

  const rows = useMemo(
    () =>
      entries
        .filter(([, w]) => filter === "all" || w.subject === filter)
        .map(([k, w]) => ({
          k,
          w,
          q: data?.get(lessonKey(w.subject, w.lesson))?.quiz.find((q) => q.id === w.qid),
          lessonTitle: getLessonMeta(w.subject, w.lesson)?.lesson.title ?? w.lesson,
        })),
    [entries, filter, data],
  );

  if (run) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="flex-1 text-lg font-bold text-slate-900 dark:text-white">Làm lại câu sai</h1>
          <Button variant="ghost" onClick={() => setRun(null)}>
            Thoát
          </Button>
        </div>
        <QuizRunner
          key={run.key}
          items={run.items}
          mode="practice"
          record={{ mode: "review", subject: filter }}
          onRestart={() => setRun(null)}
          onRetryWrong={(items) => setRun({ items, key: Date.now() })}
        />
      </div>
    );
  }

  const usable = rows.filter((r) => r.q);
  const subjectsWithWrong = manifest.subjects.filter((s) => entries.some(([, w]) => w.subject === s.id));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Câu đã làm sai</h1>
          <p className="text-sm text-slate-500">Làm đúng ở lần sau thì câu tự động rời khỏi danh sách.</p>
        </div>
        {subjectsWithWrong.length > 1 && (
          <Select
            label="Môn"
            value={filter}
            onChange={setFilter}
            options={[{ value: "all", label: "Tất cả môn" }, ...subjectsWithWrong.map((s) => ({ value: s.id, label: s.name }))]}
          />
        )}
        <Button
          variant="primary"
          disabled={usable.length === 0}
          onClick={() =>
            setRun({
              items: makeItems(usable.map((r) => ({ subject: r.w.subject, lesson: r.w.lesson, lessonTitle: r.lessonTitle, q: r.q! }))),
              key: Date.now(),
            })
          }
        >
          Làm lại {usable.length} câu
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card className="text-center">
          <p className="font-semibold">Chưa có câu sai nào.</p>
          <p className="mt-1 text-sm text-slate-500">
            Làm{" "}
            <Link to="/quiz" className="text-indigo-600 hover:underline dark:text-indigo-400">
              quiz
            </Link>{" "}
            hoặc{" "}
            <Link to="/exam" className="text-indigo-600 hover:underline dark:text-indigo-400">
              thi thử
            </Link>{" "}
            để bắt đầu.
          </p>
        </Card>
      ) : loading && !data ? (
        <Loading />
      ) : error ? (
        <ErrorBox>{error.message}</ErrorBox>
      ) : (
        <div className="space-y-2">
          {rows.map(({ k, w, q, lessonTitle }) => (
            <Card key={k} className="flex items-start gap-3 p-4">
              <span className={cls("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", accent(w.subject).dot)} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500">
                  {getSubject(w.subject)?.short} ·{" "}
                  <Link to={`/l/${w.subject}/${w.lesson}`} className="hover:underline">
                    {lessonTitle}
                  </Link>{" "}
                  · sai {w.times} lần · {formatDate(w.at)}
                </p>
                {q ? (
                  <Markdown inline text={q.question} className="mt-1 text-sm font-medium" />
                ) : (
                  <p className="mt-1 text-sm text-slate-500">Câu {w.qid} không còn trong nội dung bài.</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => actions.removeWrong(k)}
                className="shrink-0 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Bỏ
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
