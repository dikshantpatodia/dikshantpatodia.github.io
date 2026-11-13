/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional base URL for runtime API calls, e.g. `https://api.example.com`. */
  readonly VITE_API_BASE_URL?: string
  /** Per-request deadline for runtime API calls, in milliseconds. */
  readonly VITE_API_TIMEOUT_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Injected by the `blog-content` plugin in vite.config.ts. */
declare module 'virtual:blog' {
  import type { BlogPost } from './data/types'
  export const posts: BlogPost[]
}
