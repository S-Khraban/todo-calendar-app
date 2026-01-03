import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetIcons,
} from 'unocss';
import presetTypography from '@unocss/preset-typography';
import { presetWebFonts } from '@unocss/preset-web-fonts';

export default defineConfig({
  theme: {
    colors: {
      app: {
        bg: '#f4f6fb',
        surface: '#ffffff',
        surfaceSoft: '#f1f5f9',
      },
      text: {
        primary: '#0f172a',
        muted: '#6b7280',
      },
      brand: {
        primary: '#2563eb',
        primarySoft: '#dbeafe',
        accent: '#22c55e',
      },
      border: {
        soft: '#e5e7eb',
        strong: '#cbd5f5',
      },
    },
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Inter',
        mono: 'JetBrains Mono',
      },
    }),
  ],
});
