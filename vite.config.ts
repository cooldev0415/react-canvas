import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-matter-js': path.resolve(__dirname, 'node_modules/react-matter-js/index.js'),
    },
  },
  server: {
    host: true, // Listen on all local IPs
    port: 5173
  }
})
