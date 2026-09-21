<script setup>
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import { fmtNumber } from '../format'

const props = defineProps({
  /** Nguyên đối tượng paginator của Laravel. */
  page: { type: Object, required: true },
  /** Nhãn cho dòng "Hiển thị 1–25 trong 597 <đơn vị>". */
  unit: { type: String, default: 'mục' },
})

const cur = computed(() => props.page.current_page || 1)
const last = computed(() => props.page.last_page || 1)

/**
 * Cửa sổ số trang: luôn có trang đầu và trang cuối, hai bên trang hiện tại hai
 * trang, chỗ đứt quãng thay bằng dấu ba chấm.
 *
 * Không dùng mảng `links` của Laravel vì nó dựng sẵn nhãn tiếng Anh
 * ("&laquo; Previous") và số lượng nút thì không điều khiển được.
 */
const pages = computed(() => {
  const n = last.value
  if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1)

  const out = new Set([1, n, cur.value])
  for (let d = 1; d <= 2; d++) {
    if (cur.value - d > 1) out.add(cur.value - d)
    if (cur.value + d < n) out.add(cur.value + d)
  }

  const sorted = [...out].sort((a, b) => a - b)
  const withGaps = []
  sorted.forEach((p, i) => {
    if (i && p - sorted[i - 1] > 1) withGaps.push('…')
    withGaps.push(p)
  })
  return withGaps
})

/** Giữ nguyên mọi tham số lọc/tìm kiếm đang có, chỉ đổi số trang. */
function url(p) {
  const base = props.page.path || (typeof window !== 'undefined' ? window.location.pathname : '')
  const params = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  )
  p === 1 ? params.delete('page') : params.set('page', p)
  const q = params.toString()
  return base + (q ? `?${q}` : '')
}
</script>

<template>
  <nav v-if="last > 1" class="flex flex-wrap items-center justify-between gap-3"
       aria-label="Phân trang">
    <p class="text-[12.5px] text-ink-muted tabular-nums">
      Hiển thị <strong class="font-semibold text-ink-2">{{ fmtNumber(page.from) }}–{{ fmtNumber(page.to) }}</strong>
      trong {{ fmtNumber(page.total) }} {{ unit }}
    </p>

    <div class="flex items-center gap-1">
      <!-- Trước -->
      <component :is="page.prev_page_url ? Link : 'span'"
                 :href="page.prev_page_url || undefined"
                 :preserve-scroll="page.prev_page_url ? true : undefined"
                 :class="['pg', !page.prev_page_url && 'pg-off']"
                 :aria-disabled="!page.prev_page_url" rel="prev">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="size-3.5">
          <path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="hidden sm:inline">Trước</span>
      </component>

      <!-- Số trang: màn hình hẹp thì gọn lại thành "2 / 24" -->
      <span class="px-2 text-[13px] font-semibold tabular-nums sm:hidden">
        {{ cur }} / {{ last }}
      </span>

      <template v-for="(p, i) in pages" :key="i">
        <span v-if="p === '…'" class="hidden px-1 text-[13px] text-ink-muted sm:inline">…</span>
        <Link v-else-if="p !== cur" :href="url(p)" preserve-scroll
              class="pg hidden tabular-nums sm:inline-flex">{{ p }}</Link>
        <span v-else class="pg pg-on hidden tabular-nums sm:inline-flex"
              aria-current="page">{{ p }}</span>
      </template>

      <!-- Sau -->
      <component :is="page.next_page_url ? Link : 'span'"
                 :href="page.next_page_url || undefined"
                 :preserve-scroll="page.next_page_url ? true : undefined"
                 :class="['pg', !page.next_page_url && 'pg-off']"
                 :aria-disabled="!page.next_page_url" rel="next">
        <span class="hidden sm:inline">Sau</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="size-3.5">
          <path d="m9 6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </component>
    </div>
  </nav>
</template>
