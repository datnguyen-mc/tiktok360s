<script setup>
import { computed, onMounted, ref } from 'vue'
import http, { errorMessage } from '../api'
import Toast from '../components/Toast.vue'

const data = ref(null)
const form = ref({})
const busy = ref(false)
const toast = ref({ message: '', tone: 'good' })

// Gemini và OpenAI nằm chung một tab vì chúng thay thế nhau: chọn bên nào là
// quyết định một lần, nhìn cạnh nhau mới so được. `nhom` là tiền tố khoá cài
// đặt thuộc tab đó, dùng để chấm dấu "chưa lưu".
const TABS = [
  { id: 'tiktok', nhan: 'TikTok', nhom: ['tiktok'] },
  { id: 'dangnhap', nhan: 'Đăng nhập', nhom: ['google'] },
  { id: 'ai', nhan: 'AI viết kịch bản', nhom: ['gemini', 'openai'] },
  { id: 'luutru', nhan: 'Lưu trữ', nhom: ['r2'] },
]

const LUU_TAB = 'cms.settings.tab'
const tab = ref(TABS[0].id)
try {
  const d = localStorage.getItem(LUU_TAB)
  if (TABS.some((t) => t.id === d)) tab.value = d
} catch { /* chế độ riêng tư chặn localStorage — cứ mở tab đầu */ }

function chonTab(id) {
  tab.value = id
  try { localStorage.setItem(LUU_TAB, id) } catch { /* không lưu được thì thôi */ }
}

/**
 * Tab nào đang có ô bị sửa mà chưa lưu.
 *
 * Có tab rồi thì sửa ở tab này, chuyển sang tab khác là không còn thấy ô vừa
 * sửa nữa — không đánh dấu thì rất dễ bỏ đi mà tưởng đã lưu.
 */
const tabDoi = computed(() => {
  const goc = data.value?.values || {}
  const doi = new Set()
  for (const [k, v] of Object.entries(form.value)) {
    if (v === goc[k]) continue
    const t = TABS.find((x) => x.nhom.includes(k.split('.')[0]))
    if (t) doi.add(t.id)
  }
  return doi
})

// Danh sách model của cả hai bên, hỏi thẳng API nhà cung cấp.
const models = ref({ gemini: [], openai: [] })
const nguon = ref({ gemini: '', openai: '' })

async function taiModels() {
  for (const p of ['gemini', 'openai']) {
    try {
      const r = (await http.get(`ai-models/${p}`)).data
      models.value[p] = r.models || []
      nguon.value[p] = r.source || ''
    } catch { /* hỏng thì để trống, ô vẫn giữ giá trị đang có */ }
  }
}

/** Giá trị đang lưu luôn phải có trong danh sách, không thì mở trang là mất. */
function tuyChon(p) {
  const dang = form.value[`${p}.model`]
  const ds = [...(models.value[p] || [])]
  if (dang && !ds.includes(dang)) ds.unshift(dang)
  return ds
}

async function load() {
  data.value = (await http.get('settings')).data
  form.value = { ...data.value.values }
  taiModels()
}

onMounted(load)

async function save() {
  busy.value = true
  try {
    // Gửi dạng lồng để Laravel validate theo 'tiktok.client_key'
    const payload = {}
    for (const [k, v] of Object.entries(form.value)) {
      const [group, key] = k.split('.')
      payload[group] ??= {}
      payload[group][key] = v
    }
    data.value = (await http.put('settings', payload)).data
    form.value = { ...data.value.values }
    toast.value = { message: 'Đã lưu cấu hình', tone: 'good' }
  } catch (e) {
    toast.value = { message: errorMessage(e), tone: 'critical' }
  } finally {
    busy.value = false
  }
}

async function copy(text) {
  await navigator.clipboard.writeText(text)
  toast.value = { message: 'Đã sao chép', tone: 'good' }
}
</script>

