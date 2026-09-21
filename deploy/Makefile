# Lối tắt cho các việc hay làm. Mọi lệnh chạy được từ bất kỳ đâu:
#   make -C deploy <lệnh>

SHELL := /bin/bash

# Khai -f tường minh thì compose không tự nạp override nữa — thêm bằng tay.
OVERRIDE := $(wildcard docker-compose.override.yml)
DC    := docker compose -f docker-compose.yml $(if $(OVERRIDE),-f $(OVERRIDE))
DCM   := $(DC) -f docker-compose.monitoring.yml

.DEFAULT_GOAL := help

.PHONY: help install up down restart build ps logs logs-web logs-cms logs-pipeline \
        shell shell-cms db backup restore fetch backfill seed stats video update monitoring \
        migrate clear-cache admin ssl-status prune

help: ## Danh sách lệnh
	@echo "Lệnh có sẵn:"
	@grep -E '^[a-z-]+:.*?## ' $(MAKEFILE_LIST) \
	  | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

install: ## Cài đặt lần đầu (hoặc chạy lại an toàn)
	@./install.sh

up: ## Khởi động tất cả
	@$(DC) up -d

down: ## Dừng tất cả (dữ liệu vẫn còn)
	@$(DC) down

restart: ## Khởi động lại tất cả
	@$(DC) restart

build: ## Dựng lại image rồi khởi động
	@$(DC) build --pull && $(DC) up -d

ps: ## Trạng thái dịch vụ
	@$(DC) ps

logs: ## Log tất cả (Ctrl-C để thoát)
	@$(DC) logs -f --tail 100

logs-web: ## Log website tin tức
	@$(DC) logs -f --tail 100 web

logs-cms: ## Log CMS video
	@$(DC) logs -f --tail 100 cms

logs-pipeline: ## Log dây chuyền dựng video
	@$(DC) logs -f --tail 100 pipeline

shell: ## Vào container website
	@$(DC) exec web sh

shell-cms: ## Vào container CMS
	@$(DC) exec cms sh

db: ## Mở dòng lệnh MySQL
	@$(DC) exec mysql sh -c 'mysql -uroot -p"$$MYSQL_ROOT_PASSWORD" "$$MYSQL_DATABASE"'

backup: ## Sao lưu cơ sở dữ liệu ngay
	@$(DC) exec -T mysql sh -c \
	  'mysqldump -uroot -p"$$MYSQL_ROOT_PASSWORD" --single-transaction --quick \
	   --default-character-set=utf8mb4 "$$MYSQL_DATABASE"' \
	  | gzip -9 > backup-$$(date +%F_%H%M).sql.gz
	@echo "→ backup-$$(date +%F_%H%M).sql.gz"

restore: ## Phục hồi từ tệp: make restore FILE=backup.sql.gz
	@test -n "$(FILE)" || { echo "Thiếu FILE=... "; exit 1; }
	@echo "Sẽ GHI ĐÈ toàn bộ cơ sở dữ liệu bằng $(FILE)."
	@read -p "Gõ 'dong y' để tiếp tục: " a; [ "$$a" = "dong y" ] || exit 1
	@gunzip -c "$(FILE)" | $(DC) exec -T mysql sh -c \
	  'mysql -uroot -p"$$MYSQL_ROOT_PASSWORD" "$$MYSQL_DATABASE"'
	@echo "Đã phục hồi."

fetch: ## Lấy tin ngay, không chờ lịch
	@$(DC) exec web php artisan news:fetch

backfill: ## Bổ sung nội dung và ảnh cho bài còn thiếu
	@$(DC) exec web php artisan news:backfill --limit=$(or $(LIMIT),40) --loop=$(or $(LOOP),3)

seed: ## Gieo chuyên mục mặc định (chỉ khi chưa có)
	@$(DC) exec web php artisan db:seed --force

stats: ## Gom số liệu truy cập ngay
	@$(DC) exec web php artisan stats:rollup

video: ## Dựng video ngay: make video TOPIC=showbiz
	@$(DC) exec pipeline python -m pipeline.run_daily --topic $(or $(TOPIC),showbiz)

migrate: ## Chạy migration cho cả hai ứng dụng
	@$(DC) exec cms php artisan migrate --force
	@$(DC) exec web php artisan migrate --force

clear-cache: ## Dọn cache của cả hai ứng dụng
	@$(DC) exec web php artisan cache:clear
	@$(DC) exec cms php artisan cache:clear

admin: ## Nâng một tài khoản lên quản trị: make admin EMAIL=ban@vidu.vn
	@test -n "$(EMAIL)" || { echo "Thiếu EMAIL=..."; exit 1; }
	@$(DC) exec -T web php artisan tinker --execute \
	  "\$$n = App\Models\User::where('email','$(EMAIL)')->update(['role'=>'admin']); \
	   echo \$$n ? 'Đã nâng quyền $(EMAIL)' : 'Không tìm thấy $(EMAIL)';"

update: ## Kéo mã mới, dựng lại, chạy migration
	@git pull
	@$(DC) build --pull
	@$(DC) up -d
	@$(MAKE) migrate
	@echo "Đã cập nhật."

monitoring: ## Bật Prometheus + Grafana + Loki
	@$(DCM) up -d
	@echo "Grafana: cổng 3000 (hoặc tên miền trong GRAFANA_DOMAIN)"

ssl-status: ## Xem tình trạng chứng chỉ HTTPS
	@$(DC) logs --tail 50 caddy | grep -iE 'certificate|acme|error' || echo "Không có gì đáng chú ý."

prune: ## Xoá image và lớp build không dùng tới
	@docker system prune -af --volumes=false
