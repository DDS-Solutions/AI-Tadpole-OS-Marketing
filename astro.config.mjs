import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    site: 'https://DDS-Solutions.github.io',
    base: '/AI-Tadpole-OS-Marketing',
    vite: {
        plugins: [tailwindcss()],
    },
});
