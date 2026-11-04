import { useEffect, useState } from 'react'
import styles from './styles.module.scss'

export type User = {
  id: number
  name: string
  email: string
  website?: string
  company?: { name: string }
}

// Mutually exclusive states (see exercise 05): no `isLoading && error` nonsense.
type FetchState =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; user: User }

// What the Effect stores: a finished result, tagged with the id it belongs to.
type FetchResult = { userId: number } & (
  | { status: 'error'; error: string }
  | { status: 'success'; user: User }
)

const API_URL = 'https://jsonplaceholder.typicode.com/users'

type UserProfileProps = { userId: number }

export function UserProfile({ userId }: UserProfileProps) {
  const [result, setResult] = useState<FetchResult | null>(null)

  // "Loading" is derived, not stored: if the result we hold isn't for the current
  // `userId` (first render, or the id just changed), we're waiting for a new one.
  // This avoids calling setState synchronously at the top of the Effect, which
  // would cost an extra render (and is flagged by the `set-state-in-effect` lint).
  const state: FetchState =
    result === null || result.userId !== userId ? { status: 'loading' } : result

  // An Effect *synchronises* the component with an external system (here: the network)
  // for the current value of `userId`. It re-runs whenever `userId` changes.
  useEffect(() => {
    // One controller per run: aborting it only affects *this* request.
    const controller = new AbortController()

    async function load() {
      try {
        const res = await fetch(`${API_URL}/${userId}`, { signal: controller.signal })
        // fetch only rejects on network failure; HTTP errors (404, 500) must be checked.
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const user = (await res.json()) as User
        // Belt and braces: if this run was cleaned up meanwhile (id changed, unmount),
        // its result is stale and must never overwrite the newer one.
        if (!controller.signal.aborted) setResult({ userId, status: 'success', user })
      } catch (error) {
        // Aborting rejects with an AbortError: that's expected, not a failure to show.
        if (controller.signal.aborted) return
        setResult({
          userId,
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    void load()

    // Cleanup runs before the next effect run (new userId) and on unmount.
    // In dev, StrictMode runs setup → cleanup → setup once on mount to prove it's correct.
    return () => controller.abort()
  }, [userId])

  if (state.status === 'loading') {
    // <output> has the implicit role "status" (polite live region).
    return <output className={styles.muted}>Loading user…</output>
  }

  if (state.status === 'error') {
    return (
      <p role="alert" className={styles.error}>
        Could not load user ({state.error})
      </p>
    )
  }

  const { user } = state
  return (
    <article className={styles.profile} aria-labelledby={`user-${user.id}`}>
      <h2 id={`user-${user.id}`}>{user.name}</h2>
      <dl>
        <dt>Email</dt>
        <dd>{user.email}</dd>
        {user.company && (
          <>
            <dt>Company</dt>
            <dd>{user.company.name}</dd>
          </>
        )}
      </dl>
    </article>
  )
}

export default function SolutionDemo() {
  const [userId, setUserId] = useState(1)

  return (
    <div className={styles.demo}>
      <div className={styles.controls}>
        <button
          className="btn"
          onClick={() => setUserId((id) => Math.max(1, id - 1))}
          disabled={userId === 1}
        >
          ← Previous
        </button>
        <span className={styles.userId}>User #{userId}</span>
        <button
          className="btn"
          onClick={() => setUserId((id) => Math.min(10, id + 1))}
          disabled={userId === 10}
        >
          Next →
        </button>
        {/* Try clicking fast: only the last request wins. Open the Network tab
            to see the cancelled ones. Ids above 10 return 404. */}
        <button className="btn" onClick={() => setUserId(404)}>
          Missing user
        </button>
      </div>
      <UserProfile userId={userId} />
    </div>
  )
}
