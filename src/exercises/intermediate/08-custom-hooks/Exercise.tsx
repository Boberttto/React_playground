// 08 – Custom Hooks. Instructions: see README.md (or the "Instructions" tab).
// Tests import the hooks from this file, so it exports non-components on purpose.
// oxlint-disable react/only-export-components
import { useState } from 'react'
import { FRAMEWORKS } from './frameworks'
import styles from './styles.module.scss'

// TODO 1: return a value that only updates once `value` has stopped changing for `delay` ms.
export function useDebounce<T>(value: T, delay: number): T {
  void delay // remove this line once you use `delay`
  return value
}

// TODO 2: persist the value in localStorage under `key`
//  - lazy initial state: read + JSON.parse, fall back to `initialValue` (missing key or bad JSON)
//  - write JSON.stringify(value) back whenever it changes
export function useLocalStorage<T>(key: string, initialValue: T) {
  void key // remove this line once you use `key`
  const [value, setValue] = useState<T>(initialValue)
  return [value, setValue] as const
}

export default function ExerciseDemo() {
  // TODO 3: use useLocalStorage('playground:search', '') and filter with useDebounce(query, 300)
  const [query, setQuery] = useState('')
  const results = FRAMEWORKS.filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()))

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
      </p>
      <ul aria-label="Results" className={styles.list}>
        {results.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  )
}
