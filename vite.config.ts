import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      base: './',
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      
      build: {
        outDir: 'dist',
        assetsDir: '.', 
        sourcemap: false,
        target: 'es2015',

        rollupOptions: {
          output: {
            inlineDynamicImports: true,
            entryFileNames: 'app.js',
            chunkFileNames: 'app.js',
            assetFileNames: '[name][extname]',
            format: 'iife',
          }
        }
      },

      // Optimizar para WebView
      esbuild: {
        minifyIdentifiers: false,
           keepNames: true
     }

    };
});
