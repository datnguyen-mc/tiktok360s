<script setup>
/*
 * Hộp thoại "Tạo video": chọn engine, gõ prompt, xem thử, lưu prompt để dùng lại.
 *
 * Prompt chỉ hiện khi engine là loại sinh cảnh bằng AI (Veo / Kling). Engine
 * "Chạy tại máy" dùng ảnh từ bài báo nên không có gì để nhập.
 */
import { computed, onMounted, ref, watch } from 'vue'
import http, { errorMessage } from '../api'

const emit = defineEmits(['close', 'created'])

const engines = ref([])
const topics = ref([])
const presets = ref([])
const variables = ref({})
const defaultPrompt = ref('')
const loading = ref(true)
const busy = ref(false)
const error = ref('')
const preview = ref('')
const savePrompt = ref(false)

const form = ref({
  topic: '',
  video_engine_id: null,
  prompt_preset_id: null,
  prompt: '',
  negative_prompt: '',
  date: '',
  items: '',
  voice: '',
  save_as: '',
})

const engine = computed(() => engines.value.find((e) => e.id === form.value.video_engine_id))
const isAi = computed(() => !!engine.value?.is_ai)

onMounted(async () => {
  try {
    const [e, p, t] = await Promise.all([
      http.get('video-engines'), http.get('prompt-presets'), http.get('topics'),
    ])
    engines.value = e.data.engines.filter((x) => x.is_active)
    presets.value = p.data.presets
    topics.value = t.data.topics.filter((x) => !x.broken)
    form.value.topic = topics.value[0]?.slug ?? ''
    variables.value = p.data.variables
    defaultPrompt.value = p.data.default_prompt
    form.value.video_engine_id = engines.value.find((x) => x.is_default)?.id
                              ?? engines.value[0]?.id ?? null
  } catch (err) {
    error.value = errorMessage(err)
  } finally {
    loading.value = false
  }
})

// Chọn prompt đã lưu thì đổ nội dung ra ô soạn để sửa tiếp được
watch(() => form.value.prompt_preset_id, (id) => {
  const p = presets.value.find((x) => x.id === id)
  if (!p) return
  form.value.prompt = p.template
  form.value.negative_prompt = p.negative_prompt || ''
  refreshPreview()
})

let timer
function refreshPreview() {
  clearTimeout(timer)
  timer = setTimeout(async () => {
    if (!form.value.prompt) { preview.value = ''; return }
    try {
      preview.value = (await http.post('prompt-presets/preview',
        { template: form.value.prompt })).data.preview
    } catch { preview.value = '' }
  }, 250)
}

function insertVar(name) {
  form.value.prompt = (form.value.prompt || '') + name
  refreshPreview()
}

function useDefault() {
  form.value.prompt = defaultPrompt.value
  refreshPreview()
}

async function submit() {
  busy.value = true
  error.value = ''
  try {
    const body = { ...form.value }
    if (!savePrompt.value) delete body.save_as
    const res = (await http.post('videos/create', body)).data
    emit('created', res)
  } catch (e) {
    error.value = errorMessage(e, 'Không tạo được video')
  } finally {
    busy.value = false
  }
}

