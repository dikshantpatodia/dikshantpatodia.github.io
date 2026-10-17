import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { blogIndexHref, categoryHref, formatDate, getPost, neighbours, postHref } from '@/data/blog'
import { NotFound } from './NotFound'

export function BlogPostPage({ slug }: { slug: string }) {
  const post = getPost(slug)
  if (!post) return <NotFound />

  const { older, newer } = neighbours(slug)

  return (
    <div className="wrap">
      <article className="post">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Blog', href: blogIndexHref },
            { label: post.category, href: categoryHref(post.categorySlug) },
            { label: post.title },
          ]}
        />

        <header className="post__head">
          <h1 className="post__title">{post.title}</h1>
          <p className="post__meta">
            <span className="badge">{post.category}</span>
            <span className="idx">{formatDate(post.date)}</span>
            <span className="idx">{post.minutes} min read</span>
            {post.updated ? (
              <span className="idx post__updated">Updated {formatDate(post.updated)}</span>
            ) : null}
          </p>
          {post.summary ? <p className="post__summary">{post.summary}</p> : null}
        </header>

        {/* Body is authored Markdown, rendered to HTML at build time. */}
        <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />

        {post.tags.length > 0 ? (
          <ul className="post__tags" aria-label="Tags">
            {post.tags.map((tag) => (
              <li className="tag" key={tag}>
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </article>

      {older || newer ? (
        <nav className="post-nav" aria-label="More posts">
          {older ? (
            <a className="post-nav__link" href={postHref(older.slug)}>
              <span className="idx">Older</span>
              <span className="post-nav__title">{older.title}</span>
            </a>
          ) : (
            <span />
          )}
          {newer ? (
            <a className="post-nav__link post-nav__link--next" href={postHref(newer.slug)}>
              <span className="idx">Newer</span>
              <span className="post-nav__title">{newer.title}</span>
            </a>
          ) : null}
        </nav>
      ) : null}

      <p className="post__back">
        <a href={blogIndexHref}>← All notes</a>
      </p>
    </div>
  )
}
