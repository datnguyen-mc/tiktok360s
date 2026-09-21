<script setup>
import { computed, onMounted, ref } from 'vue'
import { Link, router, usePage } from '@inertiajs/vue3'
import UserMenu from '../Components/UserMenu.vue'

const page = usePage()

// Biểu tượng mạng xã hội — chỉ dựng những cái quản trị viên đã điền liên kết
const SOCIAL = {
  facebook: { name: 'Facebook', d: 'M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z' },
  youtube:  { name: 'YouTube',  d: 'M21.6 7.2s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16 4.1 12 4.1 12 4.1s-4 0-6.8.2c-.4 0-1.2 0-2 .9-.6.6-.8 2-.8 2S2.2 8.8 2.2 10.5v1.6c0 1.7.2 3.3.2 3.3s.2 1.4.8 2c.8.8 1.8.8 2.2.9 1.6.2 6.6.2 6.6.2s4 0 6.8-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.3v-1.6c0-1.7-.2-3.3-.2-3.3zM9.9 14.6V9.1l5.2 2.8-5.2 2.7z' },
  tiktok:   { name: 'TikTok',   d: 'M16.6 5.8a4.8 4.8 0 0 1-1.1-3.1h-3.2v12.9a2.7 2.7 0 1 1-2.7-2.7c.3 0 .6 0 .8.1V9.7a6 6 0 0 0-.8-.1 5.9 5.9 0 1 0 5.9 5.9V9.1a8 8 0 0 0 4.6 1.5V7.4a4.8 4.8 0 0 1-3.5-1.6z' },
}
const menu = computed(() => page.props.menu || [])
const site = computed(() => page.props.site || {})
const footerPages = computed(() => page.props.footerPages || [])
const socials = computed(() =>
  Object.entries(SOCIAL)
    .filter(([k]) => site.value[k])
    .map(([k, v]) => ({ k, url: site.value[k], ...v }))
)
const open = ref(false)
const term = ref('')
const theme = ref('auto')

onMounted(() => {
  // Ghi nhớ lựa chọn sáng/tối. Đọc trong onMounted vì SSR không có localStorage.
  theme.value = localStorage.getItem('theme') || 'auto'
  applyTheme()
})

function applyTheme() {
  const el = document.documentElement
  if (theme.value === 'auto') el.removeAttribute('data-theme')
  else el.setAttribute('data-theme', theme.value)
  localStorage.setItem('theme', theme.value)
}

function cycleTheme() {
  theme.value = { auto: 'light', light: 'dark', dark: 'auto' }[theme.value]
  applyTheme()
}

