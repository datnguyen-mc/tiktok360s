<script setup>
import { Link } from '@inertiajs/vue3'
import PublicLayout from '../Layouts/PublicLayout.vue'
import SeoHead from '../Components/SeoHead.vue'
import HeroSlider from '../Components/HeroSlider.vue'
import Thumb from '../Components/Thumb.vue'
import Sidebar from '../Components/Sidebar.vue'
import Stats from '../Components/Stats.vue'
import { fmtAgo } from '../format'

const props = defineProps({
  slider: { type: Array, default: () => [] },
  headlines: { type: Array, default: () => [] },
  latest: { type: Array, default: () => [] },
  blocks: { type: Array, default: () => [] },
  sidebar: { type: Object, default: () => ({}) },
  seo: { type: Object, required: true },
})
</script>

<template>
  <SeoHead :seo="seo" />

  <PublicLayout>
    <div class="wrap space-y-10">
      <!-- Khối nổi bật: băng chuyền bên trái, cột tiêu đề bên phải.
           Băng chuyền không chiếm hết bề ngang nữa — trang tin cần nhiều đầu
           mục trong tầm mắt đầu tiên, không phải một tấm ảnh thật to. -->
      <section class="grid gap-x-7 gap-y-5 lg:grid-cols-[minmax(0,8fr)_minmax(0,2fr)]">
        <HeroSlider :slides="slider" />

        <aside v-if="headlines.length" class="min-w-0">
          <div class="mb-2.5 flex items-center gap-2">
            <span class="size-2 rounded-full bg-accent"></span>
            <h2 class="text-[14px] font-extrabold tracking-tight">Tin nổi bật</h2>
          </div>

          <ul class="divide-y divide-line">
            <li v-for="a in headlines" :key="a.id" class="py-2.5 first:pt-0">
              <Link :href="`/news/${a.slug}`" class="group block">
                <span class="block text-[14.5px] font-bold leading-snug clamp-3
                             transition group-hover:text-accent-ink">{{ a.title }}</span>
                <!-- Cột này hẹp — bỏ tên nguồn để phần chú thích gọn một dòng -->
                <span class="mt-1 flex items-center gap-2 text-[11.5px] text-ink-muted">
                  <span v-if="a.category" class="shrink-0 rounded px-1.5 py-0.5 font-semibold"
                        :style="{ background: (a.category.color || '#FE2C55') + '1f',
                                  color: a.category.color || '#FE2C55' }">
                    {{ a.category.name }}
                  </span>
                  <span class="truncate">{{ fmtAgo(a.published_at) }}</span>
                </span>
              </Link>
            </li>
          </ul>
        </aside>
      </section>

      <!-- Tin mới: 80% cho danh sách tin, 20% cho cột tin hot -->
      <div class="grid gap-x-7 gap-y-10 lg:grid-cols-[minmax(0,8fr)_minmax(0,2fr)]">
        <div class="min-w-0 space-y-10">
          <section v-if="latest.length" aria-labelledby="moi-nhat">
            <div class="mb-4 flex items-center gap-3">
              <h2 id="moi-nhat" class="text-lg font-extrabold tracking-tight">Mới nhất</h2>
              <span class="h-px flex-1 bg-line"></span>
            </div>

            <!-- Danh sách ngang: ảnh nhỏ bên trái, chữ bên phải — đọc lướt nhanh
                 hơn lưới thẻ, và vừa nhiều tin hơn trong cùng chiều cao. -->
            <ul class="divide-y divide-line">
              <li v-for="a in latest" :key="a.id" class="py-3.5 first:pt-0">
                <Link :href="`/news/${a.slug}`" class="group flex gap-3.5">
                  <Thumb :src="a.image_url" :alt="a.title"
                         ratio="h-[72px] w-[108px] sm:h-[84px] sm:w-[126px]"
                         rounded="rounded-lg" class="shrink-0" />
                  <span class="min-w-0 flex-1">
                    <span class="block text-[15px] font-bold leading-snug clamp-2
                                 transition group-hover:text-accent-ink sm:text-[16px]">
                      {{ a.title }}
                    </span>
                    <span v-if="a.excerpt"
                          class="mt-1 hidden text-[13px] leading-relaxed text-ink-muted clamp-2 sm:block">
                      {{ a.excerpt }}
                    </span>
                    <span class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1
                                 text-[11.5px] text-ink-muted">
                      <span v-if="a.category" class="rounded px-1.5 py-0.5 font-semibold"
                            :style="{ background: (a.category.color || '#FE2C55') + '1f',
                                      color: a.category.color || '#FE2C55' }">
                        {{ a.category.name }}
                      </span>
                      <span v-if="a.source">{{ a.source }}</span>
                      <span>· {{ fmtAgo(a.published_at) }}</span>
                      <Stats :article="a" class="ml-1" />
                    </span>
                  </span>
                </Link>
              </li>
            </ul>
          </section>

          <!-- Theo chuyên mục -->
          <section v-for="b in blocks" :key="b.category.slug">
            <div class="mb-4 flex items-center gap-3">
              <h2 class="text-lg font-extrabold tracking-tight">
                <Link :href="`/category/${b.category.slug}`" class="hover:text-accent-ink">
                  {{ b.category.name }}
                </Link>
              </h2>
              <span class="h-1.5 w-1.5 rounded-full" :style="{ background: b.category.color }"></span>
              <span class="h-px flex-1 bg-line"></span>
              <Link :href="`/category/${b.category.slug}`"
                    class="shrink-0 text-[13px] font-semibold text-ink-muted hover:text-ink">
                Xem tất cả →
              </Link>
            </div>

            <div class="grid gap-x-6 gap-y-5 md:grid-cols-2">
              <Link v-for="a in b.articles" :key="a.id" :href="`/news/${a.slug}`"
                    class="group flex gap-3">
                <Thumb :src="a.image_url" :alt="a.title" ratio="h-[64px] w-[96px]"
                       rounded="rounded-lg" class="shrink-0" />
                <span class="min-w-0 flex-1">
                  <span class="block text-[14px] font-semibold leading-snug clamp-3
                               transition group-hover:text-accent-ink">{{ a.title }}</span>
                  <span class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1
                               text-[11.5px] text-ink-muted">
                    <span>{{ a.source }} · {{ fmtAgo(a.published_at) }}</span>
                    <Stats :article="a" />
                  </span>
                </span>
              </Link>
            </div>
          </section>
        </div>

        <!-- Cột 30%: bám theo khi cuộn để tin hot luôn trong tầm mắt -->
        <div class="min-w-0 lg:sticky lg:top-[72px] lg:self-start">
          <Sidebar :sidebar="sidebar" />
        </div>
      </div>

      <p v-if="!slider.length && !latest.length && !blocks.length"
         class="py-20 text-center text-ink-muted">
        Chưa có tin nào. Chạy dây chuyền để lấy tin về.
      </p>
    </div>
  </PublicLayout>
</template>
