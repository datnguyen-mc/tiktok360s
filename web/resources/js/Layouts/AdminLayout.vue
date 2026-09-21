<script setup>
import { computed, ref } from 'vue'
import { Link, router, usePage } from '@inertiajs/vue3'

const page = usePage()
const site = computed(() => page.props.site || {})
const user = computed(() => page.props.auth?.user)
const can = computed(() => user.value?.can || {})
const flash = computed(() => page.props.flash || {})
const open = ref(false)

// Nhóm theo việc, không phải theo bảng dữ liệu — người dùng nghĩ "mình định làm
// gì", chứ không nghĩ "dữ liệu này nằm ở bảng nào".
const GROUPS = [
  {
    label: null,
    items: [
      { href: '/admin', label: 'Tổng quan', exact: true, need: null,
        d: 'M3 13h8V3H3zM13 21h8V11h-8zM13 3v6h8V3zM3 21h8v-6H3z' },
    ],
  },
  {
    label: 'Nội dung',
    items: [
      { href: '/admin/articles', label: 'Tin bài', need: 'articles.view',
        d: 'M4 4h16v16H4zM8 8h8M8 12h8M8 16h5' },
      { href: '/admin/categories', label: 'Chuyên mục', need: 'categories.view',
        d: 'M3 7h18M3 12h18M3 17h10' },
      { href: '/admin/pages', label: 'Trang tĩnh', need: 'pages.view',
        d: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6' },
    ],
  },
  {
    label: 'Cộng đồng',
    items: [
      { href: '/admin/comments', label: 'Bình luận', need: 'comments.view',
        d: 'M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.4 8.4 0 1 1 21 11.5z' },
      { href: '/admin/users', label: 'Người dùng', need: 'users.view',
        d: 'M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8' },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      { href: '/admin/reports', label: 'Báo cáo', need: 'reports.view',
        d: 'M3 3v18h18M7 15l4-5 3 3 5-7' },
      { href: '/admin/roles', label: 'Vai trò', need: 'roles.manage',
        d: 'M12 2 4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6zM9.5 12l1.8 1.8L15 10' },
      { href: '/admin/settings', label: 'Cấu hình', need: 'settings.manage',
        d: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.18.42.53.75.95.92H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' },
    ],
  },
]

// Ẩn đúng những mục máy chủ cũng chặn — bấm vào rồi nhận 403 là trải nghiệm tệ.
const groups = computed(() =>
  GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !i.need || can.value[i.need]) }))
        .filter((g) => g.items.length)
)

const isActive = (n) => {
  const url = page.url.split('?')[0].replace(/\/$/, '') || '/admin'
  return n.exact ? url === n.href : url.startsWith(n.href)
}

const current = computed(() =>
  groups.value.flatMap((g) => g.items).find(isActive)
)
</script>

<template>
  <div class="min-h-dvh bg-surface lg:flex">
    <!-- Thanh bên -->
    <aside :class="['fixed inset-y-0 left-0 z-50 flex w-[236px] shrink-0 flex-col border-r',
                    'border-line bg-page transition-transform lg:static lg:translate-x-0',
                    open ? 'translate-x-0' : '-translate-x-full']">
      <div class="flex h-14 shrink-0 items-center gap-2.5 border-b border-line px-4">
        <img :src="site.logo" alt="" class="size-8 rounded-lg" />
        <div class="min-w-0">
          <p class="truncate text-[14px] font-extrabold leading-tight tracking-tight">{{ site.name }}</p>
          <p class="text-[10.5px] font-bold uppercase tracking-wider text-ink-muted">Quản trị</p>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto p-2.5">
        <div v-for="(g, gi) in groups" :key="gi" :class="gi && 'mt-4'">
          <p v-if="g.label" class="mb-1 px-3 text-[10.5px] font-bold uppercase
                                   tracking-wider text-ink-muted/80">{{ g.label }}</p>
          <Link v-for="n in g.items" :key="n.href" :href="n.href" @click="open = false"
                class="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px]
                       font-semibold transition"
                :style="isActive(n)
                  ? { background: 'var(--color-accent-soft)', color: 'var(--color-accent-ink)' }
                  : { color: 'var(--color-ink-2)' }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
                 class="size-[17px] shrink-0" stroke-linecap="round" stroke-linejoin="round">
              <path :d="n.d" />
            </svg>
            {{ n.label }}
          </Link>
        </div>
      </nav>

      <div class="shrink-0 border-t border-line p-2.5">
        <a href="/" target="_blank"
           class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold
                  text-ink-2 transition hover:bg-surface">
          Xem website
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ml-auto size-3.5">
            <path d="M7 17 17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </a>
      </div>
    </aside>

    <div v-if="open" class="fixed inset-0 z-40 bg-black/40 lg:hidden" @click="open = false"></div>

    <div class="min-w-0 flex-1">
      <header class="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line
                     bg-page/90 px-4 backdrop-blur sm:px-6">
        <button class="btn !border-transparent !px-2 lg:hidden" aria-label="Mở menu" @click="open = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-5">
            <path d="M3 6h18M3 12h18M3 18h18" stroke-linecap="round" />
          </svg>
        </button>

        <p class="text-[14px] font-bold">{{ current?.label || 'Quản trị' }}</p>

        <div class="ml-auto flex items-center gap-2.5">
          <div class="hidden text-right sm:block">
            <p class="text-[12.5px] font-semibold leading-tight">{{ user?.name }}</p>
            <p class="text-[10.5px] text-ink-muted">{{ user?.role_label }}</p>
          </div>
          <span class="grid size-8 place-items-center rounded-full bg-accent text-[13px]
                       font-bold text-white">{{ user?.initial }}</span>
          <button class="btn !py-1.5 !text-[13px]" @click="router.post('/logout')">Thoát</button>
        </div>
      </header>

      <!-- Thông báo sau khi lưu/xoá -->
      <div v-if="flash.success || flash.error" class="px-4 pt-4 sm:px-6">
        <p class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-semibold"
           :style="flash.error
             ? { background: 'rgba(217,22,68,.1)', color: 'var(--color-accent-ink)' }
             : { background: 'rgba(10,156,176,.1)', color: 'var(--color-cyan)' }"
           role="status">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="size-4">
            <path v-if="flash.error" d="M12 8v5M12 16.5h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"
                  stroke-linecap="round" stroke-linejoin="round" />
            <path v-else d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ flash.error || flash.success }}
        </p>
      </div>

      <main class="p-4 sm:p-6"><slot /></main>
    </div>
  </div>
</template>
