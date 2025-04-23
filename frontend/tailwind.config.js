/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            screens: {
                slg : '1200px',
                xxl: '1600px'
            },
            colors: {
                night: '#0e0b16',
                velvet: '#a239ca',
                neon: '#4717f6',
                mist: '#e7dfdd',
                "cocktail-glow": '#ff416c',
                "cocktail-glow-light": '#ff4b2b',
            },
            fontFamily: {
                cocktail: ['"Segoe UI"', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
