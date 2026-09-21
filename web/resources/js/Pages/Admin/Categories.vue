<script setup>
import { computed, ref } from 'vue'
import { Head, router, useForm, usePage } from '@inertiajs/vue3'
import AdminLayout from '../../Layouts/AdminLayout.vue'
import PageHeader from '../../Components/Admin/PageHeader.vue'
import EmptyState from '../../Components/Admin/EmptyState.vue'
import IconButton from '../../Components/Admin/IconButton.vue'
import Icon from '../../Components/Admin/Icon.vue'
import Switch from '../../Components/Admin/Switch.vue'
import { fmtNumber } from '../../format'

defineProps({ categories: { type: Array, default: () => [] } })

const canEdit = computed(() => !!usePage().props.auth?.user?.can?.['categories.edit'])

const editing = ref(null)

/** Bật/tắt ngay trên hàng — gửi lại nguyên bản ghi kèm một trường đã đảo. */
const toggle = (c, field) =>
  router.put(`/admin/categories/${c.id}`, { ...c, [field]: !c[field] }, { preserveScroll: true })

const blank = () => ({ name: '', topic: '', description: '', color: '#FE2C55',
                       sort: 0, is_active: true, in_menu: true,
                       seo_title: '', seo_description: '' })

const form = useForm(blank())

function edit(c) {
  editing.value = c
  Object.assign(form, c ? { ...blank(), ...c } : blank())
  form.clearErrors()
}

function save() {
  if (editing.value?.id) form.put(`/admin/categories/${editing.value.id}`,
                                  { onSuccess: () => (editing.value = null) })
  else form.post('/admin/categories', { onSuccess: () => (editing.value = null) })
}

function remove(c) {
  if (confirm(`Xoá chuyên mục “${c.name}”?`)) {
    router.delete(`/admin/categories/${c.id}`, { preserveScroll: true })
  }
}
</script>

