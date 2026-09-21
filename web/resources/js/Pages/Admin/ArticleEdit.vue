<script setup>
import { computed } from 'vue'
import { Head, Link, router, useForm, usePage } from '@inertiajs/vue3'
import AdminLayout from '../../Layouts/AdminLayout.vue'
import HtmlEditor from '../../Components/Admin/HtmlEditor.vue'
import Icon from '../../Components/Admin/Icon.vue'
import IconButton from '../../Components/Admin/IconButton.vue'

const props = defineProps({
  article: { type: Object, default: null },
  categories: { type: Array, default: () => [] },
})

const isNew = computed(() => !props.article)

const form = useForm({
  title: props.article?.title || '',
  category_id: props.article?.category_id || null,
  excerpt: props.article?.excerpt || '',
  content: props.article?.content || '',
  image_url: props.article?.image_url || '',
  source: props.article?.source || '',
  source_url: props.article?.source_url || '',
  status: props.article?.status || 'draft',
  is_featured: props.article?.is_featured || false,
  seo_title: props.article?.seo_title || '',
  seo_description: props.article?.seo_description || '',
  published_at: props.article?.published_at?.slice(0, 16) || '',
})

function save() {
  if (isNew.value) form.post('/admin/articles')
  else form.put(`/admin/articles/${props.article.id}`)
}

// Google cắt tiêu đề khoảng 60 ký tự và mô tả khoảng 155 — đếm để biết trước
const can = computed(() => usePage().props.auth?.user?.can || {})

function remove() {
  if (!confirm(`Xoá “${props.article.title.slice(0, 60)}…”?`)) return
  router.delete(`/admin/articles/${props.article.id}`)
}

const titleLen = computed(() => (form.seo_title || form.title).length)
const descLen = computed(() => (form.seo_description || form.excerpt || '').length)
</script>

<template>
  <Head :title="(isNew ? 'Viết bài mới' : 'Sửa bài') + ' · Quản trị'" />

  <AdminLayout>
    <div class="mb-5 flex flex-wrap items-center gap-2.5">
      <IconButton icon="back" label="Về danh sách" as="link" href="/admin/articles" />

      <div class="min-w-0">
        <h1 class="text-[20px] font-extrabold leading-tight tracking-tight">
          {{ isNew ? 'Viết bài mới' : 'Sửa bài' }}
        </h1>
        <p v-if="article" class="truncate text-[12px] text-ink-muted">{{ article.title }}</p>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <a v-if="article && article.status === 'published'" :href="`/news/${article.slug}`"
           target="_blank" class="btn !py-1.5 !text-[13px]">
          <Icon name="eye" size="size-3.5" /> Xem trên web
        </a>
        <button v-if="article && can['articles.delete']" class="btn btn-danger !py-1.5 !text-[13px]"
                @click="remove">
          <Icon name="trash" size="size-3.5" /> Xoá
        </button>
        <button class="btn btn-primary" :disabled="form.processing || !form.title" @click="save">
          <Icon name="save" size="size-4" />
          {{ form.processing ? 'Đang lưu…' : 'Lưu bài' }}
        </button>
      </div>
    </div>

    <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <!-- Nội dung -->
      <div class="adm-card space-y-4 p-5">
        <div class="space-y-1.5">
          <label class="label" for="t">Tiêu đề</label>
          <input id="t" v-model="form.title" class="input !text-[16px] !font-semibold"
                 placeholder="Tiêu đề bài viết" />
          <p v-if="form.errors.title" class="text-[12px] text-accent-ink">{{ form.errors.title }}</p>
        </div>

        <div class="space-y-1.5">
          <label class="label" for="ex">Sapo <span class="font-normal text-ink-muted">(đoạn mở đầu)</span></label>
          <textarea id="ex" v-model="form.excerpt" rows="3" class="input resize-y"></textarea>
        </div>

        <div class="space-y-1.5">
          <label class="label" for="ct">Nội dung</label>
          <HtmlEditor v-model="form.content" :rows="18" />
          <p v-if="form.errors.content" class="text-[12px] text-accent-ink">{{ form.errors.content }}</p>
        </div>
      </div>

      <!-- Thiết lập -->
      <div class="space-y-4">
        <div class="adm-card space-y-4 p-4">
          <div class="space-y-1.5">
            <label class="label" for="st">Trạng thái</label>
            <select id="st" v-model="form.status" class="input">
              <option value="published">Đã đăng</option>
              <option value="draft">Nháp</option>
              <option value="hidden">Ẩn</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="label" for="cat">Chuyên mục</label>
            <select id="cat" v-model="form.category_id" class="input">
              <option :value="null">— chưa xếp —</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="label" for="pub">Thời điểm đăng</label>
            <input id="pub" v-model="form.published_at" type="datetime-local" class="input" />
          </div>

          <label class="flex cursor-pointer items-center gap-2 text-[13.5px] font-semibold">
            <input v-model="form.is_featured" type="checkbox" class="accent-[#FE2C55]" />
            Tin nổi bật (hiện đầu trang chủ)
          </label>
        </div>

        <div class="adm-card space-y-4 p-4">
          <p class="text-[13.5px] font-bold">Ảnh và nguồn</p>
          <div class="space-y-1.5">
            <label class="label" for="img">Ảnh đại diện</label>
            <input id="img" v-model="form.image_url" class="input font-mono !text-[12px]"
                   placeholder="https://…" />
            <img v-if="form.image_url" :src="form.image_url" alt=""
                 class="mt-1.5 aspect-[16/9] w-full rounded-lg object-cover" />
          </div>
          <div class="grid grid-cols-2 gap-2.5">
            <div class="space-y-1.5">
              <label class="label" for="src">Nguồn</label>
              <input id="src" v-model="form.source" class="input !text-[13px]" placeholder="Kenh14" />
            </div>
            <div class="space-y-1.5">
              <label class="label" for="surl">Link gốc</label>
              <input id="surl" v-model="form.source_url" class="input font-mono !text-[12px]" />
            </div>
          </div>
        </div>

        <div class="adm-card space-y-4 p-4">
          <p class="text-[13.5px] font-bold">SEO</p>

          <div class="space-y-1.5">
            <label class="label" for="seot">
              Tiêu đề SEO
              <span class="float-right font-normal tabular-nums"
                    :style="{ color: titleLen > 60 ? 'var(--color-accent-ink)' : 'var(--color-ink-muted)' }">
                {{ titleLen }}/60
              </span>
            </label>
            <input id="seot" v-model="form.seo_title" class="input !text-[13px]"
                   :placeholder="form.title || 'Để trống = dùng tiêu đề bài'" />
          </div>

          <div class="space-y-1.5">
            <label class="label" for="seod">
              Mô tả SEO
              <span class="float-right font-normal tabular-nums"
                    :style="{ color: descLen > 155 ? 'var(--color-accent-ink)' : 'var(--color-ink-muted)' }">
                {{ descLen }}/155
              </span>
            </label>
            <textarea id="seod" v-model="form.seo_description" rows="3"
                      class="input resize-y !text-[13px]"
                      placeholder="Để trống = dùng sapo"></textarea>
          </div>

          <p class="rounded-lg bg-surface px-3 py-2.5 text-[11.5px] leading-relaxed text-ink-muted">
            Google thường cắt tiêu đề ở khoảng 60 ký tự và mô tả ở 155. Vượt quá không bị
            phạt, chỉ là phần thừa không ai đọc được.
          </p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
