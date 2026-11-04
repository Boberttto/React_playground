import { act, createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExerciseDemo, { FancyInput, FocusInput, JumpList, Stopwatch, type FancyInputHandle } from './Exercise'

describe('11 – DOM refs', () => {
  it('focuses the input when the button is clicked', async () => {
    const user = userEvent.setup()
    render(<FocusInput />)
    await user.click(screen.getByRole('button', { name: 'Focus the input' }))
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus()
  })
})

describe('11 – Stopwatch (mutable ref)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts, stops and resets', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<Stopwatch />)
    const timer = screen.getByRole('timer', { name: 'Elapsed time' })
    expect(timer).toHaveTextContent('0.0 s')

    await user.click(screen.getByRole('button', { name: 'Start' }))
    act(() => vi.advanceTimersByTime(1000))
    expect(timer).toHaveTextContent('1.0 s')

    await user.click(screen.getByRole('button', { name: 'Stop' }))
    act(() => vi.advanceTimersByTime(1000))
    expect(timer).toHaveTextContent('1.0 s')

    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(timer).toHaveTextContent('0.0 s')
  })

  it('does not run two intervals when Start is clicked twice', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<Stopwatch />)
    await user.click(screen.getByRole('button', { name: 'Start' }))
    await user.click(screen.getByRole('button', { name: 'Start' }))
    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByRole('timer')).toHaveTextContent('1.0 s')
  })

  it('clears its interval on unmount', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const { unmount } = render(<Stopwatch />)
    await user.click(screen.getByRole('button', { name: 'Start' }))
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('11 – FancyInput (ref as a prop + useImperativeHandle)', () => {
  it('exposes focus() and clear() through its ref', async () => {
    const user = userEvent.setup()
    const ref = createRef<FancyInputHandle>()
    render(<FancyInput label="Email" ref={ref} />)
    const input = screen.getByRole('textbox', { name: 'Email' })

    await user.type(input, 'ada@example.com')
    await user.click(document.body) // move focus away

    act(() => ref.current!.focus())
    expect(input).toHaveFocus()

    act(() => ref.current!.clear())
    expect(input).toHaveValue('')
  })

  it('exposes only the imperative API, not the DOM node', () => {
    const ref = createRef<FancyInputHandle>()
    render(<FancyInput label="Email" ref={ref} />)
    expect(ref.current).not.toBeInstanceOf(HTMLElement)
    expect(Object.keys(ref.current ?? {}).sort()).toEqual(['clear', 'focus'])
  })

  it('demo buttons drive the FancyInput', async () => {
    const user = userEvent.setup()
    render(<ExerciseDemo />)
    const email = screen.getByRole('textbox', { name: 'Email' })
    await user.type(email, 'x@y.z')
    await user.click(screen.getByRole('button', { name: 'Clear email' }))
    expect(email).toHaveValue('')
    await user.click(screen.getByRole('button', { name: 'Focus email' }))
    expect(email).toHaveFocus()
  })
})

describe('11 – JumpList (ref callbacks)', () => {
  it('scrolls the chosen item into view', async () => {
    // jsdom doesn't implement scrollIntoView, so we provide a spy.
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    const user = userEvent.setup()
    render(<JumpList />)

    await user.selectOptions(screen.getByRole('combobox', { name: 'Jump to item' }), 'Item 25')
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    // `this` inside the call is the element that was scrolled.
    const target = screen.getAllByRole('listitem').find((li) => li.textContent === 'Item 25')
    expect(scrollIntoView.mock.contexts[0]).toBe(target)
  })
})
