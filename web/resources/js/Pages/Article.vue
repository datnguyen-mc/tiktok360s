<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { Link } from '@inertiajs/vue3'
import PublicLayout from '../Layouts/PublicLayout.vue'
import SeoHead from '../Components/SeoHead.vue'
import Sidebar from '../Components/Sidebar.vue'
import Thumb from '../Components/Thumb.vue'
import ReactionBar from '../Components/ReactionBar.vue'
import Comments from '../Components/Comments.vue'
import { fmtAgo, fmtDate, fmtNumber } from '../format'

const props = defineProps({
  article: { type: Object, required: true },
  related: { type: Array, default: () => [] },
  comments: { type: Array, default: () => [] },
  state: { type: Object, default: () => ({}) },
  sidebar: { type: Object, default: () => ({}) },
  seo: { type: Object, required: true },
})

// Thanh tiến độ đọc — người đọc biết còn bao nhiêu thì hết bài.
const body = ref(null)
const progress = ref(0)

function onScroll() {
  const el = body.value
  if (!el) return
  const top = el.offsetTop
  const done = window.scrollY + window.innerHeight * 0.75 - top
  progress.value = Math.min(100, Math.max(0, (done / el.offsetHeight) * 100))
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <SeoHead :seo="seo" />

  <PublicLayout>
    <!-- Tiến độ đọc: dính dưới thanh điều hướng -->
    <div class="sticky top-[57px] z-30 h-[3px] bg-transparent" aria-hidden="true">
      <div class="h-full bg-accent transition-[width] duration-150"
           :style="{ width: progress + '%' }"></div>
    </div>

    <div class="wrap">
      <!-- Đường dẫn phân cấp: vừa giúp người đọc, vừa khớp JSON-LD BreadcrumbList -->
      <nav class="mb-4 flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-muted"
           aria-label="Đường dẫn">
        <Link href="/" class="hover:text-ink">Trang chủ</Link>
        <template v-if="article.category">
          <span>/</span>
          <Link :href="`/category/${article.category.slug}`" class="hover:text-ink">
            {{ article.category.name }}
          </Link>
        </template>
      </nav>

      <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article class="relative">
          <h1 class="text-[26px] font-extrabold leading-tight tracking-tight sm:text-[32px]">
            {{ article.title }}
          </h1>

          <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted">
            <span v-if="article.category"
                  class="rounded px-2 py-0.5 font-semibold"
                  :style="{ background: (article.category.color || '#FE2C55') + '1f',
                            color: article.category.color || '#FE2C55' }">
              {{ article.category.name }}
            </span>
            <time v-if="article.published_at" :datetime="article.published_at">
              {{ fmtDate(article.published_at) }} · {{ fmtAgo(article.published_at) }}
            </time>
            <span v-if="article.reading_minutes">· {{ article.reading_minutes }} phút đọc</span>
            <span v-if="article.views">· {{ fmtNumber(article.views) }} lượt xem</span>
          </div>

          <figure v-if="article.image_url" class="mt-5">
            <!-- Ảnh đầu bài là LCP: KHÔNG lazy, và ưu tiên tải -->
            <img :src="article.image_url" :alt="article.title"
                 class="w-full rounded-xl object-cover" fetchpriority="high" decoding="async" />
            <figcaption v-if="article.source" class="mt-1.5 text-[12px] text-ink-muted">
              Ảnh: {{ article.source }}
            </figcaption>
          </figure>

          <!-- Thanh tương tác trên đầu: thấy ngay, không phải cuộn hết bài mới bấm được -->
          <ReactionBar class="mt-5" :article="article"
                       :liked="!!state.liked" :bookmarked="!!state.bookmarked" />

          <div ref="body">
            <p v-if="article.excerpt" class="mt-5 text-[17px] font-semibold leading-relaxed text-ink-2">
              {{ article.excerpt }}
            </p>

            <div v-if="article.content" class="prose-vi mt-5" v-html="article.content"></div>
          </div>

          <!-- Cột nút dọc bám theo màn hình, chỉ hiện trên màn hình thật rộng -->
          <div class="pointer-events-none absolute -left-20 top-0 hidden h-full 2xl:block">
            <div class="pointer-events-auto sticky top-24">
              <ReactionBar variant="rail" :article="article"
                           :liked="!!state.liked" :bookmarked="!!state.bookmarked" />
            </div>
          </div>

          <!-- Tin lấy từ RSS chỉ có sapo — dẫn thẳng sang bài gốc, không giữ chân người đọc -->
          <aside v-if="!article.content && article.source_url"
                 class="mt-6 rounded-xl border border-line bg-surface p-4">
            <p class="text-[13.5px] leading-relaxed text-ink-2">
              Đây là bản tóm tắt. Đọc toàn văn tại
              <strong>{{ article.source }}</strong>:
            </p>
            <a :href="article.source_url" target="_blank" rel="noopener nofollow"
               class="btn btn-primary mt-3">
              Đọc bài gốc
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-4">
                <path d="M7 17 17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </a>
          </aside>

          <p v-if="article.source_url && article.content" class="mt-6 text-[13px] text-ink-muted">
            Nguồn:
            <a :href="article.source_url" target="_blank" rel="noopener nofollow"
               class="text-accent-ink underline">{{ article.source }}</a>
          </p>

          <ReactionBar class="mt-6" :article="article"
                       :liked="!!state.liked" :bookmarked="!!state.bookmarked" />

          <Comments :article="article" :comments="comments"
                    :liked-comments="state.likedComments || []" />
        </article>

        <!-- Cột bên: tin liên quan rồi tới tin hot -->
        <div class="space-y-6">
        <aside v-if="related.length" class="card p-4">
          <h2 class="mb-3 text-[14px] font-extrabold tracking-tight">Tin liên quan</h2>
          <ul class="divide-y divide-line">
            <li v-for="a in related" :key="a.id" class="py-3 first:pt-0">
              <Link :href="`/news/${a.slug}`" class="group flex gap-3">
                <Thumb :src="a.image_url" :alt="a.title" ratio="size-[58px]"
                       rounded="rounded-lg" class="shrink-0" />
                <span class="min-w-0">
                  <span class="block text-[13.5px] font-semibold leading-snug clamp-3
                               transition group-hover:text-accent-ink">{{ a.title }}</span>
                  <span class="mt-1 block text-[11px] text-ink-muted">{{ fmtAgo(a.published_at) }}</span>
                </span>
              </Link>
            </li>
          </ul>
        </aside>

        <Sidebar :sidebar="sidebar" />
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
