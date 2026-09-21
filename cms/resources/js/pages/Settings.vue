<script setup>
import { onMounted, ref } from 'vue'
import http, { errorMessage } from '../api'
import Toast from '../components/Toast.vue'

const data = ref(null)
const form = ref({})
const busy = ref(false)
const toast = ref({ message: '', tone: 'good' })

async function load() {
  data.value = (await http.get('settings')).data
  form.value = { ...data.value.values }
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
    <!-- TikTok -->
    <section class="card p-5">
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
    <section class="card p-5">
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

    <div class="flex justify-end gap-2">
      <button class="btn" @click="load">Hoàn tác</button>
      <button class="btn btn-primary" :disabled="busy" @click="save">
        {{ busy ? 'Đang lưu…' : 'Lưu cấu hình' }}
      </button>
    </div>

    <Toast :message="toast.message" :tone="toast.tone" @close="toast.message = ''" />
  </div>
</template>
