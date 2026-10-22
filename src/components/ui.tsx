import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

export function cls(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success" | "warning";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-indigo-300 dark:disabled:bg-indigo-900",
  secondary:
    "bg-white text-slate-700 ring-1 ring-slate-300 ring-inset hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800",
  ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
  danger: "bg-rose-600 text-white hover:bg-rose-500",
  success: "bg-emerald-600 text-white hover:bg-emerald-500",
  warning: "bg-amber-500 text-white hover:bg-amber-400",
};

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg" }) {
  return (
    <button
      type="button"
      {...rest}
      className={cls(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-60",
        size === "sm" && "px-2.5 py-1 text-sm",
        size === "md" && "px-3.5 py-2 text-sm",
        size === "lg" && "px-5 py-2.5 text-base",
        VARIANTS[variant],
        className,
      )}
    />
  );
}

export function LinkButton({
  to,
  variant = "secondary",
  size = "md",
  className,
  children,
}: {
  to: string;
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cls(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
        size === "sm" && "px-2.5 py-1 text-sm",
        size === "md" && "px-3.5 py-2 text-sm",
        size === "lg" && "px-5 py-2.5 text-base",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cls("rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900", className)}>
      {children}
    </div>
  );
}

/** Danh sách số trang slide; bấm để mở PDF tại trang đó. */
export function PageLinks({
  pages,
  onPage,
  to,
  className,
}: {
  pages: number[];
  onPage?: (p: number) => void;
  to?: (p: number) => string;
  className?: string;
}) {
  return (
    <span className={cls("inline-flex flex-wrap items-center gap-1", className)}>
      {pages.map((p) =>
        onPage ? (
          <button key={p} type="button" className="page-link" onClick={() => onPage(p)} title={`Mở slide trang ${p}`}>
            tr. {p}
          </button>
        ) : to ? (
          <Link key={p} to={to(p)} className="page-link" title={`Mở slide trang ${p}`}>
            tr. {p}
          </Link>
        ) : (
          <span key={p} className="page-link">
            tr. {p}
          </span>
        ),
      )}
    </span>
  );
}

export const lessonPageTo = (subject: string, lesson: string) => (p: number) => `/l/${subject}/${lesson}?p=${p}`;

export function SourceBadge({ source }: { source: string }) {
  if (source !== "bổ sung") return null;
  return (
    <span
      className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
      title="Kiến thức bổ sung ngoài slide"
    >
      bổ sung
    </span>
  );
}

const LEVEL_CLS: Record<string, string> = {
  nhớ: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  hiểu: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  "vận dụng": "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
};

export function LevelBadge({ level }: { level: string }) {
  return <span className={cls("rounded-full px-2 py-0.5 text-[11px] font-semibold", LEVEL_CLS[level])}>{level}</span>;
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={cls("h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800", className)}>
      <div className="h-full rounded-full bg-indigo-500 transition-[width] duration-500" style={{ width: `${v * 100}%` }} />
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
      {children}
    </kbd>
  );
}

export function Loading({ label = "Đang tải…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-500" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500" />
      {label}
    </div>
  );
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
      {children}
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <label className={cls("flex flex-col gap-1 text-sm", className)}>
      <span className="font-medium text-slate-600 dark:text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Màu nhấn riêng cho từng môn (chuỗi class tĩnh để Tailwind nhận diện). */
const SUBJECT_ACCENT: Record<string, { dot: string; soft: string; text: string }> = {
  CNWeb: { dot: "bg-sky-500", soft: "bg-sky-50 dark:bg-sky-500/10", text: "text-sky-700 dark:text-sky-300" },
  HPT: { dot: "bg-violet-500", soft: "bg-violet-50 dark:bg-violet-500/10", text: "text-violet-700 dark:text-violet-300" },
  IoT: { dot: "bg-emerald-500", soft: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-300" },
  KTLT: { dot: "bg-amber-500", soft: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-300" },
};
const FALLBACK = { dot: "bg-indigo-500", soft: "bg-indigo-50 dark:bg-indigo-500/10", text: "text-indigo-700 dark:text-indigo-300" };

export const accent = (subject: string) => SUBJECT_ACCENT[subject] ?? FALLBACK;

/** Bỏ qua phím tắt khi người dùng đang gõ. */
export function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
}

export function formatDate(t: number) {
  return new Date(t).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
