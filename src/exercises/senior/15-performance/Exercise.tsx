// 15 – Performance. Instructions: see README.md (or the "Instructions" tab).
// NOTE: `'use no memo'` opts a component OUT of the React Compiler, so here you
// experience React *without* automatic memoization. Keep the directives until task 5.
import { Profiler, useState, type ProfilerOnRenderCallback } from 'react'
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

// TODO 1: wrap SlowList in `memo` so it can skip re-rendering when its props are unchanged.
export function SlowList({ items, selectedId, onSelect, delayMs, onRender = noop }: SlowListProps) {
  'use no memo'
  slowDown(delayMs) // pretend this list is really expensive to render
  return (
    // The Profiler is INSIDE the list: it only reports when SlowList actually renders.
    <Profiler id="SlowList" onRender={onRender}>
      <ul className={styles.list} aria-label="Products">
        {items.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className={styles.row}
              aria-pressed={p.id === selectedId}
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
}

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

  // TODO 2: this creates a NEW array on every render, even when `query` didn't change.
  //         Memoize it with `useMemo`.
  const visible = products.filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))

  // TODO 3: this creates a NEW function on every render. Stabilize it with `useCallback`.
  const handleSelect = (id: number) => setSelectedId((prev) => (prev === id ? null : id))

  const selected = products.find((p) => p.id === selectedId)

  return (
    <section className={styles.dashboard}>
      <div className={styles.toolbar}>
        <label className={styles.field}>
          Filter products
          <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        {/* Unrelated state: clicking this should NOT re-render the slow list. */}
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
 * Same component, NO directive and NO manual memoization: the React Compiler does the work.
 * Its test already passes on the starter. Task 5 asks you to explain why.
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

export default function ExerciseDemo() {
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
