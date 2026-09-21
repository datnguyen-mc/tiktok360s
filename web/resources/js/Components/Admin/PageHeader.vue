<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <header class="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div class="min-w-0">
      <h1 class="text-[22px] font-extrabold leading-tight tracking-tight">{{ title }}</h1>
      <p v-if="subtitle" class="mt-0.5 text-[13px] text-ink-muted">{{ subtitle }}</p>
    </div>
    <div class="flex flex-wrap items-center gap-2"><slot name="actions" /></div>
  </header>
</template>
