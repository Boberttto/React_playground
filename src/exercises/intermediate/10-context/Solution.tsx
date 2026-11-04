// Tests import the hooks from this file, so it exports non-components on purpose.
// oxlint-disable react/only-export-components
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import styles from './styles.module.scss'

export type Theme = 'light' | 'dark'
type ThemeContextValue = { theme: Theme; toggleTheme: () => void }

// `null` default = "no provider above me". A fake default object would hide that bug:
// the component would render with a toggle that silently does nothing.
const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({
  children,
  initialTheme = 'light',
}: {
  children: ReactNode
  initialTheme?: Theme
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  // Without memoization, a new object is created on every render of ThemeProvider, and
  // every consumer re-renders even if `theme` didn't change. The React Compiler (enabled in
  // this project) would insert this memoization for you; it's written out so you can see it
  // and because code outside the compiler still needs it.
  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    }),
    [theme],
  )

  // React 19: render the context itself as the provider.
  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (ctx === null) {
    throw new Error('useTheme must be used inside <ThemeProvider>')
  }
  // Narrowed: callers get ThemeContextValue, never `| null`.
  return ctx
}

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme()
  const next = theme === 'light' ? 'dark' : 'light'
  return (
    <button className="btn" onClick={toggleTheme}>
      Switch to {next} theme
    </button>
  )
}

// ---------------------------------------------------------------------------

export type User = { name: string }
type AuthActions = { login: (name: string) => void; logout: () => void }

// Two contexts: data that changes vs. functions that never do.
const AuthStateContext = createContext<{ user: User | null } | null>(null)
const AuthActionsContext = createContext<AuthActions | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // `setUser` is stable, so this object can be created once and reused forever.
  // Consumers of AuthActionsContext therefore never re-render because of a login/logout.
  const actions = useMemo<AuthActions>(
    () => ({
      login: (name) => setUser({ name }),
      logout: () => setUser(null),
    }),
    [],
  )
  // Wrapped in an object so a `null` user is distinguishable from "no provider".
  const state = useMemo(() => ({ user }), [user])

  return (
    <AuthActionsContext value={actions}>
      <AuthStateContext value={state}>{children}</AuthStateContext>
    </AuthActionsContext>
  )
}

export function useAuth(): User | null {
  const ctx = useContext(AuthStateContext)
  if (ctx === null) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx.user
}

export function useAuthActions(): AuthActions {
  const ctx = useContext(AuthActionsContext)
  if (ctx === null) throw new Error('useAuthActions must be used inside <AuthProvider>')
  return ctx
}

// Reads only the actions → doesn't re-render when the user changes.
export function LogoutButton() {
  const { logout } = useAuthActions()
  return (
    <button className="btn" onClick={logout}>
      Log out
    </button>
  )
}

function LoginForm() {
  const { login } = useAuthActions()
  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault()
        const name = String(new FormData(e.currentTarget).get('name') ?? '').trim()
        if (name) login(name)
      }}
    >
      <label className={styles.field}>
        Name
        <input className="input" name="name" autoComplete="username" required />
      </label>
      <button className="btn-primary" type="submit">
        Log in
      </button>
    </form>
  )
}

export function UserMenu() {
  const user = useAuth()
  if (!user) return <LoginForm />
  return (
    <div className={styles.row}>
      <p>
        Signed in as <strong>{user.name}</strong>
      </p>
      <LogoutButton />
    </div>
  )
}

// ---------------------------------------------------------------------------

// Composition: Panel receives ready-made JSX as children, so the theme and the user
// never have to travel *through* it. This alone removes most prop drilling.
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.panel}>
      <h3 className={styles.panelTitle}>{title}</h3>
      {children}
    </section>
  )
}

function ThemedShell({ children }: { children: ReactNode }) {
  const { theme } = useTheme()
  return (
    <div className={`${styles.shell} ${theme === 'dark' ? styles.dark : ''}`}>
      <p className={styles.muted}>Current theme: {theme}</p>
      {children}
    </div>
  )
}

export default function SolutionDemo() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedShell>
          <Panel title="Appearance">
            <ThemeToggleButton />
          </Panel>
          <Panel title="Account">
            <UserMenu />
          </Panel>
        </ThemedShell>
      </AuthProvider>
    </ThemeProvider>
  )
}
