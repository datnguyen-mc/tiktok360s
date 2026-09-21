<script setup>
defineProps({
  message: { type: String, default: '' },
  tone:    { type: String, default: 'good' },
})
defineEmits(['close'])
</script>

<template>
  <Transition name="fade">
    <div v-if="message"
         class="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl
                border border-line bg-surface-2 px-4 py-3 text-sm shadow-2xl">
      <span class="size-2 rounded-full"
            :style="{ background: tone === 'critical' ? 'var(--color-critical)' : 'var(--color-good)' }"></span>
      <span class="max-w-md">{{ message }}</span>
      <button class="btn btn-ghost !p-1 text-ink-muted" @click="$emit('close')">✕</button>
    </div>
  </Transition>
</template>
