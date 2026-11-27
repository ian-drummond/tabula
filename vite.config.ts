import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // only public values: the integration's secret keys have no NEXT_PUBLIC_ prefix
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
})
