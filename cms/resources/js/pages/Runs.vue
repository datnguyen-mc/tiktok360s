<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import http from '../api'
import StatusPill from '../components/StatusPill.vue'
import EmptyState from '../components/EmptyState.vue'
import CreateVideoDialog from '../components/CreateVideoDialog.vue'
import RegenerateDialog from '../components/RegenerateDialog.vue'
import Toast from '../components/Toast.vue'
import { fmtBytes, fmtDate, fmtDuration, RUN_STATUS } from '../format'

const route = useRoute()
const runs = ref({ data: [], total: 0, current_page: 1, last_page: 1 })
const loading = ref(true)
const filters = ref({ q: '', status: '', from: '', to: '', topic: '' })
const topics = ref([])
const page = ref(1)
const creating = ref(false)
const regenerating = ref(null)      // bản ghi đang được tạo lại
const toast = ref({ message: '', tone: 'good' })

function onCreated(res) {
  creating.value = false
  const cost = res.estimate && res.engine?.model ? ` · ước tính $${res.estimate.per_video}` : ''
  const saved = res.preset ? ` · đã lưu prompt “${res.preset.name}”` : ''
  toast.value = {
    message: (res.message || 'Đã gửi yêu cầu tạo video') + cost + saved,
    tone: 'good',
  }
  // Dây chuyền chạy nền khoảng một phút; làm mới danh sách sau đó.
  setTimeout(load, 60_000)
}

function onRegenerated(res) {
  regenerating.value = null
  const cost = res.estimate ? ` · ước tính $${res.estimate.per_video}` : ''
  toast.value = {
    message: (res.message || 'Đã gửi yêu cầu tạo lại') + cost,
    tone: 'good',
  }
  load()                            // đổi trạng thái sang "đang chạy" ngay
  setTimeout(load, 60_000)
}

async function load() {
  loading.value = true
  try {
    runs.value = (await http.get('runs', { params: { ...filters.value, page: page.value } })).data
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Chủ đề đến từ đường dẫn, ví dụ khi bấm "Xem video" ở trang Chủ đề kênh
  if (route.query.topic) filters.value.topic = String(route.query.topic)
  try {
    topics.value = (await http.get('topics')).data.topics
  } catch { /* chưa có chủ đề nào cũng không sao */ }
  load()
})

let timer
watch(filters, () => {
  clearTimeout(timer)
  timer = setTimeout(() => { page.value = 1; load() }, 300)
}, { deep: true })

watch(page, load)

const statuses = [
  { value: '', label: 'Tất cả' },
  { value: 'success', label: 'Thành công' },
  { value: 'failed', label: 'Thất bại' },
  { value: 'running', label: 'Đang chạy' },
]
</script>

