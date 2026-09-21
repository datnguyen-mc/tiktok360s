<script setup>
/*
 * Thời lượng video theo ngày: thực tế so với ước lượng.
 *
 * Hai chuỗi nên luôn có chú giải, đồng thời gắn nhãn trực tiếp ở điểm cuối —
 * người xem không phải dựa vào màu để phân biệt. Dải mục tiêu vẽ mờ phía sau
 * để thấy ngay video nào rơi ra ngoài khung 90–120 giây.
 */
import { computed, ref } from 'vue'
import { fmtDateShort, fmtDuration } from '../format'

const props = defineProps({
  data:    { type: Array, required: true },   // [{ date, actual, estimated }]
  min:     { type: Number, default: 90 },
  max:     { type: Number, default: 120 },
  height:  { type: Number, default: 260 },
})

const W = 760
const PAD = { top: 16, right: 94, bottom: 28, left: 44 }   // chừa chỗ cho nhãn cuối đường

const showTable = ref(false)
const hover = ref(null)

const inner = computed(() => ({
  w: W - PAD.left - PAD.right,
  h: props.height - PAD.top - PAD.bottom,
}))

const bounds = computed(() => {
  const vals = props.data.flatMap((d) => [d.actual, d.estimated]).filter((v) => v != null)
  const lo = Math.min(props.min, ...vals)
  const hi = Math.max(props.max, ...vals)
  const pad = Math.max(6, (hi - lo) * 0.12)
  return { lo: Math.max(0, lo - pad), hi: hi + pad }
})

const x = (i) =>
  PAD.left + (props.data.length <= 1 ? inner.value.w / 2 : (i / (props.data.length - 1)) * inner.value.w)

const y = (v) => {
  const { lo, hi } = bounds.value
  return PAD.top + inner.value.h - ((v - lo) / (hi - lo)) * inner.value.h
}

const path = (key) => {
  const pts = props.data.map((d, i) => (d[key] == null ? null : `${x(i)},${y(d[key])}`)).filter(Boolean)
  return pts.length ? 'M' + pts.join(' L') : ''
}

const ticks = computed(() => {
  const { lo, hi } = bounds.value
  const step = (hi - lo) / 3
  return [0, 1, 2, 3].map((i) => Math.round(lo + step * i))
})

// Trục ngày chỉ hiện tối đa 6 mốc, tránh chữ chồng lên nhau
const dateTicks = computed(() => {
  const n = props.data.length
  if (!n) return []
  const every = Math.max(1, Math.ceil(n / 6))
  return props.data.map((d, i) => ({ i, d })).filter(({ i }) => i % every === 0 || i === n - 1)
})

const last = computed(() => props.data[props.data.length - 1] || null)

/* Hai điểm cuối sát nhau thì nhãn sẽ chồng lên nhau — đẩy chúng ra hai phía. */
const endLabels = computed(() => {
  const d = last.value
  if (!d) return null
  const ya = y(d.actual)
  const ye = d.estimated != null ? y(d.estimated) : null
  if (ye == null) return { actual: ya, estimated: null }
  const gap = 13
  if (Math.abs(ya - ye) >= gap) return { actual: ya, estimated: ye }
  const mid = (ya + ye) / 2
  return ya <= ye
    ? { actual: mid - gap / 2, estimated: mid + gap / 2 }
    : { actual: mid + gap / 2, estimated: mid - gap / 2 }
})

function onMove(e) {
  if (!props.data.length) return
  const rect = e.currentTarget.getBoundingClientRect()
  const px = ((e.clientX - rect.left) / rect.width) * W
  const ratio = (px - PAD.left) / inner.value.w
  const i = Math.max(0, Math.min(props.data.length - 1, Math.round(ratio * (props.data.length - 1))))
  hover.value = { i, d: props.data[i] }
}
</script>

