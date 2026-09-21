<script setup>
import { Link } from '@inertiajs/vue3'
import Thumb from './Thumb.vue'
import Stats from './Stats.vue'
import { fmtAgo } from '../format'

defineProps({
  article: { type: Object, required: true },
  size: { type: String, default: 'md' },   // sm | md | lg
  showExcerpt: { type: Boolean, default: false },
})
</script>

<template>
  <article class="group">
    <Link :href="`/news/${article.slug}`" class="block">
      <!-- Tỉ lệ cố định: ảnh báo lấy về đủ mọi kích thước, không ép thì lưới vỡ -->
      <Thumb :src="article.image_url" :alt="article.title"
             :ratio="size === 'lg' ? 'aspect-[16/9]' : 'aspect-[16/10]'" />

      <h3 class="mt-2.5 font-bold leading-snug clamp-3 transition group-hover:text-accent-ink"
          :class="{ 'text-[20px] leading-tight': size === 'lg',
                    'text-[15px]': size === 'md',
                    'text-[13.5px]': size === 'sm' }">
        {{ article.title }}
      </h3>

      <p v-if="showExcerpt && article.excerpt"
         class="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted clamp-2">
        {{ article.excerpt }}
      </p>

      <p class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-ink-muted">
        <span v-if="article.category"
              class="rounded px-1.5 py-0.5 font-semibold"
              :style="{ background: (article.category.color || '#FE2C55') + '1f',
                        color: article.category.color || '#FE2C55' }">
          {{ article.category.name }}
        </span>
        <span v-if="article.source">{{ article.source }}</span>
        <span v-if="article.published_at">·</span>
        <time v-if="article.published_at" :datetime="article.published_at">
          {{ fmtAgo(article.published_at) }}
        </time>
        <Stats :article="article" class="ml-0.5" />
      </p>
    </Link>
  </article>
</template>
