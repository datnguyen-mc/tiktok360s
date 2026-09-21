<script setup>
import { computed, ref, watch } from 'vue'
import { Head, router, useForm, usePage } from '@inertiajs/vue3'
import AdminLayout from '../../Layouts/AdminLayout.vue'
import PageHeader from '../../Components/Admin/PageHeader.vue'
import EmptyState from '../../Components/Admin/EmptyState.vue'
import Avatar from '../../Components/Avatar.vue'
import Switch from '../../Components/Admin/Switch.vue'
import IconButton from '../../Components/Admin/IconButton.vue'
import Icon from '../../Components/Admin/Icon.vue'
import Pagination from '../../Components/Pagination.vue'
import { fmtAgo, fmtDate, fmtNumber } from '../../format'

const props = defineProps({
  users: { type: Object, required: true },
  filters: { type: Object, default: () => ({}) },
  roles: { type: Array, default: () => [] },
  stats: { type: Object, default: () => ({}) },
})

const me = computed(() => usePage().props.auth.user)
const canManage = computed(() => !!me.value?.can?.['users.manage'])

const q = ref(props.filters.q || '')
const role = ref(props.filters.role || '')
const verified = ref(props.filters.verified || '')

let timer
watch([q, role, verified], () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    router.get('/admin/users', {
      q: q.value || undefined,
      role: role.value || undefined,
      verified: verified.value || undefined,
    }, { preserveState: true, replace: true })
  }, 300)
})

// ── Sửa hồ sơ ────────────────────────────────────────────────────────────
const editing = ref(null)
const form = useForm({ name: '', email: '', username: '', bio: '', role: '', verified: false })

function open(u) {
  editing.value = u
  form.defaults({
    name: u.name || '', email: u.email || '', username: u.username || '',
    bio: u.bio || '', role: u.role, verified: !!u.email_verified_at,
  })
  form.reset()
  form.clearErrors()
}

const save = () => form.put(`/admin/users/${editing.value.id}`, {
  preserveScroll: true, onSuccess: () => (editing.value = null),
})

const toggleVerify = (u) =>
  router.patch(`/admin/users/${u.id}/verify`, {}, { preserveScroll: true })

const roleOf = (r) => props.roles.find((x) => x.value === r)

function setRole(user, value) {
  if (value === user.role) return
  router.put(`/admin/users/${user.id}`, { role: value }, { preserveScroll: true })
}

function remove(user) {
  if (!confirm(`Xoá "${user.name}"? Bình luận của họ cũng mất theo.`)) return
  router.delete(`/admin/users/${user.id}`, { preserveScroll: true })
}
</script>

