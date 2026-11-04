// The component under test. It's FINISHED: your job in this exercise is to test it.
import { useEffect, useState } from 'react'
import { searchUsers, type User } from './api'
import { useDebouncedValue } from './useDebouncedValue'
import styles from './styles.module.scss'

type SearchFn = (query: string, signal: AbortSignal) => Promise<User[]>

type Result = { query: string; users: User[]; error?: undefined } | { query: string; users?: undefined; error: string }

type UserSearchProps = {
  /** Injectable for tests and demos. Defaults to a real `fetch` call. */
  search?: SearchFn
  delayMs?: number
}

export function UserSearch({ search = searchUsers, delayMs = 300 }: UserSearchProps) {
  const [query, setQuery] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<Result | null>(null)
  const debouncedQuery = useDebouncedValue(query.trim(), delayMs)

  useEffect(() => {
    if (!debouncedQuery) return
    const controller = new AbortController()
    search(debouncedQuery, controller.signal).then(
      (users) => setResult({ query: debouncedQuery, users }),
      (err: unknown) => {
        if (controller.signal.aborted) return // a newer query replaced this one
        setResult({ query: debouncedQuery, error: err instanceof Error ? err.message : String(err) })
      },
    )
    // Typing again (or unmounting) aborts the in-flight request → no race conditions.
    return () => controller.abort()
  }, [debouncedQuery, attempt, search])

  // Derived state: we're loading whenever the latest result isn't for the current query.
  const current = debouncedQuery && result?.query === debouncedQuery ? result : null
  const isLoading = debouncedQuery !== '' && current === null

  return (
    <section className={styles.search} aria-label="User search">
      <label className={styles.field}>
        Search users
        <input
          type="search"
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. ada"
        />
      </label>

      {isLoading && (
        // A polite live region: screen readers announce "Searching…" without moving focus.
        // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
        <p role="status" className={styles.muted}>
          Searching…
        </p>
      )}

      {current?.error !== undefined && (
        <div role="alert" className={styles.error}>
          <p>Something went wrong: {current.error}</p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setResult(null)
              setAttempt((a) => a + 1)
            }}
          >
            Retry
          </button>
        </div>
      )}

      {current?.users && current.users.length === 0 && (
        <p className={styles.muted}>No users found for “{current.query}”.</p>
      )}

      {current?.users && current.users.length > 0 && (
        <ul aria-label="Results" className={styles.results}>
          {current.users.map((u) => (
            <li key={u.id}>
              <strong>{u.name}</strong> <span className={styles.muted}>{u.email}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
