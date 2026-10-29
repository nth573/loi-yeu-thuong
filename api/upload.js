// Vercel Serverless Function: nhận 1 ảnh JPEG (đã nén ở trình duyệt), đưa lên catbox.moe, trả về URL công khai.
// Chỉ chạy khi deploy lên Vercel. Các nơi chỉ host file tĩnh sẽ không có hàm này.
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

  try {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', new Blob([buf], { type: 'image/jpeg' }), 'photo.jpg');
    const r = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form });
    const url = (await r.text()).trim();
    if (!/^https:\/\/files\.catbox\.moe\/[\w.-]+$/.test(url)) {
      return res.status(502).json({ error: 'Nơi lưu ảnh trả về kết quả lạ' });
    }
    return res.status(200).json({ url });
  } catch (e) {
    return res.status(502).json({ error: 'Không kết nối được nơi lưu ảnh' });
  }
};

module.exports.config = { api: { bodyParser: false } };
