/**
 * Build site rồi đẩy thư mục dist/ lên nhánh gh-pages của remote "origin" (GitHub Pages).
 * PDF gốc chỉ có trên máy (pdfRoot) nên phải build ở máy, không build trên GitHub Actions.
 *
 * Chạy: npm run deploy
 */
import { execSync } from "node:child_process";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const run = (cmd, cwd = ROOT) => execSync(cmd, { cwd, stdio: "inherit" });
const out = (cmd, cwd = ROOT) => execSync(cmd, { cwd, encoding: "utf8" }).trim();

const remote = out("git remote get-url origin");
const source = out("git rev-parse --short HEAD");
const name = out("git config user.name");
const email = out("git config user.email");

run("npm run build");
if (!existsSync(join(DIST, "pdf"))) {
  console.error("dist/pdf không tồn tại – kiểm tra pdfRoot trong hust.config.json trước khi deploy.");
  process.exit(1);
}
// GitHub Pages mặc định chạy Jekyll; tắt đi để phục vụ nguyên trạng file tĩnh
writeFileSync(join(DIST, ".nojekyll"), "");

rmSync(join(DIST, ".git"), { recursive: true, force: true });
run("git init -q -b gh-pages", DIST);
run(`git config user.name "${name}"`, DIST);
run(`git config user.email "${email}"`, DIST);
run("git config core.autocrlf false", DIST);
run("git add -A", DIST);
run(`git commit -q -m "Deploy từ ${source}"`, DIST);
run(`git push -f "${remote}" gh-pages`, DIST);
rmSync(join(DIST, ".git"), { recursive: true, force: true });

console.log("\nĐã đẩy dist/ lên nhánh gh-pages.");
