import { useState, useEffect } from "react";

// Định nghĩa kiểu cho item lưu trữ
interface StorageItem {
  id: string | number;
  text: string;
}

export default function App() {
  const [hex, setHex] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [storage, setStorage] = useState<StorageItem[]>([]);

  // Lấy danh sách lưu trữ khi mở app
  useEffect(() => {
    fetch("/api/storage")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setStorage(data);
      })
      .catch(() => {});
  }, []);

  async function handleDecode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setResult("");
    try {
      const res = await fetch(`/api/decode?hex=${encodeURIComponent(hex)}`);
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Decode thất bại");
      } else {
        setResult(data.text || "");
      }
    } catch {
      setError("Không kết nối được server");
    }
  }

  async function handleSave() {
    if (!result) return;
    const res = await fetch("/api/storage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: result }),
    });
    const data = await res.json();
    if (data.ok && data.item) {
      setStorage([...storage, data.item]);
    }
  }

  return (
    <div style={{ display: "flex", padding: 20, gap: 20 }}>
      {/* Khung decode */}
      <div style={{ flex: 1 }}>
        <h1>🔎 Hex Decoder</h1>
        <form onSubmit={handleDecode} style={{ display: "grid", gap: 10 }}>
          <textarea
            rows={4}
            placeholder="Nhập hex (ví dụ: 48656c6c6f20576f726c6421)"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            style={{ width: "100%", fontFamily: "monospace", resize: "vertical", wordBreak: "break-all", whiteSpace: "pre-wrap" }}
          />
          <button type="submit">Decode</button>
        </form>

        {error && <p style={{ color: "red" }}>❌ {error}</p>}

        {result && (
          <div style={{ marginTop: 20 }}>
            <h2>Kết quả:</h2>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", maxWidth: "100%", overflowWrap: "break-word" }}>{result}</pre>
            <button onClick={handleSave}>💾 Lưu vào kho</button>
          </div>
        )}
      </div>

      {/* Kho lưu trữ */}
      <div style={{ flex: 1, borderLeft: "1px solid #ccc", paddingLeft: 20 }}>
        <h2>📦 Kho lưu trữ</h2>
        {storage.length === 0 && <p>Chưa có dữ liệu</p>}
        <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
          {storage.map((item) => (
            <li key={item.id} style={{ marginBottom: 12 }}>
              <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", maxWidth: "100%", overflowWrap: "break-word" }}>{item.text}</pre>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
