<script setup>
import { computed, ref } from 'vue'
import { Head, router, useForm } from '@inertiajs/vue3'
import AdminLayout from '../../Layouts/AdminLayout.vue'
import PageHeader from '../../Components/Admin/PageHeader.vue'
import Switch from '../../Components/Admin/Switch.vue'
import IconButton from '../../Components/Admin/IconButton.vue'
import Icon from '../../Components/Admin/Icon.vue'
import { fmtNumber } from '../../format'

const props = defineProps({
  roles: { type: Array, default: () => [] },
  groups: { type: Object, default: () => ({}) },   // { 'Nội dung': { 'articles.view': 'Xem…' } }
  super: { type: String, default: 'admin' },
})

const editing = ref(null)

const form = useForm({
  slug: '', name: '', color: '#0A9CB0', sort: 50, abilities: [],
})

const allAbilities = computed(() =>
  Object.values(props.groups).flatMap((g) => Object.keys(g))
)

function open(r) {
  editing.value = r || {}
  form.defaults({
    slug: r?.slug || '', name: r?.name || '', color: r?.color || '#0A9CB0',
    sort: r?.sort ?? 50, abilities: [...(r?.abilities || [])],
  })
  form.reset()
  form.clearErrors()
}

function toggle(a) {
  form.abilities = form.abilities.includes(a)
    ? form.abilities.filter((x) => x !== a)
    : [...form.abilities, a]
}

function toggleGroup(keys) {
  const allOn = keys.every((k) => form.abilities.includes(k))
  form.abilities = allOn
    ? form.abilities.filter((k) => !keys.includes(k))
    : [...new Set([...form.abilities, ...keys])]
}

function save() {
  const done = { preserveScroll: true, onSuccess: () => (editing.value = null) }
  editing.value?.slug
    ? form.put(`/admin/roles/${editing.value.slug}`, done)
    : form.post('/admin/roles', done)
}

function remove(r) {
  if (!confirm(`Xoá vai trò “${r.name}”?`)) return
  router.delete(`/admin/roles/${r.slug}`, { preserveScroll: true })
}

const isSuper = computed(() => editing.value?.slug === props.super)
</script>

