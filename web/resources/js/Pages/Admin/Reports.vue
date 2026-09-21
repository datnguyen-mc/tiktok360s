<script setup>
import { computed } from 'vue'
import { Head, router } from '@inertiajs/vue3'
import AdminLayout from '../../Layouts/AdminLayout.vue'
import PageHeader from '../../Components/Admin/PageHeader.vue'
import StatTile from '../../Components/Admin/StatTile.vue'
import BarChart from '../../Components/Admin/BarChart.vue'
import EmptyState from '../../Components/Admin/EmptyState.vue'
import { fmtAgo, fmtNumber } from '../../format'

const props = defineProps({
  range: { type: Number, default: 30 },
  ranges: { type: Array, default: () => [] },
  series: { type: Array, default: () => [] },
  totals: { type: Object, default: () => ({}) },
  previous: { type: Object, default: () => ({}) },
  today: { type: Object, default: () => ({}) },
  byDevice: { type: Array, default: () => [] },
  byReferrer: { type: Array, default: () => [] },
  byCategory: { type: Array, default: () => [] },
  byHour: { type: Array, default: () => [] },
  topArticles: { type: Array, default: () => [] },
  rolledAt: { type: String, default: null },
})

const dm = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })

const chart = computed(() => props.series.map((s) => ({
  label: dm(s.date), value: s.views, sub: `${fmtNumber(s.visitors)} khách`,
})))

const hours = computed(() => props.byHour.map((n, h) => ({
  label: `${String(h).padStart(2, '0')}h`, value: n,
})))

/** Đổi so với kỳ liền trước. Con số trần không nói lên điều gì. */
function delta(key) {
  const now = props.totals[key] ?? 0
  const before = props.previous[key] ?? 0
  if (!before) return null
  return Math.round(((now - before) / before) * 100)
}

const ICON = {
  views:    'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z',
  visitors: 'M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0',
  comments: 'M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.4 8.4 0 1 1 21 11.5z',
  searches: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-3.5-3.5',
}

const setRange = (v) =>
  router.get('/admin/reports', { days: v }, { preserveState: true, replace: true })

const total = (rows) => rows.reduce((a, r) => a + r.value, 0) || 1
</script>

