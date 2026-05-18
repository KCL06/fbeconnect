import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    // ── Security: Do NOT ship source maps to production ──────────────
    sourcemap: false,

    // ── Performance: Use esbuild for fast minification ───────────────
    minify: 'esbuild',

    // ── Code Splitting: Split vendor chunks for better caching ───────
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime – rarely changes, caches long-term
          'vendor-react': ['react', 'react-dom', 'react-router'],
          // Supabase SDK – separate chunk
          'vendor-supabase': ['@supabase/supabase-js'],
          // Heavy UI libraries – load on demand
          'vendor-charts': ['recharts'],
        },
      },
    },

    // ── Increase chunk warning threshold for rich UI apps ────────────
    chunkSizeWarningLimit: 600,
  },
})
