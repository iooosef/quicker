/** @type {import('tailwindcss').Config} */
import flyonui from 'flyonui';
import plugin from 'flyonui/plugin';

export default {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}',
    './node_modules/flyonui/dist/js/accordion.js'
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
    flyonui,
    plugin
  ],flyonui: {
    themes: ["light"]
  }
}

