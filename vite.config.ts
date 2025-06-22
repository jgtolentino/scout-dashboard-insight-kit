import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
      fs: { strict: false },           // WebContainer noise reduction
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    // Remove problematic define that causes build errors
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Redirect generated analytics & GitHub clients to empty stubs
        "analytics.client-CWr-exsP.js": path.resolve(__dirname, "./src/stubs/emptyAnalytics.js"),
        "github-DEL0KHVL.js": path.resolve(__dirname, "./src/stubs/emptyAnalytics.js"),
      },
    },
  };
});
