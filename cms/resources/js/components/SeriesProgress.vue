<script setup>
import { onMounted, ref } from 'vue'
import http from '../api'

const props = defineProps({ topic: { type: String, required: true } })
const emit = defineEmits(['toast'])

const p = ref(null)
const busy = ref(false)
const hoi = ref(false)          // đang hỏi lại trước khi đặt lại
const xoaTap = ref(false)

async function load() {
  try {
    const { data } = await http.get(`series/${props.topic}/progress`)
    p.value = data
  } catch {
    p.value = null
  }
}

async function reset() {
  busy.value = true
  try {
    const { data } = await http.post(`series/${props.topic}/reset`, { xoa_tap: xoaTap.value })
    p.value = data
    hoi.value = false
    xoaTap.value = false
    emit('toast', { message: data.message, tone: 'warning' })
  } catch (e) {
    emit('toast', { message: e.response?.data?.message || 'Không đặt lại được.', tone: 'critical' })
  } finally {
    busy.value = false
  }
}

onMounted(load)
defineExpose({ load })
</script>

<template>
  <div v-if="p && p.tong" class="space-y-2">
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span class="text-[13px] font-semibold tnum">{{ p.da_dung }}/{{ p.tong }}</span>
      <span class="h-1.5 w-40 overflow-hidden rounded-full bg-surface-3">
        <span class="block h-full rounded-full bg-accent"
              :style="{ width: (p.da_dung / p.tong * 100) + '%' }"></span>
      </span>
      <span class="text-[12px] text-ink-muted">
        còn {{ p.con_lai }} · đang ở tập {{ p.so_tap }}
      </span>

      <button v-if="!hoi" class="btn !py-1 !text-[12.5px]" @click="hoi = true">
        Đặt lại từ đầu
      </button>
    </div>

    <p v-if="p.tiep_theo?.length" class="text-[12px] text-ink-muted">
      Kế tiếp: {{ p.tiep_theo.join(' · ') }}
    </p>

    <!-- Hỏi lại trước khi đặt lại: đây là thao tác xoá tiến độ, không có nút hoàn tác -->
    <div v-if="hoi" class="space-y-2 rounded-lg border p-3"
         style="border-color: rgba(250,178,25,.3); background: rgba(250,178,25,.06)">
      <p class="text-[12.5px] leading-relaxed" style="color:#f8cf72">
        Đặt lại sẽ gỡ mốc “đã lên video” của cả {{ p.tong }} mục, series quay về tập 1.
        <strong class="font-semibold">Video đã dựng và đã đăng vẫn còn nguyên.</strong>
      </p>

      <label class="flex cursor-pointer items-start gap-2 text-[12.5px]">
        <input v-model="xoaTap" type="checkbox" class="mt-0.5 accent-[#FF2D55]" />
        <span>
          Xoá luôn {{ p.so_tap }} tập đã viết
          <span class="block text-[11.5px] text-ink-muted">
            Không tích thì tập cũ vẫn nằm trong lịch sử; tập mới sẽ ghi đè lên tập trùng số.
          </span>
        </span>
      </label>

      <div class="flex gap-2">
        <button class="btn !py-1 !text-[12.5px]" :disabled="busy" @click="hoi = false">Huỷ</button>
        <button class="btn btn-primary !py-1 !text-[12.5px]" :disabled="busy" @click="reset">
          {{ busy ? 'Đang đặt lại…' : 'Đặt lại về tập 1' }}
        </button>
      </div>
    </div>
  </div>
</template>
