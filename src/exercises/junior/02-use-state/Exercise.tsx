// 02 – useState. Instructions: see README.md (or the "Instructions" tab).
import { useState } from 'react'
import styles from './styles.module.scss'

type CounterState = {
  count: number
  history: number[] // previous values of `count`, oldest first
}

export function Counter() {
  const [state, setState] = useState<CounterState>({ count: 0, history: [] })
  // TODO 1: add a `step` state (string, initial '1') bound to the Step input,
  //         and derive the numeric step from it during render.

  function increment() {
    // TODO 2 + 3: add `step` (not 1), record the previous count in `history`,
    //             and use an updater function instead of the `state` snapshot.
    setState({ ...state, count: state.count + 1 })
  }

  function addStepThrice() {
    // TODO 4: why does this only add 1 instead of 3? Fix it.
    increment()
    increment()
    increment()
  }

  return (
    <div className={styles.counter}>
      <output className={styles.count}>Count: {state.count}</output>

      <label className={styles.field}>
        Step
        {/* TODO 1: make this input controlled */}
        <input className="input" type="number" defaultValue={1} />
      </label>

      <div className={styles.actions}>
        {/* TODO 2: Decrement */}
        <button className="btn">Decrement</button>
        <button className="btn-primary" onClick={increment}>
          Increment
        </button>
        <button className="btn" onClick={addStepThrice}>
          Add step × 3
        </button>
        {/* TODO 5: Undo (disabled when history is empty) */}
        <button className="btn">Undo</button>
        {/* TODO 6: Reset */}
        <button className="btn">Reset</button>
      </div>

      <h3 className={styles.subtitle}>History</h3>
      <ol aria-label="History" className={styles.history}>
        {state.history.map((value, index) => (
          <li key={index}>{value}</li>
        ))}
      </ol>
    </div>
  )
}

export default function ExerciseDemo() {
  return <Counter />
}
