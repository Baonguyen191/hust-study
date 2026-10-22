import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { actions, useProgress, type Theme } from "../store";
import { cls, isTyping, Loading } from "./ui";

const NAV = [
  { to: "/", label: "Trang chủ", end: true },
  { to: "/flashcards", label: "Flashcard" },
  { to: "/quiz", label: "Quiz" },
  { to: "/exam", label: "Thi thử" },
  { to: "/review", label: "Câu sai" },
  { to: "/search", label: "Tìm kiếm" },
  { to: "/settings", label: "Cài đặt" },
];

function useApplyTheme(theme: Theme) {
  useEffect(() => {
    let mq: MediaQueryList | null = null;
    try {
      mq = matchMedia("(prefers-color-scheme: dark)");
    } catch {
      /* trình duyệt cũ */
    }
    const apply = () =>
      document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && !!mq?.matches));
    apply();
    if (theme === "system" && mq) {
      mq.addEventListener("change", apply);
      return () => mq?.removeEventListener("change", apply);
    }
  }, [theme]);
}

const THEME_NEXT: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };
const THEME_LABEL: Record<Theme, string> = { system: "Theo hệ thống", light: "Sáng", dark: "Tối" };

function ThemeIcon({ theme }: { theme: Theme }) {
  const common = { width: 18, height: 18, fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (theme === "light")
    return (
      <svg viewBox="0 0 24 24" {...common} aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    );
  if (theme === "dark")
    return (
      <svg viewBox="0 0 24 24" {...common} aria-hidden>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" {...common} aria-hidden>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

export default function Layout() {
  const { theme, wrong } = useProgress();
  useApplyTheme(theme);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const wrongCount = Object.keys(wrong).length;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !isTyping(e) && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (searchRef.current && searchRef.current.offsetParent) searchRef.current.focus();
        else navigate("/search");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2 font-bold text-slate-900 dark:text-white">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-sm text-white">H</span>
            <span className="hidden sm:inline">HUST Study</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <NavItem key={n.to} {...n} badge={n.to === "/review" ? wrongCount : 0} />
            ))}
          </nav>
          <form onSubmit={submit} className="ml-auto hidden md:block">
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm khái niệm…  ( / )"
              aria-label="Tìm kiếm"
              className="w-56 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:w-72 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none dark:border-slate-700 dark:bg-slate-900 xl:w-64"
            />
          </form>
          <button
            type="button"
            onClick={() => actions.setTheme(THEME_NEXT[theme])}
            className="ml-auto rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:ml-0 dark:text-slate-300 dark:hover:bg-slate-800"
            title={`Giao diện: ${THEME_LABEL[theme]} (bấm để đổi)`}
            aria-label={`Giao diện: ${THEME_LABEL[theme]}`}
          >
            <ThemeIcon theme={theme} />
          </button>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden">
          {NAV.map((n) => (
            <NavItem key={n.to} {...n} badge={n.to === "/review" ? wrongCount : 0} />
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500 dark:border-slate-800">
        Nội dung tóm tắt từ slide bài giảng · mục <span className="font-semibold text-amber-600 dark:text-amber-400">bổ sung</span> là kiến
        thức ngoài slide · tiến độ lưu trong trình duyệt
      </footer>
    </div>
  );
}

function NavItem({ to, label, end, badge }: { to: string; label: string; end?: boolean; badge: number }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cls(
          "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
          isActive
            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
        )
      }
    >
      {label}
      {badge > 0 && (
        <span className="rounded-full bg-rose-500 px-1.5 text-[11px] leading-4 font-semibold text-white">{badge}</span>
      )}
    </NavLink>
  );
}
