<script setup>
import { computed, reactive, ref } from 'vue'
import { Link, router, useForm, usePage } from '@inertiajs/vue3'
import Avatar from './Avatar.vue'
import { fmtAgo, fmtNumber } from '../format'

const props = defineProps({
  article: { type: Object, required: true },
  comments: { type: Array, default: () => [] },
  likedComments: { type: Array, default: () => [] },
})

const page = usePage()
const me = computed(() => page.props.auth?.user)

const form = useForm({ body: '', parent_id: null })
const replyTo = ref(null)              // id bình luận đang trả lời
const openReplies = reactive({})       // id gốc -> có mở danh sách trả lời không

// Tim của bình luận cũng cập nhật lạc quan như tim của bài
const likes = reactive({})
props.comments.forEach((c) => {
  likes[c.id] = { on: props.likedComments.includes(c.id), n: c.likes_count || 0 }
  ;(c.replies || []).forEach((r) => {
    likes[r.id] = { on: props.likedComments.includes(r.id), n: r.likes_count || 0 }
  })
})

function submit() {
  form.parent_id = replyTo.value
  form.post(`/news/${props.article.slug}/comment`, {
    preserveScroll: true,
    onSuccess: () => { form.reset(); replyTo.value = null },
  })
}

function toggleLike(c) {
  if (!me.value) return router.visit('/login')
  const s = likes[c.id]
  s.on = !s.on
  s.n += s.on ? 1 : -1
  router.post(`/comments/${c.id}/like`, {}, {
    preserveScroll: true, preserveState: true, only: [],
    onError: () => { s.on = !s.on; s.n += s.on ? 1 : -1 },
  })
}

function remove(c) {
  if (!confirm('Xoá bình luận này?')) return
  router.delete(`/comments/${c.id}`, { preserveScroll: true })
}

const canManage = (c) => me.value && (me.value.id === c.user_id || me.value.is_admin)

function startReply(c) {
  replyTo.value = c.id
  openReplies[c.parent_id || c.id] = true
  // Đưa con trỏ vào ô soạn để người dùng gõ được ngay
  requestAnimationFrame(() => document.getElementById('comment-box')?.focus())
}
</script>

