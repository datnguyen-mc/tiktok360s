import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login',   name: 'login',     component: () => import('./pages/Login.vue'), meta: { guest: true } },
  { path: '/',        name: 'dashboard', component: () => import('./pages/Dashboard.vue'),  meta: { title: 'Tổng quan' } },
  { path: '/videos',   name: 'videos',    component: () => import('./pages/Runs.vue'),       meta: { title: 'Video' } },
  { path: '/videos/:id', name: 'video',   component: () => import('./pages/RunDetail.vue'),  meta: { title: 'Chi tiết video' }, props: true },
  // Giữ đường dẫn cũ để link đã lưu không gãy
  { path: '/runs', redirect: '/videos' },
  { path: '/runs/:id', redirect: (to) => `/videos/${to.params.id}` },
  { path: '/publishing', name: 'publishing', component: () => import('./pages/Publishing.vue'), meta: { title: 'Đăng bài' } },
  { path: '/topics',   name: 'topics',   component: () => import('./pages/Topics.vue'),     meta: { title: 'Chủ đề kênh' } },
  { path: '/accounts', name: 'accounts', component: () => import('./pages/Accounts.vue'),   meta: { title: 'Kênh TikTok' } },
  { path: '/engines',  name: 'engines',  component: () => import('./pages/Engines.vue'),    meta: { title: 'Engine tạo video' } },
  { path: '/costs',    name: 'costs',    component: () => import('./pages/Costs.vue'),      meta: { title: 'Chi phí sinh cảnh' } },
  { path: '/settings', name: 'settings', component: () => import('./pages/Settings.vue'),   meta: { title: 'Cài đặt' } },
  { path: '/profile',  name: 'profile',  component: () => import('./pages/Profile.vue'),    meta: { title: 'Tài khoản của tôi' } },
  { path: '/logs',    name: 'logs',      component: () => import('./pages/Logs.vue'),       meta: { title: 'Nhật ký' } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})
