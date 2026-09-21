#!/bin/sh
# Bộ hẹn giờ cho dây chuyền dựng video, chạy ngay trong container.
#
# Vì sao không dùng cron của máy chủ hay ofelia: cả hai đều cần gắn
# /var/run/docker.sock vào container, tức là cấp quyền ngang root trên máy chủ.
# Một vòng lặp ngủ–chạy không cần quyền gì cả, và log nằm chung với container.
set -eu

SCHEDULE_TIME="${SCHEDULE_TIME:-07:30}"
RUN_ON_START="${RUN_ON_START:-false}"

log() { echo "[$(date '+%F %T %Z')] $*"; }

run_pipeline() {
  log "▶ Bắt đầu dựng video"
  if python -m pipeline.run_daily; then
    log "✓ Xong"
  else
    log "✗ Thất bại (mã $?) — thử lại vào ngày mai"
  fi
}

log "Bộ hẹn giờ khởi động · múi giờ ${TZ:-UTC} · chạy lúc ${SCHEDULE_TIME} mỗi ngày"

# Viết dạng if chứ không phải `[ ... ] && cmd`: dưới `set -e`, một phép kiểm tra
# sai ở cuối câu lệnh sẽ làm thoát cả script.
if [ "$RUN_ON_START" = "true" ]; then
  run_pipeline
fi

while true; do
  now=$(date +%s)
  target=$(date -d "today ${SCHEDULE_TIME}" +%s 2>/dev/null) || \
  target=$(date -j -f "%Y-%m-%d %H:%M" "$(date +%F) ${SCHEDULE_TIME}" +%s)

  # Đã qua giờ hôm nay thì hẹn sang ngày mai
  [ "$target" -le "$now" ] && target=$((target + 86400))

  wait_for=$((target - now))
  log "Chờ ${wait_for}s tới $(date -d "@${target}" '+%F %T' 2>/dev/null || date -r "${target}" '+%F %T')"
  sleep "$wait_for"
  run_pipeline
done
