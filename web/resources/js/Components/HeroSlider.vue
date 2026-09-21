<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Link } from '@inertiajs/vue3'
import { fmtAgo } from '../format'

const props = defineProps({
  slides: { type: Array, default: () => [] },
  interval: { type: Number, default: 6000 },
})

const i = ref(0)
const paused = ref(false)
const n = computed(() => props.slides.length)

let timer = null

function go(k) {
  if (!n.value) return
  i.value = (k + n.value) % n.value
  restart()
}
const next = () => go(i.value + 1)
const prev = () => go(i.value - 1)

function restart() {
  clearInterval(timer)
  if (n.value < 2) return
  timer = setInterval(() => { if (!paused.value) i.value = (i.value + 1) % n.value }, props.interval)
}

// Vuốt ngang trên điện thoại. Chỉ tính là vuốt khi đi ngang rõ hơn đi dọc,
// nếu không thì người dùng cuộn trang cũng vô tình lật ảnh.
let x0 = null, y0 = null
function down(e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY }
function up(e) {
  if (x0 === null) return
  const dx = e.changedTouches[0].clientX - x0
  const dy = e.changedTouches[0].clientY - y0
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? next() : prev()
  x0 = y0 = null
}

onMounted(() => {
  // Người tắt hiệu ứng thì không tự chạy — họ tự bấm mũi tên.
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) restart()
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <section v-if="n" class="relative h-full overflow-hidden rounded-2xl bg-ink"
           aria-roledescription="băng chuyền" aria-label="Tin nổi bật"
           @mouseenter="paused = true" @mouseleave="paused = false"
           @touchstart.passive="down" @touchend.passive="up">

    <!-- Dải ảnh trượt ngang -->
    <div class="flex h-full transition-transform duration-500 ease-out"
         :style="{ transform: `translateX(-${i * 100}%)` }">
      <article v-for="(a, k) in slides" :key="a.id"
               class="relative h-full w-full shrink-0" :aria-hidden="k !== i">
        <Link :href="`/news/${a.slug}`" class="block h-full">
          <!-- Điện thoại thì theo tỉ lệ ảnh; máy tính thì cao bằng cột bên cạnh
               để hai cột kết thúc cùng một đường ngang, không hở mảng đen. -->
          <div class="aspect-[16/10] w-full lg:aspect-auto lg:h-full">
            <img v-if="a.image_url" :src="a.image_url" :alt="a.title"
                 class="size-full object-cover"
                 :loading="k === 0 ? 'eager' : 'lazy'"
                 :fetchpriority="k === 0 ? 'high' : 'auto'" decoding="async" />
            <div v-else class="size-full bg-surface-2"></div>
          </div>

          <!-- Lớp phủ tối dần từ dưới lên để chữ trắng luôn đọc được, dù ảnh sáng -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>

          <div class="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <div class="flex flex-wrap items-center gap-2 text-[11.5px] font-semibold text-white/85">
              <span v-if="a.category" class="rounded px-2 py-0.5 font-bold text-white"
                    :style="{ background: a.category.color || '#FE2C55' }">
                {{ a.category.name }}
              </span>
              <span v-if="a.source">{{ a.source }}</span>
              <span v-if="a.published_at">· {{ fmtAgo(a.published_at) }}</span>
            </div>

            <h2 class="mt-2 max-w-2xl text-[19px] font-extrabold leading-tight tracking-tight
                       text-white clamp-3 sm:text-[24px]">
              {{ a.title }}
            </h2>

            <p v-if="a.excerpt" class="mt-1.5 hidden max-w-xl text-[13px] leading-relaxed
                                       text-white/80 clamp-2 sm:block">
              {{ a.excerpt }}
            </p>
          </div>
        </Link>
      </article>
    </div>

    <!-- Mũi tên: ẩn trên điện thoại vì đã vuốt được -->
    <button v-if="n > 1" class="nav-arrow left-3" aria-label="Tin trước" @click="prev">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="size-5">
        <path d="m15 18-6-6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <button v-if="n > 1" class="nav-arrow right-3" aria-label="Tin sau" @click="next">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="size-5">
        <path d="m9 6 6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <!-- Chấm chỉ vị trí: chấm đang xem kéo dài ra thành gạch -->
    <div v-if="n > 1" class="absolute right-4 top-4 flex gap-1.5">
      <button v-for="(a, k) in slides" :key="a.id"
              class="h-1.5 rounded-full transition-all"
              :class="k === i ? 'w-6 bg-accent' : 'w-1.5 bg-white/50 hover:bg-white/80'"
              :aria-label="`Tin ${k + 1}`" :aria-current="k === i" @click="go(k)"></button>
    </div>
  </section>
</template>

<style scoped>
.nav-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  display: none; place-items: center;
  width: 2.25rem; height: 2.25rem; border-radius: 999px;
  color: #fff; background: rgba(0, 0, 0, .45);
  backdrop-filter: blur(4px);
  transition: background .15s;
  cursor: pointer;
}
.nav-arrow:hover { background: rgba(0, 0, 0, .7); }
@media (min-width: 640px) { .nav-arrow { display: grid; } }
</style>
