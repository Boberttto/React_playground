// 19 – External store (solution). A ~40-line Zustand.
/* eslint-disable react/only-export-components -- the tests import these non-component exports from this module; fast refresh of an exercise file is not a concern */
import { Profiler, useSyncExternalStore, type ProfilerOnRenderCallback } from 'react'
import styles from './styles.module.scss'

type Listener = () => void
type SetStateArg<T> = Partial<T> | ((state: T) => Partial<T>)

export type StoreApi<T> = {
  getState: () => T
  setState: (partial: SetStateArg<T>) => void
  subscribe: (listener: Listener) => () => void
  getInitialState: () => T
}

/* ------------------------------------------------------------------ */
/* 1. The store: plain JavaScript, no React                             */
/* ------------------------------------------------------------------ */

export function createStore<T extends object>(initialState: T): StoreApi<T> {
  let state = initialState
  // A Set: subscribing the same function twice is harmless, and deletion is O(1).
  const listeners = new Set<Listener>()

  return {
    getState: () => state,
    setState: (partial) => {
      const next = typeof partial === 'function' ? partial(state) : partial
      // `setState(s => s)` means "no change": skip the notification entirely.
      if (Object.is(next, state)) return
      // NEVER mutate: React compares snapshots with Object.is. Mutating `state` in place
      // would keep the same reference, so React would think nothing changed.
      state = { ...state, ...next }
      // Listeners only learn THAT something changed. Each one re-reads what it needs.
      listeners.forEach((listener) => listener())
    },
    // Defined once per store, so it's a STABLE function. If `subscribe` changed on every
    // render, useSyncExternalStore would unsubscribe and resubscribe on every render.
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    getInitialState: () => initialState,
  }
}

/* ------------------------------------------------------------------ */
/* 2. The React binding                                                 */
/* ------------------------------------------------------------------ */

export function useStore<T>(store: StoreApi<T>): T
export function useStore<T, U>(store: StoreApi<T>, selector: (state: T) => U): U
export function useStore<T, U>(store: StoreApi<T>, selector: (state: T) => U = (s) => s as unknown as U): U {
  // Why not useState + useEffect(subscribe)? In concurrent rendering, React can pause a render
  // halfway through. If the store changes during that pause, components rendered before and
  // after the change would show DIFFERENT values in the same commit: "tearing".
  // useSyncExternalStore detects that the snapshot changed during render and re-renders
  // synchronously, so the whole screen always shows one consistent version.
  return useSyncExternalStore(
    // 1. subscribe(callback): React calls `callback` → re-reads the snapshot.
    store.subscribe,
    // 2. getSnapshot: called on EVERY render and after every notification. React re-renders
    //    only if the result changed (Object.is). That's what makes selectors efficient:
    //    a `name` change gives the same `count`, so CountDisplay doesn't re-render.
    //    It must return a cached/stable value: `s => ({ a: s.a })` would be a new object each
    //    call → "getSnapshot should be cached" warning and an infinite render loop.
    () => selector(store.getState()),
    // 3. getServerSnapshot: used during SSR and HYDRATION. It must return the same value on
    //    the server and on the client's first render, or hydration fails with a mismatch. The
    //    initial state is the one value both sides agree on. (Without this argument,
    //    renderToString throws "Missing getServerSnapshot".)
    () => selector(store.getInitialState()),
  )
}

/* ------------------------------------------------------------------ */
/* Demo                                                                 */
/* ------------------------------------------------------------------ */

type AppState = { count: number; name: string }
const appStore = createStore<AppState>({ count: 0, name: 'Ada' })

const logRender: ProfilerOnRenderCallback = (id, phase) => console.info(`[render] ${id} (${phase})`)

function CountDisplay() {
  const count = useStore(appStore, (s) => s.count)
  return <p className={styles.value}>Count: {count}</p>
}

function NameDisplay() {
  const name = useStore(appStore, (s) => s.name)
  return <p className={styles.value}>Name: {name}</p>
}

export default function SolutionDemo() {
  return (
    <div className={styles.grid}>
      <section className={styles.card} aria-label="Count">
        <Profiler id="CountDisplay" onRender={logRender}>
          <CountDisplay />
        </Profiler>
        <div className={styles.actions}>
          <button type="button" className="btn" onClick={() => appStore.setState((s) => ({ count: s.count + 1 }))}>
            +1
          </button>
          {/* Updates can come from anywhere: timers, websockets, other frameworks… */}
          <button
            type="button"
            className="btn"
            onClick={() => setTimeout(() => appStore.setState((s) => ({ count: s.count + 10 })), 500)}
          >
            +10 in 0.5 s (outside React)
          </button>
        </div>
      </section>
      <section className={styles.card} aria-label="Name">
        <Profiler id="NameDisplay" onRender={logRender}>
          <NameDisplay />
        </Profiler>
        <label className={styles.field}>
          Rename
          <input
            className="input"
            defaultValue="Ada"
            onChange={(e) => appStore.setState({ name: e.target.value })}
          />
        </label>
      </section>
      <p className={styles.hint}>Open the console: only the component whose slice changed re-renders.</p>
    </div>
  )
}
