import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductSearch, TabSwitcher } from './Exercise'

// A promise we resolve by hand, to control exactly when "the server" answers.
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((r) => {
    resolve = r
  })
  return { promise, resolve }
}

describe('16 – TabSwitcher (useTransition)', () => {
  it('keeps the current tab visible and shows a pending indicator while the next tab loads', async () => {
    const user = userEvent.setup()
    const posts = deferred<{ id: number; title: string }[]>()
    render(<TabSwitcher loadPosts={() => posts.promise} slowItemMs={0} />)

    expect(screen.getByText(/this is the about tab/i)).toBeInTheDocument()
    // The click makes a component suspend: wrap it in an *awaited* act so React can
    // retry the render once the promise resolves.
    await act(() => user.click(screen.getByRole('button', { name: 'Posts' })))

    // Transition + suspension → React keeps the old UI instead of the fallback.
    expect(screen.getByText(/this is the about tab/i)).toBeInTheDocument()
    expect(screen.queryByText(/loading posts/i)).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/switching/i)

    await act(async () => posts.resolve([{ id: 1, title: 'Hello transitions' }]))

    expect(await screen.findByText('Hello transitions')).toBeInTheDocument()
    expect(screen.queryByText(/this is the about tab/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Posts' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches between already-available tabs', async () => {
    const user = userEvent.setup()
    render(<TabSwitcher loadPosts={() => new Promise(() => {})} slowItemMs={0} />)
    await user.click(screen.getByRole('button', { name: 'Contact' }))
    expect(screen.getByText(/hello@example.com/)).toBeInTheDocument()
  })
})

describe('16 – ProductSearch (useDeferredValue)', () => {
  const items = [
    { id: 1, label: 'apple pie' },
    { id: 2, label: 'banana split' },
    { id: 3, label: 'cherry tart' },
  ]

  it('filters the results', async () => {
    const user = userEvent.setup()
    render(<ProductSearch items={items} rowDelayMs={0} />)
    await user.type(screen.getByRole('textbox', { name: /search/i }), 'an')
    expect(screen.getByRole('textbox', { name: /search/i })).toHaveValue('an')
    expect(screen.getByText('banana split')).toBeInTheDocument()
    expect(screen.queryByText('apple pie')).not.toBeInTheDocument()
  })

  it('briefly marks the results as stale (aria-busy) while they catch up with the input', async () => {
    const user = userEvent.setup()
    render(<ProductSearch items={items} rowDelayMs={0} />)
    const results = screen.getByRole('region', { name: 'Results' })
    expect(results).toHaveAttribute('aria-busy', 'false')

    // `act` flushes both renders (urgent + deferred) before returning, so we record every
    // DOM change to prove the intermediate "stale" commit really happened.
    const records: MutationRecord[] = []
    const observer = new MutationObserver((batch) => records.push(...batch))
    observer.observe(results, { attributes: true, attributeFilter: ['aria-busy'], attributeOldValue: true })
    await user.type(screen.getByRole('textbox', { name: /search/i }), 'c')
    records.push(...observer.takeRecords())
    observer.disconnect()

    expect(records.some((r) => r.oldValue === 'true')).toBe(true) // it WAS busy at some point…
    expect(results).toHaveAttribute('aria-busy', 'false') // …and settled
    expect(screen.getByText('cherry tart')).toBeInTheDocument()
  })
})
