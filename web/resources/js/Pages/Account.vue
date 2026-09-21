<script setup>
import { computed } from 'vue'
import { useForm, usePage } from '@inertiajs/vue3'
import PublicLayout from '../Layouts/PublicLayout.vue'
import SeoHead from '../Components/SeoHead.vue'
import Avatar from '../Components/Avatar.vue'

defineProps({ seo: { type: Object, required: true } })

const user = computed(() => usePage().props.auth.user)
const flash = computed(() => usePage().props.flash)

const form = useForm({
  name: user.value.name || '',
  username: user.value.username || '',
  bio: user.value.bio || '',
  avatar_url: user.value.avatar_url || '',
})
</script>

<template>
  <SeoHead :seo="seo" />

  <PublicLayout>
    <div class="wrap max-w-[640px]">
      <h1 class="text-[26px] font-extrabold tracking-tight">Tài khoản</h1>
      <p class="mt-1 text-[13.5px] text-ink-muted">
        Tên và ảnh ở đây là thứ người khác thấy bên cạnh bình luận của bạn.
      </p>

      <div v-if="flash?.success"
           class="mt-5 rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-2.5 text-[13.5px]
                  font-semibold text-cyan" role="status">
        {{ flash.success }}
      </div>

      <!-- Xem trước ngay: sửa tên/ảnh là thấy đổi liền -->
      <div class="mt-5 flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
        <Avatar :user="{ name: form.name, avatar_url: form.avatar_url }" size="size-14 text-xl" />
        <div class="min-w-0">
          <p class="truncate text-[15px] font-bold">{{ form.name || 'Chưa đặt tên' }}</p>
          <p class="truncate text-[12.5px] text-ink-muted">
            {{ form.username ? '@' + form.username : user.email }}
          </p>
          <p v-if="form.bio" class="mt-1 line-clamp-2 text-[12.5px] text-ink-2">{{ form.bio }}</p>
        </div>
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="form.put('/account', { preserveScroll: true })">
        <div class="space-y-1.5">
          <label class="label" for="name">Tên hiển thị</label>
          <input id="name" v-model="form.name" class="input" maxlength="60" required />
          <p v-if="form.errors.name" class="text-[12px] text-accent-ink">{{ form.errors.name }}</p>
        </div>

        <div class="space-y-1.5">
          <label class="label" for="un">Tên đăng nhập</label>
          <div class="flex items-center gap-2">
            <span class="text-[14px] font-semibold text-ink-muted">@</span>
            <input id="un" v-model="form.username" class="input" maxlength="40"
                   placeholder="khong-bat-buoc" />
          </div>
          <p v-if="form.errors.username" class="text-[12px] text-accent-ink">{{ form.errors.username }}</p>
          <p v-else class="text-[11.5px] text-ink-muted">Chỉ chữ, số, gạch ngang và gạch dưới.</p>
        </div>

        <div class="space-y-1.5">
          <label class="label" for="av">Liên kết ảnh đại diện</label>
          <input id="av" v-model="form.avatar_url" class="input" type="url"
                 placeholder="https://…" />
          <p v-if="form.errors.avatar_url" class="text-[12px] text-accent-ink">{{ form.errors.avatar_url }}</p>
        </div>

        <div class="space-y-1.5">
          <label class="label" for="bio">Giới thiệu</label>
          <textarea id="bio" v-model="form.bio" rows="3" maxlength="300"
                    class="input resize-y !py-2.5"></textarea>
          <p class="text-[11.5px] text-ink-muted tabular-nums">{{ form.bio.length }}/300</p>
        </div>

        <div class="flex items-center gap-3 pt-1">
          <button class="btn btn-primary" :disabled="form.processing">
            {{ form.processing ? 'Đang lưu…' : 'Lưu thay đổi' }}
          </button>
          <span class="text-[12.5px] text-ink-muted">Email {{ user.email }} không đổi được.</span>
        </div>
      </form>
    </div>
  </PublicLayout>
</template>
