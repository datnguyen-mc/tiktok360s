#!/usr/bin/env bash
#
# Cài đặt toàn bộ hệ thống bằng MỘT lệnh.
#
#   ./deploy/install.sh                        chạy thử ở máy cá nhân
#   ./deploy/install.sh --domain tin360s.vn --email ban@tin360s.vn
#
# Việc nó làm:
#   1. Cài Docker nếu chưa có (Ubuntu/Debian)
#   2. Sinh mọi khoá bí mật, ghi deploy/.env
#   3. Dựng image và khởi động tất cả dịch vụ
#   4. Chạy migration cho cả CMS lẫn website
#   5. Tạo tài khoản quản trị đầu tiên
#   6. Lấy mẻ tin đầu tiên để trang chủ không trống
#
# Chạy lại lần nữa là an toàn: .env đã có thì giữ nguyên, không sinh khoá mới
# (sinh lại APP_KEY là mất sạch token TikTok đã mã hoá trong cơ sở dữ liệu).
set -euo pipefail

cd "$(dirname "$0")"

DOMAIN=""; CMS_DOMAIN=""; ADMIN_EMAIL=""; GRAFANA_DOMAIN=""
WITH_MONITORING=false; SKIP_FETCH=false

while [ $# -gt 0 ]; do
  case "$1" in
    --domain)      DOMAIN="$2"; shift 2 ;;
    --cms-domain)  CMS_DOMAIN="$2"; shift 2 ;;
    --email)       ADMIN_EMAIL="$2"; shift 2 ;;
    --grafana)     GRAFANA_DOMAIN="$2"; WITH_MONITORING=true; shift 2 ;;
    --monitoring)  WITH_MONITORING=true; shift ;;
    --skip-fetch)  SKIP_FETCH=true; shift ;;
    -h|--help)     sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Tham số lạ: $1"; exit 1 ;;
  esac
done

