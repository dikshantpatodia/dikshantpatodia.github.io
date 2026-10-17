import { useState } from 'react'
import { archNodes, archTradeoffs } from '@/data/content'

/**
 * An inspectable, representative micro frontend architecture. Everything is
 * data-driven, so the diagram and its explanations stay in one place.
 */
export function ArchitectureExplorer() {
  const [selectedId, setSelectedId] = useState<string>(archNodes[0]?.id ?? '')
  const selected = archNodes.find((node) => node.id === selectedId) ?? archNodes[0]

  return (
    <div>
      <p className="panel__intro">
        A representative micro frontend: one host shell composing independently deployable remotes
        over a shared design system. Select any part to see what it owns — and what it is not allowed
        to do.
      </p>

      <div className="arch__stage" role="group" aria-label="Architecture components">
        {archNodes.map((node) => (
          <button
            key={node.id}
            type="button"
            className="arch-node"
            data-kind={node.kind}
            aria-pressed={node.id === selectedId}
            onClick={() => setSelectedId(node.id)}
          >
            <span className="arch-node__kind">{node.kind}</span>
            <span className="arch-node__title">{node.title}</span>
            <span className="arch-node__role">{node.role}</span>
          </button>
        ))}
      </div>

      <div className="arch__detail" aria-live="polite">
        {selected ? (
          <>
            <p className="arch__detail-title">{selected.title}</p>
            <p className="arch__detail-body">{selected.detail}</p>
          </>
        ) : null}
      </div>

      <div className="arch__tradeoffs">
        {archTradeoffs.map((tradeoff) => (
          <div className="tradeoff" key={tradeoff.id}>
            <p className="tradeoff__title">{tradeoff.title}</p>
            <p className="tradeoff__body">{tradeoff.body}</p>
          </div>
        ))}
      </div>

      <p className="panel__note">Representative demonstration — not any specific client architecture.</p>
    </div>
  )
}
