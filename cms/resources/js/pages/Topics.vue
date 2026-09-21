<script setup>
/*
 * Quản lý chủ đề. Mỗi chủ đề là một file topics/<slug>.json của dây chuyền —
 * trang này sửa thẳng file đó, có sao lưu bản cũ trước mỗi lần ghi.
 *
 * Danh sách từ khoá dùng ô nhập nhiều dòng (mỗi dòng một từ) thay vì chip:
 * bóng đá có hơn 50 từ khoá bắt buộc, dạng chip sẽ không đọc nổi.
 */
import { computed, onMounted, ref } from 'vue'
import http, { errorMessage } from '../api'
import EmptyState from '../components/EmptyState.vue'
import StatusPill from '../components/StatusPill.vue'
import Toast from '../components/Toast.vue'
import { fmtDate } from '../format'

const topics = ref([])
const dir = ref('')
const loading = ref(true)
const busy = ref(false)
const toast = ref({ message: '', tone: 'good' })

const editing = ref(null)     // { slug, data }
const tab = ref('nhan-dien')
const adding = ref(null)      // { slug, name, from }

const lines = (arr) => (arr || []).join('\n')
const toArr = (text) => (text || '').split('\n').map((s) => s.trim()).filter(Boolean)

async function load() {
  loading.value = true
  try {
    const d = (await http.get('topics')).data
    topics.value = d.topics
    dir.value = d.dir
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function edit(slug) {
  busy.value = true
  try {
    const d = (await http.get(`topics/${slug}`)).data
    const data = ensureVoice(d.data)
    editing.value = {
      slug,
      data,
      // Bản nháp dạng text cho các ô nhiều dòng
      draft: {
        require: lines(data.ranking?.require_keywords),
        exclude: lines(data.ranking?.exclude_keywords),
        hot:     lines(data.ranking?.hot_keywords),
        block:   lines(data.ranking?.block_keywords),
        hashtags: lines(data.hashtags),
        khong_pha_tro: lines(data.khong_pha_tro),
      },
    }
    tab.value = 'nhan-dien'
  } catch (e) {
    toast.value = { message: errorMessage(e), tone: 'critical' }
  } finally {
    busy.value = false
  }
}

const styleNames = computed(() => Object.keys(editing.value?.data?.styles || {}))

function addSource() {
  editing.value.data.sources.push({ name: '', url: '', weight: 1 })
}

function removeSource(i) {
  editing.value.data.sources.splice(i, 1)
}

async function save() {
  busy.value = true
  try {
    const d = editing.value.data
    const k = editing.value.draft
    d.ranking = {
      ...d.ranking,
      require_keywords: toArr(k.require),
      exclude_keywords: toArr(k.exclude),
      hot_keywords: toArr(k.hot),
      block_keywords: toArr(k.block),
    }
    d.hashtags = toArr(k.hashtags)
    if (k.khong_pha_tro.trim()) d.khong_pha_tro = toArr(k.khong_pha_tro)

    await http.put(`topics/${editing.value.slug}`, { data: d })
    editing.value = null
    await load()
    toast.value = { message: 'Đã lưu chủ đề', tone: 'good' }
  } catch (e) {
    toast.value = { message: errorMessage(e), tone: 'critical' }
  } finally {
    busy.value = false
  }
}

async function create() {
  busy.value = true
  try {
    const res = (await http.post('topics', adding.value)).data
    adding.value = null
    await load()
    toast.value = { message: 'Đã tạo chủ đề — sửa nguồn tin và từ khoá cho đúng', tone: 'good' }
    edit(res.slug)
  } catch (e) {
    toast.value = { message: errorMessage(e), tone: 'critical' }
  } finally {
    busy.value = false
  }
}

async function remove(t) {
  if (!confirm(`Xoá chủ đề “${t.name}”? File được chuyển vào topics/.backup/, không mất hẳn.`)) return
  try {
    await http.delete(`topics/${t.slug}`)
    await load()
    toast.value = { message: 'Đã xoá (còn bản sao lưu)', tone: 'good' }
  } catch (e) {
    toast.value = { message: errorMessage(e), tone: 'critical' }
  }
}

const TABS = [
  ['nhan-dien', 'Nhận diện'],
  ['giong-doc', 'Giọng đọc'],
  ['nguon-tin', 'Nguồn tin'],
  ['tu-khoa', 'Từ khoá'],
  ['giong-van', 'Giọng văn'],
]

// Hai giọng tiếng Việt duy nhất của edge-tts
const VOICES = [
  { id: 'vi-VN-HoaiMyNeural',  label: 'Hoài My — nữ' },
  { id: 'vi-VN-NamMinhNeural', label: 'Nam Minh — nam' },
]

/** Bảo đảm chủ đề có khối voice để ràng buộc v-model không lỗi. */
function ensureVoice(d) {
  d.voice ??= { id: 'vi-VN-HoaiMyNeural', rate: '+25%', pitch: '+0Hz', volume: '+0%' }
  d.voice.rate ??= '+25%'
  d.voice.pitch ??= '+0Hz'
  d.voice.volume ??= '+0%'
  return d
}

/** "+25%" <-> 25, để dùng được thanh trượt. */
const num = (v) => parseInt(String(v || '0').replace(/[^0-9-]/g, ''), 10) || 0
const pct = (n) => `${n >= 0 ? '+' : ''}${n}%`
const hz  = (n) => `${n >= 0 ? '+' : ''}${n}Hz`
</script>

<template>
  <div class="space-y-4">
    <div class="card flex flex-wrap items-center gap-4 p-5">
      <div class="min-w-[240px] flex-1">
        <h2 class="text-sm font-bold">Chủ đề kênh</h2>
        <p class="mt-1 text-xs leading-relaxed text-ink-muted">
          Mỗi chủ đề có nguồn tin, từ khoá và giọng văn riêng — chạy độc lập, ra video riêng.
          Sửa ở đây là sửa thẳng file trong
          <code class="text-ink-2">{{ dir }}</code>, có sao lưu bản cũ mỗi lần ghi.
        </p>
      </div>
      <button class="btn btn-primary" @click="adding = { slug: '', name: '', from: topics[0]?.slug }">
        Thêm chủ đề
      </button>
    </div>

    <div class="card overflow-hidden">
      <div v-if="loading" class="grid h-40 place-items-center text-sm text-ink-muted">Đang tải…</div>

      <EmptyState v-else-if="!topics.length" title="Chưa có chủ đề nào"
                  hint="Thư mục topics/ đang trống. Kiểm tra PIPELINE_ROOT trong .env." />

      <table v-else class="w-full text-sm">
        <thead>
          <tr class="border-b border-line text-left text-[11px] uppercase tracking-wide text-ink-muted">
            <th class="px-5 py-3 font-semibold">Chủ đề</th>
            <th class="px-3 py-3 font-semibold">Nhãn trên video</th>
            <th class="px-3 py-3 text-right font-semibold">Nguồn tin</th>
            <th class="px-3 py-3 font-semibold">Giọng đọc</th>
            <th class="px-3 py-3 font-semibold">Giọng văn</th>
            <th class="px-3 py-3 font-semibold">Video gần nhất</th>
            <th class="px-3 py-3 font-semibold">Trạng thái</th>
            <th class="px-5 py-3 text-right font-semibold">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line">
          <tr v-for="t in topics" :key="t.slug" class="transition hover:bg-surface-2">
            <td class="px-5 py-2.5">
              <span class="flex items-center gap-3">
                <span class="grid size-9 shrink-0 place-items-center rounded-lg text-xs font-bold text-white"
                      :style="{ background: t.brand?.accent || '#3A3A48' }">
                  {{ (t.name || '?').slice(0, 1).toUpperCase() }}
                </span>
                <span class="min-w-0">
                  <span class="block max-w-[220px] truncate font-semibold">{{ t.name }}</span>
                  <span class="block font-mono text-[11px] text-ink-muted">topics/{{ t.slug }}.json</span>
                </span>
              </span>
            </td>

            <!-- File JSON hỏng thì mọi cột sau đều không đọc được, gộp thành một
                 ô báo lỗi thay vì in ra một hàng toàn dấu gạch. -->
            <td v-if="t.broken" colspan="5" class="px-3 py-2.5 text-[12px]" style="color:#f08d8d">
              File JSON sai cú pháp — sửa tay trong topics/{{ t.slug }}.json rồi tải lại.
            </td>
            <template v-else>
              <td class="max-w-[200px] truncate px-3 py-2.5 text-ink-2">{{ t.brand?.name }}</td>
              <td class="tnum px-3 py-2.5 text-right">
                {{ t.sources }}
                <span v-if="t.has_filter" class="text-ink-muted" title="Có lọc chủ đề">·</span>
              </td>
              <td class="px-3 py-2.5 text-ink-2">
                {{ t.voice?.id?.includes('NamMinh') ? 'Nam' : 'Nữ' }}
                <span class="text-ink-muted">
                  {{ t.voice?.rate && t.voice.rate !== '+0%' ? t.voice.rate : '' }}
                  {{ t.voice?.pitch && t.voice.pitch !== '+0Hz' ? t.voice.pitch : '' }}
                </span>
              </td>
              <td class="px-3 py-2.5 text-ink-2">{{ t.style || '—' }}</td>
              <td class="tnum px-3 py-2.5 text-ink-2">{{ t.last_date ? fmtDate(t.last_date) : '—' }}</td>
            </template>

            <td class="px-3 py-2.5">
              <StatusPill v-if="t.broken" label="File lỗi" tone="critical" />
              <StatusPill v-else-if="t.runs_total" :label="`${t.runs_ok}/${t.runs_total} video`" tone="good" />
              <StatusPill v-else label="Chưa chạy" tone="neutral" />
            </td>

            <td class="px-5 py-2.5">
              <span class="flex justify-end gap-2">
                <RouterLink :to="`/videos?topic=${t.slug}`" class="btn !py-1.5 !text-xs">Xem video</RouterLink>
                <button class="btn !py-1.5 !text-xs" :disabled="t.broken" @click="edit(t.slug)">Sửa</button>
                <button class="btn btn-ghost !py-1.5 !text-xs text-ink-muted" @click="remove(t)">Xoá</button>
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Hộp thoại sửa chủ đề -->
    <Teleport to="body">
      <div v-if="editing" class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-4"
           @click.self="editing = null">
        <div class="card my-6 w-full max-w-2xl p-6">
          <h3 class="text-base font-bold">{{ editing.data.name }}</h3>
          <p class="mt-1 font-mono text-xs text-ink-muted">topics/{{ editing.slug }}.json</p>

          <div class="mt-4 flex gap-1 border-b border-line">
            <button v-for="[id, label] in TABS" :key="id"
                    class="-mb-px border-b-2 px-3 py-2 text-[13px] font-semibold transition"
                    :style="{ borderColor: tab === id ? 'var(--color-accent)' : 'transparent',
                              color: tab === id ? 'var(--color-ink)' : 'var(--color-ink-muted)' }"
                    @click="tab = id">{{ label }}</button>
          </div>

          <!-- Nhận diện -->
          <div v-show="tab === 'nhan-dien'" class="mt-5 space-y-4">
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-1.5">
                <label class="label">Tên chủ đề</label>
                <input v-model="editing.data.name" class="input" />
              </div>
              <div class="space-y-1.5">
                <label class="label">Mô tả</label>
                <input v-model="editing.data.description" class="input" />
              </div>
              <div class="space-y-1.5">
                <label class="label">Nhãn hiện trên video</label>
                <input v-model="editing.data.brand.name" class="input" />
              </div>
              <div class="space-y-1.5">
                <label class="label">@handle</label>
                <input v-model="editing.data.brand.handle" class="input" />
              </div>
              <div class="space-y-1.5">
                <label class="label">Dòng mô tả dưới chân</label>
                <input v-model="editing.data.brand.tagline" class="input" />
              </div>
              <div class="space-y-1.5">
                <label class="label">Màu nhấn</label>
                <div class="flex items-center gap-2">
                  <input v-model="editing.data.brand.accent" type="color" class="h-9 w-12 rounded-lg border border-line bg-transparent" />
                  <input v-model="editing.data.brand.accent" class="input font-mono !text-xs" />
                </div>
                <p class="text-[11px] text-ink-muted">
                  Chữ trên nhãn là chữ trắng in đậm — chọn màu đủ đậm để đọc được.
                </p>
              </div>
            </div>
          </div>

          <!-- Giọng đọc -->
          <div v-show="tab === 'giong-doc'" class="mt-5 space-y-4">
            <div class="space-y-1.5">
              <label class="label">Giọng</label>
              <div class="grid gap-2 sm:grid-cols-2">
                <label v-for="v in VOICES" :key="v.id"
                       class="cursor-pointer rounded-xl border p-3 text-center transition"
                       :style="{ borderColor: editing.data.voice.id === v.id ? 'var(--color-accent)' : 'var(--color-line)',
                                 background: editing.data.voice.id === v.id ? 'var(--color-accent-soft)' : 'transparent' }">
                  <input v-model="editing.data.voice.id" type="radio" :value="v.id" class="sr-only" />
                  <span class="block text-[13px] font-semibold">{{ v.label }}</span>
                  <span class="mt-0.5 block font-mono text-[10px] text-ink-muted">{{ v.id }}</span>
                </label>
              </div>
              <p class="text-[11px] leading-relaxed text-ink-muted">
                edge-tts chỉ có hai giọng tiếng Việt, và <strong class="text-ink-2">không có giọng
                vùng miền</strong> — chất miền Tây đến từ cách dùng từ ở tab Giọng văn.
              </p>
            </div>

            <div class="space-y-1.5">
              <label class="label">
                Cao độ · {{ editing.data.voice.pitch }}
                <span class="font-normal text-ink-muted">(âm càng thấp giọng càng trầm)</span>
              </label>
              <input type="range" min="-30" max="20" step="1" class="w-full accent-[#FF2D55]"
                     :value="num(editing.data.voice.pitch)"
                     @input="editing.data.voice.pitch = hz(+$event.target.value)" />
              <p class="text-[11px] leading-relaxed text-ink-muted">
                Cao độ <strong class="text-ink-2">không ảnh hưởng tốc độ đọc</strong> (đã đo:
                4,12 âm tiết/giây ở mọi mức), nên đổi thoải mái mà không lệch thời lượng video.
              </p>
            </div>

            <div class="space-y-1.5">
              <label class="label">
                Tốc độ · {{ editing.data.voice.rate }}
                <span class="font-normal text-ink-muted">(khoảng +25% là nhanh, có năng lượng)</span>
              </label>
              <input type="range" min="-10" max="50" step="1" class="w-full accent-[#FF2D55]"
                     :value="num(editing.data.voice.rate)"
                     @input="editing.data.voice.rate = pct(+$event.target.value)" />
              <p class="text-[11px] leading-relaxed text-ink-muted">
                Đây là tốc độ khởi điểm. Dây chuyền tự chỉnh trong khoảng cho phép để video
                lọt khung 90–120 giây, nên đặt sai một chút cũng không sao.
              </p>
            </div>

            <p class="rounded-lg px-3 py-2.5 text-[11px] leading-relaxed"
               style="background: rgba(250,178,25,.1); color:#f8cf72">
              Nghe thử giọng của tất cả chủ đề: chạy <code>make voices</code> ở thư mục dây chuyền —
              nó đọc đúng câu mở đầu của từng kênh bằng đúng giọng đã đặt.
            </p>
          </div>

          <!-- Nguồn tin -->
          <div v-show="tab === 'nguon-tin'" class="mt-5 space-y-3">
            <div v-for="(src, i) in editing.data.sources" :key="i"
                 class="grid grid-cols-[1fr_2fr_auto_auto] items-center gap-2">
              <input v-model="src.name" class="input !text-xs" placeholder="Tên báo" />
              <input v-model="src.url" class="input font-mono !text-xs" placeholder="https://…/rss" />
              <input v-model.number="src.weight" type="number" step="0.1" min="0" max="5"
                     class="input tnum !w-16 !text-xs" title="Trọng số ưu tiên" />
              <button class="btn btn-ghost !p-1.5 text-ink-muted" @click="removeSource(i)">✕</button>
            </div>
            <button class="btn !py-1.5 !text-xs" @click="addSource">Thêm nguồn</button>
            <p class="text-[11px] leading-relaxed text-ink-muted">
              Trọng số càng cao thì tin của báo đó càng dễ được chọn. Kiểm tra feed chạy được
              bằng <code>make news TOPIC={{ editing.slug }}</code>.
            </p>
          </div>

          <!-- Từ khoá -->
          <div v-show="tab === 'tu-khoa'" class="mt-5 space-y-4">
            <div class="space-y-1.5">
              <label class="label">Bắt buộc phải có (mỗi dòng một từ)</label>
              <textarea v-model="editing.draft.require" rows="4" class="input resize-y font-mono !text-xs"
                        placeholder="bỏ trống = nhận mọi tin trong feed"></textarea>
              <p class="text-[11px] leading-relaxed text-ink-muted">
                Cần khi chủ đề không có feed riêng. Bóng đá dùng feed “thể thao” chung nên
                phải lọc; showbiz có feed riêng nên để trống.
              </p>
            </div>
            <div class="space-y-1.5">
              <label class="label">Loại trừ (xét trước, thắng mọi từ khoá khác)</label>
              <textarea v-model="editing.draft.exclude" rows="3" class="input resize-y font-mono !text-xs"></textarea>
            </div>
            <div class="space-y-1.5">
              <label class="label">Từ khoá đẩy tin lên cao</label>
              <textarea v-model="editing.draft.hot" rows="4" class="input resize-y font-mono !text-xs"></textarea>
            </div>
            <div class="space-y-1.5">
              <label class="label">Chặn hẳn (tin tang thương, pháp lý…)</label>
              <textarea v-model="editing.draft.block" rows="3" class="input resize-y font-mono !text-xs"></textarea>
            </div>
            <div class="space-y-1.5">
              <label class="label">Không chèn câu đùa (viết KHÔNG DẤU)</label>
              <textarea v-model="editing.draft.khong_pha_tro" rows="3"
                        class="input resize-y font-mono !text-xs"></textarea>
              <p class="text-[11px] text-ink-muted">
                So khớp trên bản đã bỏ dấu, nên phải viết không dấu: <code>qua doi</code>, <code>chan thuong</code>.
              </p>
            </div>
            <div class="space-y-1.5">
              <label class="label">Hashtag mặc định</label>
              <textarea v-model="editing.draft.hashtags" rows="4" class="input resize-y font-mono !text-xs"></textarea>
            </div>
          </div>

          <!-- Giọng văn -->
          <div v-show="tab === 'giong-van'" class="mt-5 space-y-4">
            <div class="space-y-1.5">
              <label class="label">Giọng văn đang dùng</label>
              <select v-model="editing.data.script.style" class="input">
                <option v-for="n in styleNames" :key="n" :value="n">
                  {{ n }} — {{ editing.data.styles[n]?.ten || n }}
                </option>
              </select>
            </div>

            <div v-if="editing.data.styles[editing.data.script.style]" class="space-y-3">
              <div class="space-y-1.5">
                <label class="label">Câu mở đầu (mỗi dòng một câu)</label>
                <textarea rows="5" class="input resize-y !text-xs"
                          :value="editing.data.styles[editing.data.script.style].hooks.join('\n')"
                          @input="editing.data.styles[editing.data.script.style].hooks =
                                  $event.target.value.split('\n').map(s => s.trim()).filter(Boolean)"></textarea>
                <p class="text-[11px] text-ink-muted">
                  Biến dùng được: <code>{n}</code> số tin, <code>{day}</code>, <code>{month}</code>,
                  <code>{dur}</code> độ dài video.
                </p>
              </div>

              <div class="space-y-1.5">
                <label class="label">Câu chốt</label>
                <textarea rows="3" class="input resize-y !text-xs"
                          :value="editing.data.styles[editing.data.script.style].outros.join('\n')"
                          @input="editing.data.styles[editing.data.script.style].outros =
                                  $event.target.value.split('\n').map(s => s.trim()).filter(Boolean)"></textarea>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div class="space-y-1.5">
                  <label class="label">Chữ trên cảnh mở đầu</label>
                  <input v-model="editing.data.styles[editing.data.script.style].tieu_de_intro"
                         class="input !text-xs" />
                </div>
                <div class="space-y-1.5">
                  <label class="label">Chữ trên cảnh chốt</label>
                  <input v-model="editing.data.styles[editing.data.script.style].tieu_de_outro"
                         class="input !text-xs" />
                </div>
              </div>

              <p class="rounded-lg px-3 py-2.5 text-[11px] leading-relaxed"
                 style="background: rgba(250,178,25,.1); color:#f8cf72">
                Câu cảm thán theo nhóm nội dung và bảng phân nhóm từ khoá là phần phức tạp nhất —
                sửa thẳng trong <code>topics/{{ editing.slug }}.json</code>, mục
                <code>styles.{{ editing.data.script.style }}.reactions</code> và <code>nhom_tu_khoa</code>.
              </p>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button class="btn" @click="editing = null">Huỷ</button>
            <button class="btn btn-primary" :disabled="busy" @click="save">
              {{ busy ? 'Đang lưu…' : 'Lưu chủ đề' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Thêm chủ đề -->
      <div v-if="adding" class="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
           @click.self="adding = null">
        <div class="card w-full max-w-md p-6">
          <h3 class="text-base font-bold">Thêm chủ đề</h3>
          <p class="mt-1 text-xs leading-relaxed text-ink-muted">
            Chủ đề mới được chép từ một chủ đề sẵn có để có ngay cấu trúc đầy đủ.
            Sau đó sửa nguồn tin, từ khoá và giọng văn cho đúng.
          </p>

          <div class="mt-5 space-y-4">
            <div class="space-y-1.5">
              <label class="label">Tên</label>
              <input v-model="adding.name" class="input" placeholder="vd: Âm nhạc" />
            </div>
            <div class="space-y-1.5">
              <label class="label">Mã (dùng làm tên file và thư mục)</label>
              <input v-model="adding.slug" class="input font-mono !text-xs" placeholder="amnhac" />
              <p class="text-[11px] text-ink-muted">
                Chữ thường không dấu, số và gạch nối. Video sẽ nằm ở
                <code>output/{{ adding.slug || 'ma' }}/</code>
              </p>
            </div>
            <div class="space-y-1.5">
              <label class="label">Chép từ</label>
              <select v-model="adding.from" class="input">
                <option v-for="t in topics" :key="t.slug" :value="t.slug">{{ t.name }}</option>
              </select>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-2">
            <button class="btn" @click="adding = null">Huỷ</button>
            <button class="btn btn-primary" :disabled="busy || !adding.slug || !adding.name" @click="create">
              Tạo và sửa
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Toast :message="toast.message" :tone="toast.tone" @close="toast.message = ''" />
  </div>
</template>