bold()  { printf '\033[1m%s\033[0m\n' "$*"; }
step()  { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
ok()    { printf '  \033[32m✓\033[0m %s\n' "$*"; }
warn()  { printf '  \033[33m!\033[0m %s\n' "$*"; }
die()   { printf '\n\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

# ── 1. Docker ────────────────────────────────────────────────────────────────
step "Kiểm tra Docker"

if ! command -v docker >/dev/null 2>&1; then
  if [ "$(uname -s)" != "Linux" ]; then
    die "Chưa có Docker. Trên macOS/Windows hãy cài Docker Desktop rồi chạy lại."
  fi
  warn "Chưa có Docker — đang cài…"
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
  ok "Đã cài Docker"
else
  ok "Docker $(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)"
fi

docker compose version >/dev/null 2>&1 \
  || die "Thiếu plugin 'docker compose'. Cài docker-compose-plugin rồi chạy lại."

docker info >/dev/null 2>&1 \
  || die "Docker chưa chạy, hoặc người dùng hiện tại không có quyền. Thử: sudo usermod -aG docker \$USER && newgrp docker"

# ── 2. .env ──────────────────────────────────────────────────────────────────
step "Chuẩn bị cấu hình"

rand()    { openssl rand -hex "${1:-24}"; }
appkey()  { echo "base64:$(openssl rand -base64 32)"; }

if [ -f .env ]; then
  ok ".env đã có — giữ nguyên mọi khoá bí mật"
  # Chỉ bổ sung khoá còn thiếu, không đụng vào khoá đã dùng
  add_missing() {
    grep -q "^$1=" .env || { echo "$1=$2" >> .env; warn "bổ sung $1"; }
  }
  add_missing WEB_APP_KEY   "$(appkey)"
  add_missing REDIS_HOST    "redis"
  add_missing SITE_NAME     "Tin360s"
  add_missing BACKUP_KEEP_DAYS "14"
else
  [ -n "$DOMAIN" ] || { DOMAIN="localhost"; warn "Không khai --domain, dùng localhost"; }
  [ -n "$CMS_DOMAIN" ]  || CMS_DOMAIN="cms.${DOMAIN}"
  [ -n "$ADMIN_EMAIL" ] || ADMIN_EMAIL="admin@${DOMAIN}"

  cat > .env <<ENV
# Sinh tự động bởi install.sh — $(date '+%F %T')
#
# ĐỪNG đổi APP_KEY và WEB_APP_KEY sau khi đã chạy thật: token TikTok trong cơ sở
# dữ liệu được mã hoá bằng chúng, đổi khoá là không giải mã được nữa.

APP_NAME="Tin360s"
APP_ENV=production
APP_DEBUG=false
APP_KEY=$(appkey)
WEB_APP_KEY=$(appkey)

SITE_NAME="Tin360s"

# ── Tên miền ────────────────────────────────────────────────
DOMAIN=${DOMAIN}
CMS_DOMAIN=${CMS_DOMAIN}
GRAFANA_DOMAIN=${GRAFANA_DOMAIN}
ADMIN_EMAIL=${ADMIN_EMAIL}

# ── Cơ sở dữ liệu ───────────────────────────────────────────
DB_CONNECTION=mysql
DB_DATABASE=showbiz_cms
DB_USERNAME=showbiz
DB_PASSWORD=$(rand 16)
DB_ROOT_PASSWORD=$(rand 16)

REDIS_HOST=redis
SESSION_DRIVER=database
CACHE_STORE=redis
QUEUE_CONNECTION=redis

# ── Lịch chạy ───────────────────────────────────────────────
TZ=Asia/Ho_Chi_Minh
SCHEDULE_TIME=07:30
RUN_ON_START=false
BACKUP_KEEP_DAYS=14

# Khoá để dây chuyền Python nạp dữ liệu vào CMS và website
INGEST_TOKEN=$(rand 24)

GRAFANA_PASSWORD=$(rand 12)

# ── TikTok (điền sau, hoặc sửa trong giao diện CMS) ──────────
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=https://${CMS_DOMAIN}/tiktok/callback
TIKTOK_POST_MODE=inbox

# ── Đăng nhập Google (tuỳ chọn) ─────────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=https://${CMS_DOMAIN}/auth/google/callback
GOOGLE_ALLOWED_DOMAIN=
ENV
  chmod 600 .env
  ok "Đã tạo .env với khoá sinh ngẫu nhiên (quyền 600)"
fi

# Đọc lại để dùng ở các bước sau
set -a; . ./.env; set +a

# ── 3. Dựng và khởi động ─────────────────────────────────────────────────────
COMPOSE=(docker compose -f docker-compose.yml)
# Khai -f tường minh thì compose KHÔNG tự nạp docker-compose.override.yml nữa,
# nên phải thêm bằng tay. Tệp đó dành cho tinh chỉnh ở máy cá nhân.
[ -f docker-compose.override.yml ] && COMPOSE+=(-f docker-compose.override.yml)
$WITH_MONITORING && COMPOSE+=(-f docker-compose.monitoring.yml)

step "Dựng image (lần đầu mất 3–6 phút)"
"${COMPOSE[@]}" build --pull
ok "Đã dựng xong"

step "Khởi động dịch vụ"
"${COMPOSE[@]}" up -d
ok "Đã khởi động"

# ── 4. Chờ sẵn sàng ──────────────────────────────────────────────────────────
step "Chờ ứng dụng sẵn sàng"

wait_healthy() {
  local svc=$1 tries=${2:-60}
  for i in $(seq 1 "$tries"); do
    if "${COMPOSE[@]}" exec -T "$svc" wget -qO- http://127.0.0.1:8080/up >/dev/null 2>&1; then
      ok "$svc sẵn sàng"; return 0
    fi
    sleep 3
  done
  echo
  warn "$svc chưa phản hồi. Log gần nhất:"
  "${COMPOSE[@]}" logs --tail 40 "$svc"
  die "Dừng ở đây. Sửa lỗi trên rồi chạy lại ./install.sh"
}

wait_healthy cms
wait_healthy web

# ── 5. Tài khoản quản trị ────────────────────────────────────────────────────
step "Tài khoản quản trị"

ADMIN_PASS=$(rand 8)

# Tạo qua container `web`: model User bên đó biết cột `role`. Và dùng forceFill
# chứ không dùng create() — `role` không nằm trong $fillable của model bên CMS,
# nên create() bỏ qua nó trong im lặng và tài khoản sinh ra chỉ là độc giả.
cat > /tmp/mkadmin.php <<PHPEOF
<?php
use App\\Models\\User;

if (User::count() > 0) {
    echo "SKIP\n";
    return;
}

User::forceCreate([
    'name'              => 'Quản trị',
    'email'             => '${ADMIN_EMAIL}',
    'password'          => bcrypt('${ADMIN_PASS}'),
    'role'              => 'admin',
    'email_verified_at' => now(),
]);

echo "CREATED\n";
PHPEOF

"${COMPOSE[@]}" cp /tmp/mkadmin.php web:/tmp/mkadmin.php >/dev/null 2>&1
ADMIN_RESULT=$("${COMPOSE[@]}" exec -T web php artisan tinker \
                 --execute="require '/tmp/mkadmin.php';" 2>/dev/null | tr -d '[:space:]')
rm -f /tmp/mkadmin.php

if echo "$ADMIN_RESULT" | grep -q CREATED; then
  ok "Đã tạo ${ADMIN_EMAIL} với quyền quản trị"
  CREATED_ADMIN=true
else
  ok "Đã có tài khoản — không tạo thêm"
  CREATED_ADMIN=false
fi

# ── 6. Chuyên mục và mẻ tin đầu tiên ─────────────────────────────────────────
step "Chuyên mục"

# Không gieo thì `news:fetch` không có nguồn RSS nào để đọc, và website đứng
# trống vĩnh viễn mà không báo lỗi gì.
if "${COMPOSE[@]}" exec -T web php artisan tinker --execute \
     "echo App\\Models\\Category::count();" 2>/dev/null | tr -d '[:space:]' | grep -qx '0'; then
  "${COMPOSE[@]}" exec -T web php artisan db:seed --force 2>&1 | sed 's/^/  /'
  ok "Đã gieo chuyên mục kèm nguồn RSS"
else
  ok "Đã có chuyên mục — không gieo lại"
fi

if [ "$SKIP_FETCH" = false ]; then
  step "Lấy mẻ tin đầu tiên (2–4 phút)"
  "${COMPOSE[@]}" exec -T web php artisan news:fetch 2>&1 | sed 's/^/  /' || \
    warn "Lấy tin thất bại — chạy tay sau: make -C deploy fetch"

  # Bài lấy từ RSS thường chỉ có sapo; lượt này bổ sung thân bài và ảnh
  "${COMPOSE[@]}" exec -T web php artisan news:backfill --limit=30 2>&1 | sed 's/^/  /' || true
  "${COMPOSE[@]}" exec -T web php artisan stats:rollup >/dev/null 2>&1 || true
fi

# ── Xong ─────────────────────────────────────────────────────────────────────
scheme="https"; [ "$DOMAIN" = "localhost" ] && scheme="http"

echo
bold "═══════════════════════════════════════════════════════"
bold "  Cài đặt xong"
bold "═══════════════════════════════════════════════════════"
echo
echo "  Website tin tức   ${scheme}://${DOMAIN}"
echo "  Khu quản trị      ${scheme}://${DOMAIN}/admin"
echo "  CMS dựng video    ${scheme}://${CMS_DOMAIN}"
[ -n "${GRAFANA_DOMAIN:-}" ] && echo "  Giám sát          ${scheme}://${GRAFANA_DOMAIN}"
echo

if [ "$CREATED_ADMIN" = true ]; then
  bold "  Đăng nhập lần đầu"
  echo "    email    ${ADMIN_EMAIL}"
  echo "    mật khẩu ${ADMIN_PASS}"
  warn "Chép mật khẩu này ra chỗ khác — nó không hiện lại lần nữa."
  echo
fi

if [ "$DOMAIN" = "localhost" ]; then
  warn "Đang dùng localhost nên chưa có HTTPS. Chạy thật thì:"
  echo "      ./deploy/install.sh --domain tenmien.vn --email ban@tenmien.vn"
  echo
fi

bold "  Lệnh hay dùng"
echo "    make -C deploy logs      xem log"
echo "    make -C deploy ps        trạng thái dịch vụ"
echo "    make -C deploy update    kéo mã mới rồi dựng lại"
echo "    make -C deploy backup    sao lưu ngay"
echo "    make -C deploy help      danh sách đầy đủ"
echo
