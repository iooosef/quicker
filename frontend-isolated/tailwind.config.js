/** @type {import('tailwindcss').Config} */
import flyonui from 'flyonui';

export default {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  darkMode: false,
  theme: {
    extend: {},
  },
  plugins: [
    flyonui
  ],
}

