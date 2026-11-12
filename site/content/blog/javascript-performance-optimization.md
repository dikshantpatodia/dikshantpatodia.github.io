---
title: "JavaScript Performance Optimization: Building Faster Web Applications"
date: 2026-11-02
category: Performance
summary: Debounce what, memoise where? A diagnosis-first guide to debouncing, throttling, memoisation, lazy loading, delegation and the leaks that survive every other fix.
tags: JavaScript, Performance, Core Web Vitals, React
---

Most JavaScript performance advice is a list of techniques with no decision procedure. Debounce your handlers. Memoize your components. Lazy load everything. Ten items, no diagnosis, and no way to tell which of them is relevant to the page that is slow right now.

The techniques are easy. Knowing which one applies is the skill, and it starts with a profile rather than a checklist.

I have written before about [why the expensive performance decisions are architectural](/blog/performance-improvements-start-as-architecture-decisions/) — what ships, when it ships, and how much of it. This is the layer underneath: the code you write once the bundle is already reasonable, and the runtime costs that survive every build optimisation.

## Measure before you touch anything

You need three numbers: what the user waits for (INP and LCP), what the main thread is doing (long tasks), and what your code thinks is happening (marks). Core Web Vitals gives you the first. The Performance panel gives you the second. `performance.mark` gives you the third, and it is the only one that knows about *your* features.

```ts
performance.mark('search:start')
const results = await search(query)
performance.mark('search:end')
performance.measure('search', 'search:start', 'search:end')
```

Long Animation Frames — `PerformanceObserver` with `type: 'long-animation-frame'` — attribute slow frames to scripts. Browser support is not universal, so treat it as a diagnostic in Chrome rather than a production metric everywhere. The same caution applies to `scheduler.yield()`, which is the cleanest way to break up long tasks where it is available: check support, and fall back to `setTimeout` chunking.

The rule that saves the most time: optimise the thing the profile shows, not the thing the internet told you about. I have seen teams add `useMemo` to a component that spent 200ms decoding JSON, and I have seen them virtualise a list of forty rows.

## Debounce and throttle are not interchangeable

Debouncing waits for quiet. Throttling limits frequency. Getting them backwards is the most common performance bug I review.

```ts
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  wait = 250,
) {
  let timer: ReturnType<typeof setTimeout> | undefined

  const debounced = (...args: A) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }

  debounced.cancel = () => clearTimeout(timer)
  return debounced
}

export function throttle<A extends unknown[]>(
  fn: (...args: A) => void,
  interval = 100,
) {
  let last = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  return (...args: A) => {
    const now = Date.now()
    const remaining = interval - (now - last)

    if (remaining <= 0) {
      last = now
      fn(...args)
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now()
        timer = undefined
        fn(...args)
      }, remaining)
    }
  }
}
```

Use debounce for input that triggers work: search, validation, autosave. Use throttle for events that fire faster than you can render: scroll, resize, pointer move. And cancel your debounce on unmount, or your component will call `setState` after it is gone — which React 18+ no longer warns about, so the leak is silent.

Two mistakes worth naming. Debouncing a search input by 800ms makes a fast app feel broken; 200–300ms is usually the right range, and `useDeferredValue` often beats both because it keeps the input responsive without an arbitrary delay. Throttling a scroll listener without `{ passive: true }` means the browser waits for your handler before it can scroll, which is worse than no throttle at all.

```tsx
function SearchBox({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query)

  useEffect(() => {
    if (deferred.trim().length < 2) return
    const controller = new AbortController()
    onSearch(deferred) // the caller passes the signal through to fetch
    return () => controller.abort()
  }, [deferred, onSearch])

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />
}
```

## Memoisation: at boundaries, not on every line

`useMemo` and `useCallback` are not free. They allocate, they add a dependency array to maintain, and they make a component harder to read. They pay off in three situations: an expensive computation, a referentially stable value passed to a memoised child, or a dependency of an effect that would otherwise re-run.

```tsx
// Worth it: sorting and filtering 10k rows on every keystroke
const visible = useMemo(
  () => rows.filter(matches(query)).sort(byDate),
  [rows, query],
)

// Not worth it: a string concatenation
const label = useMemo(() => `${first} ${last}`, [first, last])
```

Memoise at component boundaries, not inside render bodies. And check the assumption: `React.memo` only helps if the parent re-renders often and the props are actually stable. If you pass a new object literal every render, you have paid for the comparison and got nothing.

The React Compiler changes this calculus — it inserts memoisation automatically where it can prove it is safe. If you are on it, most manual `useMemo` becomes noise. If you are not, the rules above still hold. Either way, the compiler does not fix a component that renders 10,000 DOM nodes.

For pure functions outside React, cache at module level with a bounded map. An unbounded `Map` keyed by user input is a memory leak with extra steps.

## Lazy loading is about when, not whether

Route-level splitting is table stakes. The interesting decision is what happens before the user asks.

```tsx
const Reports = lazy(() => import('./routes/Reports'))

// Prefetch on intent, not on idle-everything
<Link to="/reports" onMouseEnter={() => import('./routes/Reports')}>
  Reports
</Link>
```

Prefetching on hover, focus, or viewport entry gives you most of the benefit with a fraction of the network cost. Prefetching every route on load is a way to make the bundle smaller in the report and slower in reality.

