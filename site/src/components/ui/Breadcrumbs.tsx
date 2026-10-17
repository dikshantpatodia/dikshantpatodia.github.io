export interface Crumb {
  label: string
  href?: string
}

/** Breadcrumb trail. The final crumb is the current page (not a link). */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol className="crumbs__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li className="crumbs__item" key={`${item.label}-${index}`}>
              {item.href && !isLast ? (
                <a href={item.href}>{item.label}</a>
              ) : (
                <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
              )}
              {!isLast ? (
                <span className="crumbs__sep" aria-hidden="true">
                  /
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
