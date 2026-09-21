<script setup>
import { ref } from 'vue'
import { Head, router, useForm } from '@inertiajs/vue3'
import AdminLayout from '../../Layouts/AdminLayout.vue'
import PageHeader from '../../Components/Admin/PageHeader.vue'
import EmptyState from '../../Components/Admin/EmptyState.vue'
import Switch from '../../Components/Admin/Switch.vue'
import IconButton from '../../Components/Admin/IconButton.vue'
import Icon from '../../Components/Admin/Icon.vue'
import { fmtDate } from '../../format'

defineProps({ pages: { type: Array, default: () => [] } })

const editing = ref(null)   // null = đóng, {} = tạo mới, {…} = sửa

const form = useForm({
  title: '', slug: '', excerpt: '', content: '',
  is_published: true, in_footer: true, sort: 0,
  seo_title: '', seo_description: '',
})

function open(p) {
  editing.value = p || {}
  form.defaults({
    title: p?.title || '', slug: p?.slug || '',
    excerpt: p?.excerpt || '', content: p?.content || '',
    is_published: p ? !!p.is_published : true,
    in_footer: p ? !!p.in_footer : true,
    sort: p?.sort ?? 0,
    seo_title: p?.seo_title || '', seo_description: p?.seo_description || '',
  })
  form.reset()
  form.clearErrors()
}

function save() {
  const done = { preserveScroll: true, onSuccess: () => (editing.value = null) }
  editing.value?.id
    ? form.put(`/admin/pages/${editing.value.slug}`, done)
    : form.post('/admin/pages', done)
}

function remove(p) {
  if (confirm(`Xoá trang “${p.title}”?`)) {
    router.delete(`/admin/pages/${p.slug}`, { preserveScroll: true })
  }
}

const toggle = (p, field) =>
  router.put(`/admin/pages/${p.slug}`, {
    ...p, [field]: !p[field],
  }, { preserveScroll: true })
</script>

