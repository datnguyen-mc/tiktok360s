<script setup>
import { Link } from '@inertiajs/vue3'
import Thumb from './Thumb.vue'
import { fmtAgo, fmtNumber } from '../format'

defineProps({ sidebar: { type: Object, default: () => ({}) } })
</script>

<template>
  <aside class="space-y-6">
    <!-- Đọc nhiều: xếp hạng nên đánh số, người đọc quét rất nhanh -->
    <section v-if="sidebar.popular?.length" class="card p-4">
      <h2 class="mb-3 flex items-center gap-2 text-[14px] font-extrabold tracking-tight">
        <span class="inline-block size-2 rounded-full bg-accent"></span>
        Đọc nhiều trong tuần
      </h2>
      <ol class="space-y-3">
        <li v-for="(a, i) in sidebar.popular" :key="a.id">
          <Link :href="`/news/${a.slug}`" class="group flex gap-3">
            <span class="w-5 shrink-0 text-[18px] font-extrabold leading-none text-ink-muted/50
                         tabular-nums">{{ i + 1 }}</span>
            <span class="min-w-0 flex-1">
              <span class="block text-[13.5px] font-semibold leading-snug clamp-3
                           transition group-hover:text-accent-ink">{{ a.title }}</span>
              <span v-if="a.views" class="mt-0.5 block text-[11px] text-ink-muted">
                {{ fmtNumber(a.views) }} lượt xem
              </span>
            </span>
          </Link>
        </li>
      </ol>
    </section>

    <!-- Mới nhất -->
    <section v-if="sidebar.latest?.length" class="card p-4">
      <h2 class="mb-3 text-[14px] font-extrabold tracking-tight">Mới cập nhật</h2>
      <ul class="divide-y divide-line">
        <li v-for="a in sidebar.latest" :key="a.id" class="py-2.5 first:pt-0 last:pb-0">
          <Link :href="`/news/${a.slug}`" class="group flex gap-2.5">
            <Thumb :src="a.image_url" :alt="a.title" ratio="size-12 shrink-0"
                   rounded="rounded-lg" class="shrink-0" />
            <span class="min-w-0">
              <span class="block text-[13px] font-semibold leading-snug clamp-2
                           transition group-hover:text-accent-ink">{{ a.title }}</span>
              <span class="mt-0.5 block text-[11px] text-ink-muted">{{ fmtAgo(a.published_at) }}</span>
            </span>
          </Link>
        </li>
      </ul>
    </section>

    <!-- Chuyên mục -->
    <section v-if="sidebar.categories?.length" class="card p-4">
      <h2 class="mb-3 text-[14px] font-extrabold tracking-tight">Chuyên mục</h2>
      <ul class="space-y-1">
        <li v-for="c in sidebar.categories" :key="c.slug">
          <Link :href="`/category/${c.slug}`"
                class="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13.5px]
                       font-semibold transition hover:bg-surface">
            <span class="size-2 shrink-0 rounded-full" :style="{ background: c.color }"></span>
            <span class="flex-1">{{ c.name }}</span>
            <span class="text-[11.5px] font-normal tabular-nums text-ink-muted">
              {{ c.articles_count }}
            </span>
          </Link>
        </li>
      </ul>
    </section>

    <!-- Theo dõi -->
    <section class="card p-4">
      <h2 class="text-[14px] font-extrabold tracking-tight">Theo dõi</h2>
      <p class="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
        Nhận tin mới qua trình đọc RSS của bạn.
      </p>
      <a href="/rss.xml" class="btn mt-3 w-full !text-[13px]">
        <svg viewBox="0 0 24 24" fill="currentColor" class="size-4">
          <circle cx="6.18" cy="17.82" r="2.18" />
          <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z" />
        </svg>
        Đăng ký RSS
      </a>
    </section>
  </aside>
</template>
