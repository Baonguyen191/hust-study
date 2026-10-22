import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { cardStatsFor, getLessonMeta, getSubject, lessonKey, loadLesson, loadLessons, manifest, shuffle, useAsync, type LoadedLesson } from "../data";
import type { Flashcard } from "../schema/content";
import { isDue, nextLabel, type Rating } from "../srs";
import { actions, cardKey, getState, useProgress } from "../store";
import { Markdown } from "../components/Markdown";
import { accent, Button, Card, cls, ErrorBox, isTyping, Kbd, lessonPageTo, LinkButton, Loading, PageLinks, ProgressBar, Select, SourceBadge } from "../components/ui";

interface DeckItem {
  key: string;
  subject: string;
  lesson: string;
  lessonTitle: string;
  card: Flashcard;
}

type Mode = "lesson" | "subject" | "due";

/** Chọn thẻ cho một phiên ôn theo chế độ. */
function buildDeck(loaded: LoadedLesson[], mode: Mode, all: boolean): DeckItem[] {
  const st = getState();
  const items: DeckItem[] = loaded.flatMap(({ subject, meta, content }) =>
    content.flashcards.map((card) => ({
      key: cardKey(subject.id, meta.id, card.id),
      subject: subject.id,
      lesson: meta.id,
      lessonTitle: meta.title,
      card,
    })),
  );
  const due = items.filter((x) => isDue(st.cards[x.key]));
  const fresh = items.filter((x) => !st.cards[x.key]);
  const later = items.filter((x) => st.cards[x.key] && !isDue(st.cards[x.key]));
  if (all || mode === "lesson") return [...shuffle(due), ...fresh, ...shuffle(later)];
  if (mode === "subject") return [...shuffle(due), ...fresh];
  // due: thẻ đến hạn ở mọi môn + thẻ mới của các bài đã đánh dấu "đã học"
  return [...shuffle(due), ...fresh.filter((x) => st.learned[lessonKey(x.subject, x.lesson)])];
}

export default function Flashcards() {
  const [params] = useSearchParams();
  const mode = params.get("mode") as Mode | null;
  const s = params.get("s") ?? "";
  const l = params.get("l") ?? "";
  const all = params.get("all") === "1";

  if (mode !== "lesson" && mode !== "subject" && mode !== "due") return <Chooser />;
  return <Session key={`${mode}/${s}/${l}/${all}`} mode={mode} subject={s} lesson={l} all={all} />;
}

function Session({ mode, subject, lesson, all }: { mode: Mode; subject: string; lesson: string; all: boolean }) {
  const { data, error, loading } = useAsync<LoadedLesson[]>(async () => {
    if (mode === "lesson") {
      const m = getLessonMeta(subject, lesson);
      if (!m) throw new Error("Không tìm thấy bài học");
      return [{ subject: m.subject, meta: m.lesson, content: await loadLesson(subject, lesson) }];
    }
    return loadLessons(mode === "subject" ? subject : undefined);
  }, [mode, subject, lesson]);

  // chốt bộ thẻ một lần khi tải xong (không tính lại khi lịch ôn thay đổi trong phiên)
  const deck = useMemo(() => (data ? buildDeck(data, mode, all) : null), [data, mode, all]);

  const title =
    mode === "lesson"
      ? (getLessonMeta(subject, lesson)?.lesson.title ?? lesson)
      : mode === "subject"
        ? `Cả môn ${getSubject(subject)?.name ?? subject}`
        : "Thẻ cần ôn hôm nay";
  const back = mode === "lesson" ? `/l/${subject}/${lesson}` : mode === "subject" ? `/s/${subject}` : "/";

  if (error) return <ErrorBox>{error.message}</ErrorBox>;
  if (loading || !deck) return <Loading />;
  return <Deck items={deck} title={title} back={back} mode={mode} subject={subject} lesson={lesson} />;
}