const usd = (n) => n == null ? '—'
  : '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<template>
  <div class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-4"
       @click.self="$emit('close')">
    <div class="card my-6 w-full max-w-xl p-6">
      <h3 class="text-base font-bold">Tạo video mới</h3>
      <p class="mt-1 text-xs text-ink-muted">
        Dây chuyền chạy nền, mất khoảng một phút. Video xong sẽ tự hiện ở danh sách.
      </p>

      <div v-if="loading" class="grid h-32 place-items-center text-sm text-ink-muted">Đang tải…</div>

      <div v-else-if="!engines.length"
           class="mt-5 rounded-xl px-4 py-3 text-[13px] leading-relaxed"
           style="background: rgba(250,178,25,.1); color:#f8cf72">
        Chưa có engine nào đang bật.
        <RouterLink to="/engines" class="underline" @click="$emit('close')">
          Vào mục Engine tạo video
        </RouterLink>
        để thêm một cái.
      </div>

      <div v-else class="mt-5 space-y-4">
        <!-- Chủ đề: quyết định nguồn tin, từ khoá và nhận diện của video -->
        <div v-if="topics.length > 1" class="space-y-1.5">
          <label class="label">Chủ đề</label>
          <div class="grid gap-2" :class="topics.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'">
            <label v-for="t in topics" :key="t.slug"
                   class="flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 transition"
                   :style="{ borderColor: form.topic === t.slug ? (t.brand?.accent || 'var(--color-accent)') : 'var(--color-line)',
                             background: form.topic === t.slug ? 'rgba(255,255,255,.04)' : 'transparent' }">
              <input v-model="form.topic" type="radio" :value="t.slug" class="sr-only" />
              <span class="size-3 shrink-0 rounded-full"
                    :style="{ background: t.brand?.accent || '#3A3A48' }"></span>
              <span class="min-w-0">
                <span class="block truncate text-[13px] font-semibold">{{ t.name }}</span>
                <span class="block truncate text-[10px] text-ink-muted">{{ t.sources }} nguồn tin</span>
              </span>
            </label>
          </div>
        </div>

        <!-- Engine -->
        <div class="space-y-1.5">
          <label class="label">Tạo bằng</label>
          <select v-model="form.video_engine_id" class="input">
            <option v-for="e in engines" :key="e.id" :value="e.id">
              {{ e.name }}{{ e.is_ai ? ` · ${e.model}` : ' · dùng ảnh báo' }}
            </option>
          </select>
        </div>

        <!-- Prompt (chỉ khi engine sinh cảnh bằng AI) -->
        <template v-if="isAi">
          <div v-if="presets.length" class="space-y-1.5">
            <label class="label">Dùng lại prompt đã lưu</label>
            <select v-model="form.prompt_preset_id" class="input">
              <option :value="null">— soạn prompt mới —</option>
              <option v-for="p in presets" :key="p.id" :value="p.id">
                {{ p.name }}{{ p.usage_count ? ` · đã dùng ${p.usage_count} lần` : '' }}
              </option>
            </select>
          </div>

          <div class="space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <label class="label" for="prompt">Prompt tạo cảnh</label>
              <button class="text-[11px] text-ink-2 underline decoration-dotted hover:text-ink"
                      @click="useDefault">Dùng mẫu gợi ý</button>
            </div>
            <textarea id="prompt" v-model="form.prompt" rows="5"
                      class="input resize-y font-mono !text-xs"
                      :placeholder="defaultPrompt" @input="refreshPreview"></textarea>

            <div class="flex flex-wrap gap-1.5 pt-1">
              <button v-for="(desc, name) in variables" :key="name" :title="desc"
                      class="rounded-md bg-surface-3 px-2 py-1 font-mono text-[11px] text-ink-2
                             transition hover:bg-surface-2 hover:text-ink"
                      @click="insertVar(name)">{{ name }}</button>
            </div>
            <p class="text-[11px] leading-relaxed text-ink-muted">
              Bấm một biến để chèn. Mỗi tin trong video sẽ sinh một clip riêng từ mẫu này.
            </p>
          </div>

          <div v-if="preview" class="space-y-1.5">
            <label class="label">Xem thử với một tin mẫu</label>
            <p class="rounded-lg bg-surface-2 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-ink-2">
              {{ preview }}
            </p>
          </div>

          <div class="space-y-1.5">
            <label class="label" for="neg">Prompt loại trừ</label>
            <input id="neg" v-model="form.negative_prompt" class="input !text-xs"
                   placeholder="text, watermark, subtitles, logo" />
          </div>

          <!-- Lưu prompt lại -->
          <div class="rounded-xl border border-line p-3.5">
            <label class="flex cursor-pointer items-center gap-2 text-[13px] font-semibold">
              <input v-model="savePrompt" type="checkbox" class="accent-[#FF2D55]" />
              Lưu prompt này để dùng lại
            </label>
            <input v-if="savePrompt" v-model="form.save_as" class="input mt-2.5"
                   placeholder="Đặt tên, vd: Phong cách điện ảnh tối" maxlength="120" />
          </div>

          <!-- Chi phí -->
          <div v-if="engine?.estimate" class="rounded-xl border p-3.5"
               :style="{ borderColor: engine.estimate.per_video > 20 ? 'rgba(208,59,59,.35)' : 'rgba(250,178,25,.3)',
                         background: engine.estimate.per_video > 20 ? 'rgba(208,59,59,.08)' : 'rgba(250,178,25,.07)' }">
            <p class="text-[12px] leading-relaxed"
               :style="{ color: engine.estimate.per_video > 20 ? '#f08d8d' : '#f8cf72' }">
              Lần chạy này ước tính tốn <strong>{{ usd(engine.estimate.per_video) }}</strong>
              ({{ engine.estimate.clips }} clip × {{ engine.clip_seconds }}s,
              {{ usd(engine.estimate.rate) }}/giây).
            </p>
          </div>
        </template>

        <!-- Tuỳ chọn chung -->
        <div class="grid gap-3 sm:grid-cols-3">
          <div class="space-y-1.5">
            <label class="label" for="d">Ngày bản tin</label>
            <input id="d" v-model="form.date" type="date" class="input" />
          </div>
          <div class="space-y-1.5">
            <label class="label" for="n">Số tin</label>
            <input id="n" v-model="form.items" type="number" min="1" max="30" class="input"
                   placeholder="10" />
          </div>
          <div class="space-y-1.5">
            <label class="label" for="v">Giọng đọc</label>
            <input id="v" v-model="form.voice" class="input font-mono !text-xs" placeholder="mặc định" />
          </div>
        </div>
        <p class="text-[11px] text-ink-muted">Bỏ trống để dùng thiết lập trong config.json.</p>

        <p v-if="error" class="rounded-lg px-3 py-2 text-xs leading-relaxed"
           style="background: rgba(208,59,59,.14); color:#f08d8d">{{ error }}</p>
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button class="btn" @click="$emit('close')">Huỷ</button>
        <button class="btn btn-primary"
                :disabled="busy || loading || !engines.length || (savePrompt && !form.save_as)"
                @click="submit">
          {{ busy ? 'Đang gửi…' : 'Bắt đầu tạo' }}
        </button>
      </div>
    </div>
  </div>
</template>
