// YOUR test file. Turn each `it.todo` into a real `it(...)`. Run with:
//   npm test -- UserSearch.test
// Peek at exercise.test.tsx only after you've tried (it's the reference suite).
//
// You'll probably need (uncomment as you go):
// import { act, render, renderHook, screen, within } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
// import { UserSearch, useDebouncedValue } from './Exercise'
//
// Fake timers recipe for the debounce:
//   beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
//   afterEach(() => vi.useRealTimers())
//   const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
//   act(() => vi.advanceTimersByTime(300))

describe('UserSearch (my tests)', () => {
  it.todo('renders a search box labelled "Search users" and does not search on mount')
  it.todo('debounces: typing "ada" quickly triggers ONE search, for "ada", after 300 ms')
  it.todo('shows a "Searching…" status while the request is in flight')
  it.todo('shows the results in a list named "Results"')
  it.todo('shows "No users found" when the API returns an empty array')
  it.todo('shows an alert when the request fails, and Retry recovers')
  it.todo('aborts the previous request (AbortSignal) when the query changes')
  it.todo('uses fetch with the encoded query when no `search` prop is given (mock fetch)')
})

describe('useDebouncedValue (my tests)', () => {
  it.todo('returns the initial value immediately')
  it.todo('only updates after the value stopped changing for the delay (renderHook + rerender)')
})
