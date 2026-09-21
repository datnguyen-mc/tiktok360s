#!/usr/bin/env bash
#
# Cài toàn bộ hệ thống lên một máy chủ Ubuntu/Debian trống bằng một lệnh.
#
#   sudo bash deploy/install-vps.sh --domain showbiz.vidu.vn --email ban@vidu.vn
#
# Script làm những việc sau, và làm lại được nhiều lần mà không hỏng gì:
#   1. Cài Docker + Docker Compose
#   2. Mở tường lửa cho 22 / 80 / 443, đóng phần còn lại
#   3. Tạo swap nếu RAM dưới 4GB (ffmpeg dựng phim rất ngốn bộ nhớ)
#   4. Sinh mật khẩu và khoá ngẫu nhiên vào deploy/.env
#   5. Build image rồi khởi động: CMS + MySQL + dây chuyền + HTTPS tự động
#   6. Thêm Prometheus + Grafana + Loki nếu bật --monitoring
#
set -euo pipefail

# ─────────────────────────────────────────────────────────── tham số dòng lệnh

DOMAIN=""
EMAIL=""
GRAFANA_DOMAIN=""
MONITORING=false
SCHEDULE_TIME="07:30"
TIMEZONE="Asia/Ho_Chi_Minh"

usage() {
  cat <<'TXT'
Cách dùng:
  sudo bash deploy/install-vps.sh --domain <tên miền> --email <email> [tuỳ chọn]

Bắt buộc:
  --domain <d>        Tên miền đã trỏ A record về IP máy chủ này
  --email <e>         Email cho Let's Encrypt (nhận cảnh báo chứng chỉ sắp hết hạn)

Tuỳ chọn:
  --monitoring        Cài thêm Prometheus + Grafana + Loki
  --grafana-domain <d>  Tên miền con cho Grafana (vd grafana.vidu.vn)
  --schedule <HH:MM>  Giờ dựng video mỗi ngày (mặc định 07:30)
  --timezone <tz>     Múi giờ (mặc định Asia/Ho_Chi_Minh)
  --help              Hiện hướng dẫn này
TXT
}

while [ $# -gt 0 ]; do
  case "$1" in
    --domain)         DOMAIN="${2:-}"; shift 2 ;;
    --email)          EMAIL="${2:-}"; shift 2 ;;
    --grafana-domain) GRAFANA_DOMAIN="${2:-}"; shift 2 ;;
    --schedule)       SCHEDULE_TIME="${2:-}"; shift 2 ;;
    --timezone)       TIMEZONE="${2:-}"; shift 2 ;;
    --monitoring)     MONITORING=true; shift ;;
    --help|-h)        usage; exit 0 ;;
    *) echo "Tham số lạ: $1"; usage; exit 1 ;;
  esac
done

# ──────────────────────────────────────────────────────────────── tiện ích in

bold()  { printf '\033[1m%s\033[0m\n' "$*"; }
step()  { printf '\n\033[1;35m▶ %s\033[0m\n' "$*"; }
ok()    { printf '  \033[32m✓\033[0m %s\n' "$*"; }
warn()  { printf '  \033[33m⚠\033[0m %s\n' "$*"; }
die()   { printf '\n  \033[31m✗ %s\033[0m\n\n' "$*" >&2; exit 1; }

# ────────────────────────────────────────────────────────────── kiểm tra đầu vào

[ "$(id -u)" -eq 0 ] || die "Phải chạy bằng sudo hoặc user root."
[ -n "$DOMAIN" ] || { usage; die "Thiếu --domain"; }
[ -n "$EMAIL" ]  || { usage; die "Thiếu --email"; }

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_DIR="$REPO_ROOT/deploy"
ENV_FILE="$DEPLOY_DIR/.env"

[ -f "$DEPLOY_DIR/docker-compose.yml" ] || die "Không thấy deploy/docker-compose.yml — chạy script từ trong thư mục dự án."

bold "Cài Showbiz CMS lên $(hostname)"
echo "  tên miền     : $DOMAIN"
echo "  email        : $EMAIL"
echo "  giờ dựng video: $SCHEDULE_TIME ($TIMEZONE)"
echo "  giám sát     : $([ "$MONITORING" = true ] && echo "có" || echo "không")"

