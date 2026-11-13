/**
 * A small, backend-agnostic HTTP client for runtime data.
 *
 * It makes no assumptions beyond "JSON over HTTP", which covers REST, GraphQL
 * endpoints, serverless functions, and BFFs alike. The rules that matter when
 * a backend arrives later are all handled here, once, instead of in components:
 *
 * - one place for the base URL, headers, credentials, and timeout;
 * - every failure is an `ApiError` with a status, a stable `code`, and the
 *   parsed response body — never a raw `TypeError` or `undefined`;
 * - cancellation and timeouts abort the actual request;
 * - idempotent requests retry on network errors, 429, and 5xx, honouring
 *   `Retry-After`.
 *
 * Indexable content must not depend on this: it is fetched at build time
 * (`scripts/content-source.mjs`) so pages stay prerendered and crawlable.
 */
import { apiBaseUrl, apiTimeoutMs } from './config'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type QueryValue = string | number | boolean | null | undefined
export type QueryParams = Record<string, QueryValue>

export interface RequestOptions {
  method?: HttpMethod
  query?: QueryParams
  /** Serialised as JSON unless it is `FormData`, `Blob`, or a string. */
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
  timeoutMs?: number
  /** Retries after the first attempt. Defaults to 2 for GET, 0 otherwise. */
  retries?: number
}

export interface ApiErrorOptions {
  status?: number
  code?: string
  details?: unknown
  requestId?: string
  retryAfterMs?: number
}

export class ApiError extends Error {
  readonly status?: number
  readonly code: string
  readonly details?: unknown
  readonly requestId?: string
  readonly retryAfterMs?: number

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code ?? (options.status ? `HTTP_${options.status}` : 'NETWORK_ERROR')
    this.details = options.details
    this.requestId = options.requestId
    this.retryAfterMs = options.retryAfterMs
  }

  get isAbort(): boolean {
    return this.code === 'ABORTED'
  }

  get isTimeout(): boolean {
    return this.code === 'TIMEOUT'
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  get isRetryable(): boolean {
    const { status } = this
    if (status === undefined) return this.code === 'NETWORK_ERROR'
    return status === 408 || status === 425 || status === 429 || status >= 500
  }
}

export interface ApiClientOptions {
  /** Defaults to `VITE_API_BASE_URL`. */
  baseUrl?: string
  timeoutMs?: number
  headers?: Record<string, string>
  credentials?: RequestCredentials
  fetchImpl?: typeof fetch
}

export interface ApiClient {
  request<T>(path: string, options?: RequestOptions): Promise<T>
  get<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T>
  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T>
  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T>
  patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T>
  delete<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T>
}

const ABSOLUTE_URL = /^https?:\/\//i

const sleep = (ms: number) => new Promise<void>((done) => setTimeout(done, ms))

function retryDelay(attempt: number, retryAfterMs?: number): number {
  if (retryAfterMs !== undefined) return retryAfterMs
  return Math.min(250 * 2 ** attempt, 4_000) + Math.floor(Math.random() * 100)
}

function readRetryAfter(response: Response): number | undefined {
  const header = response.headers.get('retry-after')
  if (!header) return undefined

  const seconds = Number(header)
  if (Number.isFinite(seconds)) return Math.min(Math.max(seconds, 0) * 1_000, 30_000)

  const date = Date.parse(header)
  if (Number.isNaN(date)) return undefined
  return Math.min(Math.max(date - Date.now(), 0), 30_000)
}

