/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Habilitar modo oscuro basado en clase
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
        primary: {
          50: '#f0f7f7',
          100: '#d9ecec',
          200: '#b5d3d3', // Main primary color
          300: '#91baba',
          400: '#6da1a1',
          500: '#5a8a8a',
          600: '#4a7272',
          700: '#3a5959',
          800: '#2a4040',
          900: '#1a2727',
        },
        secondary: {
          50: '#f3f7ef',
          100: '#e3eed8',
          200: '#c8ddb3',
          300: '#adcc8f',
          400: '#9acc7a',
          500: '#88b7a3', // Main secondary color
          600: '#6ea085',
          700: '#548967',
          800: '#3a6149',
          900: '#20392b',
        },
        accent: {
          50: '#f8f9ed',
          100: '#eeefcd',
          200: '#dde09c',
          300: '#cbd06a',
          400: '#bac139',
          500: '#535911', // Main accent color (olive)
          600: '#42470e',
          700: '#32350b',
          800: '#212307',
          900: '#111204',
        },
        neutral: {
          50: '#fafafa',
          100: '#f4f4f4',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#9a9997', // Main neutral color
          600: '#7b7a79',
          700: '#5c5b5a',
          800: '#3d3c3c',
          900: '#1e1e1d',
        },
        tertiary: {
          50: '#faf8f4',
          100: '#f3ede2',
          200: '#e7dbc5',
          300: '#dbc9a8',
          400: '#cfb78b',
          500: '#b8a177', // Main tertiary color (tan)
          600: '#a38a5f',
          700: '#8e7347',
          800: '#5e4d2f',
          900: '#2f2618',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(83, 89, 17, 0.08)',
        'medium': '0 4px 12px rgba(83, 89, 17, 0.12)',
        'large': '0 8px 24px rgba(83, 89, 17, 0.16)',
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
      },
    },
  },
  plugins: [],
}
