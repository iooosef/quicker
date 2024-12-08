/** @type {import('tailwindcss').Config} */
import flyonui from 'flyonui';
import plugin from 'flyonui/plugin';

export default {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}',
    './node_modules/flyonui/dist/js/accordion.js'
  ],
  safelist: [
    {
      pattern: /bg-(red|yellow|green|blue|indigo|purple|pink|gray)-\d{3}/,
    },
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

