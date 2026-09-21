<script setup>
import { computed, inject, ref, watch } from 'vue'
import http, { errorMessage } from '../api'
import StatusPill from '../components/StatusPill.vue'
import Toast from '../components/Toast.vue'

const user = inject('user')
const busy = ref(false)
const toast = ref({ message: '', tone: 'good' })

// Thông tin tài khoản
const form = ref({ name: '', email: '', avatar_url: '', current_password: '' })
const pw = ref({ current_password: '', password: '', password_confirmation: '' })
const savingProfile = ref(false)
const savingPw = ref(false)

watch(user, (u) => {
  if (u) form.value = { name: u.name, email: u.email, avatar_url: u.avatar_url || '', current_password: '' }
}, { immediate: true })

const emailChanged = computed(() => user.value && form.value.email !== user.value.email)

async function saveProfile() {
  savingProfile.value = true
  try {
    user.value = (await http.put('profile', form.value)).data
    form.value.current_password = ''
    toast.value = { message: 'Đã lưu thông tin', tone: 'good' }
  } catch (e) {
    toast.value = { message: errorMessage(e), tone: 'critical' }
  } finally {
    savingProfile.value = false
  }
}

async function savePassword() {
  savingPw.value = true
  try {
    await http.post('profile/password', pw.value)
    pw.value = { current_password: '', password: '', password_confirmation: '' }
    toast.value = { message: 'Đã đổi mật khẩu', tone: 'good' }
  } catch (e) {
    toast.value = { message: errorMessage(e), tone: 'critical' }
  } finally {
    savingPw.value = false
  }
}

async function unlinkGoogle() {
  if (!confirm('Gỡ liên kết Google? Sau đó chỉ đăng nhập được bằng mật khẩu.')) return
  try {
    user.value = (await http.post('profile/unlink-google')).data
    toast.value = { message: 'Đã gỡ liên kết Google', tone: 'good' }
  } catch (e) {
    toast.value = { message: errorMessage(e), tone: 'critical' }
  }
}

const enroll = ref(null)     // { secret, qr_svg, recovery_codes }
const code = ref('')
const password = ref('')
const codesShown = ref(null)

async function start() {
  busy.value = true
  try {
    enroll.value = (await http.post('two-factor/enroll')).data
    code.value = ''
  } catch (e) {
    toast.value = { message: errorMessage(e), tone: 'critical' }
  } finally {
    busy.value = false
  }
}

async function confirm() {
  busy.value = true
  try {
    const res = (await http.post('two-factor/confirm', { code: code.value })).data
    codesShown.value = res.recovery_codes
    enroll.value = null
    user.value = (await http.get('me')).data
    toast.value = { message: 'Đã bật xác thực hai lớp', tone: 'good' }
  } catch (e) {
    toast.value = { message: errorMessage(e), tone: 'critical' }
  } finally {
    busy.value = false
  }
}

async function disable() {
  busy.value = true
  try {
    await http.post('two-factor/disable', { password: password.value })
    password.value = ''
    codesShown.value = null
    user.value = (await http.get('me')).data
    toast.value = { message: 'Đã tắt xác thực hai lớp', tone: 'good' }
  } catch (e) {
    toast.value = { message: errorMessage(e), tone: 'critical' }
  } finally {
    busy.value = false
  }
}

async function regenerate() {
  busy.value = true
  try {
    codesShown.value = (await http.post('two-factor/recovery-codes')).data.recovery_codes
    toast.value = { message: 'Đã tạo mã dự phòng mới — mã cũ hết hiệu lực', tone: 'good' }
  } finally {
    busy.value = false
  }
}

async function copyCodes() {
  await navigator.clipboard.writeText(codesShown.value.join('\n'))
  toast.value = { message: 'Đã sao chép mã dự phòng', tone: 'good' }
}
</script>