function search() {
  if (!term.value.trim()) return
  router.get('/search', { q: term.value.trim() })
  open.value = false
}
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <!-- Bỏ qua điều hướng: cần cho người dùng bàn phím và trình đọc màn hình -->
    <a href="#noi-dung"
       class="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50
              focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-white">
      Tới nội dung chính
    </a>

    <header class="sticky top-0 z-40 border-b border-line bg-page/90 backdrop-blur">
      <div class="wrap flex h-14 items-center gap-3">
        <Link href="/" class="flex shrink-0 items-center gap-2">
          <img :src="site.logo" alt="" class="size-8 rounded-lg" width="32" height="32" />
          <span class="text-[15px] font-extrabold tracking-tight">{{ site.name }}</span>
        </Link>

        <nav class="ml-2 hidden items-center gap-1 md:flex">
          <Link v-for="c in menu" :key="c.slug" :href="`/category/${c.slug}`"
                class="rounded-lg px-2.5 py-1.5 text-[14px] font-semibold text-ink-2
                       transition hover:bg-surface hover:text-ink">
            {{ c.name }}
          </Link>
        </nav>

        <form class="ml-auto hidden max-w-[200px] flex-1 lg:block" @submit.prevent="search">
          <label for="q" class="sr-only">Tìm kiếm</label>
          <input id="q" v-model="term" class="input !py-1.5 !text-[13px]" placeholder="Tìm tin…" />
        </form>

        <button class="btn !border-transparent !px-2" :title="`Giao diện: ${theme}`"
                aria-label="Đổi giao diện sáng tối" @click="cycleTheme">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-[18px]">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
                  stroke-linecap="round" />
          </svg>
        </button>

        <UserMenu class="shrink-0" />

        <button class="btn !border-transparent !px-2 md:hidden" aria-label="Mở menu" @click="open = !open">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-5">
            <path d="M3 6h18M3 12h18M3 18h18" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <!-- Menu trên màn hình hẹp -->
      <div v-if="open" class="border-t border-line bg-page md:hidden">
        <div class="wrap space-y-2 py-3">
          <form @submit.prevent="search">
            <input v-model="term" class="input" placeholder="Tìm tin…" />
          </form>
          <nav class="grid grid-cols-2 gap-1.5">
            <Link v-for="c in menu" :key="c.slug" :href="`/category/${c.slug}`"
                  class="rounded-lg bg-surface px-3 py-2 text-[14px] font-semibold"
                  @click="open = false">
              {{ c.name }}
            </Link>
          </nav>
        </div>
      </div>
    </header>

    <main id="noi-dung" class="flex-1 py-6">
      <slot />
    </main>

    <footer class="mt-10 border-t border-line bg-surface py-9">
      <div class="wrap grid gap-7 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div class="flex items-center gap-2">
            <img :src="site.logo" alt="" class="size-7 rounded-md" width="28" height="28" />
            <span class="font-extrabold tracking-tight">{{ site.name }}</span>
          </div>
          <p class="mt-2 max-w-md text-[13px] leading-relaxed text-ink-muted">
            {{ site.tagline }}. Tin được tổng hợp từ các báo điện tử Việt Nam,
            luôn kèm liên kết tới bài gốc.
          </p>

          <!-- Chỉ hiện biểu tượng mạng xã hội nào quản trị viên đã điền -->
          <div v-if="socials.length" class="mt-4 flex gap-2">
            <a v-for="s in socials" :key="s.k" :href="s.url" target="_blank" rel="noopener"
               :aria-label="s.name"
               class="grid size-8 place-items-center rounded-lg border border-line text-ink-2
                      transition hover:border-ink-muted hover:text-ink">
              <svg viewBox="0 0 24 24" fill="currentColor" class="size-4"><path :d="s.d" /></svg>
            </a>
          </div>
        </div>

        <nav>
          <p class="mb-2.5 text-[12px] font-bold uppercase tracking-wide text-ink-muted">Chuyên mục</p>
          <ul class="space-y-1.5 text-[13px]">
            <li v-for="c in menu" :key="c.slug">
              <Link :href="`/category/${c.slug}`" class="text-ink-2 hover:text-ink">{{ c.name }}</Link>
            </li>
          </ul>
        </nav>

        <nav>
          <p class="mb-2.5 text-[12px] font-bold uppercase tracking-wide text-ink-muted">Thông tin</p>
          <ul class="space-y-1.5 text-[13px]">
            <li v-for="p in footerPages" :key="p.slug">
              <Link :href="`/page/${p.slug}`" class="text-ink-2 hover:text-ink">{{ p.title }}</Link>
            </li>
            <li><a href="/rss.xml" class="text-ink-2 hover:text-ink">RSS</a></li>
          </ul>

          <ul v-if="site.email || site.hotline" class="mt-4 space-y-1 text-[12.5px] text-ink-muted">
            <li v-if="site.email">
              <a :href="`mailto:${site.email}`" class="hover:text-ink">{{ site.email }}</a>
            </li>
            <li v-if="site.hotline">{{ site.hotline }}</li>
            <li v-if="site.address">{{ site.address }}</li>
          </ul>
        </nav>
      </div>

      <div class="wrap mt-7 border-t border-line pt-4 text-[12px] leading-relaxed text-ink-muted">
        {{ site.copyright || `© ${new Date().getFullYear()} ${site.name}` }}
      </div>
    </footer>
  </div>
</template>
