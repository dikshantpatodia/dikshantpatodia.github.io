import { useEffect, useState } from 'react'
import { Check, Copy, Mail } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Copy-to-clipboard email affordance with a graceful mailto fallback when the
 * clipboard API is unavailable.
 */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2200)
    return () => window.clearTimeout(timer)
  }, [copied])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
    } catch {
      window.location.href = `mailto:${email}`
    }
  }

  return (
    <button
      type="button"
      className={cn('copy-email', copied && 'is-copied')}
      onClick={handleCopy}
      aria-label={`Copy email address ${email}`}
    >
      <Mail aria-hidden="true" />
      <span aria-live="polite">{copied ? 'Copied — talk soon' : email}</span>
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
    </button>
  )
}
