<script setup>
import { onMounted, ref, watch } from 'vue'
import http from '../api'
import EmptyState from '../components/EmptyState.vue'
import { fmtTime } from '../format'

const logs = ref({ data: [] })
const loading = ref(true)
const level = ref('')

async function load() {
  loading.value = true
  try {
    logs.value = (await http.get('activity-logs', { params: { level: level.value } })).data
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(level, load)

const tone = { info: '#8b8b9b', warning: 'var(--color-warning)', error: 'var(--color-critical)' }
const levels = [
  { value: '', label: 'Tất cả' },
  { value: 'info', label: 'Thông tin' },
  { value: 'warning', label: 'Cảnh báo' },
  { value: 'error', label: 'Lỗi' },
]
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <button v-for="l in levels" :key="l.value" class="btn !py-1.5 !text-xs"
              :style="level === l.value
                ? { background: 'var(--color-accent-soft)', borderColor: 'var(--color-accent)' } : {}"
              @click="level = l.value">
        {{ l.label }}
      </button>
      <button class="btn btn-ghost ml-auto !py-1.5 !text-xs" @click="load">Làm mới</button>
    </div>

    <div class="card overflow-hidden">
      <div v-if="loading" class="grid h-40 place-items-center text-sm text-ink-muted">Đang tải…</div>

      <EmptyState v-else-if="!logs.data.length" title="Nhật ký trống" />

      <ul v-else class="divide-y divide-line">
        <li v-for="l in logs.data" :key="l.id" class="flex gap-3 px-5 py-3">
          <span class="mt-1.5 size-1.5 shrink-0 rounded-full" :style="{ background: tone[l.level] }"></span>
          <span class="min-w-0 flex-1">
            <span class="block text-[13px] leading-snug">{{ l.message }}</span>
            <span class="block text-[11px] text-ink-muted">{{ l.event }}</span>
          </span>
          <span class="tnum shrink-0 text-[11px] text-ink-muted">{{ fmtTime(l.created_at) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
