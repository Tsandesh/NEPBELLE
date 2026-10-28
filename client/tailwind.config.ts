import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: 'var(--brand)', hover: 'var(--brand-hover)', pressed: 'var(--brand-pressed)', tint: 'var(--brand-tint)', 'tint-strong': 'var(--brand-tint-strong)' },
        accent: 'var(--accent)',
        canvas: 'var(--canvas)',
        'section-tint': 'var(--section-tint)',
        ink: 'var(--ink)',
        muted: { DEFAULT: 'var(--muted-bg)', foreground: 'var(--muted)' },
        subtle: 'var(--subtle)',
        placeholder: 'var(--placeholder)',
        line: { DEFAULT: 'var(--line)', soft: 'var(--line-soft)' },
        disabled: 'var(--disabled)',
        thumb: 'var(--thumb)',
        // shadcn semantic tokens
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: { DEFAULT: 'var(--primary)', foreground: 'var(--primary-foreground)' },
        secondary: { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        destructive: { DEFAULT: 'var(--destructive)', foreground: '#fff' },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      fontFamily: {
        serif: ['"Abhaya Libre"', 'Georgia', 'serif'],
        sans: ['Sansation', '"Trebuchet MS"', 'system-ui', 'sans-serif'],
      },
      fontSize: { '2xs': ['12px', '14px'], sm: ['14px', '18px'], title: ['30px', '34px'], display: ['36px', '41px'] },
      spacing: { 13: '52px', 15: '60px' },
      boxShadow: { nav: '0 2px 4px rgba(0,0,0,0.13)' },
      borderRadius: { lg: 'var(--radius)', md: 'var(--radius)', sm: 'var(--radius)' },
      keyframes: { shimmer: { '100%': { transform: 'translateX(100%)' } } },
      animation: { shimmer: 'shimmer 1.4s infinite' },
    },
  },
  plugins: [animate],
} satisfies Config;
