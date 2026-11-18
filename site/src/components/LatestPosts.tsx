import { ArrowRight } from 'lucide-react'
import { blogIndexHref, formatDate, homeHighlights, postHref } from '@/data/blog'

/**
 * Announcement band for the home page: the featured post, then the newest
 * ones. Rendered on the server as real anchors, so the links are crawlable and
 * work without JavaScript. No images, so there is nothing to shift after paint.
 */
export function LatestPosts() {
  const posts = homeHighlights(3)
  if (posts.length === 0) return null

  const leadSlug = posts.find((post) => post.featured)?.slug

  return (
    <section className="latest wrap" aria-labelledby="latest-title">
      <div className="latest__panel">
        <div className="latest__intro">
          <p className="latest__eyebrow">
            <span className="latest__dot" aria-hidden="true" />
            New on the blog
          </p>
          <h2 className="latest__title" id="latest-title">
            New notes on frontend engineering.
          </h2>
          <a className="btn btn--line latest__cta" href={blogIndexHref}>
            Read the journal
            <ArrowRight aria-hidden="true" />
          </a>
        </div>

        <ol className="latest__list">
          {posts.map((post) => (
            <li key={post.slug}>
              <a
                className={
                  post.slug === leadSlug ? 'latest-card latest-card--featured' : 'latest-card'
                }
                href={postHref(post.slug)}
              >
                <span className="latest-card__meta">
                  {post.slug === leadSlug ? (
                    <span className="latest-card__flag">Featured</span>
                  ) : null}
                  <span className="latest-card__cat">{post.category}</span>
                  <time className="idx" dateTime={post.date}>
                    {formatDate(post.date)}
                  </time>
                </span>
                <h3 className="latest-card__title">{post.title}</h3>
                <span className="latest-card__more">
                  {post.minutes} min read
                  <ArrowRight size={13} aria-hidden="true" />
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
