import { useRef, useState } from "react";
import { actions, getState, useProgress, type Theme } from "../store";
import { Button, Card, cls, Kbd } from "../components/ui";

export default function SettingsPage() {
  const st = useProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const exportJson = () => {
    const payload = { app: "hust-study", version: 1, exportedAt: new Date().toISOString(), data: getState() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hust-study-tien-do-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMsg({ ok: true, text: "Đã xuất file tiến độ." });
  };

  const importJson = async (file: File) => {
    try {
      const obj = JSON.parse(await file.text());
      const data = obj && typeof obj === "object" && "data" in obj ? obj.data : obj;
      if (!window.confirm("Nhập file sẽ THAY THẾ toàn bộ tiến độ hiện tại. Tiếp tục?")) return;
      actions.importState(data);
      setMsg({ ok: true, text: "Đã nhập tiến độ từ file." });
    } catch (e) {
      setMsg({ ok: false, text: `Không đọc được file: ${(e as Error).message}` });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const stats = [
    ["Bài đã học", Object.keys(st.learned).length],
    ["Thẻ đã ôn", Object.keys(st.cards).length],
    ["Lượt quiz/thi", st.history.length],
    ["Câu sai đang lưu", Object.keys(st.wrong).length],
    ["Ghi chú", Object.keys(st.notes).length],
  ] as const;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cài đặt</h1>

      <Card className="space-y-3">
        <p className="font-semibold">Giao diện</p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["system", "Theo hệ thống"],
              ["light", "Sáng"],
              ["dark", "Tối"],
            ] as [Theme, string][]
          ).map(([t, label]) => (
            <Button key={t} variant={st.theme === t ? "primary" : "secondary"} onClick={() => actions.setTheme(t)}>
              {label}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <p className="font-semibold">Tiến độ học</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {stats.map(([label, n]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/50">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{n}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-500">
          Tiến độ lưu trong localStorage của trình duyệt này. Xuất ra file JSON để sao lưu hoặc chuyển sang máy khác.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={exportJson}>
            Xuất JSON
          </Button>
          <Button onClick={() => fileRef.current?.click()}>Nhập JSON…</Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])}
          />
          <Button
            variant="danger"
            className="ml-auto"
            onClick={() => {
              if (window.confirm("Xoá toàn bộ tiến độ (đã học, lịch ôn, điểm, câu sai, ghi chú)? Không thể hoàn tác.")) {
                actions.reset();
                setMsg({ ok: true, text: "Đã xoá tiến độ." });
              }
            }}
          >
            Xoá tiến độ
          </Button>
        </div>
        {msg && <p className={cls("text-sm", msg.ok ? "text-emerald-600" : "text-rose-600")}>{msg.text}</p>}
      </Card>

      <Card className="space-y-2 text-sm">
        <p className="font-semibold">Phím tắt</p>
        <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
          <li>
            <Kbd>/</Kbd> tìm kiếm
          </li>
          <li>
            Flashcard: <Kbd>Space</Kbd> lật thẻ · <Kbd>1</Kbd> Quên · <Kbd>2</Kbd> Khó · <Kbd>3</Kbd> Nhớ
          </li>
          <li>
            Quiz / thi thử: <Kbd>1</Kbd>–<Kbd>4</Kbd> chọn đáp án · <Kbd>←</Kbd> <Kbd>→</Kbd> chuyển câu · <Kbd>Enter</Kbd> câu tiếp
          </li>
          <li>
            Trang bài học: <Kbd>←</Kbd> <Kbd>→</Kbd> lật trang slide
          </li>
        </ul>
      </Card>
    </div>
  );
}
