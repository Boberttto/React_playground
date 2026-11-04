import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Profiler } from 'react'
import { renderToString } from 'react-dom/server'
import { createStore, useStore, type StoreApi } from './Exercise'

type State = { count: number; name: string }
const makeStore = () => createStore<State>({ count: 0, name: 'Ada' })

describe('19 – createStore', () => {
  it('merges partial updates immutably', () => {
    const store = makeStore()
    const before = store.getState()
    store.setState({ count: 1 })
    expect(store.getState()).toEqual({ count: 1, name: 'Ada' })
    expect(store.getState()).not.toBe(before) // a NEW object
    expect(before).toEqual({ count: 0, name: 'Ada' }) // old snapshot untouched
  })

  it('accepts an updater function', () => {
    const store = makeStore()
    store.setState((s) => ({ count: s.count + 5 }))
    store.setState((s) => ({ count: s.count + 5 }))
    expect(store.getState().count).toBe(10)
  })

  it('notifies subscribers, and stops after unsubscribe', () => {
    const store = makeStore()
    const listener = vi.fn()
    const unsubscribe = store.subscribe(listener)
    store.setState({ count: 1 })
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    store.setState({ count: 2 })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('does not notify when the updater returns the same state', () => {
    const store = makeStore()
    const listener = vi.fn()
    store.subscribe(listener)
    store.setState((s) => s)
    expect(listener).not.toHaveBeenCalled()
  })
})

function Count({ store }: { store: StoreApi<State> }) {
  const count = useStore(store, (s) => s.count)
  return <p>Count: {count}</p>
}

function Whole({ store }: { store: StoreApi<State> }) {
  const state = useStore(store)
  return (
    <p>
      {state.name} has {state.count}
    </p>
  )
}

describe('19 – useStore', () => {
  it('re-renders when the store changes, even from outside React', () => {
    const store = makeStore()
    render(
      <>
        <Count store={store} />
        <Whole store={store} />
      </>,
    )
    expect(screen.getByText('Count: 0')).toBeInTheDocument()
    act(() => store.setState({ count: 3 }))
    expect(screen.getByText('Count: 3')).toBeInTheDocument()
    expect(screen.getByText('Ada has 3')).toBeInTheDocument()
  })

  it('works with event handlers', async () => {
    const user = userEvent.setup()
    const store = makeStore()
    function Counter() {
      const count = useStore(store, (s) => s.count)
      return <button onClick={() => store.setState((s) => ({ count: s.count + 1 }))}>Count is {count}</button>
    }
    render(<Counter />)
    await user.click(screen.getByRole('button', { name: 'Count is 0' }))
    await user.click(screen.getByRole('button', { name: 'Count is 1' }))
    expect(screen.getByRole('button', { name: 'Count is 2' })).toBeInTheDocument()
  })

  it('only re-renders components whose selected slice changed', () => {
    const store = makeStore()
    const onRender = vi.fn()
    render(
      <Profiler id="count" onRender={onRender}>
        <Count store={store} />
      </Profiler>,
    )
    onRender.mockClear()

    act(() => store.setState({ name: 'Grace' })) // unrelated slice
    expect(onRender).not.toHaveBeenCalled()

    act(() => store.setState({ count: 1 }))
    expect(onRender).toHaveBeenCalledTimes(1)
  })

  it('subscribes once on mount and unsubscribes on unmount', () => {
    const store = makeStore()
    let active = 0
    const originalSubscribe = store.subscribe
    store.subscribe = (listener) => {
      active += 1
      const unsubscribe = originalSubscribe(listener)
      return () => {
        active -= 1
        unsubscribe()
      }
    }
    const { rerender, unmount } = render(<Count store={store} />)
    rerender(<Count store={store} />)
    expect(active).toBe(1)
    unmount()
    expect(active).toBe(0)
  })

  it('renders the INITIAL state on the server (getServerSnapshot)', () => {
    const store = makeStore()
    store.setState({ count: 42 }) // client-side change the server can't know about
    const html = renderToString(<Count store={store} />)
    expect(html).toContain('Count: <!-- -->0')
  })
})