<template>
  <Head title="Trang tĩnh · Quản trị" />

  <AdminLayout>
    <PageHeader title="Trang tĩnh"
                subtitle="Giới thiệu, liên hệ, điều khoản — những trang không phải tin tức.">
      <template #actions>
        <button class="btn btn-primary" @click="open(null)">
          <Icon name="plus" /> Thêm trang
        </button>
      </template>
    </PageHeader>

    <div class="adm-card overflow-hidden">
      <div v-if="pages.length" class="overflow-x-auto">
        <table class="adm-table min-w-[720px]">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th class="w-[150px]">Đường dẫn</th>
              <th class="w-[92px]">Hiển thị</th>
              <th class="w-[100px]">Chân trang</th>
              <th class="w-[70px]">Thứ tự</th>
              <th class="w-[110px]">Cập nhật</th>
              <th class="w-[106px]"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in pages" :key="p.id">
              <td>
                <p class="text-[13.5px] font-bold">{{ p.title }}</p>
                <p v-if="p.excerpt" class="mt-0.5 line-clamp-1 text-[12px] text-ink-muted">
                  {{ p.excerpt }}
                </p>
              </td>
              <td>
                <a :href="`/page/${p.slug}`" target="_blank"
                   class="inline-flex items-center gap-1 font-mono text-[12px] text-ink-muted
                          hover:text-accent-ink">
                  /{{ p.slug }}
                  <Icon name="external" size="size-3" />
                </a>
              </td>
              <td><Switch :model-value="!!p.is_published" @update:model-value="toggle(p, 'is_published')" /></td>
              <td><Switch :model-value="!!p.in_footer" @update:model-value="toggle(p, 'in_footer')" /></td>
              <td class="text-[13px] tabular-nums">{{ p.sort }}</td>
              <td class="text-[12px] text-ink-muted">{{ fmtDate(p.updated_at) }}</td>
              <td>
                <span class="rowacts">
                  <IconButton icon="edit" label="Sửa trang" @click="open(p)" />
                  <IconButton icon="eye" label="Xem trên web" tone="cyan"
                              as="a" :href="`/page/${p.slug}`" target="_blank" />
                  <IconButton icon="trash" label="Xoá trang" tone="danger" @click="remove(p)" />
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <EmptyState v-else title="Chưa có trang tĩnh nào"
                  hint="Thêm trang Giới thiệu hoặc Liên hệ để chân trang website có nội dung.">
        <button class="btn btn-primary" @click="open(null)">Thêm trang đầu tiên</button>
      </EmptyState>
    </div>

    <!-- Ngăn soạn thảo -->
    <div v-if="editing" class="fixed inset-0 z-50 flex justify-end bg-black/40"
         @click.self="editing = null">
      <div class="flex h-full w-full max-w-[620px] flex-col bg-page shadow-2xl">
        <header class="flex h-14 shrink-0 items-center gap-3 border-b border-line px-5">
          <h2 class="text-[15px] font-extrabold tracking-tight">
            {{ editing.id ? 'Sửa trang' : 'Trang mới' }}
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
            <label class="label" for="t">Tiêu đề</label>
            <input id="t" v-model="form.title" class="input" required maxlength="200" />
            <p v-if="form.errors.title" class="text-[12px] text-accent-ink">{{ form.errors.title }}</p>
          </div>

          <div class="space-y-1.5">
            <label class="label" for="s">Đường dẫn</label>
            <div class="flex items-center gap-1.5">
              <span class="text-[13px] text-ink-muted">/page/</span>
              <input id="s" v-model="form.slug" class="input"
                     placeholder="để trống sẽ tự sinh từ tiêu đề" />
            </div>
            <p v-if="form.errors.slug" class="text-[12px] text-accent-ink">{{ form.errors.slug }}</p>
          </div>

          <div class="space-y-1.5">
            <label class="label" for="e">Tóm tắt</label>
            <textarea id="e" v-model="form.excerpt" rows="2" maxlength="300"
                      class="input resize-y !py-2"></textarea>
          </div>

          <div class="space-y-1.5">
            <label class="label" for="c">Nội dung</label>
            <textarea id="c" v-model="form.content" rows="12"
                      class="input resize-y !py-2 font-mono !text-[13px]"
                      placeholder="<p>Chấp nhận HTML: p, h2, h3, ul, a, img…</p>"></textarea>
            <p class="text-[11.5px] text-ink-muted">
              Nội dung hiển thị bằng kiểu chữ thân bài của website.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-5 rounded-xl border border-line bg-surface p-3.5">
            <Switch v-model="form.is_published" label="Hiển thị công khai" />
            <Switch v-model="form.in_footer" label="Hiện ở chân trang" />
            <label class="ml-auto flex items-center gap-2 text-[13px] font-medium">
              Thứ tự
              <input v-model.number="form.sort" type="number" min="0" max="999"
                     class="input !w-16 !py-1 text-center" />
            </label>
          </div>

          <details class="rounded-xl border border-line p-3.5">
            <summary class="cursor-pointer text-[13px] font-bold">Tuỳ chọn SEO</summary>
            <div class="mt-3 space-y-3">
              <div class="space-y-1.5">
                <label class="label" for="st">Tiêu đề SEO</label>
                <input id="st" v-model="form.seo_title" class="input" maxlength="200"
                       :placeholder="form.title" />
              </div>
              <div class="space-y-1.5">
                <label class="label" for="sd">Mô tả SEO</label>
                <textarea id="sd" v-model="form.seo_description" rows="2" maxlength="300"
                          class="input resize-y !py-2" :placeholder="form.excerpt"></textarea>
              </div>
            </div>
          </details>
        </form>

        <footer class="flex shrink-0 items-center justify-end gap-2 border-t border-line px-5 py-3">
          <button class="btn" @click="editing = null">Huỷ</button>
          <button class="btn btn-primary" :disabled="form.processing" @click="save">
            {{ form.processing ? 'Đang lưu…' : 'Lưu trang' }}
          </button>
        </footer>
      </div>
    </div>
  </AdminLayout>
</template>
