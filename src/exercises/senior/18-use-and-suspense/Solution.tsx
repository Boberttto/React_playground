// 18 – use() & Suspense (solution).
/* eslint-disable react/only-export-components -- the tests import these non-component exports from this module; fast refresh of an exercise file is not a concern */
import { createContext, startTransition, Suspense, use, useState } from 'react'
import { fetchPosts, fetchUser, type Post, type User } from './api'
import { ErrorBoundary } from './ErrorBoundary'
import styles from './styles.module.scss'

/* ------------------------------------------------------------------ */
/* 1. A promise cache                                                   */
/* ------------------------------------------------------------------ */

// Why a cache? When a component suspends, React THROWS AWAY that render (nothing is kept,
// no state, no refs, because the component never committed). When the promise resolves, React
// renders the component again from scratch. If render created the promise (`use(fetchUser(id))`),
// that second render would create a NEW pending promise → suspend again → forever.
// The promise must therefore come from somewhere that outlives render: a cache like this,
// a parent that already committed, a router loader, or a framework (Next.js, Relay, TanStack Query).
const userCache = new Map<number, Promise<User>>()
const postsCache = new Map<number, Promise<Post[]>>()

function cached<T>(cache: Map<number, Promise<T>>, key: number, load: () => Promise<T>): Promise<T> {
  let promise = cache.get(key)
  if (!promise) {
    promise = load()
    // Don't cache failures forever: evict so a retry triggers a real new request.
    promise.catch(() => cache.delete(key))
    cache.set(key, promise)
  }
  return promise
}

export function getUser(id: number): Promise<User> {
  return cached(userCache, id, () => fetchUser(id))
}

export function getPosts(userId: number): Promise<Post[]> {
  return cached(postsCache, userId, () => fetchPosts(userId))
}

/* ------------------------------------------------------------------ */
/* 2. Reading promises with use()                                       */
/* ------------------------------------------------------------------ */

function UserHeader({ userPromise }: { userPromise: Promise<User> }) {
  // Pending → suspends (nearest <Suspense> shows its fallback).
  // Fulfilled → returns the value synchronously (React tracks the status on the promise).
  // Rejected → throws the reason (nearest error boundary catches it).
  const user = use(userPromise)
  return (
    <header>
      <h2>{user.name}</h2>
      <p className={styles.bio}>{user.bio}</p>
    </header>
  )
}

function PostList({ postsPromise }: { postsPromise: Promise<Post[]> }) {
  const posts = use(postsPromise)
  return (
    <ul aria-label="Posts" className={styles.posts}>
      {posts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  )
}

type ProfilePageProps = {
  userPromise: Promise<User>
  postsPromise: Promise<Post[]>
  onRetry?: () => void
}

export function ProfilePage({ userPromise, postsPromise, onRetry }: ProfilePageProps) {
  // Both promises were started by the caller BEFORE rendering: the two requests run in
  // parallel. If PostList started its own fetch only after UserHeader resolved, we'd have
  // a "waterfall" (800 ms + 1600 ms instead of max(800, 1600)).
  return (
    <ErrorBoundary
      onReset={onRetry}
      fallback={(error, reset) => (
        <div role="alert" className={styles.error}>
          <p>Something went wrong: {error.message}</p>
          <button type="button" className="btn" onClick={reset}>
            Try again
          </button>
        </div>
      )}
    >
      {/* Reveal order: the OUTER boundary decides when anything appears. Even if posts
          resolve first, they stay hidden until the header is ready, so the page fills in
          top-down instead of popping in random order. */}
      <Suspense fallback={<p>Loading profile…</p>}>
        <article className={styles.profile}>
          <UserHeader userPromise={userPromise} />
          <h3>Posts</h3>
          {/* The INNER boundary lets the header show while posts are still loading. */}
          <Suspense fallback={<p>Loading posts…</p>}>
            <PostList postsPromise={postsPromise} />
          </Suspense>
        </article>
      </Suspense>
    </ErrorBoundary>
  )
}

/* ------------------------------------------------------------------ */
/* 3. use(Context) can be called conditionally                          */
/* ------------------------------------------------------------------ */

export type Theme = 'light' | 'dark'
export const ThemeContext = createContext<Theme>('light')

export function ThemedNote({ show }: { show: boolean }) {
  if (!show) return null
  // `use` is NOT a hook in the Rules-of-Hooks sense: it may be called after an early
  // return, inside `if` or loops (not inside try/catch). `useContext` here would be illegal,
  // because the number of hook calls would change between renders.
  const theme = use(ThemeContext)
  return <p className={styles.note}>Theme: {theme}</p>
}

/* ------------------------------------------------------------------ */

export default function SolutionDemo() {
  const [userId, setUserId] = useState(1)
  const [attempt, setAttempt] = useState(0)
  const [showNote, setShowNote] = useState(true)

  return (
    // React 19: <Context value> replaces <Context.Provider value>.
    <ThemeContext value="dark">
      <div className={styles.stack}>
        <div className={styles.toolbar}>
          {[1, 2, 404].map((id) => (
            <button
              key={id}
              type="button"
              className="btn"
              aria-pressed={userId === id}
              onClick={() => startTransition(() => setUserId(id))}
            >
              User {id}
            </button>
          ))}
          <label className={styles.check}>
            <input type="checkbox" checked={showNote} onChange={(e) => setShowNote(e.target.checked)} /> Show theme
            note
          </label>
        </div>
        <ThemedNote show={showNote} />
        {/* `key` gives each user (and each retry) a fresh boundary state.
            The failed promise was evicted from the cache, so a retry refetches. */}
        <ProfilePage
          key={`${userId}-${attempt}`}
          userPromise={getUser(userId)}
          postsPromise={getPosts(userId)}
          onRetry={() => setAttempt((a) => a + 1)}
        />
      </div>
    </ThemeContext>
  )
}
