<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import http, { errorMessage } from '../api'
import EmptyState from '../components/EmptyState.vue'
import StatusPill from '../components/StatusPill.vue'
import Toast from '../components/Toast.vue'
import { fmtTime } from '../format'

const engines = ref([])
const providers = ref({})
const loading = ref(true)
const busy = ref(false)
const toast = ref({ message: '', tone: 'good' })
const editing = ref(null)
const triggering = ref(null)
const trigger = ref({ date: '', items: '', voice: '' })
const estimate = ref(null)

// Độ dài video mục tiêu, dùng để ước tính chi phí
const TARGET_SECONDS = 105

const TYPES = [
  { value: 'local', label: 'Chạy tại máy',  hint: 'dây chuyền Python sẵn có' },
  { value: 'veo',   label: 'Google Veo 3',  hint: 'sinh cảnh AI, có tiếng' },
  { value: 'kling', label: 'Kling AI',      hint: 'sinh cảnh AI, rẻ hơn' },
  { value: 'http',  label: 'API riêng',     hint: 'model của bạn' },
]

const blank = () => ({
  name: '', type: 'local',
  command: '.venv/bin/python -m pipeline.run_daily', working_dir: '',
  endpoint: '', api_key: '', api_secret: '', auth_header: 'Authorization', auth_prefix: 'Bearer',
  model: '', resolution: '720p', aspect_ratio: '9:16', clip_seconds: 8, mode: 'std',
  negative_prompt: '', cost_per_second: null,
  is_default: false, is_active: true,
})

async function load() {
  loading.value = true
  try {
    const d = (await http.get('video-engines')).data
    engines.value = d.engines
    providers.value = d.providers
  } finally {
    loading.value = false
  }
}

onMounted(load)

const isAi = computed(() => ['veo', 'kling'].includes(editing.value?.type))
const spec = computed(() => providers.value[editing.value?.type] || null)

// Đổi nhà cung cấp thì các lựa chọn cũ không còn hợp lệ — nạp lại mặc định.
watch(() => editing.value?.type, (type) => {
  if (!editing.value || !providers.value[type]) return
  const p = providers.value[type]
  editing.value.model = Object.keys(p.models)[0]
  editing.value.clip_seconds = p.durations[p.durations.length - 1]
  editing.value.aspect_ratio = p.aspects[0]
  if (p.modes) editing.value.mode = p.modes[0]
})

// Ước tính lại mỗi khi tham số ảnh hưởng giá thay đổi
watch(() => editing.value && [editing.value.type, editing.value.model,
                              editing.value.resolution, editing.value.clip_seconds,
                              editing.value.cost_per_second].join('|'),
  async () => {
    estimate.value = null
    if (!isAi.value) return
    try {
      estimate.value = (await http.post('video-engines/estimate', {
        type: editing.value.type, model: editing.value.model,
        resolution: editing.value.resolution, clip_seconds: editing.value.clip_seconds,
        cost_per_second: editing.value.cost_per_second, seconds: TARGET_SECONDS,
      })).data.estimate
    } catch { /* form chưa đủ, bỏ qua */ }
  })

function edit(e) {
  editing.value = e
    ? { ...blank(), ...e,
        api_key: e.has_api_key ? '••••••••' : '',
        api_secret: e.has_api_secret ? '••••••••' : '' }
    : blank()
}

async function save() {
  busy.value = true
  try {
    const b = { ...editing.value }
    if (b.id) await http.put(`video-engines/${b.id}`, b)
    else await http.post('video-engines', b)
    editing.value = null
    await load()
    toast.value = { message: 'Đã lưu engine', tone: 'good' }
  } catch (e) {
    toast.value = { message: errorMessage(e), tone: 'critical' }
  } finally {
    busy.value = false
  }
}

async function remove(e) {
  if (!confirm(`Xoá engine “${e.name}”?`)) return
  await http.delete(`video-engines/${e.id}`)
  await load()
}

async function run() {
  busy.value = true
  try {
    const body = Object.fromEntries(Object.entries(trigger.value).filter(([, v]) => v !== ''))
    const res = (await http.post(`video-engines/${triggering.value.id}/trigger`, body)).data
    triggering.value = null
    toast.value = { message: res.message || 'Đã gửi yêu cầu tạo video', tone: 'good' }
    await load()
  } catch (e) {
    toast.value = { message: errorMessage(e), tone: 'critical' }
  } finally {
    busy.value = false
  }
}

