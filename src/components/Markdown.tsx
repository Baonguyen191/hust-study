import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import { CodeBlock } from "./CodeBlock";
import { cls } from "./ui";

const ITALIC = /(^|[\s(“"'])\*(?=[\p{L}\p{N}])([^*\n]*?[\p{L}\p{N})])\*(?=$|[\s.,;:!?)”"'])/gu;

/**
 * Nội dung bài viết về code nên hay có ký tự đặc biệt ngoài backtick: `<head>` (react-markdown sẽ bỏ HTML thô),
 * `x*6`, `int *p`, wildcard `*`… Hàm này escape chúng, chỉ giữ **đậm** và *nghiêng* hợp lệ; phần trong `code` giữ nguyên.
 */
export function prepareMarkdown(text: string): string {
  return text
    .split(/(```[\s\S]*?```|`[^`\n]*`)/g)
    .map((seg, i) => {
      if (i % 2 === 1) return seg; // đoạn code
      const keep: string[] = [];
      const hold = (s: string) => `\u0000${keep.push(s) - 1}\u0000`;
      let s = seg.replace(/\*\*/g, hold).replace(ITALIC, (_m, pre: string, body: string) => `${pre}${hold("*")}${body}${hold("*")}`);
      s = s.replace(/\*/g, "\\*").replace(/</g, "&lt;").replace(/__/g, "\\_\\_");
      return s.replace(/\u0000(\d+)\u0000/g, (_m, n: string) => keep[Number(n)]);
    })
    .join("");
}

/**
 * Hiển thị Markdown của nội dung bài học. Link dạng [tr. 12](#p12) trỏ tới trang slide:
 *  - onPage: gọi callback (trang bài học: nhảy PDF tới trang);
 *  - pageTo: tạo link router (các trang khác: mở trang bài học tại trang đó).
 */
export function Markdown({
  text,
  onPage,
  pageTo,
  inline,
  className,
}: {
  text: string;
  onPage?: (p: number) => void;
  pageTo?: (p: number) => string;
  inline?: boolean;
  className?: string;
}) {
  const components: Components = {
    a({ href, children }) {
      const m = /^#p(\d+)$/.exec(href ?? "");
      if (m) {
        const p = Number(m[1]);
        if (onPage)
          return (
            <button type="button" className="page-link" onClick={() => onPage(p)}>
              {children}
            </button>
          );
        if (pageTo)
          return (
            <Link to={pageTo(p)} className="page-link">
              {children}
            </Link>
          );
        return <span className="page-link">{children}</span>;
      }
      return (
        <a href={href} target="_blank" rel="noreferrer">
          {children}
        </a>
      );
    },
    pre({ children }) {
      return <>{children}</>;
    },
    code({ className: c, children }) {
      const m = /language-([\w+-]+)/.exec(c ?? "");
      const raw = String(children ?? "");
      if (m || raw.includes("\n")) return <CodeBlock code={raw.replace(/\n$/, "")} language={m?.[1] ?? "plaintext"} className="my-3" />;
      return <code className="inline-code">{children}</code>;
    },
  };
  return (
    <div className={cls("md", inline && "md-inline", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {prepareMarkdown(text)}
      </ReactMarkdown>
    </div>
  );
}
