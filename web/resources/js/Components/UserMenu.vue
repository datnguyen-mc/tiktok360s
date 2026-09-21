<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Link, router, usePage } from '@inertiajs/vue3'

const page = usePage()
const user = computed(() => page.props.auth?.user)
const open = ref(false)
const root = ref(null)

function close(e) {
  if (root.value && !root.value.contains(e.target)) open.value = false
}
onMounted(() => document.addEventListener('click', close))
onUnmounted(() => document.removeEventListener('click', close))
</script>

<template>
  <div v-if="user" ref="root" class="relative">
    <button class="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-2.5
                   transition hover:bg-surface"
            :aria-expanded="open" aria-haspopup="menu" @click.stop="open = !open">
      <img v-if="user.avatar_url" :src="user.avatar_url" alt=""
           class="size-7 rounded-full object-cover" />
      <span v-else class="grid size-7 place-items-center rounded-full bg-accent text-[12px]
                          font-bold text-white">{{ user.initial }}</span>
      <span class="hidden max-w-[90px] truncate text-[13px] font-semibold sm:block">{{ user.name }}</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           class="size-3.5 text-ink-muted"><path d="m6 9 6 6 6-6" stroke-linecap="round" /></svg>
    </button>

    <div v-if="open" role="menu"
         class="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border
                border-line bg-page shadow-lg">
      <div class="border-b border-line px-3 py-2.5">
        <p class="truncate text-[13px] font-bold">{{ user.name }}</p>
        <p class="truncate text-[11.5px] text-ink-muted">{{ user.email }}</p>
      </div>

      <nav class="p-1.5">
        <Link href="/bookmarks" class="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px]
                                    font-medium transition hover:bg-surface" @click="open = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-4">
            <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke-linejoin="round" />
          </svg>
          Bài đã lưu
        </Link>
        <Link href="/account" class="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px]
                                       font-medium transition hover:bg-surface" @click="open = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-4">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-linecap="round" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Tài khoản
        </Link>
        <Link v-if="user.is_admin" href="/admin"
              class="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium
                     transition hover:bg-surface" @click="open = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-4">
            <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
          </svg>
          Quản trị
        </Link>
      </nav>

      <div class="border-t border-line p-1.5">
        <button class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13.5px]
                       font-medium text-ink-muted transition hover:bg-surface"
                @click="router.post('/logout')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-4">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke-linecap="round" />
          </svg>
          Đăng xuất
        </button>
      </div>
    </div>
  </div>

  <div v-else class="flex items-center gap-2">
    <Link href="/login" class="text-[13.5px] font-semibold text-ink-2 hover:text-ink">Đăng nhập</Link>
    <Link href="/register" class="btn btn-primary !py-1.5 !text-[13px]">Đăng ký</Link>
  </div>
</template>
