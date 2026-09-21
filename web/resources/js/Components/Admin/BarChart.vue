<script setup>
import { computed } from 'vue'
import { fmtNumber } from '../../format'

const props = defineProps({
  data: { type: Array, required: true },   // [{ label, value, sub? }]
  height: { type: Number, default: 150 },
  color: { type: String, default: 'var(--color-accent)' },
  everyNth: { type: Number, default: 1 },  // chỉ ghi nhãn mỗi N cột khi quá dày
})

const peak = computed(() => Math.max(1, ...props.data.map((d) => d.value)))
</script>

<template>
  <div v-if="data.length" class="flex items-end gap-[3px]" :style="{ height: height + 'px' }">
    <div v-for="(d, i) in data" :key="i"
         class="group relative flex h-full flex-1 flex-col justify-end">
      <!-- Chú giải nổi: cột mảnh nên không ghi số lên từng cột được -->
      <span class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden
                   -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1
                   text-[11px] font-semibold text-page group-hover:block">
        {{ d.label }} · {{ fmtNumber(d.value) }}{{ d.sub ? ` · ${d.sub}` : '' }}
      </span>

      <div class="w-full rounded-t transition-opacity group-hover:opacity-80"
           :style="{ height: `${Math.max(2, (d.value / peak) * 100)}%`, background: color }"></div>
    </div>
  </div>

  <div v-if="data.length" class="mt-1.5 flex gap-[3px]">
    <span v-for="(d, i) in data" :key="i"
          class="flex-1 truncate text-center text-[9.5px] text-ink-muted tabular-nums">
      {{ i % everyNth === 0 ? d.label : '' }}
    </span>
  </div>
</template>
