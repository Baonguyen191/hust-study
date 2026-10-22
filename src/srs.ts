/**
 * Lịch ôn tập SM-2 rút gọn với 3 mức tự đánh giá:
 *   0 = Quên  → học lại sau 10 phút, giảm hệ số dễ (ef)
 *   1 = Khó   → khoảng cách tăng chậm, giảm nhẹ ef
 *   2 = Nhớ   → khoảng cách nhân với ef, tăng ef
 */
export type Rating = 0 | 1 | 2;

export interface CardState {
  ef: number;
  /** khoảng cách hiện tại (ngày) */
  interval: number;
  reps: number;
  lapses: number;
  /** thời điểm đến hạn (ms) */
  due: number;
  last: number;
}

const DAY = 86_400_000;
const MIN_EF = 1.3;

export function startOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function endOfToday(now = Date.now()): number {
  return startOfDay(now) + DAY - 1;
}

export function schedule(prev: CardState | undefined, rating: Rating, now = Date.now()): CardState {
  const s: CardState = prev ?? { ef: 2.5, interval: 0, reps: 0, lapses: 0, due: now, last: now };
  if (rating === 0) {
    return { ...s, ef: Math.max(MIN_EF, s.ef - 0.2), interval: 0, reps: 0, lapses: s.lapses + 1, due: now + 10 * 60_000, last: now };
  }
  let interval: number;
  let ef = s.ef;
  if (rating === 1) {
    interval = s.reps === 0 ? 1 : Math.max(s.interval + 1, Math.round(s.interval * 1.2));
    ef = Math.max(MIN_EF, ef - 0.15);
  } else {
    interval = s.reps === 0 ? 2 : s.reps === 1 ? 5 : Math.max(s.interval + 1, Math.round(s.interval * ef));
    ef = Math.min(3, ef + 0.1);
  }
  return { ef, interval, reps: s.reps + 1, lapses: s.lapses, due: startOfDay(now) + interval * DAY, last: now };
}

export function isDue(c: CardState | undefined, now = Date.now()): boolean {
  return !!c && c.due <= endOfToday(now);
}

/** Nhãn ngắn cho nút đánh giá, vd "10 phút", "3 ngày". */
export function nextLabel(prev: CardState | undefined, rating: Rating): string {
  const n = schedule(prev, rating);
  if (n.interval === 0) return "10 phút";
  if (n.interval < 30) return `${n.interval} ngày`;
  if (n.interval < 365) return `${Math.round(n.interval / 30)} tháng`;
  return `${(n.interval / 365).toFixed(1)} năm`;
}
