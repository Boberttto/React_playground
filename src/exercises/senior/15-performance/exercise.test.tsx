import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompiledDashboard, Dashboard } from './Exercise'

// Performance is hard to assert directly, so we assert the observable proxy:
// how many times the expensive list renders (reported by a <Profiler> inside SlowList).
const products = [
  { id: 1, name: 'Apple', price: 1 },
  { id: 2, name: 'Banana', price: 2 },
  { id: 3, name: 'Cherry', price: 3 },
]

describe.each([
  ['Dashboard (manual memoization)', Dashboard],
  ['CompiledDashboard (React Compiler)', CompiledDashboard],
])('15 – %s', (_, Component) => {
  it('filters the list and selects a product', async () => {
    const user = userEvent.setup()
    render(<Component products={products} listDelayMs={0} />)
    await user.type(screen.getByLabelText(/filter products/i), 'an')
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: /banana/i }))
    expect(screen.getByText(/selected: banana/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /banana/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('does NOT re-render the slow list when unrelated state changes', async () => {
    const user = userEvent.setup()
    const onListRender = vi.fn()
    render(<Component products={products} listDelayMs={0} onListRender={onListRender} />)
    expect(onListRender).toHaveBeenCalledTimes(1) // mount
    onListRender.mockClear()

    await user.click(screen.getByRole('button', { name: /clicked 0 times/i }))
    await user.click(screen.getByRole('button', { name: /clicked 1 times/i }))
    expect(screen.getByRole('button', { name: /clicked 2 times/i })).toBeInTheDocument()
    expect(onListRender).not.toHaveBeenCalled()
  })

  it('still re-renders the list when its inputs change', async () => {
    const user = userEvent.setup()
    const onListRender = vi.fn()
    render(<Component products={products} listDelayMs={0} onListRender={onListRender} />)
    onListRender.mockClear()

    await user.type(screen.getByLabelText(/filter products/i), 'c')
    expect(onListRender).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: /cherry/i }))
    expect(onListRender).toHaveBeenCalledTimes(2) // selectedId changed
  })
})
