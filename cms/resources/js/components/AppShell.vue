<script setup>
import { computed, inject, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '../api'

const route = useRoute()
const router = useRouter()
const user = inject('user')
const open = ref(false)   // ngăn điều hướng trên màn hình hẹp

const nav = [
  { to: '/',           label: 'Tổng quan',  icon: 'grid' },
  { to: '/videos',     label: 'Video',      icon: 'film' },
  { to: '/publishing', label: 'Đăng bài',   icon: 'send' },
  { to: '/topics',     label: 'Chủ đề kênh', icon: 'layers' },
  { to: '/accounts',   label: 'Kênh TikTok', icon: 'user' },
  { to: '/engines',    label: 'Engine tạo video', icon: 'cpu' },
  { to: '/costs',      label: 'Chi phí sinh cảnh', icon: 'coin' },
  { to: '/logs',       label: 'Nhật ký',    icon: 'list' },
  { to: '/settings',   label: 'Cài đặt',    icon: 'gear' },
]

const title = computed(() => route.meta.title || 'TikTok360s')

const paths = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  film: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM7 3v18M17 3v18M3 12h18',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  cpu:  'M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2M5 5h14v14H5zM9 9h6v6H9z',
  coin: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v10M9.5 9.5h3.5a2 2 0 0 1 0 4H9.5h3.5a2 2 0 0 1 0 4H9.5',
  layers: 'M12 2 2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 8.9 19a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 5 8.9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
}

async function logout() {
  await http.post('logout')
  user.value = null
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="flex h-full">
    <!-- Thanh điều hướng -->
    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-line bg-surface
             transition-transform lg:static lg:translate-x-0"
      :class="open ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex items-center gap-2.5 px-5 py-5">
        <img src="/brand/logo.svg" alt="" class="size-9 shrink-0 rounded-[10px]" />
        <span>
          <span class="block text-[15px] font-bold leading-tight tracking-tight">TikTok360s</span>
          <span class="block text-[11px] text-ink-muted">Dây chuyền video TikTok</span>
        </span>
      </div>

      <nav class="flex-1 space-y-0.5 px-3 py-2">
        <RouterLink
          v-for="item in nav" :key="item.to" :to="item.to" @click="open = false"
          class="group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium
                 text-ink-2 transition hover:bg-surface-2 hover:text-ink"
          active-class="!text-ink bg-accent-soft"
          :class="{ 'router-link-exact-active': false }"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
               stroke-linecap="round" stroke-linejoin="round" class="size-[18px] shrink-0">
            <path :d="paths[item.icon]" />
          </svg>
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="border-t border-line p-3">
        <div class="flex items-center gap-3 rounded-[10px] px-2 py-2">
          <RouterLink to="/profile" class="flex min-w-0 flex-1 items-center gap-3">
          <img v-if="user?.avatar_url" :src="user.avatar_url" alt=""
               class="size-8 shrink-0 rounded-full object-cover" />
          <span v-else class="grid size-8 shrink-0 place-items-center rounded-full bg-surface-3 text-xs font-bold">
            {{ (user?.name || 'A').slice(0, 1).toUpperCase() }}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-[13px] font-semibold">{{ user?.name }}</span>
            <span class="block truncate text-[11px] text-ink-muted">{{ user?.email }}</span>
          </span>
          </RouterLink>
          <button class="btn btn-ghost !p-1.5" title="Đăng xuất" @click="logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                 stroke-linecap="round" class="size-4">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <div v-if="open" class="fixed inset-0 z-30 bg-black/60 lg:hidden" @click="open = false"></div>

    <!-- Vùng nội dung -->
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line
                     bg-plane/85 px-5 backdrop-blur">
        <button class="btn btn-ghost !p-2 lg:hidden" @click="open = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-5">
            <path d="M3 6h18M3 12h18M3 18h18" stroke-linecap="round" />
          </svg>
        </button>
        <h1 class="text-[17px] font-bold tracking-tight">{{ title }}</h1>
        <div class="ml-auto flex items-center gap-2">
          <slot name="actions" />
        </div>
      </header>

      <main class="min-h-0 flex-1 overflow-y-auto p-5 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
