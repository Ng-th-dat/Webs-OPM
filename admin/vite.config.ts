import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// Standalone admin app — separate from the main site (its own build/deploy target).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Reuses the main app's Character types/rarity constants so the schema stays
      // in one place instead of duplicated across the two apps.
      '@main': path.resolve(__dirname, '../src'),
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
});
