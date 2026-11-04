import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExerciseDemo, { useDebounce, useLocalStorage } from './Exercise'

describe('08 – useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('a', 300))
    expect(result.current).toBe('a')
  })

  it('only updates after the delay has elapsed', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'ab' })
    expect(result.current).toBe('a')

    act(() => vi.advanceTimersByTime(299))
    expect(result.current).toBe('a')

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('ab')
  })

  it('restarts the timer when the value keeps changing', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'ab' })
    act(() => vi.advanceTimersByTime(200))
    rerender({ value: 'abc' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('a') // 'ab' was cancelled, 'abc' not due yet

    act(() => vi.advanceTimersByTime(100))
    expect(result.current).toBe('abc')
  })
})

describe('08 – useLocalStorage', () => {
  beforeEach(() => localStorage.clear())

  it('falls back to the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('count', 5))
    expect(result.current[0]).toBe(5)
  })

  it('reads an existing JSON value on mount', () => {
    localStorage.setItem('user', JSON.stringify({ name: 'Ada' }))
    const { result } = renderHook(() => useLocalStorage('user', { name: '' }))
    expect(result.current[0]).toEqual({ name: 'Ada' })
  })

  it('falls back to the initial value when the stored JSON is invalid', () => {
    localStorage.setItem('broken', '{not json')
    const { result } = renderHook(() => useLocalStorage('broken', 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })

  it('writes updates (including updater functions) to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('count', 1))
    act(() => result.current[1](10))
    expect(result.current[0]).toBe(10)
    expect(localStorage.getItem('count')).toBe('10')

    act(() => result.current[1]((n) => n + 1))
    expect(result.current[0]).toBe(11)
    expect(localStorage.getItem('count')).toBe('11')
  })

  it('shares logic, not state: two hooks with different keys are independent', () => {
    const { result } = renderHook(() => ({
      a: useLocalStorage('a', 0),
      b: useLocalStorage('b', 0),
    }))
    act(() => result.current.a[1](1))
    expect(result.current.a[0]).toBe(1)
    expect(result.current.b[0]).toBe(0)
  })
})

describe('08 – debounced, persisted search demo', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('filters the list only after typing stops', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<ExerciseDemo />)
    const list = screen.getByRole('list', { name: 'Results' })
    const initialCount = list.querySelectorAll('li').length

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'svelte')
    // Still the full list right after typing…
    expect(screen.getAllByRole('listitem')).toHaveLength(initialCount)

    act(() => vi.advanceTimersByTime(300))
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Svelte', 'SvelteKit'])
  })

  it('remembers the last query after a remount', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const { unmount } = render(<ExerciseDemo />)
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'vue')
    unmount()

    render(<ExerciseDemo />)
    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('vue')
  })
})
