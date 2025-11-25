/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Legacy colors for compatibility
        primary: '#0066CC',
        primaryLight: '#3399FF',

        // Medical Blue Palette
        'medical-blue': {
          50: '#E6F2FF',
          100: '#CCE5FF',
          200: '#99CCFF',
          300: '#66B2FF',
          400: '#3399FF',
          500: '#0066CC',
          600: '#005BB5',
          700: '#004D99',
          800: '#003D7A',
          900: '#002D5C',
        },

        // Healthcare Teal Accents
        'medical-teal': {
          50: '#E0F7F7',
          100: '#B3EDED',
          200: '#80E3E3',
          300: '#4DD9D9',
          400: '#26D1D1',
          500: '#00C4C4',
          600: '#00A8A8',
          700: '#008B8B',
          800: '#006F6F',
          900: '#005252',
        },

        // Medical Green (Success/Health)
        'medical-green': {
          50: '#E6F9F0',
          100: '#B3EDD0',
          200: '#80E1B0',
          300: '#4DD590',
          400: '#26CD7A',
          500: '#00A86B',
          600: '#009659',
          700: '#008047',
          800: '#006A35',
          900: '#005023',
        },

        // Professional Neutrals
        'neutral': {
          50: '#F8FAFB',
          100: '#F1F4F6',
          200: '#E4E9ED',
          300: '#CBD5E0',
          400: '#A0AEC0',
          500: '#718096',
          600: '#4A5568',
          700: '#2D3748',
          800: '#1A202C',
          900: '#0F1419',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
