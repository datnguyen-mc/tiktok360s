# Hạ tầng

Toàn bộ hệ thống chạy bằng Docker. Không Kubernetes, không cài PHP/Node/MySQL lên máy chủ.

## Cài đặt — một lệnh

```bash
git clone <kho-mã> tiktok && cd tiktok
./deploy/install.sh --domain tin360s.vn --email ban@tin360s.vn
```

Chạy trên VPS Ubuntu/Debian trống là đủ. Lệnh này làm tất cả:

1. Cài Docker nếu chưa có
2. Sinh mọi khoá bí mật, ghi `deploy/.env` (quyền 600)
3. Dựng image và khởi động theo đúng thứ tự phụ thuộc
4. Chạy migration cho **cả hai** ứng dụng
5. Gieo chuyên mục kèm nguồn RSS
6. Tạo tài khoản quản trị đầu tiên, in mật khẩu ra màn hình
7. Lấy mẻ tin đầu, bổ sung nội dung và ảnh, gom số liệu

Chạy lại lần nữa là an toàn: `.env` đã có thì giữ nguyên, không sinh khoá mới.
**Sinh lại `APP_KEY` là mất sạch token TikTok đã mã hoá trong cơ sở dữ liệu.**

Cấu hình tối thiểu: 2 vCPU, 4 GB RAM, 40 GB đĩa. Dựng video cần thêm CPU.

Chạy thử ở máy cá nhân: `./deploy/install.sh` (không tham số) — dùng `localhost`,
không có HTTPS. Kho mã đã kèm sẵn `docker-compose.override.yml` tắt Caddy (cổng
80/443 ở máy cá nhân thường đã bị chiếm) và mở thẳng cổng của hai ứng dụng:

| | |
|---|---|
| `http://127.0.0.1:8091` | website tin tức |
| `http://127.0.0.1:8090` | CMS dựng video |

**Trên máy chủ thật thì xoá tệp đó đi**, để Caddy nhận cổng 80/443 và cấp HTTPS.

## Kiến trúc

```
                    Internet
                       │
                   ┌───▼────┐   HTTPS tự động (Let's Encrypt)
                   │ caddy  │   80 · 443 · 443/udp
                   └───┬────┘
              ┌────────┴────────┐          mạng edge
        ┌─────▼─────┐     ┌─────▼─────┐
        │    web    │     │    cms    │
        │  Tin360s  │     │   video   │
        └─────┬─────┘     └─────┬─────┘
              └────────┬────────┘          mạng internal
         ┌─────────────┼─────────────┬──────────────┐
    ┌────▼───┐   ┌─────▼────┐  ┌─────▼────┐  ┌──────▼─────┐
    │ mysql  │   │  redis   │  │ pipeline │  │   backup   │
    └────────┘   └──────────┘  └──────────┘  └────────────┘
```

| Dịch vụ | Việc |
|---|---|
| **caddy** | HTTPS tự xin và tự gia hạn; gộp `www` về tên miền chính |
| **web** | Website tin tức — nginx + php-fpm + **Node cho SSR** + queue + scheduler |
| **cms** | CMS dựng video TikTok |
| **pipeline** | Python + ffmpeg, dựng video theo lịch |
| **mysql** | Dùng chung cho cả hai ứng dụng |
| **redis** | Cache và hàng đợi |
| **backup** | `mysqldump` mỗi ngày 03:00, giữ 14 ngày |

Chỉ `caddy` mở cổng ra Internet. MySQL và Redis nằm trong mạng `internal`, không
ai bên ngoài chạm tới được.

## Vì sao web container cần Node

Website render phía máy chủ (Inertia SSR). Thiếu tiến trình Node thì trang vẫn mở
được bình thường — nhưng Googlebot chỉ nhận về một thẻ `<div id="app">` rỗng, và
toàn bộ công sức SEO thành vô nghĩa. Đây là kiểu hỏng im lặng, không có lỗi nào
hiện ra, nên `supervisord` chạy nó với `priority` thấp hơn nginx để nó lên trước.

Gói SSR được dựng với `ssr: { noExternal: true }` trong `vite.config.js`, nghĩa là
Vue và mọi thư viện đều nằm gọn trong `ssr.js`. Mặc định Vite để chúng ở ngoài và
`ssr.js` sẽ cần `node_modules` — mà image chạy thật thì không có.

## Thứ tự khởi động

`web` chờ `cms` **healthy** rồi mới chạy migration. Bảng `users` do CMS tạo và CMS
cũng thêm cột vào đó; khởi động song song thì migration của website có thể chạy
trước và tham chiếu cột chưa tồn tại.

Ngoài ra migration của cả hai bên đều kiểm tra `hasColumn` trước khi thêm: MySQL
không quay lui được lệnh DDL, nên một migration hỏng giữa chừng sẽ để lại cột đã
thêm mà không ghi nhận migration — lần chạy sau chết vì "Duplicate column".

## Lệnh hay dùng

```bash
make -C deploy help        # danh sách đầy đủ
make -C deploy ps          # trạng thái
make -C deploy logs        # log tất cả
make -C deploy logs-web    # chỉ website
make -C deploy update      # kéo mã mới → dựng lại → migrate
make -C deploy backup      # sao lưu ngay ra tệp .sql.gz
make -C deploy restore FILE=backup.sql.gz
make -C deploy fetch       # lấy tin ngay
make -C deploy backfill    # bổ sung nội dung và ảnh còn thiếu
make -C deploy video TOPIC=bongda
make -C deploy admin EMAIL=ban@vidu.vn   # nâng một tài khoản lên quản trị
make -C deploy db          # mở dòng lệnh MySQL
make -C deploy monitoring  # bật Prometheus + Grafana + Loki
```

## Sao lưu

Container `backup` tự dump mỗi ngày 03:00 vào volume `backups`, giữ 14 ngày
(`BACKUP_KEEP_DAYS`). Dùng `--single-transaction` nên website vẫn chạy bình thường
trong lúc sao lưu. Tệp chỉ được đổi sang tên thật khi dump xong — đứt giữa chừng
thì bỏ lại tệp `.tmp`, không bao giờ để lại một bản sao lưu cụt trông như bản tốt.

Chạy trong container thay vì cron trên máy chủ vì cron của máy chủ không thấy được
mạng nội bộ của Docker, mà mở cổng MySQL ra ngoài chỉ để sao lưu thì đánh đổi quá đắt.

Lấy bản sao lưu ra khỏi máy chủ:

```bash
docker compose -f deploy/docker-compose.yml cp backup:/backups ./backups-local
```

## Giám sát (tuỳ chọn)

```bash
make -C deploy monitoring
```

Prometheus thu số liệu, Grafana vẽ biểu đồ và cảnh báo, Loki gom log mọi container.
Khai `GRAFANA_DOMAIN` trong `.env` thì Caddy tự cấp HTTPS cho nó.

## Chủ đề kênh

`topics/*.json` được gắn thẳng từ kho mã vào cả `cms` lẫn `pipeline`. Sửa trong
giao diện CMS thì dây chuyền thấy ngay, và thay đổi vẫn nằm trong git chứ không
biến mất cùng container.

## Cập nhật

```bash
make -C deploy update
```

Kéo mã mới, dựng lại image, chạy migration. Không mất dữ liệu — `mysql_data`,
`pipeline_output`, `caddy_data` và `backups` đều là named volume.
