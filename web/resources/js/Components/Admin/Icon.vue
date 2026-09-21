<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: String, default: 'size-4' },
})

// Một chỗ duy nhất giữ hình vẽ, để cùng một hành động luôn cùng một biểu tượng
// ở mọi trang — biểu tượng mỗi nơi một kiểu thì người dùng phải đọc lại từ đầu.
const P = {
  plus:    ['M12 5v14M5 12h14'],
  edit:    ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'],
  trash:   ['M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6'],
  eye:     ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  external:['M7 17 17 7M9 7h8v8'],
  search:  ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z', 'M20 20l-3.5-3.5'],
  check:   ['m5 13 4 4L19 7'],
  x:       ['M18 6 6 18M6 6l12 12'],
  copy:    ['M9 9h10v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'],
  image:   ['M3 3h18v18H3z', 'M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3', 'm21 16-5-5L5 21'],
  back:    ['M19 12H5M12 19l-7-7 7-7'],
  save:    ['M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z', 'M17 21v-8H7v8', 'M7 3v5h8'],
  link:    ['M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1', 'M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1'],
  refresh: ['M21 12a9 9 0 1 1-3-6.7', 'M21 3v6h-6'],
  ban:     ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M5 5l14 14'],
  flag:    ['M4 22V4M4 4h13l-2 4 2 4H4'],
  star:    ['m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-2.9-5.5 2.9 1-6.1L3 9.5l6.3-.9z'],
  up:      ['M12 19V5M5 12l7-7 7 7'],
  down:    ['M12 5v14M19 12l-7 7-7-7'],
}
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
       stroke-linecap="round" stroke-linejoin="round" :class="size" aria-hidden="true">
    <path v-for="(d, i) in P[name]" :key="i" :d="d" />
  </svg>
</template>
