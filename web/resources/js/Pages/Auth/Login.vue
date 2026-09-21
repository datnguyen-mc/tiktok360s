<script setup>
import { Link, useForm, usePage } from '@inertiajs/vue3'
import SeoHead from '../../Components/SeoHead.vue'
import { computed } from 'vue'

const site = computed(() => usePage().props.site || {})
const props = defineProps({ intended: { type: String, default: null } })
const form = useForm({ email: '', password: '', remember: true, next: props.intended })
</script>

<template>
  <SeoHead :seo="{ title: 'Đăng nhập', description: 'Đăng nhập để bình luận và lưu bài.', noindex: true,
                   canonical: '', image: '', type: 'website', siteName: site.name, locale: 'vi_VN' }" />

  <div class="grid min-h-dvh place-items-center p-6">
    <div class="w-full max-w-[370px]">
      <div class="mb-6 flex items-center gap-3">
        <img :src="site.logo" alt="" class="size-10 rounded-xl" />
        <div>
          <p class="text-lg font-extrabold tracking-tight">{{ site.name }}</p>
          <p class="text-xs text-ink-muted">Đăng nhập để bình luận và lưu bài</p>
        </div>
      </div>

      <form class="card space-y-4 p-5" @submit.prevent="form.post('/login')">
        <div class="space-y-1.5">
          <label class="label" for="email">Email</label>
          <input id="email" v-model="form.email" type="email" class="input" required
                 autocomplete="username" />
          <p v-if="form.errors.email" class="text-[12px] text-accent-ink">{{ form.errors.email }}</p>
        </div>

        <div class="space-y-1.5">
          <label class="label" for="pw">Mật khẩu</label>
          <input id="pw" v-model="form.password" type="password" class="input" required
                 autocomplete="current-password" />
        </div>

        <button class="btn btn-primary w-full" :disabled="form.processing">
          {{ form.processing ? 'Đang vào…' : 'Đăng nhập' }}
        </button>
      </form>

      <p class="mt-5 text-center text-[13px] text-ink-muted">
        Chưa có tài khoản?
        <Link href="/register" class="font-semibold text-accent-ink hover:underline">Đăng ký</Link>
      </p>
    </div>
  </div>
</template>
