// The configuration file for Vite (local dev server and build tool). Edit this if you need to set up API proxies, change ports, or add plugins.

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
