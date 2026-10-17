import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { EasterEgg } from '@/components/ui/EasterEgg'
import { BlogCategoryPage } from '@/pages/BlogCategory'
import { BlogIndex } from '@/pages/BlogIndex'
import { BlogPostPage } from '@/pages/BlogPost'
import { Home } from '@/pages/Home'
import { NotFound } from '@/pages/NotFound'
import { resolveRoute } from '@/routes'

/**
 * Root component. The route is derived from the pathname, which is passed in
 * explicitly so the same tree can be produced on the server (prerender) and in
 * the browser (hydration) without touching `window` during render.
 */
export function App({ pathname }: { pathname: string }) {
  const route = resolveRoute(pathname)

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader currentPath={route.path} />
      <main id="main">
        {route.name === 'home' ? <Home /> : null}
        {route.name === 'blog' ? <BlogIndex /> : null}
        {route.name === 'category' ? <BlogCategoryPage categorySlug={route.categorySlug} /> : null}
        {route.name === 'post' ? <BlogPostPage slug={route.slug} /> : null}
        {route.name === 'notFound' ? <NotFound /> : null}
      </main>
      <SiteFooter />
      {route.name === 'home' || route.name === 'notFound' ? <EasterEgg /> : null}
    </>
  )
}
