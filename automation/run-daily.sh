#!/usr/bin/env bash
# Điểm vào cho lịch chạy tự động. Ghi log theo ngày, báo kết quả qua thông báo macOS.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DATE="$(date +%F)"
LOG="$ROOT/logs/$DATE.log"
mkdir -p "$ROOT/logs"

echo "===== $(date '+%F %T') · bắt đầu =====" >>"$LOG"
./.venv/bin/python -m pipeline.run_daily >>"$LOG" 2>&1
STATUS=$?
echo "===== $(date '+%F %T') · kết thúc (mã $STATUS) =====" >>"$LOG"

VIDEO="$(ls -1 "$ROOT/output/$DATE/"*.mp4 2>/dev/null | head -1)"
if [ "$STATUS" -eq 0 ] && [ -n "$VIDEO" ]; then
  osascript -e "display notification \"$(basename "$VIDEO")\" with title \"Video showbiz $DATE đã sẵn sàng\" sound name \"Glass\"" 2>/dev/null
else
  osascript -e "display notification \"Xem logs/$DATE.log\" with title \"Tạo video $DATE thất bại\" sound name \"Basso\"" 2>/dev/null
fi

# Giữ log 30 ngày gần nhất
find "$ROOT/logs" -name '*.log' -mtime +30 -delete 2>/dev/null
exit "$STATUS"
