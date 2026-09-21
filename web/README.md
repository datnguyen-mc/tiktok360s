# Tin360s — website tin tức

Trang tin tổng hợp: Laravel 12 + Inertia + Vue 3 **có SSR**, dùng chung cơ sở dữ liệu
với CMS video.

```bash
php artisan serve --port=8001      # web
php artisan inertia:start-ssr      # BẮT BUỘC cho SEO — xem bên dưới
npm run dev                        # khi sửa giao diện
```

<http://localhost:8001> · quản trị tại `/quan-tri` (dùng chung tài khoản với CMS video)

## SPA và SEO vốn chống nhau — cách giải

Một SPA thuần (Vue dựng ở trình duyệt) trả về `<div id="app"></div>` rỗng. Googlebot có
chạy JavaScript, nhưng xếp hàng riêng và chậm hơn nhiều — với trang tin, chậm vài ngày
là mất hết giá trị.

Đây là lý do chọn **Inertia + SSR**: máy chủ dựng sẵn HTML đầy đủ cho lần tải đầu, Vue
"gắn" vào rồi từ đó điều hướng mượt như SPA.

Số đo thực trên trang chủ:

| | Không có SSR | Có SSR |
|---|---:|---:|
| Dung lượng HTML | 1.153 byte | 42.820 byte |
| Thẻ title / description / canonical | không có | có |
| JSON-LD | không có | có |
| Tiêu đề bài trong HTML thô | 0 | 14 |

**Không chạy `inertia:start-ssr` thì website vẫn hoạt động nhưng mất toàn bộ SEO.**
Đưa lên máy chủ thì chạy nó dưới supervisor như một tiến trình thường trú.

## Những gì đã làm cho SEO

- **SSR** cho mọi trang công khai
- **Thẻ meta** đầy đủ: title, description, canonical, Open Graph, Twitter Card —
  gom trong [`app/Support/Seo.php`](app/Support/Seo.php) để không lệch nhau
- **JSON-LD**: `NewsArticle` cho bài, `BreadcrumbList` cho đường dẫn, `WebSite` +
  `SearchAction` cho trang chủ
- **sitemap.xml** chia nhỏ theo chỉ mục, kèm `<image:image>` cho từng bài
- **robots.txt** chặn `/quan-tri`, `/tim-kiem` và các trang `?page=` (trùng nội dung)
- **RSS** tại `/rss.xml`
- **noindex** cho trang tìm kiếm và trang 2 trở đi của chuyên mục
- **Đường dẫn tiếng Việt**: `/tin/<slug>`, `/chuyen-muc/<slug>`, `/tim-kiem`
- Ảnh đầu bài không lazy và có `fetchpriority="high"` (đó là phần tử LCP)

## Nội dung đến từ đâu

Hai đường, chạy song song:

1. **Dây chuyền video đẩy sang.** Mỗi ngày nó lấy khoảng 350 tin cho hai chủ đề nhưng
   chỉ dùng 20 để dựng video — phần còn lại trước đây bỏ đi, giờ vào thẳng website qua
   `POST /api/ingest/articles`.

2. **Website tự lấy.** Mỗi chuyên mục khai nguồn RSS riêng:

   ```bash
   php artisan news:fetch                       # tất cả chuyên mục
   php artisan news:fetch --category=cong-nghe  # một chuyên mục
   ```

   Chạy mỗi 30 phút qua scheduler. Nhờ cách này, chuyên mục Công nghệ hay Thế giới có
   tin mà **không cần dựng cả một chủ đề video** — việc quá nặng nếu chỉ để hiển thị tin.

**Chống trùng** bằng vân tay tiêu đề: bỏ dấu, bỏ hư từ, bỏ từ ngắn rồi sắp xếp. Cùng một
tin được năm báo giật năm kiểu tiêu đề thì website chỉ đăng một lần. Xem
`Article::fingerprint()`.

## Chuyên mục

| Chuyên mục | Nối chủ đề video | Nguồn |
|---|---|---|
| Showbiz | `showbiz` | VnExpress, Kenh14, Dân Trí, ZNews |
| Bóng đá | `bongda` | VnExpress, Dân Trí, ZNews — lọc từ feed thể thao chung |
| Công nghệ | — | VnExpress, Dân Trí, Thanh Niên, ZNews |
| Kinh doanh | — | VnExpress, Dân Trí, Thanh Niên |
| Thế giới | — | VnExpress, Dân Trí |
| Đời sống | — | VnExpress, Dân Trí |
| Sức khoẻ | — | VnExpress |