# ─────────────────────────────────────────────────────────── 1. hệ điều hành

step "1/7 · Kiểm tra hệ điều hành"
. /etc/os-release 2>/dev/null || die "Không đọc được /etc/os-release"
case "$ID" in
  ubuntu|debian) ok "$PRETTY_NAME" ;;
  *) die "Script này viết cho Ubuntu/Debian. Máy đang chạy: $PRETTY_NAME" ;;
esac

RAM_MB=$(free -m | awk '/^Mem:/{print $2}')
CPU=$(nproc)
DISK_GB=$(df -BG --output=avail / | tail -1 | tr -dc '0-9')
echo "  RAM ${RAM_MB}MB · ${CPU} CPU · còn ${DISK_GB}GB đĩa"
[ "$RAM_MB" -lt 2000 ] && warn "RAM dưới 2GB — render ffmpeg có thể bị hệ điều hành giết."
[ "$DISK_GB" -lt 20 ] && warn "Đĩa còn dưới 20GB — mỗi video khoảng 15MB, cộng thêm image Docker."

# ──────────────────────────────────────────────────────────────── 2. swap

step "2/7 · Bộ nhớ ảo (swap)"
if [ "$RAM_MB" -lt 4000 ] && [ ! -f /swapfile ]; then
  echo "  RAM dưới 4GB, tạo swap 2GB cho ffmpeg…"
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  ok "đã bật swap 2GB"
else
  ok "không cần thêm swap"
fi

# ─────────────────────────────────────────────────────────────── 3. Docker

step "3/7 · Docker"
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  ok "$(docker --version)"
else
  echo "  cài Docker từ kho chính thức…"
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl gnupg >/dev/null
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL "https://download.docker.com/linux/$ID/gpg" \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/$ID $VERSION_CODENAME stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io \
                         docker-buildx-plugin docker-compose-plugin >/dev/null
  systemctl enable --now docker >/dev/null
  ok "$(docker --version)"
fi

# Giới hạn log để không âm thầm ăn hết đĩa
if [ ! -f /etc/docker/daemon.json ]; then
  mkdir -p /etc/docker
  cat > /etc/docker/daemon.json <<'JSON'
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "20m", "max-file": "3" }
}
JSON
  systemctl restart docker
  ok "giới hạn log Docker 20MB × 3 file"
fi

# ───────────────────────────────────────────────────────────── 4. tường lửa

step "4/7 · Tường lửa"
if command -v ufw >/dev/null 2>&1; then
  ufw allow 22/tcp  >/dev/null 2>&1 || true
  ufw allow 80/tcp  >/dev/null 2>&1 || true
  ufw allow 443/tcp >/dev/null 2>&1 || true
  ufw --force enable >/dev/null 2>&1 || true
  ok "mở 22, 80, 443 — đóng phần còn lại"
  warn "MySQL và Grafana không mở ra Internet. Grafana vào qua tên miền con nếu có khai."
else
  warn "Không có ufw — bỏ qua. Nhớ tự cấu hình tường lửa của nhà cung cấp VPS."
fi

# ──────────────────────────────────────────────────────── 5. cấu hình .env

step "5/7 · Cấu hình"
rand() { openssl rand -hex "${1:-24}"; }

if [ -f "$ENV_FILE" ]; then
  ok "giữ nguyên deploy/.env đang có (không ghi đè khoá cũ)"
  # APP_KEY mà thay đổi là mất sạch token TikTok đã mã hoá — tuyệt đối không đụng.
