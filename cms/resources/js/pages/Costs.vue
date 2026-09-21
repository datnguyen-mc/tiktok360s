<script setup>
/*
 * Lịch sử chi phí gọi API sinh cảnh (Veo / Kling).
 *
 * Trang này trả lời bốn câu hỏi, theo đúng thứ tự người ta hỏi:
 *   1. Đang tiêu bao nhiêu?            → ô số ở đầu trang
 *   2. Model nào ăn tiền nhất?         → bảng theo model, dùng lại BarChart
 *   3. Ngày nào nhảy vọt?              → cột theo ngày
 *   4. Vì sao lần gọi đó hỏng?         → danh sách từng lần gọi, xem được prompt
 *
 * Tỉ lệ hỏng được đặt ngang hàng với tiền: gọi hỏng không mất tiền nhưng mất
 * cảnh, video phải lùi về ảnh báo — tức trả tiền Veo mà ra sản phẩm như miễn phí.
 */
import { computed, onMounted, ref, watch } from 'vue'
import http, { errorMessage } from '../api'
import BarChart from '../components/BarChart.vue'
import EmptyState from '../components/EmptyState.vue'
import StatusPill from '../components/StatusPill.vue'
import Toast from '../components/Toast.vue'
import { fmtDate, fmtDateShort, fmtTime } from '../format'

const data = ref(null)
const loading = ref(true)
const page = ref(1)
const expanded = ref(null)         // id lần gọi đang mở prompt
const toast = ref({ message: '', tone: 'good' })
const filters = ref({ provider: '', model: '', status: '', from: '', to: '' })

const usd = (n) => '$' + Number(n || 0).toLocaleString('en-US',
  { minimumFractionDigits: 2, maximumFractionDigits: 2 })

