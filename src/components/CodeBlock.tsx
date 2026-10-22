import { useMemo, useState } from "react";
import { highlightLines, LANG_LABEL } from "../highlight";
import { Markdown } from "./Markdown";
import { cls } from "./ui";

interface Part {
  lines: string;
  note: string;
}

/** Khối code có tô màu, số dòng và chú thích từng đoạn (rê chuột vào chú thích để tô sáng các dòng). */
export function CodeBlock({
  code,
  language,
  parts,
  title,
  className,
}: {
  code: string;
  language: string;
  parts?: Part[];
  title?: string;
  className?: string;
}) {
  const lines = useMemo(() => highlightLines(code, language), [code, language]);
  const ranges = useMemo(
    () =>
      (parts ?? []).map((p) => {
        const [a, b] = p.lines.split("-").map(Number);
        return { from: a, to: b ?? a, ...p };
      }),
    [parts],
  );
  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const active = hover ?? pinned;
  const range = active != null ? ranges[active] : null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* trình duyệt chặn clipboard */
    }
  };

  return (
    <div className={cls("overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60", className)}>
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white/70 px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-900">
        <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {LANG_LABEL[language] ?? language}
        </span>
        {title && <span className="truncate font-medium text-slate-600 dark:text-slate-400">{title}</span>}
        <button
          type="button"
          onClick={copy}
          className="ml-auto rounded px-2 py-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          {copied ? "Đã chép ✓" : "Chép"}
        </button>
      </div>
      <pre className="overflow-x-auto py-2 font-mono text-[13px] leading-6">
        <code className="hljs block min-w-max">
          {lines.map((html, i) => {
            const n = i + 1;
            const on = range && n >= range.from && n <= range.to;
            return (
              <div key={i} className={cls("flex", on && "bg-amber-200/60 dark:bg-amber-400/15")}>
                <span className="w-10 shrink-0 pr-3 text-right text-slate-400 select-none dark:text-slate-600">{n}</span>
                <span className="pr-4" dangerouslySetInnerHTML={{ __html: html || " " }} />
              </div>
            );
          })}
        </code>
      </pre>
      {ranges.length > 0 && (
        <ul className="divide-y divide-slate-200 border-t border-slate-200 text-sm dark:divide-slate-800 dark:border-slate-800">
          {ranges.map((r, i) => (
            <li
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setPinned(pinned === i ? null : i)}
              className={cls(
                "flex cursor-pointer gap-3 px-3 py-2 transition-colors",
                active === i ? "bg-amber-100/70 dark:bg-amber-400/10" : "hover:bg-white dark:hover:bg-slate-900",
              )}
            >
              <span className="shrink-0 pt-0.5 font-mono text-xs font-semibold whitespace-nowrap text-amber-700 dark:text-amber-300">
                {r.from === r.to ? `Dòng ${r.from}` : `Dòng ${r.from}–${r.to}`}
              </span>
              <Markdown inline text={r.note} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
