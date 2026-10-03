import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Relative base so the build works at any path (GitHub Pages project site,
// a subfolder, or file://). Routing is hash-based for the same reason.
export default defineConfig({ plugins: [svelte()], base: './' })
