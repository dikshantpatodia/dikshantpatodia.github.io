/**
 * Service worker for new-post alerts.
 *
 * Deliberately does not cache anything: pages are already static and
 * fingerprinted, and a caching worker would only create stale-content bugs.
 * Its job is to show notifications and route clicks back to the article.
 */
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  let payload = {}

  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { body: event.data ? event.data.text() : '' }
  }

  const title = payload.title || 'New note on the blog'
  const options = {
    body: payload.body || 'A new article is up.',
    icon: '/apple-touch-icon.png',
    badge: '/favicon.ico',
    tag: payload.tag || 'dp-new-post',
    data: { url: payload.url || '/blog/' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const target = event.notification.data && event.notification.data.url ? event.notification.data.url : '/blog/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          if ('navigate' in client) client.navigate(target)
          return client.focus()
        }
      }
      return self.clients.openWindow(target)
    }),
  )
})
