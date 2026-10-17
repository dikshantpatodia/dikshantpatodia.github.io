import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { CornerDownRight } from 'lucide-react'
import { decisions } from '@/data/content'

type Choice = 'a' | 'b'

/**
 * Short, interactive trade-off explorations. Pick an option to reveal the one
 * I actually reach for — and why.
 */
export function Decisions() {
  const [picks, setPicks] = useState<Record<string, Choice>>({})
  const reduce = useReducedMotion()

  const choose = (id: string, choice: Choice) => {
    setPicks((current) => ({ ...current, [id]: choice }))
  }

  return (
    <div>
      <p className="panel__intro">
        Architecture is mostly trade-offs, and the honest answer is usually “it depends”. Here is
        what it depends on, and the default I reach for when it genuinely is ambiguous.
      </p>

      {decisions.map((decision) => {
        const picked = picks[decision.id]
        return (
          <div className="decision" key={decision.id}>
            <h3 className="decision__question">{decision.question}</h3>
            <div className="decision__options">
              <button
                type="button"
                className="decision__option"
                aria-pressed={picked === 'a'}
                onClick={() => choose(decision.id, 'a')}
              >
                <span className="decision__option-title">{decision.a.title}</span>
                <span className="decision__option-when">{decision.a.when}</span>
                <span className="decision__option-cost">Cost · {decision.a.cost}</span>
              </button>
              <button
                type="button"
                className="decision__option"
                aria-pressed={picked === 'b'}
                onClick={() => choose(decision.id, 'b')}
              >
                <span className="decision__option-title">{decision.b.title}</span>
                <span className="decision__option-when">{decision.b.when}</span>
                <span className="decision__option-cost">Cost · {decision.b.cost}</span>
              </button>
            </div>
            <AnimatePresence initial={false}>
              {picked ? (
                <motion.p
                  className="decision__verdict"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <CornerDownRight aria-hidden="true" />
                  {decision.verdict}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>
        )
      })}

      <p className="panel__note">There is no universally right answer — the context decides.</p>
    </div>
  )
}
