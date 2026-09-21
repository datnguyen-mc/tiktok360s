<script setup>
import { computed, nextTick, ref } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  rows: { type: Number, default: 18 },
})
const emit = defineEmits(['update:modelValue'])

const el = ref(null)
const mode = ref('viet')   // viet | xem | doi-chieu

/**
 * Bọc phần đang bôi đen bằng một thẻ, hoặc chèn thẻ rỗng rồi đặt con trỏ vào
 * giữa. Không dùng contenteditable: nó sinh ra HTML lộn xộn khác nhau ở mỗi
 * trình duyệt, còn ở đây nội dung đi thẳng vào cơ sở dữ liệu nên phải sạch.
 */
function wrap(open, close = null, block = false) {
  const ta = el.value
  if (!ta) return

  close ??= open.replace('<', '</').replace(/ .*>/, '>')
  const { selectionStart: a, selectionEnd: b, value } = ta
  const picked = value.slice(a, b)

  const before = block && a > 0 && value[a - 1] !== '\n' ? '\n' : ''
  const after = block ? '\n' : ''
  const inserted = `${before}${open}${picked}${close}${after}`

  const next = value.slice(0, a) + inserted + value.slice(b)
  emit('update:modelValue', next)

  const caret = a + before.length + open.length + picked.length
  nextTick(() => {
    ta.focus()
    ta.setSelectionRange(picked ? caret + close.length + after.length : caret, 
                         picked ? caret + close.length + after.length : caret)
  })
}

function link() {
  const url = prompt('Dán liên kết:')
  if (url) wrap(`<a href="${url}" target="_blank" rel="noopener">`, '</a>')
}

function image() {
  const url = prompt('Dán liên kết ảnh:')
  if (url) wrap(`<img src="${url}" alt="" loading="lazy">`, '', true)
}

const TOOLS = [
  { t: 'H2', title: 'Tiêu đề mục', fn: () => wrap('<h2>', '</h2>', true) },
  { t: 'H3', title: 'Tiêu đề phụ', fn: () => wrap('<h3>', '</h3>', true) },
  { t: 'P',  title: 'Đoạn văn',   fn: () => wrap('<p>', '</p>', true) },
  { sep: true },
  { t: 'B',  title: 'In đậm',  cls: 'font-extrabold', fn: () => wrap('<strong>', '</strong>') },
  { t: 'I',  title: 'In nghiêng', cls: 'italic',      fn: () => wrap('<em>', '</em>') },
  { sep: true },
  { t: '“ ”', title: 'Trích dẫn', fn: () => wrap('<blockquote>', '</blockquote>', true) },
  { t: '•',  title: 'Danh sách',
    fn: () => wrap('<ul>\n  <li>', '</li>\n</ul>', true) },
  { sep: true },
  { i: 'link',  title: 'Liên kết', fn: link },
  { i: 'image',  title: 'Ảnh',      fn: image },
]

// Số chữ tính trên phần văn bản, không tính thẻ HTML
const plain = computed(() =>
  (props.modelValue || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
)
const words = computed(() => (plain.value ? plain.value.split(' ').length : 0))
const minutes = computed(() => Math.max(1, Math.round(words.value / 200)))
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-line">
    <!-- Thanh công cụ -->
    <div class="flex flex-wrap items-center gap-0.5 border-b border-line bg-surface px-2 py-1.5">
      <template v-for="(b, i) in TOOLS" :key="i">
        <span v-if="b.sep" class="mx-1 h-4 w-px bg-line"></span>
        <button v-else type="button" :title="b.title" :aria-label="b.title"
                class="grid h-7 min-w-7 place-items-center rounded-md px-1.5 text-[12.5px]
                       font-bold text-ink-2 transition hover:bg-surface-2 hover:text-ink
                       active:scale-90"
                :class="b.cls" @click="b.fn()">
          <Icon v-if="b.i" :name="b.i" size="size-[15px]" />
          <template v-else>{{ b.t }}</template>
        </button>
      </template>

      <div class="ml-auto flex gap-0.5">
        <button v-for="m in [['viet','Viết'],['xem','Xem trước'],['doi-chieu','Đối chiếu']]"
                :key="m[0]" type="button"
                class="rounded-md px-2 py-1 text-[12px] font-semibold transition"
                :style="mode === m[0]
                  ? { background: 'var(--color-accent-soft)', color: 'var(--color-accent-ink)' }
                  : { color: 'var(--color-ink-muted)' }"
                @click="mode = m[0]">{{ m[1] }}</button>
      </div>
    </div>

    <div :class="mode === 'doi-chieu' && 'grid lg:grid-cols-2 lg:divide-x lg:divide-line'">
      <textarea v-show="mode !== 'xem'" ref="el" :value="modelValue" :rows="rows"
                class="block w-full resize-y border-0 bg-page px-3.5 py-3 font-mono text-[13px]
                       leading-relaxed text-ink outline-none"
                placeholder="<p>Viết nội dung ở đây. Thẻ dùng được: p, h2, h3, ul, li, a, img, blockquote, strong, em.</p>"
                @input="emit('update:modelValue', $event.target.value)"></textarea>

      <!-- Xem trước dùng đúng kiểu chữ thân bài của website -->
      <div v-show="mode !== 'viet'" class="max-h-[560px] overflow-y-auto px-3.5 py-3">
        <div v-if="modelValue" class="prose-vi !text-[15px]" v-html="modelValue"></div>
        <p v-else class="py-10 text-center text-[13px] text-ink-muted">Chưa có nội dung.</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-x-4 border-t border-line bg-surface px-3 py-1.5
                text-[11.5px] text-ink-muted tabular-nums">
      <span>{{ words }} chữ</span>
      <span>~{{ minutes }} phút đọc</span>
      <span class="ml-auto">Nội dung lưu dưới dạng HTML</span>
    </div>
  </div>
</template>
