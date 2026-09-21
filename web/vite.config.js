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
});
