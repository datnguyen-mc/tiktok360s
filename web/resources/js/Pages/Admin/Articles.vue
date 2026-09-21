<script setup>
import { computed, ref, watch } from 'vue'
import { Link, router, usePage } from '@inertiajs/vue3'
import AdminLayout from '../../Layouts/AdminLayout.vue'
import PageHeader from '../../Components/Admin/PageHeader.vue'
import StatTile from '../../Components/Admin/StatTile.vue'
import EmptyState from '../../Components/Admin/EmptyState.vue'
import Switch from '../../Components/Admin/Switch.vue'
import Pagination from '../../Components/Pagination.vue'
import IconButton from '../../Components/Admin/IconButton.vue'
import Icon from '../../Components/Admin/Icon.vue'
import { Head } from '@inertiajs/vue3'
import { fmtAgo, fmtNumber } from '../../format'

const props = defineProps({
  articles: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
  filters: { type: Object, default: () => ({}) },
  stats: { type: Object, default: () => ({}) },
})

const f = ref({ q: props.filters.q || '', status: props.filters.status || '',
                category: props.filters.category || '' })

let timer
watch(f, (v) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    router.get('/admin/articles', Object.fromEntries(Object.entries(v).filter(([, x]) => x !== '')),
               { preserveState: true, replace: true })
  }, 300)
}, { deep: true })

function toggle(a, field, value) {
  router.patch(`/admin/articles/${a.id}/doi`, { field, value }, { preserveScroll: true })
}

function remove(a) {
  if (confirm(`Xoá “${a.title.slice(0, 60)}…”?`)) {
    router.delete(`/admin/articles/${a.id}`, { preserveScroll: true })
  }
}

const STATUS = { published: 'Đã đăng', draft: 'Nháp', hidden: 'Ẩn' }
const STATUS_COLOR = { published: '#0A9CB0', draft: '#74747F', hidden: '#D91644' }

const can = computed(() => usePage().props.auth?.user?.can || {})
const TILE_ICON = {
  total:     'M4 4h16v16H4zM8 8h8M8 12h8M8 16h5',
  published: 'm5 13 4 4L19 7',
  draft:     'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  today:     'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
}
</script>

<template>
  <Head title="Tin bài · Quản trị" />

  <AdminLayout>
    <PageHeader title="Tin bài"
                subtitle="Bài lấy tự động từ RSS và bài tự viết nằm chung ở đây.">
      <template #actions>
        <Link v-if="can['articles.edit']" href="/admin/articles/new" class="btn btn-primary">
          <Icon name="plus" /> Viết bài mới
        </Link>
      </template>
    </PageHeader>

    <!-- Số liệu nhanh -->
    <div class="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile v-for="(label, key) in { total: 'Tổng bài', published: 'Đã đăng', draft: 'Nháp', today: 'Hôm nay' }"
                :key="key" :label="label" :value="stats[key] ?? 0" :icon="TILE_ICON[key]"
                :tone="key === 'published' ? 'cyan' : key === 'today' ? 'accent' : 'ink'" />
    </div>

    <div class="mb-4 flex flex-wrap items-end gap-2.5">
      <div class="min-w-[200px] flex-1 space-y-1.5">
        <label class="label" for="q">Tìm theo tiêu đề</label>
        <input id="q" v-model="f.q" class="input" placeholder="vd: Sơn Tùng…" />
      </div>
      <div class="space-y-1.5">
        <label class="label" for="st">Trạng thái</label>
        <select id="st" v-model="f.status" class="input !w-36">
          <option value="">Tất cả</option>
          <option v-for="(l, k) in STATUS" :key="k" :value="k">{{ l }}</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <label class="label" for="cat">Chuyên mục</label>
        <select id="cat" v-model="f.category" class="input !w-40">
          <option value="">Tất cả</option>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
    </div>

    <div class="adm-card overflow-hidden">
      <div v-if="articles.data.length" class="max-h-[calc(100dvh-400px)] overflow-auto">
        <table class="adm-table min-w-[900px]">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th class="w-[120px]">Chuyên mục</th>
              <th class="w-[120px]">Trạng thái</th>
              <th class="w-[86px]">Nổi bật</th>
              <th class="w-[150px]">Tương tác</th>
              <th class="w-[110px]">Đăng</th>
              <th class="w-[106px]"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in articles.data" :key="a.id">
              <td>
                <Link :href="`/admin/articles/${a.id}`" class="flex items-center gap-2.5">
                  <img v-if="a.image_url" :src="a.image_url" alt="" loading="lazy"
                       class="size-10 shrink-0 rounded-md object-cover" />
                  <span v-else class="grid size-10 shrink-0 place-items-center rounded-md bg-surface-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                         class="size-4 text-ink-muted/60">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" />
                    </svg>
                  </span>
                  <span class="line-clamp-2 max-w-[360px] text-[13.5px] font-semibold">{{ a.title }}</span>
                </Link>
              </td>

              <td>
                <span v-if="a.category" class="adm-chip"
                      :style="{ background: (a.category.color || '#FE2C55') + '1f',
                                color: a.category.color || '#FE2C55' }">
                  {{ a.category.name }}
                </span>
              </td>

              <td>
                <select v-if="can['articles.edit']" :value="a.status"
                        class="input !w-full !py-1 !text-[12.5px] font-semibold"
                        :style="{ color: STATUS_COLOR[a.status] }"
                        @change="toggle(a, 'status', $event.target.value)">
                  <option v-for="(l, k) in STATUS" :key="k" :value="k">{{ l }}</option>
                </select>
                <span v-else class="adm-chip"
                      :style="{ background: STATUS_COLOR[a.status] + '1f', color: STATUS_COLOR[a.status] }">
                  {{ STATUS[a.status] }}
                </span>
              </td>

              <td>
                <Switch :model-value="!!a.is_featured" :disabled="!can['articles.edit']"
                        @update:model-value="toggle(a, 'is_featured', $event)" />
              </td>

              <td class="text-[12px] text-ink-muted tabular-nums">
                {{ fmtNumber(a.views) }} xem · {{ a.likes_count ?? 0 }} thích
                <span class="block">{{ a.comments_count ?? 0 }} bình luận · {{ a.shares_count ?? 0 }} chia sẻ</span>
              </td>

              <td class="text-[12px] text-ink-muted">{{ fmtAgo(a.published_at) }}</td>

              <td>
                <span class="rowacts">
                  <IconButton v-if="can['articles.edit']" icon="edit" label="Sửa bài"
                              as="link" :href="`/admin/articles/${a.id}`" />
                  <IconButton icon="eye" label="Xem trên web" tone="cyan"
                              as="a" :href="`/news/${a.slug}`" target="_blank" />
                  <IconButton v-if="can['articles.delete']" icon="trash" label="Xoá bài"
                              tone="danger" @click="remove(a)" />
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState v-else title="Không có bài nào khớp bộ lọc"
                  hint="Thử xoá từ khoá, hoặc chọn lại chuyên mục và trạng thái." />
    </div>

    <Pagination :page="articles" unit="bài" class="mt-4" />

  </AdminLayout>
</template>
