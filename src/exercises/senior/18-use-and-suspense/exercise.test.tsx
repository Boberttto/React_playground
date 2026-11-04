import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getPosts, getUser, ProfilePage, ThemeContext, ThemedNote } from './Exercise'

type User = { id: number; name: string; bio: string }
type Post = { id: number; title: string }

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const ada: User = { id: 1, name: 'Ada Lovelace', bio: 'Mathematician' }
const posts: Post[] = [{ id: 1, title: 'Notes on the Analytical Engine' }]

// Rendering something that suspends must happen inside an *awaited* act,
// so React can retry the render when the promise settles.
async function renderProfile(userPromise: Promise<User>, postsPromise: Promise<Post[]>, onRetry?: () => void) {
  await act(async () => {
    render(<ProfilePage userPromise={userPromise} postsPromise={postsPromise} onRetry={onRetry} />)
  })
}

describe('18 – promise cache', () => {
  it('returns the same promise for the same id (required by use())', () => {
    vi.spyOn(console, 'info').mockImplementation(() => {})
    expect(getUser(1)).toBe(getUser(1))
    expect(getPosts(1)).toBe(getPosts(1))
    expect(getUser(1)).not.toBe(getUser(2))
  })
})

describe('18 – ProfilePage (use + nested Suspense)', () => {
  it('shows the profile fallback, then the header with a posts fallback, then the posts', async () => {
    const user = deferred<User>()
    const list = deferred<Post[]>()
    await renderProfile(user.promise, list.promise)
    expect(screen.getByText(/loading profile/i)).toBeInTheDocument()

    await act(async () => user.resolve(ada))
    expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument()
    expect(screen.getByText(/loading posts/i)).toBeInTheDocument()

    await act(async () => list.resolve(posts))
    expect(screen.getByRole('list', { name: 'Posts' })).toHaveTextContent('Notes on the Analytical Engine')
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  it('never reveals posts before the header (outer boundary controls the reveal order)', async () => {
    const user = deferred<User>()
    const list = deferred<Post[]>()
    await renderProfile(user.promise, list.promise)

    await act(async () => list.resolve(posts)) // posts arrive FIRST
    expect(screen.getByText(/loading profile/i)).toBeInTheDocument()
    expect(screen.queryByText('Notes on the Analytical Engine')).not.toBeInTheDocument()

    await act(async () => user.resolve(ada))
    expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument()
    expect(screen.getByText('Notes on the Analytical Engine')).toBeInTheDocument()
  })

  it('shows an error alert with a retry button when the promise rejects', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {}) // React logs caught errors
    const onRetry = vi.fn()
    const u = userEvent.setup()
    const user = deferred<User>()
    await renderProfile(user.promise, deferred<Post[]>().promise, onRetry)

    await act(async () => user.reject(new Error('User 404 not found')))
    expect(screen.getByRole('alert')).toHaveTextContent('User 404 not found')

    await u.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})

describe('18 – ThemedNote (conditional use(Context))', () => {
  it('reads the context only when shown', () => {
    const { rerender } = render(
      <ThemeContext value="dark">
        <ThemedNote show />
      </ThemeContext>,
    )
    expect(screen.getByText('Theme: dark')).toBeInTheDocument()

    rerender(
      <ThemeContext value="dark">
        <ThemedNote show={false} />
      </ThemeContext>,
    )
    expect(screen.queryByText(/theme:/i)).not.toBeInTheDocument()
  })
})
