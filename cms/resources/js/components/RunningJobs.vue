<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import http from '../api'
import StatusPill from './StatusPill.vue'
import { fmtDate } from '../format'

const emit = defineEmits(['toast'])

const jobs = ref([])
const running = ref(0)
const busy = ref(null)
let timer = null

async function load() {
  try {
    const { data } = await http.get('pipeline-jobs')
    jobs.value = data.jobs || []
    running.value = data.running || 0
  } catch {
    // Không lấy được thì để nguyên danh sách cũ, đừng làm trống màn hình
  }
}

async function stop(job) {
  if (!confirm(`Dừng lượt dựng video này? Video đang render sẽ không hoàn tất.`)) return
  busy.value = job.id
  try {
    const { data } = await http.post(`pipeline-jobs/${job.id}/stop`)
    emit('toast', { message: data.message || 'Đã dừng.', tone: 'warn' })
    await load()
  } catch (e) {
    emit('toast', { message: e.response?.data?.message || 'Không dừng được.', tone: 'bad' })
  } finally {
    busy.value = null
  }
}

async function resume(job) {
  busy.value = job.id
  try {
    const { data } = await http.post(`pipeline-jobs/${job.id}/resume`)
    emit('toast', { message: data.message || 'Đã chạy tiếp.', tone: 'good' })
    await load()
  } catch (e) {
    emit('toast', { message: e.response?.data?.message || 'Không chạy tiếp được.', tone: 'bad' })
  } finally {
    busy.value = null
  }
}

const TONE = {
  running: { label: 'Đang chạy', tone: 'serious' },
  done:    { label: 'Đã xong',   tone: 'good' },
  stopped: { label: 'Đã dừng',   tone: 'warning' },
  failed:  { label: 'Hỏng',      tone: 'critical' },
}

onMounted(() => {
  load()
  // Hỏi lại mỗi 5 giây: render mất khoảng một phút nên không cần nhanh hơn,
  // mà nhanh hơn thì mỗi tab mở là một dòng truy vấn liên tục.
  timer = setInterval(load, 5000)
})
onUnmounted(() => clearInterval(timer))

defineExpose({ load })
</script>

<template>
  <section v-if="jobs.length" class="card p-5">
    <div class="flex items-center gap-2">
      <h2 class="text-sm font-bold">Tiến trình dựng video</h2>
      <span v-if="running" class="flex items-center gap-1.5 text-xs text-accent">
        <span class="relative flex size-2">
          <span class="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60"></span>
          <span class="relative inline-flex size-2 rounded-full bg-accent"></span>
        </span>
        {{ running }} đang chạy
      </span>
      <span v-else class="text-xs text-ink-muted">không có lượt nào đang chạy</span>
    </div>

    <ul class="mt-3 divide-y divide-line">
      <li v-for="j in jobs.slice(0, 6)" :key="j.id"
          class="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
        <StatusPill :label="TONE[j.status]?.label || j.status"
                    :tone="TONE[j.status]?.tone || 'serious'" />

        <span class="text-[13px]">
          {{ j.run?.title || j.topic || 'dây chuyền' }}
          <span v-if="j.run?.episode" class="text-ink-muted">· tập {{ j.run.episode }}</span>
        </span>

        <span class="text-[11.5px] text-ink-muted tnum">
          {{ fmtDate(j.started_at) }}
          <template v-if="j.pid"> · pid {{ j.pid }}</template>
          <template v-if="j.user"> · {{ j.user.name }}</template>
        </span>

        <span class="ml-auto flex gap-1.5">
          <button v-if="j.status === 'running'" class="btn !py-1 !text-[12.5px]"
                  :disabled="busy === j.id" @click="stop(j)">
            {{ busy === j.id ? '…' : 'Dừng' }}
          </button>
          <button v-else class="btn !py-1 !text-[12.5px]"
                  :disabled="busy === j.id" @click="resume(j)">
            {{ busy === j.id ? '…' : 'Chạy tiếp' }}
          </button>
        </span>
      </li>
    </ul>

    <p class="mt-2 text-[11.5px] leading-relaxed text-ink-muted">
      “Chạy tiếp” dùng lại kịch bản đã dựng nếu còn — bỏ qua khâu lấy tin và khâu
      gọi AI viết kịch bản, hai khâu tốn tiền nhất.
    </p>
  </section>
</template>