Thêm chuyên mục: `/quan-tri/chuyen-muc` → Thêm. Khai nguồn RSS trong cơ sở dữ liệu
(cột `sources`) rồi chạy `news:fetch`.

## Bố cục trang chủ

Khối đầu trang gồm **băng chuyền bên trái, cột "Tin nổi bật" (6 tiêu đề, không ảnh) bên
phải** — trang tin cần nhiều đầu mục trong tầm mắt đầu tiên, không phải một tấm ảnh
chiếm hết bề ngang. Băng chuyền tự chạy 6 giây, dừng khi rê chuột, vuốt được trên điện
thoại, và tắt tự chạy nếu máy bật *giảm chuyển động*.

Bên dưới chia **80% danh sách tin / 20% cột tin hot**, dùng **đúng tỉ lệ và khoảng cách
như khối đầu trang** để hai cột phải nằm trên một đường dọc — lệch vài chục pixel là mắt
thấy ngay. Trên màn hình lớn băng chuyền lấy chiều cao bằng cột bên cạnh (`lg:h-full`)
thay vì giữ tỉ lệ 16/9, nếu không sẽ hở một mảng đen dưới ảnh.

Danh sách tin dùng ảnh nhỏ nằm ngang thay vì lưới thẻ — lướt nhanh hơn và vừa nhiều tin
hơn trong cùng chiều cao màn hình. Mỗi chuyên mục hiện **6 tin**, xếp hai cột.

Mỗi tin kèm **lượt xem / thích / bình luận / chia sẻ** (`Stats.vue`). Lượt xem luôn hiện
vì đó là con số người đọc nhìn vào đầu tiên; ba chỉ số còn lại ẩn khi bằng 0 — một hàng
toàn số 0 nhìn rất buồn.

Băng chuyền ưu tiên bài cắm cờ *nổi bật* nhưng **chỉ lấy bài có ảnh**; thiếu thì tự bù
bằng tin mới nhất có ảnh, nên phần đầu trang chủ không bao giờ trống.

## Tài khoản độc giả

Đăng ký/đăng nhập công khai tại `/dang-ky` và `/dang-nhap`. Người đọc có tài khoản thì:

- **Thích** bài và thích từng bình luận
- **Lưu** bài, xem lại ở `/da-luu`
- **Bình luận**, trả lời một cấp (trả lời của trả lời gộp về bình luận gốc), tự xoá
  bình luận của mình
- Sửa tên, ảnh đại diện, giới thiệu ở `/tai-khoan`

Nút thích/lưu cập nhật **lạc quan**: đổi ngay khi bấm rồi mới gửi lên máy chủ, và trả về
trạng thái cũ nếu lỗi — người dùng không phải chờ vòng đi-về của mạng mới thấy tim đỏ.

Chia sẻ thì **không cần đăng nhập** (chia sẻ là hành vi công khai); trên điện thoại gọi
bảng chia sẻ của hệ điều hành, trên máy tính chép liên kết.

Lượt xem đếm **một lần cho mỗi bài trong mỗi phiên** — bấm F5 mười lần không phải mười
người đọc, nếu đếm thô thì mục "Đọc nhiều" sai hoàn toàn.

## Quản trị

Bảy khu, xếp theo việc chứ không theo bảng dữ liệu:

| Khu | Làm được gì |
|---|---|
| **Tổng quan** | số liệu chính, biểu đồ bài đăng 14 ngày (cột tụt xuống 0 = hôm đó bộ lấy tin không chạy), số bài theo chuyên mục kèm lần lấy tin gần nhất, bài đọc nhiều, bình luận mới |
| **Tin bài** | lọc theo chuyên mục/trạng thái, đổi nhanh trạng thái và tin nổi bật ngay trên bảng, viết bài mới, sửa SEO từng bài (có đếm ký tự theo mức Google cắt) |
| **Chuyên mục** | tên, màu, thứ tự, nguồn RSS, hiện/ẩn trên menu, SEO riêng |
| **Trang tĩnh** | giới thiệu, liên hệ, điều khoản… — hiện ở `/trang/<slug>` và ở chân trang |
| **Bình luận** | lọc theo trạng thái, chuyển hiển thị/ẩn/spam, xoá hẳn |
| **Người dùng** | tìm kiếm, lọc theo quyền, đổi quyền, xoá |
| **Cấu hình** | tên site, khẩu hiệu, mô tả, logo, số bài mỗi trang, Google Analytics, liên hệ, mạng xã hội, dòng bản quyền |
| **Báo cáo** | lượt xem theo ngày, khung giờ đọc nhiều, bài đọc nhiều, thiết bị, nguồn dẫn, chuyên mục — kèm số đang đọc trong 5 phút qua |
| **Vai trò** | ma trận vai trò × quyền, thêm/sửa/xoá vai trò |

