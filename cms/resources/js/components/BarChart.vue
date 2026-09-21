<script setup>
/*
 * Số tin lấy từ mỗi báo. Một chuỗi duy nhất nên không cần chú giải — tiêu đề
 * đã nói rõ đang đo gì. Giá trị gắn thẳng ở đầu cột, khỏi phải dò trục.
 */
import { computed, ref } from 'vue'

const props = defineProps({
  data:  { type: Array, required: true },   // [{ source, total }]
  limit: { type: Number, default: 8 },
})

const hover = ref(null)
const rows = computed(() => props.data.slice(0, props.limit))
const max = computed(() => Math.max(1, ...rows.value.map((r) => r.total)))
const totalAll = computed(() => props.data.reduce((s, r) => s + r.total, 0))
</script>

<template>
  <div v-if="!rows.length" class="grid h-40 place-items-center text-sm text-ink-muted">
    Chưa có dữ liệu
  </div>

  <div v-else class="space-y-2.5">
    <div
      v-for="r in rows" :key="r.source"
      class="group grid grid-cols-[104px_1fr_auto] items-center gap-3"
      @mouseenter="hover = r.source" @mouseleave="hover = null"
    >
      <span class="truncate text-[13px] text-ink-2">{{ r.source }}</span>

      <!-- Rãnh nền + cột bo đầu 4px, neo vào mốc 0 -->
      <span class="relative h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
        <span
          class="absolute inset-y-0 left-0 rounded-full transition-[width,opacity] duration-300"
          :style="{
            width: `${(r.total / max) * 100}%`,
            background: 'var(--color-series-1)',
            opacity: hover && hover !== r.source ? 0.45 : 1,
          }"
        ></span>
      </span>

      <span class="tnum w-16 text-right text-[13px] font-semibold">
        {{ r.total }}
        <span class="ml-1 text-[11px] font-normal text-ink-muted">
          {{ totalAll ? Math.round((r.total / totalAll) * 100) : 0 }}%
        </span>
      </span>
    </div>
  </div>
</template>
