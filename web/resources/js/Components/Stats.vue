<script setup>
import { computed } from 'vue'
import { fmtNumber } from '../format'

const props = defineProps({
  article: { type: Object, required: true },
  /** Ẩn thích/bình luận/chia sẻ khi bằng 0 — hàng toàn số 0 nhìn rất buồn.
   *  Riêng lượt xem thì luôn hiện: bài nào cũng có người mở, và đó là con số
   *  người đọc trông vào đầu tiên để biết tin có đáng đọc không. */
  hideZero: { type: Boolean, default: true },
})

const ICONS = {
  views: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z',
  likes: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z',
  comments: 'M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.4 8.4 0 1 1 21 11.5z',
  shares: 'M8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
}

const items = computed(() => {
  const a = props.article
  const raw = [
    { k: 'views',    n: a.views ?? 0,          label: 'lượt xem' },
    { k: 'likes',    n: a.likes_count ?? 0,    label: 'lượt thích' },
    { k: 'comments', n: a.comments_count ?? 0, label: 'bình luận' },
    { k: 'shares',   n: a.shares_count ?? 0,   label: 'lượt chia sẻ' },
  ]
  return props.hideZero ? raw.filter((x) => x.k === 'views' || x.n > 0) : raw
})
</script>

<template>
  <span v-if="items.length" class="flex items-center gap-2.5 text-[11.5px] text-ink-muted">
    <span v-for="s in items" :key="s.k" class="flex items-center gap-1">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
           class="size-[13px]" stroke-linecap="round" stroke-linejoin="round">
        <!-- Vòng tròn con mắt và ba chấm chia sẻ phải vẽ thêm, không nằm trong path chính -->
        <circle v-if="s.k === 'views'" cx="12" cy="12" r="3" />
        <template v-if="s.k === 'shares'">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        </template>
        <path :d="ICONS[s.k]" />
      </svg>
      <span class="tabular-nums">{{ fmtNumber(s.n) }}</span>
      <span class="sr-only">{{ s.label }}</span>
    </span>
  </span>
</template>
