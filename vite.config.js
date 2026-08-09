import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/ScoreGame/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: [],
        runtimeCaching: [],
      },
      manifest: {
        name: 'ScoreGame',
        short_name: 'ScoreGame',
        description: 'Suivi de scores pour jeux de société',
        theme_color: '#060612',
        background_color: '#060612',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/ScoreGame/',
        start_url: '/ScoreGame/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})