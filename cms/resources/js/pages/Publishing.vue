<script setup>
import { onMounted, ref } from 'vue'
import http, { errorMessage } from '../api'
import StatusPill from '../components/StatusPill.vue'
import EmptyState from '../components/EmptyState.vue'
import Toast from '../components/Toast.vue'
import { fmtDate, fmtTime, JOB_STATUS } from '../format'

const jobs = ref({ data: [] })
const loading = ref(true)
const busy = ref(null)
const status = ref('')
const toast = ref({ message: '', tone: 'good' })

async function load() {
  loading.value = true
  try {
    jobs.value = (await http.get('publish-jobs', { params: { status: status.value } })).data
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function act(job, path, label) {
  busy.value = job.id
  try {
    await http.post(`publish-jobs/${job.id}/${path}`)
    await load()
    toast.value = { message: label, tone: 'good' }
  } catch (e) {
    toast.value = { message: errorMessage(e), tone: 'critical' }
  } finally {
    busy.value = null
  }
}

async function remove(job) {
  if (!confirm('Xoá job này?')) return
  try {
    await http.delete(`publish-jobs/${job.id}`)
    await load()
  } catch (e) {
    toast.value = { message: errorMessage(e), tone: 'critical' }
  }
}

const filters = [
  { value: '', label: 'Tất cả' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'published', label: 'Đã đăng' },
  { value: 'failed', label: 'Thất bại' },
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <button v-for="f in filters" :key="f.value"
              class="btn !py-1.5 !text-xs"
              :style="status === f.value
                ? { background: 'var(--color-accent-soft)', borderColor: 'var(--color-accent)' } : {}"
              @click="status = f.value; load()">
        {{ f.label }}
      </button>
      <button class="btn btn-ghost ml-auto !py-1.5 !text-xs" @click="load">Làm mới</button>
    </div>

    <div class="card overflow-hidden">
      <div v-if="loading" class="grid h-48 place-items-center text-sm text-ink-muted">Đang tải…</div>

      <EmptyState v-else-if="!jobs.data.length" title="Chưa có job đăng bài nào"
                  hint="Mở một video rồi bấm “Đăng lên TikTok”." />

      <ul v-else class="divide-y divide-line">
        <li v-for="job in jobs.data" :key="job.id" class="flex flex-wrap items-center gap-3 px-5 py-3.5">
          <img v-if="job.run?.thumbnail_path" :src="`/api/runs/${job.run.id}/thumbnail`" alt=""
               class="h-12 w-[27px] shrink-0 rounded-md object-cover" loading="lazy" />
          <span v-else class="h-12 w-[27px] shrink-0 rounded-md bg-surface-3"></span>

          <span class="min-w-0 flex-1">
            <RouterLink :to="`/videos/${job.run_id}`" class="block truncate text-[13px] font-semibold hover:underline">
              {{ job.run?.title || fmtDate(job.run?.run_date) }}
            </RouterLink>
            <span class="block text-[11px] text-ink-muted">
              {{ job.account?.display_name || 'Tài khoản đã gỡ' }} ·
              {{ job.mode === 'inbox' ? 'vào mục nháp' : 'đăng thẳng' }} ·
              {{ fmtTime(job.created_at) }}
              <template v-if="job.attempts > 1"> · thử {{ job.attempts }} lần</template>
            </span>
            <span v-if="job.error_message" class="mt-1 block text-[11px]" style="color:#f08d8d">
              {{ job.error_message }}
            </span>
          </span>

          <StatusPill :label="JOB_STATUS[job.status]?.label || job.status"
                      :tone="JOB_STATUS[job.status]?.tone || 'neutral'" />

          <span class="flex gap-1.5">
            <a v-if="job.share_url" :href="job.share_url" target="_blank" rel="noopener"
               class="btn !py-1.5 !text-xs">Mở ↗</a>
            <button v-if="['queued','uploading','processing'].includes(job.status)"
                    class="btn !py-1.5 !text-xs" :disabled="busy === job.id"
                    @click="act(job, 'sync', 'Đã cập nhật trạng thái')">Kiểm tra</button>
            <button v-if="job.status === 'failed'"
                    class="btn !py-1.5 !text-xs" :disabled="busy === job.id"
                    @click="act(job, 'retry', 'Đã thử lại')">Thử lại</button>
            <button v-if="job.status !== 'published'" class="btn btn-ghost !py-1.5 !text-xs text-ink-muted"
                    @click="remove(job)">Xoá</button>
          </span>
        </li>
      </ul>
    </div>

    <Toast :message="toast.message" :tone="toast.tone" @close="toast.message = ''" />
  </div>
</template>
