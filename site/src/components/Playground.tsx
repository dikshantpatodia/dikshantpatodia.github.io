import { useId, useRef, useState } from 'react'
import type { ComponentType, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { SectionHead } from './ui/SectionHead'
import { ArchitectureExplorer } from './ArchitectureExplorer'
import { PerformanceLab } from './PerformanceLab'
import { Decisions } from './Decisions'

const TABS = [
  { id: 'architecture', label: 'Architecture explorer' },
  { id: 'performance', label: 'Performance lab' },
  { id: 'decisions', label: 'Engineering decisions' },
] as const

type TabId = (typeof TABS)[number]['id']

const PANELS: Record<TabId, ComponentType> = {
  architecture: ArchitectureExplorer,
  performance: PerformanceLab,
  decisions: Decisions,
}

/**
 * All three panels are always rendered; inactive ones carry the `hidden`
 * attribute. Without JavaScript a <noscript> style reveals every panel and
 * hides the tab list, so the content is never trapped behind JS.
 */
export function Playground() {
  const [active, setActive] = useState<TabId>('architecture')
  const baseId = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const select = (index: number) => {
    const tab = TABS[index]
    if (!tab) return
    setActive(tab.id)
    tabRefs.current[index]?.focus()
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const current = TABS.findIndex((tab) => tab.id === active)
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      select((current + 1) % TABS.length)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      select((current - 1 + TABS.length) % TABS.length)
    } else if (event.key === 'Home') {
      event.preventDefault()
      select(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      select(TABS.length - 1)
    }
  }

  return (
    <section className="section wrap" id="playground" aria-labelledby="playground-title">
      <SectionHead
        index="02"
        label="Playground"
        titleId="playground-title"
        title={<>How I think, made explorable.</>}
        lede="Three small, functional demonstrations: an architecture you can inspect, a performance trade-off you can see, and the decisions I reach for when the diagram is ambiguous."
      />

      <div
        className="playground__tabs"
        role="tablist"
        aria-label="Engineering playground"
        onKeyDown={onKeyDown}
      >
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            ref={(node) => {
              tabRefs.current[index] = node
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`${baseId}-panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            className="tab"
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {TABS.map((tab) => {
        const Panel = PANELS[tab.id]
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${baseId}-panel-${tab.id}`}
            aria-labelledby={`${baseId}-tab-${tab.id}`}
            tabIndex={0}
            className="panel"
            hidden={active !== tab.id}
          >
            <Panel />
          </div>
        )
      })}
    </section>
  )
}
