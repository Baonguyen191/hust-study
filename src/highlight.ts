import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import css from "highlight.js/lib/languages/css";
import http from "highlight.js/lib/languages/http";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import php from "highlight.js/lib/languages/php";
import plaintext from "highlight.js/lib/languages/plaintext";
import powershell from "highlight.js/lib/languages/powershell";
import prolog from "highlight.js/lib/languages/prolog";
import python from "highlight.js/lib/languages/python";
import xml from "highlight.js/lib/languages/xml";

const langs = { bash, c, cpp, csharp, css, http, java, javascript, json, php, plaintext, powershell, prolog, python, xml };
for (const [name, def] of Object.entries(langs)) hljs.registerLanguage(name, def);

const ALIAS: Record<string, string> = { html: "xml", jsx: "javascript", js: "javascript", jsp: "xml", sh: "bash", "c++": "cpp", text: "plaintext" };

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Tô màu rồi tách theo dòng, đóng/mở lại các thẻ <span> bị cắt ngang (chuỗi, chú thích nhiều dòng). */
export function highlightLines(code: string, language: string): string[] {
  const lang = ALIAS[language] ?? language;
  let html: string;
  try {
    html = hljs.getLanguage(lang) ? hljs.highlight(code, { language: lang, ignoreIllegals: true }).value : escapeHtml(code);
  } catch {
    html = escapeHtml(code);
  }
  const lines: string[] = [];
  const open: string[] = [];
  let cur = "";
  for (const tok of html.match(/<span[^>]*>|<\/span>|\n|[^<\n]+/g) ?? []) {
    if (tok === "\n") {
      lines.push(cur + "</span>".repeat(open.length));
      cur = open.join("");
    } else if (tok === "</span>") {
      open.pop();
      cur += tok;
    } else if (tok.startsWith("<span")) {
      open.push(tok);
      cur += tok;
    } else cur += tok;
  }
  lines.push(cur + "</span>".repeat(open.length));
  return lines;
}

export const LANG_LABEL: Record<string, string> = {
  cpp: "C++", c: "C", csharp: "C#", javascript: "JavaScript", jsx: "JSX", html: "HTML", xml: "XML", css: "CSS",
  php: "PHP", java: "Java", jsp: "JSP", python: "Python", json: "JSON", bash: "Bash", http: "HTTP",
  powershell: "PowerShell", prolog: "Prolog",
};
