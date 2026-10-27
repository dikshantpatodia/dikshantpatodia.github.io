import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'

import './styles/index.css'
import { App } from './App'

const container = document.getElementById('root')
if (!container) throw new Error('Root container #root was not found.')

// Dev only: `vite dev` serves this one shell for every URL, so the <head> would
// keep the home page's title on every blog route. Prerendered builds do not run
// this — Vite removes the branch from production output.
if (import.meta.env.DEV) {
  void import('./lib/dev-head').then(({ syncHead }) => syncHead(window.location.pathname))
}

// The pathname is read once at startup; navigation between pages is a normal
// full page load (each route is prerendered), so no client router is needed.
const app = (
  <StrictMode>
    <App pathname={window.location.pathname} />
  </StrictMode>
)

// Production builds prerender every route, so hydrate. `vite dev` serves an
// empty root, so fall back to a client render.
if (container.hasChildNodes()) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
