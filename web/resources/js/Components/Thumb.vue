<script setup>
/*
 * Ảnh bài viết.
 *
 * Ảnh lấy từ RSS của các báo nên khoảng vài phần trăm là link hỏng, đổi đường
 * dẫn, hoặc chặn hotlink. Thẻ <img> trần khi hỏng sẽ hiện chữ alt — với tiêu đề
 * tiếng Việt dài, chữ xổ dọc và phá vỡ cả lưới. Component này giữ nguyên khung
 * và thay bằng một ô nền khi ảnh không tải được.
 */
import { ref } from 'vue'

defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  ratio: { type: String, default: 'aspect-[16/10]' },
  rounded: { type: String, default: 'rounded-xl' },
  eager: { type: Boolean, default: false },
})

const failed = ref(false)
</script>

<template>
  <span class="block overflow-hidden bg-surface-2" :class="[ratio, rounded]">
    <img v-if="src && !failed" :src="src" :alt="alt"
         :loading="eager ? 'eager' : 'lazy'"
         :fetchpriority="eager ? 'high' : 'auto'"
         decoding="async"
         class="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
         @error="failed = true" />

    <!-- Ô trống thay ảnh hỏng: giữ đúng khung, không đẩy chữ -->
    <span v-else class="grid size-full place-items-center text-ink-muted/40">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" class="size-6">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="m21 16-5-5L5 19" />
      </svg>
    </span>
  </span>
</template>
