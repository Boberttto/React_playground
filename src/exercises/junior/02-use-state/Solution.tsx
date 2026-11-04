import { useState } from 'react'
import styles from './styles.module.scss'

type CounterState = {
  count: number
  history: number[] // previous values of `count`, oldest first
}

const initialState: CounterState = { count: 0, history: [] }

export function Counter() {
  const [state, setState] = useState<CounterState>(initialState)
  // Inputs give us strings. Keeping the raw string lets the user clear the field
  // (''), and we derive the number during render instead of storing it twice.
  const [stepInput, setStepInput] = useState('1')
  const step = Number(stepInput) || 0

  // Every update goes through an updater function: `s` is the *pending* state,
  // so several calls in the same event chain correctly instead of all reading
  // the same render snapshot.
  function changeBy(delta: number) {
    setState((s) => ({
      count: s.count + delta,
      // New array: spreading never mutates the previous history.
      history: [...s.history, s.count],
    }))
  }

  function addStepThrice() {
    // Three queued updaters, one re-render (batching): 0 → step → 2·step → 3·step.
    changeBy(step)
    changeBy(step)
    changeBy(step)
  }

  function undo() {
    setState((s) => {
      const previous = s.history.at(-1)
      if (previous === undefined) return s // returning the same object = no re-render
      return { count: previous, history: s.history.slice(0, -1) }
    })
  }

  function reset() {
    // No dependency on the previous state, so a plain value is fine here.
    setState(initialState)
  }

  return (
    <div className={styles.counter}>
      {/* <output> has the implicit ARIA role "status": changes are announced politely. */}
      <output className={styles.count}>Count: {state.count}</output>

      <label className={styles.field}>
        Step
        <input
          className="input"
          type="number"
          value={stepInput}
          onChange={(e) => setStepInput(e.target.value)}
        />
      </label>

      <div className={styles.actions}>
        <button className="btn" onClick={() => changeBy(-step)}>
          Decrement
        </button>
        <button className="btn-primary" onClick={() => changeBy(step)}>
          Increment
        </button>
        <button className="btn" onClick={addStepThrice}>
          Add step × 3
        </button>
        <button className="btn" onClick={undo} disabled={state.history.length === 0}>
          Undo
        </button>
        <button className="btn" onClick={reset}>
          Reset
        </button>
      </div>

      <h3 className={styles.subtitle}>History</h3>
      <ol aria-label="History" className={styles.history}>
        {/* Index keys are acceptable here: items are only appended/removed at the end
            and have no state of their own. See exercise 03 for when they're not. */}
        {state.history.map((value, index) => (
          <li key={index}>{value}</li>
        ))}
      </ol>
    </div>
  )
}

export default function SolutionDemo() {
  return <Counter />
}
