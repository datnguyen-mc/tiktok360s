<script setup>
import PublicLayout from '../Layouts/PublicLayout.vue'
import SeoHead from '../Components/SeoHead.vue'
import { Link } from '@inertiajs/vue3'
import { fmtDate } from '../format'

defineProps({
  page: { type: Object, required: true },
  seo: { type: Object, required: true },
})
</script>

<template>
  <SeoHead :seo="seo" />

  <PublicLayout>
    <div class="wrap max-w-[760px]">
      <nav class="mb-4 flex items-center gap-1.5 text-[12.5px] text-ink-muted" aria-label="Đường dẫn">
        <Link href="/" class="hover:text-ink">Trang chủ</Link>
        <span>/</span>
        <span class="text-ink-2">{{ page.title }}</span>
      </nav>

      <h1 class="text-[28px] font-extrabold leading-tight tracking-tight sm:text-[34px]">
        {{ page.title }}
      </h1>
      <p v-if="page.excerpt" class="mt-3 text-[16px] leading-relaxed text-ink-2">{{ page.excerpt }}</p>

      <div v-if="page.content" class="prose-vi mt-6" v-html="page.content"></div>

      <p class="mt-10 border-t border-line pt-4 text-[12.5px] text-ink-muted">
        Cập nhật lần cuối {{ fmtDate(page.updated_at) }}
      </p>
    </div>
  </PublicLayout>
</template>
