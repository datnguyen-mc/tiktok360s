<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import http, { errorMessage } from '../api'
import StatusPill from '../components/StatusPill.vue'
import EmptyState from '../components/EmptyState.vue'
import Toast from '../components/Toast.vue'
import { fmtTime } from '../format'

const route = useRoute()
const channels = ref([])
const variables = ref({})
const defaultPrompt = ref('')
const engines = ref([])
const loading = ref(true)
const busy = ref(false)
const editing = ref(null)
const toast = ref({ message: '', tone: 'good' })
const promptPreview = ref('')
const tab = ref('dang-bai')     // dang-bai | prompt

async function load() {
  loading.value = true
  try {
    const [c, e] = await Promise.all([http.get('channels'), http.get('video-engines')])
    channels.value = c.data.channels
    variables.value = c.data.variables
    defaultPrompt.value = c.data.default_prompt
    engines.value = e.data.engines
  } finally {
    loading.value = false
  }
}

/** Xem thử prompt với một tin mẫu — khỏi phải render mới biết nó ra gì. */
async function preview() {
  const template = editing.value?.prompt_template
  if (!template) { promptPreview.value = ''; return }
  try {
    promptPreview.value = (await http.post('channels/preview-prompt', { template })).data.preview
  } catch { promptPreview.value = '' }
}

function insertVar(name) {
  editing.value.prompt_template = (editing.value.prompt_template || '') + name
  preview()
}

onMounted(() => {
  load()
  if (route.query.connected) toast.value = { message: 'Đã kết nối tài khoản TikTok', tone: 'good' }
  if (route.query.error) toast.value = { message: String(route.query.error), tone: 'critical' }
})

function edit(c) {
  editing.value = {
    ...c,
    publish_time: c.publish_time ? c.publish_time.slice(0, 5) : '',
    prompt_template: c.prompt_template || '',
  }
  tab.value = 'dang-bai'
  preview()
}

async function save() {
  busy.value = true
  try {
    const b = editing.value
    await http.put(`channels/${b.id}`, {
      nickname: b.nickname, is_active: b.is_active, auto_publish: b.auto_publish,
      publish_time: b.publish_time || null, default_mode: b.default_mode,
      default_privacy: b.default_privacy, caption_suffix: b.caption_suffix, notes: b.notes,
      video_engine_id: b.video_engine_id || null,
      prompt_template: b.prompt_template || null, negative_prompt: b.negative_prompt || null,
    })
    editing.value = null
    await load()
    toast.value = { message: 'Đã lưu thiết lập kênh', tone: 'good' }
  } catch (e) {
    toast.value = { message: errorMessage(e), tone: 'critical' }
  } finally {
    busy.value = false
  }
}