<template>
  <Head title="Chuyên mục · Quản trị" />

  <AdminLayout>
    <PageHeader title="Chuyên mục"
                subtitle="Mỗi chuyên mục có nguồn RSS riêng; bộ lấy tin chạy theo danh sách này.">
      <template #actions>
        <button v-if="canEdit" class="btn btn-primary" @click="edit(null)">
          <Icon name="plus" /> Thêm chuyên mục
        </button>
      </template>
    </PageHeader>

    <div class="adm-card overflow-hidden">
      <div v-if="categories.length" class="overflow-x-auto">
        <table class="adm-table min-w-[860px]">
          <thead>
            <tr>
              <th>Chuyên mục</th>
              <th class="w-[150px]">Đường dẫn</th>
              <th class="w-[110px]">Chủ đề video</th>
              <th class="w-[80px] text-right">Số bài</th>
              <th class="w-[86px]">Bật</th>
              <th class="w-[92px]">Trên menu</th>
              <th class="w-[70px] text-right">Thứ tự</th>
              <th class="w-[96px]"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in categories" :key="c.id">
              <td>
                <div class="flex items-center gap-2.5">
                  <span class="h-7 w-1.5 shrink-0 rounded-full" :style="{ background: c.color }"></span>
                  <div class="min-w-0">
                    <p class="truncate text-[13.5px] font-bold">{{ c.name }}</p>
                    <p v-if="c.description" class="truncate text-[12px] text-ink-muted">
                      {{ c.description }}
                    </p>
                  </div>
                </div>
              </td>

              <td>
                <a :href="`/category/${c.slug}`" target="_blank"
                   class="inline-flex items-center gap-1 font-mono text-[12px] text-ink-muted
                          hover:text-accent-ink">
                  /{{ c.slug }}
                  <Icon name="external" size="size-3" />
                </a>
              </td>

              <td>
                <span v-if="c.topic" class="adm-chip font-mono"
                      style="background: var(--color-surface-2)">{{ c.topic }}</span>
                <span v-else class="text-ink-muted/40">—</span>
              </td>

              <td class="text-right text-[13px] font-semibold tabular-nums">
                {{ fmtNumber(c.articles_count) }}
              </td>

              <td>
                <Switch :model-value="!!c.is_active" :disabled="!canEdit"
                        @update:model-value="toggle(c, 'is_active')" />
              </td>

              <td>
                <Switch :model-value="!!c.in_menu" :disabled="!canEdit"
                        @update:model-value="toggle(c, 'in_menu')" />
              </td>

              <td class="text-right text-[13px] text-ink-muted tabular-nums">{{ c.sort }}</td>

              <td>
                <span v-if="canEdit" class="rowacts">
                  <IconButton icon="edit" label="Sửa chuyên mục" @click="edit(c)" />
                  <IconButton icon="trash" label="Xoá chuyên mục" tone="danger" @click="remove(c)" />
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState v-else title="Chưa có chuyên mục nào"
                  hint="Thêm chuyên mục đầu tiên rồi khai báo nguồn RSS cho nó."
                  icon="M3 7h18M3 12h18M3 17h10">
        <button v-if="canEdit" class="btn btn-primary" @click="edit(null)">Thêm chuyên mục</button>
      </EmptyState>
    </div>

    <Teleport to="body">
      <div v-if="editing !== null" class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4"
           @click.self="editing = null">
        <div class="adm-card my-6 w-full max-w-lg p-5">
          <h2 class="text-base font-extrabold">{{ editing?.id ? 'Sửa chuyên mục' : 'Thêm chuyên mục' }}</h2>

          <div class="mt-4 space-y-3.5">
            <div class="grid gap-3 sm:grid-cols-2">
              <div class="space-y-1.5">
                <label class="label">Tên</label>
                <input v-model="form.name" class="input" placeholder="vd: Âm nhạc" />
                <p v-if="form.errors.name" class="text-[12px] text-accent-ink">{{ form.errors.name }}</p>
              </div>
              <div class="space-y-1.5">
                <label class="label">Chủ đề video (tuỳ chọn)</label>
                <input v-model="form.topic" class="input font-mono !text-[13px]" placeholder="bongda" />
                <p class="text-[11px] text-ink-muted">Nối với chủ đề bên dây chuyền video.</p>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="label">Mô tả</label>
              <input v-model="form.description" class="input" />
            </div>

            <div class="grid gap-3 sm:grid-cols-[auto_1fr_auto]">
              <div class="space-y-1.5">
                <label class="label">Màu</label>
                <input v-model="form.color" type="color" class="h-9 w-14 rounded-lg border border-line" />
              </div>
              <div class="space-y-1.5">
                <label class="label">Mã màu</label>
                <input v-model="form.color" class="input font-mono !text-[13px]" />
              </div>
              <div class="space-y-1.5">
                <label class="label">Thứ tự</label>
                <input v-model.number="form.sort" type="number" class="input !w-20 tabular-nums" />
              </div>
            </div>

            <div class="flex gap-5">
              <label class="flex cursor-pointer items-center gap-2 text-[13.5px]">
                <input v-model="form.is_active" type="checkbox" class="accent-[#FE2C55]" /> Đang bật
              </label>
              <label class="flex cursor-pointer items-center gap-2 text-[13.5px]">
                <input v-model="form.in_menu" type="checkbox" class="accent-[#FE2C55]" /> Hiện trên menu
              </label>
            </div>

            <div class="space-y-1.5 border-t border-line pt-3.5">
              <label class="label">Tiêu đề SEO</label>
              <input v-model="form.seo_title" class="input !text-[13px]" />
            </div>
            <div class="space-y-1.5">
              <label class="label">Mô tả SEO</label>
              <textarea v-model="form.seo_description" rows="2" class="input resize-y !text-[13px]"></textarea>
            </div>
          </div>

          <div class="mt-5 flex justify-end gap-2">
            <button class="btn" @click="editing = null">Huỷ</button>
            <button class="btn btn-primary" :disabled="form.processing || !form.name" @click="save">
              Lưu
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>
