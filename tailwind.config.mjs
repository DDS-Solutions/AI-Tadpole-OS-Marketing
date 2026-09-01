/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
                mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
            },
            colors: {
                zinc: {
                    950: '#09090b',
                    900: '#18181b',
                    800: '#27272a',
                    700: '#3f3f46',
                    500: '#8f8f99',
                },
                background: '#09090b',
                surface: '#18181b',
                border: '#27272a',
                'cyber-green': '#22c55e',
                'neural-pulse': '#e4e4e7',
            },
            animation: {
                'neural-pulse': 'neural-pulse 2s infinite ease-in-out',
            },
            keyframes: {
                'neural-pulse': {
                    '0%, 100%': { opacity: '0.3', filter: 'drop-shadow(0 0 0px #e4e4e7)' },
                    '50%': { opacity: '0.8', filter: 'drop-shadow(0 0 4px #e4e4e7)' },
                },
            },
        },
    },
    plugins: [],
}
