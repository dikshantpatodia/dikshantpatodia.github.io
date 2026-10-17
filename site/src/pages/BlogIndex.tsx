import { PostList } from '@/components/PostList'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { blogCategories, blogPosts } from '@/data/blog'

export function BlogIndex() {
  return (
    <div className="wrap blog">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />

      <header className="blog-head">
        <span className="eyebrow">Blog</span>
        <h1 className="blog-head__title">Notes on frontend engineering.</h1>
        <p className="blog-head__lede">
          Short essays on the decisions that are easy to get wrong — architecture, performance,
          design systems, and testing. Written for review, not for volume.
        </p>
      </header>

      <nav className="cats" aria-label="Filter by category">
        <span className="cats__item cats__item--current" aria-current="page">
          All
          <span className="idx">{blogPosts.length}</span>
        </span>
        {blogCategories.map((category) => (
          <a className="cats__item" key={category.slug} href={`/blog/category/${category.slug}`}>
            {category.name}
            <span className="idx">{category.count}</span>
          </a>
        ))}
      </nav>

      <PostList posts={blogPosts} />
    </div>
  )
}
