import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExerciseDemo, { ErrorBoundary, ErrorFallback } from './Exercise'

// React reports caught errors with console.error — silence it to keep the output readable.
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'info').mockImplementation(() => {})
})
afterEach(() => {
  vi.restoreAllMocks()
})

let shouldThrow = true
function Bomb() {
  if (shouldThrow) throw new Error('Boom')
  return <p>All good</p>
}

describe('13 – ErrorBoundary', () => {
  beforeEach(() => {
    shouldThrow = true
  })

  it('renders its children when nothing throws', () => {
    shouldThrow = false
    render(
      <ErrorBoundary fallback={() => <p>fallback</p>}>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByText('All good')).toBeInTheDocument()
    expect(screen.queryByText('fallback')).not.toBeInTheDocument()
  })

  it('renders the fallback with the error when a child throws during render', () => {
    render(
      <ErrorBoundary fallback={({ error }) => <p>Caught: {error.message}</p>}>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Caught: Boom')).toBeInTheDocument()
  })

  it('calls onError with the error and a component stack', () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary fallback={() => null} onError={onError}>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(onError).toHaveBeenCalledTimes(1)
    const [error, info] = onError.mock.calls[0]
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('Boom')
    expect(info.componentStack).toContain('Bomb')
  })

  it('reset() renders the children again', async () => {
    const user = userEvent.setup()
    render(
      <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
        <Bomb />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong: Boom')

    shouldThrow = false // the "bug" is fixed (e.g. the network came back)
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.getByText('All good')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('13 – demo', () => {
  it('isolates the crashing counter and lets you recover', async () => {
    const user = userEvent.setup()
    render(<ExerciseDemo />)
    const increment = screen.getByRole('button', { name: 'Increment' })
    await user.click(increment)
    await user.click(increment)
    await user.click(increment)

    expect(screen.getByRole('alert')).toHaveTextContent('Counter crashed at 3!')
    // The rest of the page is still alive.
    expect(screen.getByRole('button', { name: 'Show chart' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
  })

  it('lazy-loads the chart behind a Suspense fallback', async () => {
    const user = userEvent.setup()
    render(<ExerciseDemo />)
    expect(screen.queryByRole('figure', { name: 'Monthly sales chart' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Show chart' }))
    expect(screen.getByText('Loading chart…')).toBeInTheDocument()

    expect(await screen.findByRole('figure', { name: 'Monthly sales chart' }, { timeout: 3000 })).toBeInTheDocument()
    expect(screen.queryByText('Loading chart…')).not.toBeInTheDocument()
  })
})
