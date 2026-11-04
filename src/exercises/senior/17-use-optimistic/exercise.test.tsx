import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LikeButton, MessageThread } from './Exercise'

// A promise we settle by hand, to freeze the UI in its "request in flight" state.
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

describe('17 – LikeButton', () => {
  it('shows the like immediately, then keeps it once the server confirms', async () => {
    const user = userEvent.setup()
    const request = deferred<boolean>()
    render(<LikeButton initialCount={10} saveLike={() => request.promise} />)

    await user.click(screen.getByRole('button', { name: /like/i }))
    // Server hasn't answered yet, but the UI already reflects the click.
    expect(screen.getByRole('button', { name: /like/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /like/i })).toHaveTextContent('11')

    await act(async () => request.resolve(true))
    expect(screen.getByRole('button', { name: /like/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /like/i })).toHaveTextContent('11')
  })

  it('rolls back and shows an error when the request fails', async () => {
    const user = userEvent.setup()
    const request = deferred<boolean>()
    render(<LikeButton initialCount={10} saveLike={() => request.promise} />)

    await user.click(screen.getByRole('button', { name: /like/i }))
    expect(screen.getByRole('button', { name: /like/i })).toHaveTextContent('11')

    await act(async () => request.reject(new Error('boom')))
    expect(screen.getByRole('button', { name: /like/i })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: /like/i })).toHaveTextContent('10')
    expect(screen.getByRole('alert')).toHaveTextContent(/could not save/i)
  })
})

describe('17 – MessageThread', () => {
  it('shows the message instantly as "Sending…", then as a normal message', async () => {
    const user = userEvent.setup()
    const request = deferred<{ id: string; text: string }>()
    render(<MessageThread send={() => request.promise} />)

    await user.type(screen.getByLabelText('Message'), 'Hello')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    const list = screen.getByRole('list')
    expect(within(list).getByText('Hello')).toBeInTheDocument()
    expect(within(list).getByText(/sending/i)).toBeInTheDocument()

    await act(async () => request.resolve({ id: '42', text: 'Hello' }))
    expect(within(list).getByText('Hello')).toBeInTheDocument()
    expect(within(list).queryByText(/sending/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Message')).toHaveValue('') // form reset after the Action
  })

  it('removes the optimistic message and shows an error when sending fails', async () => {
    const user = userEvent.setup()
    const request = deferred<{ id: string; text: string }>()
    render(<MessageThread initialMessages={[{ id: '1', text: 'First' }]} send={() => request.promise} />)

    await user.type(screen.getByLabelText('Message'), 'Oops')
    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(screen.getByText('Oops')).toBeInTheDocument()

    await act(async () => request.reject(new Error('Server said no')))
    expect(screen.queryByText('Oops')).not.toBeInTheDocument()
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Server said no')
  })
})
