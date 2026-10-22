import { useEffect, useState } from "react";
import manifestJson from "../data/manifest.json";
import type { LessonContent, Manifest, ManifestLesson } from "./schema/content";
import type { ProgressState } from "./store";
import { isDue } from "./srs";

export const manifest = manifestJson as unknown as Manifest;
export type Subject = Manifest["subjects"][number];
export type { LessonContent, ManifestLesson };

/** Mỗi file nội dung là một chunk riêng, chỉ tải khi cần. */
const loaders = import.meta.glob<LessonContent>("../data/content/*/*.json", { import: "default" });

export const lessonKey = (subject: string, lesson: string) => `${subject}/${lesson}`;

export function getSubject(id: string | undefined): Subject | undefined {
  return manifest.subjects.find((s) => s.id === id);
}

export function getLessonMeta(subject: string | undefined, lesson: string | undefined) {
  const s = getSubject(subject);
  const l = s?.lessons.find((x) => x.id === lesson);
  return s && l ? { subject: s, lesson: l } : undefined;
}

export const allLessons = manifest.subjects.flatMap((s) => s.lessons.map((l) => ({ subject: s, lesson: l })));

const cache = new Map<string, Promise<LessonContent>>();

export function loadLesson(subject: string, lesson: string): Promise<LessonContent> {
  const key = lessonKey(subject, lesson);
  let p = cache.get(key);
  if (!p) {
    const loader = loaders[`../data/content/${subject}/${lesson}.json`];
    p = loader ? loader() : Promise.reject(new Error(`Chưa có nội dung cho ${key}`));
    p.catch(() => cache.delete(key));
    cache.set(key, p);
  }
  return p;
}

export interface LoadedLesson {
  subject: Subject;
  meta: ManifestLesson;
  content: LessonContent;
}

/** Tải mọi bài có nội dung của một môn (hoặc tất cả các môn nếu subject = undefined). */
export async function loadLessons(subject?: string): Promise<LoadedLesson[]> {
  const list = allLessons.filter((x) => x.lesson.hasContent && (!subject || x.subject.id === subject));
  return Promise.all(
    list.map(async (x) => ({ subject: x.subject, meta: x.lesson, content: await loadLesson(x.subject.id, x.lesson.id) })),
  );
}

const BASE = import.meta.env.BASE_URL;

export function pdfUrl(meta: ManifestLesson): string {
  return `${BASE}pdf/${meta.pdf.split("/").map(encodeURIComponent).join("/")}`;
}

export function slideImageUrl(subject: string, lesson: string, page: number): string {
  return `${BASE}slides/${subject}/${lesson}/p${page}.png`;
}

/** Hook tải dữ liệu bất đồng bộ đơn giản. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<{ data?: T; error?: Error; loading: boolean }>({ loading: true });
  useEffect(() => {
    let alive = true;
    setState({ loading: true });
    fn().then(
      (data) => alive && setState({ data, loading: false }),
      (error: Error) => alive && setState({ error, loading: false }),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export interface LessonCardStats {
  total: number;
  reviewed: number;
  /** thẻ đã học đến hạn hôm nay */
  due: number;
  /** thẻ chưa học lần nào */
  fresh: number;
  /** cần ôn hôm nay = đến hạn + thẻ mới của bài đã đánh dấu "đã học" */
  dueToday: number;
  learned: boolean;
}

/** Thống kê flashcard theo bài, dựa trên số thẻ trong manifest và lịch ôn đã lưu. */
export function cardStatsFor(state: ProgressState, now = Date.now()) {
  const per = new Map<string, { reviewed: number; due: number }>();
  for (const [k, c] of Object.entries(state.cards)) {
    const lk = k.slice(0, k.indexOf("#"));
    const e = per.get(lk) ?? { reviewed: 0, due: 0 };
    e.reviewed++;
    if (isDue(c, now)) e.due++;
    per.set(lk, e);
  }
  return (subject: string, meta: ManifestLesson): LessonCardStats => {
    const key = lessonKey(subject, meta.id);
    const e = per.get(key) ?? { reviewed: 0, due: 0 };
    const total = meta.counts?.flashcards ?? 0;
    const fresh = Math.max(0, total - e.reviewed);
    const learned = !!state.learned[key];
    return { total, reviewed: e.reviewed, due: e.due, fresh, dueToday: e.due + (learned ? fresh : 0), learned };
  };
}

/** Bỏ dấu tiếng Việt + chữ thường, dùng cho tìm kiếm. */
export function normalizeVi(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
