<script setup>
import { computed } from 'vue'
import { Link, useForm, usePage } from '@inertiajs/vue3'
import SeoHead from '../../Components/SeoHead.vue'

const site = computed(() => usePage().props.site || {})
const form = useForm({ name: '', email: '', password: '', password_confirmation: '' })
</script>

<template>
  <SeoHead :seo="{ title: 'Đăng ký', description: 'Tạo tài khoản để bình luận, lưu bài và theo dõi tin.',
                   noindex: true, canonical: '', image: '', type: 'website',
                   siteName: site.name, locale: 'vi_VN' }" />

  <div class="grid min-h-dvh lg:grid-cols-2">
    <!-- Cột giới thiệu: nói rõ đăng ký để được gì, đừng bắt người ta đoán -->
    <div class="hidden flex-col justify-center p-10 lg:flex"
         style="background: linear-gradient(140deg, #FE2C55 0%, #8B5CF6 55%, #25F4EE 100%)">
      <img :src="site.logo" alt="" class="size-12 rounded-xl" />
      <h2 class="mt-6 max-w-sm text-[32px] font-extrabold leading-tight tracking-tight text-white">
        Tin tức của bạn, theo cách của bạn
      </h2>
      <ul class="mt-6 max-w-sm space-y-3 text-[14px] text-white/90">
        <li v-for="t in [
              'Lưu bài để đọc sau, trên mọi thiết bị',
              'Bình luận và trao đổi với người đọc khác',
              'Thích bài hay để nó lên mục Đọc nhiều',
            ]" :key="t" class="flex gap-2.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               class="mt-0.5 size-4 shrink-0"><path d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round" /></svg>
          {{ t }}
        </li>
      </ul>
    </div>

    <div class="grid place-items-center p-6">
      <div class="w-full max-w-[380px]">
        <Link href="/" class="mb-6 flex items-center gap-2.5">
          <img :src="site.logo" alt="" class="size-9 rounded-xl lg:hidden" />
          <span class="text-lg font-extrabold tracking-tight">Tạo tài khoản</span>
        </Link>

        <form class="space-y-4" @submit.prevent="form.post('/register')">
          <div class="space-y-1.5">
            <label class="label" for="n">Tên hiển thị</label>
            <input id="n" v-model="form.name" class="input" required autocomplete="name" />
            <p v-if="form.errors.name" class="text-[12px] text-accent-ink">{{ form.errors.name }}</p>
          </div>

          <div class="space-y-1.5">
            <label class="label" for="e">Email</label>
            <input id="e" v-model="form.email" type="email" class="input" required autocomplete="email" />
            <p v-if="form.errors.email" class="text-[12px] text-accent-ink">{{ form.errors.email }}</p>
          </div>

          <div class="space-y-1.5">
            <label class="label" for="p">Mật khẩu</label>
            <input id="p" v-model="form.password" type="password" class="input" required
                   minlength="8" autocomplete="new-password" />
            <p v-if="form.errors.password" class="text-[12px] text-accent-ink">{{ form.errors.password }}</p>
            <p v-else class="text-[11.5px] text-ink-muted">Ít nhất 8 ký tự.</p>
          </div>

          <div class="space-y-1.5">
            <label class="label" for="p2">Nhập lại mật khẩu</label>
            <input id="p2" v-model="form.password_confirmation" type="password" class="input"
                   required autocomplete="new-password" />
          </div>

          <button class="btn btn-primary w-full" :disabled="form.processing">
            {{ form.processing ? 'Đang tạo…' : 'Đăng ký' }}
          </button>
        </form>

        <p class="mt-5 text-center text-[13px] text-ink-muted">
          Đã có tài khoản?
          <Link href="/login" class="font-semibold text-accent-ink hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  </div>
</template>
