import { Profiler } from 'react'
import { render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExerciseDemo, {
  AuthProvider,
  LogoutButton,
  ThemeProvider,
  ThemeToggleButton,
  UserMenu,
  useAuth,
  useAuthActions,
  useTheme,
} from './Exercise'

function ThemeName() {
  return <p>theme: {useTheme().theme}</p>
}

describe('10 – ThemeContext', () => {
  it('useTheme throws a helpful error outside <ThemeProvider>', () => {
    // React logs the thrown error; keep the test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useTheme())).toThrow(/ThemeProvider/)
    vi.restoreAllMocks()
  })

  it('toggles between light and dark', async () => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <ThemeName />
        <ThemeToggleButton />
      </ThemeProvider>,
    )
    expect(screen.getByText('theme: light')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }))
    expect(screen.getByText('theme: dark')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }))
    expect(screen.getByText('theme: light')).toBeInTheDocument()
  })

  it('accepts an initialTheme', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <ThemeName />
      </ThemeProvider>,
    )
    expect(screen.getByText('theme: dark')).toBeInTheDocument()
  })
})

describe('10 – Auth contexts', () => {
  it('useAuth and useAuthActions throw outside <AuthProvider>', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/)
    expect(() => renderHook(() => useAuthActions())).toThrow(/AuthProvider/)
    vi.restoreAllMocks()
  })

  it('logs in and out through the UserMenu', async () => {
    const user = userEvent.setup()
    render(
      <AuthProvider>
        <UserMenu />
      </AuthProvider>,
    )
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Ada')
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(screen.getByText(/signed in as/i)).toHaveTextContent('Signed in as Ada')

    await user.click(screen.getByRole('button', { name: 'Log out' }))
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument()
  })

  it('components that only read actions do not re-render when the user changes', async () => {
    const user = userEvent.setup()
    const onRender = vi.fn()
    render(
      <AuthProvider>
        <Profiler id="logout" onRender={onRender}>
          <LogoutButton />
        </Profiler>
        <UserMenu />
      </AuthProvider>,
    )
    expect(onRender).toHaveBeenCalledTimes(1) // initial mount

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Grace')
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(screen.getByText(/signed in as/i)).toHaveTextContent('Signed in as Grace')

    // The user changed, but the standalone LogoutButton only reads the (stable) actions.
    expect(onRender).toHaveBeenCalledTimes(1)
  })
})

describe('10 – demo', () => {
  it('wires theme and auth together', async () => {
    const user = userEvent.setup()
    render(<ExerciseDemo />)
    expect(screen.getByText('Current theme: light')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }))
    expect(screen.getByText('Current theme: dark')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Linus')
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(screen.getByText(/signed in as/i)).toHaveTextContent('Signed in as Linus')
  })
})
