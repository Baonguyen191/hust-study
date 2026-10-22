import { useSyncExternalStore } from "react";
import { schedule, type CardState, type Rating } from "./srs";

/** Toàn bộ tiến độ học được lưu trong một khoá localStorage. */
export const STORAGE_KEY = "hust-study:v1";

export type Theme = "system" | "light" | "dark";

export interface QuizRecord {
  at: number;
  mode: "quiz" | "exam" | "review";
  subject: string;
  /** undefined = cả môn */
  lesson?: string;
  score: number;
  total: number;
  seconds?: number;
}

export interface WrongItem {
  subject: string;
  lesson: string;
  qid: string;
  at: number;
  times: number;
}

export interface ProgressState {
  version: 1;
  /** "subject/lesson" -> thời điểm đánh dấu đã học */
  learned: Record<string, number>;
  /** "subject/lesson" -> ghi chú */
  notes: Record<string, string>;
  /** "subject/lesson#fc-01" -> lịch ôn */
  cards: Record<string, CardState>;
  history: QuizRecord[];
  /** "subject/lesson#q-01" -> câu đã làm sai */
  wrong: Record<string, WrongItem>;
  theme: Theme;
}

const empty = (): ProgressState => ({ version: 1, learned: {}, notes: {}, cards: {}, history: [], wrong: {}, theme: "system" });

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);

/** Chuẩn hoá dữ liệu đọc từ localStorage hoặc file import; ném lỗi nếu không đúng định dạng. */
export function normalizeState(x: unknown): ProgressState {
  if (!isObj(x)) throw new Error("Dữ liệu không phải object JSON");
  const base = empty();
  const theme = x.theme === "light" || x.theme === "dark" || x.theme === "system" ? x.theme : base.theme;
  return {
    version: 1,
    learned: isObj(x.learned) ? (x.learned as ProgressState["learned"]) : {},
    notes: isObj(x.notes) ? (x.notes as ProgressState["notes"]) : {},
    cards: isObj(x.cards) ? (x.cards as ProgressState["cards"]) : {},
    history: Array.isArray(x.history) ? (x.history as QuizRecord[]) : [],
    wrong: isObj(x.wrong) ? (x.wrong as ProgressState["wrong"]) : {},
    theme,
  };
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : empty();
  } catch {
    return empty();
  }
}

let state: ProgressState = load();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function set(next: ProgressState) {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // chế độ ẩn danh / hết dung lượng: vẫn giữ trong bộ nhớ cho phiên hiện tại
  }
  emit();
}

try {
  // đồng bộ giữa các tab
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      state = load();
      emit();
    }
  });
} catch {
  /* không có window */
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getState(): ProgressState {
  return state;
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, getState, getState);
}

export const cardKey = (subject: string, lesson: string, id: string) => `${subject}/${lesson}#${id}`;

export const actions = {
  setLearned(key: string, learned: boolean) {
    const next = { ...state.learned };
    if (learned) next[key] = Date.now();
    else delete next[key];
    set({ ...state, learned: next });
  },
  setNote(key: string, text: string) {
    const next = { ...state.notes };
    if (text.trim()) next[key] = text;
    else delete next[key];
    set({ ...state, notes: next });
  },
  rateCard(key: string, rating: Rating) {
    set({ ...state, cards: { ...state.cards, [key]: schedule(state.cards[key], rating) } });
  },
  recordQuiz(rec: QuizRecord) {
    set({ ...state, history: [...state.history, rec].slice(-500) });
  },
  /** Cập nhật danh sách câu sai sau một lượt làm bài. */
  markAnswers(results: { subject: string; lesson: string; qid: string; correct: boolean }[]) {
    const wrong = { ...state.wrong };
    const now = Date.now();
    for (const r of results) {
      const k = `${r.subject}/${r.lesson}#${r.qid}`;
      if (r.correct) delete wrong[k];
      else wrong[k] = { subject: r.subject, lesson: r.lesson, qid: r.qid, at: now, times: (wrong[k]?.times ?? 0) + 1 };
    }
    set({ ...state, wrong });
  },
  removeWrong(key: string) {
    const wrong = { ...state.wrong };
    delete wrong[key];
    set({ ...state, wrong });
  },
  setTheme(theme: Theme) {
    set({ ...state, theme });
  },
  importState(data: unknown) {
    set(normalizeState(data));
  },
  reset() {
    set({ ...empty(), theme: state.theme });
  },
};
