/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2E86C1',
        primaryLight: '#5DADE2',
      },
    },
  },
  plugins: [],
};

export default config;
