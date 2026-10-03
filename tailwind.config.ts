// Limita a geração de classes Tailwind aos arquivos que compõem a aplicação.
import type { Config } from 'tailwindcss';

const config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;

export default config;
