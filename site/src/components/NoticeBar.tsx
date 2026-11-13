import { ArrowRight } from 'lucide-react'
import { blogIndexHref, blogPosts, formatDate, latestPosts, postHref } from '@/data/blog'

/**
 * Site-wide announcement strip pinned under the header. It advertises the
 * newest post on every page, which is also the strongest internal link the
 * site can give a fresh article. Rendered on the server as a real anchor.
 */
export function NoticeBar({ currentSlug }: { currentSlug?: string }) {
  const [post] = latestPosts(1)
  if (!post || post.slug === currentSlug) return null

  return (
    <aside className="notice" aria-label="Latest article">
      <div className="wrap notice__inner">
        <span className="notice__tag">
          <span className="notice__pulse" aria-hidden="true" />
          New
        </span>

        <a className="notice__link" href={postHref(post.slug)}>
          <span className="notice__title">{post.title}</span>
          <ArrowRight className="notice__arrow" size={14} aria-hidden="true" />
        </a>

        <time className="notice__date" dateTime={post.date}>
          {formatDate(post.date)}
        </time>

        <a className="notice__all" href={blogIndexHref}>
          All {blogPosts.length} notes
        </a>
      </div>
    </aside>
  )
}
