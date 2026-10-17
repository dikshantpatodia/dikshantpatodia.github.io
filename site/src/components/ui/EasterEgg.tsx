import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

const SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown']
const MESSAGE = '↑↑↓↓ — you found the hidden branch. Now ship it.'

/**
 * A small, optional easter egg: the opening of a Konami code reveals a toast.
 * Purely additive — nothing depends on it, and it never blocks interaction.
 */
export function EasterEgg() {
  const [shown, setShown] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    let position = 0
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return

      if (event.key === SEQUENCE[position]) {
        position += 1
        if (position === SEQUENCE.length) {
          position = 0
          setShown(true)
        }
      } else {
        position = event.key === SEQUENCE[0] ? 1 : 0
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!shown) return
    const timer = window.setTimeout(() => setShown(false), 4200)
    return () => window.clearTimeout(timer)
  }, [shown])

  useEffect(() => {
    // A note for anyone who opens the console.
    console.log(
      '%cYou opened the console. Let’s talk about the parts that are hard to retrofit → https://www.dikshantpatodia.in/#contact',
      'color:#2440e0;font-family:monospace;font-size:12px',
    )
  }, [])

  return (
    <AnimatePresence>
      {shown ? (
        <motion.div
          className="toast"
          role="status"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {MESSAGE}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
