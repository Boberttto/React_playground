// 16 – Concurrency (solution).
import { Suspense, use, useDeferredValue, useState, useTransition } from 'react'
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
  // `isPending` is true from the moment the Transition starts until its render commits.
  const [isPending, startTransition] = useTransition()

  function selectTab(next: Tab) {
    // A Transition update is *non-urgent*:
    // - it renders in the background and can be INTERRUPTED: click "Slow" then "Contact"
    //   immediately, and React abandons the half-finished Slow render;
    // - if it SUSPENDS (Posts not loaded yet), React keeps showing the current tab instead of
    //   replacing already-visible content with the Suspense fallback.
    startTransition(() => {
      setTab(next)
    })
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
        {isPending && (
          // A live region announces the change to screen readers. (`<output>` is meant for form results.)
          // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
          <span role="status" className={styles.status}>
            Switching…
          </span>
        )}
      </div>
      {/* The old tab stays interactive (just dimmed) while the next one prepares. */}
      <div className={isPending ? `${styles.panel} ${styles.pending}` : styles.panel}>
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
  // Render 1 (urgent, after a keystroke): `query` = new text, `deferredQuery` = OLD text
  //   → the input updates immediately and the results are reused as-is.
  // Render 2 (background, interruptible): `deferredQuery` catches up and the list re-renders.
  //   If you type again before it finishes, React throws that render away and starts over
  //   with the latest value: no queue of stale renders, no debounce delay.
  const deferredQuery = useDeferredValue(query)
  const isStale = query !== deferredQuery

  return (
    <section className={styles.card} aria-label="Search demo">
      <label className={styles.field}>
        Search 10 000 items
        <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <section
        aria-label="Results"
        aria-busy={isStale}
        className={isStale ? `${styles.results} ${styles.pending}` : styles.results}
      >
        {/* Render 1 must be able to SKIP this subtree, or deferring buys nothing. Docs say:
            wrap SearchResults in `memo`. Here the React Compiler memoizes this JSX element
            on (deferredQuery, items, rowDelayMs), so unchanged inputs → same element → skipped. */}
        <SearchResults query={deferredQuery} items={items} rowDelayMs={rowDelayMs} />
      </section>
    </section>
  )
}

export default function SolutionDemo() {
  return (
    <div className={styles.stack}>
      <TabSwitcher />
      <ProductSearch />
    </div>
  )
}
