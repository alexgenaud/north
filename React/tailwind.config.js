/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{html,js,jsx,tsx,ts}"],
    safelist: [{
        pattern: /col-span-./,
        pattern: /col-span-1./
    }],
    theme: {
        extend: {
            gridTemplateColumns: {
                // Simple 16 column grid
                '16': 'repeat(16, minmax(0, 1fr))'
            }
        }
    },
    plugins: [],
}

