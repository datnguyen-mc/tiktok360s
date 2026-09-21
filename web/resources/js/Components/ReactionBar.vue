<script setup>
import { computed, ref } from 'vue'
import { router, usePage } from '@inertiajs/vue3'
import { fmtNumber } from '../format'

const props = defineProps({
  article: { type: Object, required: true },
  liked: { type: Boolean, default: false },
  bookmarked: { type: Boolean, default: false },
  variant: { type: String, default: 'bar' },   // 'bar' | 'rail'
})

const page = usePage()
const signedIn = computed(() => !!page.props.auth?.user)

// Cập nhật lạc quan: tim phải đỏ ngay lúc bấm, không chờ vòng đi-về của mạng.
const liked = ref(props.liked)
const bookmarked = ref(props.bookmarked)
const likes = ref(props.article.likes_count || 0)
const bookmarks = ref(props.article.bookmarks_count || 0)
const shares = ref(props.article.shares_count || 0)
const burst = ref(false)
const copied = ref(false)

function needLogin() {
  router.visit('/login', { data: { next: window.location.pathname } })
}

function toggleLike() {
  if (!signedIn.value) return needLogin()
  liked.value = !liked.value
  likes.value += liked.value ? 1 : -1
  if (liked.value) {
    burst.value = true
    setTimeout(() => (burst.value = false), 500)
  }
  router.post(`/news/${props.article.slug}/like`, {}, {
    preserveScroll: true, preserveState: true, only: [],
    onError: () => { liked.value = !liked.value; likes.value += liked.value ? 1 : -1 },
  })
}

function toggleBookmark() {
  if (!signedIn.value) return needLogin()
  bookmarked.value = !bookmarked.value
  bookmarks.value += bookmarked.value ? 1 : -1
  router.post(`/news/${props.article.slug}/save`, {}, {
    preserveScroll: true, preserveState: true, only: [],
    onError: () => { bookmarked.value = !bookmarked.value },
  })
}

async function share() {
  const url = props.article.url || window.location.href
  const data = { title: props.article.title, url }

  // Điện thoại có bảng chia sẻ của hệ điều hành thì dùng nó; máy tính thì chép link.
  try {
    if (navigator.share) await navigator.share(data)
    else {
      await navigator.clipboard.writeText(url)
      copied.value = true
      setTimeout(() => (copied.value = false), 2000)
    }
  } catch { return }   // người dùng bấm huỷ — không tính là một lượt chia sẻ

  shares.value++
  router.post(`/news/${props.article.slug}/share`, {}, {
    preserveScroll: true, preserveState: true, only: [],
  })
}

const rail = computed(() => props.variant === 'rail')
</script>

<template>
  <div :class="rail
        ? 'flex flex-col gap-2'
        : 'flex flex-wrap items-center gap-2 border-y border-line py-3'">

    <!-- Thích -->
    <button :class="['react', rail && 'react-rail', liked && 'react-on']"
            :aria-pressed="liked" @click="toggleLike">
      <span class="relative grid place-items-center">
        <svg viewBox="0 0 24 24" :fill="liked ? 'currentColor' : 'none'" stroke="currentColor"
             stroke-width="1.8" class="size-[18px] transition-transform"
             :class="liked && 'scale-110'">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z"
                stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <!-- Vòng loé khi bấm: phản hồi nhỏ nhưng làm hành động "có cảm giác" -->
        <span v-if="burst" class="pointer-events-none absolute inset-0 -m-1.5 rounded-full
                                  border-2 border-accent burst"></span>
      </span>
      <span class="tabular-nums">{{ fmtNumber(likes) }}</span>
      <span v-if="!rail" class="sr-only">lượt thích</span>
    </button>

    <!-- Bình luận: cuộn xuống khung bình luận -->
    <a href="#comments" :class="['react', rail && 'react-rail']">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-[18px]">
        <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.4 8.4 0 1 1 21 11.5z"
              stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span class="tabular-nums">{{ fmtNumber(article.comments_count) }}</span>
    </a>

    <!-- Lưu -->
    <button :class="['react', rail && 'react-rail', bookmarked && 'react-on-cyan']"
            :aria-pressed="bookmarked" @click="toggleBookmark">
      <svg viewBox="0 0 24 24" :fill="bookmarked ? 'currentColor' : 'none'" stroke="currentColor"
           stroke-width="1.8" class="size-[18px]">
        <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke-linejoin="round" />
      </svg>
      <span class="tabular-nums">{{ fmtNumber(bookmarks) }}</span>
    </button>

    <!-- Chia sẻ -->
    <button :class="['react', rail && 'react-rail']" @click="share">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-[18px]">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
        <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" stroke-linecap="round" />
      </svg>
      <span class="tabular-nums">{{ fmtNumber(shares) }}</span>
    </button>

    <span v-if="copied" class="text-[12px] font-semibold text-cyan"
          role="status">Đã chép liên kết</span>

    <span v-if="!rail" class="ml-auto flex items-center gap-1.5 text-[12.5px] text-ink-muted">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="size-4">
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
      </svg>
      {{ fmtNumber(article.views) }}
    </span>
  </div>
</template>
