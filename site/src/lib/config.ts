/**
 * Runtime configuration. Every value is optional: the site is fully static by
 * default and keeps working with no backend, no environment variables, and no
 * client-side requests.
 *
 * Only `VITE_*` variables reach the browser (Vite inlines them at build time).
 * Never put secrets here.
 */
function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function readPositiveInt(value: unknown, fallback: number): number {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? Math.round(number) : fallback
}

/** Base URL of the API, without a trailing slash. Empty when unconfigured. */
export const apiBaseUrl = readString(import.meta.env?.VITE_API_BASE_URL).replace(/\/+$/, '')

/** Per-request deadline for runtime API calls. */
export const apiTimeoutMs = readPositiveInt(import.meta.env?.VITE_API_TIMEOUT_MS, 15_000)

/** True when a runtime API is configured; pages must still work when false. */
export const apiConfigured = apiBaseUrl.length > 0
