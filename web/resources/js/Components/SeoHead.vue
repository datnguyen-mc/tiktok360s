<script setup>
/*
 * Toàn bộ thẻ SEO của một trang, dựng từ một đối tượng `seo` do controller gửi
 * sang (xem app/Support/Seo.php). Gom một chỗ để title, canonical, Open Graph
 * và JSON-LD luôn nói cùng một điều — viết tay từng nơi là chắc chắn lệch.
 *
 * Nhờ SSR, những thẻ này có mặt trong HTML ngay từ phản hồi đầu tiên.
 */
import { Head } from '@inertiajs/vue3'

const props = defineProps({ seo: { type: Object, required: true } })

const blocks = () => {
  const j = props.seo.jsonLd
  if (!j) return []
  return Array.isArray(j) ? j : [j]
}
</script>

<template>
  <Head :title="seo.title">
    <meta name="description" :content="seo.description" />
    <link rel="canonical" :href="seo.canonical" />
    <meta v-if="seo.noindex" name="robots" content="noindex, follow" />
    <meta v-else name="robots" content="index, follow, max-image-preview:large" />

    <!-- Open Graph: dùng khi chia sẻ lên Facebook, Zalo -->
    <meta property="og:type" :content="seo.type" />
    <meta property="og:title" :content="seo.title" />
    <meta property="og:description" :content="seo.description" />
    <meta property="og:url" :content="seo.canonical" />
    <meta property="og:image" :content="seo.image" />
    <meta property="og:site_name" :content="seo.siteName" />
    <meta property="og:locale" :content="seo.locale" />
    <meta v-if="seo.publishedAt" property="article:published_time" :content="seo.publishedAt" />
    <meta v-if="seo.modifiedAt" property="article:modified_time" :content="seo.modifiedAt" />
    <meta v-if="seo.section" property="article:section" :content="seo.section" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" :content="seo.title" />
    <meta name="twitter:description" :content="seo.description" />
    <meta name="twitter:image" :content="seo.image" />

    <!-- Dữ liệu có cấu trúc: thứ quyết định bài có vào được mục Tin bài hàng đầu -->
    <component :is="'script'" v-for="(b, i) in blocks()" :key="i"
               type="application/ld+json" v-html="JSON.stringify(b)" />
  </Head>
</template>