async function load() {
  loading.value = true
  try {
    data.value = (await http.get('generation-costs', {
      params: { ...filters.value, page: page.value },
    })).data
  } catch (e) {
    toast.value = { message: errorMessage(e), tone: 'critical' }
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(filters, () => { page.value = 1; load() }, { deep: true })
watch(page, load)

// BarChart nhận {source, total} — gộp provider + model thành một nhãn đọc được.
const modelBars = computed(() => (data.value?.by_model || []).map((r) => ({
  source: `${r.provider}/${(r.model || '—').replace(/-generate-preview$/, '')}`,
  total: Math.round(Number(r.cost) * 100) / 100,
})))

const dayMax = computed(() =>
  Math.max(0.01, ...(data.value?.by_day || []).map((d) => Number(d.cost))))

const summary = computed(() => data.value?.summary || {})
const calls = computed(() => data.value?.calls || { data: [], last_page: 1, total: 0 })

function reset() {
  filters.value = { provider: '', model: '', status: '', from: '', to: '' }
}
</script>

<template>
  <div class="space-y-4">
    <div class="card p-5">
      <h2 class="text-sm font-bold">Chi phí sinh cảnh AI</h2>
      <p class="mt-1 text-xs leading-relaxed text-ink-muted">
        Mỗi lần dây chuyền gọi Veo hoặc Kling đều ghi lại một dòng ở đây, kèm cả lần
        thất bại. Lịch sử này <strong>không mất khi xoá video</strong> — tiền đã chi thì
        vẫn phải còn trong sổ.
      </p>
    </div>

    <div v-if="loading && !data" class="card grid h-40 place-items-center text-sm text-ink-muted">
      Đang tải…
    </div>

    <template v-else-if="summary.calls">
      <!-- Ô số tổng -->
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div class="card p-5">
          <p class="text-[11px] uppercase tracking-wide text-ink-muted">Hôm nay</p>
          <p class="tnum mt-1 text-2xl font-bold">{{ usd(summary.cost_today) }}</p>
        </div>
        <div class="card p-5">
          <p class="text-[11px] uppercase tracking-wide text-ink-muted">30 ngày qua</p>
          <p class="tnum mt-1 text-2xl font-bold">{{ usd(summary.cost_30d) }}</p>
          <p class="mt-0.5 text-[11px] text-ink-muted">nhịp này là {{ usd(summary.projected_month) }}/tháng</p>
        </div>
        <div class="card p-5">
          <p class="text-[11px] uppercase tracking-wide text-ink-muted">Tổng từ đầu</p>
          <p class="tnum mt-1 text-2xl font-bold">{{ usd(summary.cost_all) }}</p>
          <p class="mt-0.5 text-[11px] text-ink-muted">{{ summary.calls }} lần gọi</p>
        </div>
        <div class="card p-5">
          <p class="text-[11px] uppercase tracking-wide text-ink-muted">Gọi hỏng</p>
          <p class="tnum mt-1 text-2xl font-bold"
             :style="{ color: summary.failed_rate > 20 ? 'var(--color-warning)' : 'var(--color-ink)' }">
            {{ summary.failed_rate }}%
          </p>
          <p class="mt-0.5 text-[11px] text-ink-muted">
            {{ summary.failed }} lần — không mất tiền, nhưng mất cảnh
          </p>
        </div>
      </div>

      <div class="grid gap-3 lg:grid-cols-2">
        <!-- Theo model -->
        <section class="card p-5">
          <h3 class="text-sm font-bold">Chi phí theo model</h3>
          <p class="mt-0.5 mb-4 text-[11px] text-ink-muted">đơn vị: USD</p>
          <BarChart :data="modelBars" :limit="8" />
          <table v-if="data.by_model.length" class="mt-4 w-full text-[12px]">
            <thead>
              <tr class="border-b border-line text-left text-[10px] uppercase tracking-wide text-ink-muted">
                <th class="py-2 font-semibold">Model</th>
                <th class="py-2 text-right font-semibold">Lần gọi</th>
                <th class="py-2 text-right font-semibold">Hỏng</th>
                <th class="py-2 text-right font-semibold">Giây</th>
                <th class="py-2 text-right font-semibold">Tiền</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              <tr v-for="r in data.by_model" :key="`${r.provider}-${r.model}`">
                <td class="max-w-[200px] truncate py-2">{{ r.provider }}/{{ r.model || '—' }}</td>
                <td class="tnum py-2 text-right">{{ r.calls }}</td>
                <td class="tnum py-2 text-right"
                    :style="{ color: Number(r.failed) ? 'var(--color-warning)' : 'var(--color-ink-muted)' }">
                  {{ r.failed }}
                </td>
                <td class="tnum py-2 text-right text-ink-2">{{ r.seconds }}s</td>
                <td class="tnum py-2 text-right font-semibold">{{ usd(r.cost) }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Theo ngày -->
        <section class="card p-5">
          <h3 class="text-sm font-bold">30 ngày gần nhất</h3>
          <p class="mt-0.5 mb-4 text-[11px] text-ink-muted">đơn vị: USD mỗi ngày</p>

          <div v-if="!data.by_day.length" class="grid h-40 place-items-center text-sm text-ink-muted">
            Chưa có dữ liệu
          </div>
          <div v-else class="flex h-40 items-end gap-1.5">
            <span v-for="d in data.by_day" :key="d.d"
                  class="group relative flex-1 rounded-t transition-opacity hover:opacity-80"
                  :style="{ height: `${Math.max(3, (Number(d.cost) / dayMax) * 100)}%`,
                            background: 'var(--color-series-1)' }"
                  :title="`${fmtDate(d.d)} · ${usd(d.cost)} · ${d.calls} lần gọi`">
            </span>
          </div>
          <div v-if="data.by_day.length" class="mt-2 flex justify-between text-[10px] text-ink-muted">
            <span>{{ fmtDateShort(data.by_day[0].d) }}</span>
            <span>{{ fmtDateShort(data.by_day[data.by_day.length - 1].d) }}</span>
          </div>
        </section>
      </div>

      <!-- Từng lần gọi -->
      <div class="card overflow-hidden">
        <div class="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3">
          <h3 class="mr-auto text-sm font-bold">Từng lần gọi</h3>
          <select v-model="filters.provider" class="input !py-1.5 !text-xs">
            <option value="">Mọi nhà cung cấp</option>
            <option v-for="p in data.providers" :key="p" :value="p">{{ p }}</option>
          </select>
          <select v-model="filters.model" class="input !py-1.5 !text-xs">
            <option value="">Mọi model</option>
            <option v-for="m in data.models" :key="m" :value="m">{{ m }}</option>
          </select>
          <select v-model="filters.status" class="input !py-1.5 !text-xs">
            <option value="">Mọi trạng thái</option>
            <option value="success">Thành công</option>
            <option value="failed">Thất bại</option>
          </select>
          <input v-model="filters.from" type="date" class="input !py-1.5 !text-xs" />
          <input v-model="filters.to" type="date" class="input !py-1.5 !text-xs" />
          <button class="btn !py-1.5 !text-xs" @click="reset">Bỏ lọc</button>
        </div>

        <EmptyState v-if="!calls.data.length" title="Không có lần gọi nào khớp bộ lọc"
                    hint="Thử bỏ lọc, hoặc nới khoảng ngày." />

        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-muted">
              <th class="px-5 py-3 font-semibold">Thời điểm</th>
              <th class="px-3 py-3 font-semibold">Video</th>
              <th class="px-3 py-3 font-semibold">Model</th>
              <th class="px-3 py-3 text-right font-semibold">Cảnh</th>
              <th class="px-3 py-3 text-right font-semibold">Giây</th>
              <th class="px-3 py-3 text-right font-semibold">Tiền</th>
              <th class="px-5 py-3 font-semibold">Kết quả</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line">
            <template v-for="c in calls.data" :key="c.id">
              <tr class="cursor-pointer transition hover:bg-surface-2"
                  @click="expanded = expanded === c.id ? null : c.id">
                <td class="tnum px-5 py-2.5 text-[12px] text-ink-2">{{ fmtTime(c.created_at) }}</td>
                <td class="px-3 py-2.5">
                  <RouterLink v-if="c.run" :to="`/videos/${c.run.id}`" class="hover:underline"
                              @click.stop>
                    <span class="block max-w-[200px] truncate text-[12px]">{{ c.run.title || '—' }}</span>
                  </RouterLink>
                  <span v-else class="text-[12px] text-ink-muted">
                    {{ c.run_title || '—' }}
                    <span class="text-[10px]">(đã xoá)</span>
                  </span>
                </td>
                <td class="px-3 py-2.5 text-[12px] text-ink-2">
                  <span class="max-w-[170px] truncate">{{ c.provider }}/{{ c.model || '—' }}</span>
                </td>
                <td class="tnum px-3 py-2.5 text-right text-[12px]">{{ c.scene_index ?? '—' }}</td>
                <td class="tnum px-3 py-2.5 text-right text-[12px] text-ink-2">{{ c.seconds ?? '—' }}s</td>
                <td class="tnum px-3 py-2.5 text-right font-semibold">{{ usd(c.cost_usd) }}</td>
                <td class="px-5 py-2.5">
                  <StatusPill :label="c.status === 'failed' ? 'Thất bại' : 'Thành công'"
                              :tone="c.status === 'failed' ? 'critical' : 'good'" />
                </td>
              </tr>
              <!-- Mở ra để đọc prompt và lý do hỏng: prompt là thứ duy nhất
                   sửa được khi một cảnh cứ hỏng mãi. -->
              <tr v-if="expanded === c.id">
                <td colspan="7" class="bg-surface-2 px-5 py-3">
                  <p v-if="c.error_message" class="mb-2 text-[12px]" style="color:#f08d8d">
                    {{ c.error_message }}
                  </p>
                  <p class="mb-1 text-[10px] uppercase tracking-wide text-ink-muted">Prompt đã gửi</p>
                  <pre class="whitespace-pre-wrap text-[12px] leading-relaxed text-ink-2">{{ c.prompt || '—' }}</pre>
                  <p v-if="c.cost_per_second" class="mt-2 text-[11px] text-ink-muted">
                    Đơn giá {{ usd(c.cost_per_second) }}/giây
                    <span v-if="c.resolution">· {{ c.resolution }}</span>
                    <span v-if="c.engine">· engine “{{ c.engine.name }}”</span>
                  </p>
                </td>
              </tr>
            </template>
          </tbody>
        </table>

        <div v-if="calls.last_page > 1"
             class="flex items-center justify-between border-t border-line px-5 py-3">
          <span class="text-xs text-ink-muted">
            Trang {{ calls.current_page }} / {{ calls.last_page }} · {{ calls.total }} lần gọi
          </span>
          <span class="flex gap-2">
            <button class="btn !py-1.5 !text-xs" :disabled="page <= 1" @click="page--">Trước</button>
            <button class="btn !py-1.5 !text-xs" :disabled="page >= calls.last_page" @click="page++">Sau</button>
          </span>
        </div>
      </div>
    </template>

    <EmptyState v-else title="Chưa có lần gọi API nào"
                hint="Bật một engine Veo hoặc Kling trong mục Engine tạo video, rồi tạo một video — mỗi clip sinh ra sẽ ghi một dòng ở đây." />

    <Toast :message="toast.message" :tone="toast.tone" @close="toast.message = ''" />
  </div>
</template>