Cấu hình lưu ở bảng `web_settings` (tiền tố `web_` vì CMS video đã có bảng `settings`
riêng cho khoá API — trùng tên là hai ứng dụng ghi đè lên nhau). `AppServiceProvider`
đổ các giá trị này đè lên `config/site.php` lúc khởi động, nên SEO, RSS, sitemap và
trang chủ tự dùng giá trị mới mà không phải sửa từng chỗ gọi `config()`.

## Phân quyền

Quyền gắn với **việc**, không gắn với vai trò; vai trò chỉ là một gói việc. Toàn bộ nằm
trong `app/Support/Roles.php` — thêm vai trò mới là thêm một dòng, không phải đi sửa
route hay controller.

| | Tin bài | Chuyên mục | Trang tĩnh | Bình luận | Người dùng | Báo cáo | Vai trò | Cấu hình |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Quản trị** (`admin`) | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| **Biên tập** (`editor`) | ✔ | ✔ | ✔ | ✔ | — | ✔ | — | — |
| **Kiểm duyệt** (`moderator`) | — | — | — | ✔ | — | — | — | — |
| **Độc giả** (`reader`) | không vào được `/admin` |

Bảng trên chỉ là **giá trị gieo sẵn**. Vai trò nằm ở bảng `roles`, sửa được trong trang
Vai trò, và thêm được vai trò mới (vd. *Cộng tác viên* chỉ có `articles.view` +
`articles.edit`). Danh mục **quyền** thì vẫn nằm trong code (`Roles::GROUPS`) — một
quyền không có dòng code nào kiểm tra chỉ là một ô tích vô nghĩa, nên nó không phải thứ
tạo được từ giao diện.

Vai trò `admin` luôn nhận mọi quyền bất kể cột JSON ghi gì, và không sửa được danh sách
quyền: gỡ nhầm một ô là khoá luôn cả hệ thống, mà lúc đó không còn ai vào để gỡ lại.

Chặn ở **ba tầng**, vì thiếu tầng nào cũng thủng:

1. `EnsureAdmin` — có được vào khu `/admin` không
2. `can.do:<quyền>` trên từng route — có được làm việc cụ thể này không
3. **Controller không truy vấn thứ người dùng không có quyền.** Ẩn ở giao diện thôi là
   chưa đủ: số liệu vẫn nằm trong payload JSON của Inertia và ai mở tab Network cũng
   đọc được. Kiểm duyệt viên mở `/admin` sẽ nhận `kpi` toàn `null` và các mảng rỗng.

Giao diện ẩn đúng những gì máy chủ cũng chặn (`auth.user.can` gửi kèm mọi trang), để
không ai bấm vào thứ chắc chắn trả về 403.

Luôn phải còn ít nhất một tài khoản `admin`: hệ thống từ chối hạ quyền hoặc xoá tài
khoản toàn quyền cuối cùng. Đếm theo `admin` chứ không phải "vào được khu quản trị" —
biên tập viên vào được nhưng không đổi quyền, nên họ không cứu được hệ thống.

## Thống kê truy cập

Middleware `TrackVisit` ghi mỗi lượt xem trang công khai vào bảng `visits`, rồi lệnh
`stats:rollup` gom thành một dòng mỗi ngày trong `daily_stats`. Lịch chạy **10 phút một
lần**.

Vì sao tự ghi mà không chỉ dựa vào Google Analytics: GA bị phần lớn trình chặn quảng cáo
chặn, và số của nó không ghép được bằng SQL với bài viết, chuyên mục hay bình luận.

Vài lựa chọn đáng nói:

- **Không lưu IP thô.** Chỉ lưu một mã băm của phiên — đủ để đếm khách riêng biệt trong
  ngày mà không giữ dữ liệu định danh.
- **Ghi sau khi đã trả lời xong**, qua `app()->terminating()`. Không dùng
  `dispatch(...)->afterResponse()`: nó tuần tự hoá closure, mà closure giữ tham chiếu
  tới request nên kéo theo cả kết nối PDO — PDO không tuần tự hoá được và lượt truy cập
  mất sạch trong im lặng.
