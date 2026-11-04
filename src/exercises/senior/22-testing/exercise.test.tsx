// Reference test suite for UserSearch: one way to write the tests listed in UserSearch.test.tsx.
// Try writing your own first!
import { act, render, renderHook, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserSearch, useDebouncedValue } from './Exercise'

type User = { id: number; name: string; email: string }

const ada: User = { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' }
const alan: User = { id: 2, name: 'Alan Turing', email: 'alan@example.com' }

// Debounce = timers. Fake timers make the 300 ms instant and deterministic.
// `shouldAdvanceTime` keeps the clock moving so user-event's own internal delays don't hang,
// and `advanceTimers` tells user-event how to move our fake clock.
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function setup(search = vi.fn(async (_q: string, _signal: AbortSignal): Promise<User[]> => [ada, alan])) {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  render(<UserSearch search={search} />)
  // Query priority #1: getByRole with an accessible name, the way users find things.
  const input = screen.getByRole('searchbox', { name: /search users/i })
  return { user, input, search }
}

const waitForDebounce = () => act(() => vi.advanceTimersByTime(300))

describe('22 – UserSearch', () => {
  it('renders a labelled search box and does not search on mount', () => {
    const { search } = setup()
    expect(search).not.toHaveBeenCalled()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('debounces: one request for a burst of keystrokes, with the final query', async () => {
    const { user, input, search } = setup()
    await user.type(input, 'ada')
    expect(search).not.toHaveBeenCalled() // still inside the 300 ms window

    await waitForDebounce()
    expect(search).toHaveBeenCalledTimes(1)
    expect(search).toHaveBeenCalledWith('ada', expect.any(AbortSignal))
  })

  it('shows a loading status, then the results', async () => {
    // Control WHEN the "server" answers, to observe the in-between state.
    let respond!: (users: User[]) => void
    const search = vi.fn((_q: string, _signal: AbortSignal) => new Promise<User[]>((r) => (respond = r)))
    const { user, input } = setup(search)
    await user.type(input, 'a')
    await waitForDebounce()
    expect(screen.getByRole('status')).toHaveTextContent(/searching/i)

    await act(async () => respond([ada, alan]))
    // findBy* = waitFor + getBy: retries until the async result appears. (After the awaited
    // act above a getBy would do; findBy is the robust default when you don't control timing.)
    const list = await screen.findByRole('list', { name: 'Results' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
    expect(within(list).getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows an empty state when nothing matches', async () => {
    const { user, input } = setup(vi.fn(async () => []))
    await user.type(input, 'zzz')
    await waitForDebounce()
    expect(await screen.findByText(/no users found for “zzz”/i)).toBeInTheDocument()
  })

  it('shows an error and recovers with Retry', async () => {
    const search = vi
      .fn<(q: string, signal: AbortSignal) => Promise<User[]>>()
      .mockRejectedValueOnce(new Error('Server exploded'))
      .mockResolvedValueOnce([ada])
    const { user, input } = setup(search)
    await user.type(input, 'ada')
    await waitForDebounce()

    expect(await screen.findByRole('alert')).toHaveTextContent('Server exploded')
    await user.click(screen.getByRole('button', { name: /retry/i }))
    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(search).toHaveBeenCalledTimes(2)
  })

  it('aborts the previous request when the query changes', async () => {
    const search = vi.fn((_q: string, _signal: AbortSignal) => new Promise<User[]>(() => {}))
    const { user, input } = setup(search)
    await user.type(input, 'a')
    await waitForDebounce()
    await user.type(input, 'l')
    await waitForDebounce()

    expect(search).toHaveBeenCalledTimes(2)
    const [, firstSignal] = search.mock.calls[0]
    const [, secondSignal] = search.mock.calls[1]
    expect(firstSignal.aborted).toBe(true)
    expect(secondSignal.aborted).toBe(false)
  })

  it('calls the real API with fetch when no search function is injected (mocked fetch)', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify([alan]), { headers: { 'Content-Type': 'application/json' } }))
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<UserSearch />)

    await user.type(screen.getByRole('searchbox', { name: /search users/i }), 'alan turing')
    await waitForDebounce()

    expect(await screen.findByText('Alan Turing')).toBeInTheDocument()
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(String(fetchSpy.mock.calls[0][0])).toBe('/api/users?q=alan%20turing')
  })
})

describe('22 – useDebouncedValue (renderHook)', () => {
  it('returns the initial value, then updates only after the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'a' },
    })
    expect(result.current).toBe('a')

    rerender({ value: 'ab' })
    act(() => vi.advanceTimersByTime(299))
    expect(result.current).toBe('a')

    rerender({ value: 'abc' }) // restarts the timer
    act(() => vi.advanceTimersByTime(299))
    expect(result.current).toBe('a')

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('abc')
  })
})
