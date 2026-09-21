<script setup>
/* Ô số liệu: con số là nhân vật chính, nhãn và diễn giải lùi về sau. */
defineProps({
  label:  { type: String, required: true },
  value:  { type: [String, Number], required: true },
  unit:   { type: String, default: '' },
  hint:   { type: String, default: '' },
  tone:   { type: String, default: 'neutral' },   // neutral | good | warning | critical
  icon:   { type: String, default: '' },
})

const toneColor = {
  neutral:  'var(--color-ink)',
  good:     'var(--color-good)',
  warning:  'var(--color-warning)',
  critical: 'var(--color-critical)',
}
</script>

<template>
  <div class="card p-4">
    <div class="flex items-start justify-between gap-2">
      <span class="label">{{ label }}</span>
      <span v-if="icon" class="text-ink-muted" v-html="icon"></span>
    </div>
    <div class="mt-2 flex items-baseline gap-1">
      <span class="text-[28px] font-bold leading-none tracking-tight"
            :style="{ color: toneColor[tone] || toneColor.neutral }">{{ value }}</span>
      <span v-if="unit" class="text-sm font-medium text-ink-muted">{{ unit }}</span>
    </div>
    <p v-if="hint" class="mt-1.5 text-[11px] leading-snug text-ink-muted">{{ hint }}</p>
  </div>
</template>
