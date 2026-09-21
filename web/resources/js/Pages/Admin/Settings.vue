<script setup>
import { Head, useForm } from '@inertiajs/vue3'
import AdminLayout from '../../Layouts/AdminLayout.vue'
import PageHeader from '../../Components/Admin/PageHeader.vue'

const props = defineProps({
  settings: { type: Object, required: true },
  defaults: { type: Object, default: () => ({}) },
})

const form = useForm({ ...props.settings, per_page: Number(props.settings.per_page) })

const SECTIONS = [
  {
    title: 'Nhận diện',
    hint: 'Tên và mô tả này xuất hiện ở thẻ <title>, thẻ chia sẻ mạng xã hội và dữ liệu có cấu trúc cho Google.',
    fields: [
      { k: 'name',        label: 'Tên website', type: 'text', required: true },
      { k: 'tagline',     label: 'Khẩu hiệu', type: 'text' },
      { k: 'description', label: 'Mô tả trang chủ', type: 'textarea',
        hint: 'Google thường cắt quanh 160 ký tự.' },
      { k: 'logo',        label: 'Đường dẫn logo', type: 'text' },
    ],
  },
  {
    title: 'Hiển thị',
    fields: [
      { k: 'per_page', label: 'Số bài mỗi trang', type: 'number', min: 6, max: 60, required: true,
        hint: 'Áp dụng cho trang chuyên mục và tìm kiếm.' },
      { k: 'ga', label: 'Mã Google Analytics', type: 'text', placeholder: 'G-XXXXXXXXXX' },
    ],
  },
  {
    title: 'Liên hệ',
    fields: [
      { k: 'email',   label: 'Email', type: 'email' },
      { k: 'hotline', label: 'Điện thoại', type: 'text' },
      { k: 'address', label: 'Địa chỉ', type: 'text' },
    ],
  },
  {
    title: 'Mạng xã hội',
    hint: 'Để trống thì biểu tượng tương ứng không hiện ở chân trang.',
    fields: [
      { k: 'facebook', label: 'Facebook', type: 'url', placeholder: 'https://facebook.com/…' },
      { k: 'youtube',  label: 'YouTube',  type: 'url', placeholder: 'https://youtube.com/@…' },
      { k: 'tiktok',   label: 'TikTok',   type: 'url', placeholder: 'https://tiktok.com/@…' },
    ],
  },
  {
    title: 'Chân trang',
    fields: [
      { k: 'copyright', label: 'Dòng bản quyền', type: 'textarea' },
    ],
  },
]

const changed = (k) => String(form[k] ?? '') !== String(props.settings[k] ?? '')
</script>

<template>
  <Head title="Cấu hình · Quản trị" />

  <AdminLayout>
    <PageHeader title="Cấu hình website"
                subtitle="Những giá trị này thay cho việc phải sửa file rồi khởi động lại.">
      <template #actions>
        <button class="btn btn-primary" :disabled="form.processing || !form.isDirty"
                @click="form.put('/admin/settings', { preserveScroll: true })">
          {{ form.processing ? 'Đang lưu…' : 'Lưu thay đổi' }}
        </button>
      </template>
    </PageHeader>

    <form class="grid gap-5 xl:grid-cols-2"
          @submit.prevent="form.put('/admin/settings', { preserveScroll: true })">
      <section v-for="s in SECTIONS" :key="s.title" class="adm-card p-4">
        <h2 class="text-[14px] font-extrabold tracking-tight">{{ s.title }}</h2>
        <p v-if="s.hint" class="mt-0.5 text-[12px] leading-relaxed text-ink-muted">{{ s.hint }}</p>

        <div class="mt-3.5 space-y-3.5">
          <div v-for="f in s.fields" :key="f.k" class="space-y-1.5">
            <label class="label flex items-center gap-1.5" :for="f.k">
              {{ f.label }}
              <span v-if="changed(f.k)" class="size-1.5 rounded-full bg-accent"
                    title="Chưa lưu"></span>
            </label>

            <textarea v-if="f.type === 'textarea'" :id="f.k" v-model="form[f.k]" rows="2"
                      class="input resize-y !py-2"></textarea>
            <input v-else :id="f.k" v-model="form[f.k]" :type="f.type" :min="f.min" :max="f.max"
                   :required="f.required" :placeholder="f.placeholder" class="input" />

            <p v-if="form.errors[f.k]" class="text-[12px] text-accent-ink">{{ form.errors[f.k] }}</p>
            <p v-else-if="f.hint" class="text-[11.5px] text-ink-muted">{{ f.hint }}</p>
          </div>
        </div>
      </section>
    </form>

    <p class="mt-5 text-[12.5px] text-ink-muted">
      Lưu xong, bộ nhớ đệm trang chủ và cột bên được dọn ngay — không phải chờ hết 5 phút.
    </p>
  </AdminLayout>
</template>
