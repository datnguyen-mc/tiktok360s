<script setup>
import { onMounted, provide, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from './api'
import AppShell from './components/AppShell.vue'

const user = ref(null)
const ready = ref(false)
const route = useRoute()
const router = useRouter()

provide('user', user)

async function loadUser() {
  try {
    user.value = (await http.get('me')).data
  } catch {
    user.value = null
  } finally {
    ready.value = true
  }
}

onMounted(async () => {
  await loadUser()
  if (!user.value && route.name !== 'login') router.replace({ name: 'login' })
})

// Trang đăng nhập gọi lại sau khi vào được, để lấy thông tin người dùng.
provide('refreshUser', loadUser)
</script>

<template>
  <div v-if="!ready" class="grid h-full place-items-center">
    <div class="flex items-center gap-3 text-ink-2">
      <span class="size-4 animate-spin rounded-full border-2 border-line-strong border-t-accent"></span>
      Đang tải…
    </div>
  </div>

  <RouterView v-else-if="$route.meta.guest" />

  <AppShell v-else-if="user">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </AppShell>
</template>
