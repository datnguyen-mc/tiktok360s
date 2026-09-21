<script setup>
import { Link, router } from '@inertiajs/vue3'
import PublicLayout from '../Layouts/PublicLayout.vue'
import SeoHead from '../Components/SeoHead.vue'
import Thumb from '../Components/Thumb.vue'
import Pagination from '../Components/Pagination.vue'
import { fmtAgo, fmtNumber } from '../format'

defineProps({
  bookmarks: { type: Object, required: true },
  seo: { type: Object, required: true },
})

function unsave(slug) {
  router.post(`/news/${slug}/save`, {}, { preserveScroll: true })
}
</script>

<template>
  <SeoHead :seo="seo" />

  <PublicLayout>
    <div class="wrap">
      <header class="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 class="text-[26px] font-extrabold tracking-tight">Bài đã lưu</h1>
          <p class="mt-1 text-[13.5px] text-ink-muted">
            {{ fmtNumber(bookmarks.total) }} bài bạn để dành đọc sau.
          </p>
        </div>
      </header>

      <ul v-if="bookmarks.data.length" class="grid gap-4 sm:grid-cols-2">
        <li v-for="b in bookmarks.data" :key="b.id"
            class="card group flex gap-3.5 p-3 transition hover:border-ink-muted/40">
          <Link :href="`/news/${b.article.slug}`" class="shrink-0">
            <Thumb :src="b.article.image_url" :alt="b.article.title"
                   ratio="h-[86px] w-[120px]" rounded="rounded-lg" />
          </Link>

          <div class="flex min-w-0 flex-1 flex-col">
            <Link :href="`/news/${b.article.slug}`" class="min-w-0">
              <span v-if="b.article.category" class="text-[11px] font-bold uppercase tracking-wide"
                    :style="{ color: b.article.category.color || '#FE2C55' }">
                {{ b.article.category.name }}
              </span>
              <p class="mt-0.5 text-[14px] font-bold leading-snug clamp-3
                        transition group-hover:text-accent-ink">{{ b.article.title }}</p>
            </Link>

            <div class="mt-auto flex items-center gap-2 pt-2 text-[11.5px] text-ink-muted">
              <span>Lưu {{ fmtAgo(b.created_at) }}</span>
              <button class="ml-auto cbtn hover:text-accent-ink" @click="unsave(b.article.slug)">
                Bỏ lưu
              </button>
            </div>
          </div>
        </li>
      </ul>

      <div v-else class="card grid place-items-center px-6 py-16 text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"
             class="size-12 text-ink-muted/50">
          <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke-linejoin="round" />
        </svg>
        <p class="mt-4 text-[15px] font-bold">Chưa lưu bài nào</p>
        <p class="mt-1 max-w-sm text-[13.5px] text-ink-muted">
          Bấm biểu tượng dấu trang ở bài viết để để dành đọc sau.
        </p>
        <Link href="/" class="btn btn-primary mt-5">Xem tin mới</Link>
      </div>

      <Pagination :page="bookmarks" unit="bài đã lưu" class="mt-8" />
    </div>
  </PublicLayout>
</template>
