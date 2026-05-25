import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/nysoaconstruct/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Nysoa BTP',
        short_name: 'NysoaBTP',
        theme_color: '#1a1a2e',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: '/nysoaconstruct/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/nysoaconstruct/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
