/**
 * Validate data/content/<môn>/<bài>.json theo schema Zod + kiểm tra chéo với manifest.
 *
 * Chạy:  npm run validate                 (mọi file)
 *        npm run validate -- CNWeb/lec-5-1-php   (một bài)
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { LessonContent, Manifest } from "../src/schema/content.ts";

const ROOT = join(import.meta.dirname, "..");
const CONTENT = join(ROOT, "data", "content");
const manifest = Manifest.parse(JSON.parse(readFileSync(join(ROOT, "data", "manifest.json"), "utf8")));

function listFiles(): string[] {
  if (!existsSync(CONTENT)) return [];
  return readdirSync(CONTENT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) =>
      readdirSync(join(CONTENT, d.name))
        .filter((f) => f.endsWith(".json"))
        .map((f) => join(CONTENT, d.name, f)),
    );
}

function check(file: string): string[] {
  const errors: string[] = [];
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    return [`JSON lỗi: ${(e as Error).message}`];
  }
  const parsed = LessonContent.safeParse(data);
  if (!parsed.success) {
    return parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
  }
  const c = parsed.data;

  const lesson = manifest.subjects.find((s) => s.id === c.subject)?.lessons.find((l) => l.id === c.lesson);
  if (!lesson) return [`không có ${c.subject}/${c.lesson} trong manifest`];

  const inRange = (p: number) => p >= lesson.pageStart && p <= lesson.pageEnd;
  const checkPages = (where: string, pages: number[]) => {
    for (const p of pages) if (!inRange(p)) errors.push(`${where}: trang ${p} ngoài khoảng ${lesson.pageStart}-${lesson.pageEnd}`);
  };

  for (const m of c.summary.matchAll(/\(#p(\d+)\)/g)) checkPages("summary", [Number(m[1])]);
  c.keyConcepts.forEach((k, i) => checkPages(`keyConcepts[${i}]`, k.pages));
  c.codeExamples.forEach((k, i) => {
    checkPages(`codeExamples[${i}]`, k.pages);
    const n = k.code.split("\n").length;
    for (const part of k.parts) {
      const last = Number(part.lines.split("-").at(-1));
      if (last > n) errors.push(`codeExamples[${i}].parts: dòng ${part.lines} vượt quá ${n} dòng`);
    }
  });
  c.figures.forEach((f, i) => checkPages(`figures[${i}]`, [f.page]));
  c.flashcards.forEach((k) => checkPages(k.id, k.pages));
  c.quiz.forEach((k) => checkPages(k.id, k.pages));
  c.examQuestions.forEach((k) => checkPages(k.id, k.pages));

  for (const [name, items] of [["flashcards", c.flashcards], ["quiz", c.quiz], ["examQuestions", c.examQuestions]] as const) {
    const ids = items.map((x) => x.id);
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dup.length) errors.push(`${name}: id trùng ${[...new Set(dup)].join(", ")}`);
  }

  const levels = new Set(c.quiz.map((q) => q.level));
  if (levels.size < 3) errors.push(`quiz: cần đủ 3 mức nhớ/hiểu/vận dụng, hiện có ${[...levels].join(", ")}`);

  const answers = c.quiz.map((q) => q.answer);
  const maxSame = Math.max(...[0, 1, 2, 3].map((a) => answers.filter((x) => x === a).length));
  if (maxSame > Math.ceil(answers.length * 0.5)) errors.push("quiz: đáp án đúng dồn quá nhiều vào một vị trí");

  return errors;
}

const filter = process.argv[2];
const files = listFiles().filter((f) => !filter || relative(CONTENT, f).replace(/\\/g, "/").startsWith(filter));
if (!files.length) {
  console.error("Không tìm thấy file nội dung nào.");
  process.exit(1);
}

let failed = 0;
for (const f of files) {
  const errs = check(f);
  const name = relative(ROOT, f).replace(/\\/g, "/");
  if (errs.length) {
    failed++;
    console.log(`✗ ${name}`);
    for (const e of errs) console.log(`    - ${e}`);
  } else {
    const c = JSON.parse(readFileSync(f, "utf8"));
    console.log(
      `✓ ${name}  (${c.keyConcepts.length} khái niệm, ${c.codeExamples?.length ?? 0} code, ` +
        `${c.flashcards.length} thẻ, ${c.quiz.length} câu quiz, ${c.examQuestions.length} câu tự luận)`,
    );
  }
}
process.exit(failed ? 1 : 0);
