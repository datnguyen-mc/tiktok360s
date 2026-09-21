#!/bin/sh
# Chuẩn bị ứng dụng trước khi nhận request.
set -e

cd /var/www/html

# APP_KEY bắt buộc phải có và phải ỔN ĐỊNH: token TikTok trong DB được mã hoá bằng
# nó, đổi khoá là mất hết. Sinh tạm chỉ để container không chết khi chạy thử.
if [ -z "$APP_KEY" ]; then
  echo "⚠ Chưa đặt APP_KEY — sinh khoá tạm. Token đã mã hoá sẽ KHÔNG đọc được."
  export APP_KEY="base64:$(head -c 32 /dev/urandom | base64)"
fi

# Chạy ở đây thay vì lúc build: giờ mới có đủ biến môi trường.
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

if [ "$RUN_MIGRATIONS" != "false" ]; then
  echo "▶ Chạy migration…"
  php artisan migrate --force
fi

# Cache cấu hình cho bản chạy thật; bỏ qua nếu đang phát triển
if [ "$APP_ENV" = "production" ]; then
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
fi

php artisan storage:link 2>/dev/null || true

echo "▶ Khởi động…"
exec "$@"
