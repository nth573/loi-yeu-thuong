# Lời yêu thương – trang tạo link (không cần mua domain)

## Gồm những gì
- `index.html`  : form tạo link (kiểu, tiêu đề, lời chúc, mã 4 số, ảnh, nhạc)
- `view.html`   : trang người nhận mở ra (trái tim hạt hoặc bó hoa, ảnh bay, nhạc)
- `api/upload.js`: hàm nhận ảnh từ form, đưa lên catbox.moe, trả về link ảnh (chỉ chạy trên Vercel)
- `tinhyeu_link.py`: hàm Python tạo link giống hệt form, để làm lệnh trong bot Zalo sau này

Nội dung (lời chúc, link ảnh, link nhạc, mã) được mã hóa thẳng vào link `view.html?d=...`,
nên không cần cơ sở dữ liệu hay máy chủ riêng.

## Đưa lên mạng bằng Vercel (miễn phí, có tên miền dạng ten-ban.vercel.app)
Cách 1 – qua GitHub (dễ nhất, không cần cài gì):
1. Tạo repo mới trên github.com, tải toàn bộ file trong thư mục này lên (giữ nguyên thư mục `api`).
2. Vào vercel.com, đăng nhập bằng GitHub, chọn Add New > Project, chọn repo vừa tạo, bấm Deploy.
3. Xong, Vercel cho bạn link dạng `https://ten-repo.vercel.app`. Mở link đó là thấy form.

Cách 2 – bằng dòng lệnh (máy có Node.js): chạy `npx vercel` trong thư mục này, trả lời các câu hỏi, rồi `npx vercel --prod`.

## Nếu dùng nơi chỉ host file tĩnh (Netlify Drop, Cloudflare Pages, GitHub Pages)
Form và trang xem vẫn chạy bình thường. Chỉ không có nút tải ảnh tự động (thiếu `/api/upload`).
Khi đó dán link ảnh vào ô "Hoặc dán link ảnh" (ví dụ ảnh đã tải lên catbox.moe).

## Lưu ý
- Ảnh tải lên catbox.moe là công khai, ai có link ảnh đều xem được. Đừng đưa ảnh nhạy cảm.
- Mã 4 số chỉ là khóa cho vui, vì mã nằm trong link.
- Nhạc: cần link trực tiếp tới file .mp3 (mở được trên trình duyệt). Điện thoại chỉ phát nhạc sau khi người nhận chạm vào màn hình.
- Link dài khoảng 400 đến 900 ký tự, gửi qua Zalo bình thường.
