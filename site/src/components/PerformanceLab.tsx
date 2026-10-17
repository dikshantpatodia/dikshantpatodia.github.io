import { useState } from 'react'
import { perfRoutes } from '@/data/content'
import { cn } from '@/lib/cn'

type Strategy = 'eager' | 'split'

const STRATEGIES: Array<{ id: Strategy; label: string }> = [
  { id: 'eager', label: 'Everything up front' },
  { id: 'split', label: 'Split by route + defer' },
]

/**
 * A lightweight, illustrative comparison of two shipping strategies. The
 * figures are a model for the demonstration and are labelled as such.
 */
export function PerformanceLab() {
  const [strategy, setStrategy] = useState<Strategy>('eager')

  const max = Math.max(...perfRoutes.map((route) => route.eager))
  const eagerTotal = perfRoutes.reduce((sum, route) => sum + route.eager, 0)
  const splitTotal = perfRoutes.reduce((sum, route) => sum + route.split, 0)
  const reduction = Math.round(((eagerTotal - splitTotal) / eagerTotal) * 100)

  return (
    <div>
      <p className="panel__intro">
        The same three routes under two shipping strategies. Splitting by route means each page pays
        only for itself; deferring moves the rest behind interaction. The figures are an illustrative
        model, not a measurement of any specific site.
      </p>

      <div className="perf__controls" role="group" aria-label="Shipping strategy">
        {STRATEGIES.map((option) => (
          <button
            key={option.id}
            type="button"
            className="tab"
            aria-pressed={strategy === option.id}
            onClick={() => setStrategy(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="perf__bars">
        {perfRoutes.map((route) => {
          const value = strategy === 'eager' ? route.eager : route.split
          const percent = Math.round((value / max) * 100)
          return (
            <div className="perf-bar" key={route.id}>
              <div className="perf-bar__top">
                <span className="perf-bar__label">{route.label}</span>
                <span className="perf-bar__value">{value} KB</span>
              </div>
              <div
                className="perf-bar__track"
                role="img"
                aria-label={`${route.label}: ${value} kilobytes of initial JavaScript`}
              >
                <div
                  className={cn('perf-bar__fill', strategy === 'split' && 'perf-bar__fill--accent')}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="perf__legend">
        <span>
          <span className="perf__swatch" style={{ background: 'var(--color-ink)' }} aria-hidden="true" />
          Everything up front
        </span>
        <span>
          <span className="perf__swatch" style={{ background: 'var(--color-accent)' }} aria-hidden="true" />
          Split by route
        </span>
      </div>

      <p className="panel__note">
        Illustrative model ·{' '}
        {strategy === 'split'
          ? `${reduction}% less initial JavaScript across the three routes`
          : 'no route-level splitting'}
      </p>
    </div>
  )
}
