import { Link, useParams } from "react-router-dom";
import { cardStatsFor, getSubject, lessonKey } from "../data";
import { actions, useProgress } from "../store";
import { accent, Card, cls, LinkButton, ProgressBar } from "../components/ui";

export default function SubjectPage() {
  const { subject } = useParams();
  const s = getSubject(subject);
  const st = useProgress();
  if (!s) return <p className="py-16 text-center">Không có môn “{subject}”.</p>;

  const statsOf = cardStatsFor(st);
  const lessons = s.lessons.filter((l) => l.hasContent);
  const learned = lessons.filter((l) => st.learned[lessonKey(s.id, l.id)]).length;
  const a = accent(s.id);
  const best = new Map<string, number>();
  for (const r of st.history) {
    if (r.subject !== s.id || !r.lesson || r.mode !== "quiz") continue;
    best.set(r.lesson, Math.max(best.get(r.lesson) ?? 0, r.score / r.total));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-0">
          <Link to="/" className="text-sm text-slate-500 hover:underline">
            ← Trang chủ
          </Link>
          <h1 className="mt-1 flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
            <span className={cls("h-3 w-3 rounded-full", a.dot)} />
            {s.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {learned}/{lessons.length} bài đã học
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <LinkButton to={`/flashcards?mode=subject&s=${s.id}`}>Flashcard cả môn</LinkButton>
          <LinkButton to={`/quiz?s=${s.id}`}>Quiz cả môn</LinkButton>
          <LinkButton to={`/exam?s=${s.id}`} variant="primary">
            Thi thử
          </LinkButton>
        </div>
      </div>
      <ProgressBar value={lessons.length ? learned / lessons.length : 0} />

      <div className="grid gap-3">
        {lessons.map((l, i) => {
          const key = lessonKey(s.id, l.id);
          const c = statsOf(s.id, l);
          const b = best.get(l.id);
          return (
            <Card key={l.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <label className="flex shrink-0 items-center gap-3" title="Đánh dấu đã học">
                <input
                  type="checkbox"
                  checked={!!st.learned[key]}
                  onChange={(e) => actions.setLearned(key, e.target.checked)}
                  className="h-5 w-5 rounded accent-indigo-600"
                />
                <span className={cls("grid h-9 w-9 place-items-center rounded-lg text-sm font-bold", a.soft, a.text)}>{i + 1}</span>
              </label>
              <Link to={`/l/${s.id}/${l.id}`} className="min-w-0 flex-1">
                <span className="block font-semibold text-slate-900 hover:underline dark:text-white">{l.title}</span>
                <span className="text-xs text-slate-500">
                  tr. {l.pageStart}–{l.pageEnd} · {l.counts?.keyConcepts ?? 0} khái niệm · {c.total} thẻ · {l.counts?.quiz ?? 0} câu quiz
                  {b !== undefined && <> · quiz tốt nhất {Math.round(b * 100)}%</>}
                </span>
              </Link>
              <div className="flex flex-wrap gap-2">
                <LinkButton to={`/l/${s.id}/${l.id}`} size="sm" variant="primary">
                  Học
                </LinkButton>
                <LinkButton to={`/flashcards?mode=lesson&s=${s.id}&l=${l.id}`} size="sm">
                  Thẻ
                  {c.dueToday > 0 && <span className="rounded-full bg-indigo-600 px-1.5 text-[11px] text-white">{c.dueToday}</span>}
                </LinkButton>
                <LinkButton to={`/quiz?s=${s.id}&l=${l.id}`} size="sm">
                  Quiz
                </LinkButton>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