<template>
  <div class="space-y-4">
    <!-- Bộ lọc trên một hàng, ngay trên bảng -->
    <div class="flex flex-wrap items-end gap-2.5">
      <div class="min-w-[200px] flex-1 space-y-1.5">
        <label class="label" for="q">Tìm theo tiêu đề hoặc caption</label>
        <input id="q" v-model="filters.q" class="input" placeholder="vd: Sơn Tùng, hoa hậu…" />
      </div>
      <div v-if="topics.length > 1" class="space-y-1.5">
        <label class="label" for="tp">Chủ đề</label>
        <select id="tp" v-model="filters.topic" class="input !w-40">
          <option value="">Tất cả</option>
          <option v-for="t in topics" :key="t.slug" :value="t.slug">{{ t.name }}</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <label class="label" for="st">Trạng thái</label>
        <select id="st" v-model="filters.status" class="input !w-36">
          <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
      </div>
      <div class="space-y-1.5">
        <label class="label" for="from">Từ ngày</label>
        <input id="from" v-model="filters.from" type="date" class="input !w-40" />
      </div>
      <div class="space-y-1.5">
        <label class="label" for="to">Đến ngày</label>
        <input id="to" v-model="filters.to" type="date" class="input !w-40" />
      </div>

      <button class="btn btn-primary ml-auto" @click="creating = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" class="size-4">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Tạo video
      </button>
    </div>

    <div class="card overflow-hidden">
      <div v-if="loading" class="grid h-48 place-items-center text-sm text-ink-muted">Đang tải…</div>

      <EmptyState v-else-if="!runs.data.length" title="Không có video nào khớp bộ lọc"
                  hint="Bấm “Tạo video” để dựng ngay, hoặc chạy `make video` ở thư mục pipeline.">
        <button class="btn btn-primary mt-2" @click="creating = true">Tạo video</button>
      </EmptyState>

      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-muted">
            <th class="px-5 py-3 font-semibold">Video</th>
            <th class="px-3 py-3 font-semibold">Chủ đề</th>
            <th class="px-3 py-3 font-semibold">Trạng thái</th>
            <th class="px-3 py-3 text-right font-semibold">Tin</th>
            <th class="px-3 py-3 text-right font-semibold">Thời lượng</th>
            <th class="px-3 py-3 text-right font-semibold">Lệch</th>
            <th class="px-3 py-3 text-right font-semibold">Dung lượng</th>
            <th class="px-5 py-3 font-semibold">Đăng bài</th>
            <th class="px-5 py-3 text-right font-semibold">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr v-for="r in runs.data" :key="r.id" class="transition hover:bg-surface-2">
            <td class="px-5 py-2.5">
              <RouterLink :to="`/videos/${r.id}`" class="flex items-center gap-3">
                <img v-if="r.thumbnail_path" :src="`/api/runs/${r.id}/thumbnail`" alt=""
                     class="h-11 w-[25px] shrink-0 rounded object-cover" loading="lazy" />
                <span v-else class="h-11 w-[25px] shrink-0 rounded bg-surface-3"></span>
                <span class="min-w-0">
                  <span class="block max-w-[280px] truncate font-semibold">{{ r.title || '—' }}</span>
                  <span class="block text-[11px] text-ink-muted">{{ fmtDate(r.run_date) }}</span>
                </span>
              </RouterLink>
            </td>
            <td class="px-3 py-2.5">
              <span class="rounded-md bg-surface-3 px-2 py-1 text-[11px] font-semibold text-ink-2">
                {{ r.topic_name || r.topic }}
              </span>
            </td>
            <td class="px-3 py-2.5">
              <StatusPill :label="RUN_STATUS[r.status]?.label || r.status"
                          :tone="RUN_STATUS[r.status]?.tone || 'neutral'" />
            </td>
            <td class="tnum px-3 py-2.5 text-right">{{ r.items_count }}</td>
            <td class="tnum px-3 py-2.5 text-right">{{ fmtDuration(r.duration_sec) }}</td>
            <td class="tnum px-3 py-2.5 text-right"
                :style="{ color: Math.abs(r.drift_sec ?? 0) > 5 ? 'var(--color-warning)' : 'var(--color-ink-2)' }">
              {{ r.drift_sec != null ? (r.drift_sec >= 0 ? '+' : '') + r.drift_sec + 's' : '—' }}
            </td>
            <td class="tnum px-3 py-2.5 text-right text-ink-2">{{ fmtBytes(r.video_bytes) }}</td>
            <td class="px-5 py-2.5">
              <span v-if="!r.publish_jobs?.length" class="text-xs text-ink-muted">Chưa đăng</span>
              <StatusPill v-else
                          :label="r.publish_jobs[0].status === 'published' ? 'Đã đăng' : 'Đang xử lý'"
                          :tone="r.publish_jobs[0].status === 'published' ? 'good'
                                : r.publish_jobs[0].status === 'failed' ? 'critical' : 'warning'" />
            </td>
            <td class="px-5 py-2.5 text-right">
              <button class="btn !py-1.5 !text-xs" :disabled="r.status === 'running'"
                      :title="r.status === 'running' ? 'Đang dựng, chờ xong đã' : 'Dựng lại video này'"
                      @click="regenerating = r">
                Tạo lại
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="runs.last_page > 1" class="flex items-center justify-between border-t border-line px-5 py-3">
        <span class="text-xs text-ink-muted">Trang {{ runs.current_page }} / {{ runs.last_page }} · {{ runs.total }} video</span>
        <span class="flex gap-2">
          <button class="btn !py-1.5 !text-xs" :disabled="page <= 1" @click="page--">Trước</button>
          <button class="btn !py-1.5 !text-xs" :disabled="page >= runs.last_page" @click="page++">Sau</button>
        </span>
      </div>
    </div>

    <Teleport to="body">
      <CreateVideoDialog v-if="creating" @close="creating = false" @created="onCreated" />
      <RegenerateDialog v-if="regenerating" :run="regenerating"
                        @close="regenerating = null" @started="onRegenerated" />
    </Teleport>

    <Toast :message="toast.message" :tone="toast.tone" @close="toast.message = ''" />
  </div>
</template>
