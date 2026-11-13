import { useEffect } from 'react'
import { notifyIfNewPost } from '@/lib/notifications'

/**
 * Mounted once per page. Renders nothing: it only checks, after hydration,
 * whether a post newer than the one this reader last saw exists.
 */
export function NewPostAlerts() {
  useEffect(() => {
    void notifyIfNewPost()
  }, [])

  return null
}
