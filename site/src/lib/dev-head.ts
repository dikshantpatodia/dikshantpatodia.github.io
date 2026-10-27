/**
 * Dev-only head sync.
 *
 * Production does not need this: `npm run build` prerenders every route, so each
 * HTML file already carries its own <title>, description, canonical, and social
 * tags. But `vite dev` serves one shell (site/index.html) for every URL, so the
 * tab and the description would otherwise stay on the home page's values for
 * every blog route — which makes the dev server look broken when it is only
 * un-prerendered.
 *
 * The strings here mirror scripts/prerender.mjs. They are duplicated deliberately
 * rather than shared: the prerenderer is plain Node (.mjs) and cannot import the
 * app's TypeScript. Because this module is only loaded behind `import.meta.env.DEV`,
 * Vite removes it from production builds entirely.
 */
import { getCategory, getPost } from '@/data/blog'
import { resolveRoute } from '@/routes'

const SITE = 'Dikshant Patodia'

const HOME_DESCRIPTION =
  'Dikshant Patodia is a senior frontend engineer who architects systems that stay fast under load, scale across teams, and hold up in production — micro frontends, performance, design systems, and testing.'

/** Mirrors the metadata each route gets at build time. */
export function syncHead(pathname: string): void {
  const route = resolveRoute(pathname)

  let title = `${SITE} — Senior Frontend Engineer`
  let description = HOME_DESCRIPTION

  if (route.name === 'blog') {
    title = `Blog — notes on frontend engineering | ${SITE}`
    description =
      'Short essays on architecture, performance, design systems, and testing — the frontend decisions that are easy to get wrong.'
  } else if (route.name === 'category') {
    const category = getCategory(route.categorySlug)
    if (category) {
      title = `${category.name} — blog | ${SITE}`
      description = `Frontend notes filed under ${category.name} by ${SITE}.`
    }
  } else if (route.name === 'post') {
    const post = getPost(route.slug)
    if (post) {
      title = `${post.title} | ${SITE}`
      description = post.summary
    }
  } else if (route.name === 'notFound') {
    title = `Not found — ${SITE}`
    description = `That page does not exist. Browse the ${SITE} blog instead.`
  }

  document.title = title
  document.querySelector('meta[name="description"]')?.setAttribute('content', description)
}
