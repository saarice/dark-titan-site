import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// `base` is the GitHub Pages project subpath so built asset URLs resolve under
// https://<user>.github.io/dark-titan-site/. Override via the BASE_PATH env var
// if the repo is renamed or served from a custom domain / root.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/dark-titan-site/",
  plugins: [react()],
})
