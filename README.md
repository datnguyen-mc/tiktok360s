# Dây chuyền làm video tin tức cho TikTok

Một lệnh, ra một video dọc **90–120 giây** tổng hợp **10 tin** mới nhất: giọng đọc tiếng
Việt, phụ đề chạy theo từng chữ, ảnh từ chính bài báo, và caption sẵn để đăng.

```
make video                  # showbiz
make video TOPIC=bongda     # bóng đá
```

Mỗi **chủ đề** là một kênh riêng: nguồn tin riêng, từ khoá riêng, nhận diện riêng, giọng
văn riêng. Thêm chủ đề chỉ cần thêm một file JSON — hoặc bấm nút trong CMS.

Mỗi lần chạy mất khoảng **1 phút** và **không tốn một đồng nào** — xem mục
[Không cần API key](#không-cần-api-key) bên dưới.

## Kết quả nhận được

```
output/showbiz/2026-09-21/
├── 2026-09-21-showbiz-tin-showbiz-21-09-10-tin-nong.mp4   1080×1920 · 117s · 16 MB
├── thumbnail.jpg                                   ảnh bìa gợi ý
├── caption.txt                                     caption + hashtag, dán thẳng khi đăng
├── script.json                                     kịch bản đầy đủ, sửa tay rồi render lại được
└── sources.txt                                     link nguồn từng tin, dùng để ghi credit
```

## Không cần API key

Không có bất kỳ khoá, token hay tài khoản trả phí nào trong dự án này:

| Việc | Công cụ | Chi phí | Khoá |
|---|---|---|---|
| Lấy tin | RSS công khai của 6 báo | miễn phí | không |
| Bảng điều khiển | Laravel + MySQL chạy tại máy | miễn phí | không |
| Giọng đọc | `edge-tts` (dịch vụ giọng của Microsoft Edge) | miễn phí | **không** |
| Dựng hình | `Pillow` chạy tại máy | miễn phí | không |
| Ghép video | `ffmpeg` chạy tại máy | miễn phí | không |

Hai thứ **cần khoá, nhưng chỉ khi bạn muốn dùng**: đăng bài TikTok (khoá lấy miễn phí ở
developers.tiktok.com) và đăng nhập Google (khoá miễn phí ở Google Cloud Console).
Cả hai đều không bắt buộc — dây chuyền tạo video chạy được mà không cần khoá nào.

`edge-tts` gọi thẳng tới dịch vụ giọng đọc mà trình duyệt Edge dùng cho tính năng đọc to,
không qua Azure và không cần đăng ký. Đổi lại, đây là **cổng không chính thức**: Microsoft
có thể đổi hoặc đóng bất cứ lúc nào. Khi đó phương án thay thế là lệnh `say` có sẵn của
macOS (chất lượng thấp hơn) hoặc một dịch vụ giọng đọc trả phí.

Mọi thiết lập nằm ở **một file duy nhất: [config.json](config.json)** ở thư mục gốc.

## Chủ đề kênh

Mỗi chủ đề là một file trong [topics/](topics/):

| Chủ đề | Nguồn tin | Cách lọc | Giọng văn |
|---|---|---|---|
| `showbiz` | 6 báo, feed giải trí riêng | không cần lọc | miền Tây |
| `bongda` | 6 báo, feed thể thao chung | lọc bằng 53 từ khoá bóng đá | lém lỉnh, nhanh |
| `chomeo` | **không có** — kịch bản viết tay | — | kể chuyện |

Bóng đá phải lọc vì **không báo nào có feed riêng cho bóng đá** — chỉ có feed "thể thao"
chung, trong đó khoảng một nửa là bóng đá, còn lại là bóng chuyền, điền kinh, cờ vua.
Nên chủ đề có hai danh sách: `require_keywords` (phải có ít nhất một) và
`exclude_keywords` (xét trước, thắng mọi từ khoá khác — vì "đội tuyển bóng chuyền" khớp
cả hai bên).

Thêm chủ đề mới:

```bash
# Cách 1 — trong CMS: mục Chủ đề kênh → Thêm chủ đề (chép từ chủ đề sẵn có rồi sửa)
# Cách 2 — chép tay:
cp topics/bongda.json topics/amnhac.json   # rồi sửa nguồn tin, từ khoá, nhận diện
make video TOPIC=amnhac
```

Video của mỗi chủ đề nằm riêng ở `output/<chủ đề>/<ngày>/`.

**`chomeo` chạy khác hai chủ đề kia.** Đây là kênh phim hoạt hình nhiều tập, không lấy tin
từ RSS nên `make video TOPIC=chomeo` sẽ không tìm được gì. Mỗi tập là một kịch bản viết
tay, render bằng `--script`:

```bash
.venv/bin/python -m pipeline.run_daily --topic chomeo --script duong/dan/script.json
```

Kế hoạch 40 tập, bản mô tả nhân vật và mẫu kịch bản:
[content/05-series-cho-meo-40-tap.md](content/05-series-cho-meo-40-tap.md) ·
[kịch bản mẫu tập 1](content/kichban-mau-tap-01.json).

## Dây chuyền chạy qua 5 bước

| Bước | Việc | File | Chạy riêng |
|---|---|---|---|
| **B1** | Đọc RSS 6 báo, lọc tin trùng, chấm điểm độ hot | [fetch_news.py](pipeline/fetch_news.py) | `make news` |
| **B2** | Dựng kịch bản, canh đúng khung 90–120s | [script_builder.py](pipeline/script_builder.py) | `make script` |
| **B3** | Sinh giọng đọc, lấy mốc thời gian **từng chữ** | [tts.py](pipeline/tts.py) | — |
| **B4** | Dựng hình bằng Pillow: nền, thẻ ảnh, phụ đề karaoke | [visuals.py](pipeline/visuals.py) | — |
| **B5** | Ghép bằng ffmpeg: zoom nền, phủ lớp, trộn tiếng | [render.py](pipeline/render.py) | — |

Bốn quyết định thiết kế đáng nói:

**Thời lượng tự hiệu chỉnh.** Sau mỗi lần render, kết quả thật (số âm tiết, số cảnh, thời
lượng) được ghi vào `output/.timing.json`, rồi hai tham số `tốc độ đọc` và `nghỉ mỗi đoạn`
được khớp lại bằng bình phương tối thiểu — xem [timing.py](pipeline/timing.py). Hằng số
cố định không sống nổi qua một lần đổi giọng hay đổi số tin; cách này thì càng chạy càng
chính xác. Hiện sai số dưới 1 giây. Lịch sử tách riêng theo từng giọng, nên đổi giọng
không làm hỏng số liệu của giọng cũ.

**Giữ đủ số tin là ưu tiên cao nhất.** Khi kịch bản quá dài, thứ tự hy sinh là: bỏ câu cảm
thán → bỏ câu chi tiết → rút gọn tiêu đề → và chỉ khi hết cách mới bỏ bớt tin, mà cũng
không bao giờ xuống dưới `min_items_per_video`.

**Phụ đề bám theo mốc từng chữ.** edge-tts trả về thời điểm bắt đầu và độ dài của mỗi chữ,
nên phụ đề tô sáng đúng chữ đang được đọc. Cần bật `boundary="WordBoundary"`, vì mặc định
thư viện chỉ trả mốc theo câu.

**Chữ vẽ bằng Pillow, không dùng `drawtext` của ffmpeg.** Bản ffmpeg từ Homebrew thường
không kèm freetype/libass nên không có `drawtext` lẫn `subtitles`. Vẽ bằng Pillow vừa tránh
phụ thuộc đó, vừa cho phép bo góc, đổ bóng và viền chữ dày. ffmpeg chỉ lo chuyển động và
ghép lớp.

## Cài đặt

```bash
bash setup.sh      # hoặc: make setup
```

Cài ffmpeg (qua Homebrew), tạo môi trường Python, tải font Be Vietnam Pro, thử kết nối
tới dịch vụ giọng đọc. Yêu cầu: macOS có Homebrew, Python 3.10 trở lên.

## Dùng hằng ngày

```bash
make video                 # chạy trọn quy trình, ra video hôm nay
make script                # chỉ dựng kịch bản để duyệt trước, chưa render
make rerender              # render lại sau khi sửa tay script.json
make news                  # xem bảng xếp hạng tin, không tạo video
make voices                # nghe thử tất cả giọng đọc được tiếng Việt
make calibrate             # xem tham số thời lượng và sai số qua các lần render
make open                  # mở thư mục kết quả hôm nay
```

### Làm video cho một ngày cụ thể

```bash
.venv/bin/python -m pipeline.run_daily --date 2026-09-20
```

Ngày tính theo **giờ Việt Nam (UTC+7)**, định dạng `YYYY-MM-DD`. Pipeline sẽ nới cửa sổ
tải RSS cho đủ chạm tới ngày đó rồi lọc đúng những tin đăng trong ngày.

**Giới hạn thật:** RSS của báo chỉ giữ tin vài ngày gần nhất. Lùi 1–2 ngày thì gần như
luôn được; lùi một tuần trở lên thì thường không còn tin nào và pipeline sẽ báo lỗi rõ
ràng thay vì làm ra video rỗng. Muốn lấy tin cũ hơn thì phải đọc trang lưu trữ của báo,
việc đó nằm ngoài phạm vi hiện tại.

### Tuỳ chọn khác

```bash
.venv/bin/python -m pipeline.run_daily --items 15                     # 15 tin (cũng là mức sàn)
.venv/bin/python -m pipeline.run_daily --voice vi-VN-NamMinhNeural    # đổi giọng
.venv/bin/python -m pipeline.run_daily --script-only                  # chỉ dựng kịch bản
.venv/bin/python -m pipeline.run_daily --keep-work                    # giữ file trung gian
```

## Giọng đọc

edge-tts chỉ có **2 giọng chuyên tiếng Việt** (`vi-VN-HoaiMyNeural` nữ,
`vi-VN-NamMinhNeural` nam), nhưng **12 giọng đa ngữ** cũng đọc được tiếng Việt và thường
giàu ngữ điệu hơn — đổi lại có thể sai dấu thanh ở tên riêng.

```bash
make voices
```

Lệnh này đọc **cùng một đoạn tin** bằng cả 14 giọng, ghép thành
`output/_voices/so-sanh.mp3` có lời xướng số thứ tự, để nghe một lượt rồi chọn. Chọn xong
thì đặt `voice.id` trong [config.json](config.json).

**Không có giọng miền Nam hay miền Tây.** Cả hai giọng tiếng Việt đều phát âm theo chuẩn
phổ thông. Chất vùng miền trong kênh này đến từ **cách dùng từ**, không phải ngữ âm —
xem mục kế tiếp.

## Giọng văn kịch bản

[styles.py](pipeline/styles.py) có hai giọng văn, đổi bằng `script.style` trong config:

| `style` | Chất | Ví dụ câu mở |
|---|---|---|
| `chuan` | trung tính, đưa tin gọn | "Showbiz ngày 21 tháng 9, 10 tin nóng nhất, gói gọn trong hai phút." |
| `mien_tay` | thân mật, hài nhẹ | "Mèn đét ơi, bữa nay showbiz có tới mười chuyện, coi liền cho nóng nghen bà con." |

Giọng văn chỉ tác động vào **câu mở, lời dẫn, câu cảm thán và câu chốt**. Câu tin giữ
nguyên văn từ báo, để nội dung không bị bóp méo theo phong cách.

Hai cơ chế giữ cho phần hài không phản tác dụng:

- **Không đùa trên tin nặng.** Tin có dấu hiệu tang thương, bệnh tật, pháp lý, xin lỗi
  sẽ không được chèn câu cảm thán (`KHONG_PHA_TRO` trong styles.py).
- **Câu cảm thán bám nội dung.** Tin được xếp nhóm theo từ khoá (cưới hỏi, chia tay, tranh
  cãi, thành tích, nhan sắc, phim, âm nhạc) rồi mới chọn câu cho đúng nhóm. Tin tiêu cực
  được xét trước tin vui, nên một tin vừa có "đám cưới" vừa có "gạch đá" sẽ không bị chúc
  mừng nhầm.

## Chỉnh theo ý mình

Tất cả nằm trong [config.json](config.json):

| Mục | Đổi gì |
|---|---|
| `video.target_min_sec` / `target_max_sec` | khung thời lượng (đang 90–120s) |
| `video.min_scene_sec` | thời gian tối thiểu mỗi cảnh, cảnh ngắn hơn sẽ được giữ thêm |
| `voice.id` | giọng đọc — chạy `make voices` để nghe thử |
| `voice.rate` | tốc độ đọc (đang `+25%`, khá nhanh và có năng lượng) |
| `voice.rate_min_pct` / `rate_max_pct` | biên tốc độ mà khâu canh thời lượng được phép chỉnh |
| `script.items_per_video` | số tin mỗi video |
| `script.min_items_per_video` | **sàn cứng** — không bao giờ xuống dưới mức này |
| `script.reaction_every` | cứ mỗi N tin hợp lệ thì chèn 1 câu cảm thán |
| `script.max_detail_sentences` | trần câu chi tiết mỗi tin, giữ các cảnh dài xấp xỉ nhau |
| `captions` | cỡ chữ, màu tô sáng, số chữ mỗi cụm phụ đề |

Những thứ riêng của từng chủ đề nằm trong `topics/<chủ đề>.json`, sửa được cả trong CMS:

| Mục | Đổi gì |
|---|---|
| `brand` | tên kênh, @handle, màu nhấn hiện trên video |
| `sources` | thêm/bớt báo, đổi trọng số ưu tiên |
| `ranking.require_keywords` | tin phải có ít nhất một từ mới được nhận |
| `ranking.exclude_keywords` | loại thẳng, xét trước mọi từ khoá khác |
| `ranking.hot_keywords` | từ khoá đẩy tin lên cao |
| `ranking.block_keywords` | từ khoá loại tin không muốn đăng |
| `hashtags` | bộ thẻ mặc định |
| `styles` | câu mở, lời dẫn, câu cảm thán, câu chốt |
| `nhom_tu_khoa` | xếp tin vào nhóm để chọn câu cảm thán cho hợp |

Bố cục hình (toạ độ, cỡ chữ, vùng an toàn) nằm ở đầu file
[pipeline/visuals.py](pipeline/visuals.py).

Đổi giọng hoặc đổi tốc độ thì **không phải chỉnh gì thêm** — render 2 lần là tham số thời
lượng tự khớp lại theo giọng mới.

## Chạy tự động mỗi sáng

```bash
bash automation/install-launchd.sh
```

Cài lịch macOS chạy 7:30 sáng hằng ngày, xong thì hiện thông báo. Gỡ bằng
`bash automation/install-launchd.sh --uninstall`. Log ở `logs/<ngày>.log`.

> Lệnh này ghi một file vào `~/Library/LaunchAgents/` và nạp vào hệ thống — chạy khi bạn
> đã sẵn sàng để máy tự tạo video mỗi sáng.

## Bảng điều khiển CMS

Dây chuyền chạy được một mình, nhưng sau vài tuần thì không ai nhớ nổi video nào đã đăng
hay hôm đó dùng tin gì. [cms/](cms/) là một ứng dụng Laravel 12 + Vue 3 + MySQL lưu lại
toàn bộ và cho đăng lên TikTok ngay từ giao diện.

```bash
make cms-up        # http://localhost:8000 · admin@showbiz.local / showbiz2026
make cms-backfill  # nạp các video đã render trước đó vào CMS
```

Có gì:

- **Theo dõi** — mọi lần chạy, từng tin đã dùng kèm nguồn, sai số giữa thời lượng ước
  lượng và thực tế, biểu đồ 30 ngày.
- **Xem lại** — phát video ngay trong trình duyệt, bấm vào một tin là tua tới đúng cảnh.
- **Đăng TikTok** — kết nối nhiều kênh, đăng tay hoặc tự động theo giờ cho từng kênh.
  Job thất bại thì bấm **Thử lại** ngay ở trang chi tiết video, không phải sang mục Đăng bài.
- **Đăng nhập** — email + mật khẩu, Google OAuth, và xác thực hai lớp bằng mã OTP.
- **Engine tạo video** — bấm nút để chạy dây chuyền này, hoặc trỏ sang model dựng video
  riêng của bạn qua HTTP.
- **Tạo lại** — dựng lại một video đã có mà không phải khai lại thiết lập.
- **Cài đặt** — khoá TikTok và Google sửa ngay trên web, lưu mã hoá trong MySQL.

Dây chuyền tự đẩy dữ liệu sang CMS sau mỗi lần render. **CMS tắt cũng không sao** —
`pipeline/cms.py` chỉ in cảnh báo rồi đi tiếp, dữ liệu vẫn nằm trong `output/`.
Tắt hẳn bằng `--no-cms` hoặc đặt `cms.enabled = false` trong config.json.

### Tạo lại một video

Nút **Tạo lại** có ở cả danh sách Video và trang chi tiết. Mọi thiết lập lấy sẵn từ lần
chạy cũ — cùng chủ đề, cùng ngày, cùng số tin, cùng giọng, cùng engine và cùng prompt —
nên chỉ cần chọn cách tạo lại:

| Cách | Làm gì | Chi phí |
|---|---|---|
| mặc định | Lấy tin mới, dựng kịch bản mới | có sinh cảnh AI thì tính tiền lại |
| **Dùng lại kịch bản cũ** | Đọc và ghép lại từ `script.json` đã lưu, không lấy tin mới | như trên |
| **Không sinh lại cảnh AI** | Quay về dùng ảnh từ bài báo | miễn phí |

Hai điều đáng biết trước khi bấm:

- **Bản ghi cũ bị ghi đè, không tạo dòng mới.** Đường nạp dữ liệu khớp theo (chủ đề +
  ngày) nên một chủ đề một ngày chỉ có một video. Không hoàn lại được.
- **Seed được đổi mỗi lần tạo lại.** Seed mặc định là số thứ tự của ngày, nên cùng một
  ngày sẽ ra đúng một kịch bản như cũ — câu mở đầu, câu cảm thán y nguyên. Đổi seed thì
  lời mới thật sự khác lời cũ.

Ba trường hợp dùng nhiều nhất: lần trước rớt ở khâu giọng đọc (chọn *dùng lại kịch bản*);
vừa sửa tay `script.json` (cũng chọn *dùng lại kịch bản*); hoặc máy chọn nhầm tin, muốn
bốc lại (để mặc định).

Chi tiết: [cms/README.md](cms/README.md) ·
[lấy khoá TikTok](cms/docs/tiktok-setup.md) ·
[bật đăng nhập Google](cms/docs/google-setup.md)

## Lưu video lên Cloudflare R2

Mặc định video chỉ nằm trong `output/` trên máy chạy dây chuyền. Bật R2 thì mỗi lần render
xong, video và ảnh bìa được đẩy thẳng lên bucket, và CMS lưu lại URL.

Vì sao cần: CMS chạy trên máy khác thì không đọc được `output/`; và khi dọn máy để lấy chỗ
trống, video cũ vẫn xem lại và đăng lại được.

**Bước 1 — phần công khai**, sửa trong `config.json` (file này có trong git):

```json
"r2": {
  "enabled": true,
  "bucket": "ten-bucket",
  "endpoint": "https://<account_id>.r2.cloudflarestorage.com",
  "public_url": "https://cdn.tenmiencuaban.com",
  "prefix": "videos"
}
```

**Bước 2 — khoá bí mật**, chỉ đặt trong `cms/.env` (file này **không** vào git):

```
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
```

Lấy khoá ở Cloudflare Dashboard → R2 → Manage API Tokens. Đặt vào biến môi trường cũng
được, biến môi trường thắng file .env.

**Bước 3 — kiểm tra rồi chạy:**

```bash
make r2-check TOPIC=chomeo     # báo còn thiếu gì, in thử một URL mẫu
make video TOPIC=bongda        # render xong là tự tải lên
make r2-push TOPIC=bongda DATE=2026-09-21   # nạp lên video đã render từ trước
```

Vài điểm đáng biết:

- **Thiếu khoá thì bỏ qua, không gãy.** Giống nguyên tắc với CMS: hạ tầng phụ hỏng thì
  video vẫn phải ra. File vẫn nằm nguyên trong `output/`, nạp lên sau lúc nào cũng được.
- **Đường dẫn trên bucket** là `videos/<chủ đề>/<ngày>/<tên file>`, trùng cấu trúc `output/`.
- **CMS ưu tiên file trên máy**, chỉ chuyển hướng sang R2 khi file cục bộ không còn — đọc
  tại chỗ nhanh hơn và không tốn băng thông.
- **Đăng TikTok vẫn chạy** khi máy đã xoá file: `PublishService` tự kéo bản trên R2 về thư
  mục tạm rồi tải lên, vì TikTok chỉ nhận file chứ không nhận URL.
- `--no-r2` để bỏ qua bước tải lên cho một lần chạy.
- R2 là **kho file**, không phải cơ sở dữ liệu. Toàn bộ số liệu (lần chạy, tin, job đăng
  bài) vẫn nằm trong MySQL của CMS như cũ.

## Đưa lên máy chủ

Toàn bộ hệ thống đóng gói bằng Docker. Máy chủ Ubuntu/Debian trống, tên miền đã trỏ về IP:

```bash
sudo bash deploy/install-vps.sh --domain showbiz.vidu.vn --email ban@vidu.vn --monitoring
```

Một lệnh làm hết: cài Docker → mở tường lửa → tạo swap nếu RAM thiếu → sinh mật khẩu
ngẫu nhiên → build → khởi động → HTTPS tự động qua Let's Encrypt → tạo tài khoản quản trị.

Kèm `--monitoring` thì có thêm Prometheus + Grafana + Loki, với dashboard đo **việc của
hệ thống** chứ không chỉ CPU: hôm nay có ra video không, đăng bài có lỗi không, model AI
đang tốn bao nhiêu. Tám cảnh báo dựng sẵn, gồm cả cảnh báo vượt ngân sách AI.

Cấu hình tối thiểu: 2 CPU, 4GB RAM, 40GB đĩa. Chi tiết: [deploy/README.md](deploy/README.md)

## Phần nội dung

Kỹ thuật chỉ là một nửa. Nửa còn lại nằm trong [content/](content/):

- [Chiến lược kênh](content/00-chien-luoc-kenh.md) — định vị, 5 trụ nội dung, nhịp đăng, chỉ số cần theo
- [Công thức hook](content/01-cong-thuc-hook.md) — các mẫu câu mở đầu, câu giữ chân, câu chốt
- [Kịch bản mẫu](content/02-kich-ban-mau.md) — khung thời lượng chuẩn và 5 định dạng dùng ngay
- [Caption & hashtag](content/03-caption-hashtag.md) — cấu trúc caption, ba tầng hashtag, vùng an toàn
- [Quy trình hằng ngày](content/04-quy-trinh-hang-ngay.md) — checklist, nguyên tắc nguồn tin, xử lý sự cố
- [Series chó mèo 40 tập](content/05-series-cho-meo-40-tap.md) — kế hoạch từng tập, nhân vật, chi phí sinh cảnh AI

Đọc trước [quy trình hằng ngày](content/04-quy-trinh-hang-ngay.md) — trong đó có phần
nguyên tắc về nguồn tin và bản quyền ảnh, là thứ quyết định kênh trụ được lâu hay không.

## Giới hạn cần biết

- **Ảnh lấy từ RSS của báo** nên thuộc bản quyền của báo. Pipeline luôn hiện badge ghi
  nguồn, nhưng ghi nguồn không thay được giấy phép.
- **Kịch bản ghép từ tiêu đề và sapo**, không đọc nội dung bài. Tin nào chỉ có tiêu đề sẽ
  nghe mỏng — đây là chỗ cần người sửa tay mỗi ngày vài phút.
- **Bộ lọc tin nhạy cảm chạy theo từ khoá**, không hiểu ngữ cảnh. Vẫn phải duyệt bằng mắt
  trước khi đăng.
- **`--date` chỉ lùi được 1–2 ngày**, vì RSS không giữ tin cũ.
