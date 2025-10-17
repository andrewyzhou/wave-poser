/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'page': '#f8f9fa', // very light gray
        'waveform': '#EFD9FF', // soft purple
        'options': '#E6F4FF', // soft blue
        'ink': '#0B0B0B', // near black
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Inter', 'monospace'],
      },
    },
  },
  plugins: [],
}
