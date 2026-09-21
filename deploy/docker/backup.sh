#!/bin/bash
# Sao lưu MySQL mỗi ngày lúc 03:00, giữ N ngày gần nhất.
#
# Chạy trong một container riêng thay vì cron trên máy chủ: cron của máy chủ
# không thấy được mạng nội bộ của Docker, mà mở cổng MySQL ra ngoài chỉ để sao
# lưu thì đánh đổi quá đắt.
set -euo pipefail

KEEP="${BACKUP_KEEP_DAYS:-14}"
DIR=/backups

mkdir -p "$DIR"

dump() {
  local stamp file
  stamp=$(date +%Y-%m-%d_%H%M)
  file="$DIR/${DB_DATABASE}_${stamp}.sql.gz"

  echo "[$(date '+%F %T')] sao lưu → $(basename "$file")"

  # --single-transaction: không khoá bảng, website vẫn chạy trong lúc sao lưu
  if mysqldump --host=mysql --user=root --password="$DB_ROOT_PASSWORD" \
       --single-transaction --quick --routines --events \
       --default-character-set=utf8mb4 \
       "$DB_DATABASE" | gzip -9 > "$file.tmp"; then
    # Chỉ đổi thành tên thật khi đã xong — nửa chừng mà đứt thì tệp .tmp bị bỏ
    # lại, còn bản sao lưu hợp lệ thì không bao giờ là bản cụt.
    mv "$file.tmp" "$file"
    echo "[$(date '+%F %T')] xong, $(du -h "$file" | cut -f1)"
  else
    rm -f "$file.tmp"
    echo "[$(date '+%F %T')] LỖI: sao lưu thất bại" >&2
    return 1
  fi

  find "$DIR" -name '*.sql.gz' -mtime +"$KEEP" -delete
}

# Sao lưu ngay khi khởi động, để không phải chờ tới 3 giờ sáng mới biết là hỏng
dump || true

while true; do
  # Ngủ tới 03:00 hôm sau
  now=$(date +%s)
  next=$(date -d 'tomorrow 03:00' +%s 2>/dev/null || date -v+1d -v3H -v0M -v0S +%s)
  sleep $(( next - now ))
  dump || true
done
