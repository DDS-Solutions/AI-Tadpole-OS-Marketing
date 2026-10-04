import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { SITE_ORIGIN, BASE_PATH } from './site.config.mjs';

// https://astro.build/config
export default defineConfig({
    site: SITE_ORIGIN,
    base: BASE_PATH,
    vite: {
        plugins: [tailwindcss()],
    },
});
