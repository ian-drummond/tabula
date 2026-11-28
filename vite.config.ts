import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { APP_NAME, TAGLINE } from './src/brand.ts'

// The web app manifest is built from src/brand.ts so the installed app's name has one source.
function brandManifest(): Plugin {
  const body = () =>
    JSON.stringify(
      {
        name: APP_NAME,
        short_name: APP_NAME,
        description: TAGLINE,
        start_url: '/',
        display: 'standalone',
        background_color: '#f5f5f7',
        theme_color: '#ffffff',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      null,
      2,
    )
  return {
    name: 'brand-manifest',
    configureServer(server) {
      server.middlewares.use('/manifest.webmanifest', (_req, res) => {
        res.setHeader('Content-Type', 'application/manifest+json')
        res.end(body())
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: body() })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), brandManifest()],
  // only public values: the integration's secret keys have no NEXT_PUBLIC_ prefix
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
})
