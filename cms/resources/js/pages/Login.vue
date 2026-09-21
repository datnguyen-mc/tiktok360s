<script setup>
import { inject, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http, { errorMessage } from '../api'

const route = useRoute()
const router = useRouter()
const user = inject('user')

const step = ref('password')      // password | two_factor
const email = ref('')
const password = ref('')
const code = ref('')
const error = ref('')
const busy = ref(false)
const googleEnabled = ref(false)

onMounted(async () => {
  // Google quay về bằng chuyển hướng nên kết quả nằm ở query string.
  if (route.query.error) error.value = String(route.query.error)
  if (route.query.two_factor) step.value = 'two_factor'

  try {
    const s = (await http.get('auth/status')).data
    googleEnabled.value = s.google_enabled
    if (s.pending_two_factor) step.value = 'two_factor'
  } catch { /* chưa cấu hình cũng không sao */ }
})

async function submitPassword() {
  busy.value = true; error.value = ''
  try {
    const res = (await http.post('login', { email: email.value, password: password.value })).data
    if (res.two_factor) {
      step.value = 'two_factor'
      return
    }
    user.value = res
    router.push({ name: 'dashboard' })
  } catch (e) {
    error.value = errorMessage(e, 'Đăng nhập thất bại')
  } finally {
    busy.value = false
  }
}

async function submitCode() {
  busy.value = true; error.value = ''
  try {
    user.value = (await http.post('login/two-factor', { code: code.value })).data
    router.push({ name: 'dashboard' })
  } catch (e) {
    error.value = errorMessage(e, 'Mã không đúng')
  } finally {
    busy.value = false
  }
}

function restart() {
  step.value = 'password'
  code.value = ''
  error.value = ''
}
</script>

<template>
  <div class="grid h-full place-items-center p-6">
    <div class="w-full max-w-[382px]">
      <div class="mb-7 flex items-center gap-3">
        <img src="/brand/logo.svg" alt="" class="size-11 shrink-0 rounded-xl" />
        <span>
          <span class="block text-lg font-bold leading-tight tracking-tight">TikTok360s</span>
          <span class="block text-xs text-ink-muted">Dây chuyền video TikTok</span>
        </span>
      </div>

      <!-- Bước 1: mật khẩu hoặc Google -->
      <form v-if="step === 'password'" class="card space-y-4 p-6" @submit.prevent="submitPassword">
        <div class="space-y-1.5">
          <label class="label" for="email">Email</label>
          <input id="email" v-model="email" type="email" required autocomplete="username"
                 class="input" placeholder="admin@showbiz.local" />
        </div>

        <div class="space-y-1.5">
          <label class="label" for="pw">Mật khẩu</label>
          <input id="pw" v-model="password" type="password" required autocomplete="current-password"
                 class="input" placeholder="••••••••" />
        </div>

        <p v-if="error" class="rounded-lg px-3 py-2 text-xs leading-relaxed"
           style="background: rgba(208,59,59,.14); color: #f08d8d">{{ error }}</p>

        <button class="btn btn-primary w-full justify-center" :disabled="busy">
          <span v-if="busy" class="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
          {{ busy ? 'Đang vào…' : 'Đăng nhập' }}
        </button>

        <template v-if="googleEnabled">
          <div class="flex items-center gap-3 text-[11px] text-ink-muted">
            <span class="h-px flex-1 bg-line"></span>hoặc<span class="h-px flex-1 bg-line"></span>
          </div>

          <a href="/auth/google/redirect" class="btn w-full justify-center">
            <svg viewBox="0 0 24 24" class="size-4">
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"/>
              <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8h-4v3.1A12 12 0 0 0 12 24z"/>
              <path fill="#FBBC05" d="M5.3 14.3a7.1 7.1 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z"/>
              <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8z"/>
            </svg>
            Đăng nhập bằng Google
          </a>
        </template>
      </form>

      <!-- Bước 2: mã OTP -->
      <form v-else class="card space-y-4 p-6" @submit.prevent="submitCode">
        <div>
          <h2 class="text-sm font-bold">Nhập mã xác thực</h2>
          <p class="mt-1 text-xs leading-relaxed text-ink-muted">
            Mở ứng dụng xác thực (Google Authenticator, Authy…) và nhập mã 6 số.
            Mất điện thoại thì dùng một mã dự phòng.
          </p>
        </div>

        <div class="space-y-1.5">
          <label class="label" for="code">Mã</label>
          <input id="code" v-model="code" required autocomplete="one-time-code" inputmode="numeric"
                 class="input tnum !text-center !text-lg !tracking-[0.3em]" placeholder="000000" autofocus />
        </div>

        <p v-if="error" class="rounded-lg px-3 py-2 text-xs leading-relaxed"
           style="background: rgba(208,59,59,.14); color: #f08d8d">{{ error }}</p>

        <button class="btn btn-primary w-full justify-center" :disabled="busy">
          {{ busy ? 'Đang kiểm tra…' : 'Xác nhận' }}
        </button>
        <button type="button" class="btn btn-ghost w-full justify-center !text-xs text-ink-muted"
                @click="restart">
          ← Quay lại
        </button>
      </form>

      <p class="mt-4 text-center text-[11px] leading-relaxed text-ink-muted">
        Tài khoản mặc định tạo bằng <code class="text-ink-2">php artisan db:seed</code>
      </p>
    </div>
  </div>
</template>
