import { useState } from 'react';

export default function App() {
  const [hex, setHex] = useState('48656c6c6f20576f726c6421'); // Hello World!
  const [enc, setEnc] = useState('utf8');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleDecode(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Nếu đã config proxy, gọi thẳng /api...
      const url = `/api/decode?hex=${encodeURIComponent(hex)}&enc=${encodeURIComponent(enc)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Decode thất bại');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Không kết nối được server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h1>🔎 Hex Decoder</h1>
      <p>Nhập chuỗi hex (có thể chứa khoảng trắng, <code>0x</code>, dấu <code>:</code>, <code>,</code>) → trả về text.</p>

      <form onSubmit={handleDecode} style={{ display: 'grid', gap: 12 }}>
        <label>
          Hex:
          <textarea
            rows={4}
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            placeholder="48656c6c6f..."
            style={{ width: '100%', fontFamily: 'monospace', fontSize: 14 }}
          />
        </label>

        <label>
          Encoding:&nbsp;
          <select value={enc} onChange={(e) => setEnc(e.target.value)}>
            <option value="utf8">utf8 (mặc định)</option>
            <option value="ascii">ascii</option>
            <option value="latin1">latin1</option>
            <option value="utf16le">utf16le</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #ccc', cursor: 'pointer' }}
        >
          {loading ? 'Đang decode...' : 'Decode'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: 16, padding: 12, background: '#ffeaea', border: '1px solid #f5c2c7', borderRadius: 8 }}>
          ❌ {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16, padding: 12, background: 'rgb(60 60 60)', border: '1px solid #d0d7de', borderRadius: 8 }}>
          <h2>Kết quả</h2>
          <p><b>Encoding:</b> {result.encoding}</p>
          <p><b>Số byte:</b> {result.bytes}</p>
          <p><b>Text:</b></p>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{result.text}</pre>
          <details style={{ marginTop: 8 }}>
            <summary>Chi tiết (hex sạch)</summary>
            <code style={{ wordBreak: 'break-all' }}>{result.hexNormalized}</code>
          </details>
        </div>
      )}
    </div>
  );
}
