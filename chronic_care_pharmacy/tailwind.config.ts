import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'medical-blue': '#0052cc',
                'signal-red': '#ff4d4f',
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
            },
            keyframes: {
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.15s ease-out',
            },
        },
    },
    plugins: [],
};

export default config;
