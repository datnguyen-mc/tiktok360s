<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import http, { errorMessage } from '../api'
import StatusPill from '../components/StatusPill.vue'
import Toast from '../components/Toast.vue'
import RegenerateDialog from '../components/RegenerateDialog.vue'
import DeleteRunDialog from '../components/DeleteRunDialog.vue'
import { fmtBytes, fmtDate, fmtDuration, fmtTime, JOB_STATUS, RUN_STATUS, TOPIC_LABEL } from '../format'

const STEP_TONE = { done: 'good', running: 'warning', failed: 'critical' }
const ms = (v) => v == null ? '—' : v < 1000 ? `${v}ms` : `${(v / 1000).toFixed(1)}s`

const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()

const run = ref(null)
const accounts = ref([])
const loading = ref(true)
const busy = ref(false)
const toast = ref({ message: '', tone: 'good' })
const video = ref(null)

const form = ref({ tiktok_account_id: '', mode: 'inbox', privacy_level: 'SELF_ONLY', caption: '' })
const showPublish = ref(false)
const showRegenerate = ref(false)
const showDelete = ref(false)

function onDeleted() {
  // Bản ghi không còn nên ở lại trang chi tiết là vô nghĩa — về danh sách.
  router.push('/videos')
}

function onRegenerated(res) {
  showRegenerate.value = false
  const cost = res.estimate ? ` · ước tính $${res.estimate.per_video}` : ''
  toast.value = { message: (res.message || 'Đã gửi yêu cầu tạo lại') + cost, tone: 'good' }
  load()                              // trạng thái đổi sang "đang chạy" ngay
  setTimeout(load, 60_000)            // dây chuyền xong thì nạp lại số liệu mới
}

async function load() {
  const [r, a] = await Promise.all([http.get(`runs/${props.id}`), http.get('tiktok-accounts')])
  run.value = r.data
  accounts.value = a.data
  form.value.caption = r.data.caption || ''
  form.value.tiktok_account_id = a.data.find((x) => x.is_active)?.id || ''
  loading.value = false
}

onMounted(load)

/** Tua video tới đúng cảnh khi bấm vào một tin. */
function seek(sec) {
  if (video.value && sec != null) {
    video.value.currentTime = sec
    video.value.play()
  }
}

async function copyCaption() {
  await navigator.clipboard.writeText(run.value.caption || '')
  toast.value = { message: 'Đã sao chép caption', tone: 'good' }
}

async function publish() {
  busy.value = true
  try {
    await http.post('publish-jobs', { run_id: run.value.id, ...form.value })
    showPublish.value = false
    await load()
    toast.value = { message: 'Đã gửi video sang TikTok', tone: 'good' }
  } catch (e) {
    toast.value = { message: errorMessage(e, 'Đăng bài thất bại'), tone: 'critical' }
  } finally {
    busy.value = false
  }
}

/*
 * Thao tác trên một job đăng bài: kiểm tra trạng thái hoặc thử lại.
 *
 * Trạng thái chờ theo TỪNG job, không phải một cờ chung: một video có thể đăng
 * lên nhiều kênh, bấm thử lại ở kênh này thì không có lý gì khoá nút của kênh kia.
 *
 * Lỗi phải hiện ra. Bản trước gọi sync mà nuốt lỗi, nên bấm "Kiểm tra lại" lúc
 * token TikTok đã hết hạn thì không thấy gì xảy ra cả.
 */
const jobBusy = ref(null)

async function jobAct(job, path, label) {
  jobBusy.value = job.id
  try {
    await http.post(`publish-jobs/${job.id}/${path}`)
    await load()
    toast.value = { message: label, tone: 'good' }
  } catch (e) {
    toast.value = { message: errorMessage(e), tone: 'critical' }
  } finally {
    jobBusy.value = null
  }
}

const totalSceneDur = computed(() =>
  (run.value?.items || []).reduce((s, i) => s + (i.scene_dur || 0), 0))
</script>

