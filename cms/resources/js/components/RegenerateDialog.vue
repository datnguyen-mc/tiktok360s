<script setup>
/*
 * Hộp thoại "Tạo lại video".
 *
 * Khác hộp thoại "Tạo video mới": ở đây mọi thiết lập đã có sẵn từ lần chạy cũ
 * (chủ đề, ngày, số tin, giọng, engine, prompt), nên chỉ hỏi ba câu — lấy tin
 * mới hay dùng lại kịch bản, có sinh lại cảnh AI không, và số tin.
 *
 * Bản ghi cũ bị ghi đè chứ không sinh dòng mới: đường nạp dữ liệu khớp theo
 * (chủ đề + ngày). Nói rõ điều đó trong hộp thoại vì nó không thể hoàn lại.
 */
import { computed, onMounted, ref, watch } from 'vue'
import http, { errorMessage } from '../api'
import { fmtDate } from '../format'

const props = defineProps({ run: { type: Object, required: true } })
const emit = defineEmits(['close', 'started'])

const engines = ref([])
const loading = ref(true)
const busy = ref(false)
const error = ref('')

const form = ref({
  reuse_script: false,
  no_ai: false,
  items: props.run.items_count || '',
  video_engine_id: props.run.video_engine_id ?? null,
})

const engine = computed(() => engines.value.find((e) => e.id === form.value.video_engine_id))
const isAi = computed(() => !!engine.value?.is_ai)

/*
 * Chi phí do server tính, không tính lại bằng JS: giá có thể không nằm ở
 * `cost_per_second` mà suy ra từ bảng giá trong config theo model + độ phân
 * giải (xem VideoEngine::pricePerSecond), nên nhân tay ở đây sẽ ra 0 ở đúng
 * những engine dùng giá mặc định.
 */
const estimate = ref(null)

async function refreshEstimate() {
  estimate.value = null
  if (!isAi.value || form.value.no_ai || !engine.value) return
  try {
    const { type, model, resolution, clip_seconds, cost_per_second } = engine.value
    estimate.value = (await http.post('video-engines/estimate', {
      type, model, resolution, clip_seconds, cost_per_second,
      // Độ dài của lần chạy trước là ước lượng sát nhất cho lần tạo lại.
      seconds: Math.max(1, Math.round(Number(props.run.duration_sec) || 105)),
    })).data.estimate
  } catch {
    estimate.value = null
  }
}

watch([() => form.value.video_engine_id, () => form.value.no_ai], refreshEstimate)

onMounted(async () => {
  try {
    const d = (await http.get('video-engines')).data
    engines.value = d.engines.filter((x) => x.is_active)
    // Engine của lần chạy cũ có thể đã bị tắt hoặc xoá — lùi về mặc định.
    if (!engines.value.some((e) => e.id === form.value.video_engine_id)) {
      form.value.video_engine_id = engines.value.find((e) => e.is_default)?.id
                                ?? engines.value[0]?.id ?? null
    }
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
  refreshEstimate()
})

async function submit() {
  busy.value = true
  error.value = ''
  try {
    const res = (await http.post(`runs/${props.run.id}/regenerate`, form.value)).data
    emit('started', res)
  } catch (e) {
    error.value = errorMessage(e, 'Không tạo lại được video')
  } finally {
    busy.value = false
  }
}

const usd = (n) => n == null ? null
  : '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<template>
  <div class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-4"
       @click.self="$emit('close')">
    <div class="card my-6 w-full max-w-lg p-6">
      <h3 class="text-base font-bold">Tạo lại video</h3>
      <p class="mt-1 text-xs leading-relaxed text-ink-muted">
        {{ run.topic_name || run.topic }} · {{ fmtDate(run.run_date) }}
        <span class="block">{{ run.title }}</span>
      </p>

      <div v-if="loading" class="grid h-28 place-items-center text-sm text-ink-muted">Đang tải…</div>

      <div v-else-if="!engines.length" class="mt-5 rounded-xl px-4 py-3 text-[13px] leading-relaxed"
           style="background: rgba(250,178,25,.1); color:#f8cf72">
        Chưa có engine nào đang bật.
        <RouterLink to="/engines" class="underline" @click="$emit('close')">
          Vào mục Engine tạo video
        </RouterLink>
        để thêm một cái.
      </div>

      <div v-else class="mt-5 space-y-4">
        <p class="rounded-xl px-4 py-3 text-[12px] leading-relaxed"
           style="background: rgba(250,178,25,.1); color:#f8cf72">
          Bản ghi và file video hiện tại sẽ bị <strong>ghi đè</strong> — cùng chủ đề và cùng
          ngày thì chỉ có một video. Không hoàn lại được.
        </p>

        <label class="block">
          <span class="text-xs font-semibold text-ink-2">Engine</span>
          <select v-model="form.video_engine_id" class="input mt-1.5 w-full">
            <option v-for="e in engines" :key="e.id" :value="e.id">
              {{ e.name }}{{ e.is_ai ? ` · ${e.model}` : ' · ảnh báo' }}
            </option>
          </select>
        </label>

        <label class="flex gap-3 rounded-xl border border-line p-3">
          <input v-model="form.reuse_script" type="checkbox" class="mt-0.5" />
          <span class="text-[13px] leading-relaxed">
            <span class="font-semibold">Dùng lại kịch bản cũ</span>
            <span class="mt-0.5 block text-[11px] text-ink-muted">
              Không lấy tin mới, chỉ đọc và ghép lại từ
              <code>script.json</code> đã lưu. Dùng khi lần trước rớt ở khâu giọng đọc,
              hoặc khi bạn vừa sửa tay kịch bản.
              Bỏ chọn thì lấy tin mới và đổi câu mở đầu.
            </span>
          </span>
        </label>

        <label v-if="isAi" class="flex gap-3 rounded-xl border border-line p-3">
          <input v-model="form.no_ai" type="checkbox" class="mt-0.5" />
          <span class="text-[13px] leading-relaxed">
            <span class="font-semibold">Không sinh lại cảnh AI</span>
            <span class="mt-0.5 block text-[11px] text-ink-muted">
              Quay về dùng ảnh từ bài báo. Miễn phí — chọn cái này nếu chỉ cần sửa
              giọng đọc hay phụ đề.
            </span>
          </span>
        </label>

        <label v-if="!form.reuse_script" class="block">
          <span class="text-xs font-semibold text-ink-2">Số tin</span>
          <input v-model="form.items" type="number" min="1" max="30"
                 class="input mt-1.5 w-full" :placeholder="String(run.items_count || 10)" />
          <span class="mt-1 block text-[11px] text-ink-muted">
            Lần trước: {{ run.items_count }} tin. Giọng đọc giữ nguyên
            ({{ run.voice_id?.replace('vi-VN-', '') || 'mặc định' }}).
          </span>
        </label>

        <p v-if="estimate" class="text-[12px] text-ink-2">
          Chi phí sinh cảnh ước tính: <strong>{{ usd(estimate.per_video) }}</strong>
          <span class="text-ink-muted">
            ({{ estimate.clips }} clip × {{ estimate.billed_seconds / estimate.clips }}s)
            — tạo lại là tính tiền lại từ đầu, clip cũ không dùng lại được.
          </span>
        </p>

        <p v-if="error" class="text-[12px]" style="color:#f08d8d">{{ error }}</p>
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button class="btn" :disabled="busy" @click="$emit('close')">Thôi</button>
        <button class="btn btn-primary" :disabled="busy || loading || !engines.length"
                @click="submit">
          {{ busy ? 'Đang gửi…' : 'Tạo lại' }}
        </button>
      </div>
    </div>
  </div>
</template>
