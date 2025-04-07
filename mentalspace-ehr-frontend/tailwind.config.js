/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          300: '#a5b4fc',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
        },
        gray: {
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        blue: {
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
        },
        amber: {
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        teal: {
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
        },
        purple: {
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        red: {
          500: '#ef4444',
        },
        green: {
          500: '#22c55e',
        },
      },
    },
  },
  plugins: [],
}
