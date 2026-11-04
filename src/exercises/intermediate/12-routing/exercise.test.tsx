import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { routes } from './Exercise'

// Render the real route tree at a given URL — no browser history involved.
function renderAt(url: string) {
  const router = createMemoryRouter(routes, { initialEntries: [url] })
  render(<RouterProvider router={router} />)
  return router
}

describe('12 – routing', () => {
  it('renders the home page inside the layout', async () => {
    renderAt('/')
    expect(await screen.findByRole('heading', { name: 'Welcome' })).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Users' })).not.toHaveAttribute('aria-current')
  })

  it('loads and lists users on /users', async () => {
    renderAt('/users')
    expect(await screen.findByRole('link', { name: 'Ada Lovelace' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Grace Hopper' })).toBeInTheDocument()
    expect(screen.getByText('Select a user.')).toBeInTheDocument()

    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Users' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })

  it('renders a user from the :userId param, nested under the list', async () => {
    renderAt('/users/2')
    expect(await screen.findByRole('heading', { name: 'Grace Hopper', level: 3 })).toBeInTheDocument()
    expect(screen.getByText('grace@example.com')).toBeInTheDocument()
    // The parent route (the list) is still rendered around the <Outlet />.
    expect(screen.getByRole('link', { name: 'Ada Lovelace' })).toBeInTheDocument()
  })

  it('navigates between nested routes with links', async () => {
    const user = userEvent.setup()
    const router = renderAt('/')
    await user.click(await screen.findByRole('link', { name: 'Users' }))
    await user.click(await screen.findByRole('link', { name: 'Alan Turing' }))

    expect(await screen.findByRole('heading', { name: 'Alan Turing', level: 3 })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/users/3')
  })

  it('shows the 404 page for unknown URLs', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderAt('/does-not-exist')
    expect(await screen.findByRole('heading', { name: '404 – Not found' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back home' })).toHaveAttribute('href', '/')
    vi.restoreAllMocks()
  })

  it('shows the 404 page when the loader cannot find the user', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    renderAt('/users/999')
    expect(await screen.findByRole('heading', { name: '404 – Not found' })).toBeInTheDocument()
    vi.restoreAllMocks()
  })
})
