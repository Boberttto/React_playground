import { Component, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** Rendered instead of `children` after an error. Call `reset` to try again. */
  fallback: (error: Error, reset: () => void) => ReactNode
  /** Called on reset, e.g. to let the parent re-render with fresh promises. */
  onReset?: () => void
}
type State = { error: Error | null }

/**
 * Provided for you (you built one in exercise 13). Error boundaries are still class-only:
 * there is no hook equivalent of getDerivedStateFromError. A promise passed to `use()` that
 * REJECTS is thrown like a render error, so the nearest boundary catches it.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  reset = () => {
    this.props.onReset?.()
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) return this.props.fallback(this.state.error, this.reset)
    return this.props.children
  }
}
