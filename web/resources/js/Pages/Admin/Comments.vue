<script setup>
import { computed, ref, watch } from 'vue'
import { Head, router, usePage } from '@inertiajs/vue3'
import AdminLayout from '../../Layouts/AdminLayout.vue'
import PageHeader from '../../Components/Admin/PageHeader.vue'
import EmptyState from '../../Components/Admin/EmptyState.vue'
import Avatar from '../../Components/Avatar.vue'
import IconButton from '../../Components/Admin/IconButton.vue'
import Icon from '../../Components/Admin/Icon.vue'
import Pagination from '../../Components/Pagination.vue'
import { fmtAgo, fmtNumber } from '../../format'

const props = defineProps({
  comments: { type: Object, required: true },
  filters: { type: Object, default: () => ({}) },
  stats: { type: Object, default: () => ({}) },
})

const canModerate = computed(() => !!usePage().props.auth?.user?.can?.['comments.moderate'])

const q = ref(props.filters.q || '')
const status = ref(props.filters.status || '')

let timer
watch([q, status], () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    router.get('/admin/comments', { q: q.value || undefined, status: status.value || undefined },
      { preserveState: true, replace: true })
  }, 300)
})

const STATUS = {
  visible: { label: 'Hiển thị', color: '#0A9CB0' },
  hidden:  { label: 'Đã ẩn',   color: '#74747F' },
  spam:    { label: 'Spam',    color: '#D91644' },
}

const setStatus = (c, s) =>
  router.put(`/admin/comments/${c.id}`, { status: s }, { preserveScroll: true })

function remove(c) {
  if (!confirm('Xoá hẳn bình luận này?')) return
  router.delete(`/admin/comments/${c.id}`, { preserveScroll: true })
}
</script>

<template>
  <Head title="Bình luận" />

  <AdminLayout>
    <PageHeader title="Bình luận"
                :subtitle="canModerate
                  ? 'Ẩn, đánh dấu spam hoặc xoá hẳn. Xoá bình luận gốc là mất luôn các trả lời của nó.'
                  : 'Bạn chỉ có quyền xem các bình luận.'" />

    <div class="flex flex-wrap items-center gap-2.5">
      <div class="relative min-w-[220px] flex-1 sm:max-w-xs">
        <Icon name="search"
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input v-model="q" class="input !pl-9" placeholder="Tìm trong nội dung bình luận…" />
      </div>

      <div class="flex flex-wrap gap-1">
        <button v-for="f in [['', 'Tất cả', stats.total], ['visible', 'Hiển thị', stats.visible],
                             ['hidden', 'Đã ẩn', stats.hidden], ['spam', 'Spam', stats.spam]]"
                :key="f[0]" :class="['adm-seg', status === f[0] && 'adm-seg-on']"
                @click="status = f[0]">
          {{ f[1] }}
          <span class="rounded bg-surface-2 px-1.5 text-[11px] tabular-nums">{{ fmtNumber(f[2]) }}</span>
        </button>
      </div>
    </div>

    <ul class="mt-4 space-y-2.5">
      <li v-for="c in comments.data" :key="c.id" class="adm-card p-3.5">
        <div class="flex gap-3">
          <Avatar :user="c.user" size="size-9 text-[13px]" />

          <div class="min-w-0 flex-1">
            <p class="flex flex-wrap items-baseline gap-x-2">
              <span class="text-[13.5px] font-bold">{{ c.user?.name || 'Ẩn danh' }}</span>
              <span class="text-[11.5px] text-ink-muted">{{ c.user?.email }}</span>
              <span class="text-[11.5px] text-ink-muted">· {{ fmtAgo(c.created_at) }}</span>
              <span class="adm-chip"
                    :style="{ background: STATUS[c.status]?.color + '1f', color: STATUS[c.status]?.color }">
                {{ STATUS[c.status]?.label }}
              </span>
              <span v-if="c.parent_id" class="text-[11px] text-ink-muted">· trả lời</span>
            </p>

            <p class="mt-1 whitespace-pre-line text-[13.5px] leading-relaxed text-ink-2">{{ c.body }}</p>

            <a v-if="c.article" :href="`/news/${c.article.slug}`" target="_blank"
               class="mt-1 block truncate text-[12px] text-ink-muted hover:text-accent-ink">
              ↳ {{ c.article.title }}
            </a>

            <div v-if="canModerate" class="mt-2 flex flex-wrap items-center gap-1">
              <button v-for="(v, k) in STATUS" :key="k" class="cbtn"
                      :style="c.status === k ? { color: v.color, background: v.color + '14' } : {}"
                      @click="setStatus(c, k)">
                {{ v.label }}
              </button>
              <IconButton class="ml-auto" icon="trash" label="Xoá hẳn bình luận"
                          tone="danger" @click="remove(c)" />
            </div>
          </div>
        </div>
      </li>
    </ul>

    <div v-if="!comments.data.length" class="adm-card">
      <EmptyState title="Không có bình luận nào khớp"
                  hint="Thử đổi bộ lọc trạng thái hoặc xoá từ khoá tìm kiếm."
                  icon="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.6-4.9A8.4 8.4 0 1 1 21 11.5z" />
    </div>

    <Pagination :page="comments" unit="bình luận" class="mt-5" />
  </AdminLayout>
</template>
