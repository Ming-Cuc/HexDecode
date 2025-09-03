import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());           // Cho phép gọi từ frontend khác cổng
app.use(express.json());   // Để đọc JSON body nếu cần

// Helper: làm sạch và kiểm tra chuỗi hex
function sanitizeHex(input) {
  if (typeof input !== 'string') return null;
  // Loại "0x", khoảng trắng, dấu :, , ; xuống dòng
  const cleaned = input
    .replace(/0x/gi, '')
    .replace(/[\s:,;]+/g, '')
    .trim();

  if (cleaned.length === 0) return null;
  if (cleaned.length % 2 !== 0) return { error: 'Độ dài hex phải là số chẵn (mỗi byte = 2 ký tự hex).' };
  if (!/^[0-9a-fA-F]+$/.test(cleaned)) return { error: 'Chuỗi có ký tự không phải hex (0-9, a-f).' };

  return cleaned.toLowerCase();
}

// Hỗ trợ một vài encoding phổ biến
const ALLOWED_ENCODINGS = new Set(['utf8', 'ascii', 'latin1', 'utf16le']);

app.get('/api/decode', (req, res) => {
  const { hex, enc = 'utf8' } = req.query;

  // Kiểm tra encoding
  const encoding = String(enc).toLowerCase();
  if (!ALLOWED_ENCODINGS.has(encoding)) {
    return res.status(400).json({
      ok: false,
      error: `Encoding không hỗ trợ. Dùng một trong: ${[...ALLOWED_ENCODINGS].join(', ')}`
    });
  }

  const cleaned = sanitizeHex(hex);
  if (!cleaned) {
    return res.status(400).json({
      ok: false,
      error: 'Thiếu hoặc sai định dạng tham số "hex".'
    });
  }
  if (typeof cleaned === 'object' && cleaned.error) {
    return res.status(400).json({ ok: false, error: cleaned.error });
  }

  try {
    const buf = Buffer.from(cleaned, 'hex');

    // Thử decode ra text theo encoding yêu cầu
    const text = buf.toString(encoding);

    // Trả về thêm một số thông tin hữu ích
    return res.json({
      ok: true,
      input: hex,
      encoding,
      bytes: buf.length,
      text,
      hexNormalized: cleaned
    });
  } catch (err) {
    return res.status(400).json({ ok: false, error: 'Không decode được hex.' });
  }
});

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ API đang chạy tại http://localhost:${PORT}`);
  console.log(`   Ví dụ: http://localhost:${PORT}/api/decode?hex=48656c6c6f20`);
});
