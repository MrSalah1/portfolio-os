import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  /*
    The site is published as a GitHub Pages project site, which is served from
    https://<user>.github.io/<repo>/ rather than from the domain root. Assets
    are therefore emitted under /portfolio-os/; without this the bundle and the
    favicon resolve to paths that 404 on Pages and the page renders blank.

    Changing this means changing the repository name too: the base is the
    repository name, not a preference.
  */
  base: '/portfolio-os/',
  plugins: [react(), tailwindcss()],
})
