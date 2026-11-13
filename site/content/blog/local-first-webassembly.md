---
title: "Local-first web apps with WebAssembly: instant, offline, in sync"
date: 2026-11-11
category: Architecture
summary: Ship the database to the browser. How local-first sync, SQLite in WASM and conflict resolution work — and why the hard part is never the storage.
tags: Local-first, WebAssembly, Offline, CRDT, IndexedDB
---

Open a note-taking app on a train and type. Then open a typical CRUD dashboard and watch a spinner chase a request that will never land. Both read records and let a human change them. Only one assumed the network might be missing.

Local-first flips the default. The device holds the data and answers every read immediately. The server becomes a sync target rather than a prerequisite. Done well, the app is instant, works on a plane, and survives a flaky connection without an error toast.

Done badly, you have built a distributed system with untrained operators, no staging environment, and a conflict problem you did not budget for.

## What local-first actually means

Three properties, in order of importance:

1. **Reads and writes hit local storage first.** No network on the critical path.
2. **Writes are durable immediately.** A refresh or a closed tab does not lose them.
3. **Sync converges.** Two devices that have seen the same operations end in the same state.

The third is where the work is. The architecture has four pieces — a local store, an outbox of operations, a sync engine, and a merge rule — and the merge rule decides whether your product behaves well or quietly deletes a user's work.

## Why WebAssembly is in this conversation

IndexedDB works, but querying it by hand means no joins, no aggregates, and awkward transactions.

Now SQLite compiles to WebAssembly, with an official build that writes to the Origin Private File System. PGlite puts Postgres in a WASM bundle; DuckDB-WASM brings analytical queries client-side. `sql.js` remains the simplest start: it trades persistence for a stable API and lets you hold the bytes yourself.

```ts
// db.ts — sql.js, with the snapshot persisted to IndexedDB
import initSqlJs from 'sql.js'

export const db = await (async () => {
  const SQL = await initSqlJs({ locateFile: (f) => `/wasm/${f}` })
  const snapshot = await loadSnapshot() // Uint8Array | undefined
  return snapshot ? new SQL.Database(snapshot) : new SQL.Database()
})()
```

Expect roughly a megabyte before compression, so the bundle is usually fetched lazily — after first paint, or when the workspace opens.

## Writing locally, syncing later

Write to the local table, record the operation, return. That is the whole trick to feeling instant.

```ts
export async function addTask(input: NewTask) {
  const task = {
    id: crypto.randomUUID(),
    ...input,
    done: 0,
    updatedAt: Date.now(),
    device: DEVICE_ID,
  }

  db.run(
    'INSERT INTO tasks (id, title, done, updated_at, device) VALUES (?, ?, 0, ?, ?)',
    [task.id, task.title, task.updatedAt, task.device],
  )
  db.run('INSERT INTO outbox (op, payload, created_at) VALUES (?, ?, ?)', [
    'task.create',
    JSON.stringify(task),
    Date.now(),
  ])

  await persistSnapshot()
  void flush() // fire and forget
  return task
}
```

The sync loop drains the outbox and stops on first failure, so a create lands before an update to the same row.

```ts
export async function flush() {
  if (!navigator.onLine) return
  const pending = toObjects(db.exec('SELECT id, op, payload FROM outbox ORDER BY created_at LIMIT 50'))

  for (const op of pending) {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(op),
    })
    if (!res.ok) return // keep the op, retry later
    db.run('DELETE FROM outbox WHERE id = ?', [op.id])
  }
}

window.addEventListener('online', flush)
```

Two details: the server must be idempotent per operation id, or a timeout retry creates duplicates; and `flush` needs a guard so two tabs do not drain the same outbox.

## Conflicts: choose your failure mode

Two devices edit the same row. You have three options.

**Last write wins, per field.** Cheap, predictable, and it silently discards the losing edit. Tie-break deterministically so every client agrees:

```ts
function merge(local: Task, remote: Task): Task {
  if (local.updatedAt !== remote.updatedAt) {
    return local.updatedAt > remote.updatedAt ? local : remote
  }
  return local.device > remote.device ? local : remote
}
```

Note the assumption: clocks are roughly right. They often are not. Prefer a server-assigned logical counter where you can, and treat `Date.now()` as a display value.

**Operation log with a rebase.** Each client replays pending operations over server state. Better for structured edits, more code to maintain.

**CRDTs.** Yjs and Automerge converge without a central arbiter, which is why every collaborative editor reaches for them. They also bring memory overhead, a data model you design around, and harder debugging.

For most business apps, per-field last-write-wins is the right default. Reserve CRDTs for text, where simultaneous editing *is* the product.

## The trade-offs nobody puts on the slide

**Storage can be evicted.** Browsers may clear origin data under pressure, and Safari has historically capped script-writable storage at seven days for non-installed sites. Call `navigator.storage.persist()`, check `estimate()`, and never treat local data as a backup.

**Migrations run on devices you cannot reach.** Write forward-only migrations, version the local schema, and test upgrades from older clients.

**Security gets worse before it gets better.** Local data is readable by any script on the origin, so an XSS becomes full-database exfiltration. Encrypt sensitive fields if you must, and keep authorization on the server.

**Multi-tab is a distributed system too.** Two tabs, two writers, one snapshot. Serialise through a lock or a worker, or you will corrupt the file.

**You own the cold start.** A megabyte of WASM plus hydration is real cost. Measure time to interactive, not bundle size.

## Where it pays off

Worth it: field apps on unreliable connections, editors and canvases, anything where latency is the product. Not worth it: server-authoritative money movement, one-off forms, dashboards stale in five minutes, and small CRUD apps a cached API would serve just as well.

## Try it this week

Start with the read path, not the sync engine. Cache what a screen needs in IndexedDB, hydrate from it, then revalidate. That alone removes the spinner and surfaces the invalidation bugs.

Then add one offline write: a single mutation with an outbox row and an idempotent endpoint. Keep it to one operation until retries and duplicates behave.

WASM comes third. When a screen genuinely needs joins and aggregates, load SQLite or PGlite after first paint. If you never hit that screen, you never pay for the megabyte.
