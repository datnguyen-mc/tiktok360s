#!/usr/bin/env bash
# Cài môi trường cho pipeline video showbiz. Chạy 1 lần: bash setup.sh
set -euo pipefail
cd "$(dirname "$0")"

echo "▶ Kiểm tra ffmpeg..."
if ! command -v ffmpeg >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    echo "  chưa có ffmpeg, đang cài qua Homebrew..."
    brew install ffmpeg
  else
    echo "  ✗ Chưa có ffmpeg và không tìm thấy Homebrew."
    echo "    macOS: cài Homebrew tại https://brew.sh rồi chạy: brew install ffmpeg"
    exit 1
  fi
fi
echo "  ✓ $(ffmpeg -version | head -1)"

echo "▶ Tạo môi trường Python..."
[ -d .venv ] || python3 -m venv .venv
./.venv/bin/pip install -q --upgrade pip
./.venv/bin/pip install -q -r requirements.txt
echo "  ✓ $(./.venv/bin/python --version)"

echo "▶ Kiểm tra font tiếng Việt..."
for f in BeVietnamPro-Bold BeVietnamPro-SemiBold BeVietnamPro-ExtraBold; do
  if [ ! -f "assets/fonts/$f.ttf" ]; then
    echo "  tải $f..."
    curl -sL -o "assets/fonts/$f.ttf" \
      "https://github.com/google/fonts/raw/main/ofl/bevietnampro/$f.ttf"
  fi
done
echo "  ✓ font sẵn sàng"

echo "▶ Thử kết nối giọng đọc..."
./.venv/bin/python - <<'PY'
import asyncio, edge_tts
async def main():
    voices = [v["ShortName"] for v in await edge_tts.list_voices() if v["Locale"] == "vi-VN"]
    print("  ✓ giọng tiếng Việt:", ", ".join(voices))
asyncio.run(main())
PY

echo
echo "Xong. Tạo video đầu tiên bằng:  make video"
