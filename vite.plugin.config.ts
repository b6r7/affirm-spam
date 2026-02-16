import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Figma's sandbox rejects new Function(). The setImmediate polyfill (from React/JSZip deps)
 * uses it when a non-function is passed. Replace that line so we never invoke new Function.
 */
function stripNewFunctionFromBundle() {
  return {
    name: 'strip-new-function',
    writeBundle(options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && fileName.endsWith('.js')) {
          const outPath = path.join(options.dir || '.', fileName);
          let code = chunk.code;
          const before = code;
          // Replace: "function" != typeof e4 && (e4 = new Function("" + e4));
          // With:    if ("function" != typeof e4) throw new TypeError("setImmediate requires a function");
          code = code.replace(
            /"function"\s*!=\s*typeof\s+(\w+)\s*&&\s*\(\1\s*=\s*new\s+Function\s*\(\s*""\s*\+\s*\1\s*\)\)\s*;/g,
            'if ("function" != typeof $1) throw new TypeError("setImmediate requires a function");'
          );
          if (code !== before) {
            fs.writeFileSync(outPath, code, 'utf8');
          }
        }
      }
    },
  };
}

/**
 * Figma plugin UI build. Single IIFE + single CSS file; no ESM, no hashed names.
 * All env/global replacement is at build time only — no runtime polyfills in the iframe.
 */
export default defineConfig({
  base: './',
  mode: 'production',
  root: __dirname,
  plugins: [react(), tailwindcss(), stripNewFunctionFromBundle()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'figma-plugin': path.resolve(__dirname, './figma-plugin'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    global: 'globalThis',
  },
  build: {
    outDir: 'figma-plugin',
    emptyOutDir: false,
    target: 'es2018',
    minify: false,
    sourcemap: true,
    cssCodeSplit: false,
    assetsDir: '',
    assetsInlineLimit: 0,
    lib: {
      entry: path.resolve(__dirname, 'src/plugin/ui.tsx'),
      name: 'AffirmSpamUI',
      formats: ['iife'],
      fileName: () => 'ui.js',
    },
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'ui.js',
        chunkFileNames: 'ui.[name].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          return name.endsWith('.css') ? 'ui.css' : 'assets/[name][extname]';
        },
      },
    },
    assetsInclude: ['**/*.svg', '**/*.csv'],
  },
  esbuild: {
    target: 'es2018',
    keepNames: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
      },
    },
  },
});
