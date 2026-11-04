import { StrictMode } from 'react'
import { act, render, screen } from '@testing-library/react'
import { UserProfile, type User } from './Exercise'

const leanne: User = { id: 1, name: 'Leanne Graham', email: 'Sincere@april.biz' }
const ervin: User = { id: 2, name: 'Ervin Howell', email: 'Shanna@melissa.tv' }
const url = (id: number) => `https://jsonplaceholder.typicode.com/users/${id}`

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

type PendingCall = {
  url: string
  signal: AbortSignal | undefined
  resolve: (res: Response) => void
}

/**
 * Replaces fetch with one whose responses we resolve by hand, in any order.
 * `rejectOnAbort: true` behaves like the real fetch (rejects with an AbortError).
 * `rejectOnAbort: false` simulates a response that arrives anyway, so the
 * component must ignore it on its own.
 */
function mockControlledFetch({ rejectOnAbort }: { rejectOnAbort: boolean }) {
  const calls: PendingCall[] = []
  vi.spyOn(globalThis, 'fetch').mockImplementation(
    (input, init) =>
      new Promise<Response>((resolve, reject) => {
        const signal = init?.signal ?? undefined
        if (rejectOnAbort) {
          signal?.addEventListener('abort', () =>
            reject(new DOMException('The operation was aborted.', 'AbortError')),
          )
        }
        calls.push({ url: String(input), signal, resolve })
      }),
  )
  return calls
}

/** Resolve a pending call and let the component's promise chain settle. */
async function respond(call: PendingCall, body: unknown, status = 200) {
  await act(async () => {
    call.resolve(jsonResponse(body, status))
    await new Promise((r) => setTimeout(r, 0))
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('07 – UserProfile', () => {
  it('shows a loading status, then the user', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(leanne))
    render(<UserProfile userId={1} />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading user…')
    expect(await screen.findByRole('heading', { name: 'Leanne Graham' })).toBeInTheDocument()
    expect(screen.getByText('Sincere@april.biz')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    expect(fetch).toHaveBeenCalledWith(
      url(1),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('shows an error for HTTP errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, 404))
    render(<UserProfile userId={999} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load user (HTTP 404)')
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('shows an error for network failures', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
    render(<UserProfile userId={1} />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to fetch')
  })

  it('goes back to loading and fetches again when userId changes', async () => {
    const calls = mockControlledFetch({ rejectOnAbort: true })
    const { rerender } = render(<UserProfile userId={1} />)
    await respond(calls[0], leanne)
    expect(screen.getByRole('heading', { name: 'Leanne Graham' })).toBeInTheDocument()

    rerender(<UserProfile userId={2} />)
    expect(screen.getByRole('status')).toHaveTextContent('Loading user…')
    expect(calls[1].url).toBe(url(2))
    await respond(calls[1], ervin)
    expect(screen.getByRole('heading', { name: 'Ervin Howell' })).toBeInTheDocument()
  })

  it('aborts the previous request when userId changes (no error shown)', async () => {
    const calls = mockControlledFetch({ rejectOnAbort: true })
    const { rerender } = render(<UserProfile userId={1} />)
    rerender(<UserProfile userId={2} />)

    expect(calls[0].signal?.aborted).toBe(true)
    expect(calls[1].signal?.aborted).toBe(false)

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })
    // The AbortError of request #1 is expected and must not be displayed.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await respond(calls[1], ervin)
    expect(screen.getByRole('heading', { name: 'Ervin Howell' })).toBeInTheDocument()
  })

  it('ignores a stale response that arrives after a newer one (race condition)', async () => {
    const calls = mockControlledFetch({ rejectOnAbort: false })
    const { rerender } = render(<UserProfile userId={1} />)
    rerender(<UserProfile userId={2} />)

    // The newer request resolves first…
    await respond(calls[1], ervin)
    expect(screen.getByRole('heading', { name: 'Ervin Howell' })).toBeInTheDocument()

    // …then the old, slow one comes back. It must be ignored.
    await respond(calls[0], leanne)
    expect(screen.getByRole('heading', { name: 'Ervin Howell' })).toBeInTheDocument()
    expect(screen.queryByText('Leanne Graham')).not.toBeInTheDocument()
  })

  it('aborts the request on unmount', () => {
    const calls = mockControlledFetch({ rejectOnAbort: true })
    const { unmount } = render(<UserProfile userId={1} />)
    unmount()
    expect(calls[0].signal?.aborted).toBe(true)
  })

  it('survives StrictMode double-invoking the effect', async () => {
    const calls = mockControlledFetch({ rejectOnAbort: true })
    render(
      <StrictMode>
        <UserProfile userId={1} />
      </StrictMode>,
    )
    // Dev-only: setup → cleanup → setup. The first request is cancelled by the cleanup.
    expect(calls).toHaveLength(2)
    expect(calls[0].signal?.aborted).toBe(true)

    await respond(calls[1], leanne)
    expect(screen.getByRole('heading', { name: 'Leanne Graham' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
