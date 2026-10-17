import { getCategory, getPost } from './data/blog'

export type Route =
  | { name: 'home'; path: '/' }
  | { name: 'blog'; path: '/blog' }
  | { name: 'category'; path: string; categorySlug: string }
  | { name: 'post'; path: string; slug: string }
  | { name: 'notFound'; path: string }

/** Strips query/hash, adds a leading slash, and drops any trailing slash. */
export function normalise(pathname: string): string {
  const raw = pathname.split('?')[0]?.split('#')[0] ?? '/'
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`
  const trimmed = withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : withSlash
  return trimmed === '' ? '/' : trimmed
}

export function resolveRoute(pathname: string): Route {
  const path = normalise(pathname)

  if (path === '/') return { name: 'home', path: '/' }
  if (path === '/blog') return { name: 'blog', path }

  const segments = path.split('/').filter(Boolean)
  if (segments[0] === 'blog') {
    const second = segments[1]

    if (second === 'category' && segments[2] && segments.length === 3) {
      const categorySlug = segments[2]
      if (getCategory(categorySlug)) return { name: 'category', path, categorySlug }
      return { name: 'notFound', path }
    }

    if (second && segments.length === 2 && getPost(second)) {
      return { name: 'post', path, slug: second }
    }
  }

  return { name: 'notFound', path }
}
