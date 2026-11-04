import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import styles from './styles.module.scss'

export function FocusInput() {
  // `null` initial value → TypeScript types `current` as HTMLInputElement | null.
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className={styles.row}>
      <label className={styles.field}>
        Name
        <input ref={inputRef} className="input" type="text" />
      </label>
      {/* Reading the ref in an event handler is fine: the DOM exists by then. */}
      <button className="btn" onClick={() => inputRef.current?.focus()}>
        Focus the input
      </button>
    </div>
  )
}

export function Stopwatch() {
  const [elapsedMs, setElapsedMs] = useState(0)
  // The interval id is never rendered, so it lives in a ref: updating it shouldn't
  // cause a re-render, but it must survive re-renders (a plain `let` would be reset).
  const intervalRef = useRef<number | null>(null)

  function start() {
    if (intervalRef.current !== null) return // already running: don't stack intervals
    intervalRef.current = window.setInterval(() => {
      // Updater form: the callback is created once, so it must not close over a stale value.
      setElapsedMs((ms) => ms + 100)
    }, 100)
  }

  function stop() {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function reset() {
    stop()
    setElapsedMs(0)
  }

  // Unmounting while running would otherwise leave an orphan interval calling setState.
  useEffect(() => stop, [])

  return (
    <div className={styles.row}>
      <span role="timer" aria-label="Elapsed time" className={styles.timer}>
        {(elapsedMs / 1000).toFixed(1)} s
      </span>
      <button className="btn" onClick={start}>
        Start
      </button>
      <button className="btn" onClick={stop}>
        Stop
      </button>
      <button className="btn" onClick={reset}>
        Reset
      </button>
    </div>
  )
}

export type FancyInputHandle = { focus: () => void; clear: () => void }
type FancyInputProps = { label: string; ref?: Ref<FancyInputHandle> }

// React 19: `ref` is just a prop — no forwardRef wrapper needed.
export function FancyInput({ label, ref }: FancyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Expose a deliberately small API instead of the raw <input>: parents can focus and
  // clear, but can't restyle it or read arbitrary DOM properties. Easier to refactor later.
  useImperativeHandle(
    ref,
    () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => {
        if (inputRef.current) inputRef.current.value = '' // uncontrolled input
      },
    }),
    [],
  )

  return (
    <label className={styles.field}>
      {label}
      <input ref={inputRef} className="input" type="text" />
    </label>
  )
}

const ITEMS = Array.from({ length: 30 }, (_, i) => `Item ${i + 1}`)

export function JumpList() {
  // One ref holding a Map, instead of 30 useRef calls (hooks can't be called in a loop).
  const itemsRef = useRef(new Map<string, HTMLLIElement>())

  return (
    <div className={styles.jump}>
      <label className={styles.field}>
        Jump to item
        <select
          className="input"
          defaultValue=""
          onChange={(e) => {
            itemsRef.current.get(e.target.value)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }}
        >
          <option value="" disabled>
            Choose…
          </option>
          {ITEMS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <ul className={styles.scroller}>
        {ITEMS.map((item) => (
          <li
            key={item}
            ref={(node) => {
              if (node) itemsRef.current.set(item, node)
              // React 19: returning a cleanup means React calls it (instead of calling
              // the callback with `null`) when this <li> is removed → no stale entries.
              return () => {
                itemsRef.current.delete(item)
              }
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function SolutionDemo() {
  const emailRef = useRef<FancyInputHandle>(null)
  return (
    <div className={styles.grid}>
      <section className={styles.card}>
        <h3>DOM ref</h3>
        <FocusInput />
      </section>
      <section className={styles.card}>
        <h3>Mutable value ref</h3>
        <Stopwatch />
      </section>
      <section className={styles.card}>
        <h3>useImperativeHandle</h3>
        <FancyInput label="Email" ref={emailRef} />
        <div className={styles.row}>
          <button className="btn" onClick={() => emailRef.current?.focus()}>
            Focus email
          </button>
          <button className="btn" onClick={() => emailRef.current?.clear()}>
            Clear email
          </button>
        </div>
      </section>
      <section className={styles.card}>
        <h3>Ref callbacks</h3>
        <JumpList />
      </section>
    </div>
  )
}
