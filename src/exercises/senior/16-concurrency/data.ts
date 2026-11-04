export type Post = { id: number; title: string }
export type Item = { id: number; label: string }

const POSTS: Post[] = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, title: `Post #${i + 1}: notes on concurrent React` }))

let postsPromise: Promise<Post[]> | null = null

/**
 * Fake request, CACHED at module level: every call returns the same promise.
 * `use()` needs a stable promise (see exercise 18 for the full story).
 * The request starts the first time the Posts tab renders; reload the page to replay it.
 */
export function fetchPosts(): Promise<Post[]> {
  postsPromise ??= new Promise((resolve) => setTimeout(() => resolve(POSTS), 1200))
  return postsPromise
}

const WORDS = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india', 'juliet']

// 10 000 deterministic items such as "item 42 · charlie echo".
export const ITEMS: Item[] = Array.from({ length: 10_000 }, (_, i) => ({
  id: i,
  label: `item ${i} · ${WORDS[i % 10]} ${WORDS[Math.floor(i / 10) % 10]}`,
}))

/** Busy-waits for `ms` milliseconds to simulate an expensive render. */
export function slowDown(ms: number) {
  const end = performance.now() + ms
  while (performance.now() < end) {
    // burn CPU on purpose
  }
}