function Deck({ items, title, back, mode, subject, lesson }: { items: DeckItem[]; title: string; back: string; mode: Mode; subject: string; lesson: string }) {
  const [queue, setQueue] = useState(items);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [counts, setCounts] = useState<[number, number, number]>([0, 0, 0]);
  const st = useProgress();
  const cur = queue[pos];

  const rate = useCallback(
    (r: Rating) => {
      if (!cur || !flipped) return;
      actions.rateCard(cur.key, r);
      setCounts((c) => c.map((x, i) => (i === r ? x + 1 : x)) as [number, number, number]);
      if (r === 0) setQueue((q) => [...q, cur]); // quên: gặp lại cuối phiên
      setPos((p) => p + 1);
      setFlipped(false);
    },
    [cur, flipped],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e) || e.ctrlKey || e.metaKey || e.altKey || !cur) return;
      if (e.key === " " || e.key === "Enter") setFlipped((f) => !f);
      else if (e.key === "1") rate(0);
      else if (e.key === "2") rate(1);
      else if (e.key === "3") rate(2);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cur, rate]);

  if (items.length === 0) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <p className="text-lg font-semibold">Không có thẻ nào cần ôn 🎉</p>
        <p className="mt-2 text-sm text-slate-500">
          {mode === "due"
            ? "Thẻ mới chỉ vào hàng ôn khi bạn đánh dấu bài là “đã học”. Hoặc ôn theo từng môn."
            : "Mọi thẻ đã được lên lịch cho những ngày sau."}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {mode === "subject" && <LinkButton to={`/flashcards?mode=subject&s=${subject}&all=1`}>Ôn lại toàn bộ thẻ</LinkButton>}
          <LinkButton to="/flashcards">Chọn bộ thẻ khác</LinkButton>
          <LinkButton to={back} variant="ghost">
            Quay lại
          </LinkButton>
        </div>
      </Card>
    );
  }

  if (!cur) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <p className="text-sm font-medium text-slate-500">Xong phiên ôn · {title}</p>
        <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{pos} lượt</p>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <span className="text-rose-600">Quên {counts[0]}</span>
          <span className="text-amber-600">Khó {counts[1]}</span>
          <span className="text-emerald-600">Nhớ {counts[2]}</span>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <LinkButton to={back} variant="primary">
            Quay lại
          </LinkButton>
          {mode === "lesson" && <LinkButton to={`/quiz?s=${subject}&l=${lesson}`}>Làm quiz bài này</LinkButton>}
          <LinkButton to="/flashcards">Bộ thẻ khác</LinkButton>
        </div>
      </Card>
    );
  }

  const state = st.cards[cur.key];
  const a = accent(cur.subject);
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to={back} className="text-sm text-slate-500 hover:underline">
          ← {title}
        </Link>
        <span className="ml-auto text-sm text-slate-500">
          {Math.min(pos + 1, queue.length)}/{queue.length}
        </span>
      </div>
      <ProgressBar value={pos / queue.length} />

      <div className="flip">
        <div className={cls("flip-inner grid", flipped && "flipped")}>
          {[false, true].map((isBack) => (
            <div
              key={String(isBack)}
              role="button"
              tabIndex={isBack === flipped ? 0 : -1}
              onClick={() => setFlipped((f) => !f)}
              className={cls(
                "flip-face flex min-h-72 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm [grid-area:1/1] sm:p-8 dark:border-slate-800 dark:bg-slate-900",
                isBack && "flip-back",
              )}
              aria-hidden={isBack !== flipped}
            >
              <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
                <span className={cls("h-2 w-2 shrink-0 rounded-full", a.dot)} />
                <span className="truncate">{cur.lessonTitle}</span>
                <SourceBadge source={cur.card.source} />
                <span className="ml-auto shrink-0 font-semibold tracking-wide uppercase">{isBack ? "Mặt sau" : "Mặt trước"}</span>
              </div>
              <div className="flex flex-1 items-center justify-center text-center">
                <Markdown
                  text={isBack ? cur.card.back : cur.card.front}
                  className={cls(isBack ? "text-base" : "text-xl font-semibold text-slate-900 dark:text-white")}
                />
              </div>
              {isBack && (
                <div className="mt-4 flex justify-center" onClick={(e) => e.stopPropagation()}>
                  <PageLinks pages={cur.card.pages} to={lessonPageTo(cur.subject, cur.lesson)} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {flipped ? (
        <div className="grid grid-cols-3 gap-2">
          {([0, 1, 2] as Rating[]).map((r) => (
            <Button key={r} variant={r === 0 ? "danger" : r === 1 ? "warning" : "success"} size="lg" onClick={() => rate(r)} className="flex-col gap-0">
              <span>{["Quên", "Khó", "Nhớ"][r]}</span>
              <span className="text-xs font-normal opacity-90">
                {nextLabel(state, r)} · phím {r + 1}
              </span>
            </Button>
          ))}
        </div>
      ) : (
        <Button variant="primary" size="lg" className="w-full" onClick={() => setFlipped(true)}>
          Lật thẻ
        </Button>
      )}
      <p className="text-center text-xs text-slate-500">
        <Kbd>Space</Kbd> lật thẻ · <Kbd>1</Kbd> Quên · <Kbd>2</Kbd> Khó · <Kbd>3</Kbd> Nhớ
      </p>
    </div>
  );
}

function Chooser() {
  const st = useProgress();
  const statsOf = useMemo(() => cardStatsFor(st), [st]);
  const [sel, setSel] = useState<Record<string, string>>({});
  const dueAll = manifest.subjects.reduce((a, s) => a + s.lessons.reduce((b, l) => b + statsOf(s.id, l).dueToday, 0), 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Flashcard</h1>
      <Card className="flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <p className="font-semibold">Ôn thẻ đến hạn hôm nay</p>
          <p className="text-sm text-slate-500">Mọi môn · thẻ đến hạn theo lịch SM-2 + thẻ mới của bài đã đánh dấu “đã học”.</p>
        </div>
        <LinkButton to="/flashcards?mode=due" variant="primary">
          Ôn {dueAll} thẻ
        </LinkButton>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        {manifest.subjects.map((s) => {
          const lessons = s.lessons.filter((l) => l.hasContent);
          const stats = lessons.map((l) => statsOf(s.id, l));
          const total = stats.reduce((a, x) => a + x.total, 0);
          const due = stats.reduce((a, x) => a + x.due, 0);
          const fresh = stats.reduce((a, x) => a + x.fresh, 0);
          const lessonSel = sel[s.id] ?? lessons[0]?.id ?? "";
          return (
            <Card key={s.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={cls("h-2.5 w-2.5 rounded-full", accent(s.id).dot)} />
                <p className="font-semibold">{s.name}</p>
              </div>
              <p className="text-sm text-slate-500">
                {total} thẻ · {due} đến hạn · {fresh} chưa học
              </p>
              <LinkButton to={`/flashcards?mode=subject&s=${s.id}`} size="sm" variant="primary">
                Ôn cả môn ({due + fresh})
              </LinkButton>
              <div className="flex items-end gap-2">
                <Select
                  label="Theo bài"
                  value={lessonSel}
                  onChange={(v) => setSel((x) => ({ ...x, [s.id]: v }))}
                  options={lessons.map((l) => ({ value: l.id, label: l.title }))}
                  className="min-w-0 flex-1"
                />
                <LinkButton to={`/flashcards?mode=lesson&s=${s.id}&l=${lessonSel}`}>Học</LinkButton>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