<template>
  <Head title="Vai trò · Quản trị" />

  <AdminLayout>
    <PageHeader title="Vai trò và phân quyền"
                subtitle="Quyền gắn với việc, vai trò chỉ là một gói việc.">
      <template #actions>
        <button class="btn btn-primary" @click="open(null)">
          <Icon name="plus" /> Thêm vai trò
        </button>
      </template>
    </PageHeader>

    <!-- Ma trận: nhìn một cái là biết ai làm được gì -->
    <div class="adm-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="adm-table min-w-[720px]">
          <thead>
            <tr>
              <th class="min-w-[200px]">Quyền</th>
              <th v-for="r in roles" :key="r.slug" class="w-[110px] text-center">
                <span class="flex flex-col items-center gap-0.5">
                  <span :style="{ color: r.color }">{{ r.name }}</span>
                  <span class="font-normal normal-case tracking-normal text-ink-muted">
                    {{ fmtNumber(r.users) }} người
                  </span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(abilities, group) in groups" :key="group">
              <tr>
                <td :colspan="roles.length + 1"
                    class="!bg-surface !py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  {{ group }}
                </td>
              </tr>
              <tr v-for="(label, key) in abilities" :key="key">
                <td>
                  <p class="text-[13px] font-semibold">{{ label }}</p>
                  <p class="font-mono text-[11px] text-ink-muted">{{ key }}</p>
                </td>
                <td v-for="r in roles" :key="r.slug" class="text-center">
                  <svg v-if="r.abilities.includes(key)" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="2.6" class="mx-auto size-4"
                       :style="{ color: r.color }">
                    <path d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                  <span v-else class="text-ink-muted/30">—</span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Thẻ từng vai trò -->
    <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article v-for="r in roles" :key="r.slug" class="adm-card p-4">
        <div class="flex items-start gap-2.5">
          <span class="mt-1 h-7 w-1.5 shrink-0 rounded-full" :style="{ background: r.color }"></span>
          <div class="min-w-0 flex-1">
            <h2 class="flex items-center gap-1.5 truncate font-bold">
              {{ r.name }}
              <span v-if="r.is_system" class="adm-chip"
                    style="background: var(--color-surface-2)">hệ thống</span>
            </h2>
            <p class="truncate font-mono text-[11.5px] text-ink-muted">{{ r.slug }}</p>
          </div>
        </div>

        <p class="mt-3 text-[12.5px] text-ink-2 tabular-nums">
          {{ r.abilities.length }} quyền · {{ fmtNumber(r.users) }} tài khoản
        </p>

        <div class="mt-3 flex gap-1.5">
          <button class="btn flex-1 !py-1.5 !text-[13px]" @click="open(r)">
            <Icon name="edit" size="size-3.5" /> Sửa
          </button>
          <button v-if="!r.is_system" class="btn btn-danger !py-1.5 !text-[13px]"
                  @click="remove(r)">
            <Icon name="trash" size="size-3.5" />
          </button>
        </div>
      </article>
    </div>

    <!-- Ngăn sửa -->
    <div v-if="editing" class="fixed inset-0 z-50 flex justify-end bg-black/40"
         @click.self="editing = null">
      <div class="flex h-full w-full max-w-[560px] flex-col bg-page shadow-2xl">
        <header class="flex h-14 shrink-0 items-center gap-3 border-b border-line px-5">
          <h2 class="text-[15px] font-extrabold tracking-tight">
            {{ editing.slug ? `Sửa vai trò “${editing.name}”` : 'Vai trò mới' }}
          </h2>
          <button class="btn !ml-auto !border-transparent !px-2" aria-label="Đóng" @click="editing = null">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-5">
              <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" />
            </svg>
          </button>
        </header>

        <form class="flex-1 space-y-4 overflow-y-auto p-5" @submit.prevent="save">
          <div class="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <div class="space-y-1.5">
              <label class="label" for="n">Tên hiển thị</label>
              <input id="n" v-model="form.name" class="input" required maxlength="60" />
              <p v-if="form.errors.name" class="text-[12px] text-accent-ink">{{ form.errors.name }}</p>
            </div>
            <div class="space-y-1.5">
              <label class="label" for="c">Màu</label>
              <input id="c" v-model="form.color" type="color" class="input !w-14 !p-1" />
            </div>
            <div class="space-y-1.5">
              <label class="label" for="so">Thứ tự</label>
              <input id="so" v-model.number="form.sort" type="number" min="0" max="999"
                     class="input !w-20 text-center" />
            </div>
          </div>

          <div v-if="!editing.slug" class="space-y-1.5">
            <label class="label" for="sl">Mã vai trò</label>
            <input id="sl" v-model="form.slug" class="input font-mono !text-[13px]"
                   required maxlength="30" placeholder="vd: cong-tac-vien" />
            <p v-if="form.errors.slug" class="text-[12px] text-accent-ink">{{ form.errors.slug }}</p>
            <p v-else class="text-[11.5px] text-ink-muted">
              Không đổi được sau khi tạo — đổi mã là mọi tài khoản mang vai trò đó mất quyền.
            </p>
          </div>

          <div v-if="isSuper" class="rounded-xl border px-4 py-3 text-[13px] leading-relaxed"
               style="border-color: rgba(217,22,68,.3); background: rgba(217,22,68,.07);
                      color: var(--color-accent-ink)">
            Vai trò toàn quyền luôn có mọi quyền và không sửa được danh sách bên dưới.
            Gỡ nhầm một ô là khoá luôn cả hệ thống, mà lúc đó không còn ai vào để gỡ lại.
          </div>

          <div v-else class="space-y-4">
            <div v-for="(abilities, group) in groups" :key="group"
                 class="rounded-xl border border-line p-3.5">
              <div class="mb-2.5 flex items-center justify-between">
                <p class="text-[12px] font-bold uppercase tracking-wide text-ink-muted">{{ group }}</p>
                <button type="button" class="cbtn" @click="toggleGroup(Object.keys(abilities))">
                  Chọn / bỏ hết
                </button>
              </div>

              <div class="space-y-2.5">
                <label v-for="(label, key) in abilities" :key="key"
                       class="flex cursor-pointer items-start gap-2.5">
                  <Switch :model-value="form.abilities.includes(key)" @update:model-value="toggle(key)" />
                  <span class="min-w-0">
                    <span class="block text-[13px] font-semibold leading-snug">{{ label }}</span>
                    <span class="block font-mono text-[11px] text-ink-muted">{{ key }}</span>
                  </span>
                </label>
              </div>
            </div>

            <p class="text-[12px] text-ink-muted">
              Vai trò không có quyền nào thì không vào được khu quản trị.
            </p>
          </div>
        </form>

        <footer class="flex shrink-0 items-center gap-2 border-t border-line px-5 py-3">
          <span v-if="!isSuper" class="text-[12.5px] text-ink-muted tabular-nums">
            {{ form.abilities.length }}/{{ allAbilities.length }} quyền
          </span>
          <button class="btn ml-auto" @click="editing = null">Huỷ</button>
          <button class="btn btn-primary" :disabled="form.processing" @click="save">
            {{ form.processing ? 'Đang lưu…' : 'Lưu vai trò' }}
          </button>
        </footer>
      </div>
    </div>
  </AdminLayout>
</template>
