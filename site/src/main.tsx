import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'

import './styles/index.css'
import { App } from './App'

const container = document.getElementById('root')
if (!container) throw new Error('Root container #root was not found.')

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
