<script setup>
import { onMounted, ref } from 'vue'
import http from '../api'
import LineChart from '../components/LineChart.vue'
import BarChart from '../components/BarChart.vue'
import StatTile from '../components/StatTile.vue'
import StatusPill from '../components/StatusPill.vue'
import EmptyState from '../components/EmptyState.vue'
import { fmtDate, fmtDuration, fmtTime, RUN_STATUS } from '../format'

const data = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    data.value = (await http.get('dashboard')).data
  } finally {
    loading.value = false
  }
})

const levelTone = { info: 'neutral', warning: 'warning', error: 'critical' }
</script>

<template>
  <div v-if="loading" class="grid h-64 place-items-center text-sm text-ink-muted">Đang tải…</div>

  <div v-else-if="data" class="space-y-5">
    <!-- Số liệu 30 ngày -->
    <section>
      <h2 class="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">30 ngày gần nhất</h2>
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Video đã tạo" :value="data.kpi.runs_success"
                  :unit="`/ ${data.kpi.runs_total}`"
                  :hint="`Tỷ lệ thành công ${data.kpi.success_rate}%`"
                  :tone="data.kpi.success_rate >= 90 ? 'good' : data.kpi.success_rate >= 70 ? 'warning' : 'critical'" />
        <StatTile label="Tổng thời lượng" :value="data.kpi.total_minutes" unit="phút"
                  :hint="`Trung bình ${fmtDuration(data.kpi.avg_duration)} mỗi video`" />
        <StatTile label="Tin đã dùng" :value="data.kpi.items_used"
                  hint="Tổng số tin xuất hiện trong các video" />
        <StatTile label="Đã đăng TikTok" :value="data.kpi.published"
                  :hint="data.kpi.pending ? `${data.kpi.pending} job đang chờ xử lý` : 'Không có job nào đang chờ'"
                  :tone="data.kpi.pending ? 'warning' : 'neutral'" />
      </div>
    </section>

    <div class="grid gap-4 xl:grid-cols-3">
      <!-- Thời lượng -->
      <section class="card p-5 xl:col-span-2">
        <div class="mb-1 flex items-start justify-between gap-4">
          <div>
            <h2 class="text-sm font-bold">Thời lượng video theo ngày</h2>
            <p class="mt-0.5 text-xs text-ink-muted">
              Thực tế so với ước lượng lúc dựng kịch bản — sai số trung bình
              <strong class="text-ink-2">{{ data.kpi.avg_drift }}s</strong>
            </p>
          </div>
        </div>
        <LineChart :data="data.duration" />
      </section>

      <!-- Nguồn tin -->
      <section class="card p-5">
        <h2 class="text-sm font-bold">Tin theo nguồn</h2>
        <p class="mb-4 mt-0.5 text-xs text-ink-muted">
          Nguồn nào đang chiếm ưu thế — lệch quá thì chỉnh trọng số trong config.json
        </p>
        <BarChart :data="data.sources" />
      </section>
    </div>

    <div class="grid gap-4 xl:grid-cols-3">
      <!-- Video gần đây -->
      <section class="card xl:col-span-2">
        <div class="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 class="text-sm font-bold">Video gần đây</h2>
          <RouterLink to="/videos" class="text-xs font-semibold text-ink-2 hover:text-ink">Xem tất cả →</RouterLink>
        </div>

        <EmptyState v-if="!data.recent.length" title="Chưa có video nào"
                    hint="Chạy `make video` ở thư mục pipeline, dữ liệu sẽ tự xuất hiện ở đây." />

        <ul v-else class="divide-y divide-line">
          <li v-for="r in data.recent" :key="r.id">
            <RouterLink :to="`/videos/${r.id}`"
                        class="flex items-center gap-3.5 px-5 py-3 transition hover:bg-surface-2">
              <img v-if="r.thumbnail_path" :src="`/api/runs/${r.id}/thumbnail`" alt=""
                   class="h-12 w-[27px] shrink-0 rounded-md object-cover" loading="lazy" />
              <span v-else class="h-12 w-[27px] shrink-0 rounded-md bg-surface-3"></span>

              <span class="min-w-0 flex-1">
                <span class="block truncate text-[13px] font-semibold">{{ r.title || fmtDate(r.run_date) }}</span>
                <span class="block text-[11px] text-ink-muted">
                  {{ fmtDate(r.run_date) }} · {{ r.items_count }} tin · {{ fmtDuration(r.duration_sec) }}
                </span>
              </span>

              <StatusPill :label="RUN_STATUS[r.status]?.label || r.status"
                          :tone="RUN_STATUS[r.status]?.tone || 'neutral'" />
            </RouterLink>
          </li>
        </ul>
      </section>

      <!-- Nhật ký -->
      <section class="card">
        <div class="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 class="text-sm font-bold">Hoạt động</h2>
          <RouterLink to="/logs" class="text-xs font-semibold text-ink-2 hover:text-ink">Tất cả →</RouterLink>
        </div>

        <EmptyState v-if="!data.activity.length" title="Chưa có hoạt động" />

        <ul v-else class="max-h-[340px] divide-y divide-line overflow-y-auto">
          <li v-for="a in data.activity" :key="a.id" class="flex gap-2.5 px-5 py-2.5">
            <span class="mt-1.5 size-1.5 shrink-0 rounded-full"
                  :style="{ background: a.level === 'error' ? 'var(--color-critical)'
                                       : a.level === 'warning' ? 'var(--color-warning)' : '#8b8b9b' }"></span>
            <span class="min-w-0">
              <span class="block text-[12px] leading-snug">{{ a.message }}</span>
              <span class="block text-[10px] text-ink-muted">{{ fmtTime(a.created_at) }} · {{ a.event }}</span>
            </span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
