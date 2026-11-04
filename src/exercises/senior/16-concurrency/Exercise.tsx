// 16 – Concurrency. Instructions: see README.md (or the "Instructions" tab).
import { Suspense, use, useState } from 'react'
import { fetchPosts, ITEMS, slowDown, type Item, type Post } from './data'
import styles from './styles.module.scss'

/* ------------------------------------------------------------------ */
/* Part A — useTransition                                              */
/* ------------------------------------------------------------------ */

type Tab = 'about' | 'posts' | 'slow' | 'contact'
const TAB_LABELS: Record<Tab, string> = { about: 'About', posts: 'Posts', slow: 'Slow', contact: 'Contact' }

function PostsTab({ loadPosts }: { loadPosts: () => Promise<Post[]> }) {
  // `loadPosts` returns a CACHED promise (same object every call) → safe to call during render.
  const posts = use(loadPosts()) // suspends until the promise resolves
  return (
    <ul className={styles.list}>
      {posts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  )
}

function SlowPost({ index, delayMs }: { index: number; delayMs: number }) {
  slowDown(delayMs)
  return <li>Slow post #{index + 1}</li>
}

function SlowTab({ delayMs }: { delayMs: number }) {
  // 300 small slow components: React can yield to the browser *between* them during a transition.
  return (
    <ul className={styles.list}>
      {Array.from({ length: 300 }, (_, i) => (
        <SlowPost key={i} index={i} delayMs={delayMs} />
      ))}
    </ul>
  )
}

type TabSwitcherProps = { loadPosts?: () => Promise<Post[]>; slowItemMs?: number }

export function TabSwitcher({ loadPosts = fetchPosts, slowItemMs = 1 }: TabSwitcherProps) {
  const [tab, setTab] = useState<Tab>('about')
  // TODO 1: get `[isPending, startTransition]` from useTransition()

  function selectTab(next: Tab) {
    // TODO 2: mark this update as a Transition (non-urgent, interruptible)
    setTab(next)
  }

  return (
    <section className={styles.card} aria-label="Tabs demo">
      <div className={styles.tabs}>
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className="btn"
            aria-pressed={tab === t}
            onClick={() => selectTab(t)}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
        {/* TODO 3: while pending, render <span role="status">Switching…</span> */}
      </div>
      {/* TODO 3: dim the panel while pending (styles.pending) */}
      <div className={styles.panel}>
        <Suspense fallback={<p>Loading posts…</p>}>
          {tab === 'about' && <p>Welcome! This is the about tab.</p>}
          {tab === 'posts' && <PostsTab loadPosts={loadPosts} />}
          {tab === 'slow' && <SlowTab delayMs={slowItemMs} />}
          {tab === 'contact' && <p>Write to us at hello@example.com.</p>}
        </Suspense>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Part B — useDeferredValue                                           */
/* ------------------------------------------------------------------ */

const MAX_ROWS = 250

function ResultRow({ item, delayMs }: { item: Item; delayMs: number }) {
  slowDown(delayMs)
  return <li>{item.label}</li>
}

export function SearchResults({ query, items, rowDelayMs }: { query: string; items: Item[]; rowDelayMs: number }) {
  const q = query.trim().toLowerCase()
  const matches = q ? items.filter((it) => it.label.includes(q)) : items
  return (
    <>
      <p className={styles.meta}>
        {matches.length} matches{matches.length > MAX_ROWS && ` (showing ${MAX_ROWS})`}
      </p>
      <ul className={styles.list}>
        {matches.slice(0, MAX_ROWS).map((it) => (
          <ResultRow key={it.id} item={it} delayMs={rowDelayMs} />
        ))}
      </ul>
    </>
  )
}

type ProductSearchProps = { items?: Item[]; rowDelayMs?: number }

export function ProductSearch({ items = ITEMS, rowDelayMs = 0.5 }: ProductSearchProps) {
  const [query, setQuery] = useState('')
  // TODO 4: const deferredQuery = useDeferredValue(query)
  // TODO 5: isStale = the results show an older query than the input
  const isStale = false

  return (
    <section className={styles.card} aria-label="Search demo">
      <label className={styles.field}>
        Search 10 000 items
        <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      {/* TODO 6: pass the deferred query, and dim the results while stale */}
      <section aria-label="Results" aria-busy={isStale} className={styles.results}>
        <SearchResults query={query} items={items} rowDelayMs={rowDelayMs} />
      </section>
    </section>
  )
}

export default function ExerciseDemo() {
  return (
    <div className={styles.stack}>
      <TabSwitcher />
      <ProductSearch />
    </div>
  )
}