<template>
  <div class="max-w-2xl space-y-4">
    <!-- Thông tin tài khoản -->
    <section class="card p-5">
      <div class="mb-5 flex items-center gap-3.5">
        <img v-if="form.avatar_url" :src="form.avatar_url" alt=""
             class="size-12 rounded-full object-cover" @error="form.avatar_url = ''" />
        <span v-else class="grid size-12 place-items-center rounded-full bg-surface-3 text-base font-bold">
          {{ (form.name || 'A').slice(0, 1).toUpperCase() }}
        </span>
        <div class="min-w-0">
          <h2 class="text-sm font-bold">Thông tin tài khoản</h2>
          <p class="text-xs text-ink-muted">
            {{ user?.google_id ? 'Đã liên kết Google' : 'Đăng nhập bằng mật khẩu' }}
          </p>
        </div>
        <button v-if="user?.google_id" class="btn btn-ghost ml-auto !py-1.5 !text-xs text-ink-muted"
                @click="unlinkGoogle">Gỡ liên kết Google</button>
      </div>

      <form class="space-y-4" @submit.prevent="saveProfile">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <label class="label" for="pname">Tên hiển thị</label>
            <input id="pname" v-model="form.name" class="input" required maxlength="120" />
          </div>
          <div class="space-y-1.5">
            <label class="label" for="pemail">Email</label>
            <input id="pemail" v-model="form.email" type="email" class="input" required />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="label" for="pavatar">Ảnh đại diện (đường dẫn)</label>
          <input id="pavatar" v-model="form.avatar_url" class="input font-mono !text-xs"
                 placeholder="https://…" />
        </div>

        <!-- Đổi email là đổi định danh đăng nhập nên phải xác nhận mật khẩu -->
        <div v-if="emailChanged && user?.password !== null" class="space-y-1.5">
          <label class="label" for="pcur">Mật khẩu hiện tại (bắt buộc khi đổi email)</label>
          <input id="pcur" v-model="form.current_password" type="password" class="input !w-64" />
        </div>

        <div class="flex justify-end">
          <button class="btn btn-primary" :disabled="savingProfile">
            {{ savingProfile ? 'Đang lưu…' : 'Lưu thông tin' }}
          </button>
        </div>
      </form>
    </section>

    <!-- Mật khẩu -->
    <section class="card p-5">
      <h2 class="text-sm font-bold">Đổi mật khẩu</h2>
      <p class="mt-1 text-xs text-ink-muted">
        Ít nhất 8 ký tự. Đổi xong, các phiên đăng nhập khác sẽ bị đẩy ra.
      </p>

      <form class="mt-4 space-y-4" @submit.prevent="savePassword">
        <div class="grid gap-4 sm:grid-cols-3">
          <div class="space-y-1.5">
            <label class="label" for="pw0">Mật khẩu hiện tại</label>
            <input id="pw0" v-model="pw.current_password" type="password" class="input"
                   autocomplete="current-password" />
          </div>
          <div class="space-y-1.5">
            <label class="label" for="pw1">Mật khẩu mới</label>
            <input id="pw1" v-model="pw.password" type="password" class="input" minlength="8"
                   autocomplete="new-password" required />
          </div>
          <div class="space-y-1.5">
            <label class="label" for="pw2">Nhập lại</label>
            <input id="pw2" v-model="pw.password_confirmation" type="password" class="input"
                   autocomplete="new-password" required />
          </div>
        </div>

        <div class="flex justify-end">
          <button class="btn" :disabled="savingPw || !pw.password">
            {{ savingPw ? 'Đang đổi…' : 'Đổi mật khẩu' }}
          </button>
        </div>
      </form>
    </section>

    <section class="card p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-sm font-bold">Xác thực hai lớp</h2>
          <p class="mt-1 max-w-md text-xs leading-relaxed text-ink-muted">
            Mỗi lần đăng nhập sẽ cần thêm mã 6 số từ ứng dụng xác thực. CMS này giữ token TikTok
            của các kênh, nên bật hai lớp là đáng.
          </p>
        </div>
        <StatusPill :label="user?.two_factor_enabled ? 'Đang bật' : 'Chưa bật'"
                    :tone="user?.two_factor_enabled ? 'good' : 'warning'" />
      </div>

      <!-- Chưa bật, chưa bắt đầu -->
      <button v-if="!user?.two_factor_enabled && !enroll" class="btn btn-primary mt-4"
              :disabled="busy" @click="start">
        Bật xác thực hai lớp
      </button>

      <!-- Đang ghi danh: quét QR rồi nhập mã -->
      <div v-if="enroll" class="mt-5 grid gap-5 sm:grid-cols-[208px_1fr]">
        <div class="rounded-xl bg-white p-3" v-html="enroll.qr_svg"></div>

        <div class="space-y-4">
          <div>
            <p class="text-[13px] font-semibold">1. Quét mã bằng ứng dụng xác thực</p>
            <p class="mt-1 text-[11px] leading-relaxed text-ink-muted">
              Google Authenticator, Authy, 1Password… Không quét được thì nhập tay khoá này:
            </p>
            <code class="mt-1.5 block break-all rounded-lg bg-surface-2 px-2.5 py-2 font-mono text-[11px]">
              {{ enroll.secret }}
            </code>
          </div>

          <div class="space-y-1.5">
            <label class="label">2. Nhập mã 6 số để xác nhận</label>
            <input v-model="code" inputmode="numeric" maxlength="6"
                   class="input tnum !w-40 !text-center !text-lg !tracking-[0.25em]" placeholder="000000" />
          </div>

          <div class="flex gap-2">
            <button class="btn btn-primary" :disabled="busy || code.length < 6" @click="confirm">
              Xác nhận và bật
            </button>
            <button class="btn" @click="enroll = null">Huỷ</button>
          </div>
        </div>
      </div>

      <!-- Đã bật -->
      <div v-if="user?.two_factor_enabled" class="mt-5 space-y-4">
        <div class="flex flex-wrap gap-2">
          <button class="btn" :disabled="busy" @click="regenerate">Tạo lại mã dự phòng</button>
        </div>

        <div class="space-y-1.5 border-t border-line pt-4">
          <label class="label">Tắt xác thực hai lớp</label>
          <div class="flex flex-wrap gap-2">
            <input v-model="password" type="password" class="input !w-56" placeholder="Nhập mật khẩu" />
            <button class="btn" :disabled="busy || !password" @click="disable">Tắt</button>
          </div>
        </div>
      </div>

      <!-- Mã dự phòng -->
      <div v-if="codesShown" class="mt-5 rounded-xl border p-4"
           style="border-color: rgba(250,178,25,.35); background: rgba(250,178,25,.07)">
        <p class="text-[13px] font-semibold" style="color:#f8cf72">Lưu các mã dự phòng này ngay</p>
        <p class="mt-1 text-[11px] leading-relaxed text-ink-2">
          Mỗi mã dùng được một lần, thay cho mã 6 số khi bạn mất điện thoại.
          Đóng trang này là không xem lại được nữa.
        </p>
        <div class="mt-3 grid grid-cols-2 gap-1.5 font-mono text-[12px] sm:grid-cols-4">
          <code v-for="c in codesShown" :key="c" class="rounded bg-black/30 px-2 py-1.5 text-center">{{ c }}</code>
        </div>
        <div class="mt-3 flex gap-2">
          <button class="btn !py-1.5 !text-xs" @click="copyCodes">Sao chép</button>
          <button class="btn btn-ghost !py-1.5 !text-xs text-ink-muted" @click="codesShown = null">
            Tôi đã lưu
          </button>
        </div>
      </div>
    </section>

    <Toast :message="toast.message" :tone="toast.tone" @close="toast.message = ''" />
  </div>
</template>
