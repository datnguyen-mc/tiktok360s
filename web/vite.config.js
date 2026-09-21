import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.js',
            // Bản dựng cho máy chủ — đây là thứ khiến Googlebot nhận được HTML đầy đủ
            ssr: 'resources/js/ssr.js',
            refresh: true,
        }),
        vue({ template: { transformAssetUrls: { base: null, includeAbsolute: false } } }),
        tailwindcss(),
    ],
    server: { port: 5175 },

    /*
     * Gói cả thư viện vào bundle SSR thay vì để chúng ở ngoài.
     *
     * Mặc định Vite coi mọi dependency là "external" và chỉ ghi câu `import`,
     * nên bootstrap/ssr/ssr.js cần node_modules mới chạy. Trong image Docker
     * không có node_modules (đã cố tình bỏ ra cho nhẹ) — và SSR chết lặng lẽ:
     * trang vẫn mở được, chỉ là Googlebot nhận về một thẻ <div id="app"> rỗng.
     *
     * Gói hết vào một tệp thì ssr.js tự đứng được, không phụ thuộc gì.
     */
    ssr: { noExternal: true },
});
