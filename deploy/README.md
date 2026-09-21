# Triển khai

Toàn bộ hệ thống chạy bằng Docker. Không cần Kubernetes.

## Lên VPS — một lệnh

Máy chủ Ubuntu/Debian trống, đã trỏ tên miền về IP:

```bash
git clone <repo> showbiz && cd showbiz
sudo bash deploy/install-vps.sh --domain showbiz.vidu.vn --email ban@vidu.vn --monitoring
```

Script tự làm: cài Docker → mở tường lửa 22/80/443 → tạo swap nếu RAM dưới 4GB →
sinh mật khẩu ngẫu nhiên → build → khởi động → tạo tài khoản quản trị → in thông tin đăng nhập.
Chạy lại nhiều lần được, không ghi đè khoá đã sinh.

Cấu hình máy chủ tối thiểu: **2 CPU, 4GB RAM, 40GB đĩa**. Render ffmpeg là phần ngốn
tài nguyên nhất — dưới 2GB RAM thì tiến trình hay bị hệ điều hành giết giữa chừng.

## Có gì chạy

| Container | Việc | Mở ra Internet |
|---|---|---|
| `caddy` | HTTPS tự động (Let's Encrypt), chuyển tiếp vào CMS | 80, 443 |
| `cms` | Laravel + Vue | không (qua Caddy) |
| `mysql` | Cơ sở dữ liệu | không |
| `pipeline` | Dựng video mỗi ngày đúng giờ | không |
| `prometheus` | Thu số liệu | không |
| `grafana` | Biểu đồ, cảnh báo | qua tên miền con nếu khai |
| `loki` + `promtail` | Gom log mọi container | không |
| `node-exporter` + `cadvisor` | CPU/RAM/đĩa của máy và container | không |

Chỉ Caddy mở cổng. MySQL, Prometheus, Loki nằm trong mạng nội bộ của Docker,
không thể gọi từ bên ngoài.

## Bộ hẹn giờ không dùng docker socket

Dây chuyền tự hẹn giờ bằng một vòng lặp ngủ–chạy ngay trong container
([`docker/pipeline-scheduler.sh`](docker/pipeline-scheduler.sh)), thay vì dùng cron
của máy chủ hay ofelia. Lý do: cả hai cách kia đều cần gắn `/var/run/docker.sock`
vào container, tức là cấp quyền ngang root trên máy chủ cho một tiến trình có nối
mạng ra ngoài. Vòng lặp ngủ–chạy không cần quyền gì, và log nằm chung với container.

*(Promtail vẫn cần socket để đọc log — nó chỉ mount `:ro` và không nhận dữ liệu từ
Internet.)*

## Giám sát

Grafana có sẵn dashboard **“Showbiz — dây chuyền video”**, cố ý đo **việc của hệ thống**
chứ không chỉ CPU/RAM:

- Video gần nhất cách đây bao lâu · thời lượng · sai số mô hình canh thời lượng
- Job đăng TikTok thất bại · đang chờ · kênh sắp hết hạn token
- Chi phí model AI hôm nay và 30 ngày
- CPU/RAM từng container, và log gộp của mọi container

Tám cảnh báo trong [`monitoring/alerts.yml`](monitoring/alerts.yml):

| Cảnh báo | Kích hoạt khi |
|---|---|
| `KhongCoVideoHomNay` | quá 26 giờ không có video mới |
| `DangBaiThatBai` | có job đăng thất bại trong 24h |
| `ThoiLuongVideoLech` | video ra ngoài khung 90–120s |
| `TokenKenhSapHetHan` | kênh TikTok cần kết nối lại trong 14 ngày |
| `ChiPhiAiVuotNguong` | chi phí model AI hôm nay vượt 20 USD |
| `SapHetDia` / `SapHetBoNho` / `ContainerChetDiChetLai` | sức khoẻ máy chủ |

Ngưỡng chi phí 20 USD/ngày là mặc định phòng hờ — Veo 3.1 Standard chạm mức đó chỉ
sau nửa video. Sửa cho khớp ngân sách thật của bạn.

## Chạy thử ở máy cá nhân

```bash
cd deploy
cp .env.docker.example .env      # điền APP_KEY, mật khẩu
docker compose up -d mysql cms   # bỏ caddy vì chưa có tên miền
docker compose exec cms php artisan db:seed
```

Thêm giám sát:

```bash
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

Container không mở cổng ra ngoài. Muốn xem thử thì thêm `ports: ["8000:8080"]` cho
`cms` bằng một file override, đừng sửa trực tiếp `docker-compose.yml`.

## Lệnh hay dùng

```bash
cd deploy

docker compose logs -f cms                 # log bảng điều khiển
docker compose logs -f pipeline            # log dựng video
docker compose ps                          # trạng thái

# Dựng video ngay, không chờ tới giờ
docker compose run --rm pipeline python -m pipeline.run_daily

# Dựng video cho một ngày cụ thể
docker compose run --rm pipeline python -m pipeline.run_daily --date 2026-09-20

docker compose exec cms php artisan migrate      # cập nhật schema
docker compose exec mysql mysqldump -uroot -p showbiz_cms > backup.sql

docker compose down                        # dừng, dữ liệu vẫn còn
docker compose down -v                     # dừng và XOÁ SẠCH dữ liệu
```

## Sao lưu

Ba thứ cần sao lưu, theo thứ tự quan trọng:

1. **`deploy/.env`** — chứa `APP_KEY`. Mất khoá này là **mất toàn bộ token TikTok**
   đã mã hoá trong cơ sở dữ liệu, phải kết nối lại mọi kênh.
2. **Cơ sở dữ liệu** — `docker compose exec mysql mysqldump -uroot -p showbiz_cms`
3. **Volume `pipeline_output`** — các video đã dựng. Mất thì không dựng lại được
   (tin cũ không còn trong RSS), nhưng cũng không ảnh hưởng vận hành.

## Cập nhật phiên bản

```bash
git pull
cd deploy
docker compose build
docker compose up -d
```

Migration chạy tự động trong entrypoint của container CMS.
