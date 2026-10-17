import { PostList } from '@/components/PostList'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { blogCategories, blogIndexHref, categoryHref, getCategory, postsInCategory } from '@/data/blog'
import { NotFound } from './NotFound'

export function BlogCategoryPage({ categorySlug }: { categorySlug: string }) {
  const category = getCategory(categorySlug)
  if (!category) return <NotFound />

  const posts = postsInCategory(categorySlug)

  return (
    <div className="wrap blog">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: blogIndexHref },
          { label: category.name },
        ]}
      />

      <header className="blog-head">
        <span className="eyebrow">Category</span>
        <h1 className="blog-head__title">{category.name}</h1>
        <p className="blog-head__lede">
          {posts.length} {posts.length === 1 ? 'note' : 'notes'} filed under {category.name}.
        </p>
      </header>

      <nav className="cats" aria-label="Filter by category">
        <a className="cats__item" href={blogIndexHref}>
          All
        </a>
        {blogCategories.map((item) => (
          <a
            className="cats__item"
            key={item.slug}
            href={categoryHref(item.slug)}
            aria-current={item.slug === categorySlug ? 'page' : undefined}
          >
            {item.name}
            <span className="idx">{item.count}</span>
          </a>
        ))}
      </nav>

      <PostList posts={posts} />
    </div>
  )
}
