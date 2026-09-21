import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import createServer from '@inertiajs/vue3/server'
import { createInertiaApp } from '@inertiajs/vue3'

/*
 * Kết xuất phía máy chủ.
 *
 * Đây là mấu chốt để một SPA vẫn lên được Google: máy chủ dựng sẵn HTML đầy đủ
 * cho lần tải đầu, rồi Vue "gắn" vào và từ đó điều hướng mượt như SPA. Không có
 * lớp này thì bot chỉ thấy <div id="app"></div> rỗng.
 *
 * Chạy:  php artisan inertia:start-ssr   (bản build: node bootstrap/ssr/ssr.js)
 */
createServer((page) =>
  createInertiaApp({
    page,
    render: renderToString,
    title: (title) => title,
    resolve: (name) => {
      const pages = import.meta.glob('./Pages/**/*.vue', { eager: true })
      return pages[`./Pages/${name}.vue`]
    },
    setup({ App, props, plugin }) {
      return createSSRApp({ render: () => h(App, props) }).use(plugin)
    },
  }),
)
