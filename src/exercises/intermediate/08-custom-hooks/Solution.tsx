// Tests import the hooks from this file, so it exports non-components on purpose.
// oxlint-disable react/only-export-components
import { useEffect, useState } from 'react'
import { FRAMEWORKS } from './frameworks'
import styles from './styles.module.scss'

/**
 * Returns `value`, but only after it has stopped changing for `delay` ms.
 * The hook owns its own state: every component calling it gets an independent copy.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    // A timer is an external system → an Effect is the right tool.
    const id = setTimeout(() => setDebounced(value), delay)
    // Cleanup runs before the next effect (i.e. on the next keystroke) and on unmount,
    // so only the *last* value within the delay window ever reaches state.
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    // Invalid JSON, storage disabled, Safari private mode… never crash the UI for a cache.
    return fallback
  }
}

/**
 * Same API as useState, but the value survives page reloads.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Lazy initializer: the function runs on the first render only. Passing
  // `readStorage(key, initialValue)` directly would parse JSON on *every* render.
  const [value, setValue] = useState<T>(() => readStorage(key, initialValue))

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Quota exceeded or storage unavailable: keep working in memory.
    }
  }, [key, value])

  // `as const` → a typed tuple, so callers can destructure like useState.
  // We return React's own setter, so the updater form `setValue(v => …)` just works.
  return [value, setValue] as const
}

export default function SolutionDemo() {
  // Two custom hooks composed together: each one is a small, testable piece of logic.
  const [query, setQuery] = useLocalStorage('playground:search', '')
  const debouncedQuery = useDebounce(query, 300)

  // Derived during render — no extra state or effect needed for the filtered list.
  const results = FRAMEWORKS.filter((name) =>
    name.toLowerCase().includes(debouncedQuery.trim().toLowerCase()),
  )
  const isStale = query !== debouncedQuery

  return (
    <div className={styles.wrapper}>
      <label className={styles.field}>
        Search
        <input
          className="input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try “react”…"
        />
      </label>
      <p className={styles.meta}>
        {results.length} result{results.length === 1 ? '' : 's'}
        {isStale && ' · typing…'}
      </p>
      <ul aria-label="Results" className={styles.list} data-stale={isStale}>
        {results.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  )
}
