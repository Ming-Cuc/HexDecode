import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

const STORAGE_FILE = path.join(process.cwd(), 'storage.json');

// Helper để đọc & ghi file JSON
function readStorage() {
  if (!fs.existsSync(STORAGE_FILE)) return [];
  const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
  return JSON.parse(data || '[]');
}

function writeStorage(data) {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
}

// API decode hex (UTF-8 only)
app.get('/api/decode', (req, res) => {
  const { hex } = req.query;
  if (!hex) return res.status(400).json({ ok: false, error: 'Thiếu hex' });

  try {
    const buf = Buffer.from(hex.replace(/\s+/g, ''), 'hex');
    const text = buf.toString('utf8');
    res.json({ ok: true, text });
  } catch (err) {
    res.status(400).json({ ok: false, error: 'Hex không hợp lệ' });
  }
});

// API lấy danh sách lưu trữ
app.get('/api/storage', (req, res) => {
  const data = readStorage();
  res.json(data);
});

// API lưu text mới
app.post('/api/storage', (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ ok: false, error: 'Thiếu text' });

  const data = readStorage();
  const newItem = { id: Date.now(), text };
  data.push(newItem);
  writeStorage(data);

  res.json({ ok: true, item: newItem });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server chạy ở http://localhost:${PORT}`);
});
