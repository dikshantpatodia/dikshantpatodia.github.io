import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import {
  disableAlerts,
  enableAlerts,
  readAlertsState,
  type AlertsState,
} from '@/lib/notifications'

/**
 * Opt-in control for new-post alerts. The initial render is intentionally
 * empty and identical on the server and the client; the real state is read
 * after mount so prerendered HTML never claims a permission it cannot know.
 */
export function NotifyToggle() {
  const [state, setState] = useState<AlertsState>('checking')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setState(readAlertsState())
  }, [])

  async function handleEnable() {
    setBusy(true)
    try {
      const next = await enableAlerts()
      setState(next)
      setMessage(
        next === 'on'
          ? 'New-post alerts are on.'
          : next === 'denied'
            ? 'Notifications are blocked in your browser settings.'
            : 'Could not enable alerts in this browser.',
      )
    } finally {
      setBusy(false)
    }
  }

  function handleDisable() {
    disableAlerts()
    setState('off')
    setMessage('New-post alerts turned off.')
  }

  return (
    <div className="alerts">
      {state === 'off' ? (
        <button type="button" className="alerts__button" onClick={handleEnable} disabled={busy}>
          <Bell size={13} aria-hidden="true" />
          {busy ? 'Enabling…' : 'Notify me of new notes'}
        </button>
      ) : null}

      {state === 'on' ? (
        <p className="alerts__status">
          <Bell size={13} aria-hidden="true" />
          New-post alerts are on.
          <button type="button" className="alerts__link" onClick={handleDisable}>
            Turn off
          </button>
        </p>
      ) : null}

      {state === 'denied' ? (
        <p className="alerts__status alerts__status--off">
          <BellOff size={13} aria-hidden="true" />
          Notifications are blocked in your browser settings.
        </p>
      ) : null}

      <span className="sr-only" role="status">
        {message}
      </span>
    </div>
  )
}
