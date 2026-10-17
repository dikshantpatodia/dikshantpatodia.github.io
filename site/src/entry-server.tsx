import { renderToString } from 'react-dom/server'
import { App } from './App'

/**
 * Server entry used only at build time to prerender a route to static HTML.
 * There is no runtime server: the output is written into an index.html per
 * route and the client hydrates it.
 */
export function render(pathname: string): string {
  return renderToString(<App pathname={pathname} />)
}