<template>
  <section id="comments" class="mt-10 scroll-mt-20">
    <h2 class="flex items-center gap-2 text-[17px] font-extrabold tracking-tight">
      Bình luận
      <span class="rounded-full bg-surface px-2 py-0.5 text-[12px] font-bold text-ink-muted tabular-nums">
        {{ fmtNumber(article.comments_count) }}
      </span>
    </h2>

    <!-- Ô soạn bình luận -->
    <form v-if="me" class="mt-4 flex gap-3" @submit.prevent="submit">
      <Avatar :user="me" size="size-9 text-[13px]" />
      <div class="min-w-0 flex-1">
        <div v-if="replyTo" class="mb-2 flex items-center gap-2 text-[12.5px] text-ink-muted">
          <span>Đang trả lời một bình luận</span>
          <button type="button" class="font-semibold text-accent-ink hover:underline"
                  @click="replyTo = null">Huỷ</button>
        </div>

        <textarea id="comment-box" v-model="form.body" rows="3" maxlength="2000"
                  class="input resize-y !py-2.5" placeholder="Bạn nghĩ gì về tin này?"></textarea>

        <p v-if="form.errors.body" class="mt-1 text-[12px] text-accent-ink">{{ form.errors.body }}</p>

        <div class="mt-2 flex items-center justify-between">
          <span class="text-[11.5px] text-ink-muted tabular-nums">{{ form.body.length }}/2000</span>
          <button class="btn btn-primary !py-1.5" :disabled="form.processing || form.body.trim().length < 2">
            {{ form.processing ? 'Đang gửi…' : 'Gửi bình luận' }}
          </button>
        </div>
      </div>
    </form>

    <div v-else class="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-line
                       bg-surface px-4 py-3.5">
      <p class="text-[13.5px] text-ink-2">Đăng nhập để tham gia thảo luận.</p>
      <div class="ml-auto flex gap-2">
        <Link href="/login" class="btn !py-1.5 !text-[13px]">Đăng nhập</Link>
        <Link href="/register" class="btn btn-primary !py-1.5 !text-[13px]">Đăng ký</Link>
      </div>
    </div>

    <!-- Danh sách -->
    <ul v-if="comments.length" class="mt-6 space-y-5">
      <li v-for="c in comments" :key="c.id">
        <div class="flex gap-3">
          <Avatar :user="c.user" size="size-9 text-[13px]" />
          <div class="min-w-0 flex-1">
            <div class="rounded-xl rounded-tl-sm bg-surface px-3.5 py-2.5">
              <p class="flex flex-wrap items-baseline gap-x-2">
                <span class="text-[13.5px] font-bold">{{ c.user?.name || 'Ẩn danh' }}</span>
                <span class="text-[11.5px] text-ink-muted">{{ fmtAgo(c.created_at) }}</span>
              </p>
              <p class="mt-1 whitespace-pre-line text-[14px] leading-relaxed text-ink-2">{{ c.body }}</p>
            </div>

            <div class="mt-1.5 flex items-center gap-1 pl-1">
              <button class="cbtn" :class="likes[c.id]?.on && 'text-accent'" @click="toggleLike(c)">
                <svg viewBox="0 0 24 24" :fill="likes[c.id]?.on ? 'currentColor' : 'none'"
                     stroke="currentColor" stroke-width="1.8" class="size-3.5">
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z"
                        stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span v-if="likes[c.id]?.n" class="tabular-nums">{{ likes[c.id].n }}</span>
                <span v-else>Thích</span>
              </button>

              <button class="cbtn" @click="startReply(c)">Trả lời</button>

              <button v-if="canManage(c)" class="cbtn hover:text-accent-ink" @click="remove(c)">Xoá</button>
            </div>

            <!-- Trả lời: gấp lại để luồng bình luận không dài lê thê -->
            <button v-if="c.replies?.length && !openReplies[c.id]"
                    class="mt-2 pl-1 text-[12.5px] font-semibold text-accent-ink hover:underline"
                    @click="openReplies[c.id] = true">
              Xem {{ c.replies.length }} trả lời
            </button>

            <ul v-if="openReplies[c.id]" class="mt-3 space-y-3 border-l-2 border-line pl-3">
              <li v-for="r in c.replies" :key="r.id" class="flex gap-2.5">
                <Avatar :user="r.user" size="size-7 text-[11px]" />
                <div class="min-w-0 flex-1">
                  <div class="rounded-xl rounded-tl-sm bg-surface px-3 py-2">
                    <p class="flex flex-wrap items-baseline gap-x-2">
                      <span class="text-[12.5px] font-bold">{{ r.user?.name || 'Ẩn danh' }}</span>
                      <span class="text-[11px] text-ink-muted">{{ fmtAgo(r.created_at) }}</span>
                    </p>
                    <p class="mt-0.5 whitespace-pre-line text-[13.5px] leading-relaxed text-ink-2">{{ r.body }}</p>
                  </div>
                  <div class="mt-1 flex items-center gap-1 pl-1">
                    <button class="cbtn" :class="likes[r.id]?.on && 'text-accent'" @click="toggleLike(r)">
                      <svg viewBox="0 0 24 24" :fill="likes[r.id]?.on ? 'currentColor' : 'none'"
                           stroke="currentColor" stroke-width="1.8" class="size-3.5">
                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.8 8.8-8.8a5.5 5.5 0 0 0 0-7.8z"
                              stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <span v-if="likes[r.id]?.n" class="tabular-nums">{{ likes[r.id].n }}</span>
                      <span v-else>Thích</span>
                    </button>
                    <button class="cbtn" @click="startReply(r)">Trả lời</button>
                    <button v-if="canManage(r)" class="cbtn hover:text-accent-ink" @click="remove(r)">Xoá</button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </li>
    </ul>

    <p v-else class="mt-6 rounded-xl border border-dashed border-line px-4 py-8 text-center
                     text-[13.5px] text-ink-muted">
      Chưa có bình luận nào. Hãy là người đầu tiên.
    </p>
  </section>
</template>
