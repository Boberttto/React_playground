// 13 – Error Boundaries & Suspense. Instructions: see README.md (or the "Instructions" tab).
import { Component, useState, type ErrorInfo, type ReactNode } from 'react'
// TODO 3: load HeavyChart with lazy() + simulateSlowNetwork(import('./HeavyChart')) from './network'
import HeavyChart from './HeavyChart'
import styles from './styles.module.scss'

type FallbackProps = { error: Error; reset: () => void }

type ErrorBoundaryProps = {
  children: ReactNode
  fallback: (props: FallbackProps) => ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
}
type ErrorBoundaryState = { error: Error | null }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  // TODO 1a: static getDerivedStateFromError(error) → { error }
  // TODO 1b: componentDidCatch(error, info) → call this.props.onError
  // TODO 1c: reset = () => …  (set error back to null)

  render() {
    // TODO 1d: render this.props.fallback({ error, reset }) when there is an error
    return this.props.children
  }
}

// Crashes during render once the count reaches 3 — exactly what boundaries catch.
export function BuggyCounter() {
  const [count, setCount] = useState(0)
  if (count === 3) {
    throw new Error('Counter crashed at 3!')
  }
  return (
    <div className={styles.row}>
      <span>Count: {count}</span>
      <button className="btn" onClick={() => setCount((c) => c + 1)}>
        Increment
      </button>
    </div>
  )
}

// TODO 2: role="alert" box with "Something went wrong: <message>" and a "Try again" button
export function ErrorFallback({ error }: FallbackProps) {
  return <p>{error.message}</p>
}

export default function ExerciseDemo() {
  const [showChart, setShowChart] = useState(false)
  return (
    <div className={styles.grid}>
      <section className={styles.card}>
        <h3>Error boundary</h3>
        <p className={styles.muted}>Click until the counter reaches 3.</p>
        {/* TODO 2: fallback={(props) => <ErrorFallback {...props} />} */}
        <ErrorBoundary fallback={() => null}>
          <BuggyCounter />
        </ErrorBoundary>
      </section>

      <section className={styles.card}>
        <h3>lazy + Suspense</h3>
        <button className="btn" onClick={() => setShowChart((s) => !s)}>
          {showChart ? 'Hide chart' : 'Show chart'}
        </button>
        {/* TODO 4: wrap in <Suspense fallback={<p>Loading chart…</p>}> */}
        {showChart && <HeavyChart />}
      </section>
    </div>
  )
}
