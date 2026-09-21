<script setup>
import { fmtNumber } from '../../format'

defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], default: 0 },
  hint: { type: String, default: '' },
  tone: { type: String, default: 'ink' },   // ink | accent | cyan
  icon: { type: String, default: '' },
})

const TONES = {
  ink:    { bg: 'var(--color-surface-2)', fg: 'var(--color-ink-2)' },
  accent: { bg: 'var(--color-accent-soft)', fg: 'var(--color-accent-ink)' },
  cyan:   { bg: 'color-mix(in srgb, var(--color-cyan) 12%, transparent)', fg: 'var(--color-cyan)' },
}
</script>

<template>
  <div class="adm-card flex items-center gap-3 p-3.5">
    <span v-if="icon" class="grid size-9 shrink-0 place-items-center rounded-lg"
          :style="{ background: TONES[tone].bg, color: TONES[tone].fg }">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
           class="size-[18px]" stroke-linecap="round" stroke-linejoin="round">
        <path :d="icon" />
      </svg>
    </span>

    <div class="min-w-0">
      <p class="truncate text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">
        {{ label }}
      </p>
      <p class="text-[22px] font-extrabold leading-tight tabular-nums">
        {{ typeof value === 'number' ? fmtNumber(value) : value }}
      </p>
      <p v-if="hint" class="text-[11.5px] font-semibold text-cyan">{{ hint }}</p>
    </div>
  </div>
</template>