<template>
  <Head title="Báo cáo · Quản trị" />

  <AdminLayout>
    <PageHeader title="Báo cáo truy cập"
                :subtitle="rolledAt
                  ? `Số liệu gom 10 phút một lần — lần gần nhất ${fmtAgo(rolledAt)}.`
                  : 'Chưa có số liệu nào được gom. Chạy lệnh stats:rollup hoặc chờ lịch chạy.'">
      <template #actions>
        <div class="flex gap-1">
          <button v-for="r in ranges" :key="r.value"
                  :class="['adm-seg', range === r.value && 'adm-seg-on']"
                  @click="setRange(r.value)">{{ r.label }}</button>
        </div>
      </template>
    </PageHeader>

    <!-- Đang diễn ra: lấy thẳng từ bảng thô nên không phải chờ vòng gom -->
    <div class="adm-card mb-4 flex flex-wrap items-center gap-x-8 gap-y-3 p-4">
      <div class="flex items-center gap-2.5">
        <span class="relative flex size-2.5">
          <span class="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60"></span>
          <span class="relative inline-flex size-2.5 rounded-full bg-accent"></span>
        </span>
        <div>
          <p class="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">Đang đọc</p>
          <p class="text-[20px] font-extrabold leading-tight tabular-nums">
            {{ fmtNumber(today.online) }}
            <span class="text-[12px] font-semibold text-ink-muted">trong 5 phút qua</span>
          </p>
        </div>
      </div>

      <div class="h-9 w-px bg-line"></div>

      <div>
        <p class="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">Hôm nay</p>
        <p class="text-[20px] font-extrabold leading-tight tabular-nums">
          {{ fmtNumber(today.views) }}
          <span class="text-[12px] font-semibold text-ink-muted">
            lượt xem · {{ fmtNumber(today.visitors) }} khách
          </span>
        </p>
      </div>
    </div>

    <!-- Tổng trong kỳ -->
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile v-for="k in ['views', 'visitors', 'comments', 'searches']" :key="k"
                :label="{ views: 'Lượt xem', visitors: 'Khách truy cập',
                          comments: 'Bình luận', searches: 'Lượt tìm kiếm' }[k]"
                :value="totals[k] ?? 0" :icon="ICON[k]"
                :tone="k === 'views' ? 'accent' : k === 'visitors' ? 'cyan' : 'ink'"
                :hint="delta(k) === null ? '' :
                       `${delta(k) >= 0 ? '+' : ''}${delta(k)}% so với kỳ trước`" />
    </div>

    <!-- Lượt xem theo ngày -->
    <section class="adm-card mt-4 p-4">
      <div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 class="text-[14px] font-extrabold tracking-tight">Lượt xem theo ngày</h2>
        <p class="text-[12px] text-ink-muted">Rê chuột lên cột để xem chi tiết.</p>
      </div>
      <BarChart v-if="totals.views" :data="chart" :height="170"
                :every-nth="range > 30 ? 7 : range > 7 ? 3 : 1" />
      <EmptyState v-else title="Chưa có lượt truy cập nào được ghi"
                  hint="Số liệu bắt đầu có từ lần chạy stats:rollup đầu tiên sau khi bật theo dõi."
                  icon="M3 3v18h18M7 15l4-5 3 3 5-7" />
    </section>

    <div class="mt-4 grid gap-4 xl:grid-cols-2">
      <!-- Khung giờ -->
      <section class="adm-card p-4">
        <h2 class="text-[14px] font-extrabold tracking-tight">Khung giờ đọc nhiều</h2>
        <p class="mt-0.5 text-[12px] text-ink-muted">
          Cộng dồn cả kỳ — dùng để chọn giờ đăng bài.
        </p>
        <BarChart class="mt-3" :data="hours" :height="130" :every-nth="3"
                  color="var(--color-cyan)" />
      </section>

      <!-- Bài đọc nhiều -->
      <section class="adm-card p-4">
        <h2 class="text-[14px] font-extrabold tracking-tight">Bài đọc nhiều nhất</h2>
        <ol v-if="topArticles.length" class="mt-3 divide-y divide-line">
          <li v-for="(a, i) in topArticles" :key="a.id" class="flex items-center gap-3 py-2 first:pt-0">
            <span class="w-4 shrink-0 text-[13px] font-extrabold text-ink-muted tabular-nums">{{ i + 1 }}</span>
            <span class="min-w-0 flex-1 truncate text-[13px] font-semibold">{{ a.title }}</span>
            <span class="shrink-0 text-[12.5px] font-bold tabular-nums">{{ fmtNumber(a.views) }}</span>
          </li>
        </ol>
        <p v-else class="py-8 text-center text-[13px] text-ink-muted">Chưa có dữ liệu.</p>
      </section>
    </div>

    <div class="mt-4 grid gap-4 xl:grid-cols-3">
      <section v-for="s in [
                 { title: 'Thiết bị', rows: byDevice, empty: 'Chưa có dữ liệu.' },
                 { title: 'Nguồn dẫn', rows: byReferrer, empty: 'Chưa có ai vào từ trang khác.' },
                 { title: 'Chuyên mục được đọc', rows: byCategory, empty: 'Chưa có lượt đọc bài nào.' },
               ]" :key="s.title" class="adm-card p-4">
        <h2 class="text-[14px] font-extrabold tracking-tight">{{ s.title }}</h2>

        <ul v-if="s.rows.length" class="mt-3 space-y-2.5">
          <li v-for="r in s.rows" :key="r.label" class="flex items-center gap-2.5">
            <span class="w-[86px] shrink-0 truncate text-[12.5px] font-semibold">{{ r.label }}</span>
            <span class="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
              <span class="block h-full rounded-full bg-accent"
                    :style="{ width: (r.value / total(s.rows) * 100) + '%' }"></span>
            </span>
            <span class="w-12 shrink-0 text-right text-[12px] font-bold tabular-nums">
              {{ fmtNumber(r.value) }}
            </span>
          </li>
        </ul>
        <p v-else class="py-6 text-center text-[12.5px] text-ink-muted">{{ s.empty }}</p>
      </section>
    </div>
  </AdminLayout>
</template>
