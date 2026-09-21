<script setup>
defineProps({
  title: { type: String, default: 'Chưa có gì ở đây' },
  hint: { type: String, default: '' },
  icon: { type: String, default: 'M4 4h16v16H4zM8 9h8M8 13h5' },
})
</script>

<template>
  <div class="grid place-items-center px-6 py-16 text-center">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"
         class="size-11 text-ink-muted/40" stroke-linecap="round" stroke-linejoin="round">
      <path :d="icon" />
    </svg>
    <p class="mt-3.5 text-[14.5px] font-bold">{{ title }}</p>
    <p v-if="hint" class="mt-1 max-w-sm text-[13px] text-ink-muted">{{ hint }}</p>
    <div class="mt-4"><slot /></div>
  </div>
</template>