else
  APP_KEY="base64:$(openssl rand -base64 32)"
  cp "$DEPLOY_DIR/.env.docker.example" "$ENV_FILE"

  set_env() { sed -i "s|^$1=.*|$1=$2|" "$ENV_FILE"; }
  set_env APP_KEY          "$APP_KEY"
  set_env APP_URL          "https://$DOMAIN"
  set_env DB_PASSWORD      "$(rand 16)"
  set_env DB_ROOT_PASSWORD "$(rand 16)"
  set_env INGEST_TOKEN     "$(rand 24)"
  set_env TIKTOK_REDIRECT_URI "https://$DOMAIN/tiktok/callback"
  set_env GOOGLE_REDIRECT_URI "https://$DOMAIN/auth/google/callback"

  {
    echo ""
    echo "DOMAIN=$DOMAIN"
    echo "ADMIN_EMAIL=$EMAIL"
    echo "GRAFANA_DOMAIN=$GRAFANA_DOMAIN"
    echo "GRAFANA_PASSWORD=$(rand 12)"
    echo "TZ=$TIMEZONE"
    echo "SCHEDULE_TIME=$SCHEDULE_TIME"
    echo "RUN_ON_START=false"
    echo "ADMIN_PASSWORD=$(rand 8)"
  } >> "$ENV_FILE"

  chmod 600 "$ENV_FILE"
  ok "đã sinh deploy/.env với khoá ngẫu nhiên (quyền 600)"
  warn "SAO LƯU APP_KEY trong file này. Mất nó là mất toàn bộ token TikTok đã lưu."
fi

# ────────────────────────────────────────────────────────── 6. build & chạy

step "6/7 · Build và khởi động"
cd "$DEPLOY_DIR"

COMPOSE=(docker compose -f docker-compose.yml)
[ "$MONITORING" = true ] && COMPOSE+=(-f docker-compose.monitoring.yml)

echo "  build image (lần đầu mất 5–10 phút)…"
"${COMPOSE[@]}" build --quiet
ok "build xong"

"${COMPOSE[@]}" up -d
ok "các container đã khởi động"

echo "  chờ CMS sẵn sàng…"
for i in $(seq 1 60); do
  if "${COMPOSE[@]}" exec -T cms wget -qO- http://127.0.0.1:8080/up >/dev/null 2>&1; then
    ok "CMS phản hồi"
    break
  fi
  [ "$i" = 60 ] && die "CMS không lên sau 2 phút. Xem log: docker compose -f deploy/docker-compose.yml logs cms"
  sleep 2
done

# ──────────────────────────────────────────────────── 7. tài khoản quản trị

step "7/7 · Tài khoản quản trị"
ADMIN_PASSWORD=$(grep '^ADMIN_PASSWORD=' "$ENV_FILE" | cut -d= -f2-)
"${COMPOSE[@]}" exec -T \
  -e ADMIN_EMAIL="$EMAIL" -e ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  cms php artisan db:seed --force >/dev/null 2>&1 && ok "đã tạo tài khoản" || warn "tài khoản đã có sẵn"

# ───────────────────────────────────────────────────────────────── kết thúc

GRAFANA_PASSWORD=$(grep '^GRAFANA_PASSWORD=' "$ENV_FILE" | cut -d= -f2-)

cat <<TXT

$(bold "════ XONG ════")

  Bảng điều khiển : https://$DOMAIN
  Đăng nhập       : $EMAIL
  Mật khẩu        : $ADMIN_PASSWORD

TXT

if [ "$MONITORING" = true ]; then
  cat <<TXT
  Grafana         : ${GRAFANA_DOMAIN:+https://$GRAFANA_DOMAIN}${GRAFANA_DOMAIN:-"(chưa khai --grafana-domain; vào bằng: docker compose exec grafana ... hoặc mở cổng tạm)"}
  Grafana user    : admin / $GRAFANA_PASSWORD

TXT
fi

cat <<TXT
  $(bold "Ba việc nên làm ngay:")
    1. Đổi mật khẩu và bật xác thực hai lớp trong mục "Tài khoản của tôi"
    2. Điền khoá TikTok ở mục "Cài đặt" — xem cms/docs/tiktok-setup.md
    3. Sao lưu deploy/.env ra chỗ khác (APP_KEY mất là mất hết token)

  $(bold "Lệnh hay dùng:")
    cd $DEPLOY_DIR
    docker compose logs -f cms          # xem log bảng điều khiển
    docker compose logs -f pipeline     # xem log dựng video
    docker compose run --rm pipeline python -m pipeline.run_daily   # dựng ngay, không chờ tới giờ
    docker compose restart              # khởi động lại
    docker compose down                 # dừng (dữ liệu vẫn còn)

  Dây chuyền sẽ tự dựng video lúc $SCHEDULE_TIME mỗi ngày ($TIMEZONE).

TXT
