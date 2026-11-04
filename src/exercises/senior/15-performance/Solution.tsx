// 15 – Performance (solution).
// `'use no memo'` keeps the React Compiler away from SlowList and Dashboard, so the
// memoization you see here is 100% manual — the way React apps were written before the compiler.
import { memo, Profiler, useCallback, useMemo, useState, type ProfilerOnRenderCallback } from 'react'
import { PRODUCTS, slowDown, type Product } from './data'
import styles from './styles.module.scss'

const noop: ProfilerOnRenderCallback = () => {}

type SlowListProps = {
  items: Product[]
  selectedId: number | null
  onSelect: (id: number) => void
  delayMs: number
  onRender?: ProfilerOnRenderCallback
}

// `memo` makes React compare the new props with the previous ones (Object.is, prop by prop).
// If they are all identical, React reuses the last result and skips this expensive render.
// `memo` alone is useless if the parent passes a fresh array / function each time → tasks 2 & 3.
export const SlowList = memo(function SlowList({
  items,
  selectedId,
  onSelect,
  delayMs,
  onRender = noop,
}: SlowListProps) {
  'use no memo'
  slowDown(delayMs)
  return (
    <Profiler id="SlowList" onRender={onRender}>
      <ul className={styles.list} aria-label="Products">
        {items.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className={styles.row}
              aria-pressed={p.id === selectedId}
              // An inline arrow per row is fine: the rows are not memoized, and the
              // whole list only renders when its props really change.
              onClick={() => onSelect(p.id)}
            >
              <span>{p.name}</span>
              <span className={styles.price}>{p.price} €</span>
            </button>
          </li>
        ))}
      </ul>
    </Profiler>
  )
})

export type DashboardProps = {
  products?: Product[]
  listDelayMs?: number
  onListRender?: ProfilerOnRenderCallback
}

export function Dashboard({ products = PRODUCTS, listDelayMs = 120, onListRender }: DashboardProps) {
  'use no memo'
  const [query, setQuery] = useState('')
  const [clicks, setClicks] = useState(0)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // `useMemo` caches the array between renders. Clicking the counter re-renders Dashboard,
  // but `products` and `query` are unchanged → same array reference → memo(SlowList) bails out.
  // (Filtering 2000 items is cheap; the *reference stability* is what matters here.)
  const visible = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase())),
    [products, query],
  )

  // `useCallback` caches the function itself. Because we use the updater form
  // (`prev => …`), the callback reads no state and needs no dependencies.
  // (Passing `setSelectedId` directly would also be stable — setters never change.)
  const handleSelect = useCallback((id: number) => setSelectedId((prev) => (prev === id ? null : id)), [])

  const selected = products.find((p) => p.id === selectedId)

  return (
    <section className={styles.dashboard}>
      <div className={styles.toolbar}>
        <label className={styles.field}>
          Filter products
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <button type="button" className="btn" onClick={() => setClicks((c) => c + 1)}>
          Clicked {clicks} times
        </button>
      </div>
      <p className={styles.meta}>
        {visible.length} products · Selected: {selected ? selected.name : 'none'}
      </p>
      <SlowList
        items={visible}
        selectedId={selectedId}
        onSelect={handleSelect}
        delayMs={listDelayMs}
        onRender={onListRender}
      />
    </section>
  )
}

/**
 * No directive, no `memo`/`useMemo`/`useCallback`: the React Compiler inserts the caching.
 * It memoizes `visible`, `handleSelect` AND the `<SlowList …/>` JSX element itself, keyed on
 * their inputs. When Dashboard re-renders for `clicks`, the compiler hands React the *same
 * element object* as last time, and React skips re-rendering a child whose element is identical
 * — even if that child is not wrapped in `memo`.
 */
export function CompiledDashboard({ products = PRODUCTS, listDelayMs = 120, onListRender }: DashboardProps) {
  const [query, setQuery] = useState('')
  const [clicks, setClicks] = useState(0)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const visible = products.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
  const handleSelect = (id: number) => setSelectedId((prev) => (prev === id ? null : id))
  const selected = products.find((p) => p.id === selectedId)

  return (
    <section className={styles.dashboard}>
      <div className={styles.toolbar}>
        <label className={styles.field}>
          Filter products (compiled)
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <button type="button" className="btn" onClick={() => setClicks((c) => c + 1)}>
          Clicked {clicks} times
        </button>
      </div>
      <p className={styles.meta}>
        {visible.length} products · Selected: {selected ? selected.name : 'none'}
      </p>
      <SlowList
        items={visible}
        selectedId={selectedId}
        onSelect={handleSelect}
        delayMs={listDelayMs}
        onRender={onListRender}
      />
    </section>
  )
}

export default function SolutionDemo() {
  const [variant, setVariant] = useState<'manual' | 'compiled'>('manual')
  const logRender: ProfilerOnRenderCallback = (id, phase, actualDuration) => {
    console.info(`[${variant}] ${id} ${phase} in ${actualDuration.toFixed(1)}ms`)
  }
  return (
    <div className={styles.stack}>
      <div className={styles.toolbar}>
        <button type="button" className="btn" aria-pressed={variant === 'manual'} onClick={() => setVariant('manual')}>
          Manual (use no memo)
        </button>
        <button
          type="button"
          className="btn"
          aria-pressed={variant === 'compiled'}
          onClick={() => setVariant('compiled')}
        >
          React Compiler
        </button>
      </div>
      <p className={styles.meta}>Open the console: every SlowList render is logged with its duration.</p>
      {variant === 'manual' ? <Dashboard onListRender={logRender} /> : <CompiledDashboard onListRender={logRender} />}
    </div>
  )
}
