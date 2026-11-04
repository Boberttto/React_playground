// 19 – External store. Instructions: see README.md (or the "Instructions" tab).
/* eslint-disable react/only-export-components -- the tests import these non-component exports from this module; fast refresh of an exercise file is not a concern */
import { Profiler, useState, type ProfilerOnRenderCallback } from 'react'
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
  // TODO 1: keep the listeners in a Set

  return {
    getState: () => state,
    setState: (_partial) => {
      // TODO 2: - resolve the partial (it may be a function of the current state)
      //         - if Object.is(partial, state), do nothing
      //         - otherwise REPLACE state with a new merged object: { ...state, ...partial }
      //         - notify every listener
    },
    subscribe: (_listener) => {
      // TODO 3: add the listener and return a function that removes it
      return () => {}
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
  // TODO 4: replace this with useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  //         - getSnapshot       → selector(store.getState())
  //         - getServerSnapshot → selector(store.getInitialState())
  // BUG: this copies the state ONCE into React state and never hears about changes.
  const [value] = useState(() => selector(store.getState()))
  return value
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

export default function ExerciseDemo() {
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
