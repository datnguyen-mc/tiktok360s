<script setup>
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import Icon from './Icon.vue'

const props = defineProps({
  icon: { type: String, required: true },
  /** Bắt buộc: nút chỉ có hình thì trình đọc màn hình không đọc được gì. */
  label: { type: String, required: true },
  tone: { type: String, default: 'ink' },    // ink | danger | cyan
  /** 'button' | 'link' (điều hướng trong ứng dụng) | 'a' (ra ngoài, tải lại trang) */
  as: { type: String, default: 'button' },
  href: { type: String, default: null },
  target: { type: String, default: null },
})

// `link` đi qua Inertia nên không tải lại cả trang; `a` dành cho liên kết mở
// tab mới hoặc ra khỏi ứng dụng.
const tag = computed(() => ({ link: Link, a: 'a' })[props.as] ?? 'button')
</script>

<template>
  <component :is="tag" :href="href" :target="target"
             :type="as === 'button' ? 'button' : null"
             :class="['iconbtn', tone === 'danger' && 'iconbtn-danger', tone === 'cyan' && 'iconbtn-cyan']"
             :title="label" :aria-label="label">
    <Icon :name="icon" size="size-[15px]" />
    <span class="sr-only">{{ label }}</span>
  </component>
</template>
