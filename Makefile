# Quy trình video tin showbiz hằng ngày cho TikTok
PY := ./.venv/bin/python
DATE_TODAY := $(shell date +%F)
# Chủ đề kênh: make video TOPIC=bongda
TOPIC ?= showbiz
T := --topic $(TOPIC)
DATE := $(DATE_TODAY)

.PHONY: help setup news script video rerender preview voices calibrate open clean clean-all \
        cms-up cms-down cms-push cms-logs cms-shell r2-check r2-push

help:            ## Xem danh sách lệnh
	@grep -E '^[a-z-]+:.*?## ' $(MAKEFILE_LIST) | awk -F':.*?## ' '{printf "  make %-12s %s\n", $$1, $$2}'
	@echo ""
	@echo "  Chủ đề: thêm TOPIC=<mã> vào bất kỳ lệnh nào, vd: make video TOPIC=bongda"
	@printf "  Hiện có: "; ls topics/*.json 2>/dev/null | xargs -n1 basename 2>/dev/null | sed 's/.json//' | tr '\n' ' '; echo

setup:           ## Cài ffmpeg, thư viện Python, font (chạy 1 lần)
	@bash setup.sh

news:            ## B1 — chỉ lấy tin, xem thử bảng xếp hạng
	@$(PY) -m pipeline.fetch_news $(T)

script:          ## B2 — dựng kịch bản hôm nay, chưa render (sửa tay được)
	@$(PY) -m pipeline.run_daily $(T) --script-only

video:           ## Chạy trọn quy trình, ra video hôm nay
	@$(PY) -m pipeline.run_daily $(T)

rerender:        ## Render lại từ kịch bản đã sửa tay trong output/<hôm nay>/script.json
	@$(PY) -m pipeline.run_daily $(T) --script output/$(TOPIC)/$(DATE)/script.json

preview:         ## Render nhanh bản nháp (1 tin, để xem bố cục)
	@$(PY) -m pipeline.run_daily $(T) --items 1 --keep-work

calibrate:       ## Xem tham số thời lượng + sai số qua các lần render
	@$(PY) -m pipeline.calibrate $(T)

open:            ## Mở thư mục kết quả hôm nay
	@open output/$(TOPIC)/$(DATE) 2>/dev/null || echo "Chưa có output/$(TOPIC)/$(DATE)"

cms-up:          ## Bật CMS (MySQL + web) tại http://localhost:8000
	@docker compose -f cms/docker-compose.yml up -d
	@cd cms && php artisan migrate --force >/dev/null 2>&1 || true
	@echo "MySQL sẵn sàng · đang khởi động web…"
	@cd cms && php artisan serve --host=127.0.0.1 --port=8000

cms-down:        ## Tắt MySQL của CMS
	@docker compose -f cms/docker-compose.yml down
	@echo "đã tắt MySQL"

cms-push:        ## Nạp lại dữ liệu một ngày vào CMS: make cms-push DATE=2026-09-21
	@$(PY) -c "from pipeline.common import load_config; from pipeline import cms; \
		cms.push_from_output('$(or $(DATE),$(DATE_TODAY))', load_config())"

cms-backfill:    ## Nạp lại TOÀN BỘ output đã render vào CMS
	@for d in output/20*/; do \
		$(PY) -c "from pipeline.common import load_config; from pipeline import cms; \
			cms.push_from_output('$$(basename $$d)', load_config())"; \
	done

r2-check:        ## Kiểm tra cấu hình R2 đã đủ khoá chưa
	@$(PY) -m pipeline.r2 --check --topic $(or $(TOPIC),showbiz)

r2-push:         ## Tải video một ngày lên R2: make r2-push TOPIC=chomeo DATE=2026-09-22
	@$(PY) -m pipeline.r2 --topic $(or $(TOPIC),showbiz) --date $(or $(DATE),$(DATE_TODAY))

cms-logs:        ## Xem log lần chạy do CMS kích hoạt
	@tail -40 logs/cms-trigger.log 2>/dev/null || echo "chưa có log"

clean:           ## Xoá file trung gian
	@rm -rf output/*/_work output/news.json output/script.json output/_work
	@echo "đã dọn file trung gian"

clean-all: clean ## Xoá cả video đã render và cache ảnh
	@rm -rf output/20* assets/broll/_cache
	@echo "đã dọn toàn bộ output"

voices:          ## Nghe thử giọng của từng chủ đề (thêm ALL=1 để nghe cả 14 giọng)
	@$(PY) -m pipeline.voices $(if $(ALL),,--topics)
