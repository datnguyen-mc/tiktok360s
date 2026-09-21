<script setup>
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import { usePage } from '@inertiajs/vue3'
import AdminLayout from '../../Layouts/AdminLayout.vue'
import PageHeader from '../../Components/Admin/PageHeader.vue'
import StatTile from '../../Components/Admin/StatTile.vue'
import BarChart from '../../Components/Admin/BarChart.vue'
import { Head } from '@inertiajs/vue3'
import { fmtAgo, fmtNumber } from '../../format'

const props = defineProps({
  can: { type: Object, default: () => ({}) },
  traffic: { type: Object, default: null },
  kpi: { type: Object, required: true },
  daily: { type: Array, default: () => [] },
  byCategory: { type: Array, default: () => [] },
  topArticles: { type: Array, default: () => [] },
  recentComments: { type: Array, default: () => [] },
})

const can = computed(() => usePage().props.auth?.user?.can || {})

const ICON = {
  articles:  'M4 4h16v16H4zM8 8h8M8 12h8M8 16h5',
  views:     'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z',
  users:     'M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0',
  comments:  'M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.4 8.4 0 1 1 21 11.5z',
  likes:     'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z',
  bookmarks: 'm19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z',
}

const tiles = computed(() => [
  { k: 'articles',  label: 'Tổng bài viết', tone: 'accent',
    hint: `+${props.kpi.today} hôm nay`, need: 'articles.view' },
  { k: 'views',     label: 'Lượt xem', need: 'articles.view' },
  { k: 'users',     label: 'Độc giả', need: 'users.view' },
  { k: 'comments',  label: 'Bình luận', tone: 'cyan', need: 'comments.view',
    hint: props.kpi.pending ? `${props.kpi.pending} nghi spam` : null },
  { k: 'likes',     label: 'Lượt thích', need: 'articles.view' },
  { k: 'bookmarks', label: 'Lượt lưu', need: 'articles.view' },
].filter((t) => !t.need || can.value[t.need]))

// Cột ngày: chuẩn hoá theo giá trị lớn nhất, tối thiểu 1 để không chia cho 0.
const peak = computed(() => Math.max(1, ...props.daily.map((d) => d.count)))
const dayLabel = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })

// Chuyên mục nào lâu chưa lấy tin thì phải thấy ngay
const stale = (t) => t && (Date.now() - new Date(t).getTime()) / 3600000 > 26

const trafficChart = computed(() => (props.traffic?.series || []).map((s) => ({
  label: dayLabel(s.date), value: s.views, sub: `${s.visitors} khách`,
})))
</script>

