#!/usr/bin/env bash
# Tệp này đã được thay bằng install.sh (gọn hơn, và cài luôn cả website tin tức).
echo "→ Dùng ./deploy/install.sh thay cho tệp này."
echo "   ./deploy/install.sh --domain tenmien.vn --email ban@tenmien.vn"
exec "$(dirname "$0")/install.sh" "$@"
