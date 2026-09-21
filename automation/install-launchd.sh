#!/usr/bin/env bash
# Cài lịch chạy tự động 7:30 sáng mỗi ngày (macOS launchd).
# Gỡ bằng: bash automation/install-launchd.sh --uninstall
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LABEL="com.showbiz60s.daily"
TARGET="$HOME/Library/LaunchAgents/$LABEL.plist"

if [ "${1:-}" = "--uninstall" ]; then
  launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
  rm -f "$TARGET"
  echo "✓ Đã gỡ lịch chạy tự động."
  exit 0
fi

mkdir -p "$HOME/Library/LaunchAgents"
sed "s|__ROOT__|$ROOT|g" "$ROOT/automation/$LABEL.plist" > "$TARGET"

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$TARGET"

echo "✓ Đã cài lịch: 7:30 sáng mỗi ngày"
echo "  kiểm tra:  launchctl list | grep $LABEL"
echo "  chạy thử:  launchctl kickstart -k gui/$(id -u)/$LABEL"
echo "  log:       $ROOT/logs/"