function buildUrl(baseUrl: string, path: string, query?: QueryParams): string {
  const target = ABSOLUTE_URL.test(path)
    ? new URL(path)
    : new URL(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`)

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue
    target.searchParams.set(key, String(value))
  }

  return target.toString()
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return undefined

  const text = await response.text()
  if (!text) return undefined

  if ((response.headers.get('content-type') ?? '').includes('json')) {
    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }

  return text
}

/** Reads a message out of the shapes APIs commonly use for failures. */
function describeFailure(payload: unknown, status: number, statusText: string) {
  if (typeof payload === 'string' && payload.trim()) {
    return { message: payload.trim().slice(0, 300) }
  }

  if (payload && typeof payload === 'object') {
    const body = payload as Record<string, unknown>
    const nested = body.error && typeof body.error === 'object' ? (body.error as Record<string, unknown>) : {}

    const message =
      body.message ?? body.detail ?? body.title ?? body.error_description ?? nested.message ?? body.error

    const code = body.code ?? nested.code

    if (typeof message === 'string' && message.trim()) {
      return {
        message: message.trim(),
        code: typeof code === 'string' ? code : undefined,
      }
    }
    if (typeof code === 'string') return { message: code, code }
  }

  return { message: statusText ? `${status} ${statusText}` : `Request failed with status ${status}` }
}

function isNativeBody(body: unknown): body is FormData | Blob | URLSearchParams {
  return (
    (typeof FormData !== 'undefined' && body instanceof FormData) ||
    (typeof Blob !== 'undefined' && body instanceof Blob) ||
    (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams)
  )
}

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const baseUrl = (options.baseUrl ?? apiBaseUrl).replace(/\/+$/, '')
  const defaultTimeout = options.timeoutMs ?? apiTimeoutMs
  const defaultHeaders = options.headers ?? {}
  const credentials = options.credentials ?? 'same-origin'
  const fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis)

  async function request<T>(path: string, requestOptions: RequestOptions = {}): Promise<T> {
    const method = requestOptions.method ?? 'GET'
    const timeoutMs = requestOptions.timeoutMs ?? defaultTimeout
    const retries = requestOptions.retries ?? (method === 'GET' ? 2 : 0)

    if (!ABSOLUTE_URL.test(path) && !baseUrl) {
      throw new ApiError('No API is configured. Set VITE_API_BASE_URL to use runtime data.', {
        code: 'NOT_CONFIGURED',
      })
    }

    const url = buildUrl(baseUrl, path, requestOptions.query)

    // Fail before touching the network when the caller has already cancelled.
    if (requestOptions.signal?.aborted) {
      throw new ApiError('Request aborted', { code: 'ABORTED' })
    }

    const headers: Record<string, string> = {
      accept: 'application/json',
      ...defaultHeaders,
      ...requestOptions.headers,
    }

    let body: BodyInit | undefined
    if (requestOptions.body !== undefined) {
      if (isNativeBody(requestOptions.body)) {
        body = requestOptions.body
      } else if (typeof requestOptions.body === 'string') {
        body = requestOptions.body
      } else {
        headers['content-type'] ??= 'application/json'
        body = JSON.stringify(requestOptions.body)
      }
    }

    for (let attempt = 0; ; attempt += 1) {
      const controller = new AbortController()
      let timedOut = false

      const timer = setTimeout(() => {
        timedOut = true
        controller.abort()
      }, timeoutMs)

      const forwardAbort = () => controller.abort()
      if (requestOptions.signal?.aborted) controller.abort()
      requestOptions.signal?.addEventListener('abort', forwardAbort, { once: true })

      try {
        const response = await fetchImpl(url, {
          method,
          headers,
          body,
          credentials,
          signal: controller.signal,
        })

        if (!response.ok) {
          const payload = await parseBody(response)
          const { message, code } = describeFailure(payload, response.status, response.statusText)

          throw new ApiError(message, {
            status: response.status,
            code,
            details: payload,
            requestId: response.headers.get('x-request-id') ?? undefined,
            retryAfterMs: readRetryAfter(response),
          })
        }

        return (await parseBody(response)) as T
      } catch (error) {
        const failure =
          error instanceof ApiError
            ? error
            : requestOptions.signal?.aborted
              ? new ApiError('Request aborted', { code: 'ABORTED' })
              : timedOut
                ? new ApiError(`Request timed out after ${timeoutMs}ms`, { code: 'TIMEOUT' })
                : new ApiError(error instanceof Error ? error.message : 'Network request failed', {
                    code: 'NETWORK_ERROR',
                  })

        if (attempt >= retries || failure.isAbort || !failure.isRetryable) throw failure

        await sleep(retryDelay(attempt, failure.retryAfterMs))
      } finally {
        clearTimeout(timer)
        requestOptions.signal?.removeEventListener('abort', forwardAbort)
      }
    }
  }

  return {
    request,
    get: (path, requestOptions) => request(path, { ...requestOptions, method: 'GET' }),
    post: (path, body, requestOptions) => request(path, { ...requestOptions, method: 'POST', body }),
    put: (path, body, requestOptions) => request(path, { ...requestOptions, method: 'PUT', body }),
    patch: (path, body, requestOptions) => request(path, { ...requestOptions, method: 'PATCH', body }),
    delete: (path, requestOptions) => request(path, { ...requestOptions, method: 'DELETE' }),
  }
}

let shared: ApiClient | null = null

/** Lazily created shared client. Throws `NOT_CONFIGURED` if no base URL is set. */
export function getApiClient(): ApiClient {
  if (!shared) shared = createApiClient()
  return shared
}
