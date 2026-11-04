// 11 – Refs. Instructions: see README.md (or the "Instructions" tab).
import { useState, type Ref } from 'react'
import styles from './styles.module.scss'

// TODO 1: clicking the button focuses the input (useRef + ref={…})
export function FocusInput() {
  return (
    <div className={styles.row}>
      <label className={styles.field}>
        Name
        <input className="input" type="text" />
      </label>
      <button className="btn" onClick={() => {}}>
        Focus the input
      </button>
    </div>
  )
}

// TODO 2: keep the interval id in a ref; Start (once!), Stop, Reset; clean up on unmount
export function Stopwatch() {
  const [elapsedMs] = useState(0)
  return (
    <div className={styles.row}>
      <span role="timer" aria-label="Elapsed time" className={styles.timer}>
        {(elapsedMs / 1000).toFixed(1)} s
      </span>
      <button className="btn" onClick={() => {}}>
        Start
      </button>
      <button className="btn" onClick={() => {}}>
        Stop
      </button>
      <button className="btn" onClick={() => {}}>
        Reset
      </button>
    </div>
  )
}

export type FancyInputHandle = { focus: () => void; clear: () => void }
type FancyInputProps = { label: string; ref?: Ref<FancyInputHandle> }

// TODO 3: destructure `ref` (it's a regular prop in React 19) and expose { focus, clear }
//         with useImperativeHandle, using an internal ref to the <input>.
export function FancyInput({ label }: FancyInputProps) {
  return (
    <label className={styles.field}>
      {label}
      <input className="input" type="text" />
    </label>
  )
}

const ITEMS = Array.from({ length: 30 }, (_, i) => `Item ${i + 1}`)

// TODO 4: store each <li> in a Map with a ref callback that returns a cleanup,
//         and scrollIntoView() the selected item.
export function JumpList() {
  return (
    <div className={styles.jump}>
      <label className={styles.field}>
        Jump to item
        <select className="input" defaultValue="" onChange={() => {}}>
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
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export default function ExerciseDemo() {
  // TODO 3b: create a ref for FancyInput and wire the two buttons to focus() / clear()
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
        <FancyInput label="Email" />
        <div className={styles.row}>
          <button className="btn">Focus email</button>
          <button className="btn">Clear email</button>
        </div>
      </section>
      <section className={styles.card}>
        <h3>Ref callbacks</h3>
        <JumpList />
      </section>
    </div>
  )
}
