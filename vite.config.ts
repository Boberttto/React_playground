/// <reference types="vitest/config" />
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// Run `npm run test:solution` to execute every exercise test against Solution.tsx
// instead of Exercise.tsx. Tests always `import ... from './Exercise'`; this alias swaps it.
const useSolution = process.env.SOLUTION === '1'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // React Compiler: auto-memoizes components & hooks at build time.
    // https://react.dev/learn/react-compiler
    babel({ presets: [reactCompilerPreset()] }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // Lets every .scss file `@use 'tokens' as *;` without relative paths.
        loadPaths: ['src/styles'],
      },
    },
  },
  resolve: {
    alias: useSolution ? [{ find: /^\.\/Exercise$/, replacement: './Solution' }] : [],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
})
