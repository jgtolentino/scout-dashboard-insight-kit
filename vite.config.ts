import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Redirect any analytics imports to our empty stub
      'analytics.client-CWr-exsP.js': '/src/stubs/emptyAnalytics.js',
      'github-DEL0KHVL.js': '/src/stubs/emptyAnalytics.js',
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  define: {
    // Suppress VM contextify warnings
    'process.env.NODE_NO_WARNINGS': '"1"'
  }
})