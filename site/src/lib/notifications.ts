import { latestPosts, postHref } from '@/data/blog'

/**
 * Opt-in browser alerts for new posts.
 *
 * The site is static, so there is no server that can wake a device up. What
 * this does instead: once a reader grants permission, every visit compares the
 * newest post with the one they last saw and raises a system notification when
 * there is something new. The service worker also handles Web Push, so the day
 * a small push endpoint exists nothing on the client has to change.
 *
 * Nothing is requested automatically: permission is only asked for on a click,
 * and state is kept in localStorage — no account, no third party, no tracking.
 */
const STORAGE_KEY = 'dp:blog-alerts:v1'
const SERVICE_WORKER = '/sw.js'
const ICON = '/apple-touch-icon.png'
const BADGE = '/favicon.ico'

export type AlertsState = 'checking' | 'unsupported' | 'off' | 'on' | 'denied'

interface AlertsRecord {
  muted: boolean
  seen: { date: string; slug: string } | null
}

const EMPTY: AlertsRecord = { muted: false, seen: null }

function readRecord(): AlertsRecord {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as Partial<AlertsRecord>
    return {
      muted: parsed.muted === true,
      seen:
        parsed.seen && typeof parsed.seen.date === 'string' && typeof parsed.seen.slug === 'string'
          ? { date: parsed.seen.date, slug: parsed.seen.slug }
          : null,
    }
  } catch {
    return EMPTY
  }
}

function writeRecord(record: AlertsRecord): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  } catch {
    // Private mode or storage disabled: alerts simply do not persist.
  }
}

/** Notifications need a secure context, the API, and a service worker. */
export function alertsSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    'Notification' in window &&
    'serviceWorker' in navigator
  )
}

export function readAlertsState(): AlertsState {
  if (!alertsSupported()) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  if (Notification.permission === 'granted' && !readRecord().muted) return 'on'
  return 'off'
}

async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null
  try {
    await navigator.serviceWorker.register(SERVICE_WORKER)
    return await navigator.serviceWorker.ready
  } catch {
    return null
  }
}

/**
 * Asks for permission (must be called from a click), registers the worker, and
 * marks the current newest post as seen so enabling does not immediately
 * notify about an article the reader is already looking at.
 */
export async function enableAlerts(): Promise<AlertsState> {
  if (!alertsSupported()) return 'unsupported'

  let permission = Notification.permission
  if (permission === 'default') permission = await Notification.requestPermission()
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'off'

  const registration = await ensureServiceWorker()
  if (!registration) return 'off'

  const newest = latestPosts(1)[0]
  writeRecord({
    muted: false,
    seen: newest ? { date: newest.date, slug: newest.slug } : null,
  })
  return 'on'
}

/** Stops alerts without touching the browser-level permission. */
export function disableAlerts(): void {
  writeRecord({ ...readRecord(), muted: true })
}

/**
 * Called after mount on every page. Silent unless permission is already
 * granted, alerts are on, and a post newer than the last seen one exists.
 */
export async function notifyIfNewPost(): Promise<void> {
  if (!alertsSupported() || readAlertsState() !== 'on') return

  const newest = latestPosts(1)[0]
  if (!newest) return

  const record = readRecord()

  // First run after enabling elsewhere: remember where the reader is, stay quiet.
  if (!record.seen) {
    writeRecord({ ...record, seen: { date: newest.date, slug: newest.slug } })
    return
  }

  if (newest.date <= record.seen.date) return

  const registration = await ensureServiceWorker()
  if (!registration) return

  try {
    await registration.showNotification(`New note: ${newest.title}`, {
      body: newest.summary,
      icon: ICON,
      badge: BADGE,
      tag: 'dp-new-post',
      data: { url: postHref(newest.slug) },
    })
    writeRecord({ ...record, seen: { date: newest.date, slug: newest.slug } })
  } catch {
    // Some browsers refuse notifications from a page context; the in-page
    // notice bar still highlights the new post.
  }
}