- **Mỗi lần chạy tính lại nguyên hai ngày gần nhất, không cộng dồn.** Cộng dồn thì một
  lần chạy lỗi hoặc chạy hai lần là số sai vĩnh viễn mà không cách nào phát hiện.
  Tính lại cả hôm qua vì lượt truy cập gần nửa đêm có thể rơi sau lần gom cuối của ngày đó.
- **Bảng thô tự dọn**: gom xong thì xoá phần cũ hơn 30 ngày (`--prune`).
- Số của **hôm nay** trên trang Báo cáo lấy thẳng từ bảng thô, để không phải chờ hết
  vòng 10 phút mới thấy.

## Đường dẫn

Tiền tố dùng tiếng Anh, phần định danh vẫn là tiếng Việt không dấu vì đó là nội dung:

| | |
|---|---|
| `/news/<slug>` | bài viết |
| `/category/<slug>` | chuyên mục |
| `/page/<slug>` | trang tĩnh |
| `/search?q=` | tìm kiếm |
| `/login` · `/register` · `/logout` | tài khoản |
| `/bookmarks` · `/account` | khu độc giả |
| `/admin/...` | khu quản trị |

Đường dẫn tiếng Việt cũ (`/tin/`, `/chuyen-muc/`, `/quan-tri/nguoi-dung`…) đều được
**chuyển hướng 301** sang địa chỉ mới, kể cả phần sau tiền tố của khu quản trị. Dùng 301
chứ không phải 302 để thứ hạng của đường dẫn cũ dồn sang đường dẫn mới thay vì bị chia đôi.

## Giao diện khu quản trị

Mọi danh sách đều là **bảng**, kể cả chuyên mục (trước là thẻ) — cùng một kiểu thì mắt
không phải học lại cách đọc ở mỗi trang.

Cột thao tác dùng nút chỉ có biểu tượng (`IconButton`), mờ sẵn ở mức 55% và rõ hẳn khi
rê vào hàng, để bảng không bị rối bởi hàng chục nút. Hình vẽ tập trung ở một chỗ
(`Icon.vue`) nên cùng một hành động luôn cùng một biểu tượng ở mọi trang. Mỗi nút bắt
buộc có `label`: nút chỉ có hình thì trình đọc màn hình không đọc được gì, nên nhãn vừa
là `title` khi rê chuột vừa là `aria-label`.

Nút "Sửa" điều hướng qua Inertia (`as="link"`), còn "Xem trên web" mở tab mới nên vẫn là
thẻ `<a>` thường.

## Phân trang

Một component `Pagination.vue` dùng cho mọi danh sách (chuyên mục, tìm kiếm, bài đã lưu,
và cả bốn bảng trong khu quản trị). Nó nhận nguyên đối tượng paginator của Laravel chứ
không nhận mảng `links` — mảng đó dựng sẵn nhãn tiếng Anh và không điều khiển được số
nút. Cửa sổ trang luôn có trang đầu, trang cuối và hai trang mỗi bên trang hiện tại;
màn hình hẹp thì gọn lại thành `2 / 24`. Mọi tham số lọc đang có được giữ nguyên khi
đổi trang.

## Dùng chung cơ sở dữ liệu với CMS video

Cùng một MySQL (`showbiz_cms`), nên:

- Một tài khoản quản trị vào được cả hai nơi
- Website hiển thị được cả video đã dựng (chuyên mục nối với chủ đề qua cột `topic`)

Vì vậy bảng lịch sử migration của ứng dụng này đổi tên thành `web_migrations`
(xem `config/database.php`) — nếu không, hai ứng dụng sẽ tưởng migration của nhau là
của mình. Ứng dụng này cũng **không** tạo bảng `users`/`sessions`; nó dùng bảng có sẵn
của CMS.

Vì bảng `users` dùng chung **và** website cho đăng ký công khai, chỉ kiểm tra "đã đăng
nhập chưa" là không đủ: bất kỳ độc giả nào cũng sẽ vào được `/quan-tri` của cả hai ứng
dụng. Nên có thêm cột `role` và middleware `EnsureAdmin`; `auth` một mình không bảo vệ
được khu quản trị.

## Cache

Trang chủ, RSS và sitemap được cache 5–60 phút. Mọi đường ghi tin (nạp từ dây chuyền,
`news:fetch`, sửa bài trong quản trị) đều tự dọn cache, nên không bao giờ phải xoá tay.