<template>
  <Head title="Tổng quan" />

  <AdminLayout>
    <PageHeader title="Tổng quan"
                subtitle="Sức khoẻ của website trong 14 ngày gần nhất." />

    <!-- Số liệu chính -->
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatTile v-for="t in tiles" :key="t.k" :label="t.label" :value="kpi[t.k]"
                :hint="t.hint || ''" :tone="t.tone || 'ink'" :icon="ICON[t.k]" />
    </div>

    <!-- Truy cập hiện tại + 14 ngày -->
    <section v-if="traffic" class="adm-card mt-4 p-4">
      <div class="flex flex-wrap items-center gap-x-8 gap-y-3">
        <div class="flex items-center gap-2.5">
          <span class="relative flex size-2.5">
            <span class="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60"></span>
            <span class="relative inline-flex size-2.5 rounded-full bg-accent"></span>
          </span>
          <div>
            <p class="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">Đang đọc</p>
            <p class="text-[20px] font-extrabold leading-tight tabular-nums">
              {{ fmtNumber(traffic.online) }}
            </p>
          </div>
        </div>

        <div class="h-9 w-px bg-line"></div>

        <div>
          <p class="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">Hôm nay</p>
          <p class="text-[20px] font-extrabold leading-tight tabular-nums">
            {{ fmtNumber(traffic.today) }}
            <span class="text-[12px] font-semibold text-ink-muted">
              lượt xem · {{ fmtNumber(traffic.visitors) }} khách
            </span>
          </p>
        </div>

        <Link href="/admin/reports"
              class="ml-auto text-[12.5px] font-semibold text-accent-ink hover:underline">
          Báo cáo đầy đủ →
        </Link>
      </div>

      <BarChart v-if="traffic.series?.length" class="mt-4" :data="trafficChart"
                :height="110" :every-nth="2" />
      <p v-if="traffic.rolledAt" class="mt-2 text-[11.5px] text-ink-muted">
        Số liệu gom 10 phút một lần — lần gần nhất {{ fmtAgo(traffic.rolledAt) }}.
      </p>
    </section>

    <div class="mt-4 grid gap-5 xl:grid-cols-[1.3fr_1fr]">
      <!-- Bài đăng 14 ngày -->
      <section v-if="can.articles" class="adm-card p-4">
        <h2 class="text-[14px] font-extrabold tracking-tight">Bài đăng 14 ngày qua</h2>
        <p class="mt-0.5 text-[12px] text-ink-muted">
          Cột tụt xuống 0 nghĩa là hôm đó bộ lấy tin không chạy.
        </p>

        <div v-if="daily.length" class="mt-4 flex h-[150px] items-end gap-1.5">
          <div v-for="d in daily" :key="d.date" class="group relative flex flex-1 flex-col items-center gap-1.5">
            <span class="text-[10.5px] font-bold text-ink-muted tabular-nums">{{ d.count }}</span>
            <div class="w-full rounded-t bg-accent/85 transition group-hover:bg-accent"
                 :style="{ height: Math.max(3, (d.count / peak) * 110) + 'px' }"></div>
            <span class="text-[10px] text-ink-muted tabular-nums">{{ dayLabel(d.date) }}</span>
          </div>
        </div>
        <p v-else class="py-10 text-center text-[13px] text-ink-muted">Chưa có dữ liệu.</p>
      </section>

      <!-- Chuyên mục -->
      <section v-if="can.articles" class="adm-card p-4">
        <div class="flex items-center justify-between">
          <h2 class="text-[14px] font-extrabold tracking-tight">Theo chuyên mục</h2>
          <Link v-if="can.categories" href="/admin/categories"
                class="text-[12.5px] font-semibold text-accent-ink hover:underline">Quản lý →</Link>
        </div>

        <ul class="mt-3 space-y-2.5">
          <li v-for="c in byCategory" :key="c.slug" class="flex items-center gap-2.5">
            <span class="size-2 shrink-0 rounded-full" :style="{ background: c.color }"></span>
            <span class="w-[92px] shrink-0 truncate text-[13px] font-semibold">{{ c.name }}</span>
            <span class="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
              <span class="block h-full rounded-full"
                    :style="{ background: c.color,
                              width: (c.count / Math.max(1, ...byCategory.map(x => x.count)) * 100) + '%' }"></span>
            </span>
            <span class="w-10 shrink-0 text-right text-[12.5px] font-bold tabular-nums">{{ c.count }}</span>
            <span class="w-[74px] shrink-0 text-right text-[11px]"
                  :class="stale(c.fetched_at) ? 'font-bold text-accent-ink' : 'text-ink-muted'">
              {{ c.fetched_at ? fmtAgo(c.fetched_at) : 'chưa lấy' }}
            </span>
          </li>
        </ul>
      </section>
    </div>

    <div class="mt-4 grid gap-5 xl:grid-cols-2">
      <!-- Bài đọc nhiều -->
      <section v-if="can.articles" class="adm-card p-4">
        <h2 class="text-[14px] font-extrabold tracking-tight">Đọc nhiều nhất</h2>
        <ol class="mt-3 divide-y divide-line">
          <li v-for="(a, i) in topArticles" :key="a.id" class="flex items-center gap-3 py-2.5 first:pt-0">
            <span class="w-4 shrink-0 text-[13px] font-extrabold text-ink-muted tabular-nums">{{ i + 1 }}</span>
            <a :href="`/news/${a.slug}`" target="_blank"
               class="min-w-0 flex-1 truncate text-[13.5px] font-semibold hover:text-accent-ink">
              {{ a.title }}
            </a>
            <span class="shrink-0 text-[12px] text-ink-muted tabular-nums">
              {{ fmtNumber(a.views) }} xem · {{ a.likes_count }} ♥ · {{ a.comments_count }} 💬
            </span>
          </li>
        </ol>
        <p v-if="!topArticles.length" class="py-8 text-center text-[13px] text-ink-muted">Chưa có bài nào.</p>
      </section>

      <!-- Bình luận mới -->
      <section v-if="can.comments" class="adm-card p-4">
        <div class="flex items-center justify-between">
          <h2 class="text-[14px] font-extrabold tracking-tight">Bình luận mới</h2>
          <Link href="/admin/comments"
                class="text-[12.5px] font-semibold text-accent-ink hover:underline">Kiểm duyệt →</Link>
        </div>

        <ul class="mt-3 divide-y divide-line">
          <li v-for="c in recentComments" :key="c.id" class="py-2.5 first:pt-0">
            <p class="flex items-baseline gap-2">
              <span class="text-[13px] font-bold">{{ c.user?.name || 'Ẩn danh' }}</span>
              <span class="text-[11px] text-ink-muted">{{ fmtAgo(c.created_at) }}</span>
            </p>
            <p class="mt-0.5 line-clamp-2 text-[13px] text-ink-2">{{ c.body }}</p>
            <a v-if="c.article" :href="`/news/${c.article.slug}`" target="_blank"
               class="mt-0.5 block truncate text-[11.5px] text-ink-muted hover:text-accent-ink">
              ↳ {{ c.article.title }}
            </a>
          </li>
        </ul>
        <p v-if="!recentComments.length" class="py-8 text-center text-[13px] text-ink-muted">
          Chưa có bình luận nào.
        </p>
      </section>
    </div>
  </AdminLayout>
</template>
