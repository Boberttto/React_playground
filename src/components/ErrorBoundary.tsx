import { Component, type ErrorInfo, type ReactNode } from 'react'
import styles from './ErrorBoundary.module.scss'

type Props = { children: ReactNode }
type State = { error: Error | null }

/**
 * Shell error boundary: an unfinished exercise should never crash the whole app.
 * (Exercise 13 asks you to build your own — don't peek!)
 * https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[playground] exercise crashed', error, info.componentStack)
  }


  render() {
    if (this.state.error) {
      return (
        <div role="alert" className={styles.error}>
          <strong>This component threw an error</strong>
          <pre>{this.state.error.message}</pre>
          <button className="btn" onClick={() => this.setState({ error: null })}>
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
