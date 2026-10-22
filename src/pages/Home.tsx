import { Link } from "react-router-dom";
import { cardStatsFor, getSubject, lessonKey, manifest } from "../data";
import { useProgress } from "../store";
import { accent, Card, cls, formatDate, LinkButton, ProgressBar } from "../components/ui";

export default function Home() {
  const st = useProgress();
  const statsOf = cardStatsFor(st);

  const subjects = manifest.subjects.map((s) => {
    const lessons = s.lessons.filter((l) => l.hasContent);
    const learned = lessons.filter((l) => st.learned[lessonKey(s.id, l.id)]).length;
    const cards = lessons.map((l) => statsOf(s.id, l));
    return {
      s,
      lessons,
      learned,
      dueToday: cards.reduce((a, c) => a + c.dueToday, 0),
      reviewed: cards.reduce((a, c) => a + c.reviewed, 0),
      totalCards: cards.reduce((a, c) => a + c.total, 0),
    };
  });

  const dueTotal = subjects.reduce((a, x) => a + x.dueToday, 0);
  const lessonTotal = subjects.reduce((a, x) => a + x.lessons.length, 0);
  const learnedTotal = subjects.reduce((a, x) => a + x.learned, 0);
  const wrongTotal = Object.keys(st.wrong).length;
  const recent = st.history.slice(-6).reverse();
  const lastTen = st.history.slice(-10);
  const avg = lastTen.length ? lastTen.reduce((a, r) => a + r.score / r.total, 0) / lastTen.length : null;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">Hôm nay học gì?</h1>
        <p className="mt-1 text-slate-500">
          {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="flex flex-col">
          <p className="text-sm font-medium text-slate-500">Flashcard cần ôn hôm nay</p>
          <p className="mt-1 text-4xl font-bold text-indigo-600 dark:text-indigo-400">{dueTotal}</p>
          <p className="mt-1 text-xs text-slate-500">thẻ đến hạn + thẻ mới của các bài đã đánh dấu “đã học”</p>
          <LinkButton to="/flashcards?mode=due" variant="primary" className="mt-4 self-start">
            Ôn ngay
          </LinkButton>
        </Card>
        <Card className="flex flex-col">
          <p className="text-sm font-medium text-slate-500">Bài đã học</p>
          <p className="mt-1 text-4xl font-bold text-slate-900 dark:text-white">
            {learnedTotal}
            <span className="text-xl text-slate-400">/{lessonTotal}</span>
          </p>
          <ProgressBar value={lessonTotal ? learnedTotal / lessonTotal : 0} className="mt-auto" />
        </Card>
        <Card className="flex flex-col">
          <p className="text-sm font-medium text-slate-500">Câu sai cần làm lại</p>
          <p className={cls("mt-1 text-4xl font-bold", wrongTotal ? "text-rose-600" : "text-slate-900 dark:text-white")}>{wrongTotal}</p>
          <LinkButton to="/review" className="mt-4 self-start" variant={wrongTotal ? "secondary" : "ghost"}>
            Xem danh sách
          </LinkButton>
        </Card>
        <Card className="flex flex-col">
          <p className="text-sm font-medium text-slate-500">Điểm TB 10 lượt gần nhất</p>
          <p className="mt-1 text-4xl font-bold text-slate-900 dark:text-white">{avg === null ? "–" : `${Math.round(avg * 100)}%`}</p>
          <p className="mt-1 text-xs text-slate-500">{st.history.length} lượt làm quiz/thi thử</p>
          <div className="mt-auto flex gap-2 pt-3">
            <LinkButton to="/quiz" size="sm">
              Quiz
            </LinkButton>
            <LinkButton to="/exam" size="sm">
              Thi thử
            </LinkButton>
          </div>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">Môn học</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {subjects.map(({ s, lessons, learned, dueToday, reviewed, totalCards }) => {
            const a = accent(s.id);
            return (
              <Card key={s.id} className="flex flex-col gap-4">
                <Link to={`/s/${s.id}`} className="group flex items-start gap-3">
                  <span className={cls("grid h-11 min-w-11 shrink-0 place-items-center rounded-xl px-2 text-xs font-bold", a.soft, a.text)}>{s.short}</span>
                  <span className="min-w-0">
                    <span className="block text-lg font-semibold text-slate-900 group-hover:underline dark:text-white">{s.name}</span>
                    <span className="text-sm text-slate-500">
                      {lessons.length} bài · {totalCards} flashcard · đã ôn {reviewed} thẻ
                    </span>
                  </span>
                  <span className="ml-auto text-right">
                    <span className="block text-2xl font-bold text-slate-900 dark:text-white">
                      {lessons.length ? Math.round((learned / lessons.length) * 100) : 0}%
                    </span>
                    <span className="text-xs text-slate-500">
                      {learned}/{lessons.length} bài
                    </span>
                  </span>
                </Link>
                <ProgressBar value={lessons.length ? learned / lessons.length : 0} />
                <div className="flex flex-wrap items-center gap-2">
                  <LinkButton to={`/s/${s.id}`} size="sm" variant="primary">
                    Vào môn
                  </LinkButton>
                  <LinkButton to={`/flashcards?mode=subject&s=${s.id}`} size="sm">
                    Flashcard{dueToday > 0 && <span className="rounded-full bg-indigo-600 px-1.5 text-[11px] text-white">{dueToday}</span>}
                  </LinkButton>
                  <LinkButton to={`/quiz?s=${s.id}`} size="sm">
                    Quiz
                  </LinkButton>
                  <LinkButton to={`/exam?s=${s.id}`} size="sm">
                    Thi thử
                  </LinkButton>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {recent.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">Làm bài gần đây</h2>
          <Card className="divide-y divide-slate-100 p-0 dark:divide-slate-800">
            {recent.map((r, i) => {
              const sub = getSubject(r.subject);
              const les = sub?.lessons.find((l) => l.id === r.lesson);
              const pct = r.total ? r.score / r.total : 0;
              return (
                <div key={i} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <span className="w-16 shrink-0 text-xs font-semibold text-slate-500 uppercase">
                    {r.mode === "exam" ? "Thi thử" : r.mode === "review" ? "Ôn sai" : "Quiz"}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {sub?.name ?? (r.subject === "all" ? "Tất cả môn" : r.subject)}
                    {les && <span className="text-slate-500"> · {les.title}</span>}
                  </span>
                  <span className="text-xs text-slate-500">{formatDate(r.at)}</span>
                  <span className={cls("w-16 text-right font-semibold", pct >= 0.8 ? "text-emerald-600" : pct >= 0.5 ? "text-amber-600" : "text-rose-600")}>
                    {r.score}/{r.total}
                  </span>
                </div>
              );
            })}
          </Card>
        </section>
      )}
    </div>
  );
}
