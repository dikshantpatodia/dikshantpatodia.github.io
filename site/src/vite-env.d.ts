/// <reference types="vite/client" />

/** Injected by the `blog-content` plugin in vite.config.ts. */
declare module 'virtual:blog' {
  import type { BlogPost } from './data/types'
  export const posts: BlogPost[]
}
