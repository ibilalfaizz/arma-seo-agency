import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#000000',
          DEFAULT: '#1a1a1a',
          light: '#2d2d2d',
        },
        accent: {
          DEFAULT: '#BE301E',
          dark: '#9B2517',
          light: '#D94B39',
        },
      },
      fontFamily: {
        heading: ['var(--font-oswald)', 'sans-serif'],
        sans: ['var(--font-gilroy)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config

