import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        strictExecutionOrder: true,
        codeSplitting: {
          maxSize: 450_000,
          groups: [
            {
              name: 'pdf',
              test: /node_modules[\\/](?:pdfjs-dist|pdf-parse)[\\/]/,
              priority: 30,
              maxSize: 450_000,
            },
            {
              name: 'spreadsheet',
              test: /node_modules[\\/]xlsx[\\/]/,
              priority: 30,
              maxSize: 450_000,
            },
            {
              name: 'charts',
              test: /node_modules[\\/](?:recharts|d3-[^\\/]+)[\\/]/,
              priority: 20,
              includeDependenciesRecursively: true,
            },
            {
              name: 'backend',
              test: /node_modules[\\/]@supabase[\\/]/,
              priority: 20,
              maxSize: 450_000,
            },
            {
              name: 'react',
              test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/,
              priority: 20,
              maxSize: 450_000,
            },
            {
              name: 'features',
              test: /src[\\/]components[\\/]/,
              priority: 10,
              maxSize: 450_000,
              includeDependenciesRecursively: false,
            },
            {
              name: 'data',
              test: /src[\\/]data[\\/]/,
              priority: 10,
              maxSize: 450_000,
              includeDependenciesRecursively: false,
            },
            {
              name: 'vendor',
              test: /node_modules[\\/]/,
              priority: 1,
              maxSize: 450_000,
            },
          ],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
