import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages project site (e.g. username.github.io/affirm-spam), set base so assets load.
// In CI (e.g. GitHub Actions) we always use the repo path so asset URLs work.
const base =
  process.env.CI === 'true'
    ? '/affirm-spam/'
    : (process.env.GITHUB_PAGES_BASE || '/');

export default defineConfig({
  base,
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'figma-plugin': path.resolve(__dirname, './figma-plugin'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
