<script setup>
import { ref } from 'vue'
import { router } from '@inertiajs/vue3'
import PublicLayout from '../Layouts/PublicLayout.vue'
import SeoHead from '../Components/SeoHead.vue'
import ArticleCard from '../Components/ArticleCard.vue'
import Pagination from '../Components/Pagination.vue'
import Sidebar from '../Components/Sidebar.vue'

const props = defineProps({
  term: { type: String, default: '' },
  articles: { type: Object, required: true },
  sidebar: { type: Object, default: () => ({}) },
  seo: { type: Object, required: true },
})

const q = ref(props.term)
const submit = () => router.get('/search', { q: q.value.trim() }, { preserveState: true })
</script>

<template>
  <SeoHead :seo="seo" />

  <PublicLayout>
    <div class="wrap">
      <form class="mx-auto max-w-xl" @submit.prevent="submit">
        <label class="label mb-1.5" for="sq">Tìm tin</label>
        <div class="flex gap-2">
          <input id="sq" v-model="q" class="input" placeholder="vd: Sơn Tùng, Messi, V-League…" autofocus />
          <button class="btn btn-primary shrink-0">Tìm</button>
        </div>
      </form>

      <div v-if="term" class="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
        <p class="mb-4 text-[14px] text-ink-muted">
          <strong class="text-ink">{{ articles.total }}</strong> kết quả cho “{{ term }}”
        </p>

        <div v-if="articles.data.length" class="grid gap-x-5 gap-y-7 sm:grid-cols-2">
          <ArticleCard v-for="a in articles.data" :key="a.id" :article="a" show-excerpt />
        </div>
        <p v-else class="py-16 text-center text-ink-muted">
          Không tìm thấy tin nào. Thử từ khoá ngắn hơn hoặc bỏ dấu.
        </p>

        <Pagination :page="articles" unit="kết quả" class="mt-8" />
        </div>

        <Sidebar :sidebar="sidebar" />
      </div>
    </div>
  </PublicLayout>
</template>
