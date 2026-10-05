# Giọng đọc

Dùng **edge-tts** của Microsoft. Miễn phí, không cần khoá API.

```json
"voice": {
  "id": "vi-VN-NamMinhNeural",
  "rate": "+10%", "pitch": "-8Hz", "volume": "+0%",
  "rate_min_pct": 0, "rate_max_pct": 25
}
```

Hai giọng tiếng Việt, đó là tất cả những gì dịch vụ có:

| giọng | |
|---|---|
| `vi-VN-NamMinhNeural` | nam — dùng cho clb, dialy |
| `vi-VN-HoaiMyNeural` | nữ — dùng cho bongda, showbiz, drama, chomeo |

Phân biệt các kênh bằng `rate` và `pitch`. Hai kênh cùng giọng mà cùng tốc độ
thì nghe y hệt nhau.

## Vì sao không dùng Gemini TTS

Đã thử rồi bỏ. Gemini có hơn ba chục giọng, nhưng:

- **Tính tiền theo token.** edge-tts không mất gì.
- **Không trả mốc thời gian từng chữ.** Phụ đề của dây chuyền chạy theo từng
  chữ nên phải tự ước lượng từ độ dài audio — sai số dưới hai phần mười giây
  trong một cảnh, nhưng vẫn là ước lượng. edge-tts trả mốc thật.
- **Không ra lệnh ngữ điệu được.** Model `gemini-3.8-flash-tts` đọc nguyên văn
  mọi thứ gửi lên, kể cả câu chỉ dẫn: cùng một câu 10 chữ, kèm chỉ dẫn 18 chữ
  thì audio dài 10,6s thay vì 4,2s — câu chỉ dẫn bị đọc thành lời ở đầu mỗi
  cảnh. Tách bằng dấu hai chấm hay viết ngắn bằng tiếng Anh đều không cứu được;
  `systemInstruction` thì trả về `400 Developer instruction is not enabled`.

Mã nguồn phần đó đã gỡ (`pipeline/tts_gemini.py`). Cần lại thì xem lịch sử git.

## Thời lượng

`pipeline/timing.py` khớp lại tham số sau mỗi lần render, theo **từng giọng**
(`khoa_giong()` lấy `voice.id` làm khoá). Lịch sử đo nằm ở `output/.timing.json`,
giữ 40 mẫu gần nhất.

Lệch khung thì khâu đọc tự thử lại với `rate` khác, tối đa ba lần — edge-tts
nhận tham số tốc độ ngay lúc sinh nên không cần chỉnh nhịp audio sau.
