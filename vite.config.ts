import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    proxy: {
      '/api/football': {
        target: 'https://api.football-data.org/v4',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost')
          return decodeURIComponent(url.searchParams.get('path') ?? '/')
        },
        headers: {
          'X-Auth-Token': process.env.VITE_FOOTBALL_API_KEY ?? '',
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Pulse',
        short_name: 'Pulse',
        description: 'Live financial news and FIFA World Cup 2026',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/finnhub\.io\/api\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'finnhub-cache', expiration: { maxAgeSeconds: 300 } },
          },
          {
            urlPattern: /^https:\/\/api\.football-data\.org\//,
            handler: 'NetworkFirst',
            options: { cacheName: 'football-cache', expiration: { maxAgeSeconds: 300 } },
          },
        ],
      },
    }),
  ],
})