<template>
  <div v-if="!data" class="grid h-48 place-items-center text-sm text-ink-muted">Đang tải…</div>

  <div v-else class="max-w-3xl space-y-4">
    <nav class="flex flex-wrap gap-1 border-b border-line" role="tablist">
      <button v-for="t in TABS" :key="t.id" role="tab" :aria-selected="tab === t.id"
              class="relative -mb-px border-b-2 px-3 py-2 text-[13px] font-semibold transition"
              :class="tab === t.id
                ? 'border-accent text-ink-1'
                : 'border-transparent text-ink-muted hover:text-ink-2'"
              @click="chonTab(t.id)">
        {{ t.nhan }}
        <span v-if="tabDoi.has(t.id)"
              class="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-400 align-middle"
              title="Có thay đổi chưa lưu"></span>
      </button>
    </nav>

    <!-- TikTok -->
    <section v-show="tab === 'tiktok'" class="card p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-sm font-bold">Khoá TikTok Open API</h2>
          <p class="mt-1 text-xs leading-relaxed text-ink-muted">
            Tạo ứng dụng tại <a href="https://developers.tiktok.com" target="_blank" rel="noopener"
            class="text-ink-2 underline decoration-dotted">developers.tiktok.com</a>,
            bật sản phẩm <strong class="text-ink-2">Content Posting API</strong>, rồi chép khoá vào đây.
          </p>
        </div>
        <span v-if="data.tiktok_ready"
              class="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style="background: rgba(12,163,12,.12); color:#7ee27e">Đã cấu hình</span>
        <span v-else class="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style="background: rgba(250,178,25,.12); color:#f8cf72">Chưa đủ khoá</span>
      </div>

      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="label">Client Key</label>
          <input v-model="form['tiktok.client_key']" class="input font-mono !text-xs" placeholder="aw1234…" />
        </div>
        <div class="space-y-1.5">
          <label class="label">Client Secret</label>
          <input v-model="form['tiktok.client_secret']" type="password" class="input font-mono !text-xs"
                 placeholder="••••••••" />
        </div>
        <div class="space-y-1.5 sm:col-span-2">
          <label class="label">Redirect URI</label>
          <input v-model="form['tiktok.redirect_uri']" class="input font-mono !text-xs" />
          <p class="flex items-center gap-2 text-[11px] text-ink-muted">
            Khai đúng chuỗi này trong phần <em>Redirect URI</em> của app TikTok:
            <button class="underline decoration-dotted" @click="copy(data.callback.tiktok)">
              {{ data.callback.tiktok }}
            </button>
          </p>
        </div>
        <div class="space-y-1.5">
          <label class="label">Cách đăng mặc định</label>
          <select v-model="form['tiktok.post_mode']" class="input">
            <option value="inbox">Vào mục nháp (chỉ cần video.upload)</option>
            <option value="direct_post">Đăng thẳng (cần video.publish đã duyệt)</option>
          </select>
        </div>
      </div>

      <p class="mt-4 rounded-lg px-3 py-2.5 text-[11px] leading-relaxed"
         style="background: rgba(250,178,25,.1); color:#f8cf72">
        Trước khi TikTok duyệt ứng dụng, quyền <code>video.publish</code> chỉ đăng được ở mức
        <strong>Chỉ mình tôi</strong>. Muốn đăng công khai tự động thì phải nộp app cho TikTok duyệt.
        Chế độ “vào mục nháp” không vướng giới hạn này.
      </p>
    </section>

    <!-- Google -->
    <section v-show="tab === 'dangnhap'" class="card p-5">
      <h2 class="text-sm font-bold">Đăng nhập Google</h2>
      <p class="mt-1 text-xs leading-relaxed text-ink-muted">
        Tạo OAuth Client (loại Web application) tại
        <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener"
           class="text-ink-2 underline decoration-dotted">Google Cloud Console</a>.
      </p>

      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="label">Client ID</label>
          <input v-model="form['google.client_id']" class="input font-mono !text-xs"
                 placeholder="…apps.googleusercontent.com" />
        </div>
        <div class="space-y-1.5">
          <label class="label">Client Secret</label>
          <input v-model="form['google.client_secret']" type="password" class="input font-mono !text-xs"
                 placeholder="••••••••" />
        </div>
        <div class="space-y-1.5 sm:col-span-2">
          <label class="label">Redirect URI</label>
          <input v-model="form['google.redirect_uri']" class="input font-mono !text-xs" />
          <p class="flex items-center gap-2 text-[11px] text-ink-muted">
            Khai trong <em>Authorized redirect URIs</em>:
            <button class="underline decoration-dotted" @click="copy(data.callback.google)">
              {{ data.callback.google }}
            </button>
          </p>
        </div>
        <div class="space-y-1.5 sm:col-span-2">
          <label class="label">Tên miền được phép</label>
          <input v-model="form['google.allowed_domain']" class="input" placeholder="vd: metacrew.vn" />
          <p class="text-[11px] leading-relaxed text-ink-muted">
            Bỏ trống thì <strong class="text-ink-2">chỉ email đã có sẵn trong CMS</strong> mới vào được —
            an toàn nhất. Điền tên miền để người cùng công ty tự tạo tài khoản khi đăng nhập lần đầu.
          </p>
        </div>
      </div>
    </section>

    <!-- Gemini: viết kịch bản cho kênh phim nhiều tập -->
    <section v-show="tab === 'ai'" class="card p-5">
      <h2 class="text-sm font-bold">Gemini · viết kịch bản series</h2>
      <p class="mt-1 text-[12px] leading-relaxed text-ink-muted">
        Kênh phim nhiều tập không lấy tin từ RSS — mỗi ngày AI đọc tập hôm trước rồi viết
        tập kế tiếp. Lấy khoá ở
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener"
           class="text-ink-2 underline decoration-dotted">Google AI Studio</a>.
      </p>

      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="label">Khoá API</label>
          <input v-model="form['gemini.api_key']" type="password" class="input font-mono !text-xs"
                 placeholder="AIza…" autocomplete="off" />
          <p class="text-[11px] leading-relaxed text-ink-muted">
            Bỏ trống thì hệ thống <strong class="text-ink-2">mượn khoá của engine Veo</strong>
            đang bật — cùng một khoá Google AI Studio dùng được cho cả hai.
          </p>
        </div>
        <div class="space-y-1.5">
          <label class="label">Model</label>
          <select v-model="form['gemini.model']" class="input font-mono !text-xs">
            <option value="">— mặc định (gemini-flash-latest) —</option>
            <option v-for="m in tuyChon('gemini')" :key="m" :value="m">{{ m }}</option>
          </select>
          <p class="text-[11px] leading-relaxed text-ink-muted">
            Bỏ trống thì dùng model khai trong <code>topics/&lt;kênh&gt;.json</code>.
            <template v-if="nguon.gemini === 'api'">{{ models.gemini.length }} model lấy từ API.</template>
            <template v-else-if="nguon.gemini">Chưa có khoá — danh sách dự phòng.</template>
          </p>
        </div>
      </div>
    </section>

    <section v-show="tab === 'ai'" class="card p-5">
      <h2 class="text-sm font-bold">OpenAI · viết kịch bản series</h2>
      <p class="mt-1 text-[12px] leading-relaxed text-ink-muted">
        Dùng thay cho Gemini ở khâu viết kịch bản. Chọn bên nào là khai
        <code>series.provider</code> trong <code>topics/&lt;kênh&gt;.json</code>:
        <code>"gemini"</code> hoặc <code>"openai"</code>. Mỗi kênh chọn riêng được.
        Lấy khoá ở
        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener"
           class="text-ink-2 underline decoration-dotted">platform.openai.com</a>.
      </p>

      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="label">Khoá API</label>
          <input v-model="form['openai.api_key']" type="password" class="input font-mono !text-xs"
                 placeholder="sk-…" autocomplete="off" />
          <p class="text-[11px] leading-relaxed text-ink-muted">
            Chỉ cần khi có kênh đặt <code>provider</code> là <code>openai</code>.
          </p>
        </div>
        <div class="space-y-1.5">
          <label class="label">Model</label>
          <select v-model="form['openai.model']" class="input font-mono !text-xs">
            <option value="">— mặc định (gpt-4o-mini) —</option>
            <option v-for="m in tuyChon('openai')" :key="m" :value="m">{{ m }}</option>
          </select>
          <p class="text-[11px] leading-relaxed text-ink-muted">
            Bỏ trống thì dùng model khai trong <code>topics/&lt;kênh&gt;.json</code>.
            <template v-if="nguon.openai === 'api'">{{ models.openai.length }} model lấy từ API.</template>
            <template v-else-if="nguon.openai">Chưa có khoá — lưu khoá rồi tải lại trang để thấy danh sách thật.</template>
          </p>
        </div>
      </div>
    </section>

    <!-- Cloudflare R2: nơi chứa video sau khi dựng -->
    <section v-show="tab === 'luutru'" class="card p-5">
      <h2 class="text-sm font-bold">Cloudflare R2 · lưu video</h2>
      <p class="mt-1 text-[12px] leading-relaxed text-ink-muted">
        Video dựng xong được tải lên đây để phát trực tiếp mà không chiếm ổ đĩa máy chủ.
        Bỏ trống thì dây chuyền bỏ qua bước tải lên, video vẫn nằm trong
        <code class="font-mono">output/</code> như cũ.
        Lấy khoá ở
        <a href="https://dash.cloudflare.com/?to=/:account/r2/api-tokens" target="_blank"
           rel="noopener" class="text-ink-2 underline decoration-dotted">R2 API Tokens</a>.
      </p>

      <label class="mt-4 flex cursor-pointer items-center gap-2 text-[13px]">
        <input v-model="form['r2.enabled']" type="checkbox" class="accent-[#FF2D55]" />
        Bật tải video lên R2
      </label>

      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <label class="label">Bucket</label>
          <input v-model="form['r2.bucket']" class="input font-mono !text-xs" placeholder="tiktok360s" />
        </div>
        <div class="space-y-1.5">
          <label class="label">Thư mục trong bucket</label>
          <input v-model="form['r2.prefix']" class="input font-mono !text-xs" placeholder="videos" />
        </div>
        <div class="space-y-1.5 sm:col-span-2">
          <label class="label">Endpoint</label>
          <input v-model="form['r2.endpoint']" class="input font-mono !text-xs"
                 placeholder="https://&lt;account-id&gt;.r2.cloudflarestorage.com" />
        </div>
        <div class="space-y-1.5 sm:col-span-2">
          <label class="label">Tên miền công khai</label>
          <input v-model="form['r2.public_url']" class="input font-mono !text-xs"
                 placeholder="https://cdn.tenmien.vn  (hoặc https://pub-xxx.r2.dev)" />
          <p class="text-[11px] leading-relaxed text-ink-muted">
            Bỏ trống thì liên kết trả về trỏ thẳng vào endpoint và
            <strong class="text-ink-2">chỉ mở được khi có chữ ký</strong> — TikTok sẽ không tải được.
          </p>
        </div>
        <div class="space-y-1.5">
          <label class="label">Access Key ID</label>
          <input v-model="form['r2.access_key_id']" type="password" class="input font-mono !text-xs"
                 autocomplete="off" />
        </div>
        <div class="space-y-1.5">
          <label class="label">Secret Access Key</label>
          <input v-model="form['r2.secret_access_key']" type="password" class="input font-mono !text-xs"
                 autocomplete="off" />
        </div>
      </div>
    </section>

    <div class="flex justify-end gap-2">
      <button class="btn" @click="load">Hoàn tác</button>
      <button class="btn btn-primary" :disabled="busy" @click="save">
        {{ busy ? 'Đang lưu…' : 'Lưu cấu hình' }}
      </button>
    </div>

    <Toast :message="toast.message" :tone="toast.tone" @close="toast.message = ''" />
  </div>
</template>
