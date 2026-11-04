import { Component, Suspense, lazy, useState, type ErrorInfo, type ReactNode } from 'react'
import { simulateSlowNetwork } from './network'
import styles from './styles.module.scss'

// Module level: created once. Declaring `lazy()` inside a component would create a new
// component type on every render and reset its state each time.
// The dynamic import() is what lets the bundler put HeavyChart in its own chunk.
const HeavyChart = lazy(() => simulateSlowNetwork(import('./HeavyChart')))

type FallbackProps = { error: Error; reset: () => void }

type ErrorBoundaryProps = {
  children: ReactNode
  // A render function (instead of a plain element) so the fallback can show the error
  // and offer a way to reset.
  fallback: (props: FallbackProps) => ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
}
type ErrorBoundaryState = { error: Error | null }

// Still a class: there is no hook for getDerivedStateFromError / componentDidCatch.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  // Called during render when a descendant throws → must be pure: just compute state.
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  // Called after commit → the place for side effects such as logging/reporting.
  // `info.componentStack` tells you *which* component threw.
  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)
  }

  // Arrow-function field: `this` stays bound when passed as a callback to the fallback.
  reset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return this.props.fallback({ error: this.state.error, reset: this.reset })
    }
    return this.props.children
  }
}

// Crashes during render once the count reaches 3 — exactly what boundaries catch.
// (An error thrown inside onClick would NOT be caught: event handlers run outside render.)
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

export function ErrorFallback({ error, reset }: FallbackProps) {
  // role="alert" makes screen readers announce the failure immediately.
  return (
    <div role="alert" className={styles.alert}>
      <p>Something went wrong: {error.message}</p>
      <button className="btn" onClick={reset}>
        Try again
      </button>
    </div>
  )
}

export default function SolutionDemo() {
  const [showChart, setShowChart] = useState(false)
  return (
    <div className={styles.grid}>
      <section className={styles.card}>
        <h3>Error boundary</h3>
        <p className={styles.muted}>Click until the counter reaches 3.</p>
        {/* Only this card is replaced by the fallback; the rest of the page keeps working. */}
        <ErrorBoundary
          fallback={(props) => <ErrorFallback {...props} />}
          onError={(error, info) => console.info('[report]', error.message, info.componentStack)}
        >
          <BuggyCounter />
        </ErrorBoundary>
      </section>

      <section className={styles.card}>
        <h3>lazy + Suspense</h3>
        <button className="btn" onClick={() => setShowChart((s) => !s)}>
          {showChart ? 'Hide chart' : 'Show chart'}
        </button>
        {showChart && (
          // While HeavyChart's code downloads it suspends, and the nearest Suspense
          // shows its fallback. A boundary around it would also catch a failed import.
          <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
            <Suspense fallback={<p className={styles.muted}>Loading chart…</p>}>
              <HeavyChart />
            </Suspense>
          </ErrorBoundary>
        )}
      </section>
    </div>
  )
}