<template>
  <div v-if="loading" class="grid h-64 place-items-center text-sm text-ink-muted">Đang tải…</div>

  <div v-else-if="run" class="space-y-5">
    <!-- Đầu trang -->
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <RouterLink to="/videos" class="mb-1 inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink">
          ← Danh sách video
        </RouterLink>
        <h2 class="text-xl font-bold tracking-tight">{{ run.title || fmtDate(run.run_date) }}</h2>
        <p class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
          <span>{{ fmtDate(run.run_date) }}</span>
          <span>·</span>
          <span>{{ run.items_count }} tin trong {{ run.scenes_count }} cảnh</span>
          <span>·</span>
          <span>{{ run.syllables }} âm tiết</span>
          <span>·</span>
          <span>{{ run.voice_id }} · {{ run.voice_rate }}</span>
          <span v-if="run.style">·</span>
          <span v-if="run.style">giọng văn {{ run.style === 'mien_tay' ? 'miền Tây' : 'chuẩn' }}</span>
        </p>
      </div>
      <div class="flex items-center gap-2">
        <StatusPill :label="RUN_STATUS[run.status]?.label || run.status"
                    :tone="RUN_STATUS[run.status]?.tone || 'neutral'" />
        <button class="btn" @click="copyCaption">Sao chép caption</button>
        <button class="btn" :disabled="run.status === 'running'"
                :title="run.status === 'running' ? 'Đang dựng, chờ xong đã' : 'Dựng lại video này'"
                @click="showRegenerate = true">
          Tạo lại
        </button>
        <button class="btn btn-ghost text-ink-muted" title="Xoá video này"
                @click="showDelete = true">
          Xoá
        </button>
        <button class="btn btn-primary" :disabled="!run.has_video || !accounts.length"
                @click="showPublish = true">
          Đăng lên TikTok
        </button>
      </div>
    </div>

    <p v-if="run.error_message" class="card p-4 text-sm"
       style="background: rgba(208,59,59,.1); border-color: rgba(208,59,59,.3); color:#f0a8a8">
      {{ run.error_message }}
    </p>

    <!-- Dòng thời gian các bước -->
    <section v-if="run.steps?.length" class="card">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
        <h3 class="text-sm font-bold">Các bước đã chạy</h3>
        <span class="text-xs text-ink-muted">
          tổng {{ ms(run.steps.reduce((a, s) => a + (s.duration_ms || 0), 0)) }}
        </span>
      </div>

      <ol class="divide-y divide-line">
        <li v-for="s in run.steps" :key="s.id" class="flex flex-wrap items-center gap-3 px-5 py-3">
          <span class="tnum grid size-6 shrink-0 place-items-center rounded-md bg-surface-3
                       text-[11px] font-bold text-ink-2">{{ s.sequence }}</span>

          <span class="min-w-0 flex-1">
            <span class="block text-[13px] font-semibold">{{ s.label }}</span>
            <span v-if="s.detail" class="block text-[11px] leading-snug"
                  :style="{ color: s.status === 'failed' ? '#f08d8d' : 'var(--color-ink-muted)' }">
              {{ s.detail }}
            </span>
          </span>

          <!-- Thanh tỉ lệ: thấy ngay bước nào ngốn thời gian nhất -->
          <span class="hidden h-1.5 w-28 shrink-0 overflow-hidden rounded-full bg-white/[0.06] sm:block">
            <span class="block h-full rounded-full"
                  :style="{ width: `${Math.max(2, (s.duration_ms || 0) / Math.max(...run.steps.map(x => x.duration_ms || 1)) * 100)}%`,
                            background: s.status === 'failed' ? 'var(--color-critical)' : 'var(--color-series-1)' }"></span>
          </span>

          <span class="tnum w-14 shrink-0 text-right text-[12px] text-ink-2">{{ ms(s.duration_ms) }}</span>
          <StatusPill :label="s.status === 'done' ? 'Xong' : s.status === 'failed' ? 'Lỗi' : 'Đang chạy'"
                      :tone="STEP_TONE[s.status] || 'neutral'" />
        </li>
      </ol>
    </section>

    <div class="grid gap-4 lg:grid-cols-[320px_1fr]">
      <!-- Video -->
      <div class="space-y-3">
        <div class="card overflow-hidden">
          <video v-if="run.has_video" ref="video" controls playsinline
                 class="aspect-[9/16] w-full bg-black"
                 :poster="run.thumbnail_path ? `/api/runs/${run.id}/thumbnail` : undefined"
                 :src="`/api/runs/${run.id}/video`"></video>
          <div v-else class="grid aspect-[9/16] place-items-center text-xs text-ink-muted">
            Không tìm thấy file video
          </div>
        </div>

        <dl class="card divide-y divide-line text-[13px]">
          <div class="flex justify-between px-4 py-2.5">
            <dt class="text-ink-muted">Thời lượng</dt>
            <dd class="tnum font-semibold">{{ fmtDuration(run.duration_sec) }}</dd>
          </div>
          <div class="flex justify-between px-4 py-2.5">
            <dt class="text-ink-muted">Ước lượng</dt>
            <dd class="tnum">{{ fmtDuration(run.estimated_sec) }}</dd>
          </div>
          <div class="flex justify-between px-4 py-2.5">
            <dt class="text-ink-muted">Sai số mô hình</dt>
            <dd class="tnum" :style="{ color: Math.abs(run.drift_sec ?? 0) > 5 ? 'var(--color-warning)' : 'inherit' }">
              {{ run.drift_sec != null ? (run.drift_sec >= 0 ? '+' : '') + run.drift_sec + 's' : '—' }}
            </dd>
          </div>
          <div class="flex justify-between px-4 py-2.5">
            <dt class="text-ink-muted">Số lần đọc lại</dt>
            <dd class="tnum">{{ run.tts_attempts }}</dd>
          </div>
          <div class="flex justify-between px-4 py-2.5">
            <dt class="text-ink-muted">Dung lượng</dt>
            <dd class="tnum">{{ fmtBytes(run.video_bytes) }}</dd>
          </div>
        </dl>
      </div>

      <div class="space-y-4">
        <!-- Các tin trong video -->
        <section class="card">
          <div class="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h3 class="text-sm font-bold">Các tin trong video</h3>
            <span class="text-xs text-ink-muted">Bấm vào tin để tua tới đúng cảnh</span>
          </div>

          <ul class="divide-y divide-line">
            <li v-for="item in run.items" :key="item.id"
                class="group cursor-pointer px-5 py-3 transition hover:bg-surface-2"
                @click="seek(item.scene_start)">
              <div class="flex gap-3.5">
                <span class="tnum mt-0.5 grid size-6 shrink-0 place-items-center rounded-md
                             bg-surface-3 text-[11px] font-bold text-ink-2">
                  {{ item.position }}
                </span>

                <div class="min-w-0 flex-1">
                  <p class="text-[13px] font-semibold leading-snug">{{ item.headline }}</p>

                  <div class="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-ink-muted">
                    <span v-if="item.source" class="rounded bg-surface-3 px-1.5 py-0.5">{{ item.source }}</span>
                    <span v-if="item.topic">{{ TOPIC_LABEL[item.topic] || item.topic }}</span>
                    <span v-if="item.score != null" class="tnum">điểm {{ item.score }}</span>
                    <span v-if="item.scene_dur" class="tnum">{{ item.scene_dur.toFixed(1) }}s</span>
                    <a v-if="item.url" :href="item.url" target="_blank" rel="noopener"
                       class="text-ink-2 underline decoration-dotted hover:text-ink" @click.stop>
                      nguồn ↗
                    </a>
                  </div>

                  <p v-if="item.reaction" class="mt-1.5 text-[11px] italic text-ink-2">
                    “{{ item.reaction }}”
                  </p>
                </div>

                <!-- Thanh tỉ lệ thời lượng cảnh, cho thấy nhịp có đều không -->
                <span v-if="item.scene_dur && totalSceneDur"
                      class="mt-2 hidden h-1.5 w-16 shrink-0 self-start overflow-hidden rounded-full bg-white/[0.06] sm:block"
                      :title="`${item.scene_dur.toFixed(1)}s`">
                  <span class="block h-full rounded-full"
                        :style="{ width: `${(item.scene_dur / Math.max(...run.items.map(i => i.scene_dur || 0))) * 100}%`,
                                  background: 'var(--color-series-1)' }"></span>
                </span>
              </div>
            </li>
          </ul>
        </section>

        <!-- Lịch sử đăng bài -->
        <section v-if="run.publish_jobs?.length" class="card">
          <h3 class="border-b border-line px-5 py-3.5 text-sm font-bold">Lịch sử đăng bài</h3>
          <ul class="divide-y divide-line">
            <li v-for="job in run.publish_jobs" :key="job.id" class="flex items-center gap-3 px-5 py-3">
              <StatusPill :label="JOB_STATUS[job.status]?.label || job.status"
                          :tone="JOB_STATUS[job.status]?.tone || 'neutral'" />
              <span class="min-w-0 flex-1 text-[12px] text-ink-muted">
                {{ job.account?.display_name || 'Tài khoản đã gỡ' }} ·
                {{ job.mode === 'inbox' ? 'vào mục nháp' : 'đăng thẳng' }} ·
                {{ fmtTime(job.created_at) }}
                <span v-if="job.error_message" class="mt-1 block text-[11px]" style="color:#f08d8d">
                  {{ job.error_message }}
                </span>
              </span>
              <a v-if="job.share_url" :href="job.share_url" target="_blank" rel="noopener"
                 class="btn !py-1.5 !text-xs">Mở ↗</a>
              <button v-if="['queued','uploading','processing'].includes(job.status)"
                      class="btn !py-1.5 !text-xs" :disabled="jobBusy === job.id"
                      @click="jobAct(job, 'sync', 'Đã cập nhật trạng thái')">
                Kiểm tra lại
              </button>
              <button v-if="job.status === 'failed'"
                      class="btn !py-1.5 !text-xs" :disabled="jobBusy === job.id"
                      title="Đăng lại video này lên đúng kênh đó"
                      @click="jobAct(job, 'retry', 'Đang đăng lại')">
                {{ jobBusy === job.id ? 'Đang gửi…' : 'Thử lại' }}
              </button>
            </li>
          </ul>
        </section>

        <!-- Caption -->
        <section class="card">
          <h3 class="border-b border-line px-5 py-3.5 text-sm font-bold">Caption đăng bài</h3>
          <pre class="whitespace-pre-wrap px-5 py-4 text-[13px] leading-relaxed text-ink-2">{{ run.caption }}</pre>
        </section>
      </div>
    </div>

    <!-- Hộp thoại đăng bài -->
    <Teleport to="body">
      <div v-if="showPublish" class="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
           @click.self="showPublish = false">
        <div class="card w-full max-w-lg p-6">
          <h3 class="text-base font-bold">Đăng lên TikTok</h3>
          <p class="mt-1 text-xs text-ink-muted">{{ run.title }}</p>

          <div class="mt-5 space-y-4">
            <div class="space-y-1.5">
              <label class="label">Tài khoản</label>
              <select v-model="form.tiktok_account_id" class="input">
                <option v-for="a in accounts" :key="a.id" :value="a.id" :disabled="!a.is_active">
                  {{ a.display_name || a.open_id }}{{ a.token_expired ? ' (token hết hạn)' : '' }}
                </option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="label">Cách đăng</label>
              <div class="grid gap-2 sm:grid-cols-2">
                <label class="cursor-pointer rounded-xl border p-3 transition"
                       :style="{ borderColor: form.mode === 'inbox' ? 'var(--color-accent)' : 'var(--color-line)',
                                 background: form.mode === 'inbox' ? 'var(--color-accent-soft)' : 'transparent' }">
                  <input v-model="form.mode" type="radio" value="inbox" class="sr-only" />
                  <span class="block text-[13px] font-semibold">Vào mục nháp</span>
                  <span class="mt-0.5 block text-[11px] leading-snug text-ink-muted">
                    Video vào app TikTok, bạn tự bấm đăng. Chỉ cần quyền video.upload.
                  </span>
                </label>
                <label class="cursor-pointer rounded-xl border p-3 transition"
                       :style="{ borderColor: form.mode === 'direct_post' ? 'var(--color-accent)' : 'var(--color-line)',
                                 background: form.mode === 'direct_post' ? 'var(--color-accent-soft)' : 'transparent' }">
                  <input v-model="form.mode" type="radio" value="direct_post" class="sr-only" />
                  <span class="block text-[13px] font-semibold">Đăng thẳng</span>
                  <span class="mt-0.5 block text-[11px] leading-snug text-ink-muted">
                    Đăng luôn lên TikTok. Cần quyền video.publish đã được duyệt.
                  </span>
                </label>
              </div>
            </div>

            <div v-if="form.mode === 'direct_post'" class="space-y-1.5">
              <label class="label">Mức riêng tư</label>
              <select v-model="form.privacy_level" class="input">
                <option value="SELF_ONLY">Chỉ mình tôi (bắt buộc khi app chưa được duyệt)</option>
                <option value="PUBLIC_TO_EVERYONE">Công khai</option>
                <option value="MUTUAL_FOLLOW_FRIENDS">Bạn bè</option>
                <option value="FOLLOWER_OF_CREATOR">Người theo dõi</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="label">Caption</label>
              <textarea v-model="form.caption" rows="5" class="input resize-y font-mono !text-xs"></textarea>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button class="btn" @click="showPublish = false">Huỷ</button>
            <button class="btn btn-primary" :disabled="busy || !form.tiktok_account_id" @click="publish">
              {{ busy ? 'Đang gửi…' : 'Gửi lên TikTok' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <RegenerateDialog v-if="showRegenerate" :run="run"
                        @close="showRegenerate = false" @started="onRegenerated" />
      <DeleteRunDialog v-if="showDelete" :run="run"
                       @close="showDelete = false" @deleted="onDeleted" />
    </Teleport>

    <Toast :message="toast.message" :tone="toast.tone" @close="toast.message = ''" />
  </div>
</template>