<template>
  <Head title="Người dùng · Quản trị" />

  <AdminLayout>
    <PageHeader title="Người dùng"
                :subtitle="canManage
                  ? 'Đổi quyền hoặc xoá tài khoản. Luôn phải còn ít nhất một tài khoản toàn quyền.'
                  : 'Bạn chỉ có quyền xem danh sách này.'" />

    <!-- Bảng quyền: ai làm được gì, nói rõ ra thay vì để người dùng đoán -->
    <div class="adm-card mb-4 flex flex-wrap gap-x-6 gap-y-2 p-3.5">
      <div v-for="r in roles" :key="r.value" class="min-w-[150px]">
        <p class="flex items-center gap-1.5 text-[12.5px] font-bold" :style="{ color: r.color }">
          <span class="size-2 rounded-full" :style="{ background: r.color }"></span>
          {{ r.label }}
        </p>
        <p class="mt-0.5 text-[11.5px] leading-snug text-ink-muted">
          {{ r.abilities.length ? `${r.abilities.length} quyền` : 'Không vào khu quản trị' }}
        </p>
      </div>
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-2.5">
      <div class="relative min-w-[220px] flex-1 sm:max-w-xs">
        <Icon name="search"
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input v-model="q" class="input !pl-9" placeholder="Tìm theo tên hoặc email…" />
      </div>

      <div class="flex flex-wrap gap-1">
        <button :class="['adm-seg', role === '' && 'adm-seg-on']" @click="role = ''">Tất cả</button>
        <button v-for="r in roles" :key="r.value"
                :class="['adm-seg', role === r.value && 'adm-seg-on']" @click="role = r.value">
          {{ r.label }}
        </button>
      </div>

      <div class="flex gap-1">
        <button v-for="v in [['', 'Mọi trạng thái'], ['yes', 'Đã xác minh'], ['no', 'Chưa xác minh']]"
                :key="v[0]" :class="['adm-seg', verified === v[0] && 'adm-seg-on']"
                @click="verified = v[0]">{{ v[1] }}</button>
      </div>

      <span class="ml-auto text-[13px] text-ink-muted tabular-nums">
        {{ fmtNumber(stats.verified) }}/{{ fmtNumber(stats.total) }} đã xác minh
      </span>
    </div>

    <div class="adm-card overflow-hidden">
      <div v-if="users.data.length" class="max-h-[calc(100dvh-340px)] overflow-auto">
        <table class="adm-table min-w-[800px]">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th class="w-[220px]">Hoạt động</th>
              <th class="w-[150px]">Tham gia</th>
              <th class="w-[130px]">Quyền</th>
              <th class="w-[110px]">Xác minh</th>
              <th class="w-[76px]"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users.data" :key="u.id">
              <td>
                <div class="flex items-center gap-3">
                  <Avatar :user="u" size="size-9 text-[13px]" />
                  <div class="min-w-0">
                    <p class="flex items-center gap-1.5 truncate text-[13.5px] font-bold">
                      {{ u.name }}
                      <span v-if="u.id === me.id"
                            class="adm-chip" style="background: var(--color-surface-2)">bạn</span>
                    </p>
                    <p class="flex items-center gap-1 truncate text-[12px] text-ink-muted">
                      {{ u.email }}
                      <svg v-if="u.email_verified_at" viewBox="0 0 24 24" fill="currentColor"
                           class="size-3.5 shrink-0 text-cyan" title="Email đã xác minh">
                        <path d="M12 2 9.6 4.4 6.3 3.9 5.1 7 2 8.2l.5 3.3L0 14l2.5 2.5L2 19.8l3.1 1.2 1.2 3.1 3.3-.5L12 26l2.4-2.4 3.3.5 1.2-3.1 3.1-1.2-.5-3.3L24 14l-2.5-2.5.5-3.3-3.1-1.2-1.2-3.1-3.3.5z"
                              transform="scale(.92) translate(1 -1)" opacity=".18" />
                        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.4-4.2-4.2 1.7-1.7 2.5 2.5 5.1-5.1 1.7 1.7z" />
                      </svg>
                    </p>
                    <p v-if="u.username" class="truncate text-[11.5px] text-ink-muted">@{{ u.username }}</p>
                  </div>
                </div>
              </td>

              <td class="text-[12.5px] text-ink-2 tabular-nums">
                {{ u.comments_count }} bình luận · {{ u.likes_count }} thích · {{ u.bookmarks_count }} lưu
              </td>

              <td class="text-[12.5px] text-ink-muted">
                {{ fmtDate(u.created_at) }}
                <span v-if="u.last_seen_at" class="block text-[11px]">
                  Vào lần cuối {{ fmtAgo(u.last_seen_at) }}
                </span>
              </td>

              <td>
                <select v-if="canManage" class="input !w-auto !py-1 !text-[12.5px] font-semibold"
                        :style="{ color: roleOf(u.role)?.color }"
                        :value="u.role" @change="setRole(u, $event.target.value)">
                  <option v-for="r in roles" :key="r.value" :value="r.value">{{ r.label }}</option>
                </select>
                <span v-else class="adm-chip"
                      :style="{ background: roleOf(u.role)?.color + '1f', color: roleOf(u.role)?.color }">
                  {{ roleOf(u.role)?.label }}
                </span>
              </td>

              <td>
                <Switch v-if="canManage" :model-value="!!u.email_verified_at"
                        @update:model-value="toggleVerify(u)" />
                <span v-else class="adm-chip"
                      :style="u.email_verified_at
                        ? { background: 'color-mix(in srgb, var(--color-cyan) 14%, transparent)', color: 'var(--color-cyan)' }
                        : { background: 'var(--color-surface-2)', color: 'var(--color-ink-muted)' }">
                  {{ u.email_verified_at ? 'Đã xác minh' : 'Chưa' }}
                </span>
              </td>

              <td>
                <span v-if="canManage" class="rowacts">
                  <IconButton icon="edit" label="Sửa hồ sơ" @click="open(u)" />
                  <IconButton v-if="u.id !== me.id" icon="trash" label="Xoá tài khoản"
                              tone="danger" @click="remove(u)" />
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState v-else title="Không có người dùng nào khớp"
                  hint="Thử bỏ bớt bộ lọc hoặc xoá từ khoá tìm kiếm."
                  icon="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0" />
    </div>

    <Pagination :page="users" unit="người dùng" class="mt-4" />

    <!-- Ngăn sửa hồ sơ -->
    <div v-if="editing" class="fixed inset-0 z-50 flex justify-end bg-black/40"
         @click.self="editing = null">
      <div class="flex h-full w-full max-w-[480px] flex-col bg-page shadow-2xl">
        <header class="flex h-14 shrink-0 items-center gap-3 border-b border-line px-5">
          <h2 class="truncate text-[15px] font-extrabold tracking-tight">
            Sửa “{{ editing.name }}”
          </h2>
          <button class="btn !ml-auto !border-transparent !px-2" aria-label="Đóng"
                  @click="editing = null">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-5">
              <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
            </svg>
          </button>
        </header>

        <form class="flex-1 space-y-4 overflow-y-auto p-5" @submit.prevent="save">
          <div class="space-y-1.5">
            <label class="label" for="un">Tên hiển thị</label>
            <input id="un" v-model="form.name" class="input" required maxlength="60" />
            <p v-if="form.errors.name" class="text-[12px] text-accent-ink">{{ form.errors.name }}</p>
          </div>

          <div class="space-y-1.5">
            <label class="label" for="ue">Email</label>
            <input id="ue" v-model="form.email" type="email" class="input" required />
            <p v-if="form.errors.email" class="text-[12px] text-accent-ink">{{ form.errors.email }}</p>
            <p v-else-if="form.email !== editing.email"
               class="text-[11.5px] font-semibold text-accent-ink">
              Đổi email sẽ gỡ trạng thái đã xác minh — địa chỉ mới chưa ai chứng minh là có thật.
            </p>
          </div>

          <div class="space-y-1.5">
            <label class="label" for="uu">Tên đăng nhập</label>
            <div class="flex items-center gap-1.5">
              <span class="text-[13px] text-ink-muted">@</span>
              <input id="uu" v-model="form.username" class="input" maxlength="40"
                     placeholder="không bắt buộc" />
            </div>
            <p v-if="form.errors.username" class="text-[12px] text-accent-ink">{{ form.errors.username }}</p>
          </div>

          <div class="space-y-1.5">
            <label class="label" for="ub">Giới thiệu</label>
            <textarea id="ub" v-model="form.bio" rows="3" maxlength="300"
                      class="input resize-y !py-2"></textarea>
          </div>

          <div class="space-y-1.5">
            <label class="label" for="ur">Vai trò</label>
            <select id="ur" v-model="form.role" class="input font-semibold">
              <option v-for="r in roles" :key="r.value" :value="r.value">{{ r.label }}</option>
            </select>
            <p v-if="form.errors.role" class="text-[12px] text-accent-ink">{{ form.errors.role }}</p>
          </div>

          <div class="rounded-xl border border-line bg-surface p-3.5">
            <Switch v-model="form.verified" label="Email đã xác minh" />
            <p class="mt-1.5 text-[11.5px] leading-relaxed text-ink-muted">
              Xác minh thủ công dùng khi bạn đã liên hệ được với người này bằng cách khác.
            </p>
          </div>
        </form>

        <footer class="flex shrink-0 items-center justify-end gap-2 border-t border-line px-5 py-3">
          <button class="btn" @click="editing = null">Huỷ</button>
          <button class="btn btn-primary" :disabled="form.processing" @click="save">
            {{ form.processing ? 'Đang lưu…' : 'Lưu' }}
          </button>
        </footer>
      </div>
    </div>
  </AdminLayout>
</template>
