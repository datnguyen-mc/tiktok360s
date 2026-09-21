<script setup>
/*
 * Hộp thoại xoá một video.
 *
 * Dùng hộp thoại riêng chứ không phải confirm() của trình duyệt vì có hai thứ
 * cần nói rõ và một thứ cần chọn:
 *   - xoá bản ghi thì tin, bước chạy và job đăng bài cũng mất theo (cascade)
 *   - file video 15–20 MB có xoá hay không là lựa chọn, mặc định KHÔNG
 *   - video đã đăng TikTok thì server đòi xác nhận lần hai
 */
import { computed, ref } from 'vue'
import http, { errorMessage } from '../api'
import { fmtBytes, fmtDate } from '../format'

const props = defineProps({ run: { type: Object, required: true } })
const emit = defineEmits(['close', 'deleted'])

const deleteFiles = ref(false)
const force = ref(false)
const busy = ref(false)
const error = ref('')
const warning = ref('')          // server báo video đã đăng, cần xác nhận lần hai

const published = computed(() =>
  (props.run.publish_jobs || []).some((j) => j.status === 'published'))

async function submit() {
  busy.value = true
  error.value = ''
  try {
    const res = (await http.delete(`runs/${props.run.id}`, {
      data: { delete_files: deleteFiles.value, force: force.value },
    })).data
    emit('deleted', res)
  } catch (e) {
    // 409 = đã đăng TikTok, chưa có force. Hiện cảnh báo rồi cho bấm lần nữa.
    if (e?.response?.status === 409) {
      warning.value = e.response.data?.message || 'Video này đã đăng lên TikTok.'
      force.value = true
    } else {
      error.value = errorMessage(e, 'Không xoá được')
    }
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/70 p-4"
       @click.self="$emit('close')">
    <div class="card my-6 w-full max-w-md p-6">
      <h3 class="text-base font-bold">Xoá video</h3>
      <p class="mt-1 text-xs leading-relaxed text-ink-muted">
        {{ run.topic_name || run.topic }} · {{ fmtDate(run.run_date) }}
        <span class="block">{{ run.title }}</span>
      </p>

      <div class="mt-5 space-y-4">
        <p class="rounded-xl px-4 py-3 text-[12px] leading-relaxed"
           style="background: rgba(208,59,59,.1); color:#f0a8a8">
          Xoá bản ghi này thì <strong>{{ run.items_count }} tin</strong>, lịch sử các bước
          chạy và mọi job đăng bài của nó cũng mất theo. Không hoàn lại được.
        </p>

        <p v-if="warning" class="rounded-xl px-4 py-3 text-[12px] leading-relaxed"
           style="background: rgba(250,178,25,.12); color:#f8cf72">
          {{ warning }} Bấm <strong>Xoá</strong> lần nữa để xác nhận.
        </p>
        <p v-else-if="published" class="rounded-xl px-4 py-3 text-[12px] leading-relaxed"
           style="background: rgba(250,178,25,.12); color:#f8cf72">
          Video này đã đăng lên TikTok. Bài trên TikTok vẫn còn, nhưng ở đây sẽ mất dấu nó.
        </p>

        <label class="flex gap-3 rounded-xl border border-line p-3">
          <input v-model="deleteFiles" type="checkbox" class="mt-0.5" />
          <span class="text-[13px] leading-relaxed">
            <span class="font-semibold">
              Xoá luôn file trên máy<span v-if="run.video_bytes"> ({{ fmtBytes(run.video_bytes) }})</span>
            </span>
            <span class="mt-0.5 block text-[11px] text-ink-muted">
              Xoá cả video và ảnh bìa trong <code>output/</code>. Bỏ trống thì file còn nguyên,
              chỉ bản ghi mất — nạp lại được bằng <code>make cms-push</code>.
            </span>
          </span>
        </label>

        <p v-if="run.video_url" class="text-[11px] leading-relaxed text-ink-muted">
          Bản trên R2 <strong>không</strong> bị xoá — phải xoá tay trong Cloudflare, hoặc
          cài <code>league/flysystem-aws-s3-v3</code> để CMS xoá được.
        </p>

        <p v-if="error" class="text-[12px]" style="color:#f08d8d">{{ error }}</p>
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button class="btn" :disabled="busy" @click="$emit('close')">Thôi</button>
        <button class="btn" style="background: rgba(208,59,59,.9); color:#fff"
                :disabled="busy" @click="submit">
          {{ busy ? 'Đang xoá…' : (force ? 'Xoá dù vậy' : 'Xoá') }}
        </button>
      </div>
    </div>
  </div>
</template>