For long pages, `content-visibility: auto` with `contain-intrinsic-size` lets the browser skip rendering off-screen sections. It is a CSS win with a JavaScript-sized impact and almost no code:

```css
.section {
  content-visibility: auto;
  contain-intrinsic-size: auto 600px;
}
```

For images, the loading strategy matters more than the format: explicit `width` and `height` to prevent layout shift, `loading="lazy"` below the fold, and a `srcset` that does not ship a 2000px asset to a 400px slot.

## Event delegation, and why React already does it

React attaches listeners at the root and synthesises events, so the classic "one handler instead of a thousand" advice is already implemented for you. What still costs you is what you put *inside* those handlers.

Three real wins remain:

- **Stop creating closures per row.** A thousand `onClick={() => select(id)}` handlers allocate a thousand functions per render. One delegated handler reading `data-id` from `event.target.closest('[data-id]')` is cheaper and often clearer.
- **Do not `stopPropagation` by default.** It breaks delegation, analytics, and every parent that needed to know. Stop the event you actually need to stop.
- **Guard against thrash.** A scroll handler that reads `scrollY` and writes layout in the same frame forces a synchronous reflow. Batch reads, then writes, or schedule the write with `requestAnimationFrame`.

```tsx
function RowList({ rows }: { rows: Row[] }) {
  const onClick = (e: React.MouseEvent<HTMLUListElement>) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-id]')
    if (el?.dataset.id) select(el.dataset.id)
  }

  return (
    <ul onClick={onClick}>
      {rows.map((row) => (
        <li key={row.id} data-id={row.id}>{row.label}</li>
      ))}
    </ul>
  )
}
```

The `key` is doing the real work here. An index key on a sortable list makes React reconcile the wrong nodes, which is a correctness bug that presents as a performance bug.

## Memory leaks: the four patterns that cause almost all of them

A leak in a single-page app is not a leak of one object. It is a retained component tree, its closures, and every DOM node it referenced, multiplied by every navigation.

```tsx
useEffect(() => {
  const controller = new AbortController()
  const onResize = () => setWidth(window.innerWidth)
  const observer = new ResizeObserver(measure)

  window.addEventListener('resize', onResize)
  observer.observe(ref.current!)

  fetch('/api/data', { signal: controller.signal }).then(setData)

  return () => {
    controller.abort()
    window.removeEventListener('resize', onResize)
    observer.disconnect()
  }
}, [])
```

The four patterns: a listener without removal, a timer without `clearInterval`, an observer without `disconnect`, and a closure that captures a large object and is retained by a promise that never settles. `FinalizationRegistry` is not a fix — it is a diagnostic tool with no timing guarantees.

To find them, take two heap snapshots around a repeated interaction and diff the retained sizes. If a component you navigated away from is still in the retainer tree, you have a listener or a timer. It is almost always a listener or a timer.

## Rendering: the part that survives every micro-optimisation

Everything above is noise if you render 10,000 DOM nodes. The biggest single win in most data-heavy React applications is virtualisation: render the twenty rows in view, not the ten thousand in memory.

```tsx
function VirtualList({ rows, rowHeight = 44, height = 600 }: Props) {
  const [scrollTop, setScrollTop] = useState(0)
  const start = Math.floor(scrollTop / rowHeight)
  const visible = rows.slice(start, start + Math.ceil(height / rowHeight) + 1)

  return (
    <div
      style={{ height, overflowY: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: rows.length * rowHeight, position: 'relative' }}>
        {visible.map((row, i) => (
          <div
            key={row.id}
            style={{
              position: 'absolute',
              top: (start + i) * rowHeight,
              height: rowHeight,
            }}
          >
            {row.label}
          </div>
        ))}
      </div>
    </div>
  )
}
```

Use a library for anything with variable heights, sticky headers, or accessibility requirements — this is a sketch, not a replacement for TanStack Virtual. The point is the decision, not the implementation.

Two more rendering rules. Keep updates that can be interrupted inside `startTransition`, so typing does not wait for a heavy list to re-render. And batch your own state updates outside React events — automatic batching covers event handlers and promises in React 18+, but a `setTimeout` loop that calls `setState` fifty times still renders fifty times.

## A scenario, end to end

A dashboard with a 10,000-row table, a search box, and a live-updating chart.

The table was rendering every row: 1,400ms of scripting on filter. Virtualisation brought it to 90ms. The search box fired a request per keystroke and rendered results out of order: `useDeferredValue` plus an `AbortController` fixed both the responsiveness and the race. Each row had an inline `onClick` closure and an inline `style` object, so every render allocated 10,000 objects; a delegated handler and CSS classes removed the churn. The chart subscribed to a websocket in an effect with no cleanup, so every navigation added another listener — two days of "it gets slower after a while" explained by one missing `return`.

None of those fixes required a new library. All of them required looking at a profile first.

## The checklist I actually use

1. Is it slow on first load, or slow after interaction? Different problems.
2. What is the long task? Open the Performance panel before adding memo.
3. Does the handler need to run on every event, or the latest one? Debounce or throttle.
4. Is the expensive work in render, or in an effect that re-runs? Memo the boundary, not the line.
5. Are you rendering more nodes than the user can see? Virtualise.
6. Did every navigation add a listener? Check the cleanup, not the framework.
7. Is the interaction interruptible? `startTransition` for the heavy part, urgent update for the input.

The technique list is the easy part. The list is only useful when the profile tells you which line applies.
