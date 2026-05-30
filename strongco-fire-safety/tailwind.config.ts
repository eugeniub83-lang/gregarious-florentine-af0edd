import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        strongco: {
          red: '#C8102E',
          grey: '#333333',
          white: '#FFFFFF',
        },
      },
      boxShadow: {
        soft: '0 24px 80px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
