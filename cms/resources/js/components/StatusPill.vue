<script setup>
/* Trạng thái luôn có chấm màu + chữ. Màu không bao giờ tự mang nghĩa. */
defineProps({
  label: { type: String, required: true },
  tone:  { type: String, default: 'neutral' },
})

const tones = {
  good:     { dot: 'var(--color-good)',     text: '#7ee27e', bg: 'rgba(12,163,12,.12)' },
  warning:  { dot: 'var(--color-warning)',  text: '#f8cf72', bg: 'rgba(250,178,25,.12)' },
  serious:  { dot: 'var(--color-serious)',  text: '#f0ad91', bg: 'rgba(236,131,90,.12)' },
  critical: { dot: 'var(--color-critical)', text: '#f08d8d', bg: 'rgba(208,59,59,.14)' },
  neutral:  { dot: '#8b8b9b',               text: '#a8a8b8', bg: 'rgba(255,255,255,.06)' },
}
</script>

<template>
  <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold
               whitespace-nowrap"
        :style="{ background: (tones[tone] || tones.neutral).bg, color: (tones[tone] || tones.neutral).text }">
    <span class="size-1.5 rounded-full" :style="{ background: (tones[tone] || tones.neutral).dot }"></span>
    {{ label }}
  </span>
</template>
