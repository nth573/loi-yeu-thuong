// Vercel Serverless Function: nhận 1 ảnh JPEG (đã nén ở trình duyệt), đưa lên nơi lưu ảnh, trả về URL công khai.
// Thử lần lượt: imgbb (nếu đặt biến môi trường IMGBB_KEY) -> catbox.moe -> freeimage.host.
// Chỉ chạy khi deploy lên Vercel. Các nơi chỉ host file tĩnh sẽ không có hàm này.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

async function viaImgbb(buf) {
  const key = process.env.IMGBB_KEY;
  if (!key) throw new Error('imgbb: chưa đặt IMGBB_KEY');
  const form = new FormData();
  form.append('image', new Blob([buf], { type: 'image/jpeg' }), 'photo.jpg');
  const r = await fetch('https://api.imgbb.com/1/upload?key=' + encodeURIComponent(key), { method: 'POST', body: form });
  const t = await r.text();
  let j = {};
  try { j = JSON.parse(t); } catch (e) {}
  const url = j && j.data && (j.data.url || (j.data.image && j.data.image.url));
  if (!url || !/^https:\/\//.test(url)) throw new Error('imgbb ' + r.status + ': ' + t.slice(0, 80));
  return url;
}

async function viaCatbox(buf) {
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', new Blob([buf], { type: 'image/jpeg' }), 'photo.jpg');
  const r = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form, headers: { 'User-Agent': UA } });
  const t = (await r.text()).trim();
  if (!/^https:\/\/files\.catbox\.moe\/[\w.-]+$/.test(t)) throw new Error('catbox ' + r.status + ': ' + t.replace(/\s+/g, ' ').slice(0, 80));
  return t;
}

async function viaFreeimage(buf) {
  const form = new FormData();
  form.append('key', '6d207e02198a847aa98d0a2a901485a5'); // khóa công khai của freeimage.host
  form.append('action', 'upload');
  form.append('format', 'json');
  form.append('source', new Blob([buf], { type: 'image/jpeg' }), 'photo.jpg');
  const r = await fetch('https://freeimage.host/api/1/upload', { method: 'POST', body: form, headers: { 'User-Agent': UA } });
  const t = await r.text();
  let j = {};
  try { j = JSON.parse(t); } catch (e) {}
  const url = j && j.image && j.image.url;
  if (!url || !/^https:\/\//.test(url)) throw new Error('freeimage ' + r.status + ': ' + t.replace(/\s+/g, ' ').slice(0, 80));
  return url;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Chỉ nhận POST' });

  // Chỉ cho phép gọi từ chính trang của bạn (tránh người lạ dùng ké hàm tải ảnh)
  const origin = req.headers.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.host) return res.status(403).json({ error: 'Không được phép' });
    } catch (e) {
      return res.status(403).json({ error: 'Không được phép' });
    }
  }

  const MAX = 4 * 1024 * 1024; // giới hạn body của Vercel là 4.5MB
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > MAX) return res.status(413).json({ error: 'Ảnh quá lớn' });
    chunks.push(c);
  }
  const buf = Buffer.concat(chunks);
  if (buf.length < 100 || buf[0] !== 0xff || buf[1] !== 0xd8) {
    return res.status(400).json({ error: 'Chỉ nhận ảnh JPEG' });
  }

  const errors = [];
  for (const fn of [viaImgbb, viaCatbox, viaFreeimage]) {
    try {
      const url = await fn(buf);
      return res.status(200).json({ url });
    } catch (e) {
      errors.push(e.message);
    }
  }
  return res.status(502).json({ error: 'Không đưa ảnh lên được: ' + errors.join(' | ') });
};

module.exports.config = { api: { bodyParser: false } };
