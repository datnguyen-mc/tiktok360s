<script setup>
import PublicLayout from '../Layouts/PublicLayout.vue'
import SeoHead from '../Components/SeoHead.vue'
import ArticleCard from '../Components/ArticleCard.vue'
import Pagination from '../Components/Pagination.vue'
import Sidebar from '../Components/Sidebar.vue'

defineProps({
  category: { type: Object, required: true },
  articles: { type: Object, required: true },
  sidebar: { type: Object, default: () => ({}) },
  seo: { type: Object, required: true },
})
</script>

<template>
  <SeoHead :seo="seo" />

  <PublicLayout>
    <div class="wrap">
      <header class="mb-6 border-b border-line pb-5">
        <div class="flex items-center gap-2.5">
          <span class="h-6 w-1.5 rounded-full" :style="{ background: category.color }"></span>
          <h1 class="text-2xl font-extrabold tracking-tight">{{ category.name }}</h1>
        </div>
        <p v-if="category.description" class="mt-2 max-w-2xl text-[14px] text-ink-muted">
          {{ category.description }}
        </p>
        <p class="mt-1 text-[12.5px] text-ink-muted">{{ articles.total }} tin</p>
      </header>

      <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div v-if="articles.data.length" class="grid gap-x-5 gap-y-7 sm:grid-cols-2">
            <ArticleCard v-for="a in articles.data" :key="a.id" :article="a" show-excerpt />
          </div>
          <p v-else class="py-20 text-center text-ink-muted">Chuyên mục này chưa có tin.</p>

          <Pagination :page="articles" unit="tin" class="mt-8" />
        </div>

        <Sidebar :sidebar="sidebar" />
      </div>
    </div>
  </PublicLayout>
</template>
