# -*- coding: utf-8 -*-
"""Tạo link xem lời yêu thương từ Python (dùng cho lệnh trong bot Zalo).

Cách dùng:
    from tinhyeu_link import make_link
    link = make_link("https://ten-ban.vercel.app", "heart", "Chào em", "Anh yêu em",
                     images=["https://files.catbox.moe/abc.jpg"], pin="1234")
"""
import base64
import json


def make_link(base_url, style="heart", title="", message="", images=None, music=None, pin=None):
    """style: 'heart' (trái tim) hoặc 'flower' (bó hoa). Ảnh/nhạc phải là link http(s)."""
    data = {
        "v": 1,
        "s": "flower" if style == "flower" else "heart",
        "t": str(title)[:40],
        "m": str(message)[:320],
        "i": [u for u in (images or []) if str(u).startswith(("http://", "https://"))][:6],
    }
    if pin and str(pin).isdigit() and len(str(pin)) == 4:
        data["p"] = str(pin)
    if music and str(music).startswith(("http://", "https://")):
        data["a"] = music
    raw = json.dumps(data, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    token = base64.urlsafe_b64encode(raw).decode("ascii").rstrip("=")
    return f"{base_url.rstrip('/')}/view.html?d={token}"
