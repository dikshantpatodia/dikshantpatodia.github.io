---
title: "Compiler-driven UI: the end of manual memoisation"
date: 2026-11-06
category: Performance
summary: React Compiler removes the dependency array from your job. What it does at build time, where signals beat it, and the cases neither one fixes.
tags: React Compiler, Signals, Fine-grained reactivity, React performance
---

There is a particular kind of code review where someone adds `useMemo` to a component, cannot explain which dependency changed, and the pull request is approved because the profiler got slightly better. The dependency array has quietly become the most-reviewed line in many React codebases, and most of us are guessing.

Memoisation is a cache with manual invalidation, maintained by humans. Humans are famously bad at invalidating caches. That is the problem compilers and signals are both attacking, from opposite directions.

I covered the [React 19 release](/blog/react-19-whats-changed/) separately; this is the optimisation model underneath it.

## What manual memoisation actually costs

Two failure modes, and most teams have both.

**Forgetting it.** A parent re-renders, a child with an expensive chart re-renders with it, and the fix is a `React.memo` plus three `useCallback`s that nobody dares delete.

**Over-applying it.** Every value wrapped, every handler stabilised, and the component is harder to read than the problem it solves.

## What the compiler does instead

React Compiler is a build-time pass. It parses your components and hooks, works out which values are reactive, and rewrites the function to cache them — roughly the memoisation you would write, but per expression and without the array.

It only touches functions that look like components or hooks, and it emits calls into a small runtime (`react/compiler-runtime`) rather than inlining the logic. Conceptually, this:

```tsx
function InvoiceList({ invoices, query }: Props) {
  const visible = invoices.filter((i) => i.client.includes(query))
  const total = visible.reduce((sum, i) => sum + i.amount, 0)

  return (
    <Table
      rows={visible}
      footer={<Total value={total} />}
      onSelect={(id) => select(id)}
    />
  )
}
```

becomes something closer to this, with cache slots keyed by position:

```js
function InvoiceList(t0) {
  const $ = c(5) // five memo slots
  let visible
  if ($[0] !== invoices || $[1] !== query) {
    visible = invoices.filter((i) => i.client.includes(query))
    $[0] = invoices; $[1] = query; $[2] = visible
  } else {
    visible = $[2]
  }
  // ...same idea for total and the inline handler
}
```

You do not write that. The compiler can see the data flow, so it caches without you maintaining a list — and props stay stable when their inputs are stable, which makes `React.memo` largely redundant.

## The catch is the rules, not the tool

The compiler is only sound if your components are pure. Mutating a prop during render, writing to a ref another component reads, or calling a hook conditionally will either produce a bailout — the component is silently skipped — or correct-looking code with stale values.

Three consequences:

- **Treat the rules as a build requirement.** The hooks lint rules now include compiler checks; a warnings-only setup means silent bailouts everywhere.
- **Expect a migration tax.** Code that "worked" because it re-rendered on every parent update can change behaviour once renders are cached. That is a hidden dependency you just found.
- **Keep an escape hatch.** `"use no memo"` opts a function out while you debug it.

Where it does not help: context changes still notify every consumer, a waterfall still waterfalls, and an expensive computation is cached, not made cheaper. It does not replace profiling.

## Signals: the same problem, solved at a different granularity

React re-renders a component and reconciles its subtree. Signals take the other approach: a value tracks who read it, and a write updates only the bindings that read it. No component diff for the changed value.

```ts
import { signal, computed, effect } from '@preact/signals-core'

const price = signal(100)
const quantity = signal(2)
const total = computed(() => price.value * quantity.value)

effect(() => render(total.value))
quantity.value = 3 // only this effect re-runs
```

The mechanics are a dependency graph. Reading `.value` inside a computation subscribes it. Writing marks dependents dirty and schedules them. Computed values are lazy: they mark themselves stale and recompute on read — the "push-pull" model that keeps a diamond-shaped graph consistent instead of glitching halfway through an update.

| | React (with compiler) | Signals |
|---|---|---|
| Unit of update | Component | Individual binding |
| Invalidation | Static analysis at build time | Runtime dependency tracking |
| Mental model | Renders are pure functions of props | Values subscribe to values |
| Ecosystem | Everything | Framework-dependent |

Signals are not new — Solid, Vue, Angular, Svelte 5's runes and Qwik all use some version of this — and React has deliberately not adopted them in core. The idiomatic bridge is `useSyncExternalStore`, which lets a signal live outside React and notify a component when it changes:

```ts
function useSignalValue<T>(sig: Signal<T>) {
  return useSyncExternalStore(
    (cb) => sig.subscribe(cb),
    () => sig.value,
  )
}
```

Inside React, that bridge re-renders the component. You get clean external state, not fine-grained DOM updates. The fine-grained benefit shows up when the signal drives something outside React's tree — a canvas, a chart library, a form engine — or when you are not using React at all.

## When to reach for which

**Enable the compiler** on new React work, and on one legacy directory at a time. Profile before and after, then delete the `memo` and `useCallback` that exist only to appease a parent.

**Reach for signals** when updates are high-frequency and local — dragging, typing into a dense editor, animating a canvas — or when you are choosing a framework and want update cost to scale with bindings rather than component count. Do not bolt a signal library onto a React app expecting the render model to change; it will not.

**Neither** fixes a slow query, a bloated bundle, or a list rendering 10,000 nodes. Those stay architecture problems, which is why [the runtime work](/blog/javascript-performance-optimization/) matters separately.

Optimising by hand was a skill because the runtime could not see your intent. Compilers and signals close that gap in different places, and the job moves from writing the cache to deciding what deserves one.

Start small: enable the compiler on one feature folder, run the tests, and profile the screen you complain about most. If nothing changes, the bottleneck was never the memo array.