<template>
  <div>
    <div class="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
      <!-- Chú giải: chấm màu đứng cạnh chữ, chữ vẫn dùng màu mực -->
      <span class="flex items-center gap-1.5 text-xs text-ink-2">
        <span class="size-2.5 rounded-full" style="background: var(--color-series-1)"></span>
        Thực tế
      </span>
      <span class="flex items-center gap-1.5 text-xs text-ink-2">
        <span class="size-2.5 rounded-full" style="background: var(--color-series-2)"></span>
        Ước lượng
      </span>
      <span class="flex items-center gap-1.5 text-xs text-ink-muted">
        <span class="h-2.5 w-4 rounded-sm bg-white/[0.07]"></span>
        Khung mục tiêu {{ min }}–{{ max }}s
      </span>
      <button class="btn btn-ghost ml-auto !py-1 !text-xs" @click="showTable = !showTable">
        {{ showTable ? 'Xem biểu đồ' : 'Xem dạng bảng' }}
      </button>
    </div>

    <div v-if="!data.length" class="grid h-40 place-items-center text-sm text-ink-muted">
      Chưa có dữ liệu
    </div>

    <table v-else-if="showTable" class="w-full text-sm">
      <thead class="text-left text-xs text-ink-muted">
        <tr class="border-b border-line">
          <th class="py-2 font-semibold">Ngày</th>
          <th class="py-2 text-right font-semibold">Thực tế</th>
          <th class="py-2 text-right font-semibold">Ước lượng</th>
          <th class="py-2 text-right font-semibold">Lệch</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in [...data].reverse()" :key="d.date" class="border-b border-line/60">
          <td class="py-1.5 text-ink-2">{{ fmtDateShort(d.date) }}</td>
          <td class="tnum py-1.5 text-right">{{ d.actual?.toFixed(1) }}s</td>
          <td class="tnum py-1.5 text-right text-ink-2">{{ d.estimated?.toFixed(1) ?? '—' }}s</td>
          <td class="tnum py-1.5 text-right text-ink-2">
            {{ d.estimated != null ? (d.actual - d.estimated >= 0 ? '+' : '') + (d.actual - d.estimated).toFixed(1) + 's' : '—' }}
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="relative">
      <svg :viewBox="`0 0 ${W} ${height}`" class="w-full" @mousemove="onMove" @mouseleave="hover = null">
        <!-- Dải mục tiêu -->
        <rect :x="PAD.left" :y="y(max)" :width="inner.w" :height="Math.max(0, y(min) - y(max))"
              fill="rgba(255,255,255,0.05)" />

        <!-- Lưới mảnh, lùi về sau -->
        <g stroke="var(--color-line)" stroke-width="1">
          <line v-for="t in ticks" :key="t" :x1="PAD.left" :x2="PAD.left + inner.w" :y1="y(t)" :y2="y(t)" />
        </g>
        <text v-for="t in ticks" :key="`l${t}`" :x="PAD.left - 8" :y="y(t) + 4"
              text-anchor="end" font-size="11" fill="var(--color-ink-muted)" class="tnum">{{ t }}s</text>

        <text v-for="t in dateTicks" :key="`d${t.i}`" :x="x(t.i)" :y="height - 8"
              text-anchor="middle" font-size="11" fill="var(--color-ink-muted)">
          {{ fmtDateShort(t.d.date) }}
        </text>

        <!-- Đường: 2px, ước lượng vẽ trước để thực tế nổi lên trên -->
        <path :d="path('estimated')" fill="none" stroke="var(--color-series-2)"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.85" />
        <path :d="path('actual')" fill="none" stroke="var(--color-series-1)"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Nhãn trực tiếp ở điểm cuối, để không phải dò chú giải -->
        <template v-if="last">
          <circle :cx="x(data.length - 1)" :cy="y(last.actual)" r="4"
                  fill="var(--color-series-1)" stroke="var(--color-surface)" stroke-width="2" />
          <text :x="x(data.length - 1) + 10" :y="endLabels.actual + 4"
                font-size="11" font-weight="600" fill="var(--color-ink-2)">Thực tế</text>
          <template v-if="last.estimated != null">
            <circle :cx="x(data.length - 1)" :cy="y(last.estimated)" r="4"
                    fill="var(--color-series-2)" stroke="var(--color-surface)" stroke-width="2" />
            <text :x="x(data.length - 1) + 10" :y="endLabels.estimated + 4"
                  font-size="11" font-weight="600" fill="var(--color-ink-2)">Ước lượng</text>
          </template>
        </template>

        <!-- Lớp hover -->
        <template v-if="hover">
          <line :x1="x(hover.i)" :x2="x(hover.i)" :y1="PAD.top" :y2="PAD.top + inner.h"
                stroke="var(--color-line-strong)" stroke-width="1" />
          <circle :cx="x(hover.i)" :cy="y(hover.d.actual)" r="5"
                  fill="var(--color-series-1)" stroke="var(--color-surface)" stroke-width="2" />
          <circle v-if="hover.d.estimated != null" :cx="x(hover.i)" :cy="y(hover.d.estimated)" r="5"
                  fill="var(--color-series-2)" stroke="var(--color-surface)" stroke-width="2" />
        </template>
      </svg>

      <div v-if="hover"
           class="pointer-events-none absolute top-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs shadow-xl"
           :style="{ left: `calc(${(x(hover.i) / W) * 100}% + ${x(hover.i) / W > 0.6 ? '-140px' : '12px'})` }">
        <div class="mb-1 font-semibold">{{ fmtDateShort(hover.d.date) }}</div>
        <div class="flex items-center gap-2 text-ink-2">
          <span class="size-2 rounded-full" style="background: var(--color-series-1)"></span>
          Thực tế <span class="tnum ml-auto font-semibold text-ink">{{ fmtDuration(hover.d.actual) }}</span>
        </div>
        <div v-if="hover.d.estimated != null" class="flex items-center gap-2 text-ink-2">
          <span class="size-2 rounded-full" style="background: var(--color-series-2)"></span>
          Ước lượng <span class="tnum ml-auto font-semibold text-ink">{{ fmtDuration(hover.d.estimated) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
