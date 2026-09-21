<script setup>
defineProps({
  title: { type: String, required: true },
  hint:  { type: String, default: '' },
})
</script>

<template>
  <div class="grid place-items-center gap-2 py-14 text-center">
    <span class="grid size-11 place-items-center rounded-xl bg-surface-2 text-ink-muted">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="size-5">
        <path d="M3 7h18M3 12h18M3 17h10" stroke-linecap="round" />
      </svg>
    </span>
    <p class="text-sm font-semibold">{{ title }}</p>
    <p v-if="hint" class="max-w-sm text-xs leading-relaxed text-ink-muted">{{ hint }}</p>
    <slot />
  </div>
</template>