const usd = (n) => n == null ? '—' : '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<template>
  <div class="space-y-4">
    <div class="card flex flex-wrap items-center gap-4 p-5">
      <div class="min-w-[240px] flex-1">
        <h2 class="text-sm font-bold">Nơi video được tạo ra</h2>
        <p class="mt-1 text-xs leading-relaxed text-ink-muted">
          <strong class="text-ink-2">Chạy tại máy</strong> dùng ảnh từ bài báo, không tốn phí.
          <strong class="text-ink-2">Veo 3</strong> và <strong class="text-ink-2">Kling</strong>
          sinh cảnh bằng AI theo prompt riêng của từng kênh — đẹp hơn nhiều nhưng tính tiền theo giây.
        </p>
      </div>
      <button class="btn btn-primary" @click="edit(null)">Thêm engine</button>
    </div>

    <div class="card overflow-hidden">
      <div v-if="loading" class="grid h-40 place-items-center text-sm text-ink-muted">Đang tải…</div>

      <EmptyState v-else-if="!engines.length" title="Chưa có engine nào"
                  hint="Thêm engine “Chạy tại máy” để dùng dây chuyền sẵn có, hoặc nối Veo/Kling để sinh cảnh bằng AI." />

      <ul v-else class="divide-y divide-line">
        <li v-for="e in engines" :key="e.id" class="flex flex-wrap items-center gap-3 px-5 py-4">
          <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-3 text-ink-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" class="size-4">
              <path v-if="e.is_ai" d="M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2M5 5h14v14H5zM9 9h6v6H9z" />
              <path v-else-if="e.type === 'local'" d="M5 4h14v12H5zM8 20h8M12 16v4" stroke-linecap="round" />
              <path v-else d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2c3 3.5 3 16.5 0 20M12 2c-3 3.5-3 16.5 0 20" />
            </svg>
          </span>

          <span class="min-w-0 flex-1">
            <span class="flex flex-wrap items-center gap-2">
              <span class="truncate text-[13px] font-semibold">{{ e.name }}</span>
              <span v-if="e.is_default" class="rounded px-1.5 py-0.5 text-[10px] font-bold"
                    style="background: var(--color-accent-soft); color:#ff8ba5">MẶC ĐỊNH</span>
              <span v-if="e.is_ai" class="rounded bg-surface-3 px-1.5 py-0.5 text-[10px] font-semibold text-ink-2">
                {{ e.model }}
              </span>
            </span>
            <span class="block truncate font-mono text-[11px] text-ink-muted">
              {{ e.is_ai ? `${e.resolution} · ${e.aspect_ratio} · clip ${e.clip_seconds}s`
                         : (e.type === 'local' ? (e.command || '—') : (e.endpoint || '—')) }}
            </span>
            <span class="block text-[11px] text-ink-muted">
              {{ e.runs_count }} video · {{ e.last_used_at ? `dùng lần cuối ${fmtTime(e.last_used_at)}` : 'chưa dùng' }}
              <template v-if="e.estimate">
                · <strong class="text-ink-2">{{ usd(e.estimate.per_video) }}</strong>/video
              </template>
            </span>
            <span v-if="e.last_error" class="mt-1 block text-[11px]" style="color:#f08d8d">{{ e.last_error }}</span>
          </span>

          <StatusPill :label="e.is_active ? 'Đang bật' : 'Đã tắt'" :tone="e.is_active ? 'good' : 'neutral'" />

          <span class="flex gap-1.5">
            <button class="btn !py-1.5 !text-xs" :disabled="!e.is_active"
                    @click="triggering = e; trigger = { date: '', items: '', voice: '' }">
              Tạo video
            </button>
            <button class="btn btn-ghost !py-1.5 !text-xs" @click="edit(e)">Sửa</button>
            <button class="btn btn-ghost !py-1.5 !text-xs text-ink-muted" @click="remove(e)">Xoá</button>
          </span>
        </li>
      </ul>
    </div>

    <!-- Hộp thoại sửa engine -->
    <Teleport to="body">
      <div v-if="editing" class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-4"
           @click.self="editing = null">
        <div class="card my-6 w-full max-w-xl p-6">
          <h3 class="text-base font-bold">{{ editing.id ? 'Sửa engine' : 'Thêm engine' }}</h3>

          <div class="mt-5 space-y-4">
            <div class="space-y-1.5">
              <label class="label">Tên</label>
              <input v-model="editing.name" class="input" placeholder="vd: Veo cho kênh chính" />
            </div>

            <div class="space-y-1.5">
              <label class="label">Loại</label>
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <label v-for="t in TYPES" :key="t.value"
                       class="cursor-pointer rounded-xl border p-2.5 text-center transition"
                       :style="{ borderColor: editing.type === t.value ? 'var(--color-accent)' : 'var(--color-line)',
                                 background: editing.type === t.value ? 'var(--color-accent-soft)' : 'transparent' }">
                  <input v-model="editing.type" type="radio" :value="t.value" class="sr-only" />
                  <span class="block text-[12px] font-semibold">{{ t.label }}</span>
                  <span class="mt-0.5 block text-[10px] leading-tight text-ink-muted">{{ t.hint }}</span>
                </label>
              </div>
            </div>

            <!-- Chạy tại máy -->
            <template v-if="editing.type === 'local'">
              <div class="space-y-1.5">
                <label class="label">Lệnh chạy</label>
                <input v-model="editing.command" class="input font-mono !text-xs" />
              </div>
              <div class="space-y-1.5">
                <label class="label">Thư mục làm việc</label>
                <input v-model="editing.working_dir" class="input font-mono !text-xs"
                       placeholder="bỏ trống = PIPELINE_ROOT trong .env" />
              </div>
            </template>

            <!-- API riêng -->
            <template v-else-if="editing.type === 'http'">
              <div class="space-y-1.5">
                <label class="label">Endpoint</label>
                <input v-model="editing.endpoint" class="input font-mono !text-xs"
                       placeholder="https://model.cua-ban.vn/generate" />
              </div>
              <div class="space-y-1.5">
                <label class="label">API key</label>
                <input v-model="editing.api_key" type="password" class="input font-mono !text-xs" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                  <label class="label">Header xác thực</label>
                  <input v-model="editing.auth_header" class="input font-mono !text-xs" />
                </div>
                <div class="space-y-1.5">
                  <label class="label">Tiền tố</label>
                  <input v-model="editing.auth_prefix" class="input font-mono !text-xs" />
                </div>
              </div>
            </template>

            <!-- Veo / Kling -->
            <template v-else-if="spec">
              <div class="space-y-1.5">
                <label class="label">Model</label>
                <select v-model="editing.model" class="input">
                  <option v-for="(m, id) in spec.models" :key="id" :value="id">{{ m.label }}</option>
                </select>
              </div>

              <div class="grid gap-3 sm:grid-cols-3">
                <div class="space-y-1.5">
                  <label class="label">Độ nét</label>
                  <select v-model="editing.resolution" class="input">
                    <option v-for="r in Object.keys(spec.models[editing.model]?.pricing || { '720p': 0 })"
                            :key="r" :value="r">{{ r }}</option>
                  </select>
                </div>
                <div class="space-y-1.5">
                  <label class="label">Khung hình</label>
                  <select v-model="editing.aspect_ratio" class="input">
                    <option v-for="a in spec.aspects" :key="a" :value="a">{{ a }}</option>
                  </select>
                </div>
                <div class="space-y-1.5">
                  <label class="label">Dài mỗi clip</label>
                  <select v-model.number="editing.clip_seconds" class="input">
                    <option v-for="d in spec.durations" :key="d" :value="d">{{ d }} giây</option>
                  </select>
                </div>
              </div>

              <div v-if="spec.modes" class="space-y-1.5">
                <label class="label">Chế độ</label>
                <select v-model="editing.mode" class="input !w-40">
                  <option v-for="m in spec.modes" :key="m" :value="m">{{ m }}</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="label">{{ spec.key_label }}</label>
                <input v-model="editing.api_key" type="password" class="input font-mono !text-xs"
                       :placeholder="editing.type === 'kling' ? 'Access Key' : 'AIza…'" />
              </div>
              <div v-if="editing.type === 'kling'" class="space-y-1.5">
                <label class="label">Secret Key</label>
                <input v-model="editing.api_secret" type="password" class="input font-mono !text-xs" />
              </div>

              <div class="space-y-1.5">
                <label class="label">Prompt loại trừ (không muốn xuất hiện)</label>
                <input v-model="editing.negative_prompt" class="input !text-xs"
                       placeholder="text, watermark, subtitles, logo, blurry" />
              </div>

              <div class="space-y-1.5">
                <label class="label">Đơn giá USD/giây (bỏ trống = theo bảng giá)</label>
                <input v-model.number="editing.cost_per_second" type="number" step="0.001" min="0"
                       class="input !w-40 tnum" placeholder="tự động" />
                <p class="text-[11px] text-ink-muted">
                  Nhà cung cấp đổi giá thì điền tay ở đây để ước tính khỏi lệch.
                </p>
              </div>

              <!-- Bộ ước tính chi phí -->
              <div v-if="estimate" class="rounded-xl border p-4"
                   :style="{ borderColor: estimate.per_month > 300 ? 'rgba(208,59,59,.35)' : 'rgba(250,178,25,.3)',
                             background: estimate.per_month > 300 ? 'rgba(208,59,59,.08)' : 'rgba(250,178,25,.07)' }">
                <p class="text-[12px] font-bold"
                   :style="{ color: estimate.per_month > 300 ? '#f08d8d' : '#f8cf72' }">
                  Chi phí ước tính cho video {{ TARGET_SECONDS }} giây
                </p>
                <div class="mt-2.5 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div class="tnum text-lg font-bold">{{ usd(estimate.per_video) }}</div>
                    <div class="text-[10px] text-ink-muted">mỗi video</div>
                  </div>
                  <div>
                    <div class="tnum text-lg font-bold">{{ usd(estimate.per_month) }}</div>
                    <div class="text-[10px] text-ink-muted">mỗi tháng (30 video)</div>
                  </div>
                  <div>
                    <div class="tnum text-lg font-bold">{{ usd(estimate.per_month * 12) }}</div>
                    <div class="text-[10px] text-ink-muted">mỗi năm</div>
                  </div>
                </div>
                <p class="mt-2.5 text-[11px] leading-relaxed text-ink-2">
                  {{ estimate.clips }} clip × {{ editing.clip_seconds }}s = {{ estimate.billed_seconds }}s
                  tính tiền, đơn giá {{ usd(estimate.rate) }}/giây.
                  Clip có độ dài cố định nên phần dư vẫn bị tính.
                </p>
              </div>
            </template>

            <div class="flex gap-5 border-t border-line pt-4">
              <label class="flex cursor-pointer items-center gap-2 text-[13px]">
                <input v-model="editing.is_default" type="checkbox" class="accent-[#FF2D55]" /> Mặc định
              </label>
              <label class="flex cursor-pointer items-center gap-2 text-[13px]">
                <input v-model="editing.is_active" type="checkbox" class="accent-[#FF2D55]" /> Đang bật
              </label>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button class="btn" @click="editing = null">Huỷ</button>
            <button class="btn btn-primary" :disabled="busy || !editing.name" @click="save">
              {{ busy ? 'Đang lưu…' : 'Lưu' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Hộp thoại tạo video -->
      <div v-if="triggering" class="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
           @click.self="triggering = null">
        <div class="card w-full max-w-md p-6">
          <h3 class="text-base font-bold">Tạo video bằng “{{ triggering.name }}”</h3>
          <p class="mt-1 text-xs text-ink-muted">Bỏ trống để dùng thiết lập mặc định trong config.json.</p>

          <p v-if="triggering.estimate" class="mt-3 rounded-lg px-3 py-2 text-[11px]"
             style="background: rgba(250,178,25,.1); color:#f8cf72">
            Lần chạy này ước tính tốn {{ usd(triggering.estimate.per_video) }}.
          </p>

          <div class="mt-5 space-y-4">
            <div class="space-y-1.5">
              <label class="label">Ngày bản tin</label>
              <input v-model="trigger.date" type="date" class="input" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="label">Số tin</label>
                <input v-model="trigger.items" type="number" min="1" max="30" class="input" placeholder="10" />
              </div>
              <div class="space-y-1.5">
                <label class="label">Giọng đọc</label>
                <input v-model="trigger.voice" class="input font-mono !text-xs" placeholder="vi-VN-HoaiMyNeural" />
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button class="btn" @click="triggering = null">Huỷ</button>
            <button class="btn btn-primary" :disabled="busy" @click="run">
              {{ busy ? 'Đang gửi…' : 'Bắt đầu tạo' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Toast :message="toast.message" :tone="toast.tone" @close="toast.message = ''" />
  </div>
</template>
