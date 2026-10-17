import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export function NotFound() {
  return (
    <div className="wrap blog">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Not found' }]} />
      <header className="blog-head">
        <span className="eyebrow">Error 404</span>
        <h1 className="blog-head__title">That page moved, or never existed.</h1>
        <p className="blog-head__lede">
          Try the <a href="/blog/">writing</a>, or head back <a href="/">home</a>.
        </p>
      </header>
    </div>
  )
}
