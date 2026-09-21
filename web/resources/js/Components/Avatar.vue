<script setup>
import { computed } from 'vue'

const props = defineProps({
  user: { type: Object, default: null },
  size: { type: String, default: 'size-9' },
})

const name = computed(() => props.user?.name || 'Ẩn danh')

// Màu nền suy ra từ tên: cùng một người luôn ra cùng một màu, không cần lưu gì.
const PALETTE = ['#FE2C55', '#0A9CB0', '#7C3AED', '#EA580C', '#059669', '#2563EB']
const color = computed(() => {
  let h = 0
  for (const c of name.value) h = (h * 31 + c.codePointAt(0)) >>> 0
  return PALETTE[h % PALETTE.length]
})
</script>

<template>
  <img v-if="user?.avatar_url" :src="user.avatar_url" :alt="name"
       :class="['shrink-0 rounded-full object-cover', size]" loading="lazy" />
  <span v-else :class="['grid shrink-0 place-items-center rounded-full font-bold text-white', size]"
        :style="{ background: color }" aria-hidden="true">
    {{ name.charAt(0).toUpperCase() }}
  </span>
</template>
