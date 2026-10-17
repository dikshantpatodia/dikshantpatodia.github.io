import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { loadPosts } from './scripts/blog-core.mjs'

const blogDir = fileURLToPath(new URL('./content/blog', import.meta.url))

/**
 * Exposes the Markdown files in site/content/blog to the app as
 * `virtual:blog`, so authoring is just "drop in a .md file". The same parser
 * is reused by scripts/prerender.mjs, so client and static output agree.
 */
function blogContent(): Plugin {
  const virtualId = 'virtual:blog'
  const resolvedId = `\0${virtualId}`

  return {
    name: 'blog-content',
    resolveId(id) {
      if (id === virtualId) return resolvedId
      return undefined
    },
    async load(id) {
      if (id !== resolvedId) return undefined
      const posts = await loadPosts(blogDir)
      return `export const posts = ${JSON.stringify(posts)}`
    },
    configureServer(server) {
      server.watcher.add(blogDir)
    },
    handleHotUpdate(context) {
      if (!context.file.startsWith(blogDir)) return undefined
      const module = context.server.moduleGraph.getModuleById(resolvedId)
      if (!module) return undefined
      context.server.moduleGraph.invalidateModule(module)
      return [module]
    },
  }
}

// GitHub Pages custom domain (www.dikshantpatodia.in) serves from the domain
// root, so `base` is "/". If this ever moves to a project subpath, change it
// to "/<repository>/" here and the canonical/OG URLs in index.html.
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), blogContent()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'es2020',
    cssCodeSplit: false,
  },
})
