#!/bin/sh
# Chuẩn bị website tin tức trước khi nhận request.
set -e

cd /var/www/html

if [ -z "$APP_KEY" ]; then
  echo "⚠ Chưa đặt APP_KEY — sinh khoá tạm. Phiên đăng nhập sẽ mất sau mỗi lần khởi động lại."
  export APP_KEY="base64:$(head -c 32 /dev/urandom | base64)"
fi

php artisan package:discover --ansi >/dev/null

echo "▶ Chờ MySQL tại ${DB_HOST}:${DB_PORT}…"
for i in $(seq 1 60); do
  if php -r '
    try { new PDO(sprintf("mysql:host=%s;port=%s", getenv("DB_HOST"), getenv("DB_PORT")),
          getenv("DB_USERNAME"), getenv("DB_PASSWORD")); exit(0); }
    catch (Throwable $e) { exit(1); }' 2>/dev/null; then
    echo "  ✓ MySQL sẵn sàng"
    break
  fi
  [ "$i" = 60 ] && { echo "  ✗ MySQL không phản hồi sau 60 lần thử"; exit 1; }
  sleep 2
done

# Website dùng chung cơ sở dữ liệu với CMS nhưng có bảng lịch sử migration RIÊNG
# (`web_migrations`, khai trong config/database.php). Không tách thì hai ứng dụng
# tưởng migration của nhau là của mình và bỏ qua hết.
if [ "$RUN_MIGRATIONS" != "false" ]; then
  echo "▶ Chạy migration…"
  php artisan migrate --force
fi

if [ "$APP_ENV" = "production" ]; then
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
fi

php artisan storage:link 2>/dev/null || true

# Dọn cache nội dung: cấu hình site nằm trong đó, mà image mới có thể mang theo
# mã nguồn đã đổi cách dựng trang.
php artisan cache:clear 2>/dev/null || true

echo "▶ Khởi động (nginx + php-fpm + SSR + queue + scheduler)…"
exec "$@"