async function disconnect(c) {
  if (!confirm(`Ngắt kết nối ${c.nickname || c.display_name || c.open_id}?`)) return
  try {
    await http.delete(`tiktok-accounts/${c.id}`)
    await load()
  } catch (e) {
    toast.value = { message: errorMessage(e), tone: 'critical' }
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="card flex flex-wrap items-center gap-4 p-5">
      <span class="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-3">
        <svg viewBox="0 0 24 24" class="size-5 fill-ink-2">
          <path d="M16.5 5.2a4.9 4.9 0 0 1-1.2-3.2h-3v13a2.8 2.8 0 1 1-2-2.7v-3a5.8 5.8 0 1 0 5 5.7V8.6a7.9 7.9 0 0 0 4.6 1.5v-3a4.9 4.9 0 0 1-3.4-1.9z"/>
        </svg>
      </span>
      <div class="min-w-[240px] flex-1">
        <h2 class="text-sm font-bold">Kênh TikTok</h2>
        <p class="mt-1 text-xs leading-relaxed text-ink-muted">
          Mỗi tài khoản đã kết nối là một kênh, có thiết lập đăng bài riêng.
          Điền khoá API ở mục <RouterLink to="/settings" class="text-ink-2 underline decoration-dotted">Cài đặt</RouterLink> trước khi kết nối.
        </p>
      </div>
      <a href="/tiktok/connect" class="btn btn-primary">Kết nối kênh mới</a>
    </div>

    <div v-if="loading" class="card grid h-40 place-items-center text-sm text-ink-muted">Đang tải…</div>

    <EmptyState v-else-if="!channels.length" title="Chưa kết nối kênh nào"
                hint="Bấm “Kết nối kênh mới” để cấp quyền cho ứng dụng." />

    <div v-else class="grid gap-3 lg:grid-cols-2">
      <article v-for="c in channels" :key="c.id" class="card p-5">
        <div class="flex items-start gap-3.5">
          <img v-if="c.avatar_url" :src="c.avatar_url" alt="" class="size-11 shrink-0 rounded-full object-cover" />
          <span v-else class="grid size-11 shrink-0 place-items-center rounded-full bg-surface-3 text-sm font-bold">
            {{ (c.nickname || c.display_name || '?').slice(0, 1).toUpperCase() }}
          </span>

          <div class="min-w-0 flex-1">
            <h3 class="truncate text-[14px] font-bold">{{ c.nickname || c.display_name || c.open_id }}</h3>
            <p v-if="c.nickname && c.display_name" class="truncate text-[11px] text-ink-muted">
              {{ c.display_name }}
            </p>
            <p class="mt-1 text-[11px] text-ink-muted">
              {{ c.published_count }} video đã đăng
            </p>
          </div>

          <StatusPill v-if="c.refresh_expired" label="Phải kết nối lại" tone="critical" />
          <StatusPill v-else-if="!c.is_active" label="Đã tắt" tone="neutral" />
          <StatusPill v-else-if="c.token_expired" label="Token sẽ tự làm mới" tone="warning" />
          <StatusPill v-else label="Sẵn sàng" tone="good" />
        </div>

        <dl class="mt-4 space-y-1.5 border-t border-line pt-3.5 text-[12px]">
          <div class="flex justify-between gap-3">
            <dt class="text-ink-muted">Tự động đăng</dt>
            <dd :style="{ color: c.auto_publish ? 'var(--color-good)' : 'inherit' }">
              {{ c.auto_publish ? `Bật${c.publish_time ? ' · ' + c.publish_time.slice(0,5) : ' · ngay khi có video'}` : 'Tắt' }}
            </dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-ink-muted">Cách đăng</dt>
            <dd>{{ c.default_mode === 'inbox' ? 'Vào mục nháp' : 'Đăng thẳng' }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-ink-muted">Mức riêng tư</dt>
            <dd class="font-mono text-[11px]">{{ c.default_privacy }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-ink-muted">Engine tạo video</dt>
            <dd class="truncate">{{ c.engine?.name || 'mặc định' }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-ink-muted">Prompt riêng</dt>
            <dd :style="{ color: c.prompt_template ? 'var(--color-good)' : 'inherit' }">
              {{ c.prompt_template ? 'Đã đặt' : 'Chưa đặt' }}
            </dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-ink-muted">Token hết hạn</dt>
            <dd class="tnum">{{ fmtTime(c.access_expires_at) }}</dd>
          </div>
        </dl>

        <div class="mt-4 flex gap-2">
          <button class="btn flex-1 justify-center !py-1.5 !text-xs" @click="edit(c)">Thiết lập</button>
          <button class="btn btn-ghost !py-1.5 !text-xs text-ink-muted" @click="disconnect(c)">Ngắt</button>
        </div>
      </article>
    </div>

    <!-- Hộp thoại thiết lập kênh -->
    <Teleport to="body">
      <div v-if="editing" class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-4"
           @click.self="editing = null">
        <div class="card w-full max-w-lg p-6">
          <h3 class="text-base font-bold">Thiết lập kênh</h3>
          <p class="mt-1 text-xs text-ink-muted">{{ editing.display_name || editing.open_id }}</p>

          <div class="mt-4 flex gap-1 border-b border-line">
            <button v-for="t in [['dang-bai','Đăng bài'], ['prompt','Prompt tạo cảnh']]" :key="t[0]"
                    class="-mb-px border-b-2 px-3 py-2 text-[13px] font-semibold transition"
                    :style="{ borderColor: tab === t[0] ? 'var(--color-accent)' : 'transparent',
                              color: tab === t[0] ? 'var(--color-ink)' : 'var(--color-ink-muted)' }"
                    @click="tab = t[0]">{{ t[1] }}</button>
          </div>

          <div v-show="tab === 'dang-bai'" class="mt-5 space-y-4">
            <div class="space-y-1.5">
              <label class="label">Tên gọi nội bộ</label>
              <input v-model="editing.nickname" class="input" placeholder="vd: Kênh chính" />
            </div>

            <div class="flex flex-wrap gap-5">
              <label class="flex cursor-pointer items-center gap-2 text-[13px]">
                <input v-model="editing.is_active" type="checkbox" class="accent-[#FF2D55]" /> Kênh đang hoạt động
              </label>
              <label class="flex cursor-pointer items-center gap-2 text-[13px]">
                <input v-model="editing.auto_publish" type="checkbox" class="accent-[#FF2D55]" /> Tự động đăng
              </label>
            </div>

            <div v-if="editing.auto_publish" class="space-y-1.5">
              <label class="label">Giờ đăng</label>
              <input v-model="editing.publish_time" type="time" class="input !w-36" />
              <p class="text-[11px] text-ink-muted">
                Bỏ trống là đăng ngay khi dây chuyền nạp video mới.
              </p>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <div class="space-y-1.5">
                <label class="label">Cách đăng</label>
                <select v-model="editing.default_mode" class="input">
                  <option value="inbox">Vào mục nháp</option>
                  <option value="direct_post">Đăng thẳng</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="label">Mức riêng tư</label>
                <select v-model="editing.default_privacy" class="input">
                  <option value="SELF_ONLY">Chỉ mình tôi</option>
                  <option value="PUBLIC_TO_EVERYONE">Công khai</option>
                  <option value="MUTUAL_FOLLOW_FRIENDS">Bạn bè</option>
                  <option value="FOLLOWER_OF_CREATOR">Người theo dõi</option>
                </select>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="label">Chèn cuối caption</label>
              <textarea v-model="editing.caption_suffix" rows="2" class="input resize-y !text-xs"
                        placeholder="vd: #kenhcuatoi #showbiz"></textarea>
            </div>

            <div class="space-y-1.5">
              <label class="label">Ghi chú</label>
              <textarea v-model="editing.notes" rows="2" class="input resize-y !text-xs"></textarea>
            </div>
          </div>

          <!-- Tab prompt -->
          <div v-show="tab === 'prompt'" class="mt-5 space-y-4">
            <div class="space-y-1.5">
              <label class="label">Engine tạo video</label>
              <select v-model="editing.video_engine_id" class="input">
                <option :value="null">Dùng engine mặc định</option>
                <option v-for="e in engines" :key="e.id" :value="e.id">
                  {{ e.name }}{{ e.is_ai ? ` · ${e.model}` : '' }}
                </option>
              </select>
              <p class="text-[11px] leading-relaxed text-ink-muted">
                Prompt chỉ có tác dụng khi engine là Veo hoặc Kling. Engine “Chạy tại máy”
                dùng ảnh từ bài báo, không cần prompt.
              </p>
            </div>

            <div class="space-y-1.5">
              <label class="label">Mẫu prompt tạo cảnh</label>
              <textarea v-model="editing.prompt_template" rows="5"
                        class="input resize-y font-mono !text-xs"
                        :placeholder="defaultPrompt" @input="preview"></textarea>
              <div class="flex flex-wrap gap-1.5 pt-1">
                <button v-for="(desc, name) in variables" :key="name" :title="desc"
                        class="rounded-md bg-surface-3 px-2 py-1 font-mono text-[11px] text-ink-2
                               transition hover:bg-surface-2 hover:text-ink"
                        @click="insertVar(name)">{{ name }}</button>
              </div>
              <p class="text-[11px] leading-relaxed text-ink-muted">
                Bấm một biến để chèn. Mỗi tin sẽ sinh một clip riêng từ mẫu này.
              </p>
            </div>

            <div v-if="promptPreview" class="space-y-1.5">
              <label class="label">Xem thử với một tin mẫu</label>
              <p class="rounded-lg bg-surface-2 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-ink-2">
                {{ promptPreview }}
              </p>
            </div>

            <div class="space-y-1.5">
              <label class="label">Prompt loại trừ (ghi đè thiết lập của engine)</label>
              <input v-model="editing.negative_prompt" class="input !text-xs"
                     placeholder="text, watermark, subtitles, logo" />
            </div>

            <p class="rounded-lg px-3 py-2.5 text-[11px] leading-relaxed"
               style="background: rgba(250,178,25,.1); color:#f8cf72">
              Veo và Kling chỉ tạo được clip 4–10 giây. Video dài được ghép từ nhiều clip,
              mỗi tin một clip. Chi phí tính theo tổng số giây — xem ước tính ở mục Engine
              trước khi bật.
            </p>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button class="btn" @click="editing = null">Huỷ</button>
            <button class="btn btn-primary" :disabled="busy" @click="save">
              {{ busy ? 'Đang lưu…' : 'Lưu' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Toast :message="toast.message" :tone="toast.tone" @close="toast.message = ''" />
  </div>
</template>
