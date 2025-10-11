import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["@nwpr/airport-codes"],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})
